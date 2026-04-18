# Sending Data to the Server with POST and @RequestBody

## Introduction

So far, we've only been **reading** data — fetching all jobs and fetching a single job. But a REST API isn't complete until you can also **create** data. How do you send a new job post from the client to the server? That's what we'll tackle now using POST requests and the `@RequestBody` annotation.

---

## Concept 1: We Already Have the Backend Layers Ready

### 🧠 What's already in place?

If you look at the existing code:

- **Repository** already has an `addJob()` method that adds a job to the list
- **Service** already has an `addJob()` method that calls the repo

The only thing missing? A **controller method** that accepts the incoming data. That's all we need to build.

---

## Concept 2: Creating the POST Endpoint

### ⚙️ Writing the controller method

```java
@PostMapping("jobPosts")
public JobPost addJob(@RequestBody JobPost jobPost) {
    service.addJob(jobPost);
    return service.getJob(jobPost.getPostId());
}
```

Let's break this down:

### ❓ Why `@PostMapping` and not `@GetMapping`?

Because we're **sending** data to the server — creating a new resource. That's a POST operation.

"But wait, the URL is `jobPosts` — the same as our GET endpoint!"

Exactly! And that's perfectly fine in REST:

| URL          | HTTP Method | What it does        |
|--------------|-------------|---------------------|
| `/jobPosts`  | GET         | Fetch all job posts |
| `/jobPosts`  | POST        | Create a new job post |

Same URL, different methods — no confusion. Spring knows which handler to call based on the HTTP method.

---

## Concept 3: @RequestBody — Accepting JSON Data

### 🧠 What is @RequestBody?

When the client sends a POST request, the data travels in the **request body** as JSON. But your controller method needs a Java object (`JobPost`), not raw JSON text.

`@RequestBody` tells Spring: **"Take the JSON from the request body and convert it into a `JobPost` object."**

```java
public JobPost addJob(@RequestBody JobPost jobPost) {
```

Spring (using Jackson behind the scenes) automatically:
1. Reads the JSON from the request body
2. Maps each JSON field to the corresponding field in `JobPost`
3. Creates a `JobPost` object and passes it to your method

### ❓ How does this relate to @ResponseBody?

They're two sides of the same coin:

| Annotation      | Direction              | What it does                              |
|-----------------|------------------------|-------------------------------------------|
| `@ResponseBody` | Server → Client        | Converts Java object to JSON for the response |
| `@RequestBody`  | Client → Server        | Converts JSON from request into a Java object |

When we use `@RestController`, `@ResponseBody` is applied automatically. But `@RequestBody` must be explicitly added to each parameter that receives JSON data.

---

## Concept 4: Testing with Postman

### ⚙️ Step by step

**Step 1:** Open a new tab in Postman

**Step 2:** Change the method to **POST**

**Step 3:** Enter the URL: `http://localhost:8080/jobPosts`

**Step 4:** Click the **Body** tab → select **raw** → change the dropdown to **JSON**

**Step 5:** Paste your JSON data:

```json
{
    "postId": 6,
    "postProfile": "iOS Developer",
    "postDesc": "Experience in mobile development for iOS",
    "reqExperience": 2,
    "postTechStack": ["Swift", "Xcode", "UIKit"]
}
```

**Step 6:** Click **Send**

**Result:** 200 OK — the server accepted the data.

### ⚙️ Verifying it worked

Switch back to your GET request (`GET http://localhost:8080/jobPosts`) and click Send. Scroll to the bottom — you should see post ID 6 (the iOS Developer role) at the end of the list. The data was successfully saved!

---

## Concept 5: What Should the POST Endpoint Return?

### 🧠 Option 1: Return nothing (void)

```java
@PostMapping("jobPosts")
public void addJob(@RequestBody JobPost jobPost) {
    service.addJob(jobPost);
}
```

This works, but the client has no way to confirm what was actually stored.

### 🧠 Option 2: Return the same object you received

```java
@PostMapping("jobPosts")
public JobPost addJob(@RequestBody JobPost jobPost) {
    service.addJob(jobPost);
    return jobPost;
}
```

Better — the client can see what was accepted. But you're just echoing back what was sent, not confirming it was actually stored.

### 🧠 Option 3: Return the object fetched from the data source (recommended)

```java
@PostMapping("jobPosts")
public JobPost addJob(@RequestBody JobPost jobPost) {
    service.addJob(jobPost);
    return service.getJob(jobPost.getPostId());
}
```

This is the best approach. You add the object, then **fetch it back** from the collection. This confirms to the client that the data was actually stored — not just received. The response contains the data as it exists in the system.

### 💡 Insight

In real-world APIs with databases, the server often generates certain fields (like auto-incremented IDs or timestamps). Returning the saved object lets the client see these server-generated values.

---

## Concept 6: JSON Is Not the Only Option

### 🧠 Can you send XML instead?

Yes! REST APIs can accept XML data too, not just JSON. However, JSON is the default, and sending XML requires some extra configuration. For now, we're sticking with JSON — it's simpler and more widely used.

---

## ✅ Key Takeaways

- Use `@PostMapping` for endpoints that **create** new resources
- `@RequestBody` converts incoming JSON into a Java object — it's the counterpart of `@ResponseBody`
- The same URL (`/jobPosts`) can handle both GET and POST — the HTTP method differentiates them
- In Postman, use **Body → raw → JSON** to send data with POST requests
- Return the saved object from POST endpoints so the client can confirm what was stored

## ⚠️ Common Mistakes

- Forgetting `@RequestBody` on the parameter — Spring won't know to read the JSON from the request body, and all fields will be `null`
- Sending a POST request but forgetting to set the body format to JSON in Postman — the server can't parse plain text as a Java object
- Using `@GetMapping` instead of `@PostMapping` — GET requests don't carry a body
- Returning `void` and having no way to confirm the data was stored

## 💡 Pro Tips

- Always return something meaningful from POST endpoints — at minimum, the created object
- Remember: `@RestController` handles `@ResponseBody` for you, but you still need to explicitly add `@RequestBody` on parameters
- The JSON field names must match the Java object's field names for automatic mapping to work
- Next up: we'll tackle updating and deleting resources to complete the full CRUD operation set
