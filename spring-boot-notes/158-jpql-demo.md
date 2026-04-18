# Hands-On Demo — Writing JPQL Queries Using `@Query`

## Introduction

Theory is great, but let's get our hands dirty. In this lesson, we write our first `@Query` with JPQL from scratch, wire it into the service layer, and verify that both our defect (closed jobs appearing) and the N+1 problem are **completely solved** — with just a single SQL query hitting the database.

---

## Step 1: Define the Repository Method

### ⚙️ Creating the Abstract Method

Open `CompanyRepository` and define a new method:

```java
@Query("SELECT DISTINCT c FROM Company c JOIN FETCH c.jobs j WHERE j.status = :status")
List<Company> findAllWithJobsByStatus(@Param("status") String status);
```

Let's break down every piece:

### 🔍 The JPQL Query Explained

```
SELECT DISTINCT c        → Fetch distinct Company entity objects
FROM Company c           → From the Company entity (mapped to the companies table)
JOIN FETCH c.jobs j      → Join with the jobs collection AND load them in the same query
WHERE j.status = :status → Filter: only include jobs with the given status
```

**Why `DISTINCT`?**
A company with 10 jobs would appear 10 times in the join result (once per job row). `DISTINCT` ensures each company appears only once in the returned list.

**Why `FETCH`?**
Without `FETCH`, Hibernate would only use the join for filtering but would still lazily load the jobs later (causing N+1). With `FETCH`, the jobs are loaded as part of the same query.

### 🔍 Dynamic Parameters with `:status`

The `:status` in the query is a **named parameter**. The value comes from the method parameter annotated with `@Param("status")`:

```java
List<Company> findAllWithJobsByStatus(@Param("status") String status);
```

Whatever value is passed to this method at runtime replaces `:status` in the query.

### 💡 Key Insight About Method Names

> When a method has `@Query` on top of it, **the method name is completely ignored** by Spring Data JPA. You can name it `findAllWithJobsByStatus`, `fetchCompanies`, or even `banana` — the framework only cares about the query inside `@Query`.

That said, **always use meaningful names** for readability!

---

## Step 2: Update the Service Layer

### ⚙️ Switching from `findAll()` to Our New Method

Go to `CompanyServiceImpl`. Replace:

```java
companyRepository.findAll();
```

With:

```java
companyRepository.findAllWithJobsByStatus(ApplicationConstants.ACTIVE_STATUS);
```

But first, define the constant in your `ApplicationConstants` class:

```java
public static final String ACTIVE_STATUS = "ACTIVE";
```

Using a constant instead of a hardcoded string `"ACTIVE"` is a best practice — it avoids typos and makes the value easy to change globally.

---

## Step 3: Test and Verify

### 🧪 Testing the Defect Fix

After building and refreshing the homepage:

- **Before:** 1,000 jobs displayed (including 2 closed jobs)
- **After:** 998 jobs displayed (only active jobs) ✅

The defect is fixed! Closed jobs no longer appear on the homepage.

### 🧪 Verifying N+1 Is Solved

Clear the console logs and invoke the REST API from Postman. Examine the output:

**Before (N+1 problem):**
- ~4,000 lines of logs
- 31+ SQL queries
- Same `SELECT * FROM jobs WHERE company_id = ?` repeated 30 times

**After (with JPQL JOIN FETCH):**
- ~60 lines of logs
- **1 single SQL query** ✅

### 🔍 The Actual SQL Generated

Here's what Hibernate generated behind the scenes from our JPQL:

```sql
SELECT DISTINCT c1_0.*, j1_0.*
FROM companies c1_0
JOIN jobs j1_0 ON c1_0.id = j1_0.company_id
WHERE j1_0.status = ?
```

Notice:
- The framework automatically added the `ON c1_0.id = j1_0.company_id` condition — we never wrote this in our JPQL
- Both parent (companies) and child (jobs) data are fetched in **one query**
- No additional queries are fired

---

## The Complete Picture

### 📊 What We Solved

| Problem | Status |
|---|---|
| Closed jobs appearing on homepage | ✅ Fixed — only active jobs are fetched |
| N+1 queries (31 queries) | ✅ Fixed — reduced to 1 query |
| Query intent unclear from method name | ✅ Fixed — JPQL makes intent explicit |

---

## ✅ Key Takeaways

- Use `@Query` with JPQL on a repository method to define custom queries
- Named parameters (`:paramName`) are injected via `@Param("paramName")` on method arguments
- `JOIN FETCH` loads parent and child data in a **single SQL query** — completely solving N+1
- Use `DISTINCT` when joining one-to-many relationships to avoid duplicate parent records
- The method name doesn't matter when `@Query` is present — but keep it meaningful
- Always use constants for filter values instead of hardcoded strings
- Verify your fix by checking console SQL logs — you should see exactly **1 query**

## ⚠️ Common Mistakes

- Forgetting `@Param("status")` on the method parameter — the framework won't know how to bind the value
- Writing the parameter name after colon differently from the `@Param` value (e.g., `:jobStatus` vs `@Param("status")`)
- Omitting `DISTINCT` and getting duplicate companies in the result
- Omitting `FETCH` from `JOIN FETCH` and still getting N+1 queries
- Testing from the React dev UI and seeing double queries — always verify with Postman for accurate counts

## 💡 Pro Tips

- Throughout your project, you'll use this `@Query` + JPQL pattern frequently for any multi-table data fetching
- The JPQL query is validated at application startup — if you have a typo in the entity or field name, the app won't start (this is a feature, not a bug!)
- Copy your SQL logs after a fix and compare line counts — if they dropped from thousands to dozens, you know your optimization worked
- This pattern of `JOIN FETCH` is the go-to approach for loading entity graphs efficiently in JPA
