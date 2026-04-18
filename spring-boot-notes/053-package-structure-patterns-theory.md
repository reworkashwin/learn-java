# Package Structure Patterns in Spring Boot — Theory

## Introduction

You've learned how to build REST APIs with Spring annotations. Now it's time to level up — because in real enterprise applications, **how you organize your code matters just as much as what your code does**.

Think about it: if you just dump all your classes into one package, your project will quickly become an unreadable mess. That's fine for a tiny demo — but the moment your project grows, you'll be lost in a sea of files.

This lecture focuses on the **package structure patterns** that professional developers follow when building Spring Boot backend applications. We'll explore two popular approaches — **by layer** and **by feature/domain** — and understand when to use each.

---

## Setting the Stage — The Job Portal Project

Before diving into package structure, let's understand the context. We're building a backend REST API for a **Job Portal** UI application. This UI displays company details — logos, employee counts, open positions, ratings, and categories.

As a backend developer, your job is to:
1. Expose a REST API that fetches company details from a database
2. Send that data to the UI application

To build this, we create a fresh Spring Boot project from **start.spring.io** with these dependencies:
- **Spring Web** — for building REST APIs and getting an embedded Tomcat server
- **Spring Boot DevTools** — for developer productivity (auto-restart, live reload)
- **H2 Database** — a fast, in-memory database for quick development
- **Spring Data JPA** — interfaces and classes to interact with any SQL database (Oracle, Postgres, MySQL, H2)

Once generated, the project comes with a standard structure: a root package (`com.easybytes.jobportal`), an `application.properties` file, `static/` and `templates/` folders (which we won't use since we're building a pure backend application).

---

## The Golden Rule — Main Class at the Root Package

Before you create any sub-packages, there's one fundamental rule:

> **Always keep your Spring Boot main class at the root package.**

Why? Because Spring Boot uses **component scanning** to automatically discover your beans, controllers, services, and repositories. It scans from the main class's package **downward**. If your main class is buried in a sub-package, Spring Boot won't find components in sibling or parent packages.

```
com.easybytes.jobportal          ← Main class goes HERE
    ├── company/
    ├── user/
    └── config/
```

💡 **Pro Tip:** The root package name is derived from the `groupId` + `artifactId` you provide when generating the project. So `com.easybytes` (group) + `jobportal` (artifact) = `com.easybytes.jobportal`.

---

## Approach 1 — Package by Layer (Traditional)

### 🧠 What is it?

In this approach, you organize your code based on **technical roles** — what each class *does* technically.

```
com.easybytes.jobportal
    ├── controller/       ← All REST controllers
    ├── service/          ← All business logic
    ├── repository/       ← All database interaction
    ├── entity/           ← All POJO/table-mapping classes
    ├── exception/        ← All custom exceptions
    └── config/           ← All configuration classes
```

Every controller — whether it handles companies, jobs, users, or admin — goes into the same `controller/` package. Same for services, repositories, etc.

### ❓ Why do developers use it?

It's the oldest and simplest approach. Developers have been using this for **two to three decades**. When you see a `controller/` package, you immediately know it contains REST-facing logic. When you see `repository/`, you know it's database code.

### ✅ Advantages

- Easy to understand
- Great for **small to medium projects**
- Beginner-friendly — everyone recognizes the pattern

### ⚠️ Disadvantages

- **Hard to scale** for large enterprise applications
- Business logic for one feature is **spread across multiple packages** — the company controller is in `controller/`, the company service is in `service/`, the company repository is in `repository/`
- When a new team member needs to understand the "company" feature, they have to jump across five different packages

Think of it like organizing a library by book format (hardcover shelf, paperback shelf, audiobook shelf) instead of by topic. If you want everything about "cooking," you'd have to visit three different shelves.

---

## Approach 2 — Package by Feature / Domain (Recommended)

### 🧠 What is it?

In this approach, you organize your code based on **business domains or features** — what each part of your application *represents* in the real world.

```
com.easybytes.jobportal
    ├── company/
    │   ├── controller/
    │   ├── service/
    │   ├── repository/
    │   ├── entity/
    │   └── dto/
    ├── job/
    │   ├── controller/
    │   ├── service/
    │   ├── repository/
    │   ├── entity/
    │   └── dto/
    └── user/
        ├── controller/
        ├── service/
        └── ...
```

First, you identify your **domains** — company, job, user. Then under each domain, you create the technical sub-packages.

### ❓ What is a "domain"?

A domain is a **business functionality** of your application. If you take a bank as an example, your domains might be: accounts, cards, loans, marketing, sales. Each business department or entity is a domain.

### ✅ Advantages

- **High modularity** — all company-related logic stays inside the `company/` package
- Easy to maintain and scale
- **Easier team collaboration** — the team working on "jobs" only touches the `job/` package
- Supports **Domain-Driven Design** (DDD)
- Multiple teams can work independently on different packages

### ⚠️ Disadvantages

- Requires slightly more **initial planning** — you need to identify your domains upfront
- More sub-packages to create initially

Think of it like organizing that library by topic (cooking section, history section, science section). Everything about "cooking" — hardcover, paperback, audiobook — is in one place.

---

## Supporting Packages — Beyond Domains

Regardless of which approach you choose, you'll always need some **cross-cutting packages** that don't belong to any single domain:

| Package | Purpose |
|---------|---------|
| `config/` | Application-level configurations (security, web, etc.) |
| `common/` | Reusable helper classes, interfaces, utilities |
| `security/` | Authentication and authorization logic |
| `exception/` | Global exception handling |
| `util/` | General utility methods |

These packages sit alongside your domain packages at the root level.

---

## Naming Conventions

When creating packages, follow these rules:

1. **All lowercase** — `company`, not `Company`
2. **Singular for domain names** — `company`, not `companies`
3. **Consistent naming** across the entire application — if you use `controller` in one domain, use `controller` everywhere (not `controllers` or `ctrl`)

---

## ✅ Key Takeaways

- Always keep the **main class at the root package** for component scanning to work
- **By Layer** = organize by technical role → good for small/medium projects
- **By Feature/Domain** = organize by business domain → recommended for enterprise apps and microservices
- The "by feature" approach provides **high modularity, better team collaboration, and easier scaling**
- Always create **supporting packages** (config, common, exception) alongside domain packages
- Follow **lowercase, singular, consistent** naming conventions

---

## ⚠️ Common Mistakes

- Putting the main class inside a sub-package instead of the root — breaks component scanning
- Using plural names for domain packages (`companies` instead of `company`)
- Mixing approaches — using "by layer" for some features and "by feature" for others
- Creating packages without thinking about domains first

---

## 💡 Pro Tips

- Spring Boot **does not enforce** any package structure — but following clean architecture practices makes your project scalable and maintainable
- The "by feature" approach is the **standard recommendation** for large enterprise applications and microservices
- Start identifying your domains early — it saves refactoring pain later
- Even if you start small, adopting the "by feature" approach from day one sets you up for growth
