---
title: Resetting a User's Password
nav_order: 6
---

<p class="docs-lead">If a user is locked out of their account and no longer has their recovery codes, you can reset their password from the admin panel. Be aware that this operation permanently destroys access to all of the user's existing direct messages.</p>

## When to use this

Use admin password reset **only** when both of the following are true:

- The user cannot log in and has lost their password.
- The user no longer has their recovery codes.

If the user still has their recovery codes, they should use the **Forgot password** flow on the login page instead. That path re-encrypts the existing private key under the new password, so DM history is preserved. Admin reset replaces the keys entirely and cannot be undone.

## What happens to direct messages

Cuento's direct messages are end-to-end encrypted. Each user holds a private key that decrypts their messages. When you trigger an admin reset, that key is permanently deactivated alongside all recovery-code-linked copies of it.

The messages themselves stay in the database, but they are encrypted with a key that no longer exists anywhere. Neither the user nor you nor the developers can recover them. When the user completes the reset flow they receive a brand-new key pair — it cannot read messages encrypted for the old one.

**This loss is permanent and irreversible.** Make sure the user understands this before you proceed.

## How to reset the password

1. Open the **Admin panel** and go to **Users**.
2. Find the user and open their profile.
3. Click **Reset password**.
4. The system generates a one-time 6-digit PIN and shows it to you once. **Copy the PIN now** — it will not be shown again.
5. Send the PIN to the user through any out-of-band channel (private message on another platform, email, etc.).

## What the user does next

When the user next tries to log in with their username:

1. The login form detects that a reset is pending and prompts them to enter the PIN you sent.
2. After entering the correct PIN, they choose a new password.
3. The system generates a new key pair and shows them a new set of recovery codes.
4. The user must save the new recovery codes before they can proceed. Remind them to store these somewhere safe — they are the only way to recover access or wipe data in the future.
5. After acknowledging the codes, the user is logged in automatically.

## If the PIN is lost

The PIN is shown to you once. If you close the modal before copying it, there is no way to retrieve it — you would need to trigger the reset again, which generates a new PIN and invalidates the old one.
