# Custom Queries — findByName, JPQL, and Query DSL

## Introduction

We know how to fetch all records with `findAll()` and one record by primary key with `findById()`. But what if you want to search by **name**? Or find students with marks **greater than 75**?

`findById` only works with the primary key. For everything else, we need custom queries — and Spring Data JPA gives us two powerful ways to do it.

---

## Concept 1: The Problem — findByName Doesn't Exist (Yet)

### ❓ Why can't we just call findByName?

Let's say we try this:

```java
repo.findByName("Navin");
```

If you type `repo.` and look at the available methods, you won't find `findByName`. Why?

Think about it — `JpaRepository` is a **generic** interface used by every project. Your entity has a field called `name`, but someone else's entity might have `personName`, `studentName`, or `fullName`. How could JPA possibly pre-create methods for every possible field name across every possible entity?

It can't. So methods like `findByName` aren't available out of the box. We need to define them ourselves.

---

## Concept 2: Writing a Custom Method with @Query (JPQL)

### ⚙️ Step 1: Define the method in your repository interface

Go to your `StudentRepo` interface and add a method:

```java
public interface StudentRepo extends JpaRepository<Student, Integer> {

    @Query("SELECT s FROM Student s WHERE s.name = ?1")
    List<Student> findByName(String name);
}
```

Let's break this down piece by piece.

### 🧠 Why does it return `List<Student>`?

Because multiple students can have the same name. "Navin" isn't unique in the real world — so the query might return more than one result.

### 🧠 What is @Query?

The `@Query` annotation lets you attach a custom query to a method. Whenever someone calls `findByName()`, Spring Data JPA executes this query.

### 🧠 What is JPQL?

The query inside `@Query` is **not** regular SQL — it's **JPQL** (Java Persistence Query Language). It looks like SQL but has key differences:

| SQL | JPQL |
|-----|------|
| Uses **table names** | Uses **class names** |
| Uses **column names** | Uses **property names** |
| `SELECT * FROM student` | `SELECT s FROM Student s` |

```
SELECT s FROM Student s WHERE s.name = ?1
```

- `Student` — the **class name** (capital S), not the table name
- `s` — an alias for the Student object (like a variable)
- `s.name` — the **Java property**, not the database column
- `?1` — a placeholder for the **first parameter** passed to the method

### ❓ Why ?1 and not just ?

You might have complex queries with multiple parameters:

```java
@Query("SELECT s FROM Student s WHERE s.name = ?1 AND s.marks > ?2")
List<Student> findByNameAndMinMarks(String name, int marks);
```

The numbers (`?1`, `?2`) tell JPA which method parameter maps to which placeholder:
- `?1` → first parameter (`name`)
- `?2` → second parameter (`marks`)

### 🧪 Using it

```java
System.out.println(repo.findByName("Navin"));
```

Hibernate generates:

```sql
select s1_0.roll_no, s1_0.marks, s1_0.name from student s1_0 where s1_0.name=?
```

Output:

```
[Student{rollNo=101, name='Navin', marks=75}]
```

It's a list (square brackets) — even if only one result comes back, it's wrapped in a list.

---

## Concept 3: The Magic — It Works Without @Query Too!

### 🧠 What is Query DSL?

Here's the twist. Remove the `@Query` annotation entirely:

```java
public interface StudentRepo extends JpaRepository<Student, Integer> {

    List<Student> findByName(String name);  // No @Query!
}
```

Run the application... and **it still works**!

How? Spring Data JPA uses something called **Domain Specific Language (DSL)** — also known as **derived query methods**. It looks at your method name, parses it, and automatically generates the query.

### ⚙️ How DSL parses your method name

When JPA sees `findByName`, it reads it as:

```
find → I need to perform a SELECT query
By → WHERE clause coming next
Name → the property "name" in the Student entity
```

It then generates: `SELECT s FROM Student s WHERE s.name = ?`

