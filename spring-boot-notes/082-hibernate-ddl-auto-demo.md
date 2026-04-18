# Hands-On Demo — How Hibernate Changes Your Database

## Introduction

We've learned the theory behind `spring.jpa.hibernate.ddl-auto` and all its valid values. Now it's time to see it **in action**. In this hands-on demo, we'll use the `validate` and `update` values to observe how Hibernate interacts with our database — validating schemas, auto-fixing mismatches, and even creating entire tables from entity classes.

---

## Setting Up for the Demo

### Project Setup

Since we're in a new section, we need a fresh workspace:

1. Create a new **section folder** inside the workspace
2. Copy the **backend project** from the previous section into this new folder
3. Open the project in IntelliJ

### ⚠️ Prerequisites

- Make sure **Docker Desktop** is running — without it, the database container can't be started by Spring Boot
- Start your Spring Boot backend application
- Verify the database container is running in Docker Desktop

> Once your backend is running, the UI homepage should display all the company data again.

---

## Demo 1: Using `validate` — The Schema Inspector

### ⚙️ What we're doing

Let's add the property to `application.properties`:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

With `validate`, Hibernate will **compare** your entity classes against the database schema on startup. If there's any mismatch, it throws errors — but it won't change anything in the database.

### 🧪 What happened?

After restarting the application with `validate`, we got a **startup error**!

The error said something like:

> Under the table `companies`, there is a column `description` with data type `TEXT`, but Hibernate expects `TINYTEXT`.

Here's why: In the `Company` entity class, the `description` field uses `String` with the `@Lob` annotation (Long Object). The `@Lob` annotation tells Hibernate that this field should map to `TINYTEXT` — but in our actual database, the column type was `TEXT`.

> 🔍 This is `validate` doing its job — it found a mismatch and **refused to start** the application until the issue is resolved.

---

## Demo 2: Using `update` — The Auto-Fixer

### ⚙️ What we're doing

Let's change the property to `update`:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Now instead of just reporting problems, Hibernate will **fix them**.

### 🧪 What happened?

After restarting with `update`, Hibernate:

1. **Detected** the same mismatch (the `description` column type)
2. **Generated an ALTER command** to modify the table
3. **Changed** the `description` column from `TEXT` to `TINYTEXT`

If you check the database now, the `description` column has been updated to `TINYTEXT`.

> 💡 **Pro Tip:** Since Hibernate enforced a standard on our database, we should also update our SQL schema script to use `TINYTEXT` instead of `TEXT` — keeping our script and database in sync.

---

## Demo 3: Creating an Entire Table from an Entity Class

This is where it gets really powerful. What if we create a **brand new entity class** — will Hibernate create the corresponding database table automatically?

### Step 1: Create the `Contact` Entity Class

Under the `entity` package, create a new class called `Contact`:

```java
@Entity
@Table(name = "contacts")
@Getter
@Setter
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    @Column(name = "user_type")
    private String userType;

    private String subject;

    private String message;

    @ColumnDefault("'NEW'")
    private String status;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;
}
```

### 🧠 Understanding the fields

| Field | Purpose |
|-------|---------|
| `id` | Primary key, auto-generated using `IDENTITY` strategy |
| `name`, `email`, `userType`, `subject`, `message` | Correspond to the Contact Us form fields |
| `status` | Defaults to `"NEW"` — tracks whether the message has been handled |
| `createdAt`, `createdBy`, `updatedAt`, `updatedBy` | Audit columns for tracking who created/modified the record and when |

> 💡 The `status` field will be used later when we build an **admin functionality** — the admin can view all new messages and close them once handled.

### Step 2: Restart with `update`

Make sure `spring.jpa.hibernate.ddl-auto=update` is set. Restart the application.

### 🧪 What happened?

Hibernate detected that the `Contact` entity has **no corresponding table** in the database. So it automatically **created the `contacts` table** with all the columns matching the entity fields!

Before the restart, we had **one table** (`companies`). After the restart, we have **two tables** (`companies` and `contacts`).

> If you don't see the new table in your database tool, try **refreshing** the connection.

---

## After the Demo — Best Practice

Once you're done experimenting, **set the property back to `none`** (or comment it out):

```properties
# spring.jpa.hibernate.ddl-auto=none
```

Since we're using MySQL, the default is already `none`, so commenting it out achieves the same effect. This ensures Hibernate won't interfere with your database schema during normal development.

---

## ✅ Key Takeaways

- `validate` **checks** your entity-to-database mapping and **throws errors** on mismatch — it never modifies the database
- `update` **detects mismatches** and **auto-fixes** them by running ALTER/CREATE statements
- Hibernate can create **entire tables** from entity classes when using `update` — no SQL scripts needed
- The `@ColumnDefault` annotation sets the default value **at the database schema level**, not at the record level
- Always **reset to `none`** after experimenting to keep your database safe

## ⚠️ Common Mistakes

- Forgetting to have **Docker Desktop** running before starting the Spring Boot application
- Leaving `update` or `create` enabled in production — always switch to `none` when not experimenting
- Not refreshing the database connection after Hibernate creates new tables — the table exists, you just can't see it yet
- Confusing `@ColumnDefault` behavior — it affects the **table definition**, not individual `INSERT` statements

## 💡 Pro Tips

- After Hibernate enforces a schema change (like `TEXT` → `TINYTEXT`), **update your SQL scripts** to stay in sync
- The `create` and `create-drop` values weren't demoed because they would **drop the companies table and all its data** — be careful!
- Use `validate` as a safety checkpoint to verify your entities match the database before deploying to staging/production
- Audit columns (`createdAt`, `createdBy`, etc.) are a best practice — they help track data changes over time
