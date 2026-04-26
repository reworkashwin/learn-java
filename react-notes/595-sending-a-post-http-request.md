# Sending a POST HTTP Request

## Introduction

So far we've been working with local state in our React app — data lives in memory and disappears the moment you reload the page. But real applications need to **talk to a backend**. They need to send data to a server and persist it. How do you actually send an HTTP request from inside a React component? That's exactly what we're tackling here.

In this section, we'll learn how to use the browser's built-in `fetch` API to send a POST request from React to a backend, turning our frontend-only app into something that actually communicates with the outside world.

---

## Concept 1: The Fetch API

### 🧠 What is it?

The `fetch` function is a **built-in browser API** — it's not a React feature at all. It's available in any JavaScript running in a browser. Despite its name suggesting "fetching" (i.e., getting data), `fetch` can also be used to **send data** to a server.

### ❓ Why do we need it?

When a user creates a new post in our app, we don't just want to show it locally — we want to **store it on the backend** so it survives page reloads and is visible to other users. The `fetch` API gives us the ability to send HTTP requests (GET, POST, PUT, DELETE, etc.) directly from our frontend code.

### ⚙️ How it works

1. Call `fetch()` with the **URL** you want to send the request to
2. By default, `fetch` sends a **GET** request
3. To send a **POST** request, pass a second argument — a configuration object
4. In that config, set `method: 'POST'`, attach a `body`, and add appropriate `headers`

### 🧪 Example

```jsx
function addPostHandler(postData) {
  fetch('http://localhost:8080/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Still update local state so the UI reflects the change immediately
  setPosts((prevPosts) => [postData, ...prevPosts]);
}
```

### 💡 Insight

Notice the pattern here: we **update local state immediately** for a snappy UI, and **send the request in the background**. The user doesn't have to wait for the server to respond before seeing their new post. This is a common "optimistic update" approach.

---

## Concept 2: Converting Data to JSON

### 🧠 What is it?

`JSON.stringify()` is a built-in JavaScript method that converts a JavaScript object into a **JSON string**. This is necessary because HTTP request bodies must be sent as text — you can't just throw a raw JS object over the wire.

### ❓ Why do we need it?

Backends expect data in a specific format. JSON is the most common format for web APIs. Without converting your data to JSON, the backend won't understand what you're sending.

### ⚙️ How it works

- `JSON.stringify({ author: 'Max', body: 'Hello' })` becomes `'{"author":"Max","body":"Hello"}'`
- The `Content-Type: application/json` header tells the server, "Hey, the data I'm sending you is in JSON format"

### 💡 Insight

Think of `JSON.stringify` as putting your data into an envelope the server can open. Without it, you're handing the server a raw object it can't read. And the `Content-Type` header is like writing "JSON" on the envelope so the server knows how to open it.

---

## Concept 3: Verifying the Request Works

### 🧠 What is it?

After sending the POST request, we need to verify the data actually arrived at the backend.

### ⚙️ How it works

- The `fetch` call returns a **Promise** that resolves with a response object
- For now, we don't need to inspect the response — the important thing is that the request was sent
- On the backend side, we can check the data store (e.g., a `posts.json` file) to confirm the data was received

### 🧪 Example

After submitting a new post through the UI:
- The post appears locally (because we updated state)
- Switching to the backend, we can see the post was stored in `posts.json` with an auto-generated ID

### 💡 Insight

The `fetch` function does its job quietly. It sends the request and moves on. For a simple "fire and forget" scenario like creating a post, we don't even need to handle the response right away — though in production apps, you'd want error handling too.

---

## ✅ Key Takeaways

- `fetch()` is a **browser-native API**, not specific to React
- By default it sends GET requests — use the config object to switch to POST
- Always convert data to JSON with `JSON.stringify()` and set the `Content-Type` header
- You can update local state **immediately** while the request is sent in the background
- Sending data is the easy part — **fetching** data in React is where things get trickier (that's next!)

## ⚠️ Common Mistakes

- Forgetting to set `method: 'POST'` — `fetch` defaults to GET
- Not converting the body to JSON with `JSON.stringify()`
- Omitting the `Content-Type: application/json` header — the backend won't know how to parse the body
- Trying to send a raw JavaScript object as the body — it won't work

## 💡 Pro Tips

- Always pair local state updates with backend requests for a responsive UI
- In production, always handle potential errors from `fetch` (network failures, server errors, etc.)
- `fetch` returns a Promise — you can `await` it or use `.then()` to handle the response when needed
