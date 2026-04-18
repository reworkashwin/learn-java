# The Magic of Derived Queries — How Method Names Become Database Queries

## Introduction

One of the most powerful features of Spring Data JPA is **derived query methods**. Instead of writing SQL queries manually, you simply define an **abstract method** in your repository interface following a naming convention — and Spring Data JPA automatically generates the SQL for you.

Sound like magic? It kind of is. Let's break it down.

---

## The Problem: Default Methods Aren't Enough

`JpaRepository` gives you free methods like:

| Method            | What It Does                       |
|------------------|------------------------------------|
| `save()`         | Create or update a record          |
| `findById()`     | Fetch by primary key               |
| `findAll()`      | Fetch all records                  |
| `deleteById()`   | Delete by primary key              |
| `delete()`       | Delete a specific entity           |

But what if you want to:
- Find a role **by name**?
- Find users **by email**?
- Delete records **by status**?
- Count records **by department**?

The framework can't guess all your database columns and pre-generate every possible method. That's your job — but it's **incredibly easy**.

---

## What Are Derived Query Methods?

### 🧠 The Concept

A derived query method is an **abstract method** defined in a repository interface whose **name follows a specific pattern**. Spring Data JPA reads the method name, parses it, and generates the corresponding SQL query **at runtime**.

> You write the method signature. Spring writes the SQL.

### ⚙️ How It Works

A derived query method has two components separated by `By`:

```
[Introducer]By[Criteria]
```

1. **Introducer** — What operation to perform (`find`, `count`, `delete`, `exists`, etc.)
2. **Criteria** — Which fields to filter on, combined with operators

### 🧪 Simple Example

```java
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByStatus(String status);
}
```

Behind the scenes, Spring generates:
```sql
SELECT * FROM companies WHERE status = ?
```

That's it. No SQL, no implementation class. Just a method name.

---

## Introducer Keywords

The first part of the method name tells JPA **what kind** of operation you want:

| Introducer   | Purpose                        | Example                    | Generated SQL                         |
|-------------|--------------------------------|----------------------------|---------------------------------------|
| `findBy`    | Select records                 | `findByDepartment()`       | `SELECT * FROM ... WHERE dept = ?`    |
| `readBy`    | Same as findBy                 | `readByDepartment()`       | Same as above                         |
| `queryBy`   | Same as findBy                 | `queryByDepartment()`      | Same as above                         |
| `countBy`   | Count matching records         | `countByDepartment()`      | `SELECT COUNT(*) ... WHERE dept = ?`  |
| `existsBy`  | Check if record exists         | `existsByName()`           | Returns `true`/`false`                |
| `deleteBy`  | Delete matching records        | `deleteByName()`           | `DELETE FROM ... WHERE name = ?`      |
| `removeBy`  | Same as deleteBy               | `removeByAge()`            | `DELETE FROM ... WHERE age = ?`       |

---

## Combining Multiple Conditions

### Using `And`

```java
List<Customer> findByNameAndAge(String name, int age);
```
```sql
SELECT * FROM customers WHERE name = ? AND age = ?
```

### Using `Or`

```java
List<Customer> findByNameOrAge(String name, int age);
```
```sql
SELECT * FROM customers WHERE name = ? OR age = ?
```

---

## Comparison Operators

| Keyword         | Example Method                    | SQL Equivalent        |
|----------------|-----------------------------------|-----------------------|
| `GreaterThan`  | `findByAgeGreaterThan(int age)`   | `WHERE age > ?`       |
| `LessThan`     | `findByAgeLessThan(int age)`      | `WHERE age < ?`       |
| `Between`      | `findByAgeBetween(int start, int end)` | `WHERE age BETWEEN ? AND ?` |
| `Like`         | `findByNameLike(String pattern)`  | `WHERE name LIKE ?`   |
| `NotLike`      | `findByNameNotLike(String pattern)` | `WHERE name NOT LIKE ?` |
| `StartingWith` | `findByNameStartingWith(String prefix)` | `WHERE name LIKE 'prefix%'` |
| `EndingWith`   | `findByNameEndingWith(String suffix)` | `WHERE name LIKE '%suffix'` |
| `Containing`   | `findByNameContaining(String part)` | `WHERE name LIKE '%part%'` |

