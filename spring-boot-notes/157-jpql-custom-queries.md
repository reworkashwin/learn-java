# Introducing `@Query` and JPQL — Writing Custom JPA Queries

## Introduction

We've hit the ceiling with derived query methods and patched the N+1 problem with batch fetching. Now it's time to learn the **real power tool** of Spring Data JPA: the `@Query` annotation with **JPQL** (Java Persistence Query Language). This is the annotation that lets you write exactly the query you want — with full control over joins, filters, and fetch strategies.

---

## Why `@Query` Is the Right Choice for Complex Requirements

### 🧠 What Is `@Query`?

`@Query` is an annotation you place on top of an abstract method in your Repository interface. It tells Spring Data JPA: *"Don't try to generate a query from the method name — use the query I'm providing instead."*

```java
@Query("SELECT DISTINCT c FROM Company c JOIN FETCH c.jobs j WHERE j.status = :status")
List<Company> findAllWithJobsByStatus(@Param("status") String status);
```

When this method is called, the framework ignores the method name entirely and executes the provided query.

### ❓ Why Do We Need It?

The `@Query` annotation gives you full control over:

| Capability | Derived Methods | `@Query` |
|---|---|---|
| Choose join type (JOIN, LEFT JOIN, RIGHT JOIN) | ❌ | ✅ |
| Use FETCH strategy | ❌ | ✅ |
| Filter on child entity columns | ❌ | ✅ |
| Solve N+1 problem completely | ❌ | ✅ |
| Clear intent for other developers | ❌ | ✅ |

With `@Query`, your intent is **explicit**. Other developers don't have to guess what your query does by parsing a long method name.

### 💡 Important Clarification

Does this mean derived query methods are bad? **Absolutely not.** Derived query methods are still the best choice for **simple, single-table queries**. Use the right tool for the right job.

---

## What Is JPQL (Java Persistence Query Language)?

### 🧠 JPQL in Simple Terms

JPQL is like SQL, but instead of talking to **database tables and columns**, you talk to **Java entity classes and their fields**.

> Think of JPQL as: **SQL that speaks Java.**

### ⚙️ JPQL vs Native SQL — Side by Side

Let's write the same query in both formats:

**Native SQL (talks to the database):**
```sql
SELECT DISTINCT c.*
FROM companies c
JOIN jobs j ON c.id = j.company_id
WHERE j.status = 'ACTIVE'
```

**JPQL (talks to Java entities):**
```sql
SELECT DISTINCT c
FROM Company c
JOIN FETCH c.jobs j
WHERE j.status = 'ACTIVE'
```

### 🔍 Key Differences Explained

| Element | Native SQL | JPQL |
|---|---|---|
| What to select | `c.*` (all columns) | `c` (the entity object) |
| Table reference | `companies` (table name) | `Company` (entity class name) |
| Join target | `jobs` (table name) | `c.jobs` (entity field name) |
| Join condition (`ON`) | Must write explicitly | **Automatic** — JPA knows from `@OneToMany` |
| Column reference | `j.status` (column name) | `j.status` (field name in entity) |
| `FETCH` keyword | Not available | Available — loads children in same query |

### 💡 The Magic of `JOIN FETCH`

The `FETCH` keyword in JPQL is the key to killing the N+1 problem:

```sql
JOIN FETCH c.jobs j
```

This tells Hibernate: *"While fetching companies, also load their associated jobs in the SAME query."* No extra queries. No N+1. One query does it all.

---

## Why Learn JPQL When You Know SQL?

### Advantage 1: No `ON` Condition Needed

In native SQL, you must specify the join condition:
```sql
JOIN jobs j ON c.id = j.company_id
```

In JPQL, JPA already knows about the relationship from your `@OneToMany` and `@ManyToOne` annotations, so it adds the `ON` condition **automatically**.

### Advantage 2: No Need to Know Table/Column Names

With JPQL, you reference **entity class names** and **field names**. You never need to open the database to check what the actual table or column is called.

### Advantage 3: Database Portability

This is the **biggest advantage**. JPQL queries work across all databases — MySQL, PostgreSQL, Oracle, H2, etc. The framework generates the correct native SQL for whatever database you're connected to.

Native SQL queries might use database-specific syntax. If you switch databases, you might need to rewrite them.

### Advantage 4: Compile-Time Validation

JPQL queries are parsed and validated when the application starts. Syntax errors are caught early. Native SQL queries may only fail at runtime when the query actually executes.

---

## The Decision Tree — Which Query Approach to Use

```
Need to query data?
│
├── Simple, single-table query?
│   └── ✅ Use Derived Query Methods
│
├── Complex query (multi-table, joins, custom filters)?
│   └── ✅ Use @Query with JPQL
│
└── Need DB-specific features (window functions, PIVOT, hints)?
    └── ✅ Use @Query with native SQL (rare)
```

---

## ✅ Key Takeaways

- `@Query` annotation lets you write custom queries that bypass method-name parsing
- JPQL works with **entity classes and fields**, not database tables and columns
- `JOIN FETCH` in JPQL completely solves the N+1 problem
- JPQL is **database-portable** — your queries work on any database
- JPQL automatically handles join conditions from your entity mappings
- For 99% of cases, JPQL is the right choice over native SQL
- Derived query methods are still appropriate for simple, single-table queries

## ⚠️ Common Mistakes

- Using the actual database table name in JPQL instead of the entity class name
- Using the column name instead of the Java field name in JPQL `WHERE` clauses
- Forgetting the `FETCH` keyword in `JOIN FETCH` — without it, you still get N+1
- Writing `c.*` in JPQL — just use `c` (JPQL doesn't use the asterisk syntax)
- Jumping to native SQL when JPQL can handle the requirement

## 💡 Pro Tips

- If your entity field name and database column name are different, JPQL uses the **field name** and native SQL uses the **column name** — don't mix them up
- Use `DISTINCT` in your JPQL when joining one-to-many relationships, otherwise you'll get duplicate parent records (one per child)
- The `FETCH` keyword is JPQL-specific — it doesn't exist in native SQL
- Think of JPQL as an abstraction layer over SQL, similar to how JPA is an abstraction over JDBC
