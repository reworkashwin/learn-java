# 🎮 Creating Your First Spring Boot Controller

## 🎯 Introduction

Your Spring Boot app is running, your JSP homepage (`index.jsp`) is sitting in the `webapp/` folder, but you're still staring at a **404 error**. The missing piece? A **Controller**.

In this section, we'll go through the complete journey of building your first Spring Boot controller — from creating the class, to mapping URLs, to fixing the JSP rendering issue. Along the way, we'll hit errors, debug them, and learn from each failure. That's how real development works.

**What we'll cover**:
- Creating a controller class (plain Java class, no servlet extending!)
- Using the `@Controller` annotation (stereotype annotation)
- Writing controller methods that return view names
- Debugging with `System.out.println` when things don't work
- Mapping URLs with `@RequestMapping`
- Fixing the JSP download problem with Tomcat Jasper
- Understanding `@RequestMapping` vs `@GetMapping` vs `@PostMapping`

**Why this matters**: Controllers are the heart of any Spring Boot web application. Every request your application receives flows through a controller. Mastering this concept unlocks everything else — REST APIs, form handling, data processing, and more.

---

## 🏗️ Concept 1: Creating the Controller Class

### 🧠 What is a Controller?

A controller in Spring Boot is just a **plain Java class** with special annotations. That's it. No extending `HttpServlet`, no overriding `service()` or `doGet()`, no dealing with the servlet API at all.

**Remember the servlet approach?**

```java
// Old way - Documents 45-47
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, 
                        HttpServletResponse response) throws IOException {
        // Handle request...
    }
}
```

**The Spring Boot way?**

```java
// New way - just a class!
public class HomeController {
    // Methods go here
}
```

Wait, that's it? Just a plain class? Yes — but we need to tell Spring that this class is special. We'll get to that in a moment.

### ❓ Why Not a Servlet?

Great question. Behind the scenes, Spring Boot **does** convert your controller into a servlet-like mechanism. But as a developer, you don't have to deal with that complexity.

Think of it this way:

> **Servlet**: You're building a car engine from scratch — pistons, valves, fuel injection, everything.
> **Controller**: You're driving the car. The engine exists, but you just use the steering wheel and pedals.

Spring Boot handles the "engine" (servlets, request dispatching, response handling). You handle the "driving" (business logic, view selection).

### ⚙️ How to Create It

**Step 1**: In your project's package (same package as `Application.java`), create a new Java class.

**Important**: It must be in the same package or a sub-package of your main application class. Spring Boot scans from the main class's package downward.

```
com/
└── telusko/
    └── app/
        ├── Application.java        ← Main class
        └── HomeController.java     ← NEW controller (same package)
```

**Step 2**: Write the class:

```java
package com.telusko.app;

public class HomeController {
    
}
```

**That's your controller.** But wait — Spring doesn't know this is a controller yet. It just looks like any other Java class. How do we tell Spring?

### 💡 Insight: Multiple Controllers

Notice the name: `HomeController`. Not just `Controller`. Why?

Because **you can have multiple controllers** in a project. And that makes sense:

- `HomeController` — handles homepage requests
- `StudentController` — handles student-related requests
- `ProductController` — handles product-related requests
- `AdminController` — handles admin panel requests

**One controller per domain area** is a good practice. Each controller handles requests related to its specific responsibility.

---

## 🎯 Concept 2: The @Controller Annotation

### 🧠 What is @Controller?

`@Controller` is a **stereotype annotation** in Spring. It tells the Spring framework:

> "Hey, this class is a web controller. Please manage it, scan it for request mappings, and route HTTP requests to its methods."

```java
@Controller
public class HomeController {
    
}
```

That single annotation transforms a plain Java class into a fully functional web controller.

### ❓ Why Do We Need It?

Spring Boot uses **annotations** as its primary way of communication. Instead of writing XML configuration files or complex setup code, you annotate your classes and methods to express their purpose.

**Without `@Controller`**: Spring ignores your class completely. It's just another Java class sitting in the project.

**With `@Controller`**: Spring recognizes it, creates an instance, manages its lifecycle, and routes HTTP requests to it.

### ⚙️ How It Works

When Spring Boot starts up:

```
1. SpringApplication.run() starts
    ↓
2. Component scanning begins
    ↓
3. Spring finds @Controller on HomeController
    ↓
4. Spring creates an instance of HomeController
    ↓
5. Spring registers it as a request handler
    ↓
6. Incoming requests are checked against this controller
```

