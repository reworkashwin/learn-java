# Update and Delete with Spring Data JPA

## Introduction

We've covered **Create** (save) and **Read** (findAll, findById, findByName). That's the C and R of CRUD. Now let's complete the picture with **Update** and **Delete**.

You might expect dedicated `update()` and `delete()` methods. One of them exists, and the other? It's handled by a method you already know.

---

## Concept 1: Updating a Record with save()

### ❓ Where's the update method?

If you type `repo.` and scroll through all the available methods, you'll notice something surprising — **there is no `update()` method**.

So how do you update a record?

You use **`save()`** — the same method you used to insert data.

### 🧠 How does save() know whether to INSERT or UPDATE?

Hibernate is smart about this. When you call `save()`:

1. It checks the **primary key** (`@Id`) of the object you're passing
2. It fires a `SELECT` query to see if a record with that ID already exists
3. **If it exists** → fires an `UPDATE` query
4. **If it doesn't exist** → fires an `INSERT` query

One method, two behaviors. The primary key is what determines which path it takes.

### 🧪 Example

Let's say Kiran (roll number 102) currently has marks = 80. We want to change it to 65:

```java
Student s2 = new Student(102, "Kiran", 65);  // same ID, new marks
repo.save(s2);
```

What happens behind the scenes:

```sql
-- Step 1: Check if the record exists
Hibernate: select s1_0.roll_no, s1_0.marks, s1_0.name from student s1_0 where s1_0.roll_no=?

-- Step 2: Record found → fire UPDATE
Hibernate: update student set marks=?, name=? where roll_no=?
```

Two queries — first a `SELECT` to check, then an `UPDATE` to modify. Go to pgAdmin, refresh the table, and you'll see Kiran's marks changed from 80 to 65.

### 💡 Insight

This is why `save()` is named "save" and not "insert" — it's a general-purpose **persist** operation. It will insert if the record is new, or update if it already exists. The primary key is the deciding factor.

---

## Concept 2: Deleting a Record

### ⚙️ How it works

Unlike update, delete **does** have its own dedicated method:

```java
repo.delete(s2);
```

Pass the entity object you want to delete, and it's gone.

### 🧪 What happens behind the scenes

```sql
-- Step 1: Check if the record exists
Hibernate: select s1_0.roll_no, s1_0.marks, s1_0.name from student s1_0 where s1_0.roll_no=?

-- Step 2: Record found → fire DELETE
Hibernate: delete from student where roll_no=?
```

Same pattern as update — Hibernate first verifies the record exists with a `SELECT`, then fires the `DELETE` using the primary key.

Go to pgAdmin, refresh, and the row is gone.

### 🧪 Other ways to delete

You don't always need the full object. You can delete by ID directly:

```java
repo.deleteById(102);  // Delete by primary key
```

This is cleaner when you only have the ID and don't want to fetch the full object first.

---

## Concept 3: The SELECT-Before-Action Pattern

### 🧠 Why does Hibernate SELECT before UPDATE or DELETE?

You might have noticed that both update and delete fire a `SELECT` query first. This isn't wasteful — it's intentional:

- **Before UPDATE**: Hibernate checks if the record exists. If it does, update. If not, insert instead.
- **Before DELETE**: Hibernate verifies the record is there before attempting to delete it.

This ensures data integrity — you won't accidentally try to update or delete something that doesn't exist.

---

## Concept 4: CRUD Operations — Complete Summary

### 📋 All four operations at a glance

| Operation | Method | What it does |
|-----------|--------|--------------|
| **Create** | `repo.save(entity)` | Inserts a new record (when ID doesn't exist) |
| **Read** | `repo.findAll()` | Fetches all records |
| | `repo.findById(id)` | Fetches one record by primary key |
| | `repo.findByName(name)` | Fetches records by a custom field (DSL) |
| **Update** | `repo.save(entity)` | Updates an existing record (when ID already exists) |
| **Delete** | `repo.delete(entity)` | Deletes the given entity |
| | `repo.deleteById(id)` | Deletes by primary key |

Notice that **Create and Update share the same method** — `save()`. The primary key determines the behavior.

---

## ✅ Key Takeaways

- There is **no separate `update()` method** — `save()` handles both insert and update based on whether the primary key already exists
- `save()` fires a `SELECT` first to check existence, then either `INSERT` or `UPDATE`
- `delete()` takes the entity object; `deleteById()` takes just the primary key — both remove the record
- Hibernate always verifies the record exists (via `SELECT`) before performing update or delete
- With this, all **CRUD operations** are complete using Spring Data JPA

## ⚠️ Common Mistakes

- Forgetting to set the **primary key** on the object when updating — without the correct ID, `save()` will insert a new record instead of updating the existing one
- Calling `delete()` without passing the object — make sure you pass the actual entity or use `deleteById()` with the ID value

## 💡 Pro Tips

- Use `deleteById(id)` when you only have the ID — it's more convenient than fetching the entire entity just to delete it
- Remember that `save()` doing double duty (insert + update) is called an **upsert** pattern — one method that handles both create and update seamlessly
