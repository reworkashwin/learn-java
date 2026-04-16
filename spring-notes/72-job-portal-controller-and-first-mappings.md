# 🎮 Building the Job Portal Backend — Controller, First Mappings

## 🎯 Introduction

Time to write Java. We've examined the views, we know the five URLs to map, and we understand the data model. Now we start building the backend — starting with the controller, the first request mappings, and the application properties.

In this lesson, we'll:
- Configure **View Resolver** properties in `application.properties`
- Create the `JobController` with `@Controller`
- Map the homepage to **two URLs** (`/` and `/home`) using a single method
- Map the add job page to `/addjob`
- Discover that the form submission (`/handleForm`) needs a POST handler — which we haven't built yet

---

## 🧩 Concept 1: Setting Up application.properties

### ⚙️ The View Resolver Configuration

Before writing any controller, we set up the View Resolver in `application.properties`:

```properties
spring.mvc.view.prefix=/views/
spring.mvc.view.suffix=.jsp
```

This is the same configuration we've used before:
- **prefix** `/views/` — JSP files are in the `webapp/views/` folder
- **suffix** `.jsp` — All view files have the `.jsp` extension

When a controller returns `"home"`, the View Resolver resolves it to `/views/home.jsp`.

### 💡 One and Done

This is the only time we touch `application.properties` for this project. Set it once, close the file, move on.

---

## 🧩 Concept 2: The Project Architecture — Layers

### 🧠 Planning the Backend Structure

Before coding, let's plan the layers we'll need:

```
Controller Layer    →  Handles HTTP requests, returns views
Service Layer       →  Business logic
Repository Layer    →  Data access (no database yet, but ready for one)
Model Layer         →  Data classes (JobPost)
```

Even though we're not using a database, we create a **repository layer** now. Why? Because when we add a database later, we just swap the repo implementation — the controller and service layers don't change. This is good architecture.

### 📁 Package Structure

```
com.telusko.jobapp/
├── JobAppApplication.java       ← Main class (don't touch)
├── controller/
│   └── JobController.java       ← Handles requests
├── service/
│   └── JobService.java          ← Business logic
├── repo/
│   └── JobRepo.java             ← Data access
└── model/
    └── JobPost.java             ← Data model
```

---

## 🧩 Concept 3: Creating the Controller — @Controller

### 🧪 The JobController Class

```java
@Controller
public class JobController {

}
```

That's the starting point. The `@Controller` annotation tells Spring: *"This class handles HTTP requests. Component scan will find it, and DispatcherServlet will route requests to it."*

---

## 🧩 Concept 4: Mapping the Homepage — Two URLs, One Method

### 🧠 The Requirement

The homepage should be accessible via:
- `/` — The root URL (typing `localhost:8080/`)
- `/home` — Clicking the "Home" link in the nav bar

Both should show the same page: `home.jsp`.

### 🧪 The Code

```java
@RequestMapping({"/", "home"})
public String home() {
    return "home";
}
```

### 🔍 Key Detail: Multiple URLs in One Mapping

Notice the curly braces: `{"/", "home"}`. This is an **array** of URL patterns. The method will be called for either URL.

This is equivalent to writing two separate methods:

```java
// This works but is redundant
@RequestMapping("/")
public String home1() { return "home"; }

@RequestMapping("home")
public String home2() { return "home"; }
```

The array syntax is cleaner — one method, multiple URLs, same behavior.

### 🔄 Testing

After running the application:
- `localhost:8080/` → Homepage loads ✅
- `localhost:8080/home` → Same homepage loads ✅
- Click "View All Jobs" → 404 (not mapped yet) ❌
- Click "Add Job" → 404 (not mapped yet) ❌

Progress! The homepage works.

---

## 🧩 Concept 5: Mapping the Add Job Page

### 🧪 The Code

```java
@RequestMapping("addjob")
public String addJob() {
    return "addJob";
}
```