### 🧪 The Stereotype Annotation Family

`@Controller` isn't the only stereotype annotation. Spring has a family of them:

| Annotation | Purpose | Use When |
|-----------|---------|----------|
| `@Component` | Generic Spring-managed bean | General purpose |
| `@Controller` | Web controller (returns views) | Handling web requests with views |
| `@RestController` | REST API controller (returns data) | Building REST APIs |
| `@Service` | Business logic layer | Service classes |
| `@Repository` | Data access layer | Database operations |

**Key insight**: `@Controller` is actually a specialized `@Component`. It carries all the behavior of `@Component` (Spring manages it) plus additional behavior specific to web request handling.

### 💡 What Happens Behind the Scenes

```
Your Code:                    What Spring Does:
@Controller          →        Creates a servlet-like handler
HomeController       →        Registers in DispatcherServlet
                     →        Maps to URL patterns
                     →        Handles request/response lifecycle
```

**You write a simple class with an annotation. Spring converts it into the full servlet machinery.** This is the power of Spring Boot — abstraction without losing functionality.

---

## 📝 Concept 3: Controller Methods — Doing the Actual Work

### 🧠 What Are Controller Methods?

A controller class by itself doesn't do anything. You need **methods** inside the controller that handle specific requests.

Remember servlets? They had `service()`, `doGet()`, `doPost()`. Controllers have methods too, but they can be **named anything you want**.

### ❓ Why Do We Need Methods?

Think about it:
- The controller handles requests for a certain area (e.g., homepage)
- But there might be multiple actions within that area
- Each action needs its own method

```java
@Controller
public class HomeController {
    
    // Method for showing the homepage
    public String home() {
        return "index.jsp";
    }
    
    // Method for showing the about page (later)
    // public String about() { return "about.jsp"; }
}
```

### ⚙️ Creating the Home Method

Let's create a method that returns the JSP page:

```java
@Controller
public class HomeController {
    
    public String home() {
        return "index.jsp";
    }
}
```

**Breaking this down**:

| Part | Meaning |
|------|---------|
| `public` | Accessible by Spring framework |
| `String` | Return type — returns the name of the view |
| `home()` | Method name (can be anything) |
| `return "index.jsp"` | Tells Spring: "Render the file called index.jsp" |

### 🔑 The Return Value Is Special

In a `@Controller` class, the **return value of a method is treated as a view name**. When you return `"index.jsp"`, Spring interprets it as:

> "Find a view technology file named `index.jsp` and render it as the response."

This is fundamentally different from the servlet approach:

```java
// Servlet approach (Documents 45-47):
// You manually write HTML to the response
PrintWriter out = response.getWriter();
out.println("<h1>Hello World</h1>");

// Controller approach:
// You just return the view name
return "index.jsp";
// Spring finds the file and renders it automatically
```

### 💡 Insight: Why String Return Type?

The return type is `String` because you're returning the **name** of the view, not the view itself. Spring's view resolver takes this name and locates the actual file.

Think of it like ordering at a restaurant:
- You say: "I'll have the pasta" (returning a name)
- The waiter finds it on the menu, tells the kitchen, and brings you the dish
- You don't go to the kitchen and cook it yourself

---

## 🚫 Attempt 1: Running Without URL Mapping — The 404 Continues

### 🧪 The Test

**Current code**:

```java
@Controller
public class HomeController {
    
    public String home() {
        return "index.jsp";
    }
}
```

**What happens when we run this?**

1. Application starts (no compilation errors)
2. Tomcat starts successfully
3. Open browser → `localhost:8080`
4. **Result: Still 404!** 😞

### 🤔 Diagnosing the Problem

The 404 persists. But what's actually going wrong? Two possibilities:

1. **The `home()` method is being called**, but it can't find `index.jsp`
2. **The `home()` method is NOT being called** at all

How do we figure out which one? The classic debugging technique: **print something to the console**.

```java
@Controller
public class HomeController {
    
    public String home() {
        System.out.println("home method called");
        return "index.jsp";
    }
}
```

**Restart → Refresh browser → Check console**

**Console output**: Nothing. No "home method called" message anywhere.

**Diagnosis**: The method isn't even being called! Spring doesn't know **when** to call it.

### ❓ Why Isn't It Being Called?

Think about what we have:
- ✅ A controller class with `@Controller`
- ✅ A method that returns a view name
- ❌ **No URL mapping!**

