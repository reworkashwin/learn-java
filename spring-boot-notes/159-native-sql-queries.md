# Using Native SQL Queries with `@Query` — Practical Demo

## Introduction

We've seen how JPQL with `@Query` elegantly solves our defect and N+1 problem. But there's another format you can provide to `@Query`: **native SQL queries** — raw SQL that goes directly to the database. In this lesson, we explore when you might need native queries, see a live demo, and understand why **JPQL should remain your default choice**.

---

## Writing a Native SQL Query with `@Query`

### ⚙️ The Syntax

To use a native SQL query, you need to:
1. Write actual SQL (table names, column names, SQL syntax)
2. Set `nativeQuery = true` in the `@Query` annotation

```java
@Query(
    value = "SELECT DISTINCT c.* FROM companies c " +
            "JOIN jobs j ON c.id = j.company_id " +
            "WHERE j.status = :status",
    nativeQuery = true
)
List<Company> findAllWithJobsByStatusNative(@Param("status") String status);
```

### 🔍 Key Differences from JPQL

| Element | JPQL Version | Native SQL Version |
|---|---|---|
| Select | `c` | `c.*` (asterisk required in SQL) |
| Table reference | `Company` (entity class) | `companies` (actual table name) |
| Join target | `c.jobs` (entity field) | `jobs` (actual table name) |
| Join condition | Automatic | Must write `ON c.id = j.company_id` manually |
| `FETCH` keyword | ✅ Supported | ❌ Not available |
| `nativeQuery` flag | Not needed (default is JPQL) | **Must set `true`** |

### ⚠️ No `FETCH` Keyword in Native SQL

This is critical: the `FETCH` keyword is **JPQL-specific**. You cannot use `JOIN FETCH` in native SQL. If you try, you'll get a syntax error.

---

## Two Styles of Parameter Binding

### Named Parameters (Recommended)

```java
WHERE j.status = :status
```

Bind with `@Param("status")` on the method parameter.

### Positional Parameters

```java
WHERE j.status = ?1
```

The `?1` refers to the **first** method parameter, `?2` to the second, and so on. If there's only one parameter, even `?` alone works.

> **Recommendation:** Use named parameters — they're more readable and less error-prone when refactoring.

---

## The Compilation Error Trap

If you write a native SQL query but forget to set `nativeQuery = true`:

```java
@Query("SELECT DISTINCT c.* FROM companies c ...")  // ← Missing nativeQuery = true
```

The framework assumes it's JPQL and fails because `c.*` (asterisk) is not valid JPQL syntax. Always remember:

```java
@Query(value = "...", nativeQuery = true)  // ← Tell the framework it's native SQL
```

---

## The Demo — What Goes Wrong

### 🧪 Testing the Native Query

When we invoke the native SQL method and check the response:

- Searching for `CLOSED` status: **2 records found** ❌ (they should be filtered out!)
- Total jobs: **1,000** (not 998 as expected)

**The active status filter isn't working.** All jobs are being returned, regardless of status.

### 🧪 The N+1 Problem Returns

Looking at the console logs:
- **3 SQL queries** for jobs (batch fetching at size 10, 3 × 10 = 30 companies)
- Plus 1 initial company query
- **N+1 is back** (reduced by batch fetching, but not eliminated)

---

## Why Native SQL Queries Don't Control Relationship Loading

### 🧠 The Root Cause

This is the most important concept to understand:

> **Native SQL queries don't understand JPA entity relationships.**

When you run a native SQL query, here's what happens:

1. The SQL runs on the database and returns **company rows** only
2. The database doesn't know about `@OneToMany` annotations — it just returns data matching your SELECT
3. Hibernate receives these company rows and maps them to `Company` objects
4. Later, when you access `company.getJobs()`, Hibernate loads jobs **separately** using its own strategy
5. This separate loading **ignores your WHERE clause** — it fetches ALL jobs for that company

### 🏠 Analogy

Think of it like writing a shopping list (native SQL) and handing it to an assistant (Hibernate). Your list says: *"Get apples from the organic aisle."* The assistant gets the apples, but when you later ask *"What snacks did you bring?"*, the assistant also brought cookies and chips from other aisles because your list only mentioned apples — it didn't restrict the snacks.

---

## Workaround: `@SQLRestriction`

### ⚙️ How It Works

You can add `@SQLRestriction` to the collection field in your entity:

```java
@OneToMany(mappedBy = "company")
@BatchSize(size = 10)
@SQLRestriction("status = 'ACTIVE'")
private List<Job> jobs;
```

This tells Hibernate: *"Whenever you load jobs for a company, always add this WHERE condition."*

### ⚠️ The Problem with This Approach

The restriction is **global and permanent**. Every time Hibernate loads jobs for any company, anywhere in your application, it will filter by `ACTIVE` status. If you ever need to fetch closed jobs, this restriction blocks you.

There are advanced Hibernate features like `@FilterDef` to make this dynamic, but they add complexity. For our use case, JPQL is the cleaner solution.

---

## When to Actually Use Native SQL Queries

### ✅ Legitimate Use Cases (Rare)

| Use Case | Example |
|---|---|
| Database-specific features | Window functions (`ROW_NUMBER`, `RANK`), `PIVOT` |
| Performance optimization | Database-specific query hints |
| Legacy databases | Complex stored procedures |
| Complex aggregations | When JPQL can't handle your aggregation logic |

### ❌ Not Recommended for Everyday Use

In **99% of scenarios**, developers use JPQL. Native queries are the exception, not the rule.

---

## Disadvantages of Native SQL Queries

| Drawback | Explanation |
|---|---|
| **Database dependency** | Query syntax may differ between MySQL, PostgreSQL, Oracle |
| **No compile-time checking** | Errors only surface at runtime |
| **Framework can't optimize** | Query runs blindly — no Hibernate optimizations |
| **No relationship awareness** | Can't use `FETCH JOIN` to control entity loading |
| **Portability issues** | Migrating databases requires rewriting all native queries |

---

## The Golden Rule of Query Selection

```
Need to query data?
│
├── Simple CRUD → Use Spring Data JPA built-in methods (findAll, save, etc.)
│
├── Simple custom filter on single table → Use Derived Query Methods
│
├── Complex multi-table queries → ✅ Use @Query with JPQL
│
└── DB-specific features needed → Use @Query with native SQL (last resort)
```

---

## ✅ Key Takeaways

- Native SQL queries require `nativeQuery = true` in `@Query`
- Native SQL uses **actual table and column names**, not entity/field names
- `FETCH` keyword is **not available** in native SQL — it's JPQL-only
- Native SQL **doesn't control JPA relationship loading** — jobs load separately via Hibernate's strategy
- `@SQLRestriction` can force a permanent filter but isn't flexible
- The N+1 problem **returns** with native queries (mitigated only by batch fetching)
- **Always prefer JPQL** — use native SQL only when you need database-specific features
- Keep the batch fetching property as a safety net regardless

## ⚠️ Common Mistakes

- Using native SQL for everyday queries when JPQL would be simpler and safer
- Expecting `JOIN` in native SQL to control which child records Hibernate loads — it doesn't
- Forgetting `nativeQuery = true` and getting confusing compilation errors
- Using `@SQLRestriction` with a hardcoded value and then being surprised when it filters everywhere

## 💡 Pro Tips

- If you find yourself writing a native SQL query, stop and ask: *"Can JPQL handle this?"* The answer is usually yes
- When you must use native SQL, test thoroughly — errors only show up at runtime
- After switching back from native to JPQL, always verify the query count in console logs
- Remember: the framework generates optimized SQL from JPQL that's usually just as fast as hand-written SQL
