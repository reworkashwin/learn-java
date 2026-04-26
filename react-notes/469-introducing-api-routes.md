# Introducing API Routes

## Introduction

So far, we've mastered the data-fetching side of Next.js — `getStaticProps`, `getStaticPaths`, and `getServerSideProps`. But all our data has been hard-coded. Where's the actual backend? Where's the database?

Here's the beautiful thing about Next.js: you don't need a separate backend project. Next.js lets you build **API endpoints** right inside your React app using a feature called **API Routes**. This is the last major Next.js feature we need to understand — and it's a game-changer.

---

## Concept 1: What Are API Routes?

### 🧠 What is it?

API Routes are special endpoints in a Next.js project that don't return HTML pages. Instead, they accept incoming HTTP requests (GET, POST, PUT, DELETE, etc.), process them, and return JSON responses — just like a traditional backend API.

Think of it this way: your `pages/` folder creates **frontend pages**. A special `pages/api/` folder creates **backend endpoints**. Same project, same server.

### ❓ Why do we need it?

Without API Routes, you'd need a completely separate backend project (Express.js server, Spring Boot app, etc.) just to handle things like form submissions, database operations, or authentication. API Routes let you keep everything in one project.

### ⚙️ How it works

1. Create a folder named `api` inside your `pages` folder — this name is **required**
2. Add JavaScript files inside `pages/api/` — each file becomes an API endpoint
3. The filename becomes the URL path: `pages/api/new-meetup.js` → `/api/new-meetup`
4. Export a handler function that receives `req` (request) and `res` (response)

```
pages/
├── index.js          → serves "/"
├── [meetupId].js     → serves "/m1", "/m2", etc.
└── api/
    └── new-meetup.js → serves "/api/new-meetup"
```

### 💡 Insight

API Routes run **exclusively on the server**. The code inside them never reaches the client's browser. This means you can safely use database credentials, API keys, and other secrets inside API Routes without any security risk.

---

## Concept 2: Building a Handler Function

### 🧠 What is it?

The handler function is what runs when a request hits your API route. It's the equivalent of a route handler in Express.js — you receive the request, process it, and send back a response.

### ❓ Why do we need it?

Every API endpoint needs logic to handle incoming requests. The handler function is where that logic lives.

### ⚙️ How it works

```jsx
// pages/api/new-meetup.js

export default function handler(req, res) {
  // req = incoming request (method, body, headers)
  // res = outgoing response (status, JSON data)
}
```

The function name doesn't matter (though `handler` is conventional) — what matters is that it's the **default export**.

### 🧪 Example

```jsx
// pages/api/new-meetup.js

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { title, image, address, description } = req.body;

    // Store in database, process data, etc.

    res.status(201).json({ message: 'Meetup inserted!' });
  }
}
```

Key parts:
- **`req.method`** — The HTTP method (`GET`, `POST`, `PUT`, `DELETE`)
- **`req.body`** — The parsed request body (data sent by the client)
- **`req.headers`** — The request headers
- **`res.status()`** — Sets the HTTP status code
- **`res.json()`** — Sends a JSON response

### 💡 Insight

If you've used Node.js with Express, this pattern will feel very familiar. The `req` and `res` objects work similarly — Next.js even builds on Node.js's native HTTP module under the hood.

---

## Concept 3: Filtering by HTTP Method

### 🧠 What is it?

A pattern for ensuring your API route only responds to specific types of requests — for example, only accepting POST requests for creating data.

### ❓ Why do we need it?

A single API route can receive any HTTP method. If your endpoint is meant for creating new meetups, you probably don't want GET requests triggering the insertion logic. Filtering by method keeps things safe and intentional.

### ⚙️ How it works

```jsx
export default function handler(req, res) {
  if (req.method === 'POST') {
    // Only process POST requests
    const data = req.body;
    // ... store data, return response
    res.status(201).json({ message: 'Success!' });
  }
  // GET, PUT, DELETE, etc. → do nothing (or return 405)
}
```

### 💡 Insight

In a production app, you'd want to handle unsupported methods explicitly — returning a `405 Method Not Allowed` response instead of silently ignoring the request.

---

## Concept 4: Extracting Data from the Request Body

### 🧠 What is it?

`req.body` contains the parsed data that was sent with the request. Next.js automatically parses JSON request bodies, so you can access the data directly.

### ⚙️ How it works

When a client sends a POST request with JSON data:

```jsx
// Client-side (sending)
fetch('/api/new-meetup', {
  method: 'POST',
  body: JSON.stringify({ title: 'React Meetup', address: '123 Main St' }),
  headers: { 'Content-Type': 'application/json' },
});

// Server-side (receiving in API route)
export default function handler(req, res) {
  const { title, image, address, description } = req.body;
  // Use destructuring to extract exactly what you need
}
```

### 💡 Insight

Since it's your API and your frontend, you control both sides. Define what data shape you expect, and make sure your frontend sends it in that shape. No surprises.

---

## ✅ Key Takeaways

- API Routes live in `pages/api/` and create backend endpoints within your Next.js app
- Each file exports a handler function receiving `req` and `res` objects
- API Route code **never runs on the client** — safe for credentials and secrets
- Use `req.method` to filter by HTTP method and `req.body` to access request data
- `res.status().json()` sends back a structured response

## ⚠️ Common Mistakes

- Putting the `api` folder outside of `pages/` — it must be `pages/api/` exactly
- Forgetting to export the handler as the **default** export
- Trying to return React components from API routes — they only return JSON, not HTML
- Not checking `req.method` — allowing unintended request types to trigger your logic

## 💡 Pro Tips

- API Routes are perfect for form submissions, database operations, and third-party API calls
- You can create nested routes: `pages/api/meetups/[meetupId].js` → `/api/meetups/m1`
- Use API Routes as a secure proxy for third-party APIs that require secret keys
- In production, API Routes run as serverless functions on platforms like Vercel
