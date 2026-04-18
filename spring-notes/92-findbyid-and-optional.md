# Fetching a Single Record with findById and Optional

## Introduction

In the last video, we used `findAll()` to fetch every record from the database. But in real applications, you rarely want *everything* — you usually want **one specific record**.

How do you fetch a single student by their ID? And what happens if that ID doesn't exist in the database? This is where `findById()` and Java's `Optional` come into play.

---

## Concept 1: Fetching One Record with findById()

### 🧠 What is it?

`findById()` is another built-in method from `JpaRepository`. Instead of fetching all rows, it fetches **one specific row** based on the **primary key**.

### ⚙️ How it works

Let's say our database has this data:

| roll_no | name   | marks |
|---------|--------|-------|
| 101     | Navin  | 85    |
| 102     | Kiran  | 92    |
| 103     | Harsh  | 78    |

To fetch the student with roll number 103:

```java
System.out.println(repo.findById(103));
```

Behind the scenes, Hibernate generates:

```sql
select roll_no, marks, name from student where roll_no = ?
```

It uses the **primary key** (`roll_no`) in the `WHERE` clause. That's what `findById` means — find by the primary key, whatever column that is in your entity.

### 💡 Insight

Why does it search by `roll_no`? Because that's the field you marked with `@Id` in your `Student` entity. `findById()` always searches by whatever field is annotated as the primary key.

---

## Concept 2: Why findById Returns Optional

### ❓ The problem

What if you search for a student with roll number **104** — but no such record exists?

```java
Student s = repo.findById(104);  // ❌ Compile error!
```

This won't even compile. Why? Because `findById()` doesn't return a `Student` — it returns an **`Optional<Student>`**.

### 🧠 What is Optional?

`Optional` is a Java 8 feature designed to handle situations where a value **might or might not exist**. It's a wrapper that says: "I may contain a value, or I may be empty."

Think of it like a gift box — it could have something inside, or it could be empty. `Optional` forces you to check before opening it, preventing the dreaded `NullPointerException`.

### ❓ Why does JPA use Optional here?

Because the record you're looking for might not exist in the database. Instead of returning `null` (which would cause a `NullPointerException` the moment you try to use it), JPA returns an `Optional` that safely wraps either:
- The actual `Student` object (if found)
- An empty value (if not found)

This is a **safety mechanism**. It forces you to handle the "not found" case explicitly rather than crashing at runtime.

---

## Concept 3: Working with Optional

### ⚙️ The correct way to use findById

**Step 1**: Accept the result as `Optional<Student>`

```java
Optional<Student> s = repo.findById(103);
```

**Step 2**: Extract the value safely using `orElse()`

```java
Student student = s.orElse(new Student());
```

This says: "Give me the student if it exists, otherwise give me a blank `Student` object with default values."

### 🧪 Example — when the record exists

```java
Optional<Student> s = repo.findById(103);
Student student = s.orElse(new Student());
System.out.println(student);
```

Output:
```
Student{rollNo=103, name='Harsh', marks=78}
```

The record was found, so `orElse` returns the actual student.

### 🧪 Example — when the record does NOT exist

```java
Optional<Student> s = repo.findById(104);  // 104 doesn't exist
Student student = s.orElse(new Student());
System.out.println(student);
```

Output:
```
Student{rollNo=0, name=null, marks=0}
```

No record found, so `orElse` kicks in and returns a blank `Student` object with default values. No crash. No `NullPointerException`. Clean handling.

### 💡 Insight

`Optional` is not specific to Spring or Hibernate — it's a core **Java 8 concept**. Anytime data might not be available (from a database, an API, user input), `Optional` is the clean way to handle it. Spring Data JPA simply uses this pattern to keep your code safe.

---

## Concept 4: Other Useful Methods on Optional

### ⚙️ Beyond orElse

`Optional` gives you several ways to handle the "might be empty" scenario:

```java
// Get value or provide a default
Student s = repo.findById(103).orElse(new Student());

// Get value or throw an exception
Student s = repo.findById(103).orElseThrow(() -> new RuntimeException("Student not found"));

// Check if value is present
if (repo.findById(103).isPresent()) {
    System.out.println("Found!");
}

// Do something only if value exists
repo.findById(103).ifPresent(student -> System.out.println(student.getName()));
```

Each approach handles the "not found" case differently — choose based on your use case.

---

## Concept 5: The Limitation of findById

### ❓ What it can't do

`findById()` searches **only by the primary key**. What if you want to search by:
- **Name** — find all students named "Harsh"
- **Marks** — find students who scored above 80
- Any other non-primary-key field

`findById` can't help with that. You need a different approach — and Spring Data JPA has an elegant solution for custom queries based on any field. That's coming in the next video.

---

## ✅ Key Takeaways

- `findById()` fetches a single record using the **primary key** (`@Id` field)
- It returns `Optional<Student>`, not `Student` directly — this is a safety feature
- Use `orElse()` to provide a fallback value when the record doesn't exist
- `Optional` is a **Java 8 concept** that prevents `NullPointerException` by forcing you to handle the "empty" case
- `findById` only works with primary keys — searching by other fields requires a different approach

## ⚠️ Common Mistakes

- Trying to assign `findById()` result directly to a `Student` variable — it returns `Optional<Student>`, not `Student`
- Calling `.get()` on an Optional without checking if it's present — this defeats the purpose and can still throw `NoSuchElementException`
- Confusing `findById` with searching by any field — it **only** works with the primary key

## 💡 Pro Tips

- Prefer `orElseThrow()` over `orElse(new Student())` in real applications — returning a blank object can silently hide the fact that data was missing, while throwing an exception makes the problem visible
- Use `ifPresent()` when you want to perform an action only if the record exists — it's cleaner than checking `isPresent()` followed by `get()`