The method exists, but Spring doesn't know:
- Which URL should trigger this method?
- Should it respond to `/`? To `/home`? To `/students`?

**The analogy**: You hired a waiter (controller) and told them what dish to serve (return "index.jsp"), but you never told them which table to serve. They're just standing there, waiting for instructions.

### 🔗 The Connection to Servlets

Remember Document 46? The exact same problem occurred there:

```java
// Document 46 - Servlet without URL mapping = 404
// We had to explicitly map:
context.addServletMapping("/hello", "HelloServlet");
```

In servlets, we mapped URLs programmatically. In Spring Boot, we use **annotations** for mapping. But the concept is identical — **every handler needs a URL mapping**.

---

## 🗺️ Concept 4: @RequestMapping — Connecting URLs to Methods

### 🧠 What is @RequestMapping?

`@RequestMapping` is an annotation that maps a **URL pattern** to a **controller method**. It tells Spring:

> "When someone requests this specific URL, call this method."

```java
@Controller
public class HomeController {
    
    @RequestMapping("/")
    public String home() {
        System.out.println("home method called");
        return "index.jsp";
    }
}
```

### ❓ Why Do We Need It?

Every method in a controller could handle a different URL:

```java
@Controller
public class HomeController {
    
    @RequestMapping("/")
    public String home() {
        return "index.jsp";
    }
    
    @RequestMapping("/about")
    public String about() {
        return "about.jsp";
    }
    
    @RequestMapping("/students")
    public String students() {
        return "students.jsp";
    }
}
```

Without `@RequestMapping`, Spring has no idea which method to call for which URL. It's the critical link between **what the user requests** and **what code executes**.

### ⚙️ How It Works

```
Browser requests: localhost:8080/
    ↓
DispatcherServlet receives request
    ↓
Checks all @RequestMapping annotations
    ↓
Finds: @RequestMapping("/") on home()
    ↓
Calls home() method
    ↓
Gets return value "index.jsp"
    ↓
Resolves to view file
    ↓
Renders as response
```

### 🧪 The Path Parameter

The value you pass to `@RequestMapping` is the **URL path**:

| Annotation | URL That Triggers It |
|-----------|---------------------|
| `@RequestMapping("/")` | `localhost:8080/` |
| `@RequestMapping("/students")` | `localhost:8080/students` |
| `@RequestMapping("/api/data")` | `localhost:8080/api/data` |
| `@RequestMapping("/admin/dashboard")` | `localhost:8080/admin/dashboard` |

### 🔄 Comparison with Servlet URL Mapping

**Servlet approach (Document 46)**:
```java
// Three separate steps
Context context = tomcat.addContext("", null);
Tomcat.addServlet(context, "HomeServlet", new HomeServlet());
context.addServletMapping("/", "HomeServlet");
```

**Spring Boot approach**:
```java
// One annotation
@RequestMapping("/")
public String home() { ... }
```

**Same concept, dramatically simpler syntax.**

### 💡 Beyond @RequestMapping: Specialized Annotations

`@RequestMapping` handles **all HTTP methods** (GET, POST, PUT, DELETE). But Spring Boot also provides specialized annotations:

| Annotation | HTTP Method | When to Use |
|-----------|------------|-------------|
| `@RequestMapping` | All methods | General purpose |
| `@GetMapping` | GET only | Fetching/displaying data |
| `@PostMapping` | POST only | Submitting forms/creating data |
| `@PutMapping` | PUT only | Updating data |
| `@DeleteMapping` | DELETE only | Deleting data |

**For now**, `@RequestMapping` is fine. We'll explore the specific ones when we handle different HTTP methods.

---

## 🚫 Attempt 2: The Mysterious Download Problem

### 🧪 Testing with @RequestMapping

**Updated code**:

```java
@Controller
public class HomeController {
    
    @RequestMapping("/")
    public String home() {
        System.out.println("home method called");
        return "index.jsp";
    }
}
```

**Restart → Refresh browser → What happens?**

Something unexpected! The browser doesn't show "Hello World". Instead, it does something weird:

```
🔽 "Do you want to allow downloads on localhost?"
```

**What?!** The browser is trying to **download** the JSP file instead of displaying it!

### 🤔 What's Happening?

If you allow the download, you'll see a file that contains your raw JSP code:

```jsp
<%@ page language="java" %>
<html>
<body>
    <h2>Hello World</h2>
</body>
</html>
```

**The browser received the raw JSP source code** instead of processed HTML.

### ✅ The Good News

Before panicking, let's check the console:

