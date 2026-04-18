# Understanding REST Architecture

## Introduction

Now that we know *why* we need REST APIs — to build a back end that returns data instead of pages — let's understand **what REST actually means** and the core principles behind it.

REST isn't just a buzzword. It's an **architectural style** with specific rules about how clients and servers should communicate. Understanding these rules is essential before we start writing any REST code in Spring Boot.

---

## Concept 1: Everything is a Resource

### 🧠 What is a Resource?

When you build an application, you model real-world things as **entities**. In REST, we call these entities **resources**.

Think about our Job Portal application. What are the "things" we deal with?

- **Job** — a job listing posted by an employer
- **Employee** — a job seeker looking for work
- **Employer** — a company posting jobs
- **Admin** — someone managing the platform

Each of these is a **resource**. A resource is simply any piece of data that the server manages and that clients can interact with.

### ❓ Why think in terms of resources?

Because in REST, everything revolves around resources. You don't think "what actions can my server perform?" — you think "what resources does my server manage?"

- Want to add a new job? You're **creating** a Job resource.
- Want to see all jobs? You're **reading** Job resources.
- Want to change a job description? You're **updating** a Job resource.
- Want to remove a job listing? You're **deleting** a Job resource.

This is the famous **CRUD** pattern:

| Operation | Meaning                     |
|-----------|-----------------------------|
| **C**reate  | Add new data to the server  |
| **R**ead    | Get existing data           |
| **U**pdate  | Modify existing data        |
| **D**elete  | Remove data                 |

### 💡 Insight

Thinking in resources is a mindset shift. Instead of saying "I need an endpoint to add a job," you say "I need to expose the Job resource and allow creation on it." This subtle difference shapes how your entire API is designed.

---

## Concept 2: What is State? — The "S" in REST

### 🧠 What is it?

REST stands for **Representational State Transfer**. Let's break that down, starting with **State**.

A resource's **state** is its current data at a given point in time.

### 🧪 Example

Imagine an Employee resource:

```json
{
  "id": 101,
  "name": "Rahul",
  "address": "Bangalore",
  "currentEmployer": null
}
```

Right now, Rahul doesn't have a job — `currentEmployer` is `null`. This is the **current state** of this resource.

A few months later, Rahul gets a job at Google:

```json
{
  "id": 101,
  "name": "Rahul",
  "address": "Bangalore",
  "currentEmployer": "Google"
}
```

The state has changed. Some fields like `name` and `id` rarely change. But `currentEmployer`? That could change every few months (people switch jobs a lot these days!).

The key point is: **at any given moment, the resource has a specific state.** When a client asks for data, the server sends back the *current* state of that resource.

### ⚙️ Putting it all together — Representational State Transfer

Let's decode the full name:

1. **State** — The current data/values of a resource at a point in time
2. **Representational** — This state is formatted in a presentable way (JSON or XML) before sending
3. **Transfer** — This formatted state is transferred from server to client (or client to server)

So REST literally means: **"Transfer the current state of a resource in a proper representation."**

When a client says, "Give me the details of Employee 101," the server:
1. Looks up the resource (Employee 101)
2. Gets its current **state** (all the field values right now)
3. Formats it into a **representation** (JSON)
4. **Transfers** it back to the client

That's REST in a nutshell.

---

## Concept 3: REST is Stateless

### 🧠 What does stateless mean?

Here's one of the most important rules of REST: **every request is independent.**

When a client talks to the server, the server does **not** remember anything from previous requests. Each request must contain **all the information** the server needs to process it.

### 🧪 Real-world analogy

Imagine you walk into a restaurant where the waiter has no memory. Every time you call the waiter:
- You can't say "I'll have the same thing as last time"
- You have to say "I'm table 5, my name is Rahul, and I'd like a coffee with milk, no sugar"

Every. Single. Time.

That's how REST works. The server treats each request as brand new. It doesn't remember who you are or what you asked for before.

### ❓ Why stateless?

- **Scalability** — The server doesn't need to store session data for thousands of clients
- **Reliability** — If the server restarts, nothing is lost because it wasn't remembering anything anyway
- **Simplicity** — Each request is self-contained and can be understood in isolation

### ⚠️ Common Mistake

"But what about login? Doesn't the server need to know I'm logged in?"

Yes — but in REST, the client sends authentication information (like a token) **with every request**. The server verifies it each time. It doesn't store a session saying "this user is logged in." The client carries the proof of identity, not the server.

---

