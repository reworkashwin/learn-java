# From Zero to Mappings in Minutes — OneToMany & ManyToOne with JPA Buddy

## Introduction

Our `jobs` table is ready in the database. Now it's time to create the corresponding **Java entity class** and wire up the JPA relationship annotations. In this lecture, we'll use **JPA Buddy** (available in IntelliJ Premium) to generate entity classes with all the relationship configurations automatically. If you don't have the premium version — no worries, you can copy the code from the GitHub repo.

Let's see how fast you can go from a database table to a fully mapped entity.

---

## Generating the Job Entity Class

### Using JPA Buddy (IntelliJ Premium)

1. **Right-click** on the `jobs` table in IntelliJ's database panel
2. Select **"Create JPA Entities from Database"**
3. Configure the dialog:
   - **Target package**: Your entity package
   - **Class name**: `Job`
   - **Parent class**: `BaseEntity` (our reusable audit column class)
   - **ID generation**: `IDENTITY`

### What JPA Buddy Generates

Most columns get mapped to simple types (`Long`, `String`, `BigDecimal`, `Boolean`). But something interesting happens with the `company_id` column:

> JPA Buddy **recognizes** that `company_id` is a foreign key referencing the `companies` table, and automatically suggests the mapping type as **ManyToOne** with the data type as `Company`.

This is the power of a good tool — it reads your database schema and infers the correct relationship type.

### The Generated Job Entity

```java
@Entity
@Table(name = "jobs")
public class Job extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    // ... other columns with @Column annotations ...

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    // getters and setters
}
```

The key field here is `company` — not a `Long companyId`, but an actual **`Company` object**. This is the heart of JPA relationships.

---

## Creating the Inverse Side — OneToMany on Company

We generated the `Company` entity long ago, so it doesn't have any relationship annotations yet. JPA Buddy helps here too:

### Using JPA Buddy's Inverse Attribute Feature

1. Open the `Job` entity
2. Look for the small **icon** next to the `@ManyToOne` annotation
3. Click it → Select **"Create Inverse Attribute"**
4. Configure:
   - **Type**: `@OneToMany` (automatically selected — the inverse of ManyToOne)
   - **Orphan Removal**: ✅ Yes
   - **Cascade Type**: `ALL`
   - **Collection Type**: `List`
   - **Mapped By**: `company` (default)

### The Generated Code in Company Entity

```java
@Entity
@Table(name = "companies")
public class Company extends BaseEntity {

    // ... existing fields ...

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Job> jobs = new ArrayList<>();

    // getters and setters
}
```

---

## What Just Happened — The Big Picture

In just a few clicks, we established a **bi-directional relationship**:

```
Company Entity                    Job Entity
─────────────                    ──────────
@OneToMany          ←——→         @ManyToOne
List<Job> jobs                   Company company
mappedBy = "company"             @JoinColumn("company_id")
cascade = ALL                    fetch = LAZY
orphanRemoval = true             @OnDelete(CASCADE)
```

From the **Company**, you can access all its jobs via `getJobs()`.
From a **Job**, you can access its company via `getCompany()`.

---

## Summary of Annotations Introduced

| Annotation | Where | Purpose |
|-----------|-------|---------|
| `@ManyToOne` | Job entity | Many jobs belong to one company |
| `@OneToMany` | Company entity | One company has many jobs |
| `@JoinColumn` | Job entity | Specifies the foreign key column (`company_id`) |
| `@OnDelete` | Job entity | Database-level cascade delete behavior |
| `mappedBy` | Company entity | Points to the owning side's field name |
| `cascade` | Company entity | Cascade operations to child entities |
| `orphanRemoval` | Company entity | Auto-delete orphaned child records |

---

## ✅ Key Takeaways

- JPA Buddy can **auto-generate entity classes** from database tables with correct relationship annotations
- The **ManyToOne** side (Job) holds the foreign key → it **owns** the relationship
- The **OneToMany** side (Company) uses `mappedBy` to reference the owning side
- Key configurations include `cascade`, `orphanRemoval`, `fetch` type, and `@JoinColumn`
- Each annotation has a specific purpose — we'll deep-dive into all of them in the next lecture

---

## ⚠️ Common Mistake

> Don't confuse the `company_id` database column with a Java `Long` field. In JPA, foreign keys are mapped as **entity references** (e.g., `Company company`), not as raw IDs. JPA handles the translation between the object reference and the database column.

---

## 💡 Pro Tip

> Even if you don't use IntelliJ Premium, understanding what JPA Buddy generates is incredibly valuable. It teaches you what "correct" JPA mappings look like, so you can write them by hand with confidence.
