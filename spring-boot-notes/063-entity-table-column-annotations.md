# Creating Entity Classes — @Entity, @Table, @Column Annotations

## Introduction

We've learned what ORM is and how Spring Data JPA works behind the scenes. Now it's time to get hands-on. The **first step** in using Spring Data JPA is creating an **Entity class** — a Java class that represents a database table.

In this lecture, we'll walk through creating an Entity class for our `companies` table, exploring every JPA annotation along the way.

---

## What Is an Entity Class?

An Entity class is simply a **Java class that maps to a database table**. Each instance (object) of this class represents **one row** in the table. Each field in the class represents **one column** in the table.

> **Analogy:** If the database table is a spreadsheet, the Entity class is the template that describes what each row looks like. Each object of that class is one filled-in row.

---

## Step 1: Create the Entity Package

Following best practices, create a package specifically for entity classes:

```
com.easybytes.jobportal.entity
```

Why the name `entity`? Because that's exactly what these classes represent — database entities. You'll understand the significance once you see the `@Entity` annotation.

---

## Step 2: Create the Java Class

Create a class named `Company` (singular, **not** plural):

```java
public class Company {
    // fields go here
}
```

### Why singular, not "Companies"?

Because each object of this class represents **a single database record** — one company, not many. The table may be named `companies`, but the class represents a single entity within that table.

---

## Step 3: Add the @Entity Annotation

```java
@Entity
public class Company {
}
```

This annotation comes from `jakarta.persistence` package (JPA specification). It tells Spring Data JPA: *"Hey, this Java class represents a database table."*

Without `@Entity`, the framework has no idea this class is connected to a database.

---

## Step 4: Add the @Table Annotation

```java
@Entity
@Table(name = "COMPANIES")
public class Company {
}
```

The `@Table` annotation specifies **which database table** this class maps to.

### When is @Table required?

- If your **class name matches the table name** → `@Table` is optional
- If they **differ** (like `Company` class → `COMPANIES` table) → you **must** specify the `name` parameter

> **Best practice:** Always use `@Table(name = "...")` for clarity, even when names match. It improves code readability.

---

## Step 5: Define Fields with @Column

Each Java field maps to a database column. Here's the full breakdown:

