# Unpacking JPA Mappings — The Full Story Behind OneToMany & ManyToOne

## Introduction

We've generated the entity classes with all the relationship annotations. But what does each configuration **actually mean**? Why is `mappedBy` on one side but `@JoinColumn` on the other? What's `orphanRemoval`? What's the difference between `fetch = LAZY` and `fetch = EAGER`?

This lecture unpacks **every single configuration** line by line. By the end, you won't just know *what* to write — you'll know *why*.

---

## The Company Side — @OneToMany Explained

```java
@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Job> jobs = new ArrayList<>();
```

Let's break this down piece by piece.

---

### 🧠 Why `List<Job>` and Not Just `Job`?

From the definition: **one** company can have **many** jobs. To hold "many" of anything in Java, you need a **collection**. That's why the field is `List<Job>`, not just `Job`.

When a `Company` object is created, it starts with an **empty** `ArrayList`. As jobs are associated with the company, they get added to this list.

---

### ⚙️ `mappedBy = "company"` — Who Owns the Relationship?

This is one of the most misunderstood configurations. Here's the key insight:

> `mappedBy` says: **"I don't own the foreign key. Go look at the other entity to find it."**

In our case:
- The `jobs` table has the `company_id` foreign key column
- The `companies` table does **not** have any job-related foreign key

So the `Company` entity says: *"The foreign key isn't in my table. Look at the `company` field inside the `Job` entity — that's where the foreign key lives."*

```
Company entity: mappedBy = "company"  →  "Go check Job.company field"
Job entity: @JoinColumn(name = "company_id")  →  "Here's the actual FK column"
```

### 📝 Rule

- The entity **without** the foreign key uses `mappedBy`
- The entity **with** the foreign key uses `@JoinColumn`

---

### ⚙️ `cascade = CascadeType.ALL` — Chain Reactions

With cascade, you're telling JPA:

> "If something happens to the parent (Company), do the same to its children (Jobs)."

**Example without cascade:**
```java
Company company = new Company();
Job job1 = new Job();
Job job2 = new Job();
company.getJobs().add(job1);
company.getJobs().add(job2);

companyRepository.save(company);  // Saves company ONLY
jobRepository.save(job1);         // Must save each job separately!
jobRepository.save(job2);
```

**Example with cascade:**
```java
companyRepository.save(company);  // Saves company AND all its jobs!
```

One line of code instead of three. The same applies to updates and deletes.

---

### ⚙️ `orphanRemoval = true` — Cleaning Up Abandoned Records

What happens when you remove a job from the list in Java code?

```java
company.getJobs().remove(someJob);
```

Without `orphanRemoval = true`: The job is removed from the Java list, but it **still exists in the database** — potentially as an orphan record with a null or invalid foreign key.

With `orphanRemoval = true`: JPA automatically **deletes** the removed job from the database too.

> Think of it like this: if a child (job) is removed from its parent's (company's) care, the orphan is cleaned up automatically.

---

### ⚙️ Why Initialize with `new ArrayList<>()`?

```java
private List<Job> jobs = new ArrayList<>();
```

This avoids `NullPointerException`. When you create a new `Company` object and call `getJobs().add(job)`, the list already exists. Without initialization, you'd need null checks everywhere.

---

## The Job Side — @ManyToOne Explained

```java
@NotNull
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@OnDelete(action = OnDeleteAction.CASCADE)
@JoinColumn(name = "company_id", nullable = false)
private Company company;
```

---

### ⚙️ `@NotNull` — Every Job Must Have a Company

This validation annotation ensures no job can be saved without a company reference. If someone tries `jobRepository.save(jobWithoutCompany)`, they'll get an error.

### ⚙️ `@ManyToOne` — The Relationship Type

Declares that **many** jobs belong to **one** company. The `optional = false` reinforces that the relationship is **mandatory**.

### ⚙️ `fetch = FetchType.LAZY` — Don't Load What You Don't Need

This is a **performance optimization**. We'll cover fetch types in detail in the next lecture, but the basic idea:

- **LAZY**: Don't load the company data when loading a job. Only fetch it **when `getCompany()` is called**.
- **EAGER**: Always load the company alongside the job.

### ⚙️ `@JoinColumn(name = "company_id", nullable = false)` — The Foreign Key Column

This tells Hibernate:

> "In the `jobs` table, there's a column called `company_id` that stores the reference to the company. This column cannot be null."

The entity with `@JoinColumn` is always the **owning side** of the relationship.

### ⚙️ `@OnDelete(action = OnDeleteAction.CASCADE)` — Database-Level Deletion

This is a **database instruction**, not a JPA/Hibernate instruction. It tells the database:

> "If a company row is deleted, automatically delete all job rows that reference it."

We'll explore this in detail in a dedicated lecture.

---

## Bi-Directional vs. Uni-Directional Relationships

### Bi-Directional (What We Have)

Both entities know about each other:
- `Company` has `@OneToMany` → can call `company.getJobs()`
- `Job` has `@ManyToOne` → can call `job.getCompany()`

Navigation works **both ways**.

### Uni-Directional

Only one entity knows about the relationship. Navigation works in **one direction only**.

For most real-world scenarios, **bi-directional** is preferred because it gives you maximum flexibility in your business logic.

---

## Who Owns the Relationship?

| Aspect | Owning Side (Job) | Inverse Side (Company) |
|--------|-------------------|----------------------|
| Has foreign key in DB? | ✅ Yes (`company_id`) | ❌ No |
| Uses `@JoinColumn`? | ✅ Yes | ❌ No |
| Uses `mappedBy`? | ❌ No | ✅ Yes |
| Controls the FK? | ✅ Yes | ❌ No |

### 📝 Rule

> The entity whose **table** holds the foreign key column is always the **owner** of the relationship.

---

## ✅ Key Takeaways

- `mappedBy` goes on the **inverse** side (the entity without the FK column)
- `@JoinColumn` goes on the **owning** side (the entity with the FK column)
- `cascade = CascadeType.ALL` creates a chain reaction — parent operations cascade to children
- `orphanRemoval = true` auto-deletes children removed from the parent's collection
- **Bi-directional** relationships allow navigation in both directions
- The entity with the **foreign key column** owns the relationship

---

## ⚠️ Common Mistakes

- **Putting `mappedBy` on the wrong side** — It always goes on the entity that does NOT have the foreign key
- **Forgetting to initialize the collection** — `List<Job> jobs = new ArrayList<>()` prevents null pointer issues
- **Confusing `cascade` with `@OnDelete`** — Cascade is a JPA instruction; `@OnDelete` is a database instruction (we'll cover this distinction soon)

---

## 💡 Pro Tip

> When reading any JPA relationship code, always start by identifying: **"Which table has the foreign key?"** That tells you the owning side, which tells you where `@JoinColumn` goes, which tells you where `mappedBy` goes. Everything flows from that one question.
