# Fetching a Single Resource with @PathVariable

## Introduction

We can fetch **all** job posts — great. But what if you only want **one specific** job post? Say, the one with ID 3? You shouldn't have to download all five posts and search through them on the client side. The server should do that work for you.

In this section, we'll build an endpoint to fetch a single job post by its ID, and learn about a key annotation: `@PathVariable`.

---

## Concept 1: Designing the URL for a Single Resource

### 🧠 How do you ask for one specific resource?

In REST, the pattern is straightforward:

- `/jobPosts` → all job posts (collection)
- `/jobPosts/3` → the job post with ID 3 (single resource)

The ID becomes part of the URL path itself. This is what we call a **URI** (Uniform Resource Identifier) — you're identifying a specific resource by its unique ID right in the URL.

### 🧪 What happens if we try this now?

In Postman, send: `GET http://localhost:8080/jobPost/3`

**Result: 404 Not Found**

Why? Because we haven't created a controller method that handles this URL pattern. Spring doesn't know what to do with `/jobPost/3`.

---

## Concept 2: Building the Controller Method — Hardcoded First

### 🧠 Start simple, then make it dynamic

Let's first get it working with a hardcoded ID, then make it dynamic.

```java
@GetMapping("jobPost")
public JobPost getJob() {
    return service.getJob(3); // hardcoded for now
}
```

Notice the return type is `JobPost` (singular), not `List<JobPost>`. We're fetching exactly one resource.

### ⚙️ Building the service and repo methods

The chain of method calls follows the layered architecture:

**Controller** → calls **Service** → calls **Repository**

We need to create `getJob(int postId)` in both the service and repository layers.

**Service layer:**
```java
public JobPost getJob(int postId) {
    return repo.getJob(postId);
}
```

**Repository layer:**
```java
public JobPost getJob(int postId) {
    for (JobPost job : jobs) {
        if (job.getPostId() == postId) {
            return job;
        }
    }
    return null; // not found
}
```

The repo iterates through all jobs, checks if the `postId` matches, and returns the matching job. If no match is found, it returns `null`.

### 🧪 Testing the hardcoded version

Restart and hit `GET http://localhost:8080/jobPost/3` in Postman — we get the data for post ID 3.

But try `GET http://localhost:8080/jobPost/2` — still returns post 3! Because the value is hardcoded. Time to make it dynamic.

---

## Concept 3: Making It Dynamic with @PathVariable

### 🧠 What is @PathVariable?

`@PathVariable` is an annotation that extracts a value from the **URL path** and binds it to a method parameter.

### ⚙️ How to use it

**Step 1:** Use curly braces `{}` in the URL mapping to define a path variable:

```java
@GetMapping("jobPost/{postId}")
```

The `{postId}` is a placeholder — it tells Spring that this part of the URL is dynamic.

**Step 2:** Accept the value in your method parameter with `@PathVariable`:

```java
@GetMapping("jobPost/{postId}")
public JobPost getJob(@PathVariable int postId) {
    return service.getJob(postId);
}
```

Now when someone hits `/jobPost/3`, Spring extracts `3` from the URL, assigns it to `postId`, and passes it to the method.

### 🧪 How URLs map to values

| URL                  | `postId` value |
|----------------------|----------------|
| `/jobPost/1`         | 1              |
| `/jobPost/3`         | 3              |
| `/jobPost/5`         | 5              |
| `/jobPost/42`        | 42             |

### ❓ How is this different from @RequestParam?

Remember `@RequestParam` from earlier in the course? That extracts values from the **query string** (after the `?`):

```
/jobPost?postId=3    →  @RequestParam
/jobPost/3           →  @PathVariable
```

| Feature         | @RequestParam          | @PathVariable         |
|-----------------|------------------------|-----------------------|
| URL format      | `/jobPost?postId=3`    | `/jobPost/3`          |
| Value source    | Query string           | URL path              |
| REST-friendly   | Less common            | Standard REST pattern |

In REST APIs, `@PathVariable` is the standard way to identify specific resources.

---

## Concept 4: Multiple Path Variables

### 🧠 What if you need more than one?

You can have multiple path variables in a single URL:

```java
@GetMapping("jobPost/{postId}/{something}")
public JobPost getJob(@PathVariable int postId, @PathVariable String something) {
    // ...
}
```

When you have multiple path variables, you may need to specify which placeholder maps to which parameter — especially if the names differ:

```java
@PathVariable("postId") int id
```

But if the **variable name in curly braces matches the parameter name**, Spring figures it out automatically. You can skip the explicit name.

---

## Concept 5: What Happens When a Resource Isn't Found?

### 🧠 The null case

If you request a post ID that doesn't exist — say `/jobPost/99` — the repository loop finds no match and returns `null`. The controller sends back `null` as the response, which shows up as an empty response in Postman.

### 💡 Insight

Returning `null` works for now, but in a real application you'd typically return a **404 Not Found** response with a meaningful error message. We'll keep it simple for now, but keep this in mind — proper error handling is important for production APIs.

---

## ✅ Key Takeaways

- To fetch a single resource, include its **ID in the URL path**: `/jobPost/3`
- Use `{curly braces}` in `@GetMapping` to define dynamic path segments
- `@PathVariable` extracts values from the URL path and binds them to method parameters
- If the path variable name matches the parameter name, you don't need to specify it explicitly
- `@PathVariable` is for path segments (`/jobPost/3`), `@RequestParam` is for query strings (`/jobPost?id=3`)
- REST APIs prefer `@PathVariable` for identifying specific resources

## ⚠️ Common Mistakes

- Forgetting `@PathVariable` on the method parameter — Spring won't extract the value from the URL
- Not using curly braces in the mapping (`@GetMapping("jobPost/postId")` instead of `@GetMapping("jobPost/{postId}")`) — Spring treats it as a literal string
- Mismatching the variable name in curly braces with the parameter name — either use the same name or specify it explicitly

## 💡 Pro Tips

- Always start with a hardcoded value to verify the flow works, then make it dynamic — it's easier to debug
- Use meaningful variable names in your path — `{postId}` is clearer than `{id}` when you have multiple resources
- In the next section, we'll learn how to **send data** to the server — creating new resources with POST requests