```
home method called
```

**It's there!** The `home()` method IS being called now. The `@RequestMapping` worked!

**Progress check**:
- ✅ Controller is created
- ✅ `@Controller` annotation is working
- ✅ `@RequestMapping("/")` is routing correctly
- ✅ `home()` method is being called
- ❌ JSP is not being **rendered** — it's being sent as a raw file

### ❓ Why Is JSP Being Downloaded?

Remember from Document 48 and 50: **JSP is not just HTML**. It's a server-side technology that needs to be **compiled into a servlet** before it can produce HTML output.

**The flow should be**:

```
index.jsp → JSP Engine compiles it → Servlet → Executes → HTML output → Browser
```

**What's actually happening**:

```
index.jsp → Sent directly to browser as-is → Browser doesn't know what to do → Downloads it
```

**The problem**: Spring Boot **does not include a JSP engine by default**. It can find the file, but it can't **process** it. So it just sends the raw file to the browser.

**Why doesn't the browser display it?**
- The browser receives a file with `<%@ page ... %>` tags
- It doesn't recognize this as HTML
- The content type doesn't match a displayable format
- So the browser treats it as a download

### 💡 Insight: Why Spring Boot Doesn't Include JSP Support by Default

Spring Boot was designed with modern view technologies in mind:
- **Thymeleaf** — included with `spring-boot-starter-thymeleaf`
- **FreeMarker** — included with `spring-boot-starter-freemarker`
- **REST/JSON** — included with `spring-boot-starter-web`

JSP is considered a **legacy** view technology. Spring Boot supports it, but you need to add the processing engine manually.

---

## 🔧 Concept 5: Tomcat Jasper — The Missing JSP Engine

### 🧠 What is Tomcat Jasper?

**Tomcat Jasper** is the JSP engine (also called JSP compiler) that comes with Apache Tomcat. It's responsible for:

1. **Parsing** JSP files
2. **Compiling** them into Java servlets
3. **Executing** those servlets
4. **Returning** the generated HTML

Without Jasper, Tomcat can serve static files, handle servlets, and process HTTP requests — but it **cannot process JSP pages**.

### ❓ Why Isn't It Included?

When you added `spring-boot-starter-web` to your project, it pulled in:
- Embedded Tomcat (the server)
- Spring MVC (the framework)
- Jackson (JSON processing)

But it did **not** pull in Tomcat Jasper because:
- JSP is optional in modern applications
- Many projects use Thymeleaf or REST APIs instead
- Including it would add unnecessary weight for non-JSP projects

### ⚙️ How to Add It

