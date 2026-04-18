# Mapping Users & Roles Using JPA Entities and Repositories

## Introduction

Now that our database tables (`roles` and `users`) are ready, it's time to create the **Java representation** of those tables — the JPA Entity classes and Repository interfaces. This is where the object-relational mapping (ORM) magic happens: your Java objects become direct mirrors of your database tables.

We'll also create a **DTO** (Data Transfer Object) for accepting registration data from client applications.

---

## Creating the Role Entity

### 🧠 What Is It?

The `Role` entity maps directly to the `roles` table in the database. It tells JPA: "This Java class represents a row in the `roles` table."

### ⚙️ The Code

```java
@Entity
@Table(name = "roles")
public class Role extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    // Getters, Setters
}
```

### 🔍 Key Points

- **`extends BaseEntity`** — the `BaseEntity` contains the four audit columns (`created_at`, `created_by`, `updated_at`, `updated_by`), so we don't repeat them.
- **`@Id` + `@GeneratedValue(IDENTITY)`** — the database auto-generates the primary key.
- **`name`** — maps to the `name` column (stores role names like `ROLE_JOB_SEEKER`).

### What About `@AttributeOverrides`?

If your audit column definitions in `BaseEntity` match the database columns exactly, you **don't** need `@AttributeOverrides`. Only use it when you want to override something — like changing a column from `NOT NULL` to nullable.

---

## Creating the JobPortalUser Entity

### 🧠 What Is It?

This entity maps to the `users` table. We name it `JobPortalUser` instead of `User` to **avoid confusion** with Spring Security's built-in `User` class.

> Naming tip: When a framework already uses a common name like `User`, differentiate yours to prevent import conflicts and confusion.

### ⚙️ The Code

```java
@Entity
@Table(name = "users")
public class JobPortalUser extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String passwordHash;
    private String mobileNumber;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "role_id")
    private Role role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private CompanyEntity company;
    
    // Getters, Setters
}
```

### 🔍 Understanding the Relationship Mappings

#### `@ManyToOne` on `role`

- **Why Many-to-One?** — Many users can share the same role. You might have 10,000 users, but only 3 roles.
- **`fetch = FetchType.EAGER`** — When you load a user, **also load their role** immediately. Since it's a single child record, there's no performance concern.
- **`optional = false`** — Every user **must** have a role (matches the `NOT NULL` constraint in the DB).
- **`@JoinColumn(name = "role_id")`** — Tells JPA which column in the `users` table holds the foreign key.

#### `@ManyToOne` on `company`

- Multiple employer users can belong to the same company (e.g., multiple HR people at Amazon).
- **`@OnDelete(action = OnDeleteAction.SET_NULL)`** — If the parent company is deleted, set the `company_id` to `NULL` rather than cascading the delete to the user.

---

## Unidirectional vs. Bidirectional Relationships

### ❓ Why Didn't We Add `@OneToMany` in the Role Entity?

In a **bidirectional** mapping, you'd add this to `Role`:

```java
@OneToMany(mappedBy = "role")
private List<JobPortalUser> users;
```

But we **intentionally skipped** this. Why?

- We will **never** need to call `role.getUsers()` to fetch all users for a given role.
- Adding unnecessary bidirectional mappings increases complexity and can cause performance issues (think: loading 100,000 users just because you loaded a role).

> **Rule of thumb:** If you don't have a use case for navigating a relationship from both sides, keep it **unidirectional**.

```java
// Inside Role entity — commented out intentionally
// @OneToMany(mappedBy = "role")
// private List<JobPortalUser> users;
// OneToMany on role side is optional — no scenario to fetch all users by role
```

---

## Creating Repository Interfaces

### 🧠 What Are Repositories?

Repository interfaces give you **out-of-the-box** database operations (CRUD) without writing any SQL. Just extend `JpaRepository` and you get `save()`, `findById()`, `findAll()`, `delete()`, and more — for free.

### ⚙️ The Code

```java
public interface JobPortalUserRepository extends JpaRepository<JobPortalUser, Long> {
}

public interface RoleRepository extends JpaRepository<Role, Long> {
}
```

That's it. No implementation needed. Spring Data JPA generates everything at runtime.

---

## Creating the RegisterRequestDto

### 🧠 What Is It?

A **DTO** (Data Transfer Object) is a simple class that carries data between the client and server. It defines exactly what information the client needs to provide for registration.

### ⚙️ The Code

```java
public record RegisterRequestDto(
    @NotBlank String name,
    @NotBlank @Email String email,
    @NotBlank String password,
    @Pattern(regexp = "^[0-9]{10}$") String mobileNumber
) {}
```

### ❓ Why Only These Four Fields?

Looking at the `users` table, we have many columns. But the client only provides:

| Field          | Reason                                                    |
|---------------|-----------------------------------------------------------|
| `name`        | User enters their name                                    |
| `email`       | User enters their email (used as login username)          |
| `password`    | User enters a plain-text password (we hash it on backend) |
| `mobileNumber`| User enters their phone number                            |

What about the others?

| Field        | Why NOT from the Client?                                                                  |
|-------------|-------------------------------------------------------------------------------------------|
| `id`        | Auto-generated by the database                                                            |
| `role_id`   | Assigned by business logic (default: `ROLE_JOB_SEEKER`). Letting users choose = disaster  |
| `company_id`| Admin assigns this later after verifying the employer's company affiliation                |

---

## ✅ Key Takeaways

- Name your entity `JobPortalUser` (not `User`) to avoid conflicts with Spring Security's `User` class.
- Use `@ManyToOne` with `FetchType.EAGER` when you always need the related entity (role, company).
- Keep relationships **unidirectional** unless you have a concrete use case for bidirectional navigation.
- Repository interfaces extend `JpaRepository` — no implementation code needed.
- DTOs should only accept what the client **should** provide. Never expose internal fields like `role_id`.

## ⚠️ Common Mistakes

- **Using `User` as the entity name** — creates import conflicts with `org.springframework.security.core.userdetails.User`.
- **Adding bidirectional mappings everywhere** — leads to performance issues and circular loading.
- **Accepting `role_id` from the client** — users would assign themselves admin access.

## 💡 Pro Tips

- Use Java `record` classes for DTOs — they're immutable, concise, and perfect for data transfer.
- Always use `@JoinColumn` to explicitly name your foreign key columns — don't rely on JPA defaults.
- Set `FetchType.EAGER` cautiously: it's fine for single child records, but avoid it for large collections.
