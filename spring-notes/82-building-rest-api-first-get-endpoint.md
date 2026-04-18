# Building the REST API Back End — First GET Endpoint

## Introduction

The tooling is ready — React front end, Postman, and our understanding of REST. Now it's time to actually **build the back end**. We're going to create a new Spring Boot project that returns **JSON data** instead of JSP pages, starting with our first endpoint: fetching all job posts.

---

## Concept 1: Creating a New Spring Boot Project

### 🧠 Why a new project?

We already have the Job Portal project from earlier, but that one was built around JSP views. Instead of modifying it, we'll create a **fresh project** — cleaner and less confusing.

The good news? We can **reuse** most of the existing code:

| Reuse ✅              | Don't need ❌                    |
|-----------------------|----------------------------------|
| Model (`JobPost`)     | JSP view pages                   |
| Repository (`JobRepo`)| View resolver properties         |
| Service (`JobService`)| Old controller (returns views)   |

Only the **controller** needs to be rewritten — everything else stays the same.

### ⚙️ Project setup on Spring Initializr

| Setting       | Value              |
|---------------|--------------------|
| Build tool    | Maven              |
| Language      | Java 21            |
| Packaging     | JAR                |
| Dependencies  | **Spring Web**, **Lombok** |

That's it — just two dependencies. Generate the project, unzip, and open it in IntelliJ.

### ⚙️ Copying the reusable code

From the old project, copy these three packages into the new project:
- `model` (contains `JobPost`)
- `repo` (contains `JobRepo`)
- `service` (contains `JobService`)

### ⚠️ Common Mistake

When you copy classes from one project to another, the **package names** will be different. You'll need to update the import statements in the copied files to match the new project's package structure. Watch out for compilation errors after pasting.

---

## Concept 2: Writing the REST Controller — First Attempt

### 🧠 What changes from before?

In the old project, the controller returned a **view name** (a String pointing to a JSP page). Now, we want to return **actual data** — a list of job posts as JSON.

### ⚙️ Step by step

Here's what we write:

```java
@Controller
public class JobRestController {

    @Autowired
    private JobService service;

    @GetMapping("jobPosts")
    public List<JobPost> getAllJobs() {
        return service.getAllJobs();
    }
}
```

Notice the differences from the old controller:

| Old Controller (MVC)                        | New Controller (REST)                        |
|---------------------------------------------|----------------------------------------------|
| Returns `String` (view name like `"home"`)  | Returns `List<JobPost>` (actual data)        |
| URL was a verb: `/viewAllJobs`              | URL is a noun: `/jobPosts`                   |
| Spring looks for a JSP page to render       | We want Spring to return JSON directly       |

### 🧪 Running and testing

Start the application and hit `http://localhost:8080/jobPosts` in the browser.

**Result: 500 Internal Server Error!**

```
Circular view path [jobPosts]: would dispatch back to the current handler URL
```

### ❓ What went wrong?

Spring is trying to find a **view** named `jobPosts` — a JSP page or template. But we don't have one! We want to return data, not a page.

The problem is the `@Controller` annotation. When you use `@Controller`, Spring assumes every return value is a **view name**. It doesn't know we want to return JSON data directly.

---

## Concept 3: The Fix — @ResponseBody

### 🧠 What is @ResponseBody?

Adding `@ResponseBody` to a method tells Spring: **"Don't look for a view. The return value IS the response body. Convert it to JSON and send it."**

```java
@Controller
public class JobRestController {

    @Autowired
    private JobService service;

    @GetMapping("jobPosts")
    @ResponseBody
    public List<JobPost> getAllJobs() {
        return service.getAllJobs();
    }
}
```

### ⚙️ What happens now?

1. Client sends `GET /jobPosts`
2. Spring calls `getAllJobs()`
3. The method returns `List<JobPost>`
4. `@ResponseBody` tells Spring: "Convert this list to JSON and send it as the HTTP response body"
5. Client receives JSON data

### 🧪 Testing again

Restart the application and hit the same URL:

**Browser:** `http://localhost:8080/jobPosts` → JSON data appears!

**Postman:** GET `http://localhost:8080/jobPosts` → Click Send → Clean JSON response. Click **Pretty** to format it nicely.

It works! We're returning JSON, not a view.

### 💡 Insight

Spring Boot uses **Jackson** (a JSON library) behind the scenes to automatically convert your Java objects into JSON. You don't need to write any serialization code — just return the object, and Spring handles the rest.

---

## Concept 4: The Better Way — @RestController

### 🧠 The problem with @ResponseBody

If every method in your controller returns data (not views), you'd have to put `@ResponseBody` on **every single method**. That's repetitive.

### ⚙️ The solution

Replace `@Controller` + `@ResponseBody` with a single annotation: **`@RestController`**

```java
@RestController
public class JobRestController {

    @Autowired
    private JobService service;

    @GetMapping("jobPosts")
    public List<JobPost> getAllJobs() {
        return service.getAllJobs();
    }
}
```

`@RestController` = `@Controller` + `@ResponseBody` on every method.

It tells Spring: **"This entire controller returns data, not views. Always treat return values as response bodies."**

### 🧪 Testing

Restart and test in Postman — same result. JSON data returned perfectly.

### 💡 Insight

In practice, you'll almost always use `@RestController` when building REST APIs. Use `@Controller` only when you're building traditional MVC applications that return views (JSP, Thymeleaf, etc.).

---

## Concept 5: What Happens with Wrong HTTP Methods?

### 🧠 Method mismatch

Our endpoint is mapped with `@GetMapping`. What happens if you send a **POST** request to the same URL?

In Postman, change GET to POST, hit `http://localhost:8080/jobPosts`, and click Send.

**Result: 405 Method Not Allowed**

Spring says: "I have a handler for `GET /jobPosts`, but not for `POST /jobPosts`. Method not allowed."

### 💡 Insight

This is REST working as designed. The URL is the same (`/jobPosts`), but the server only responds to the HTTP methods you've explicitly mapped. If you haven't created a `@PostMapping` for that URL, POST requests are rejected. This keeps your API predictable and secure.

---

## ✅ Key Takeaways

- Reuse model, repo, and service from the old project — only the **controller** changes
- `@Controller` assumes you're returning view names — it tries to find JSP/template files
- `@ResponseBody` tells Spring to return data as JSON instead of looking for a view
- **`@RestController`** = `@Controller` + `@ResponseBody` — use this for REST APIs
- Spring Boot automatically converts Java objects to JSON using Jackson
- Sending the wrong HTTP method to an endpoint returns **405 Method Not Allowed**

## ⚠️ Common Mistakes

- Using `@Controller` instead of `@RestController` and wondering why you get 500 errors about view resolvers
- Forgetting to update package names after copying classes from another project
- Having the old project still running on port 8080 — stop it first or you'll get a port conflict
- Sending a POST request to a GET-only endpoint and not understanding the 405 error

## 💡 Pro Tips

- Use `@RestController` by default when building REST APIs — only use `@Controller` for MVC/view-based apps
- Use REST-style nouns in your URLs (`/jobPosts`) instead of verbs (`/viewAllJobs`)
- Install a JSON formatter extension in your browser to make raw JSON responses readable
- Always check Postman is using the correct HTTP method before clicking Send — it's an easy mistake
