# Configuring @ManyToMany Relationships in JPA Entities

## Introduction

In the previous lecture, we learned the **theory** behind `@ManyToMany` — why we need a join table, how the owning and inverse sides work, and the database design. Now it's time to **implement it** in our actual Job Portal code. We'll create the `saved_jobs` join table, configure the JPA annotations on both entity classes, and see the complete setup in action.

---

## Step 1: Creating the Join Table in SQL

```sql
CREATE TABLE saved_jobs (
    user_id BIGINT NOT NULL,
    job_id  BIGINT NOT NULL,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id)  REFERENCES jobs(id)
);
```

### Key Design Decisions

#### Composite Primary Key

The primary key is `(user_id, job_id)` — a **composite primary key** using two columns. This guarantees that the same user can't save the same job twice at the database level. Even if your application code has a bug, the database won't allow duplicates.

#### Only Two Columns

The join table has **only** `user_id` and `job_id` — nothing else. This is a strict requirement for `@ManyToMany`. If you needed extra columns (like `saved_at` timestamp), you'd have to use a different approach (which we'll cover later).

#### Foreign Key Constraints

Both columns reference their parent tables:
- `user_id` → `users.id`
- `job_id` → `jobs.id`

This ensures **referential integrity** — you can't save a reference to a user or job that doesn't exist.

---

## Step 2: Configuring the Owning Side — `JobPortalUser`

The user initiates the "save job" action, so `JobPortalUser` is the **owning side**.

```java
@Entity
@Table(name = "users")
public class JobPortalUser extends BaseEntity {

    // ... existing fields ...

    @OneToOne(mappedBy = "user")
    private Profile profile;

    @ManyToMany
    @JoinTable(
        name = "saved_jobs",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "job_id")
    )
    private Set<Job> savedJobs = new HashSet<>();

    // ... getters and setters ...
}
```

### Breaking Down the Configuration

#### `@ManyToMany`

Declares that this entity participates in a many-to-many relationship with the `Job` entity.

#### `@JoinTable`

Since this is the **owning side**, we specify the join table details:

- **`name = "saved_jobs"`** — the physical table name in the database
- **`joinColumns = @JoinColumn(name = "user_id")`** — the column in the join table that references **this** entity (`JobPortalUser`). Think: "How does the join table reference ME?"
- **`inverseJoinColumns = @JoinColumn(name = "job_id")`** — the column in the join table that references the **other** entity (`Job`). Think: "How does the join table reference the OTHER side?"

💡 **Pro Tip:** A simple way to remember: `joinColumns` = "my side", `inverseJoinColumns` = "the other side."

#### `Set<Job> savedJobs = new HashSet<>()`

- **`Set`** over `List` to prevent duplicates
- **Initialized** with `new HashSet<>()` to avoid null pointer issues
- **Field name `savedJobs`** is important — the inverse side will reference this name

---

## Step 3: Configuring the Inverse Side — `Job`

```java
@Entity
@Table(name = "jobs")
public class Job extends BaseEntity {

    // ... existing fields ...

    @ManyToMany(mappedBy = "savedJobs")
    private Set<JobPortalUser> savedByUsers = new HashSet<>();

    // ... getters and setters ...
}
```

### What's Different from the Owning Side?

| Aspect | Owning Side (User) | Inverse Side (Job) |
|--------|-------------------|-------------------|
| Annotation | `@ManyToMany` + `@JoinTable` | `@ManyToMany(mappedBy = "...")` |
| Controls join table? | ✅ Yes | ❌ No |
| Has `@JoinTable`? | ✅ Yes | ❌ No |
| `mappedBy`? | ❌ No | ✅ Yes |

The `mappedBy = "savedJobs"` reference must match the **exact field name** in `JobPortalUser`. If you named it `savedJobs` in `JobPortalUser`, then `mappedBy = "savedJobs"`. If you accidentally write `mappedBy = "jobs"`, JPA won't find the mapping and will throw an error.

⚠️ **Common Mistake:** Misspelling the `mappedBy` value. It must match the field name in the owning entity **exactly** — case-sensitive.

---

## No Entity Class for the Join Table

This is a crucial point. Unlike the `Profile` entity (which maps to the `profiles` table), the `saved_jobs` table does **not** get its own entity class.

JPA manages the join table **automatically** based on the `@JoinTable` configuration. It knows:
- The table name
- Which columns map to which entities
- How to insert, delete, and query

You never write a `SavedJob.java` entity class. You never create a `SavedJobRepository`. JPA handles everything through the `savedJobs` field on `JobPortalUser`.

---

## Using IntelliJ JPA Buddy (Optional)

If you have IntelliJ Premium, the JPA Buddy plugin can auto-generate these configurations:

1. Right-click on the `users` table in the database view
2. Select **"Create entity attributes from database"**
3. Under references, select the `jobs` relationship
4. JPA Buddy recommends `@ManyToMany` — accept it
5. Rename the generated field from `jobs` to `savedJobs` for clarity

Repeat for the `Job` entity — JPA Buddy adds the inverse-side `@ManyToMany(mappedBy = "savedJobs")` automatically.

If you don't have JPA Buddy, just type the annotations manually — it's only a few lines.

---

## Verifying the Setup

After making these changes:

1. **Restart your application** — let JPA validate the mappings
2. **Check for errors** — if there's a mapping mismatch, JPA throws detailed error messages at startup
3. **Verify the join table** — it should exist in the database with the correct columns and constraints

If the application starts without errors, your `@ManyToMany` configuration is correct.

---

## ✅ Key Takeaways

1. **Join table SQL** needs only two FK columns and a composite primary key — nothing more
2. **Owning side** uses `@ManyToMany` + `@JoinTable` with `joinColumns` and `inverseJoinColumns`
3. **Inverse side** uses `@ManyToMany(mappedBy = "fieldName")` — no `@JoinTable`
4. **`joinColumns`** = "how does the join table reference ME"; **`inverseJoinColumns`** = "how does it reference the OTHER side"
5. **No entity class** is created for the join table — JPA manages it automatically
6. **`mappedBy` value** must exactly match the field name on the owning side (case-sensitive)
7. **Use `Set<>` initialized with `new HashSet<>()`** on both sides
8. The field name you choose (`savedJobs`, `savedByUsers`) becomes part of the API — choose meaningful names
