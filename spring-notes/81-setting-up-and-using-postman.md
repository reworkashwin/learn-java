# Setting Up and Using Postman

## Introduction

We have our React front end ready, but what if you don't want to rely on a UI to test your REST API? What if you just want to fire a request and see the raw JSON response? That's where **Postman** comes in — a REST client that lets you send any type of HTTP request without writing a single line of front-end code.

Let's get it installed and see how it works.

---

## Concept 1: Installing Postman

### ⚙️ How to get it

1. Open your browser and search for **"Postman download"**
2. Go to the official Postman website
3. It automatically detects your OS (Windows, Mac, Linux)
4. Click download and install it — straightforward, no complex setup

That's it. Open Postman, and you're ready to start testing APIs.

---

## Concept 2: Sending a GET Request

### ⚙️ How it works

When you open Postman, here's how to send your first request:

1. Click the **`+`** button to open a new request tab
2. You'll see a dropdown with HTTP methods — **GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS**
3. Select **GET** (it's the default)
4. Paste your URL in the address bar — for example: `http://localhost:8000/posts`
5. Click **Send**

You'll see the JSON response right there in Postman — the same data your React app displays, just without the pretty UI.

### ❓ "But I can do this in a browser too..."

Yes, you can! Paste the same URL in your browser's address bar, hit Enter, and you'll get the JSON data. Browsers send GET requests by default.

**So why use Postman for GET?** Fair question. For simple GET requests, a browser works fine. But what about POST, PUT, and DELETE? That's where browsers fall short — and Postman shines.

---

## Concept 3: Sending a POST Request

### 🧠 The problem with browsers

To send a POST request from a browser, you'd need to create an HTML form, set the method to POST, add input fields... basically build a mini UI just to test one endpoint. That's a lot of work for a simple test.

### ⚙️ How to do it in Postman

1. Click the **`+`** button for a new tab
2. Change the method dropdown from GET to **POST**
3. Enter the URL (e.g., `http://localhost:8000/posts`)
4. Click the **Body** tab below the URL bar
5. Select **raw**
6. Change the format dropdown to **JSON**
7. Type your JSON data in the body:

```json
{
  "profile": "Python Developer",
  "description": "Build data pipelines",
  "experience": 2,
  "techs": ["Python", "Django", "PostgreSQL"]
}
```

8. Click **Send**

That's it — you just sent a POST request with JSON data to the server. No form, no UI, no front end needed.

### 💡 Insight

This is why Postman is indispensable for back-end developers. You can test **every** HTTP method — GET, POST, PUT, DELETE — in seconds, without building any UI. It's your testing playground while the front-end team works on their part.

---

## Concept 4: Postman vs Browser — When to Use Which

| Capability               | Browser          | Postman          |
|--------------------------|------------------|------------------|
| GET requests             | ✅ Works easily   | ✅ Works easily   |
| POST requests            | ❌ Needs a form   | ✅ Easy with Body |
| PUT requests             | ❌ Not possible   | ✅ Fully supported|
| DELETE requests          | ❌ Not possible   | ✅ Fully supported|
| View JSON response       | ✅ Raw format     | ✅ Formatted nicely|
| Set custom headers       | ❌ No             | ✅ Yes            |
| Save & organize requests | ❌ No             | ✅ Yes (Collections)|

---

## Concept 5: Other REST Clients

### 🧠 Postman isn't the only option

While Postman is the most popular, there are other tools you can use:

- **Swagger** — Auto-generates API documentation and lets you test endpoints directly from the docs. We might explore this later.
- **Insomnia** — A lightweight alternative to Postman
- **curl** — Command-line tool for making HTTP requests
- **HTTPie** — A more user-friendly command-line HTTP client

But for this course, **Postman** will be our primary testing tool alongside the React front end.

---

## ✅ Key Takeaways

- **Postman** is a REST client for testing APIs — download it from the official website
- It supports all HTTP methods: GET, POST, PUT, DELETE, and more
- For POST/PUT requests, use the **Body → raw → JSON** option to send data
- Browsers can only easily send GET requests — Postman handles everything
- We'll use both **Postman** and the **React front end** to test our Spring Boot API
- Other options like **Swagger** exist and may be explored later

## ⚠️ Common Mistakes

- Forgetting to set the body format to **JSON** when sending POST/PUT requests — Postman defaults to "Text"
- Sending a POST request without a body — the server won't know what resource to create
- Assuming the browser can do everything Postman does — it can't handle POST, PUT, or DELETE easily

## 💡 Pro Tips

- Organize your requests into **Collections** in Postman — it keeps things tidy as your API grows
- Use Postman's **pretty print** view to read JSON responses more easily than in a browser
- Now that the tooling is ready (React + Postman), it's time to build the actual Spring Boot back end — that's next!
