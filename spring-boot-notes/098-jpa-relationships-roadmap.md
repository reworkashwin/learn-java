# JPA Relationships Roadmap — What You'll Build in This Section

## Introduction

So far in our Job Portal application, we've been displaying only **company details**. But think about it — what good is a job portal without actual **job listings**? In this section, we're going to change that completely. By the end of this section, our backend will serve both company data **and** job data, all tied together using one of the most powerful features in Spring Data JPA — **relationships**.

This lecture gives you a complete roadmap of what's coming. Let's see the big picture before diving in.

---

## What We're Building

### 🎯 The Goal

We want our Job Portal to:

1. **Display job listings** — By default, show 6 jobs, with a "Load More" button to reveal more (out of 1,000 total jobs)
2. **Show job details** — Clicking on a job takes you to a detail page showing the title, location, pay, description, requirements, and which **company** posted it
3. **Link jobs to companies** — Every job belongs to a company. Clicking the company name shows the company's profile, including all job openings they've posted

This isn't just two separate lists. The data is **connected** — and that's the key concept for this entire section.

---

## Why We Need Relationships

### 🧠 The Problem: Tables Can't Be Independent

Right now, we have a `companies` table. We need to create a `jobs` table. But here's the thing — **the jobs table can't just exist on its own**.

Why? Because every job is posted by a company. If we create an independent `jobs` table, there's no way to know which job belongs to which company.

### 🔗 The Solution: Foreign Key References

Think of it this way:

- **Amazon** is stored in the `companies` table with `id = 1`
- **Jobs posted by Amazon** are stored in the `jobs` table, each with a `company_id = 1`

```
companies table:
| id | name   | founded | locations     |
|----|--------|---------|---------------|
| 1  | Amazon | 1994    | Seattle, ...  |

jobs table:
| id  | title           | company_id | location  |
|-----|-----------------|------------|-----------|
| 101 | Java Developer  | 1          | Seattle   |
| 102 | Cloud Architect | 1          | Remote    |
| 103 | DevOps Engineer | 1          | New York  |
```

The `company_id` column in `jobs` is a **foreign key** — it links each job row to a specific company row. Without this link, our data would be meaningless.

---

## The Traditional Approach vs. Spring Data JPA

### ❌ Without Spring Data JPA

If you weren't using Spring Data JPA, fetching all jobs for a company would require writing **SQL join queries** manually:

```sql
SELECT j.* FROM jobs j
JOIN companies c ON j.company_id = c.id
WHERE c.name = 'Amazon';
```

Writing, maintaining, and debugging these queries across an entire application quickly becomes **cumbersome**.

### ✅ With Spring Data JPA Relationships

Spring Data JPA offers a concept called **relationships**. Instead of writing SQL joins yourself:

1. You **configure** the relationship between entities using annotations
2. Spring Data JPA **generates** the SQL for you behind the scenes
3. You write your business logic in **pure Java** — no SQL needed

> You tell JPA "these two tables are related," and JPA handles all the heavy lifting.

---

## What's Coming in This Section

Here's the roadmap of what we'll cover:

| Lecture | Topic |
|---------|-------|
| 1 | Understanding entity relationships (OneToOne, OneToMany, ManyToOne, ManyToMany) |
| 2 | Creating the `jobs` table and loading 1,000 test records |
| 3 | Generating entity classes with JPA Buddy (OneToMany & ManyToOne) |
| 4 | Deep dive into all mapping configurations |
| 5 | Fetch types vs. Cascade types — two concepts you must never confuse |
| 6 | `@OnDelete` explained — what really happens at the database level |
| 7 | Full implementation — DTO, Service, Controller, and testing |

---

## ✅ Key Takeaways

- Our Job Portal needs **related data** — companies and jobs aren't independent
- The `jobs` table will use a **foreign key** (`company_id`) to link back to the `companies` table
- Without Spring Data JPA, you'd write complex **join queries** manually
- With JPA relationships, you configure annotations and let the framework **generate SQL** for you
- You'll write business logic in **Java code only** — JPA does the rest

---

## 💡 Pro Tip

> This section is all about **backend changes**. We won't touch the UI — our focus is on the data layer and how Spring Data JPA manages table relationships. The UI is already built to consume whatever our backend sends.

---

## ⚠️ Common Mistake

> Don't think of database tables as isolated boxes. In real-world applications, **most tables are related** to other tables. Understanding how to model these relationships in JPA is one of the most important skills for a backend developer.
