# Meet JPA Buddy — Your Fastest Way to Generate JPA Code

## Introduction

So far, whenever we needed an entity class, a repository interface, or a DTO class, we've been typing everything manually. That works fine for learning — but in **enterprise applications** with hundreds of tables, manually typing entity classes is a painful and error-prone process.

Enter **JPA Buddy** — an IntelliJ plugin that can **auto-generate** entity classes, repository interfaces, and DTO classes from your database tables in seconds. Let's see how it works.

---

## Why Do We Need JPA Buddy?

### ❓ The Problem

Imagine working in an enterprise application with **hundreds** of database tables. For each table, you need to:

1. Create an entity class with all the fields
2. Add the correct annotations (`@Id`, `@GeneratedValue`, `@Column`, etc.)
3. Match data types between SQL columns and Java fields
4. Create a repository interface extending `JpaRepository`
5. Create DTO classes for the API layer

Doing this manually for 100+ tables? That's a recipe for errors and wasted time.

### ✅ The Solution

JPA Buddy automates all of this. Point it at a database table, and it generates the entity class, repository interface, and DTO class — all in seconds with the correct annotations and data types.

---

## Setting Up JPA Buddy

### Prerequisites

You need the **IntelliJ Premium version** for full functionality. However, some limited features are available in the free version too.

> 💡 Don't worry if you're using the free version — all entity class code is available in the **GitHub repo**. You'll never have to type it manually.

### Installing the Plugins

Go to **Settings → Plugins → Marketplace** and install two plugins:

1. **JPA Buddy** — the main plugin for entity generation
2. **Jakarta EE JPA Model** — companion plugin for JPA support

---

## Generating an Entity Class from a Database Table

### ⚙️ Step by Step

1. In IntelliJ Premium, click the **database icon** in `application.properties` to see your database connection
2. Expand the connection to see all tables
3. **Right-click** on the target table (e.g., `contacts`)
4. Select **"Create JPA Entities from Database"**

### 📝 The Generation Dialog

A pop-up appears where you configure:

| Setting | Value |
|---------|-------|
| **Target Package** | `entity` |
| **Class Name** | `Contact` |
| **Parent Class** | None |
| **ID Generation Strategy** | `IDENTITY` (recommended default) |

For each column, JPA Buddy shows:

- **Attribute name** — the Java field name
- **Mapping type** — `basic` for simple fields (we'll explore advanced relationships like `@ManyToOne` in future sections)
- **Data type** — the Java type (e.g., `Long`, `String`, `Instant`)

> You can modify any of these values, but the defaults are usually correct.

### 🧪 Result

Click **OK** and you instantly get a fully annotated entity class! Since we're using the **Lombok library**, it automatically adds `@Getter` and `@Setter` annotations instead of generating boilerplate getter/setter methods.

---

## Generating a Repository Interface

Once your entity class is open:

1. Look for the **JPA Designer** panel
2. Click the **+** (plus) symbol
3. Select **"Spring Data JPA Repository"**

### 📝 The Generation Dialog

| Setting | Value |
|---------|-------|
| **Entity Name** | `Contact` |
| **Repository Name** | `ContactRepository` |
| **Parent Interface** | `JpaRepository` |
| **Package** | `repository` |

Click **OK** and you get a repository interface that:
- Extends `JpaRepository`
- References the `Contact` entity
- Is ready to use — no manual coding needed

---

## Generating a DTO Class

With the entity class open:

1. Open **JPA Designer** → **New Actions**
2. Select **"DTO"**

### 📝 The Generation Dialog

| Setting | Value |
|---------|-------|
| **Package** | `dto` |
| **Domain Entity** | `Contact` |
| **DTO Name** | `ContactRequestDto` |
| **Type** | Java Record |

### Selecting Fields

Not all entity fields belong in the DTO. Since this DTO represents **incoming data from the UI**:

✅ Include: `name`, `email`, `userType`, `subject`, `message`

❌ Exclude:
- `id` — the UI doesn't know the ID when creating a new record
- `status` — defaults to `"NEW"` on the backend
- `createdAt`, `createdBy`, etc. — set by the backend, not the UI

By default, JPA Buddy uses the same field names in the DTO as in the entity. You can change them if needed.

### 🧪 Result

Click **OK** and you get a clean Java record class under the `dto` package with exactly the fields you selected.

---

## What JPA Buddy Can Generate — Summary

| Artifact | How |
|----------|-----|
| **Entity Class** | Right-click table → "Create JPA Entities from Database" |
| **Repository Interface** | JPA Designer → "Spring Data JPA Repository" |
| **DTO Class** | JPA Designer → "DTO" |

---

## Free Version vs Premium Version

| Feature | Free Version | Premium Version |
|---------|-------------|----------------|
| Some JPA Designer features | ✅ | ✅ |
| Entity generation from tables | ❌ | ✅ |
| Full Repository generation | Limited | ✅ |
| DTO generation | Limited | ✅ |

> 💡 Even if you're on the free version, you might get access to Premium in the future through your employer or if IntelliJ moves these features to the free tier. It's worth knowing these capabilities exist.

---

## ✅ Key Takeaways

- **JPA Buddy** is an IntelliJ plugin that auto-generates entity classes, repository interfaces, and DTO classes
- It reads your **database schema** and creates correctly annotated Java code in seconds
- The plugin requires **JPA Buddy** and **Jakarta EE JPA Model** plugins from the IntelliJ Marketplace
- You can choose which **fields to include** in generated DTOs — not everything from the entity belongs in the DTO
- Generated DTOs can be created as **Java Records** for cleaner, immutable data objects
- From now on in the course, JPA Buddy will be used to speed up code generation

## ⚠️ Common Mistakes

- Trying to use full JPA Buddy features in the free IntelliJ version — some features are Premium-only
- Including fields like `id` or `status` in request DTOs — these should be handled by the backend, not sent by the UI
- Forgetting to install **both** required plugins — JPA Buddy alone isn't enough

## 💡 Pro Tips

- Even if you can't use JPA Buddy, grab the generated code from the **GitHub repo** — no manual typing needed
- Always **review** generated code before using it — auto-generated doesn't mean perfect
- Use **Java Records** for DTOs when possible — they're immutable, concise, and don't need Lombok
- In enterprise projects, JPA Buddy can save **hours** of tedious boilerplate coding