### ⚠️ Case Sensitivity Matters!

The view file is `addJob.jsp` — with a capital `J`. If you return `"addjob"` (lowercase), the View Resolver looks for `/views/addjob.jsp`, which doesn't exist.

The return value must **exactly match** the filename (minus the extension):
- File: `addJob.jsp` → Return: `"addJob"` ✅
- File: `addJob.jsp` → Return: `"addjob"` ❌ (404)

### 🔄 Testing

After restart:
- Click "Add Job" → The form page loads ✅
- Fill in the form, click Submit → Error ❌

### ❓ Why Does Submit Fail?

Looking at the form in `addJob.jsp`:

```html
<form action="handleForm" method="post">
```

When you click Submit, the browser sends a **POST request** to `/handleForm`. We haven't created a controller method for that URL yet — so we get an error.

---

## 🧩 Concept 6: The Controller So Far

### 📋 Current State

```java
@Controller
public class JobController {

    @RequestMapping({"/", "home"})
    public String home() {
        return "home";
    }

    @RequestMapping("addjob")
    public String addJob() {
        return "addJob";
    }
}
```

### 📋 URL Mapping Progress

| # | URL | Method | Status |
|---|-----|--------|--------|
| 1 | `/` | GET | ✅ Mapped |
| 2 | `/home` | GET | ✅ Mapped |
| 3 | `/viewalljobs` | GET | ❌ Not yet |
| 4 | `/addjob` | GET | ✅ Mapped |
| 5 | `/handleForm` | POST | ❌ Not yet |

Three down, two to go. The remaining two are the interesting ones — they involve **data**. `/viewalljobs` needs to fetch and pass a list of jobs. `/handleForm` needs to receive form data via a **POST request**.

---

## 🧩 Concept 7: What's Different About POST?

### 🧠 A Preview

So far, every request we've handled has been a **GET request** — the browser asks for a page, and we return it. That's the default.

The form submission is different:
- It's a **POST request** — data is being sent *to* the server
- The form data (postId, postProfile, postDesc, etc.) travels in the **request body**, not the URL
- We need to tell Spring this method handles POST, not GET

In the next lesson, we'll:
- Handle the POST request for `/handleForm`
- Use `@ModelAttribute` to bind form data to a `JobPost` object
- Pass the created job to the success page
- Build the `JobPost` model class

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. **`application.properties`** configured with `prefix=/views/` and `suffix=.jsp` — same as before.
2. The project follows a **layered architecture**: Controller → Service → Repository → Model.
3. **Multiple URLs can map to one method** using array syntax: `@RequestMapping({"/", "home"})`.
4. The return value from a controller method must **exactly match** the JSP filename (case-sensitive).
5. Three of five URLs are mapped — homepage (`/` and `/home`) and add job page (`/addjob`).
6. The form submit fails because `/handleForm` with **POST method** isn't mapped yet.

### ⚠️ Common Mistakes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Return value case doesn't match filename | 404 — View not found | `"addJob"` not `"addjob"` if file is `addJob.jsp` |
| Forgetting to add `@Controller` | Spring doesn't detect the class | Always annotate your controller |
| Not restarting the server after changes | Old mappings still active | Restart Tomcat after code changes |
| Missing prefix/suffix in properties | View names don't resolve to files | Configure `spring.mvc.view.prefix` and `suffix` |

### 💡 Pro Tips

1. **Map the easy endpoints first.** Homepage and static page navigation don't involve data — get them working before tackling form submissions and data passing.
2. **Test after every mapping.** Don't write all five methods and then test. Write one, test it, confirm it works, move to the next. Incremental development catches errors early.
3. **Check the URL in the browser.** When something doesn't work, look at what URL the browser is hitting — it tells you exactly which mapping is missing.
4. **Prepare the repo layer even without a database.** It makes the transition to a real database seamless later and follows professional patterns from day one.
