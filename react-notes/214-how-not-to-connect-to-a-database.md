# How (Not) To Connect To A Database

## Introduction

So you need to connect your React app to a database. Sounds straightforward, right? Just grab the database credentials, connect, and query. **Wrong.** This is one of the most important security lessons in frontend development, and getting it wrong can compromise your entire application.

Let's understand *why* you should never connect directly to a database from React, and *what* you should do instead.

---

## The Cardinal Rule: Never Connect Directly

Here's the thing that every React developer must internalize:

> **All your React code runs in the user's browser. Users can see it, inspect it, and read every line.**

Open DevTools in any website. Go to the Sources tab. There's the JavaScript code, right there. If your React code contains database credentials — connection strings, passwords, API keys — those are visible to **every visitor** of your website.

### What Could Go Wrong?

If a user extracts your database credentials, they can:
- **Delete all your data**
- **Insert fake or malicious data**
- **Read sensitive user information**
- **Completely compromise your application**

Beyond security, there are also **technical limitations**. Browser-based code can't:
- Directly access file systems on servers
- Open raw database connections (most databases use protocols that browsers don't support)
- Perform operations that require server-level permissions

---

## The Correct Architecture: Use a Backend

Instead of connecting directly, you use a **backend server as a middleman**:

```
[React App in Browser]  ──HTTP Requests──▶  [Backend Server]  ──▶  [Database]
     (PUBLIC code)                          (PRIVATE code)        (PRIVATE data)
```

### Why This Works

- **Backend code is invisible to users** — only you, the developer, have access to the server
- **The backend controls what's allowed** — it exposes specific endpoints (URLs) that accept specific types of requests
- **Database credentials stay on the server** — never exposed to the browser
- **You define the rules** — the backend decides which requests to accept and which to reject

### How It Works in Practice

Your React app sends an **HTTP request** to the backend:

```
React App: "Hey backend, give me the list of products"
   ──GET /api/products──▶
Backend: "Sure, here's the data"
   ◀──[{ id: 1, name: "Widget" }, ...]──
```

The backend then queries the database, processes the data, and sends back only what the frontend needs. The frontend never sees the database, never has credentials, never runs SQL queries.

---

## Key Concepts to Understand

### Endpoints
URLs on your backend that accept specific types of requests. For example:
- `GET /api/products` — fetch all products
- `POST /api/orders` — create a new order
- `PUT /api/users/5` — update user with ID 5

### HTTP Methods
Different types of requests for different operations:
- **GET** — retrieve data
- **POST** — create new data
- **PUT** — update existing data
- **DELETE** — remove data

### Backend Can Be Any Language
React uses JavaScript, but your backend can be built with:
- **Node.js** (JavaScript on the server)
- **Python** (Django, Flask, FastAPI)
- **Java** (Spring Boot)
- **C#** (.NET)
- **PHP** (Laravel)
- Any language that can handle HTTP requests

### Full-Stack Frameworks
Frameworks like **Next.js** and **Remix** let you blend frontend and backend in one project while still keeping server code secure and inaccessible to users. This is covered later in the course.

---

## ✅ Key Takeaways

- React code runs in the browser — users can see everything
- **Never put database credentials in your React code**
- Use a backend server as a secure middleman between React and your database
- The backend exposes endpoints that control what operations are allowed
- Communication happens via HTTP requests (GET, POST, PUT, DELETE)
- The backend can be built with any server-side language

## ⚠️ Common Mistakes

- **Hardcoding API keys or database URLs in React code** — they'll be visible in the browser's DevTools
- **Thinking "it's okay because users won't look"** — automated bots scan for exposed credentials constantly
- **Trying to use database drivers (like MongoDB or PostgreSQL clients) in React** — they don't work in browsers

## 💡 Pro Tip

Even when using environment variables in React (like `REACT_APP_API_KEY`), those values are **baked into the build** and still visible to users. Environment variables in frontend projects are NOT secret. Only backend environment variables are truly secure.
