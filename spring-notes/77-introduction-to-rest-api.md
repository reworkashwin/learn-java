# Introduction to REST API with Spring Boot

## Introduction

So far in our journey, we've built a **Job Portal** — a full-stack application where job seekers can view jobs and employers can add them. Everything lives in one project: the front end (JSP pages), the controllers, the service layer, the repository — all bundled together.

But here's the question: **Is that how modern applications are really built?**

Not quite. And in this section, we're going to understand *why* — and pivot our approach toward something far more scalable and industry-standard: **REST APIs**.

---

## Concept 1: The Full-Stack Monolith — What We've Built So Far

### 🧠 What is it?

Up to this point, our Job Portal application is what we'd call a **monolithic full-stack app**. Everything — the front end (JSP views) and the back end (controllers, services, repositories) — lives in a single project.

When a client (browser) makes a request, the server does two things:
1. **Processes the data** (business logic, database interaction)
2. **Renders a page** (formats the data into a beautiful HTML page using JSP)

The server then sends back a fully rendered HTML page to the browser.

### ⚙️ How it works

Here's the flow we've been using:

```
Browser → Request → Controller → Service → Repository (mock DB)
                                                    ↓
Browser ← JSP Page (HTML) ← Controller ← Data ←───┘
```

The controller accepts the request, processes it through layers, gets data, and then returns a **view** (a JSP page). The browser receives this page and displays it.

### 💡 Insight

This approach works — and for years, this is how web applications were built. But it has a significant limitation that becomes obvious the moment you think beyond just browsers...

---

## Concept 2: The Problem — Why Returning Pages Isn't Enough

### 🧠 What's the issue?

Think about how you use the internet today. You don't just use browsers anymore. You use:
- 📱 Mobile apps (Android, iOS)
- 🖥️ Desktop applications
- 🤖 Other servers that consume your data

Now, your browser expects **HTML pages**. That's what it knows how to render. So your server dutifully returns JSP pages — formatted, styled, ready to display.

But what about a **mobile app**? Does an Android or iOS app need an HTML page from your server?

**Not at all.** A mobile app already has its own layout, its own UI built natively. All it needs from the server is **raw data** — typically in **JSON format**.

### ❓ So what's the dilemma?

If your server is designed to return HTML pages, it can only serve browsers. If a mobile app comes knocking, you'd need to build a **second server** that returns just data. And if another type of client shows up? A *third* server?

That's clearly not sustainable.

```
Browser       → Server A (returns HTML pages)
Mobile App    → Server B (returns JSON data)
Another App   → Server C (returns JSON data)
```

Three servers doing essentially the same business logic, just packaging the output differently? That's a nightmare.

### ⚠️ Common Mistake

Beginners often think their Spring MVC app with JSP views is "the" way to build web applications. It works for learning, but in the real world, separating the front end from the back end is the standard approach.

---

## Concept 3: The Solution — Separate Front End and Back End

### 🧠 The Big Idea

Instead of building a server that returns **pages**, what if we build a server that returns **just data**?

Think about it:
- The browser needs data → give it JSON
- The mobile app needs data → give it JSON
- Another server needs data → give it JSON

**Everyone gets JSON.** The data format is universal.

But wait — if the server only sends JSON, how does the browser user see a nice-looking page?

That's where a **separate front-end application** comes in. You build the UI independently using technologies like **React**, **Angular**, or **Vue.js**. This front-end app:
1. Runs in the browser
2. Makes requests to the back-end server
3. Receives JSON data
4. Renders it into a beautiful UI on its own

### ⚙️ The Modern Architecture

```
                        ┌──────────────┐
   Browser (React) ────→│              │
                        │   Back-End   │
   Mobile App ─────────→│   Server     │──→ Returns JSON only
                        │  (Spring Boot)│
   Another Server ─────→│              │
                        └──────────────┘
```

Now you have **one server** that speaks one language: **JSON**. Every client — browser, mobile, or otherwise — communicates with it using the same format.

The front end and back end are **decoupled**. They are separate projects, possibly maintained by separate teams, and they communicate through a well-defined data format.

### 💡 Insight

This is the architecture behind virtually every modern tech company. When you use Facebook, LinkedIn, or check cricket scores on an app — the mobile app and the website are both talking to the **same back-end server**. They just render the JSON data differently based on their platform.

---

## Concept 4: JSON and XML — The Communication Payload

