# Saving H2 Data to Disk — No More Losing Data

## Introduction

So far, we've been using H2 in **in-memory mode** — fast and convenient, but with one major drawback: every time you restart the application, **all your data is lost**. Your tables are recreated, your manually inserted or updated records vanish.

Imagine you've spent an hour setting up demo data, tweaking records, getting everything perfect for a demo the next morning. You restart the app... and it's all gone.

In this lecture, we fix that problem by switching H2 from **memory-based** to **file-based** storage. The database persists to disk, and your data survives restarts — just like a real production database.

---

## The Fix — One Property Change

The solution is surprisingly simple. You just change one value in the `spring.datasource.url`:

### Before (in-memory):
```properties
spring.datasource.url=jdbc:h2:mem:testdatabase
```

### After (file-based):
```properties
spring.datasource.url=jdbc:h2:file:~/jobportal;AUTO_SERVER=true
```

Let's break down what changed:

| Part | In-Memory | File-Based |
|------|-----------|------------|
| Protocol | `jdbc:h2:mem:` | `jdbc:h2:file:` |
| Location | `testdatabase` (lives in RAM) | `~/jobportal` (file path on disk) |
| Multi-connection | N/A | `AUTO_SERVER=true` |

### 🧠 Understanding Each Part

- **`jdbc:h2:file:`** — tells H2 to store data in a file instead of memory
- **`~/jobportal`** — the `~` refers to your home directory; `jobportal` is the file name (H2 creates files like `jobportal.mv.db`)
- **`AUTO_SERVER=true`** — allows **multiple connections** to the database simultaneously. Without this, only one connection is allowed at a time

### For Windows Users

```properties
spring.datasource.url=jdbc:h2:file:C:/Users/yourname/jobportal;AUTO_SERVER=true
```

If single forward slashes don't work, try double forward slashes: `C://Users//yourname//jobportal`.

---

## What Happens After the Switch

When you restart the application for the first time with the file-based URL:

1. H2 creates **two files** in your home directory:
   - `jobportal.mv.db` — the actual database data
   - `jobportal.trace.db` — trace/debug information
2. As long as these files exist, your data **persists across restarts**

These files act just like a MySQL or Oracle database file — the data is stored on disk, not in volatile memory.

---

## Fixing the Initialization Mode

After switching to file-based H2, you might notice something unexpected: the `schema.sql` and `data.sql` scripts **don't execute**.

Why? Because we had this property:

```properties
spring.sql.init.mode=embedded
```

With `embedded` mode, Spring Boot only runs initialization scripts for **in-memory embedded databases**. A file-based H2 is no longer considered "embedded" in this context.

### The Fix

Change the mode to `always`:

```properties
spring.sql.init.mode=always
```

Now the scripts run regardless of the database type.

---

## The Duplicate Data Problem

Here's a new issue you'll face. With file-based storage, the data **persists** across restarts. But `data.sql` also **runs on every restart**. So what happens?

1. **First restart** — table created, 30 records inserted ✅
2. **Second restart** — table already exists (safe, thanks to `IF NOT EXISTS`), but the INSERT statements try to insert records with the **same IDs** again → 💥 **Primary Key Violation!**

```
Unique index or primary key violation: "PRIMARY KEY ON PUBLIC.COMPANIES(ID)"
```

The schema.sql is safe because of `CREATE TABLE IF NOT EXISTS`. But data.sql has no such protection — it blindly tries to re-insert the same rows.

### The Solution

Once your initial data is loaded successfully, **comment out or remove** the `spring.sql.init.mode` property:

```properties
# spring.sql.init.mode=always   ← Comment this out after first successful run
```

By default (when the property is absent or set to `embedded`), Spring Boot won't run the initialization scripts for file-based H2. Your data stays safe, and no duplicate inserts happen.

### The Workflow

1. Set `spring.sql.init.mode=always`
2. Start the application → tables and data are created
3. Verify everything looks good in the H2 console
4. **Comment out** `spring.sql.init.mode`
5. Restart freely — data persists, no errors

---

## Verifying Data Persistence

Let's prove it works:

1. Connect to H2 console → see the `companies` table with 30 records
2. Run an UPDATE statement:
   ```sql
   UPDATE companies SET rating = 5.0 WHERE id = 1;
   ```
3. Verify the change: rating is now `5.0`
4. **Restart the application**
5. Reconnect to H2 console
6. Run the SELECT query → rating is still `5.0` 🎉

The update **survived the restart**. This confirms that file-based H2 behaves like a real persistent database.

---

## Updating the H2 Console URL

Don't forget — when you change the datasource URL, you also need to update the **JDBC URL** in the H2 console login page. If you use the old `jdbc:h2:mem:testdatabase` URL, the connection will fail. Use the new file-based URL:

```
jdbc:h2:file:~/jobportal;AUTO_SERVER=true
```

---

## In-Memory vs. File-Based — When to Use Which

| Feature | In-Memory (`mem`) | File-Based (`file`) |
|---------|-------------------|---------------------|
| Data persistence | Lost on restart | Survives restarts |
| Speed | Slightly faster | Slightly slower (disk I/O) |
| Setup | Zero config | Specify file path |
| Use case | Tests, throwaway demos | Long-running demos, development |
| Production use | No | Still no — use MySQL/Postgres |

---

## What's Next?

We now have a working database with persistent data. The next step is to **read this data from the database via Java code** and send it as a REST API response. For that, we'll dive into **Spring Data JPA** — the powerful framework that lets you interact with databases without writing raw SQL.

---

## ✅ Key Takeaways

- Switch from `jdbc:h2:mem:` to `jdbc:h2:file:` to persist data to disk
- Use `AUTO_SERVER=true` to allow multiple simultaneous connections
- Change `spring.sql.init.mode` to `always` for the first run, then **comment it out** to avoid duplicate data errors
- `schema.sql` is safe to re-run thanks to `IF NOT EXISTS`, but `data.sql` insert statements will cause primary key violations if re-run
- H2 creates database files (`.mv.db`) in the specified location — delete them to start fresh
- File-based H2 is still **not a production database** — migrate to MySQL/Postgres for production

---

## ⚠️ Common Mistakes

- Forgetting to update the H2 console JDBC URL after switching to file-based mode
- Leaving `spring.sql.init.mode=always` permanently — causes duplicate data errors on every restart
- Not deleting old H2 files when switching from in-memory to file-based for the first time — can cause conflicts
- Using the `embedded` init mode with file-based H2 — scripts won't execute

---

## 💡 Pro Tips

- To **start completely fresh** with file-based H2, just delete the `.mv.db` and `.trace.db` files from your home directory
- Think of the workflow as a two-phase process: Phase 1 (init mode = always, create tables + data), Phase 2 (comment out init mode, work normally)
- When you eventually migrate to MySQL, you'll just change the datasource URL, driver, and credentials — your Spring Data JPA code stays **exactly the same**
- Use file-based H2 for demo applications where you need data to survive across sessions — it saves you from re-inserting data every time
