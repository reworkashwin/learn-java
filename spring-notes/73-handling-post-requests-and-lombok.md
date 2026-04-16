# 📝 Handling POST Requests, JobPost Model with Lombok

## 🎯 Introduction

We've mapped the homepage and the add job page. Now comes the real action — handling the **form submission**. When a user fills in the job form and clicks Submit, the browser sends a POST request to `/handleForm`. We need to catch that request, bind the form data to a `JobPost` object, and display it on the success page.

In this lesson, we'll:
- Create the `JobPost` model class with **Lombok** annotations
- Understand `@Data`, `@AllArgsConstructor`, `@NoArgsConstructor`
- Learn the difference between `@GetMapping` and `@PostMapping`
- Handle the POST request and bind form data with `@ModelAttribute`
- Debug package import issues

---

## 🧩 Concept 1: Creating the JobPost Model Class

### 🧠 What Fields Do We Need?

Looking at the form in `addJob.jsp`, we're collecting:
- Post ID (number)
- Post Profile (text)
- Post Description (text)
- Required Experience (number)
- Tech Stack (multiple selections → list)

### 🧪 The Basic Class (Without Lombok)

If we wrote this the traditional way:

```java
public class JobPost {
    private int postId;
    private String postProfile;
    private String postDesc;
    private int reqExperience;
    private List<String> postTechStack;

    // Default constructor
    public JobPost() {}

    // All-args constructor
    public JobPost(int postId, String postProfile, String postDesc, 
                   int reqExperience, List<String> postTechStack) {
        this.postId = postId;
        this.postProfile = postProfile;
        this.postDesc = postDesc;
        this.reqExperience = reqExperience;
        this.postTechStack = postTechStack;
    }

    // Getters
    public int getPostId() { return postId; }
    public String getPostProfile() { return postProfile; }
    public String getPostDesc() { return postDesc; }
    public int getReqExperience() { return reqExperience; }
    public List<String> getPostTechStack() { return postTechStack; }

    // Setters
    public void setPostId(int postId) { this.postId = postId; }
    public void setPostProfile(String postProfile) { this.postProfile = postProfile; }
    public void setPostDesc(String postDesc) { this.postDesc = postDesc; }
    public void setReqExperience(int reqExperience) { this.reqExperience = reqExperience; }
    public void setPostTechStack(List<String> postTechStack) { this.postTechStack = postTechStack; }

    // toString
    @Override
    public String toString() {
        return "JobPost{postId=" + postId + ", postProfile='" + postProfile + "', ...}";
    }

    // equals and hashCode...
}
```

That's **50+ lines** of boilerplate for 5 fields. Every time you add a field, you add a getter, a setter, update the constructor, update `toString`... tedious and error-prone.

---

## 🧩 Concept 2: Lombok — Eliminating Boilerplate

### 🧠 What is Lombok?

Lombok is a Java library that **generates boilerplate code at compile time** using annotations. You write the annotations, and Lombok writes the getters, setters, constructors, `toString`, `equals`, and `hashCode` for you.

### 🧪 The JobPost Class with Lombok

```java
package com.telusko.jobapp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Component
public class JobPost {
    private int postId;
    private String postProfile;
    private String postDesc;
    private int reqExperience;
    private List<String> postTechStack;
}
```

That's it. **5 fields, 4 annotations, zero boilerplate.** Lombok generates everything at compile time.

### 🔍 What Each Annotation Does

| Annotation | What It Generates |
|-----------|-------------------|
| `@Data` | Getters, setters, `toString()`, `equals()`, `hashCode()` for all fields |
| `@NoArgsConstructor` | A default constructor with no parameters: `new JobPost()` |
| `@AllArgsConstructor` | A constructor with all fields as parameters: `new JobPost(1, "Java Dev", ...)` |
| `@Component` | Spring annotation — registers this class as a Spring bean so it can be injected elsewhere |

### 🧠 How `@Data` Works — Deeper Look

