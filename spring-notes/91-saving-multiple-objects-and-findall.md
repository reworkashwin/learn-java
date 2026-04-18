# Saving Multiple Objects and Fetching Data with findAll

## Introduction

In the previous video, we saved a single student object into the database using Spring Data JPA. That was great — but a database with one record isn't very useful, is it?

In this section, we'll take it further:
- Save **multiple objects** into the database
- Observe what Hibernate does differently on the second run (hint: no more `CREATE TABLE`)
- Use the built-in **`findAll()`** method to fetch all records back from the database

This is where Spring Data JPA really starts to shine — you'll see how little code is needed to do powerful things.

---

## Concept 1: Saving Multiple Objects

### 🧠 What is it?

We already know `repo.save(entity)` inserts a single object into the database. To save more objects, we simply call `save()` again for each one.

### ⚙️ How it works

Let's say we have three student objects — `s1`, `s2`, and `s3`. We already saved `s1` in the previous video. Now let's save the other two:

```java
repo.save(s2);
repo.save(s3);
```

That's it. Each call to `save()` generates an `INSERT` SQL statement behind the scenes.

### 🧪 What happens when you relaunch?

Here's the interesting part. When we ran the application the first time, Hibernate generated a `CREATE TABLE` statement. But this time?

**No `CREATE TABLE`.** The table already exists.

Instead, you'll see something like this in the console:

```
Hibernate: insert into student (marks, name, roll_no) values (?, ?, ?)
Hibernate: insert into student (marks, name, roll_no) values (?, ?, ?)
```

Two `INSERT` statements — one for each new object. Hibernate is smart enough to know the table is already there (because we set `ddl-auto=update`), so it skips creation and goes straight to inserting data.

### 🧪 Verifying in pgAdmin

Head over to pgAdmin, right-click your `student` table, and select **View All Rows**. You'll see all three records sitting there — row numbers, marks, names — everything persisted neatly.

### 💡 Insight

The `update` strategy in `ddl-auto` is key here. It means:
- **First run**: Create the table if it doesn't exist
- **Subsequent runs**: Leave the table alone, just work with it

This is why you don't see `CREATE TABLE` on the second launch. Hibernate checks the schema, sees the table is already there, and moves on.

---

## Concept 2: Fetching All Data with findAll()

### 🧠 What is it?

We've been saving data. But what about **reading** it back? How do you fetch all the records from the database?

`JpaRepository` comes with a built-in method called **`findAll()`**. It does exactly what the name says — finds all records in the table and returns them as a `List`.

### ❓ Why is this powerful?

Think about what you'd normally have to do:
1. Write a SQL query: `SELECT * FROM student`
2. Execute it using JDBC or JdbcTemplate
3. Map each row to a Java object manually (or with a `RowMapper`)

With Spring Data JPA? One line:

```java
System.out.println(repo.findAll());
```

No SQL. No mapping. No boilerplate. Done.

### ⚙️ How it works

When you call `repo.findAll()`:

1. Hibernate generates the `SELECT` query automatically
2. Executes it against the database
3. Maps every row to a `Student` object
4. Returns a `List<Student>`

Behind the scenes, you'll see this in the console:

```
Hibernate: select s1_0.roll_no, s1_0.marks, s1_0.name from student s1_0
```

And the output:

```
[Student{rollNo=1, name='Navin', marks=85}, Student{rollNo=2, name='Kiran', marks=92}, Student{rollNo=3, name='Harsh', marks=78}]
```

All three objects — fetched from the database and printed as a list. Each row became a Java object automatically.

### 💡 Insight

`findAll()` is one of many methods you get **for free** by extending `JpaRepository`. You didn't define it. You didn't write any SQL. It's just... there. That's the magic of Spring Data JPA — common database operations are pre-built into the repository interface.

---

## Concept 3: What findAll() Returns

### 🧠 Understanding the return type

`findAll()` returns a `List<Student>` — a standard Java list containing all the entity objects from the table.

You can use it however you want:

```java
// Print everything
System.out.println(repo.findAll());

// Store in a variable
List<Student> students = repo.findAll();

// Loop through
for (Student s : repo.findAll()) {
    System.out.println(s.getName() + " scored " + s.getMarks());
}
```

### ⚠️ Important

For `System.out.println()` to display meaningful output, your `Student` entity class needs a proper `toString()` method. If you're using **Lombok's `@Data`** or `@ToString`, this is handled automatically. Otherwise, you'll just see object references like `Student@3a4b5c`.

---

## Concept 4: What's Next — Fetching Specific Records

### ❓ The question

`findAll()` gives you everything. But what if you want:
- Just **one** student?
- Students with marks above 80?
- A student by their **name**?

How do you fetch based on a **specific parameter** — like roll number, name, or marks?

Spring Data JPA has elegant solutions for this too — and we'll explore them in the next video.

---

## ✅ Key Takeaways

- Calling `save()` multiple times inserts multiple records — each call generates a separate `INSERT` statement
- On subsequent runs with `ddl-auto=update`, Hibernate **skips table creation** and only runs `INSERT` / `SELECT` statements
- `findAll()` is a built-in method from `JpaRepository` — it fetches all rows and returns them as a `List` of entity objects
- No SQL, no `RowMapper`, no boilerplate — Spring Data JPA handles it all
- Always verify your data in **pgAdmin** to confirm records are actually persisted

## ⚠️ Common Mistakes

- Running `save()` with the same primary key values again will cause a **duplicate key error** — clear the table or use new IDs
- Forgetting `toString()` in the entity class makes `findAll()` output unreadable — use Lombok's `@Data` annotation to auto-generate it

## 💡 Pro Tips

- Instead of calling `save()` multiple times, you can use `saveAll(List.of(s1, s2, s3))` to batch-insert all objects in one call — cleaner and potentially more efficient
- Keep `spring.jpa.show-sql=true` during development to see exactly what queries Hibernate generates — it's the best way to understand what's happening behind the scenes
