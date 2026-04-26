# Working with MongoDB

## Introduction

We've built an API route that can receive POST requests — but right now it doesn't actually *do* anything with the data. It's time to connect a real database. We'll use **MongoDB Atlas** (a free cloud-hosted MongoDB service) and the official **MongoDB Node.js driver** to store meetup data from our API route. This is where our Next.js app goes from a prototype to a real, data-driven application.

---

## Concept 1: Setting Up MongoDB Atlas

### 🧠 What is it?

MongoDB Atlas is a fully managed, cloud-hosted MongoDB database service. It offers a free tier (M0 Sandbox) that's perfect for learning and small projects. Instead of installing and managing a database locally, you get a ready-to-use database in the cloud.

### ❓ Why do we need it?

Our meetup app needs persistent storage. Hard-coded data disappears when you restart the server. A real database lets us store, retrieve, and manage data permanently.

### ⚙️ How it works (setup steps)

1. **Create an account** at [mongodb.com](https://mongodb.com) → Click "Try Free"
2. **Create a cluster** → Use the free M0 Sandbox tier (leave other defaults)
3. **Configure Network Access** → Add your current IP address so your machine can connect
4. **Create a Database User** → Under "Database Access", create a user with **read and write** permissions
5. **Get the connection string** → On "Clusters" → "Connect" → "Connect your application" → Copy the connection string

### 💡 Insight

Two things must be configured or you'll get connection errors: your IP must be whitelisted under Network Access, and you need a database user with proper permissions under Database Access. These are the most common setup mistakes.

---

## Concept 2: Installing the MongoDB Driver

### 🧠 What is it?

The `mongodb` npm package is the official Node.js driver for MongoDB. It provides methods to connect to a MongoDB cluster and run queries (insert, find, update, delete) from your JavaScript/Node.js code.

### ⚙️ How it works

```bash
npm install mongodb
```

Then import the `MongoClient` in your API route:

```jsx
import { MongoClient } from 'mongodb';
```

### 💡 Insight

This is a server-side package. It will only be used inside API routes and data-fetching functions (`getStaticProps`, `getServerSideProps`) — places where code runs on the server. Next.js is smart enough to **not** bundle this package into the client-side JavaScript.

---

## Concept 3: Connecting to MongoDB from an API Route

### 🧠 What is it?

Using `MongoClient.connect()` to establish a connection to your MongoDB Atlas cluster from within a Next.js API route.

### ❓ Why do we need it?

To store data in the database, we first need a connection. The connection string includes your credentials, cluster address, and database name.

### ⚙️ How it works

```jsx
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;

    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(
      'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/meetups?retryWrites=true&w=majority'
    );

    // Get reference to the database
    const db = client.db();

    // Get reference to a collection
    const meetupsCollection = db.collection('meetups');

    // Insert data
    const result = await meetupsCollection.insertOne(data);

    console.log(result);

    // Close connection
    client.close();

    // Send response
    res.status(201).json({ message: 'Meetup inserted!' });
  }
}
```

### 🧪 Example — Breaking it down step by step

| Step | Code | What It Does |
|------|------|-------------|
| 1 | `MongoClient.connect(connectionString)` | Establishes connection to the cluster |
| 2 | `client.db()` | Gets the database specified in the connection string |
| 3 | `db.collection('meetups')` | Gets (or creates) a collection named "meetups" |
| 4 | `collection.insertOne(data)` | Inserts a single document into the collection |
| 5 | `client.close()` | Closes the connection |
| 6 | `res.status(201).json(...)` | Sends success response back to client |

### 💡 Insight

If the database or collection doesn't exist yet, MongoDB creates them automatically on the first write. No need to set up schemas or run migration scripts — that's the beauty of a NoSQL database.

---

## Concept 4: MongoDB Data Model — Collections and Documents

### 🧠 What is it?

MongoDB organizes data into **collections** (similar to tables in SQL) and **documents** (similar to rows). Each document is essentially a JavaScript object.

### ⚙️ How it works

```
Cluster (MongoDB Atlas)
  └── Database: "meetups"
       └── Collection: "meetups"
            ├── Document: { title: "React Meetup", address: "123 Main St", ... }
            ├── Document: { title: "Vue Meetup", address: "456 Oak Ave", ... }
            └── Document: { title: "Angular Meetup", address: "789 Pine Rd", ... }
```

Since documents are just objects, you can insert your request body directly:

```jsx
// No need to destructure — just insert the whole data object
const result = await meetupsCollection.insertOne(data);
```

MongoDB automatically adds a unique `_id` field to each document.

### 💡 Insight

This is why MongoDB pairs so well with JavaScript/Node.js — there's no impedance mismatch. Your JavaScript objects go straight into the database as documents. No ORM needed for simple operations.

---

## Concept 5: Security — Why This Is Safe

### 🧠 What is it?

A critical point about why storing database credentials in API routes is secure.

### ❓ Why do we need it?

Seeing a password in plain text in your code should set off alarm bells. But in this specific context, it's okay — here's why.

### ⚙️ How it works

API Routes in Next.js run **exclusively on the server**. The code inside them is:
- Never sent to the browser
- Never included in client-side JavaScript bundles
- Never visible in the page source

So even though the connection string with credentials is written in your code file, it will never be exposed to users.

### 💡 Insight

That said, in a real production app, you'd still use **environment variables** (`.env.local`) instead of hard-coding credentials. This prevents them from being committed to version control (Git) and makes it easy to use different credentials per environment.

---

## Concept 6: Sending the Response

### 🧠 What is it?

After processing the request and storing data, the API route must send back an HTTP response to the client.

### ⚙️ How it works

```jsx
res.status(201).json({ message: 'Meetup inserted!' });
```

- **`res.status(201)`** — Sets HTTP status to 201 (Created)
- **`.json({ ... })`** — Sends JSON data as the response body

The client (your React frontend) can then read this response to confirm the operation succeeded.

### 💡 Insight

Always send a response from your API route. If you don't, the client's request will hang until it times out — creating a terrible user experience.

---

## ✅ Key Takeaways

- MongoDB Atlas provides a free cloud database — perfect for Next.js projects
- Install the `mongodb` package and use `MongoClient` to connect from API routes
- MongoDB auto-creates databases and collections on first write — no setup needed
- Documents are just JavaScript objects — insert request body data directly
- API route code is server-only — credentials are safe (but use `.env.local` in production)
- Always close the connection with `client.close()` and send a response with `res.status().json()`

## ⚠️ Common Mistakes

- Forgetting to whitelist your IP in MongoDB Atlas Network Access → connection refused
- Not creating a database user with read/write permissions → authentication failure
- Forgetting to `await` the async operations (`connect`, `insertOne`) → data not saved
- Not calling `client.close()` → connection pool exhaustion in production
- Forgetting to send a response → client hangs indefinitely

## 💡 Pro Tips

- Use environment variables (`process.env.MONGODB_URI`) for your connection string in production
- For production apps, consider connection pooling — don't open/close connections on every request
- MongoDB's `insertOne` returns a `result` object containing the auto-generated `_id` — useful for returning the created resource's ID to the client
- Add `try/catch` around your database operations for proper error handling in production
