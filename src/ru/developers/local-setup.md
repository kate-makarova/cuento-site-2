---
title: Локальная установка
nav_order: 1
---

<p class="docs-lead">Запустите Cuento на своём компьютере для локальной разработки. Вам понадобятся Docker, Node.js и npm.</p>

## 1. Скачайте репозитории

Бэкенд и фронтенд Cuento находятся в отдельных репозиториях. Склонируйте оба:

```bash
git clone https://github.com/your-org/cuento-backend.git
git clone https://github.com/your-org/cuento-frontend.git
```

## 2. Запустите контейнеры бэкенда

В директории `cuento-backend` запустите все сервисы с помощью Docker Compose:

```bash
cd cuento-backend
docker-compose up --build
```

Это поднимет Go API на порту 8080, MCP-сервер на порту 8081, MariaDB, Sonic и Qdrant. Дождитесь, пока все контейнеры сообщат о готовности.

## 3. Настройте базу данных

После запуска MariaDB импортируйте стандартную схему. Файл находится по адресу `cuento-backend/src/Install/default_tables.sql`:

```bash
docker exec -i cuento-backend-db-1 \
  mysql -u user -ppassword cuento \
  < src/Install/default_tables.sql
```

Это создаст все таблицы с начальной структурой. Нужно сделать только один раз для новой базы данных.

## 4. Установите Node.js и npm

Для фронтенда требуется Node.js 18 или выше. Если у вас его нет, скачайте с [nodejs.org](https://nodejs.org) или используйте менеджер версий `nvm`:

```bash
nvm install 18
nvm use 18
```

## 5. Запустите фронтенд

В директории `cuento-frontend` установите зависимости и запустите сервер разработки:

```bash
cd cuento-frontend
npm install
npm start
```

Сервер разработки Angular запустится по адресу `http://localhost:4200` и автоматически проксирует все API-запросы на `localhost:8080`.
