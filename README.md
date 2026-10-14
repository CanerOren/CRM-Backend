# CRM App — Backend

A REST API backend for a CRM (Customer Relationship Management) system, built with
Express 5 and Prisma over MySQL. It manages customers, meetings, and customer
requests, with role-based access control, JWT authentication, Excel/PDF export, a
Telegram notification bot, and a scheduled daily report.

> The API responses and code comments are in Turkish.

## Tech Stack

- **Runtime:** Node.js (see `.nvmrc` — 23.11.0)
- **Framework:** Express 5
- **ORM / Database:** Prisma 6 + MySQL
- **Auth:** JSON Web Tokens (`jsonwebtoken`) + `bcrypt` password hashing
- **Exports:** `exceljs` (Excel), `puppeteer` + `ejs` (PDF)
- **Notifications:** `node-telegram-bot-api`, scheduled with `node-cron`
- **Logging:** `winston` + `winston-daily-rotate-file`

## Getting Started

### Prerequisites

- Node.js 23.11.0 (`nvm use` will pick it up from `.nvmrc`)
- A MySQL database

### Installation

```bash
git clone https://github.com/CanerOren/Backend.git
cd Backend
npm install
```

### Environment variables

Create a `.env` file in the project root (it is git-ignored):

```env
DATABASE_URL="mysql://user:password@host:3306/database"
JWT_KEY="your-jwt-secret"
TELEGRAM_BOT_API="your-telegram-bot-token"
PORT=3000
```

### Database

The schema is database-first. Generate the Prisma client (and optionally sync the
schema from an existing database):

```bash
npx prisma generate     # generate the Prisma client
npx prisma db pull      # pull schema from an existing DB (optional)
```

### Running

```bash
npm run dev    # development with auto-reload (nodemon)
npm start      # production
```

The server listens on `PORT` (default `3000`) and starts the daily report cron job
on boot.

## Project Structure

```
app/
├── routes/         # Express routers, grouped by domain; all wired in routes.js
│   ├── auth/       # login / token refresh
│   ├── core/       # users
│   ├── data/       # business entities (customers, meetings, customer_requests, ...)
│   └── defines/    # lookup tables (cities, districts, types, statuses, ...)
├── controllers/    # request/response handlers (same grouping as routes)
├── models/         # Prisma data-access layer (same grouping)
├── core/           # shared helper functions for controllers and models
├── middlewares/    # auth guards and logging
├── telegramBot/    # Telegram notifier bot
├── cron/           # scheduled jobs
└── views/          # EJS template used for PDF export
prisma/
└── schema.prisma   # database schema
app.js              # entry point
```

## Architecture

Each resource follows a consistent **route → controller → model** triad, so once you
understand one resource (`customers` is the canonical example) you understand them
all.

- **Routes** map URL paths to controller functions and attach auth middleware.
- **Controllers** handle HTTP, shape responses, and call the model.
- **Models** wrap a single Prisma model and expose `getData`, `getDataList`,
  `saveData`, and `deleteData`.

Notable conventions:

- **Soft deletes:** records are never hard-deleted — `deleted_at` is set, and all
  reads filter out soft-deleted rows.
- **Upsert by id:** `saveData` updates when an `id` is present, otherwise creates.
- **Audit fields:** `id_created_by` / `id_updated_by` are stamped from the
  authenticated user.
- **Column whitelisting:** each model declares an allowed-columns list; only those
  fields are persisted on writes.

## Authentication & Authorization

- **Login** (`POST /auth`) verifies the password with bcrypt and returns an access
  token (JWT, 1h), a refresh token, and a download token, along with a permissions
  (`ability`) list derived from the user's user type.
- **`authorize` middleware** protects standard endpoints via a `Bearer` token in the
  `Authorization` header.
- **`downloadAuth` middleware** protects file-download endpoints via a `?token=`
  query parameter (used for Excel/PDF exports).

Most data endpoints are `POST` and follow the pattern `/` (list), `/getRow`,
`/createData`, `/removeData`.

## Integrations

- **Telegram bot** — responds to `/gorusmeler <name>` and pushes open customer
  requests.
- **Daily report** — a `node-cron` job sends all open customer requests every day at
  09:00.
- **Excel / PDF export** — `exceljs` builds spreadsheets; `puppeteer` renders the EJS
  template to PDF.

## Available Scripts

| Command       | Description                    |
| ------------- | ------------------------------ |
| `npm run dev` | Run with nodemon (auto-reload) |
| `npm start`   | Run with node                  |

Formatting is handled by Prettier (`.prettierrc`): `npx prettier --write .`
 