### The Primary Key — @Id and @GeneratedValue

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "ID", nullable = false)
private Long id;
```

Let's break this down piece by piece:

| Annotation | Purpose |
|---|---|
| `@Id` | Marks this field as the **primary key** of the table |
| `@GeneratedValue` | Tells the framework **how** to generate primary key values |
| `@Column` | Maps this field to a specific database column |

### GenerationType Strategies

The `strategy` parameter in `@GeneratedValue` controls how primary key values are assigned:

| Strategy | How It Works | Best For |
|---|---|---|
| `IDENTITY` | Database auto-increment handles it (`AUTO_INCREMENT` in SQL) | MySQL, H2 |
| `SEQUENCE` | Uses a database sequence to generate values | PostgreSQL, Oracle |
| `TABLE` | Framework maintains a separate table for unique values | Cross-database portability |
| `UUID` | Generates a random UUID string (field must be `String` type) | Distributed systems |
| `AUTO` | Framework picks the best strategy for your database | When unsure |

> **Recommendation:** Use `IDENTITY` for MySQL (which we'll migrate to later). Use `AUTO` if you might switch databases in the future.

### Regular Columns

```java
@Column(name = "NAME", nullable = false, unique = true)
private String name;
```

Common `@Column` parameters:

| Parameter | Purpose | Default |
|---|---|---|
| `name` | Database column name | Same as field name |
| `nullable` | Allow NULL values? | `true` |
| `unique` | Enforce uniqueness? | `false` |
| `length` | Max length (for Strings) | `255` |

### When is @Column optional?

If your Java field name **exactly matches** the column name, `@Column` is optional. But it's **strongly recommended** for readability.

---

## Complete Entity Class — Field by Field

Here's what each field looks like with its database column mapping:

```java
@Entity
@Table(name = "COMPANIES")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @Column(name = "NAME", nullable = false, unique = true)
    private String name;

    @Column(name = "LOGO", length = 500)
    private String logo;

    @Column(name = "INDUSTRY")
    private String industry;

    @Column(name = "SIZE")
    private String size;

    @Column(name = "RATING", precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "LOCATIONS")
    private String locations;

    @Column(name = "FOUNDED")
    private Integer founded;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "EMPLOYEES")
    private Integer employees;

    @Column(name = "WEBSITE")
    private String website;

    @Column(name = "CREATED_AT", nullable = false)
    private Instant createdAt;

    @Column(name = "CREATED_BY", nullable = false, length = 20)
    private String createdBy;

    @Column(name = "UPDATED_AT")
    private Instant updatedAt;

    @Column(name = "UPDATED_BY", length = 20)
    private String updatedBy;
}
```

---

## Special Annotations Explained

### @Lob — For Large Objects

```java
@Lob
@Column(name = "DESCRIPTION")
private String description;
```

When a database column is of type `TEXT` (not restricted to a specific length like `VARCHAR`), use `@Lob` to indicate it's a **Large Object**. This tells the framework to handle it differently — allowing storage of much larger text data.

### Decimal Columns — precision and scale

```java
@Column(name = "RATING", precision = 3, scale = 2)
private BigDecimal rating;
```

- **precision = 3** → total number of digits (e.g., `4.75` has 3 digits)
- **scale = 2** → digits after the decimal point

Use `BigDecimal` (not `double` or `float`) for precise decimal values — especially for money and ratings.

### Timestamp Columns

```java
@Column(name = "CREATED_AT", nullable = false)
private Instant createdAt;
```

For `TIMESTAMP` columns in the database, use `java.time.Instant` as the Java data type.

### Naming Convention — CamelCase for Underscores

When column names have underscores (e.g., `created_at`), use **camelCase** in Java:

| Database Column | Java Field |
|---|---|
| `created_at` | `createdAt` |
| `created_by` | `createdBy` |
| `updated_at` | `updatedAt` |

---

## Nullable vs. Non-Nullable Fields

Not all columns are required. The distinction:

- **`nullable = false`** → Column is `NOT NULL` in the database (e.g., `id`, `name`, `createdAt`)
- **Default (`nullable = true`)** → Column allows NULL values (e.g., `updatedAt`, `updatedBy`)

Audit fields like `updatedAt` and `updatedBy` are nullable because they have no value when a record is first created.

---

## ✅ Key Takeaways

1. **@Entity** marks a class as a database table representation — always from `jakarta.persistence` package.
2. **@Table** specifies the actual table name — required when class name ≠ table name.
3. **@Id** marks the primary key field.
4. **@GeneratedValue** defines how primary key values are auto-generated (`IDENTITY` for MySQL).
5. **@Column** maps a field to a specific column — use `name`, `nullable`, `unique`, `length` parameters.
6. **@Lob** is for large text or binary data (TEXT columns).
7. Use **singular class names** (Company, not Companies) — each object = one row.
8. This is a **one-time setup per table** — every table needs a corresponding Entity class.

---

## ⚠️ Common Mistakes

- **Using plural class names** (e.g., `Companies`) — each object represents a single record, so use singular.
- **Forgetting @Id** on the primary key field — the framework won't know which field is the primary key.
- **Using `double` for decimal columns** — always use `BigDecimal` for precision.
- **Not matching column names correctly** — a mismatch between `@Column(name = "...")` and actual DB column names causes runtime errors.
- **Forgetting getter/setter methods** — the framework needs them to read and write field values (or use Lombok, which we'll learn soon).

---

## 💡 Pro Tips

- Use **CAPITAL LETTERS** for column and table names in `@Column(name = "...")` — makes SQL logs easier to read.
- `GenerationType.IDENTITY` is great for MySQL because it maps to `AUTO_INCREMENT`. For PostgreSQL, `SEQUENCE` is typically preferred.
- IntelliJ has plugins that can **auto-generate Entity classes** from database tables — we'll explore those later.
- Always create Entity classes under a dedicated `entity` (or `model`) package for clean project organization.