---

## Sorting Results

Add `OrderBy` after your criteria:

```java
List<Customer> findByDepartmentOrderByAgeAsc(String dept);
```
```sql
SELECT * FROM customers WHERE department = ? ORDER BY age ASC
```

```java
List<Customer> findByDepartmentOrderByNameDesc(String dept);
```
```sql
SELECT * FROM customers WHERE department = ? ORDER BY name DESC
```

---

## Limiting Results

```java
Customer findFirstByOrderByAgeAsc();          // First record
List<Customer> findTop3ByOrderByAgeDesc();    // Top 3 records
List<Customer> findTop10ByDepartment(String dept); // Top 10 by dept
```

---

## Null Checks

```java
List<Customer> findByDepartmentIsNull();       // WHERE department IS NULL
List<Customer> findByDepartmentIsNotNull();    // WHERE department IS NOT NULL
```

---

## Date Operations

```java
List<Customer> findByStartDateAfter(Date date);   // WHERE start_date > ?
List<Customer> findByStartDateBefore(Date date);  // WHERE start_date < ?
```

---

## IN Clause

```java
List<Customer> findByDepartmentIn(List<String> departments);
// WHERE department IN ('HR', 'IT', 'Sales')

List<Customer> findByDepartmentNotIn(List<String> departments);
// WHERE department NOT IN (...)
```

---

## Boolean Fields

```java
List<Customer> findByActiveTrue();    // WHERE active = true
List<Customer> findByActiveFalse();   // WHERE active = false
```

---

## Case-Insensitive Search

```java
List<Customer> findByFirstNameIgnoreCase(String name);
// WHERE UPPER(first_name) = UPPER(?)
```

---

## Complex Example: Combining Everything

```java
List<Customer> findByDepartmentAndAgeGreaterThanOrderByNameAsc(
    String department, int age
);
```

Generated SQL:
```sql
SELECT * FROM customers 
WHERE department = ? AND age > ? 
ORDER BY name ASC
```

This single method name combines:
- Filtering by `department` (exact match)
- Filtering by `age` (greater than)
- Sorting by `name` (ascending)

---

## When Derived Queries Get Too Long

If your method name becomes unwieldy, use the **`@Query` annotation** as an alternative:

```java
@Query("SELECT c FROM Customer c WHERE c.department = ?1 AND c.age > ?2 ORDER BY c.name ASC")
List<Customer> findCustomers(String department, int age);
```

With `@Query`, you write the JPQL/SQL yourself, and the method name can be whatever you want — JPA ignores it and uses your query instead.

---

## What About Update Operations?

You **don't** need derived query methods for updates. Just use `save()`:

```java
Customer customer = customerRepository.findById(1L).get();
customer.setName("New Name");
customerRepository.save(customer);  // JPA detects changes and runs UPDATE
```

JPA checks the primary key, finds the existing record, compares changes, and executes an UPDATE.

---

## ✅ Key Takeaways

- Derived query methods let you define database queries **just by naming a method**.
- Method names follow the pattern: `[Introducer]By[Criteria]`.
- You can combine conditions with `And`, `Or`, use comparisons like `GreaterThan`, `Like`, and add sorting with `OrderBy`.
- For complex queries, fall back to `@Query` annotation.
- No SQL, no implementation — Spring generates everything at runtime.

## ⚠️ Common Mistakes

- **Misspelling field names** — the method name must match your **Java field name**, not the database column name.
- **Using database column names** — derived queries use entity field names (`mobileNumber`, not `mobile_number`).
- **Forgetting that `findBy` returns a list** — if you expect a single record, wrap the return type in `Optional<>`.

## 💡 Pro Tips

- Use **IntelliJ's autocomplete** when defining derived query methods — it suggests fields and keywords.
- Use `Optional<>` as return type for methods that might return no results.
- For more than 2-3 criteria in a single method, prefer `@Query` for readability.
- Ask ChatGPT or AI tools: "Can I achieve X with a derived query method?" — it's great at generating these.
