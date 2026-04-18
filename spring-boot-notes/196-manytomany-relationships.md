# Understanding @ManyToMany Relationships in JPA

## Introduction

So far in JPA, you've worked with `@OneToOne`, `@OneToMany`, and `@ManyToOne`. Now it's time for the fourth and final relationship type: **`@ManyToMany`**. It's also the **most complex** one — and the most commonly misunderstood.

We'll explore this through a real feature: a job seeker can **save multiple jobs**, and a single job can be **saved by multiple users**. Both sides have "many." That's the essence of `@ManyToMany`.

---

## What Is a @ManyToMany Relationship?

A `@ManyToMany` relationship exists when **both sides** can have multiple references to each other.

### In Our Application

- A **user** can save (favorite) **multiple jobs**
- A **job** can be saved by **multiple users**

### Real-World Analogy

Think of a **music streaming app**:
- A **song** can appear in **many playlists**
- A **playlist** contains **many songs**

Or think of **students and courses**:
- A **student** enrolls in **many courses**
- A **course** has **many students**

These are all `@ManyToMany` relationships.

---

## Why Do We Need a Join Table?

This is the most important concept to understand. You might ask: "Can't we just add a column to the `users` table to store saved job IDs? Or a column to `jobs` to store user IDs?"

Let's see why that **doesn't work**.

### The Problem with No Join Table

Imagine User 12 saves Job 1 and Job 2. If you try to store this in the `jobs` table:

| job_id | title | ... | user_id |
|--------|-------|-----|---------|
| 1 | Java Dev | ... | 12 |
| 2 | Python Dev | ... | 12 |

Now User 13 also saves Job 1 and Job 2:

| job_id | title | ... | user_id |
|--------|-------|-----|---------|
| 1 | Java Dev | ... | 12 |
| 1 | Java Dev | ... | 13 |
| 2 | Python Dev | ... | 12 |
| 2 | Python Dev | ... | 13 |

See the problem? You're **duplicating entire job rows** just to store a different `user_id`. In real applications, tables have 50-100 columns. Duplicating all that data for one column is wasteful, error-prone, and makes queries painfully slow.

### The Solution: A Join Table

Create a **third table** that only stores the relationship:

**`saved_jobs` (Join Table):**

| user_id | job_id |
|---------|--------|
| 12 | 1 |
| 12 | 2 |
| 13 | 1 |
| 13 | 2 |

Now:
- **No data duplication** — the actual job and user data lives in their respective tables
- **Clean relationship tracking** — the join table stores only foreign keys
- **Query efficiency** — "Which jobs did User 12 save?" → `SELECT job_id FROM saved_jobs WHERE user_id = 12`

> Think of the join table as a **guest list** at a party. It doesn't contain information about the guests (that's in the `users` table). It doesn't contain information about the party (that's in the `events` table). It just says "who's attending what."

---

## Why Not @OneToMany?

You might think: "Can't I use `@OneToMany` from users to jobs?"

`@OneToMany` means: one user maps to many jobs, but **each job belongs to only one user**. That's wrong for our case — a job can be saved by **multiple users**. `@OneToMany` would mean only one person can ever save a job.

`@ManyToMany` is the only relationship that says: "Both sides can have multiple."

---