## Concept 4: Use Nouns, Not Verbs — REST URL Design

### 🧠 The old way (what we were doing)

In our previous Spring MVC application, our URLs looked like this:

```
/viewAllJobs
/addJob
/getJob
```

Notice something? These URLs use **verbs** — they describe *actions*: view, add, get. This is the traditional approach, but REST says: **don't do that.**

### ⚙️ The REST way

In REST, URLs represent **resources** (nouns), not actions (verbs):

```
/jobs       → represents the collection of Job resources
/jobs/1     → represents a specific Job resource with ID 1
```

That's it. No verbs. Just nouns.

### ❓ But wait — how do you differentiate between operations?

If adding a job and getting a job both use `/jobs`, how does the server know what you want?

This is where **HTTP methods** come in. The URL stays the same — the **method** tells the server what to do:

| What you want to do     | URL         | HTTP Method |
|--------------------------|-------------|-------------|
| Get all jobs             | `/jobs`     | GET         |
| Get a specific job       | `/jobs/1`   | GET         |
| Add a new job            | `/jobs`     | POST        |
| Update an existing job   | `/jobs/1`   | PUT         |
| Delete a job             | `/jobs/1`   | DELETE      |

See how the URL is just the **noun** (the resource)? The HTTP method is the **verb** (the action). This separation is a core principle of REST.

### 💡 Insight

This is elegant because your URL structure becomes clean and predictable. If someone tells you "the API has a `/jobs` endpoint," you immediately know:
- `GET /jobs` → list all jobs
- `POST /jobs` → create a job
- `GET /jobs/5` → get job with ID 5
- `PUT /jobs/5` → update job 5
- `DELETE /jobs/5` → delete job 5

No documentation needed to guess the URL pattern.

---

## Concept 5: JSON vs XML — How Data is Represented

### 🧠 The two formats

When the server sends state to the client (or receives state from the client), the data needs to be in a structured format. The two most common formats are:

- **JSON** (JavaScript Object Notation) — the modern standard
- **XML** (Extensible Markup Language) — the older format

### 🧪 Comparing the two

Here's a Job resource in **JSON**:

```json
{
  "id": 1,
  "title": "Java Developer",
  "company": "Telusko",
  "location": "Remote"
}
```

And the same data in **XML**:

```xml
<job>
  <id>1</id>
  <title>Java Developer</title>
  <company>Telusko</company>
  <location>Remote</location>
</job>
```

Which one looks cleaner? JSON, right?

### ❓ Why JSON wins

- **Lighter** — Less syntax overhead, no closing tags everywhere
- **Easier to read** — Both for humans and machines
- **Less memory** — Takes fewer bytes to represent the same data
- **Native to JavaScript** — Front-end frameworks consume it effortlessly

### 💡 Insight

Don't let the name fool you. "JavaScript Object Notation" doesn't mean JSON is only for JavaScript. It's just a **notation format** that originated from JavaScript's object syntax. You can use JSON with **any** programming language — Java, Python, C#, Go, you name it. It's the universal data exchange format of the web.

### ⚠️ Common Mistake

Some beginners assume XML is outdated and useless. While JSON dominates modern APIs, XML is still widely used in enterprise systems (SOAP services, configuration files, legacy integrations). Knowing both is valuable, but for REST APIs, JSON is the default.

---

## ✅ Key Takeaways

- In REST, everything is a **resource** (Job, Employee, Employer) — think nouns, not actions
- **State** is the current data of a resource at a given point in time
- **REST = Representational State Transfer** — you transfer the current state of a resource in a proper format
- REST is **stateless** — the server doesn't remember previous requests; every request must be self-contained
- REST URLs use **nouns** (`/jobs`) not verbs (`/addJob`) — the HTTP method defines the action
- **JSON** is the dominant data format for REST APIs — lightweight, readable, and universal
- HTTP methods (GET, POST, PUT, DELETE) will be the key to differentiating operations — more on that next

## ⚠️ Common Mistakes

- Using verbs in REST URLs (`/getJobs`, `/deleteJob/5`) — use nouns and let HTTP methods define the action
- Thinking the server remembers your previous request — every REST request is independent
- Assuming JSON is only for JavaScript — it works with every programming language

## 💡 Pro Tips

- Design your REST URLs around resources first, then map HTTP methods to operations
- Keep URLs consistent: plural nouns for collections (`/jobs`), with an ID for individual resources (`/jobs/1`)
- Statelessness is not a limitation — it's what makes REST APIs massively scalable