### 🧠 What are they?

When the front end and back end are separate, they need a common language to exchange data. The two most popular formats are:

- **JSON (JavaScript Object Notation)** — lightweight, easy to read, and the dominant format today
- **XML (Extensible Markup Language)** — older, more verbose, still used in some enterprise systems

### 🧪 Example

Here's what a job listing might look like in JSON:

```json
{
  "id": 1,
  "title": "Java Developer",
  "description": "Build backend services using Spring Boot",
  "company": "Telusko",
  "location": "Remote"
}
```

And the same data in XML:

```xml
<job>
  <id>1</id>
  <title>Java Developer</title>
  <description>Build backend services using Spring Boot</description>
  <company>Telusko</company>
  <location>Remote</location>
</job>
```

### 💡 Insight

In modern development, **JSON is king**. It's lighter, simpler, and natively understood by JavaScript (which powers most front-end frameworks). XML still appears in legacy systems and certain enterprise integrations, but for new projects, JSON is the default choice.

---

## Concept 5: What is a REST API?

### 🧠 What is it?

**REST** stands for **Representational State Transfer**. A REST API is a way to build your back-end server so that it:
- Accepts requests from any client
- Processes data
- Returns **just data** (usually JSON) — **not pages**

In our context, we're going to transform our Job Portal application:
- ❌ Remove all JSP pages
- ❌ Controllers will no longer return views
- ✅ Controllers will return **data** (JSON responses)

This turns our application into a **REST API** — a pure back-end service that any client can consume.

### ❓ Why do we need it?

Because we want our server to be **client-agnostic**. Whether a request comes from a React app, an Android app, an iOS app, or even another microservice — the server doesn't care. It receives a request, processes it, and sends back JSON. Done.

### ⚙️ What changes in our project?

| Before (Full-Stack MVC)         | After (REST API)                    |
|----------------------------------|--------------------------------------|
| Controllers return JSP views     | Controllers return JSON data         |
| Server renders HTML              | Server sends raw data                |
| Front end is inside the project  | Front end is a separate project      |
| Tightly coupled                  | Loosely coupled                      |

---

## Concept 6: How Will We Test the REST API?

### 🧠 The challenge

If the server only returns JSON, you can't just open a browser and see a pretty page. The browser will show you raw JSON — which is fine for debugging, but not great for systematic testing.

So how do you:
- Send different types of requests (GET, POST, PUT, DELETE)?
- Inspect responses?
- Test your API without a front end?

### ⚙️ Enter Postman — The REST Client

**Postman** is a popular tool (REST client) that lets you interact with your REST API without needing a front end. With Postman, you can:
- Send HTTP requests to your server
- Set headers, parameters, and request bodies
- View the JSON response in a clean format
- Save and organize your API tests

There are other REST clients too (like Insomnia, curl, or HTTPie), but Postman is the most widely used and beginner-friendly.

### 💡 Insight

In real-world development, Postman is an essential tool in every back-end developer's toolkit. Even when a front-end team is building the UI, back-end developers use Postman to test and verify their APIs independently.

---

## What's Coming Next

Here's the roadmap for this section:

1. **Build a REST API** — Transform our Job Portal to return JSON instead of pages
2. **Test with Postman** — Use Postman to send requests and verify responses
3. **Connect a React Front End** — A pre-built React app will act as the client, consuming our REST API

> 💡 This is not a React course — the React project will be provided. The focus remains on the **Spring Boot back end** and understanding how REST APIs work.

---

## ✅ Key Takeaways

- A **monolithic full-stack app** returns rendered pages (HTML) — this only serves browsers
- Modern apps separate the **front end** and **back end** into independent projects
- The back end becomes a **REST API** that returns **JSON data** to any client
- **JSON** is the standard communication format between client and server
- **Postman** is used to test REST APIs without needing a front end
- This architecture powers virtually every modern web and mobile application

## ⚠️ Common Mistakes

- Thinking that returning JSP/HTML pages from the server is the modern approach — it's not
- Confusing a full-stack monolith with a REST API — a REST API does **not** return views
- Forgetting that the front end still needs to be built — the REST API only provides data

## 💡 Pro Tips

- When building REST APIs, think **data first, UI later** — your API should be clean and consumable by *any* client
- Get comfortable with Postman early — it will be your best friend throughout back-end development
- Understanding REST architecture is a must-have skill for any modern developer — it's not optional