**Step 1**: Go to Maven Repository ([mvnrepository.com](https://mvnrepository.com))

**Step 2**: Search for "Tomcat Jasper"

**Step 3**: Select the version that matches your embedded Tomcat version

**How to find your Tomcat version**: Check your project's external libraries. Look for `tomcat-embed-core` — its version number tells you which Jasper version to use.

For example, if your Tomcat version is `10.1.16`, use Jasper `10.1.16`.

**Step 4**: Add the dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>org.apache.tomcat</groupId>
    <artifactId>tomcat-jasper</artifactId>
    <version>10.1.16</version>
</dependency>
```

**Step 5**: Reload Maven (click the reload button in your IDE or run `mvn clean install`)

### 🧪 What Jasper Does Behind the Scenes

```
Before Jasper:
index.jsp → ??? → Raw JSP sent to browser → Download prompt

After Jasper:
index.jsp → Jasper compiles to Servlet → Servlet executes → HTML generated → Browser displays "Hello World"
```

**Detailed flow**:

```
1. Request hits controller → home() returns "index.jsp"
2. Spring's ViewResolver locates webapp/index.jsp
3. Jasper reads the JSP file
4. Jasper generates a Java servlet class from the JSP
5. Jasper compiles the servlet
6. The servlet executes (processes any Java code in the JSP)
7. The servlet produces pure HTML
8. HTML is sent to the browser
9. Browser renders "Hello World" 🎉
```

### 💡 Insight: Version Matching

**Why must Jasper's version match Tomcat's version?**

Jasper is part of the Tomcat project. Each Tomcat version has a corresponding Jasper version that's tested together. Mismatched versions can cause:
- Compilation errors
- Runtime exceptions
- Incompatible API issues

**Rule of thumb**: Always use the same version for `tomcat-embed-core` and `tomcat-jasper`.

---

## ✅ Attempt 3: It Finally Works!

### 🧪 The Final Test

**Complete code**:

```java
// HomeController.java
package com.telusko.app;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {
    
    @RequestMapping("/")
    public String home() {
        System.out.println("home method called");
        return "index.jsp";
    }
}
```

```jsp
<!-- webapp/index.jsp -->
<%@ page language="java" %>
<html>
<body>
    <h2>Hello World</h2>
</body>
</html>
```

```xml
<!-- pom.xml (new dependency added) -->
<dependency>
    <groupId>org.apache.tomcat</groupId>
    <artifactId>tomcat-jasper</artifactId>
    <version>10.1.16</version>
</dependency>
```

**Restart → Open browser → `localhost:8080` →**

### 🎉 Hello World!

**It works!** The browser displays:

```
Hello World
```

No download prompt. No 404. No error page. Just your beautiful "Hello World" rendered as an `<h2>` heading.

### 🔄 The Complete Request Flow

Let's trace the entire journey one final time:

```
1. Browser requests:     localhost:8080/
2. Tomcat receives:      HTTP GET /
3. DispatcherServlet:    Routes to HomeController
4. @RequestMapping("/"):  Matches! Calls home()
5. home() method:        Prints "home method called" to console
6. Returns:              "index.jsp"
7. ViewResolver:         Looks in webapp/ folder
8. Finds:                webapp/index.jsp
9. Tomcat Jasper:        Compiles JSP → Servlet
10. Servlet executes:    Generates HTML
11. Response:            <html><body><h2>Hello World</h2></body></html>
12. Browser renders:     Hello World (as a heading)
```

### 📋 What Made It Work: The Three Pieces

| Piece | What It Does | What Happens Without It |
|-------|-------------|------------------------|
| `@Controller` | Tells Spring this is a web controller | Class is ignored, 404 |
| `@RequestMapping("/")` | Maps `/` URL to `home()` method | Method never called, 404 |
| `tomcat-jasper` | Compiles JSP into servlet | JSP downloaded as raw file |

**All three are required.** Remove any one, and the feature breaks.

---

## 📊 The Evolution: Servlets to Controllers

### Side-by-Side Comparison

Let's see the complete picture of how we arrived here:

**Pure Servlet Approach (Documents 45-47)**:

```java
// App.java - EVERYTHING in one file
public class App {
    public static void main(String[] args) throws Exception {
        Tomcat tomcat = new Tomcat();
        tomcat.setPort(8080);
        Context context = tomcat.addContext("", null);
        Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
        context.addServletMapping("/", "HelloServlet");
        tomcat.start();
        tomcat.getServer().await();
    }
}

// HelloServlet.java
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, 
                        HttpServletResponse response) throws IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<html><body><h2>Hello World</h2></body></html>");
    }
}
```

**Spring Boot Controller Approach (This Document)**:

```java
// Application.java - auto-generated, no changes needed
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// HomeController.java
@Controller
public class HomeController {
    @RequestMapping("/")
    public String home() {
        return "index.jsp";
    }
}
```

```jsp
<!-- webapp/index.jsp - Clean HTML -->
<%@ page language="java" %>
<html>
<body>
    <h2>Hello World</h2>
