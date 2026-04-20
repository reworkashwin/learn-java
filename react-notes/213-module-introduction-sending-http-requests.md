# Module Introduction: Sending HTTP Requests

## Introduction

Up to this point in the course, every project worked with **local data** — hardcoded arrays, dummy objects, data stored right inside the React project. That works for demos, but real-world applications need something more powerful.

Think about it: if you're building Facebook, Amazon, or even a simple to-do app with multiple users, the data can't live inside each user's browser. Different users on different computers need to access, modify, and share the same data. That requires a **central server** and a **database**.

This module introduces one of the most critical skills in React development: **sending HTTP requests** to communicate with backend servers.

---

## Why This Matters

Every React app you build runs **in the browser**. Each user gets their own copy of your app. Without a central server:

- Users can't share data with each other
- Changes made by one user are invisible to others
- Data disappears when the browser closes

A backend server acts as the **central hub** — storing data, processing requests, and ensuring consistency across all users.

---

## What You'll Learn in This Module

### 1. Connecting React to a Backend Server
How to reach out from your React app to an external server to request or send data.

### 2. Fetching Data (GET Requests)
How to download data from a server and display it in your UI — the most common use case.

### 3. Sending Data (POST/PUT Requests)
How to send user-generated data (form submissions, selections, uploads) from your React app to a server for storage.

### 4. Handling Loading & Error States
The real-world patterns for managing what to show while data is loading and what to do when something goes wrong.

---

## The Big Picture

```
[User's Browser]          [Central Server]          [Database]
   React App  ──HTTP──▶  Backend API  ──────▶  Data Storage
              ◀──HTTP──  (Node, PHP, etc.)  ◀──────
```

Your React app sends HTTP requests to the backend. The backend processes them, interacts with the database, and sends responses back. This is the architecture behind virtually every web application you use daily.

---

## ✅ Key Takeaways

- Real-world React apps need to communicate with backend servers
- Data fetching and sending are fundamental skills for React developers
- HTTP requests are the bridge between your frontend and backend
- You'll learn to handle the full lifecycle: loading → data → error states
