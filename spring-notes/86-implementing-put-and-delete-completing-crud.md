# Implementing PUT and DELETE — Completing CRUD

## Introduction

We've covered GET (read) and POST (create). Now let's complete the full CRUD cycle with **PUT** (update) and **DELETE** (delete). By the end of this section, our REST API will support all four operations — and we'll test both using Postman.

---

## Concept 1: Updating a Resource with PUT

### 🧠 The scenario

Let's say we have a "Front End Developer" job post with ID 2. We want to:
- Change the profile from "Front End Developer" to "React Developer"
- Change the required experience from 3 to 2

How do we tell the server to update this specific resource?

### ⚙️ The Postman side

1. Change the method to **PUT**
2. URL: `http://localhost:8080/jobPosts`
3. Body → raw → JSON:

```json
{
    "postId": 2,
    "postProfile": "React Developer",
    "postDesc": "Experience in building front-end applications",
    "reqExperience": 2,
    "postTechStack": ["React", "JavaScript", "CSS"]
}
```

4. Click Send

But if we try this now — **405 Method Not Allowed**. Not 404 (the URL exists), but 405 (the URL doesn't accept PUT). We need to build the controller method.

### ⚙️ The controller

```java
@PutMapping("jobPosts")
public JobPost updateJob(@RequestBody JobPost jobPost) {
    service.updateJob(jobPost);
    return service.getJob(jobPost.getPostId());
}
```

Notice the pattern:
- Same URL as GET and POST (`jobPosts`) — the method (`@PutMapping`) is what differentiates it
- `@RequestBody` to accept the updated JSON data — same as POST
- Returns the updated object fetched from the repo to confirm the changes were actually saved

### ⚙️ The service layer

Nothing special — just pass through to the repo:

```java
public void updateJob(JobPost jobPost) {
    repo.updateJob(jobPost);
}
```

### ⚙️ The repository layer — Where the real logic lives

```java
public void updateJob(JobPost jobPost) {
    for (JobPost jp : jobs) {
        if (jp.getPostId() == jobPost.getPostId()) {
            jp.setPostProfile(jobPost.getPostProfile());
            jp.setPostDesc(jobPost.getPostDesc());
            jp.setReqExperience(jobPost.getReqExperience());
            jp.setPostTechStack(jobPost.getPostTechStack());
            return;
        }
    }
}
```

The logic:
1. Loop through all jobs
2. Find the one with the matching `postId`
3. Update **all** fields with the new values
4. Done

### ❓ Why not check which fields actually changed?

You could compare each field and only update the ones that differ. But setting all fields is simpler and faster than checking each one first. In a real database scenario, you might consider partial updates for performance — but for an in-memory list, just set everything.

### 🧪 Testing

1. Send `PUT http://localhost:8080/jobPosts` with the updated JSON → 200 OK, returns the updated object
2. Send `GET http://localhost:8080/jobPosts` → Post ID 2 now shows "React Developer" with experience 2

It works!

---

## Concept 2: Deleting a Resource with DELETE

### 🧠 The scenario

We want to delete the job post with ID 3. How do we tell the server?

In REST, the URL pattern for deleting a specific resource is:

```
DELETE /jobPosts/3
```

The ID goes in the **path** — just like when we fetched a single resource with GET.

### ⚙️ The controller

```java
@DeleteMapping("jobPosts/{postId}")
public String deleteJob(@PathVariable int postId) {
    service.deleteJob(postId);
    return "Deleted";
}
```

Key differences from PUT:
- We use `@PathVariable` (not `@RequestBody`) — the ID comes from the URL, not from a JSON body
- Return type is `String` — just a simple confirmation message
- URL includes `{postId}` — identifying which resource to delete

### ⚙️ The service layer

```java
public void deleteJob(int postId) {
    repo.deleteJob(postId);
}
```

### ⚙️ The repository layer

```java
public void deleteJob(int postId) {
    for (JobPost jp : jobs) {
        if (jp.getPostId() == postId) {
            jobs.remove(jp);
            return;
        }
    }
}
```

Find the matching job, remove it from the list, and return immediately.

### ⚠️ Watch out: ConcurrentModificationException

If you try to remove an element from a list **while iterating over it** with a for-each loop, you may get a `ConcurrentModificationException`. This happens because the for-each loop uses an iterator internally, and modifying the list during iteration breaks the iterator's contract.

The code above works because we `return` immediately after `remove()` — the loop doesn't continue. But if you tried to keep iterating after removing, you'd hit this error.

### 🧪 Testing

1. Send `DELETE http://localhost:8080/jobPosts/3` → Response: "Deleted"
2. Send `GET http://localhost:8080/jobPosts` → Post ID 3 is gone from the list

---

## Concept 3: The Complete REST Controller — All CRUD Operations

### 🧠 Putting it all together

Here's what our controller now looks like with all four CRUD operations:

```java
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class JobRestController {

    @Autowired
    private JobService service;

    // READ all
    @GetMapping("jobPosts")
    public List<JobPost> getAllJobs() {
        return service.getAllJobs();
    }

    // READ one
    @GetMapping("jobPost/{postId}")
    public JobPost getJob(@PathVariable int postId) {
        return service.getJob(postId);
    }

    // CREATE
    @PostMapping("jobPosts")
    public JobPost addJob(@RequestBody JobPost jobPost) {
        service.addJob(jobPost);
        return service.getJob(jobPost.getPostId());
    }

    // UPDATE
    @PutMapping("jobPosts")
    public JobPost updateJob(@RequestBody JobPost jobPost) {
        service.updateJob(jobPost);
        return service.getJob(jobPost.getPostId());
    }

    // DELETE
    @DeleteMapping("jobPosts/{postId}")
    public String deleteJob(@PathVariable int postId) {
        service.deleteJob(postId);
        return "Deleted";
    }
}
```

### 💡 Insight — See the pattern?

| CRUD Operation | Annotation        | URL                  | Accepts         | Returns               |
|----------------|-------------------|----------------------|-----------------|-----------------------|
| Read all       | `@GetMapping`     | `/jobPosts`          | Nothing         | `List<JobPost>`       |
| Read one       | `@GetMapping`     | `/jobPost/{postId}`  | `@PathVariable` | `JobPost`             |
| Create         | `@PostMapping`    | `/jobPosts`          | `@RequestBody`  | `JobPost`             |
| Update         | `@PutMapping`     | `/jobPosts`          | `@RequestBody`  | `JobPost`             |
| Delete         | `@DeleteMapping`  | `/jobPosts/{postId}` | `@PathVariable` | `String`              |

The URL stays the same noun (`jobPosts`). The HTTP method defines the action. This is REST.

---

## Concept 4: @RequestBody vs @PathVariable — When to Use Which

### 🧠 The decision is simple

- **Sending a full object** (create, update) → `@RequestBody` — the data comes in the request body as JSON
- **Sending just an ID** (get one, delete) → `@PathVariable` — the identifier goes in the URL path

```
POST   /jobPosts        + JSON body    →  @RequestBody
PUT    /jobPosts        + JSON body    →  @RequestBody
GET    /jobPosts/3                     →  @PathVariable
DELETE /jobPosts/3                     →  @PathVariable
```

---

## ✅ Key Takeaways

- `@PutMapping` handles update operations — send the full updated object in the request body
- `@DeleteMapping` handles delete operations — pass the resource ID in the URL path
- All four CRUD operations can share the same base URL (`/jobPosts`) — the HTTP method differentiates them
- Use `@RequestBody` when the client sends a JSON object (POST, PUT)
- Use `@PathVariable` when the client sends an ID in the URL (GET one, DELETE)
- Our REST API now supports full CRUD: Create, Read, Update, Delete

## ⚠️ Common Mistakes

- Getting a `ConcurrentModificationException` when removing from a list during iteration — always `return` immediately after `remove()` or use an iterator's `remove()` method
- Forgetting to use `@PutMapping` for updates — using `@PostMapping` will create instead of update
- Not sending the complete object in PUT requests — since we're setting all fields, missing fields will become `null`
- Confusing when to use `@RequestBody` vs `@PathVariable` — body for full objects, path for IDs

## 💡 Pro Tips

- In production, delete endpoints should verify the resource exists before trying to remove it and return appropriate status codes (404 if not found)
- The response from a delete operation could be more informative — returning the deleted object or a proper status object instead of a plain string
- Consider returning proper HTTP status codes: 201 for create, 204 for delete — we'll keep it simple for now but this matters in real APIs