`@Data` is a shortcut annotation that combines:
- `@Getter` — Generates `getPostId()`, `getPostProfile()`, etc.
- `@Setter` — Generates `setPostId(int postId)`, `setPostProfile(String postProfile)`, etc.
- `@ToString` — Generates a `toString()` that prints all fields
- `@EqualsAndHashCode` — Generates `equals()` and `hashCode()` based on all fields
- `@RequiredArgsConstructor` — Generates constructor for `final` fields (if any)

One annotation replaces 40+ lines of code.

### ⚠️ Enable Annotation Processing

When using Lombok for the first time, your IDE may ask you to **enable annotation processing**. This is required because Lombok works at compile time — the IDE needs permission to let Lombok modify the compiled code.

In IntelliJ: `Settings → Build → Compiler → Annotation Processors → Enable`

---

## 🧩 Concept 3: @GetMapping and @PostMapping — Replacing @RequestMapping

### 🧠 The Problem with @RequestMapping

We've been using `@RequestMapping` for everything. But `@RequestMapping` defaults to handling **all HTTP methods** (GET, POST, PUT, DELETE). When we need to handle specifically GET or POST, we had to do:

```java
@RequestMapping(value = "handleForm", method = RequestMethod.POST)
public String handleForm(...) { ... }
```

That's verbose. Spring provides cleaner shortcuts.

### ⚙️ The Modern Way

| Old Way | New Way | Purpose |
|---------|---------|---------|
| `@RequestMapping(value = "/", method = GET)` | `@GetMapping("/")` | Handle GET requests |
| `@RequestMapping(value = "/handleForm", method = POST)` | `@PostMapping("handleForm")` | Handle POST requests |

They do the exact same thing — `@GetMapping` and `@PostMapping` are just more readable.

### 🔄 Updating the Controller

```java
@Controller
public class JobController {

    @GetMapping({"/", "home"})          // Was @RequestMapping
    public String home() {
        return "home";
    }

    @GetMapping("addjob")               // Was @RequestMapping
    public String addJob() {
        return "addJob";
    }

    @PostMapping("handleForm")          // NEW — handles POST
    public String handleForm(JobPost jobPost) {
        return "success";
    }
}
```

### 💡 Rule of Thumb

From now on:
- **Use `@GetMapping`** for requests that **retrieve** pages or data
- **Use `@PostMapping`** for requests that **submit** data (forms, creation)
- **Use `@RequestMapping`** only when you need to handle multiple HTTP methods with one method

---

## 🧩 Concept 4: Handling the Form Data

### 🧠 How Does Form Data Reach the Controller?

When the user fills the form and clicks Submit:

1. Browser collects all form field values
2. Sends a POST request to `/handleForm` with the data in the request body
3. Spring sees the method parameter `JobPost jobPost`
4. Spring creates a new `JobPost` object
5. Spring matches form field `name` attributes to `JobPost` setter methods
6. Spring calls `setPostId()`, `setPostProfile()`, etc. with the form values
7. The populated `JobPost` object is passed to your method

### 🔍 The Name Matching

```
Form field: name="postId"       →  jobPost.setPostId(value)
Form field: name="postProfile"  →  jobPost.setPostProfile(value)
Form field: name="postDesc"     →  jobPost.setPostDesc(value)
Form field: name="reqExperience"→  jobPost.setReqExperience(value)
Form field: name="postTechStack"→  jobPost.setPostTechStack(values)
```

This is `@ModelAttribute` in action — even without explicitly writing it. Spring auto-binds form data to method parameters that are objects.

### 🧪 The Handler Method

```java
@PostMapping("handleForm")
public String handleForm(JobPost jobPost) {
    // jobPost is now populated with form data
    // It's automatically added to the model (implicit @ModelAttribute)
    return "success";
}
```

The `JobPost` object is:
- Created by Spring
- Populated with form data
- Automatically added to the model (available as `${jobPost}` in the JSP)
- Used by `success.jsp` to display the submitted data

---

## 🧩 Concept 5: The Success Page — Displaying the Posted Job

### 🧠 How success.jsp Uses the Data

The success page accesses the `jobPost` object that was automatically added to the model:

```jsp
<p>${jobPost.postProfile}</p>
<p>${jobPost.postDesc}</p>
<p>${jobPost.reqExperience}</p>

<c:forEach var="tech" items="${jobPost.postTechStack}">
    <span>${tech}</span>
</c:forEach>
```