JPA knows your entity has a property called `name` (because it's defined in the `Student` class), so it creates the query automatically. No `@Query` annotation needed.

### ⚠️ Important — the method name must match the property name

```java
List<Student> findByName(String name);      // ✅ Works — "name" is a property
List<Student> findBySName(String name);     // ❌ Fails — "sName" is NOT a property
```

JPA has no idea what `sName` is. It only recognizes property names that actually exist in your entity class.

---

## Concept 4: findByMarks — Searching by Other Fields

### ⚙️ How it works

The same DSL pattern works for any property:

```java
List<Student> findByMarks(int marks);
```

JPA sees `findByMarks`, finds the `marks` property in `Student`, and generates:

```sql
SELECT s FROM Student s WHERE s.marks = ?
```

### 🧪 Usage

```java
System.out.println(repo.findByMarks(80));
```

This returns all students who scored exactly 80.

---

## Concept 5: Using Operators — Greater Than, Less Than

### ❓ What if you want marks greater than a value?

DSL supports operators too. Just append the operator name to the method:

```java
List<Student> findByMarksGreaterThan(int marks);
```

JPA reads this as:

```
find → SELECT
By → WHERE
Marks → property "marks"
GreaterThan → >
```

Generates: `SELECT s FROM Student s WHERE s.marks > ?`

### 🧪 Example

```java
System.out.println(repo.findByMarksGreaterThan(72));
```

If two students have marks above 72 (say Navin with 75 and Kiran with 80), both are returned:

```
[Student{rollNo=101, name='Navin', marks=75}, Student{rollNo=102, name='Kiran', marks=80}]
```

### 📋 Common DSL keywords

| Method Name Fragment | SQL Equivalent |
|----------------------|----------------|
| `findByMarksGreaterThan` | `marks > ?` |
| `findByMarksLessThan` | `marks < ?` |
| `findByMarksGreaterThanEqual` | `marks >= ?` |
| `findByMarksLessThanEqual` | `marks <= ?` |
| `findByMarksBetween` | `marks BETWEEN ? AND ?` |
| `findByNameContaining` | `name LIKE %?%` |
| `findByNameStartingWith` | `name LIKE ?%` |
| `findByNameOrderByMarksDesc` | `name = ? ORDER BY marks DESC` |
| `findByNameAndMarks` | `name = ? AND marks = ?` |
| `findByNameOrMarks` | `name = ? OR marks = ?` |

All of these are auto-generated from the method name. No `@Query` needed.

---

## Concept 6: When to Use @Query vs DSL

### 🧠 Use DSL (derived query methods) when:

- The query is simple — one or two conditions
- It maps cleanly to a method name like `findByNameAndMarks`

### 🧠 Use @Query (JPQL) when:

- The query is complex — joins, subqueries, aggregations
- The method name would be ridiculously long
- You need something DSL doesn't support
- You want full control over the query

### 💡 Bottom line

DSL handles 80% of your queries with zero effort. For the other 20%, `@Query` with JPQL has you covered.

---

## ✅ Key Takeaways

- `findByName`, `findByMarks`, etc. are **not** pre-built in JpaRepository — they work through DSL (derived query methods)
- Spring Data JPA **parses method names** and auto-generates queries — `findByMarksGreaterThan(72)` becomes `WHERE marks > 72`
- Method names must match **actual property names** in your entity class
- For complex queries, use the `@Query` annotation with **JPQL** (uses class names and property names, not table/column names)
- JPQL uses `?1`, `?2` to map parameters to placeholders in the query

## ⚠️ Common Mistakes

- Misspelling property names in method names — `findByMark` won't work if the property is `marks`
- Using table/column names in JPQL instead of class/property names — JPQL works with Java entities, not database tables
- Forgetting that DSL methods return `List` — even if only one result is expected, the return type should be `List<Student>` when multiple matches are possible

## 💡 Pro Tips

- Use your IDE's autocomplete when typing method names in the repository — Spring tooling can suggest valid DSL method names based on your entity's properties
- If your DSL method name is getting too long (like `findByNameAndMarksGreaterThanAndRollNoLessThan`), switch to `@Query` — readability matters more than avoiding annotations
