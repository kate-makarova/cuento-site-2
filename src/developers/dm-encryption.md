---
title: Direct Message Encryption
nav_order: 4
---

<p class="docs-lead">Direct messages in Cuento are end-to-end encrypted in the browser. The server stores only ciphertext — it never sees plaintext message content, and the private key required to decrypt messages never leaves the user's device.</p>

## Key architecture

Each user has an RSA-4096 key pair generated entirely in the browser using the Web Crypto API. The public key is stored on the server. The private key is stored on the server **encrypted under the user's password** — the server holds the ciphertext of the private key but not the password used to encrypt it.

When a user logs in, the browser:
1. Fetches the encrypted private key blob (`private_key`, `salt`, `iv`) via `GET /user/private-key`.
2. Derives an AES-GCM key from the user's password using PBKDF2.
3. Decrypts the private key blob in-browser.
4. Keeps the resulting `CryptoKey` in memory in `UserService.privateKey()` — it is never written to localStorage or sent to the server.

## Per-message encryption (send path)

Each message gets a fresh AES-GCM-256 key. The sequence in `DirectChatService.buildMessagePayload`:

1. Generate a random AES-GCM-256 key and a 12-byte IV.
2. Encrypt the message payload (a JSON string `{ "text": "<BBCode>", "html": "<compiled HTML>" }`) with AES-GCM.
3. Export the raw AES key bytes and wrap them separately with the **author's RSA public key** (`key_author`) and the **receiver's RSA public key** (`key_receiver`), using RSA-OAEP/SHA-256.
4. POST `{ chat_id, ciphertext, iv, key_author, key_receiver, author_key_id, receiver_key_id }` to `direct-chat/message/create`.

The server stores all of these fields verbatim — it cannot read `ciphertext` without the AES key, and it cannot recover the AES key without one of the RSA private keys.

## Per-message decryption (receive path)

The API returns each message with a `key` field — which of `key_author` or `key_receiver` belongs to the current user is resolved on the backend. `DirectChatService.decryptMessage`:

1. Use the in-memory RSA private key to unwrap `key` (RSA-OAEP) → raw AES key bytes.
2. Import the AES key and decrypt `ciphertext` with the stored `iv`.
3. JSON-parse the plaintext → `{ text, html }`. Legacy messages (pre-2026-10-22) stored raw BBCode instead of JSON; `decryptMessage` falls back to calling `parseBBCode` on the raw string if `JSON.parse` throws.

## Key versioning

Each message row stores `author_key_id` and `receiver_key_id` (FK → `public_keys.id`). The `public_keys` table has an `is_active` column; each user has exactly one active key at a time.

When loading messages, `decryptMessage` compares the message's key ID against `UserService.publicKeyId()` (the ID of the user's currently active public key). If the IDs differ, the message was encrypted for a previous key pair and returns `{ inaccessible: true }`. The UI renders an "encrypted with a previous key" notice instead of message content.

## Recovery codes

Because the private key is encrypted under the user's password, the user can reset their password from the login page — provided they have a **recovery code**. The browser stores one encrypted copy of the private key per recovery code, each wrapped under a separate AES key derived from that code. Using a recovery code re-encrypts the private key under the new password without replacing the RSA key pair. All existing messages remain decryptable.

Each recovery code can be used exactly once; `date_used` is set on the `recovery_codes` row after use. Users can regenerate new codes from account settings at any time while still logged in.

## Why changing the RSA key pair destroys old messages

Changing the **password** only re-encrypts the private key wrapper — the RSA key pair itself stays the same, so messages encrypted to the old public key are still decryptable with the same private key. This is the normal password-change and recovery-code path.

Changing the **RSA key pair** is a different operation. It happens in two situations:

- **Admin password reset** (`POST /admin/users/:id/reset-password`): The admin reset deactivates all existing public and private key rows (`is_active = false`) and inserts a fresh reset record. When the user completes the reset flow, the browser generates a brand-new RSA key pair and stores the new public key. All prior messages were encrypted to the old public key — the matching private key is deactivated and gone. `decryptMessage` returns `inaccessible: true` for every one of them.
- **Account wipe** (`POST /user/wipe`): Deletes the user's DMs outright along with the private key rows.

The messages themselves are not deleted by an admin reset — they remain in the database — but they are permanently unreadable because there is no longer any copy of the RSA private key that can unwrap their `key_author` / `key_receiver` fields.

## Database tables

| Table | Purpose |
|---|---|
| `public_keys` | RSA public keys; `is_active` marks the current key per user |
| `private_keys` | RSA private key blobs, AES-encrypted; `is_active = true` for the password-encrypted copy; `is_active = false` for recovery-code copies (linked via `recovery_code_id`) |
| `recovery_codes` | Hashed recovery codes; `date_used` set on consumption; `security_code` used as a one-time token during the password-reset flow |
| `direct_chat_messages` | Per-message: `ciphertext`, `iv`, `key_author`, `key_receiver`, `author_key_id`, `receiver_key_id` |

## Key files

| File | Role |
|---|---|
| `cuento-frontend/src/app/services/direct-chat.service.ts` | `buildMessagePayload`, `decryptMessage`, `wrapAesKey` |
| `cuento-frontend/src/app/services/user.service.ts` | Private key load, `publicKeyId` signal |
| `cuento-backend/src/Controllers/user_recovery.go` | `SaveKeys`, `AdminResetPassword`, `CompletePasswordReset`, `Recovery`, `UpdatePassword` |
| `cuento-backend/src/Controllers/direct_chat.go` | Message create/fetch endpoints |
