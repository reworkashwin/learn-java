# Pre-Loading Data into H2 with schema.sql & data.sql Files

## Introduction

We have an H2 database up and running — but it's completely empty. No tables, no data. We could manually write SQL statements in the H2 console, but that's tedious and you'd have to redo it after every restart (since H2 is in-memory).

Spring Boot offers an elegant solution: just place SQL files named `schema.sql` and `data.sql` in the `resources/` folder, and Spring Boot will **automatically execute them during startup**. Tables get created, data gets inserted — all without writing a single line of Java code.

---

## Step 1 — Creating Tables with `schema.sql`

Create a file called `schema.sql` under `src/main/resources/`:

```sql
CREATE TABLE IF NOT EXISTS companies (
    id          INT PRIMARY KEY,
    name        VARCHAR(255),
    logo        VARCHAR(500),
    industry    VARCHAR(100),
    size        VARCHAR(50),
    rating      DECIMAL(2,1),
    locations   VARCHAR(500),
    founded     INT,
    description TEXT,
    employees   INT,
    website     VARCHAR(255),
    created_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_at  TIMESTAMP,
    updated_by  VARCHAR(100)
);
```

### 🧠 Understanding the Columns

| Column | Purpose |
|--------|---------|
| `id` | Unique company identifier (primary key) |
| `name` | Company name |
| `logo` | Path to the logo image |
| `industry` | Technology, Manufacturing, Entertainment, etc. |
| `size` | Small, Medium, Large |
| `rating` | Company rating (e.g., 4.5) |
| `locations` | List of office locations |
| `founded` | Year the company was established |
| `description` | Company description |
| `employees` | Number of employees |
| `website` | Company website URL |
| `created_at/by` | Audit: when and who created the record |
| `updated_at/by` | Audit: when and who last modified the record |

### Why Audit Columns?

The last four columns (`created_at`, `created_by`, `updated_at`, `updated_by`) might seem unnecessary for a demo app. But in enterprise applications, **audit columns are mandatory** for every table. They answer critical questions:
- Who inserted this record?  
- When was it last modified?  
- Who changed it?

We're following that same enterprise standard here.

### Why `IF NOT EXISTS`?

The `CREATE TABLE IF NOT EXISTS` clause ensures the script doesn't fail if the table already exists. This is important because schema.sql runs on every startup.

---

## Step 2 — Inserting Data with `data.sql`

Create another file called `data.sql` under `src/main/resources/`:

```sql
INSERT INTO companies (id, name, logo, industry, size, rating, ...) VALUES (1, 'TechCorp', '/logos/techcorp.png', 'Technology', 'Large', 4.5, ...);
INSERT INTO companies (id, name, logo, industry, size, rating, ...) VALUES (2, 'InnoVate', '/logos/innovate.png', 'Manufacturing', 'Medium', 4.2, ...);
-- ... up to 30 insert statements
```

This file contains all the insert statements that populate the `companies` table with initial data.

---

## How Spring Boot Executes These Files

When Spring Boot starts and detects an **embedded database** (like H2), it automatically looks for:
1. `schema.sql` → executes table creation scripts
2. `data.sql` → executes data insertion scripts

No configuration needed — just place the files with the correct names in `resources/`.

---

## Controlling Initialization with `spring.sql.init.mode`

Spring Boot provides a property to control this automatic initialization:

```properties
spring.sql.init.mode=embedded   # Default — only for embedded DBs (H2, HSQLDB, Derby)
```

| Value | Behavior |
|-------|----------|
| `embedded` | Initialize **only** if using an embedded database (default) |
| `always` | Initialize **regardless** of database type (useful with MySQL/Postgres) |
| `never` | **Never** initialize — even if SQL files exist |

### Demo — Setting to `never`

If you set `spring.sql.init.mode=never` and restart, the SQL files are completely ignored. You'll get an empty H2 database with no tables and no data.

### The In-Memory Catch

Here's something important to understand: since H2 stores data **in memory**, every restart **wipes everything clean**. Even if you manually insert/update data via the console, it's gone after a restart. The database is brand new every time.

This means:
1. Restart → schema.sql runs → table created
2. Restart → data.sql runs → data inserted
3. You update a record manually (e.g., change rating from 4.5 to 5.0)
4. Restart → **update is lost** — schema.sql and data.sql create everything from scratch again

We'll fix this data persistence issue in an upcoming lecture.

---

## Using Custom File Names and Locations

What if you don't want to use the default names `schema.sql` and `data.sql`? Or what if you want to put them in a subfolder?

### Custom Setup Example

```
src/main/resources/
    └── sql/
        ├── jobportal-schema.sql
        └── jobportal-data.sql
```

### Tell Spring Boot Where to Find Them

```properties
spring.sql.init.schema-locations=classpath:sql/jobportal-schema.sql
spring.sql.init.data-locations=classpath:sql/jobportal-data.sql
```

Now Spring Boot will look for your custom file names at your custom locations.

### ⚠️ Be Careful — Missing Files Cause Startup Failures

If you specify a file location but the file doesn't exist at that path, your **application won't start**. You'll get an error like:

```
No schema scripts found at location: classpath:sql/jobportal-schema1.sql
```

### The `optional:` Prefix

If there are scenarios where the file might not always be present, prefix the path with `optional:`:

```properties
spring.sql.init.data-locations=optional:classpath:sql/jobportal-data.sql
```

With `optional:`, the application starts even if the file is missing — it simply skips the initialization.

---

## ✅ Key Takeaways

- Place `schema.sql` (for tables) and `data.sql` (for insert statements) in `resources/` — Spring Boot executes them automatically on startup
- Default behavior only triggers for **embedded databases** (H2, Derby, HSQLDB) via `spring.sql.init.mode=embedded`
- You can use **custom file names and locations** with `spring.sql.init.schema-locations` and `spring.sql.init.data-locations`
- Use `optional:` prefix if files might not always exist
- In-memory H2 **loses all data on restart** — schema and data are recreated from scratch each time
- Use `IF NOT EXISTS` in your CREATE TABLE statements for safety

---

## ⚠️ Common Mistakes

- Misspelling the file names (`shema.sql` instead of `schema.sql`) — Spring Boot won't find them
- Specifying custom locations but forgetting to update the file names — causes startup failures
- Expecting manually-modified data to survive a restart with in-memory H2 — it won't
- Not using `IF NOT EXISTS` in schema.sql — causes errors when the table already exists

---

## 💡 Pro Tips

- You can have **only** `schema.sql` without `data.sql` — the table will be created but left empty
- Use `spring.sql.init.mode=never` when you want to skip initialization entirely (useful after initial setup with file-based H2)
- Audit columns (`created_at`, `created_by`, `updated_at`, `updated_by`) are an enterprise standard — start using them from the beginning
- To check valid values for any property, hover over it in IntelliJ or press **F1** on the property name
