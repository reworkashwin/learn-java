# Fixing the N+1 Problem with Hibernate Batch Fetching

## Introduction

We've confirmed that our application has the N+1 problem — 31 SQL queries just to load 30 companies with their jobs. In this lesson, we explore two approaches to **reduce** the N+1 problem using Hibernate's batch fetching strategy. This isn't the complete fix (that comes with JPQL and `JOIN FETCH`), but it's an essential safety net every production application should have.

---

## Confirming the N+1 Problem

### 🔍 How to See It

First, make sure SQL logging is enabled in `application.properties`:

```properties
spring.jpa.show-sql=true
```

When we invoke the REST API that loads all companies (the homepage API), the console printed **~4,000 lines of logs**. The same query pattern appeared over and over:

```sql
SELECT * FROM jobs WHERE company_id = ?
```

This query ran **30 times** — once per company. Proof that the N+1 problem is alive and well.

> **Note:** If testing from a React UI in development mode, you'll see double the queries (62 instead of 31) because React's strict mode invokes every request twice. Testing from Postman gives accurate numbers.

---

## Attempting the Eager Fix (Doesn't Work)

### ❌ Why `FetchType.EAGER` Fails

You might try:

```java
@OneToMany(mappedBy = "company", fetch = FetchType.EAGER)
private List<Job> jobs;
```

Even with eager fetching, the console still shows repeated queries. Why?

For **collection-valued associations** (`@OneToMany`, `@ManyToMany`), Hibernate's default strategy is to use **secondary SELECT queries** — not JOINs. This is intentional to avoid Cartesian product explosions. So eager fetch doesn't solve the problem — **remove it**.

---

## Solution 1: Global Batch Fetch Size (Application Property)

### 🧠 What Is Batch Fetching?

Instead of loading child records **one parent at a time**, batch fetching tells Hibernate: *"Load child records for multiple parents in a single query using an IN clause."*

### ⚙️ How to Configure It

Add this property to `application.properties`:

```properties
spring.jpa.properties.hibernate.default_batch_fetch_size=50
```

This tells Hibernate: *"When you need to lazily load child records, batch them in groups of 50."*

### 🧪 Before vs After

**Before (N+1):**
```sql
SELECT * FROM companies;                          -- 1 query
SELECT * FROM jobs WHERE company_id = 1;           -- query 2
SELECT * FROM jobs WHERE company_id = 2;           -- query 3
...
SELECT * FROM jobs WHERE company_id = 30;          -- query 31
-- Total: 31 queries
```

**After (Batch Fetching with size 50):**
```sql
SELECT * FROM companies;                          -- 1 query
SELECT * FROM jobs WHERE company_id IN (1, 2, 3, ..., 30);  -- 1 query
-- Total: 2 queries!
```

Since we have 30 companies and the batch size is 50, all 30 company IDs fit in a single `IN` clause. If we had 80 companies, there'd be 2 batched queries (50 + 30).

### 📊 The Formula

With batch fetching, the N+1 becomes:

> **1 + ⌈N / batch_size⌉ queries**

For 30 companies with batch size 50: `1 + ⌈30/50⌉ = 1 + 1 = 2 queries`

For 80 companies with batch size 50: `1 + ⌈80/50⌉ = 1 + 2 = 3 queries`

---

## Solution 2: Entity-Level `@BatchSize` Annotation

### 🧠 What Is It?

If you want to override the global batch size for a **specific entity's child collection**, use `@BatchSize` directly on the field:

```java
@OneToMany(mappedBy = "company")
@BatchSize(size = 10)
private List<Job> jobs;
```

This overrides the global `default_batch_fetch_size` property for this specific association.

### 🧪 Demo Result

With batch size 10 and 30 companies:
- `1 + ⌈30/10⌉ = 1 + 3 = 4 queries` (1 for companies + 3 batched queries for jobs)

The logs confirmed exactly this — 1 company query + 3 job queries.

---

## Important: Batch Fetching Does NOT Fully Solve N+1

### ⚠️ The Caveat

Batch fetching **reduces** the problem but doesn't **eliminate** it:

| Approach | Queries for 30 Companies | Queries for 10,000 Companies |
|---|---|---|
| N+1 (no fix) | 31 | 10,001 |
| Batch size 50 | 2 | 201 |
| JOIN FETCH (JPQL) | **1** | **1** |

To **completely** solve the N+1 problem, you need `JOIN FETCH` via JPQL — which we'll cover in the next lesson.

---

## Best Practice: Use Both Approaches

### 💡 Why You Need the Global Property as a Safety Net

```properties
spring.jpa.properties.hibernate.default_batch_fetch_size=50
```

**Always keep this property in your application.** Here's why:

1. `JOIN FETCH` solves N+1 only for **specific queries** where you explicitly use it
2. The global batch size acts as a **safety net** for all other entity relationships
3. If a junior developer writes code that triggers lazy loading in a loop, this property prevents a full N+1 disaster
4. Think of it as a "global insurance policy" for your application's performance

### ⚙️ Recommended Setup

```properties
# Always enable this as a safety net
spring.jpa.properties.hibernate.default_batch_fetch_size=50
```

Then use `@BatchSize` on specific associations only when you need a different batch size than the global default.

---

## ✅ Key Takeaways

- **Global batch size** (`default_batch_fetch_size`) converts N+1 into `1 + N/batchSize` queries
- **`@BatchSize` annotation** overrides the global setting for a specific entity association
- Batch fetching is a **reduction strategy**, not a complete fix
- The complete fix is `JOIN FETCH` via JPQL (next lesson)
- **Always keep the global batch size property** in your `application.properties` as a safety net
- A batch size of **50** is a reasonable default for production

## ⚠️ Common Mistakes

- Relying solely on batch fetching and thinking N+1 is fully solved
- Setting an extremely large batch size (e.g., 10,000) — this can cause issues with database `IN` clause limits
- Forgetting to add the global property and relying only on `@BatchSize` for individual entities
- Removing the batch size property after implementing `JOIN FETCH` — keep both!

## 💡 Pro Tips

- Use `spring.jpa.show-sql=true` to verify your batch fetching is working — you should see `IN (?, ?, ...)` clauses
- The batch size of 50 is a balance between too many queries (small batch) and too large `IN` clauses (huge batch)
- Test with Postman rather than the React UI to get accurate query counts during development
- Count the question marks in the `IN` clause to verify your batch size is being applied correctly
