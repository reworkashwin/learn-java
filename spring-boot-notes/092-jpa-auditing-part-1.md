# Tracking Who Did What — Introduction to Spring JPA Auditing (Part 1)

## Introduction

In enterprise applications, production data is **sacred**. You need to know: *Who created this record? When was it last updated? Who made that change?* This is called **auditing**, and without it, there's no accountability — which can lead to serious business damage.

So far, we've been manually populating audit fields like `createdAt` and `createdBy` in our service layer. On top of that, we've been **repeating** these four audit fields in every entity class. Both of these are problems. In this lesson, we'll fix the repetition problem by creating a `BaseEntity` with `@MappedSuperclass`.

---

## Concept 1: The Repetition Problem

### 🧠 What is it?

In our application, every entity class (e.g., `Company`, `Contact`) has four audit-related fields:

- `createdAt` — when the record was created
- `createdBy` — who created it
- `updatedAt` — when it was last modified
- `updatedBy` — who modified it

These **same four fields** are copy-pasted into every entity class. By the end of a real project, you might have 20, 50, or even hundreds of entity classes. Copying these fields everywhere is a maintenance nightmare.

### ❓ Why does this matter?

- If you need to change the data type of `createdAt`, you'd have to update **every** entity class
- If you forget to add audit fields to a new entity, that table won't have proper tracking
- It violates the **DRY (Don't Repeat Yourself)** principle

### 💡 Insight

A great developer always looks for opportunities to **optimize and reduce repetition**. That's what separates professionals from beginners. The same code repeated in multiple places is a red flag.

---

## Concept 2: The Solution — BaseEntity with @MappedSuperclass

### 🧠 What is it?

We move all four audit fields into a **single parent class** called `BaseEntity`. All entity classes then **extend** this parent class, inheriting the audit fields automatically.

### ⚙️ How to implement it

**Step 1: Create the BaseEntity class**

```java
@Getter
@Setter
@MappedSuperclass
public class BaseEntity {

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(updatable = false)
    private String createdBy;

    @Column(insertable = false)
    private LocalDateTime updatedAt;

    @Column(insertable = false)
    private String updatedBy;
}
```

**Step 2: Extend BaseEntity in all entity classes**

```java
@Entity
public class Company extends BaseEntity {
    // Company-specific fields only — no audit fields needed!
    private Long id;
    private String name;
    // ...
}

@Entity
public class Contact extends BaseEntity {
    // Contact-specific fields only
    private Long id;
    private String email;
    // ...
}
```

### ❓ What does `@MappedSuperclass` do?

This annotation tells the framework two critical things:

1. **"This class is NOT an entity"** — Don't create a database table for `BaseEntity`
2. **"Its fields are inherited by child entities"** — Whatever entity extends this class, include these fields as part of THAT entity's table

So `Company extends BaseEntity` means the `company` table will have columns for `createdAt`, `createdBy`, `updatedAt`, `updatedBy` — even though those fields are defined in `BaseEntity`.

### 🧪 Real-world analogy

Think of `BaseEntity` as a **template** for a form. The template has a standard header section (date, author name). Every specific form (application form, complaint form, etc.) starts with this template and adds its own specific fields. The template is never used on its own — it only exists to be included in other forms.

### 💡 Insight

In real enterprise applications, this is a **standard practice**. Database administrators typically won't approve creating a table without audit columns. Having a `BaseEntity` ensures every table automatically gets them.

---

## Concept 3: Understanding Column Insert/Update Control

### 🧠 What is it?

We don't want **all four** audit fields updated during every operation:
- On **INSERT**: Only `createdAt` and `createdBy` should be populated
- On **UPDATE**: Only `updatedAt` and `updatedBy` should be populated

### ⚙️ How to control it

```java
@Column(updatable = false)    // ← NOT updated during UPDATE operations
private LocalDateTime createdAt;

@Column(updatable = false)    // ← NOT updated during UPDATE operations
private String createdBy;

@Column(insertable = false)   // ← NOT populated during INSERT operations
private LocalDateTime updatedAt;

@Column(insertable = false)   // ← NOT populated during INSERT operations
private String updatedBy;
```

| Field | `insertable` | `updatable` | Populated during INSERT? | Updated during UPDATE? |
|-------|-------------|-------------|--------------------------|------------------------|
| `createdAt` | `true` (default) | `false` | ✅ Yes | ❌ No |
| `createdBy` | `true` (default) | `false` | ✅ Yes | ❌ No |
| `updatedAt` | `false` | `true` (default) | ❌ No | ✅ Yes |
| `updatedBy` | `false` | `true` (default) | ❌ No | ✅ Yes |

### 💡 Insight

This is an important detail that many beginners miss. Without these settings, the framework would try to populate all four fields on every operation, leading to incorrect audit data. The `createdAt` should **never** change after the record is first created.

---

## ✅ Key Takeaways

1. **Don't repeat audit fields** in every entity class — use a `BaseEntity` parent class
2. **`@MappedSuperclass`** tells JPA: "This isn't an entity table, but its fields are inherited by child entities"
3. All entity classes should **extend `BaseEntity`** to inherit audit columns automatically
4. Use `@Column(updatable = false)` on created fields so they're never overwritten
5. Use `@Column(insertable = false)` on updated fields so they're not set during initial creation
6. This is a **standard practice** in enterprise applications — database admins expect audit columns on every table

## ⚠️ Common Mistakes

- Forgetting `@MappedSuperclass` → JPA tries to create a table for `BaseEntity`
- Not using `updatable = false` on `createdAt`/`createdBy` → these get overwritten on updates
- Not using `insertable = false` on `updatedAt`/`updatedBy` → these get set to null/default on insert
- Manually populating audit fields in business logic instead of letting the framework handle it (we'll fix this in Part 2)

## 💡 Pro Tips

- Every new entity class you create should extend `BaseEntity` — make it a habit
- Use `@Getter` and `@Setter` from Lombok on `BaseEntity` to avoid boilerplate
- The `BaseEntity` pattern works regardless of whether you use JPA auditing — it's purely about code organization
- Coming up in Part 2: we'll let Spring Data JPA **automatically** populate these fields
