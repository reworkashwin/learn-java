# Setting Up A SQLite Database

## Introduction

To display real meals data, we need an actual data source. In this lecture, we set up a **SQLite database** — a lightweight, file-based SQL database that requires zero server configuration. It's perfect for local development and prototyping.

---

## Why SQLite?

SQLite is an embedded database that stores everything in a single file. Unlike MySQL or PostgreSQL, you don't need to install a database server. Just install a package and you're ready to go. It's ideal for:

- Local development
- Prototyping full-stack features
- Small to medium production apps
- Learning database concepts without infrastructure overhead

---

## Installing the Package

Stop the development server and install the `better-sqlite3` package:

```bash
npm install better-sqlite3
```

This is a fast, synchronous SQLite3 wrapper for Node.js. It's well-suited for Next.js server-side code because it's simple and doesn't require async/await for basic operations.

---

## Initializing the Database

Create an `initdb.js` file in the root project directory. This script:

1. **Creates or connects to** a `meals.db` file
2. **Creates a `meals` table** if it doesn't exist, with columns for:
   - `id` (auto-generated)
   - `slug` (unique identifier)
   - `title`, `image`, `summary`, `instructions`
   - `creator`, `creator_email`
3. **Inserts dummy meal data** so you have something to display

```javascript
const sql = require('better-sqlite3');
const db = sql('meals.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    summary TEXT NOT NULL,
    instructions TEXT NOT NULL,
    creator TEXT NOT NULL,
    creator_email TEXT NOT NULL
  )
`).run();

// Insert dummy meals...
```

### Running the Script

```bash
node initdb.js
```

After running this, you'll see a `meals.db` file in your project root. That's your database.

---

## How It Fits Together

The flow is straightforward:

1. **Database file** (`meals.db`) stores the meal records
2. **Image files** are stored in the `public/` folder
3. The database stores the **path** to each image, not the image itself
4. When rendering, the `<Image>` component uses that path to display images from `public/`

---

## ✅ Key Takeaways

- SQLite is a file-based database — no server setup required
- The `better-sqlite3` package provides a synchronous API for SQLite in Node.js
- Use an initialization script to create tables and seed dummy data
- Images are stored in `public/`, and only their paths are saved in the database

## 💡 Pro Tip

SQLite databases are just files. You can inspect them with tools like DB Browser for SQLite, or delete and recreate them easily during development by re-running your init script.
