# Section Overview — Authorization & Data Handling

## Introduction

So far in our job portal application, we've only implemented **authentication** — verifying *who* the user is. But here's the thing: just because someone has logged in doesn't mean they should be able to do *everything*. An admin should see admin pages, and a regular user shouldn't be able to snoop around admin-only data.

This section introduces three powerful concepts:
1. **Authorization** — Role-based access control for your REST APIs
2. **Sorting** — Returning data in a meaningful, ordered fashion
3. **Pagination** — Breaking large datasets into manageable chunks

Let's take a bird's-eye view of what we're going to build.

---

## What Are We Building?

### 🧠 The Contact Messages Feature

Imagine you're an **admin** of a job portal. Users submit contact messages — questions, complaints, technical issues. As an admin, you need a dedicated page to:

- **View** all contact messages received
- **Sort** them by name, date, or any field
- **Paginate** through them (10 per page, 25 per page, etc.)
- **Close** messages once they've been resolved

The key twist? **Only admin users** should be able to access these APIs. If a regular job seeker tries to hit the admin endpoint, they should get an error — not data.

---

## The Three Pillars of This Section

### 1. Authorization — Who Can Do What?

Right now, any authenticated user can access any secured API. That's a problem. We need to enforce **role-based access**:

- Admin → Can access contact message APIs
- Regular User → Gets rejected with a 403 Forbidden error

This is where Spring Security's authorization mechanisms come in — methods like `hasRole()`, `hasAuthority()`, and more.

### 2. Sorting — Order Matters

When you fetch contact messages from the database, they come back in a random, unpredictable order. That's not useful. Users should be able to sort by:

- Name (A → Z or Z → A)
- Date created
- Any field they choose

Spring Data JPA makes this easy with its `Sort` class and derived query methods.

### 3. Pagination — Don't Send Everything at Once

What if there are 10,000 contact messages? Sending all of them in one API response is a terrible idea:

- **Backend** has to load and transmit massive amounts of data
- **Network** gets clogged with unnecessary traffic
- **Frontend** struggles to render thousands of records

Instead, we'll send data in **pages** — 10 records at a time, 25 at a time — whatever the user requests. The frontend displays page numbers, and each page triggers a fresh backend request.

---

## How It All Comes Together

Here's the flow:

1. Admin logs in → Gets a JWT token with `ROLE_ADMIN`
2. Admin navigates to Contact Messages page
3. Frontend sends a request: "Give me page 1, 10 records, sorted by date ascending"
4. Backend checks: Does this user have `ROLE_ADMIN`? ✅ Yes → Return the data
5. If a regular user tries the same request → ❌ 403 Forbidden

The sorting and pagination parameters come from the frontend as **query parameters**, giving the client full control over how data is displayed.

---

## ✅ Key Takeaways

- **Authentication** answers "Who are you?" — **Authorization** answers "What can you do?"
- Sorting and pagination are **essential** for any production application dealing with large datasets
- Spring Data JPA provides built-in support for both sorting and pagination — no need to write raw SQL with `LIMIT` and `OFFSET`
- All three concepts (authorization, sorting, pagination) will be implemented on the **backend side**

## 💡 Pro Tip

> Even if you're not building a frontend, you can test all these features using **Postman**. The section covers both UI testing and API testing approaches.
