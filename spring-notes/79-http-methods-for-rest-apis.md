# HTTP Methods for REST APIs

## Introduction

We've talked about REST, resources, and nouns-based URLs. But there's a critical piece we left hanging: **if the URL is the same for adding a job and getting a job, how does the server know what to do?**

The answer lies in **HTTP methods**. These are the verbs that tell the server *what action* to perform on the resource. Let's explore the four most important ones.

---

## Concept 1: HTTP — A Quick Refresher

### 🧠 What is HTTP?

**HTTP** stands for **Hypertext Transfer Protocol**. It's the protocol your browser (and every web client) uses to communicate with servers on the internet.

We're not here to deep-dive into what a protocol is. What matters for us is that HTTP comes with a set of **methods** — and these methods are what make REST APIs work.

You've actually already used two of them in the Job Portal project: **GET** (to fetch data) and **POST** (to send form data). But REST uses more than just those two.

---

## Concept 2: The Four Key HTTP Methods

### 🧠 Mapping CRUD to HTTP

Remember CRUD — Create, Read, Update, Delete? Each of these operations maps directly to an HTTP method:

| CRUD Operation | HTTP Method | Purpose                          |
|----------------|-------------|----------------------------------|
| **Create**     | POST        | Send data to create a new resource |
| **Read**       | GET         | Fetch/retrieve data from the server |
| **Update**     | PUT         | Send data to update an existing resource |
| **Delete**     | DELETE      | Remove a resource from the server |

These four — **POST, GET, PUT, DELETE** — are the famous HTTP methods you'll use constantly in REST APIs.

### ❓ Why do we need different methods?

Because in REST, the **URL stays the same** — it just represents the resource. The method is what tells the server *what you want to do* with that resource.

### 🧪 Example — The Job Resource

Let's see this in action with our Job Portal:

| What you want to do       | URL           | HTTP Method |
|---------------------------|---------------|-------------|
| Create a new job          | `/jobs`       | **POST**    |
| Get all jobs              | `/jobs`       | **GET**     |
| Get a specific job        | `/jobs/{id}`  | **GET**     |
| Update an existing job    | `/jobs/{id}`  | **PUT**     |
| Delete a job              | `/jobs/{id}`  | **DELETE**  |

Notice how `/jobs` is used for both creating and fetching jobs? The URL is identical — it's the **method** that differentiates them.

- `POST /jobs` → "I'm sending you a new job, please save it"
- `GET /jobs` → "Give me all the jobs you have"

Same URL, completely different operations. That's the beauty of REST.

---

## Concept 3: Spring Boot Annotations for HTTP Methods

### 🧠 How does this translate to code?

In Spring Boot, we've already used `@GetMapping` and `@PostMapping`. Now, for REST APIs, we have the full set:

| HTTP Method | Spring Boot Annotation |
|-------------|------------------------|
| GET         | `@GetMapping`          |
| POST        | `@PostMapping`         |
| PUT         | `@PutMapping`          |
| DELETE      | `@DeleteMapping`       |

### 🧪 Example — How the controller would look

```java
@RestController
public class JobController {

    // GET /jobs → Fetch all jobs
    @GetMapping("/jobs")
    public List<Job> getAllJobs() { ... }

    // GET /jobs/{id} → Fetch one job
    @GetMapping("/jobs/{id}")
    public Job getJob(@PathVariable int id) { ... }

    // POST /jobs → Create a new job
    @PostMapping("/jobs")
    public Job createJob(@RequestBody Job job) { ... }

    // PUT /jobs/{id} → Update an existing job
    @PutMapping("/jobs/{id}")
    public Job updateJob(@PathVariable int id, @RequestBody Job job) { ... }

    // DELETE /jobs/{id} → Delete a job
    @DeleteMapping("/jobs/{id}")
    public void deleteJob(@PathVariable int id) { ... }
}
```

See how clean this is? The URL pattern stays consistent (`/jobs` or `/jobs/{id}`), and the annotation tells Spring Boot which HTTP method each handler responds to.

### 💡 Insight

This is exactly the nouns-not-verbs principle from REST in action. We don't have `/addJob`, `/deleteJob`, `/updateJob` — we just have `/jobs` with different HTTP methods. The method *is* the verb.

---

## Concept 4: The Browser Limitation

### 🧠 What can a browser do?

Here's something important to understand: **browsers are limited when it comes to HTTP methods.**

- When you type a URL in the address bar and hit Enter → that's always a **GET** request
- When you submit a form → that can be a **GET** or **POST** request

That's it. Browsers don't natively let you fire PUT or DELETE requests from the address bar. Even POST requires creating an HTML form.

### ❓ So how do you test your REST API?

If you're building a REST API that supports GET, POST, PUT, and DELETE, but your browser can only easily do GET... how do you test the other methods?

You have two options:

1. **Build a front-end client** (like a React or Angular app) that sends all types of HTTP requests programmatically
2. **Use a REST client tool** like **Postman** that lets you manually send any HTTP method with any data

### 💡 Insight

This is exactly why tools like Postman exist. As a back-end developer building REST APIs, you can't rely on a browser to test your work. Postman lets you craft any HTTP request — GET, POST, PUT, DELETE — with custom headers, request bodies, and parameters. It's your testing playground before any front end is ready.

---

## ✅ Key Takeaways

- HTTP has four key methods for REST: **GET** (read), **POST** (create), **PUT** (update), **DELETE** (delete)
- These map directly to **CRUD** operations
- In REST, the **URL stays the same** — the HTTP method defines the action
- Spring Boot provides matching annotations: `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
- Browsers can only easily send GET requests — you need tools like **Postman** to test the full API

## ⚠️ Common Mistakes

- Using POST for everything — each CRUD operation has its proper HTTP method; use the right one
- Trying to test PUT/DELETE requests by typing URLs in the browser — that only sends GET requests
- Confusing POST and PUT — POST is for **creating** new resources, PUT is for **updating** existing ones

## 💡 Pro Tips

- Think of the HTTP method as the *verb* and the URL as the *noun* — together they form a complete instruction
- When in doubt: GET retrieves, POST creates, PUT updates, DELETE removes — keep it simple
- Get comfortable with Postman now — we'll be using it heavily to test every endpoint we build
