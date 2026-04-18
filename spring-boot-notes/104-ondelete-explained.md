# @OnDelete Explained — What Really Happens When the Parent Is Deleted

## Introduction

We've seen `CascadeType.REMOVE` and `orphanRemoval`. Now there's a *third* delete-related configuration: `@OnDelete`. At first glance, it looks like they all do the same thing — delete child records when something happens to the parent. But they're **fundamentally different**, and understanding the distinction is crucial for real-world development.

The key question: **Who is responsible for the deletion — your Java application or the database itself?**

---

## What is @OnDelete?

### 🧠 The Core Idea

`@OnDelete` is a Hibernate annotation that tells the **database directly** to handle deletions. It corresponds to the `ON DELETE` clause in SQL.

```java
@OnDelete(action = OnDeleteAction.CASCADE)
```

This maps to the SQL you already wrote when creating the table:

```sql
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
```

> With `@OnDelete`, you're not asking Hibernate to delete the children. You're asking the **database engine** to do it.

---

## The @OnDelete Action Constants

| Constant | Database Behavior |
|----------|------------------|
| `CASCADE` | Automatically **delete** all child rows when the parent is deleted |
| `NO_ACTION` | Do **nothing** to child rows. May cause FK constraint violation later in the transaction |
| `RESTRICT` | **Immediately block** the parent deletion if any children exist |
| `SET_NULL` | Set the foreign key column to **NULL** in child rows (FK column must be nullable) |
| `SET_DEFAULT` | Set the foreign key column to its **default value** in child rows |

### Example Scenarios

**CASCADE**: Delete Company 1 → All jobs with `company_id = 1` are auto-deleted by the DB.

**RESTRICT**: Try to delete Company 1 → Database says "No! There are 50 jobs linked to this company. Delete them first."

**SET_NULL**: Delete Company 1 → All jobs with `company_id = 1` still exist, but their `company_id` becomes `NULL`. They become orphaned jobs with no company.

---

## @OnDelete vs. CascadeType.REMOVE — The Critical Difference

This is what trips up most developers. Both delete child records, but at **different levels**:

| Aspect | `@OnDelete` | `CascadeType.REMOVE` |
|--------|-------------|---------------------|
| **Who deletes?** | The **database** | **Hibernate/JPA** (Java code) |
| **Where defined?** | Database schema (`ON DELETE CASCADE`) | Application code (JPA annotation) |
| **Performance** | **Faster** — DB handles it directly | **Slower** — extra Java layer involved |
| **Works without JPA?** | ✅ Yes — it's a DB rule | ❌ No — only works via Hibernate |
| **Manual DB deletion?** | ✅ Still works | ❌ Won't trigger — Hibernate not involved |

### The Key Scenario

Imagine someone connects to the database **directly** (via SQL tool, not through your Java app) and runs:

```sql
DELETE FROM companies WHERE id = 1;
```

- With `@OnDelete(CASCADE)`: The database automatically deletes all jobs for company 1. ✅
- With only `CascadeType.REMOVE`: The database throws a **foreign key constraint violation** because Hibernate wasn't involved to handle the cascade. ❌

---

## Why We Have Three Delete Mechanisms

You might wonder: "Aren't we being redundant with three delete-related configurations?" Not at all. Each one handles a **different scenario**.

### Scenario 1: Deleting the Parent via Java Code

```java
companyRepository.delete(company);  // Parent deletion via Hibernate
```

**CascadeType.REMOVE** kicks in → Hibernate deletes all child jobs automatically.
`orphanRemoval` doesn't apply here (no orphaning; the parent is being destroyed).

### Scenario 2: Removing a Child from the Parent's Collection

```java
company.getJobs().remove(someJob);  // Removing one job from the list
// OR
someJob.setCompany(null);           // Breaking the relationship
```

**orphanRemoval = true** kicks in → Hibernate detects the orphaned job and deletes it from the database.
`CascadeType.REMOVE` doesn't apply here (the parent isn't being deleted).

### Scenario 3: Direct Database Deletion (No Hibernate Involved)

```sql
-- Someone runs this directly in a SQL client
DELETE FROM companies WHERE id = 1;
```

**@OnDelete(CASCADE)** kicks in → The database itself deletes all jobs with `company_id = 1`.
Neither `CascadeType.REMOVE` nor `orphanRemoval` applies (Hibernate isn't running).

### Scenario 4: A Developer Forgets Cascade Configurations

Maybe a new developer removes `CascadeType.ALL` from the Company entity and then calls:

```java
companyRepository.delete(company);
```

Without cascade, Hibernate won't delete the jobs. But if `@OnDelete(CASCADE)` exists, when Hibernate issues the `DELETE FROM companies WHERE id = 1` SQL, the **database** still cleans up the child rows.

This is your **safety net**.

---

## Summary: When Each Mechanism Is Used

```
┌─────────────────────────────────────────────────────┐
│        Delete Parent via Java Code                  │
│        → CascadeType.REMOVE handles it              │
├─────────────────────────────────────────────────────┤
│        Remove Child from Parent's Collection        │
│        → orphanRemoval = true handles it            │
├─────────────────────────────────────────────────────┤
│        Direct DB Deletion / Safety Net              │
│        → @OnDelete(CASCADE) handles it              │
└─────────────────────────────────────────────────────┘
```

None of these are duplicates. They cover different flavors of deletion.

---

## Where to Place @OnDelete

`@OnDelete` belongs on the **owning side** of the relationship — the entity that has the foreign key column.

Since `jobs` has the `company_id` foreign key, `@OnDelete` goes on the `Job` entity:

```java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@OnDelete(action = OnDeleteAction.CASCADE)
@JoinColumn(name = "company_id", nullable = false)
private Company company;
```

---

## ✅ Key Takeaways

- `@OnDelete` is a **database-level** instruction — it tells the DB what to do on parent deletion
- `CascadeType.REMOVE` is a **Hibernate-level** instruction — it tells JPA what to do
- `orphanRemoval` handles the case where a child is **removed from the parent's collection**
- All three mechanisms handle **different scenarios** — none are redundant
- `@OnDelete` acts as a safety net even when Hibernate isn't involved
- Always place `@OnDelete` on the **owning side** (the entity with the foreign key)

---

## ⚠️ Common Mistakes

- **Thinking @OnDelete and CascadeType.REMOVE are the same** — They work at completely different levels (database vs. application)
- **Using SET_NULL when the FK column is NOT NULL** — This will cause a constraint violation
- **Relying only on CascadeType.REMOVE** — If someone deletes data directly in the DB, your cascade won't trigger

---

## 💡 Pro Tip

> In production systems, it's a best practice to have **both** `CascadeType.REMOVE` (for Hibernate-managed operations) **and** `@OnDelete(CASCADE)` (for database-level safety). This gives you a double layer of protection against orphan records, regardless of how deletions happen.
