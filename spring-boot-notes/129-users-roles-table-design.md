# Designing Users & Roles Tables for Secure Database Authentication

## Introduction

Up until now, we've been storing user credentials **in memory** using `InMemoryUserDetailsManager`. That's fine for demos and quick prototypes — but it's absolutely **not production-ready**. In the real world, user credentials must live inside a proper database, and users need the ability to register their own accounts.

In this lesson, we lay the foundation for real-world authentication by designing the **database tables** that will hold user and role information. Think of this as building the blueprint before constructing the house.

---

## Why In-Memory Authentication Falls Short

Why can't we keep using `InMemoryUserDetailsManager`?

- **No persistence** — if the application restarts, all users vanish.
- **No self-registration** — users can't create their own accounts.
- **No scalability** — you can't manage thousands of users in application memory.
- **Security risk** — credentials are hardcoded or baked into config files.

> It's like locking your house door but leaving the key taped to the doorframe. Sure, there's a lock — but it's not really doing its job.

---

## Designing the Roles Table

### 🧠 What Is It?

A **roles table** stores all the possible roles that users can have inside your application. Each role defines what level of access a user gets.

### ⚙️ Table Structure

```sql
CREATE TABLE roles (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP,
    updated_by VARCHAR(255)
);
```

| Column       | Purpose                            |
|-------------|------------------------------------|
| `id`        | Primary key (auto-generated)       |
| `name`      | The role name (e.g., `ROLE_ADMIN`) |
| `created_at`, `created_by`, `updated_at`, `updated_by` | Audit columns |

The only **meaningful** column here is `name` — everything else is administrative.

### 🧪 Inserting Role Data

For our Job Portal application, we define three roles:

```sql
INSERT INTO roles (name) VALUES ('ROLE_JOB_SEEKER');
INSERT INTO roles (name) VALUES ('ROLE_EMPLOYER');
INSERT INTO roles (name) VALUES ('ROLE_ADMIN');
```

#### What Each Role Means

| Role               | Who Uses It?           | What Can They Do?                              |
|--------------------|-----------------------|------------------------------------------------|
| `ROLE_JOB_SEEKER`  | Regular users          | Browse and apply for jobs                      |
| `ROLE_EMPLOYER`    | HR / Company reps      | Post new jobs for their company                |
| `ROLE_ADMIN`       | Website administrators | Manage users, upgrade roles, oversee the site  |

> In enterprise applications, you might see hundreds of roles. For learning purposes, three is more than enough.

---

## Designing the Users Table

### 🧠 What Is It?

The **users table** stores the actual user accounts — their name, email, hashed password, and which role they belong to.

### ⚙️ Table Structure

```sql
CREATE TABLE users (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    name          VARCHAR(255),
    email         VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    mobile_number VARCHAR(15),
    role_id       BIGINT NOT NULL,
    company_id    BIGINT,
    created_at    TIMESTAMP,
    created_by    VARCHAR(255),
    updated_at    TIMESTAMP,
    updated_by    VARCHAR(255),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

### 🔍 Column Breakdown

| Column          | Purpose                                                                 |
|----------------|-------------------------------------------------------------------------|
| `id`           | Auto-generated primary key                                              |
| `name`         | Full name of the user                                                   |
| `email`        | Unique email (used as username for login)                               |
| `password_hash`| Hashed version of the password (never store plain text!)                |
| `mobile_number`| User's phone number                                                    |
| `role_id`      | Foreign key → `roles` table. **NOT NULL** — every user must have a role |
| `company_id`   | Foreign key → `companies` table. **Nullable** — only for employers      |

### ❓ Why Is `role_id` NOT NULL But `company_id` Is Nullable?

- Every user **must** have a role — you can't have a user floating around with no permissions.
- `company_id` only matters for employers. A job seeker doesn't belong to any company. The admin will assign a company to employers later.

### 💡 Why `password_hash` Instead of `password`?

The column is named `password_hash` because we **never** store passwords in plain text. We store the **bcrypt hash**. This naming convention makes it explicit — if you see `password_hash`, you know it's already hashed.

---

## How Roles and Users Relate

```
roles (1) ←————— (Many) users
```

- One role can be assigned to **many** users.
- Each user has **exactly one** role.
- This is a classic **One-to-Many** relationship (from roles to users), or **Many-to-One** (from users to roles).

For example:
- `ROLE_JOB_SEEKER` could be assigned to 10,000 users.
- Each of those 10,000 users has exactly one role: `ROLE_JOB_SEEKER`.

---

## The Default Registration Flow

When a new user registers through the client application:

1. They provide: name, email, password, mobile number.
2. The backend assigns `ROLE_JOB_SEEKER` as the **default role**.
3. If a user wants an elevated role (employer or admin), they must work with an admin behind the scenes.

> You never let users choose their own role. Otherwise, everyone would pick "Admin" and chaos would ensue!

---

## ✅ Key Takeaways

- **In-memory authentication** is only for demos — always use a database for production.
- The **roles table** defines available permission levels in the system.
- The **users table** stores credentials with hashed passwords and a foreign key to the roles table.
- `role_id` is **NOT NULL** — every user must have a role.
- `company_id` is **nullable** — it's only relevant for employer users.
- Default role for new registrations is `ROLE_JOB_SEEKER`.

## ⚠️ Common Mistakes

- **Storing plain text passwords** — always hash them before storing.
- **Not making `role_id` a required column** — users without roles lead to security holes.
- **Letting users choose their own role** — always assign a default role from business logic.

## 💡 Pro Tips

- Name your roles with the `ROLE_` prefix (e.g., `ROLE_ADMIN`) — Spring Security expects this convention.
- Keep audit columns (`created_at`, `updated_at`, etc.) on all tables for traceability.
- Use SQL scripts for table creation so they can be version-controlled and shared across environments.
