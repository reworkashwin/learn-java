# When NOT to Use @ManyToMany in JPA

## Introduction

`@ManyToMany` is powerful — but it has a **strict limitation**. It only works when the join table has **exactly two columns** (the two foreign keys). The moment you need extra columns — like a status, a timestamp, a cover letter — `@ManyToMany` falls apart. This lecture explains **why**, shows the alternative approach, and walks through a real implementation for the Job Application feature.

---

## The Scenario: Job Applications

A user can **apply to multiple jobs**, and a job can be **applied to by multiple users**. Sounds like `@ManyToMany`, right?

But here's the catch. When a user applies, we need to store:

| Column | Purpose |
|--------|---------|
| `user_id` | Who applied |
| `job_id` | Which job |
| `applied_at` | When they applied |
| `status` | PENDING → REVIEWED → SHORTLISTED → OFFERED / REJECTED / WITHDRAWN |
| `cover_letter` | Optional cover letter text |
| `notes` | Internal notes by the employer |
| `created_at`, `updated_at` | Audit timestamps |

That's **seven extra columns** beyond just `user_id` and `job_id`. And `@ManyToMany` can't handle any of them.

---

## Why @ManyToMany Can't Handle Extra Columns

### The Core Problem

When you use `@ManyToMany`, JPA treats the join table as a **dumb link** between two entities. It has:
- ❌ **No entity class** — so there's no Java object to hold extra fields
- ❌ **No lifecycle** — you can't use `@PrePersist`, `@PreUpdate`, or auditing
- ❌ **No repository** — you can't query the join table directly
- ❌ **No business logic** — you can't track status changes or timestamps

JPA literally assumes the join table looks like this:

```
saved_jobs
├── user_id (FK)
└── job_id  (FK)
```

And nothing else. If you try to add a `status` column... where would it go? Which entity would own it? There's no entity class for `saved_jobs`.

### Comparison Table

| Feature | @ManyToMany | Separate Entity |
|---------|-------------|-----------------|
| Entity class for join table? | ❌ No | ✅ Yes |
| Extra columns? | ❌ No | ✅ Yes |
| Business logic columns (status)? | ❌ No | ✅ Yes |
| Auditing (created_at, updated_at)? | ❌ No | ✅ Yes |
| Custom queries on join table? | ❌ No | ✅ Yes |
| Repository interface? | ❌ No | ✅ Yes |
| Lifecycle control? | ❌ No | ✅ Yes |

The pattern is clear: `@ManyToMany` = simple link only. Extra columns = you need a proper entity.

---

## The Alternative: Break `@ManyToMany` into Two `@ManyToOne` Relationships

Instead of `@ManyToMany`, create a **dedicated entity class** for the join table and use two `@ManyToOne` relationships.

### The Database Table

```sql
CREATE TABLE job_applications (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id      BIGINT NOT NULL,
    job_id       BIGINT NOT NULL,
    applied_at   DATETIME,
    status       VARCHAR(50) DEFAULT 'PENDING',
    cover_letter TEXT,
    notes        TEXT,
    created_at   DATETIME,
    updated_at   DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id)  REFERENCES jobs(id),
    UNIQUE KEY (user_id, job_id)
);
```

Notice the **unique constraint** on `(user_id, job_id)` — a user can apply to a job only once.

### The Entity Class

```java
@Entity
@Table(name = "job_applications")
public class JobApplication extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private JobPortalUser user;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    private LocalDateTime appliedAt;
    private String status;

    @Lob
    private String coverLetter;

    @Lob
    private String notes;

    // Getters and setters...
}
```

### Why `@ManyToOne`?

Think about it from the join table's perspective:
- **Many** job application records belong to **one** user → `@ManyToOne` for user
- **Many** job application records belong to **one** job → `@ManyToOne` for job

The join table entity has **two `@ManyToOne`** relationships — one pointing to each parent.

### The Inverse Sides

In `JobPortalUser`:

```java
@OneToMany(mappedBy = "user")
private Set<JobApplication> jobApplications = new HashSet<>();
```

In `Job`:

```java
@OneToMany(mappedBy = "job")
private Set<JobApplication> jobApplications = new HashSet<>();
```

Since the `JobApplication` entity has `@ManyToOne` pointing to each parent, the parents use `@OneToMany(mappedBy = "...")` to complete the bidirectional mapping.

---

## The Repository

```java
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    void deleteByUserIdAndJobId(Long userId, Long jobId);

    List<JobApplication> findByUserIdOrderByAppliedAtDesc(Long userId);
}
```

Unlike `@ManyToMany` (where the join table has **no repository**), here we have a **full repository** with custom derived queries:

1. **`existsByUserIdAndJobId`** — check if a user already applied (prevent duplicates)
2. **`deleteByUserIdAndJobId`** — withdraw an application
3. **`findByUserIdOrderByAppliedAtDesc`** — fetch all applications for a user, sorted by newest first

---

## CRUD Operations

### Applying for a Job

```java
JobApplication application = new JobApplication();
application.setUser(user);
application.setJob(job);
application.setAppliedAt(LocalDateTime.now());
application.setStatus("PENDING");
application.setCoverLetter(coverLetter);

jobApplicationRepository.save(application);  // Explicit save required!
```

Unlike `@ManyToMany` where Hibernate tracks changes automatically, here the `JobApplication` object **is not tracked** — we created it with `new`. We must call `save()` manually.

### Withdrawing an Application

```java
jobApplicationRepository.deleteByUserIdAndJobId(userId, jobId);
```

### Getting Applied Jobs

```java
JobPortalUser user = userRepository.findByEmail(email);
Set<JobApplication> applications = user.getJobApplications();
```

---

## When to Use What — The Decision Framework

Ask yourself this question about the join table:

> **Does it have any columns beyond the two foreign keys?**

- **No** → Use `@ManyToMany` (e.g., saved_jobs: just user_id + job_id)
- **Yes** → Create a separate entity with two `@ManyToOne` relationships (e.g., job_applications: user_id + job_id + status + applied_at + ...)

A second question:

> **Does the relationship have its own identity, lifecycle, or business meaning?**

- A "saved job" has no lifecycle — it's just a link. → `@ManyToMany` ✅
- A "job application" has a status, progresses through stages, gets audited → Separate entity ✅

---

## ✅ Key Takeaways

1. **`@ManyToMany` is only for pure link tables** — exactly two FK columns, nothing else
2. **Extra columns = can't use `@ManyToMany`** — create a dedicated entity instead
3. **Two `@ManyToOne`** in the join entity replaces one `@ManyToMany`
4. **The join entity gets its own repository** — enabling custom queries, auditing, and lifecycle control
5. **Explicit `save()` is required** for new entity objects (unlike tracked entities in `@ManyToMany`)
6. **The join table entity has a unique constraint** on `(user_id, job_id)` to prevent duplicates
7. **Ask: "Does this relationship have extra data or a lifecycle?"** If yes, use a separate entity
8. **`@OneToMany(mappedBy = "...")` on parent entities** completes the bidirectional mapping