When Spring returns `"success"`, the View Resolver finds `/views/success.jsp`, and the JSP renders using the `jobPost` object from the model.

### 🔄 The Full Flow

```
User fills form → Click Submit
        ↓
POST /handleForm (form data in request body)
        ↓
Spring creates JobPost, binds form data
        ↓
handleForm(JobPost jobPost) executes
        ↓
Returns "success" → View Resolver → /views/success.jsp
        ↓
JSP renders ${jobPost.postProfile}, ${jobPost.postDesc}, etc.
        ↓
User sees the confirmation page
```

---

## 🧩 Concept 6: Debugging — Package Import Issues

### ⚠️ The Wrong Package Error

After writing the code, the success page threw an error:

```
job post cannot be resolved to a type
```

The cause? The **wrong package import** in the JSP or controller. If your project package is `com.telusko.jobapp` but you imported from a different package name, the class can't be found.

### ✅ The Fix

Make sure all classes use the correct base package:

```java
package com.telusko.jobapp.model;      // Model
package com.telusko.jobapp.controller;  // Controller
```

And imports match:

```java
import com.telusko.jobapp.model.JobPost;
```

### 💡 Always verify your `pom.xml` group/artifact coordinates match your package structure. Mismatches between the project name in the IDE and the actual package name are a common source of import errors.

---

## 🧩 Concept 7: What's Still Missing

### ❓ Is the Data Being Saved?

Right now, the form submits, the success page shows the data — but **nothing is persisted**. If you go back to "View All Jobs," the job you just added won't be there.

Why? Because we're not storing the `JobPost` object anywhere. It exists only for the duration of that one request.

### 📋 What's Next

1. **Create a Service layer** — Business logic for managing jobs
2. **Create a Repository layer** — In-memory storage (later a database)
3. **Map `/viewalljobs`** — Fetch stored jobs and pass to the view
4. **Save submitted jobs** — Store them in the repository when the form is submitted

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. **Lombok** eliminates boilerplate: `@Data` (getters/setters/toString), `@NoArgsConstructor`, `@AllArgsConstructor`.
2. **`@GetMapping`** replaces `@RequestMapping` for GET requests. **`@PostMapping`** replaces it for POST requests. Cleaner and more explicit.
3. Spring **auto-binds form data** to method parameters — form field `name` attributes must match the model class field names.
4. The `JobPost` object in a `@PostMapping` handler is **automatically added to the model** and accessible in the JSP via `${jobPost}`.
5. **Package imports matter** — make sure your class imports match your actual package structure (`com.telusko.jobapp`).
6. Data is **not persisted yet** — the submitted job only exists for one request. Service and repo layers are needed.

### ⚠️ Common Mistakes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Using `@GetMapping` for form submission | 405 Method Not Allowed | Use `@PostMapping` for POST requests |
| Wrong package import in controller | Class not found at runtime | Verify imports match `com.telusko.jobapp.model.JobPost` |
| Not enabling annotation processing for Lombok | Getters/setters not generated, compile errors | Enable in IDE: Settings → Annotation Processors |
| Form field `name` doesn't match model field | Null values in the bound object | Exact match: `name="postProfile"` ↔ `private String postProfile` |

### 💡 Pro Tips

1. **Lombok's `@Data` is your best friend** for model classes. One annotation replaces dozens of lines. But don't use it on entity classes with relationships (JPA) — use explicit `@Getter`/`@Setter` instead.
2. **Prefer `@GetMapping`/`@PostMapping` over `@RequestMapping`.** They make the HTTP method explicit in the code — anyone reading the controller instantly knows which methods handle which request types.
3. **Implicit `@ModelAttribute`** — When a controller method parameter is an object (not a primitive or String), Spring automatically treats it as `@ModelAttribute` and binds request data to it. You don't need to write the annotation explicitly.
4. **Don't panic at 500 errors.** Read the error message — it usually tells you exactly what's wrong. "cannot be resolved to a type" means a class can't be found → check imports and packages.
