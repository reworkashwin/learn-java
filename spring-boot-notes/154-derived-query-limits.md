# Limits of Derived Queries — When Method Names Stop Working

## Introduction

So far, derived query methods have been our trusty tool for querying data — just name a method correctly and Spring Data JPA writes the SQL for you. But what happens when your requirements get more complex? What if you need data from **multiple tables** with custom filtering conditions?

In this lesson, we face a real-world defect in our application and discover that **derived query methods have limits**. This sets the stage for learning more powerful query techniques like `@Query` with JPQL.

---

## The Defect — Displaying Closed Jobs on the Homepage

### 🧠 What's the Problem?

Our application displays companies and their associated jobs on the homepage. Right now, the backend returns **all** jobs from the database — including jobs with a `CLOSED` status.

Here's the data setup:
- **1000 jobs** in the `jobs` table
- **998 jobs** have the status `ACTIVE`
- **2 jobs** have the status `CLOSED`
- **30 companies** in the `companies` table

The homepage is supposed to show only **active** jobs. If a company has zero active jobs, that company shouldn't appear either.

### ❓ Why Is This Happening?

Inside `CompanyServiceImpl`, we're calling `findAll()` from `CrudRepository`:

```java
companyRepository.findAll();
```

This method fetches **every company and every associated job** — no filtering at all. It doesn't know we only care about `ACTIVE` jobs.

---

## Why Can't Derived Query Methods Solve This?

### 🧠 The Core Limitation

Derived query methods work beautifully for **single-table queries**. But our requirement involves **two tables**:

1. **Companies table** — we want to fetch company records
2. **Jobs table** — we want to filter by the `status` column

The `status` column doesn't exist in the `companies` table — it's in the `jobs` table.

### ⚙️ What Happens When You Try?

If you go to `CompanyRepository` and try to create a method like:

```java
List<Company> findCompaniesByStatus(String status);
```

Spring Data JPA looks for a `status` field in the `Company` entity. It doesn't find one. The auto-complete in your IDE will only suggest columns from the **companies table** — things like `size`, `id`, `createdAt`.

### What About `findCompaniesByJobs`?

You might notice IntelliJ suggests methods like `findCompaniesByJobs(List<Job> jobs)`. But this expects you to **pass in a list of Job objects** — it's designed for scenarios where you already have the jobs and want to find which companies they belong to.

Our requirement is the opposite: we want to fetch companies and **filter their associated jobs** by status. Completely different use case.

### 💡 The Key Insight

> **Derived query methods are designed for simple, single-table queries.** The moment you need to query across multiple tables with custom join conditions and filters, derived methods simply can't express your intent.

---

## When Do Derived Query Methods Work Well?

| Scenario | Works? |
|---|---|
| Find users by email | ✅ Single table, simple filter |
| Find products by category and price range | ✅ Single table, multiple filters |
| Find companies with only active jobs | ❌ Multi-table with child filtering |
| Complex joins with custom conditions | ❌ Beyond derived method capability |

---

## ✅ Key Takeaways

- Derived query methods are **great for simple, single-table queries**
- They **cannot express complex joins** across multiple tables
- They **cannot filter child entity data** (e.g., filtering jobs while fetching companies)
- They don't support SQL concepts like `FETCH JOIN`, `LEFT JOIN`, or `RIGHT JOIN`
- When you hit these limits, you need the `@Query` annotation with JPQL or native SQL — which we cover in upcoming lessons

## ⚠️ Common Mistakes

- Trying to force complex multi-table requirements into derived query method names — the method name becomes unreadable and doesn't work anyway
- Assuming that derived query methods can access fields from related entities through associations
- Ignoring the defect and returning all records to the frontend, letting the UI do the filtering (this wastes bandwidth and is a security concern)

## 💡 Pro Tips

- If your method name is getting longer than about 3–4 keywords, it's a signal that derived queries might not be the right tool
- Always think about what tables are involved — if it's more than one, consider `@Query` with JPQL
- This is not a limitation of Spring Data JPA itself — it provides `@Query` for exactly these situations