</body>
</html>
```

### What Disappeared

| Concern | Servlet Approach | Spring Boot |
|---------|-----------------|-------------|
| Server setup | `new Tomcat()`, `setPort()`, `start()`, `await()` | **Automatic** |
| Context creation | `addContext("", null)` | **Automatic** |
| Servlet registration | `Tomcat.addServlet(...)` | **Automatic** (`@Controller`) |
| URL mapping | `addServletMapping(...)` | `@RequestMapping("/")` |
| Extending HttpServlet | Required | **Not needed** |
| Response handling | `PrintWriter`, `getWriter()`, `println()` | Just return view name |
| HTML in Java | Embedded strings | **Separate JSP file** |

**Lines of boilerplate eliminated**: ~15-20 lines of infrastructure code, replaced by 2 annotations.

---

## 📚 Key Concepts Summary

### ✅ What We Learned

1. **Controllers are plain Java classes**
   - No need to extend `HttpServlet`
   - Just create a class and annotate with `@Controller`
   - Spring handles everything else

2. **@Controller annotation**
   - Stereotype annotation (specialized `@Component`)
   - Tells Spring: "This class handles web requests"
   - Spring auto-creates instances and manages lifecycle

3. **Controller methods return view names**
   - Return type is `String`
   - The string is the name of the view file (e.g., `"index.jsp"`)
   - Spring's ViewResolver finds and renders the actual file

4. **@RequestMapping maps URLs to methods**
   - `@RequestMapping("/")` — handles the homepage
   - `@RequestMapping("/students")` — handles `/students`
   - Without this, methods never get called (404)

5. **Tomcat Jasper is required for JSP**
   - Spring Boot doesn't include JSP support by default
   - Without Jasper: JSP files are downloaded, not rendered
   - Add `tomcat-jasper` dependency with matching Tomcat version

6. **Specialized mapping annotations exist**
   - `@GetMapping` — GET requests only
   - `@PostMapping` — POST requests only
   - `@PutMapping`, `@DeleteMapping` — for other HTTP methods
   - We'll explore these in future lessons

### ⚠️ Common Mistakes

1. **❌ Forgetting @Controller annotation**
   ```java
   // BAD - Spring ignores this class
   public class HomeController { ... }
   
   // GOOD
   @Controller
   public class HomeController { ... }
   ```

2. **❌ Forgetting @RequestMapping**
   ```java
   // BAD - Method never gets called
   public String home() { return "index.jsp"; }
   
   // GOOD
   @RequestMapping("/")
   public String home() { return "index.jsp"; }
   ```

3. **❌ Missing Tomcat Jasper dependency**
   ```
   Symptom: Browser downloads JSP file instead of rendering it
   Fix: Add tomcat-jasper to pom.xml
   ```

4. **❌ Mismatched Jasper version**
   ```xml
   <!-- BAD - version mismatch -->
   <artifactId>tomcat-embed-core</artifactId> <!-- version 10.1.16 -->
   <artifactId>tomcat-jasper</artifactId>      <!-- version 9.0.x ❌ -->
   
   <!-- GOOD - versions match -->
   <artifactId>tomcat-embed-core</artifactId> <!-- version 10.1.16 -->
   <artifactId>tomcat-jasper</artifactId>      <!-- version 10.1.16 ✅ -->
   ```

5. **❌ Controller in wrong package**
   ```
   BAD:  com.other.package.HomeController (Spring won't scan it)
   GOOD: com.telusko.app.HomeController (same package as Application.java)
   ```

### 💡 Pro Tips

1. **Debugging tip**: Always add `System.out.println()` in your controller methods when debugging. If it doesn't print, the method isn't being called — check your mapping.

2. **Console is your friend**: Before panicking about a 404, check the console output. It tells you whether the problem is in routing (method not called) or rendering (method called but view not found).

3. **One step at a time**: When something doesn't work, isolate the problem:
   - Is the controller being scanned? (Check `@Controller`)
   - Is the method being called? (Add `System.out.println`)
   - Is the view being found? (Check file location)
   - Is the view being rendered? (Check Jasper dependency)

4. **JSP is legacy**: In real-world projects, most teams use Thymeleaf or build separate frontends with React/Angular. We're learning JSP for understanding, but we'll also learn how to return **data** (JSON) instead of pages.

---

## 🧪 Hands-On Exercise

### Exercise 1: The Complete Setup

Ensure your project has all three pieces working:

```
✓ HomeController.java with @Controller
✓ home() method with @RequestMapping("/")
✓ home() returns "index.jsp"
✓ webapp/index.jsp exists with JSP directive
✓ tomcat-jasper dependency in pom.xml
✓ Browser shows "Hello World" at localhost:8080
```

### Exercise 2: Add a Second Page

Try creating an "About" page:

1. Create `webapp/about.jsp` with some content
2. Add a new method in `HomeController`:
   ```java
   @RequestMapping("/about")
   public String about() {
       return "about.jsp";
   }
   ```
3. Visit `localhost:8080/about` — does it work?

### Exercise 3: Debug a Broken Setup

Remove `@RequestMapping("/")` from the `home()` method. What happens? Put it back. Now remove `@Controller` from the class. What happens? This exercise helps you understand **why each piece matters**.

---

## 🎬 What's Next

We got "Hello World" working! But this is just the beginning. Coming up:

- **Returning data instead of pages** — REST APIs with `@ResponseBody` and `@RestController`
- **Handling different HTTP methods** — `@GetMapping` vs `@PostMapping`
- **Passing data to views** — Using `Model` to send data from controller to JSP
- **Request parameters** — Reading user input from URLs and forms

The foundation is set. Every Spring Boot web feature builds on this controller → mapping → view pattern. Master this, and everything else becomes an extension of the same idea.