## How It Works in the Database

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  users   │     │  saved_jobs  │     │   jobs   │
├──────────┤     ├──────────────┤     ├──────────┤
│ id (PK)  │◄────│ user_id (FK) │     │ id (PK)  │
│ name     │     │ job_id  (FK) │────►│ title    │
│ email    │     └──────────────┘     │ company  │
└──────────┘                          └──────────┘
```

The join table connects both main tables through **foreign keys**. It has no entity class of its own — JPA manages it automatically.

---

## JPA Configuration — The Owning Side

In every `@ManyToMany`, one entity is the **owning side** and the other is the **inverse side**.

### Who Owns the Relationship?

The entity that **controls inserts and deletes** in the join table. In our case, the **user saves or unsaves jobs** — so `JobPortalUser` is the owning side.

### Owning Side Configuration (`JobPortalUser`)

```java
@ManyToMany
@JoinTable(
    name = "saved_jobs",
    joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "job_id")
)
private Set<Job> savedJobs = new HashSet<>();
```

Breaking it down:

| Annotation/Property | Purpose |
|---------------------|---------|
| `@ManyToMany` | Declares the relationship type |
| `@JoinTable(name = "saved_jobs")` | Names the join table |
| `joinColumns = @JoinColumn(name = "user_id")` | The FK column linking to **this** entity (User) |
| `inverseJoinColumns = @JoinColumn(name = "job_id")` | The FK column linking to the **other** entity (Job) |

### Why `Set` Instead of `List`?

A `Set` automatically prevents **duplicate entries**. If you accidentally try to add the same job twice, the `Set` silently ignores it. A `List` would happily allow duplicates, leading to data integrity issues.

### Why Initialize with `new HashSet<>()`?

Without initialization, the field is `null`. When JPA tries to `add()` a job to a `null` set, you get a `NullPointerException`. Initializing with `new HashSet<>()` ensures it's always ready to use.

---

## JPA Configuration — The Inverse Side

### Inverse Side Configuration (`Job`)

```java
@ManyToMany(mappedBy = "savedJobs")
private Set<JobPortalUser> savedByUsers = new HashSet<>();
```

The `mappedBy = "savedJobs"` tells JPA: "The `JobPortalUser` entity owns this relationship through its `savedJobs` field. I'm just the mirror."

---

## CRUD Operations with @ManyToMany

### Saving a Job (Insert into Join Table)

```java
JobPortalUser user = userRepository.findById(userId);
user.getSavedJobs().add(job);  // Add job to the set
userRepository.save(user);     // Hibernate inserts into saved_jobs table
```

Behind the scenes, Hibernate runs:
```sql
INSERT INTO saved_jobs (user_id, job_id) VALUES (12, 1);
```

### Unsaving a Job (Delete from Join Table)

```java
user.getSavedJobs().remove(job);
userRepository.save(user);
```

Hibernate runs:
```sql
DELETE FROM saved_jobs WHERE user_id = 12 AND job_id = 1;
```

### Getting Saved Jobs for a User

```java
JobPortalUser user = userRepository.findByEmail(email);
Set<Job> savedJobs = user.getSavedJobs();  // Lazy loaded
```

The default fetch type is `LAZY` — jobs aren't loaded until you call `getSavedJobs()`. This is efficient.

---

## Best Practices

### Avoid `CascadeType.ALL`

```java
// ❌ DANGEROUS
@ManyToMany(cascade = CascadeType.ALL)
private Set<Job> savedJobs;

// ✅ SAFE
@ManyToMany
private Set<Job> savedJobs;
```

With `CascadeType.ALL`, deleting a user would **delete all associated jobs** — including jobs that other users saved or that employers created. This is catastrophic.

### Join Table Must Be Simple

`@ManyToMany` only works when the join table has **exactly two columns** — the two foreign keys. No extra data. If you need extra columns (like `saved_at` timestamp, `notes`, `status`), you **cannot** use `@ManyToMany`. We'll discuss the alternative in a later lecture.

---

## ✅ Key Takeaways

1. **`@ManyToMany`** = both sides can have multiple references to each other
2. **A join table is mandatory** — it stores only the foreign key pairs, no data duplication
3. **Owning side** uses `@JoinTable` with `joinColumns` and `inverseJoinColumns`
4. **Inverse side** uses `@ManyToMany(mappedBy = "fieldName")`
5. **Use `Set`**, not `List` — prevents duplicates
6. **Initialize with `new HashSet<>()`** — avoids `NullPointerException`
7. **Never use `CascadeType.ALL`** with `@ManyToMany` — it can cascade deletes to unrelated data
8. **Join table = two columns only** — if you need extra columns, `@ManyToMany` won't work
9. **Default fetch type is `LAZY`** — efficient, loads data only when accessed
