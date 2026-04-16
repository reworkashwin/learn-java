# 📄 Creating Your Spring Boot Homepage with JSP

## 🎯 Introduction

You've set up your Spring Boot project, the embedded Tomcat server is running, but when you visit `localhost:8080` in your browser, you see that dreaded **404 error**. Your application is alive, but it has no homepage to show visitors.

This is where **view technology** comes in. While modern applications might use React or Angular for the frontend, or serve pure JSON data to mobile apps, sometimes you need a traditional server-side rendered HTML page. This is where **JSP (JavaServer Pages)** shines.

In this section, we'll:
- Understand why Spring Boot shows 404 initially
- Create your first JSP homepage
- Learn the special folder structure Spring Boot expects
- Discover why JSP pages need controllers (the MVC pattern strikes again!)
- Set the stage for creating Spring Boot controllers in the next lesson

**Why this matters**: Understanding how view technologies integrate with Spring Boot is crucial. Even if you build REST APIs later, knowing the MVC flow helps you understand how Spring Boot processes requests and generates responses.

---

## 🔍 The 404 Mystery: Why Your Homepage Doesn't Exist Yet

### 🧠 What's Happening?

When you start your Spring Boot application and navigate to `localhost:8080`, you see:

```
Whitelabel Error Page

This application has no explicit mapping for /error, so you are seeing this as a fallback.

Status: 404
Message: Not Found
```

**What does this tell us?**

```
localhost:8080
     ↓
Your browser requests "/"
     ↓
Spring Boot searches for a handler
     ↓
No controller mapping found
     ↓
404 Not Found
```

### ❓ Why Do We Get 404?

Think about what happens when you request a webpage:

1. **Browser sends request**: "Hey server, give me the homepage at `/`"
2. **Spring Boot receives it**: "Let me check my controllers..."
3. **No mapping found**: "I don't have any controller mapped to `/`"
4. **404 response**: "Sorry, that page doesn't exist"

**Key Insight**: Unlike traditional servlet containers where you could drop HTML files in a specific folder and they'd be served automatically, Spring Boot follows strict **MVC principles**. Every request must go through a controller first.

### 🧩 The Homepage Question

When you request the homepage (just the domain with no path), you're asking for:
- Domain: `localhost:8080`
- Path: `/` (the root path)
- What exists: Nothing yet

**But wait**, didn't we set up Spring Boot with all its auto-configuration magic? Doesn't it create a default homepage?

**No.** Spring Boot gives you the infrastructure (embedded Tomcat, servlet container, request handling) but **not the content**. You decide what your homepage should be.

### 💡 The View Technology Decision

At this point, you have several options for creating your homepage:

1. **JSP (JavaServer Pages)**: Mix HTML with Java code, rendered server-side
2. **Thymeleaf**: Modern template engine, Spring's recommended choice
3. **FreeMarker**: Another template engine option
4. **Pure HTML/JSON**: For React/Angular apps or mobile backends

**For this tutorial**: We're using JSP because it's familiar if you've worked with servlets (like in Documents 45-47), and it clearly demonstrates the MVC pattern.

**In production**: Many teams prefer Thymeleaf or separate frontend frameworks. But the principles remain the same.

---

## 📝 Creating Your First JSP Homepage

### 🎯 The Goal

Create a simple homepage that displays "Hello World" when someone visits `localhost:8080`.

Simple requirement, but it teaches us about:
- Spring Boot folder structure
- JSP configuration
- File naming conventions
- How views integrate with the framework

### 🏗️ Step 1: Finding the Right Location

**Question**: Where do you create JSP files in a Spring Boot project?

If you look at your current project structure:

```
spring-boot-web1/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/telusko/app/
│   │   │       └── Application.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── static/
│   │       └── templates/
├── pom.xml
```

**Where should JSP go?**

❌ **NOT in `resources/`**: That's for configuration files and static assets
❌ **NOT in `java/`**: That's for Java source code
❌ **NOT in `templates/`**: That's for Thymeleaf templates

✅ **In a special folder called `webapp`**: Spring Boot looks specifically for this folder

### 🛠️ Creating the webapp Folder

**Step-by-step**:

1. Navigate to `src/main/`
2. Create a new folder called `webapp`
3. This should be at the same level as `java/` and `resources/`

**Updated structure**:

```
spring-boot-web1/
├── src/
│   ├── main/
│   │   ├── java/
│   │   ├── resources/
│   │   └── webapp/          ⬅️ NEW FOLDER
├── pom.xml
```

**Why this specific folder name?**

This comes from **servlet specification conventions**. Traditionally:
- WAR files have a `WEB-INF/` folder structure
- View technologies (JSP) live in the web application directory
- Spring Boot maintains this convention for compatibility

**Behind the scenes**: When Spring Boot packages your application, it knows to look in `webapp/` for view technology files.

### 📄 Step 2: Creating index.jsp

Inside your newly created `webapp/` folder, create a file named `index.jsp`.

**Why "index.jsp"?**

This follows web server conventions:
- `index.html` is the default homepage for static sites
- `index.jsp` is the default homepage for dynamic JSP sites
- When someone requests `/`, servers look for `index.*` files

**File location**:

```
webapp/
└── index.jsp    ⬅️ CREATE THIS FILE
```

### ✍️ Step 3: Writing Basic JSP Content

Let's start with the absolute minimum:

```jsp
<%@ page language="java" %>
<html>
<body>
    <h2>Hello World</h2>
</body>
</html>
```

**Let's break this down line by line:**

---

#### Line 1: The JSP Directive

```jsp
<%@ page language="java" %>
```

**What is this?**
- This is a **JSP directive** (notice the `<%@` syntax)
- It tells the JSP engine configuration information about this page

**Why do we need it?**
- JSP pages can contain Java code embedded in HTML
- This directive says: "Hey, this page uses Java for scripting"
- The JSP engine will process any Java code it finds

**What happens behind the scenes?**

When Tomcat sees this JSP file:
1. It reads the directive
2. Converts the entire JSP into a servlet class
3. Compiles that servlet
4. Executes it to generate HTML

**Comparison to pure HTML**: An `.html` file is served directly. A `.jsp` file is **compiled into a servlet first**, then executed.

---

#### Lines 2-5: The HTML Structure

```html
<html>
<body>
    <h2>Hello World</h2>
</body>
</html>
```

**What's happening here?**
- Standard HTML markup
- `<h2>` creates a level-2 heading (bigger text)
- `Hello World` is our content

**Why use HTML tags in JSP?**
- JSP is designed to mix HTML with Java
- The HTML portions are sent directly to the browser
- The Java portions (which we'll add later) are executed server-side

**Mental model**:

```
JSP File → Servlet Conversion → Execution → HTML Output
         
index.jsp   →    Servlet    →    Runs    →   <html>
                                               <body>
                                                 <h2>Hello World</h2>
                                               </body>
                                             </html>
```

---

### 📁 Complete File Structure

Your project should now look like:

```
spring-boot-web1/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── telusko/
│   │   │           └── app/
│   │   │               └── Application.java
│   │   ├── resources/
│   │   │   └── application.properties
│   │   └── webapp/
│   │       └── index.jsp          ⬅️ YOUR NEW FILE
├── pom.xml
```

---

## 🚫 The Test That Fails: Why JSP Alone Doesn't Work

### 🧪 Testing Our Homepage

**Expectation**: Restart the application, visit `localhost:8080`, see "Hello World"

**Let's try it**:

1. Stop your Spring Boot application (if running)
2. Restart it (run `Application.java`)
3. Open browser to `localhost:8080`

**Result**: 😞 Still 404!

```
Whitelabel Error Page
Status: 404
Message: Not Found
```

**What went wrong?**

We created `index.jsp` in the correct location, followed conventions, wrote valid JSP code... but it doesn't work. Why?

### 🤔 Understanding the Problem

**The fundamental issue**: JSP is a **view technology**, not a standalone page.

Let me explain with an analogy:

**🎭 The Restaurant Analogy**

Imagine a restaurant:
- **Customer** = Browser requesting a page
- **Waiter** = Controller (takes requests, delivers responses)
- **Chef** = Business logic (processes data)
- **Menu** = View/JSP (presentation)

**What's happening now**:
```
Customer walks in
    ↓
No waiter present
    ↓
Customer can see the menu on the wall (index.jsp exists)
    ↓
But no one takes the order
    ↓
Customer leaves hungry (404 error)
```

**What should happen**:
```
Customer walks in
    ↓
Waiter greets them (Controller)
    ↓
Waiter checks with chef (Business logic)
    ↓
Waiter brings menu/food (Forwards to JSP)
    ↓
Customer is happy
```

### 🏗️ The MVC Requirement

Remember **MVC (Model-View-Controller)** from Document 48? Let's revisit it:

**MVC Architecture**:
```
Browser Request
    ↓
Controller (Receives request)
    ↓
Model (Fetches/processes data)
    ↓
View (JSP renders HTML)
    ↓
Browser Response
```

**Current situation**:
```
Browser Request → localhost:8080/
    ↓
❌ No Controller exists
    ↓
🤷 Spring Boot: "I don't know what to do"
    ↓
404 Error
```

**What we need**:
```
Browser Request → localhost:8080/
    ↓
✅ Controller exists and handles "/"
    ↓
Controller says: "Show index.jsp"
    ↓
✅ JSP renders HTML
    ↓
Browser shows "Hello World"
```

### 🔑 The Missing Piece: Controllers

**Key revelation**: In Spring Boot (and MVC in general), **views are never accessed directly by the client**.

**The flow must be**:
1. Client requests a URL
2. Controller catches that request
3. Controller processes (or delegates processing)
4. Controller selects a view
5. View renders the response

**JSP cannot be served directly** because:
- It's a server-side technology (needs processing)
- It might contain Java code (needs execution)
- It's part of the business layer (not public-facing)
- Security: You don't want clients accessing any `.jsp` file they want

### 🛡️ Why This Security Model Matters

Imagine if JSP files were directly accessible:

```
Bad scenario:
/webapp/index.jsp         ← Homepage (OK)
/webapp/admin.jsp         ← Admin panel (EXPOSED!)
/webapp/user-data.jsp     ← User listings (EXPOSED!)
/webapp/internal-api.jsp  ← Internal API (EXPOSED!)
```

**With controllers**:
```
Good scenario:
/          ← Controller checks auth, then shows index.jsp
/admin     ← Controller checks admin rights, then shows admin.jsp
/users     ← Controller validates permissions, then shows users
/api       ← Controller rate-limits, validates, then processes
```

Controllers act as **gatekeepers**, enforcing business rules before views are rendered.

---

## 🎓 Understanding Servlet vs Controller in Spring Boot

### 🤔 The Natural Question

At this point, you might be thinking:

> "We learned about servlets in Documents 45-47. We extended `HttpServlet`, overrode `doGet()`, and handled requests. Is that what we do in Spring Boot too?"

**Great question!** Let's explore the answer.

### 🏛️ The Pure Servlet Approach (What We Did Before)

**Document 45-47 approach**:

```java
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, 
                        HttpServletResponse response) throws IOException {
        PrintWriter out = response.getWriter();
        out.println("<h1>Hello World</h1>");
    }
}
```

**Then we had to register it**:

```java
// Document 46 - Manual servlet registration
Context context = tomcat.addContext("", null);
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
context.addServletMapping("/hello", "HelloServlet");
```

**Problems with this approach**:
- ❌ Lots of boilerplate code
- ❌ Manual servlet registration required
- ❌ Tightly coupled to servlet API
- ❌ PrintWriter for output (tedious for complex HTML)
- ❌ No built-in view technology support
- ❌ Hard to test

### ✨ The Spring Boot Controller Approach

**Spring Boot philosophy**: "Yes, servlets run behind the scenes, but you shouldn't have to deal with them directly."

**What Spring Boot provides**:
```
Your Code:
@Controller
public class HomeController {
    @GetMapping("/")
    public String home() {
        return "index";  // So simple!
    }
}

Behind the scenes:
Spring creates servlet → Maps URLs → Handles requests → 
Forwards to JSP → Returns response
```

**Comparison**:

| Aspect | Pure Servlet | Spring Boot Controller |
|--------|-------------|----------------------|
| **Class** | Extend `HttpServlet` | Annotate with `@Controller` |
| **Method** | Override `doGet()` | Annotate with `@GetMapping()` |
| **URL Mapping** | Manual (`addServletMapping()`) | Automatic (`@GetMapping("/")`) |
| **Request/Response** | Manual (`HttpServletRequest`, `PrintWriter`) | Automatic (just return view name) |
| **View Integration** | Manual forwarding | Automatic (return `"index"` → finds `index.jsp`) |
| **Code Lines** | ~30 lines | ~8 lines |

### 🎯 Why Spring Boot Controllers Are Better

**1. Abstraction from Servlet API**

You don't deal with:
- `HttpServletRequest` (unless you need to)
- `HttpServletResponse` (unless you need to)
- `PrintWriter` (never needed for views)
- Servlet lifecycle methods

**2. Declarative Mapping**

```java
// Pure servlet - imperative
context.addServletMapping("/hello", "HelloServlet");

// Spring Boot - declarative
@GetMapping("/hello")  // That's it!
```

**3. View Resolution**

```java
// Pure servlet
RequestDispatcher dispatcher = request.getRequestDispatcher("/index.jsp");
dispatcher.forward(request, response);

// Spring Boot
return "index";  // Spring finds index.jsp automatically
```

**4. Testability**

```java
// Pure servlet - hard to test (needs servlet container)
HelloServlet servlet = new HelloServlet();
servlet.doGet(mockRequest, mockResponse);  // Complex mocking

// Spring Boot - easy to test
HomeController controller = new HomeController();
String view = controller.home();  // Just a method call
assertEquals("index", view);
```

### 🔧 Behind the Scenes: How Spring Boot Uses Servlets

**Important understanding**: Spring Boot **does use servlets**, you just don't see them.

**The magic**:

```
Your Controller
    ↓
Spring's DispatcherServlet (one central servlet)
    ↓
Request mapping
    ↓
Your controller method
    ↓
View resolver
    ↓
Forward to JSP
    ↓
Response
```

**Spring Boot uses ONE servlet** (`DispatcherServlet`) to handle all requests, then routes to your controllers. You went from managing many servlets to writing simple controller classes.

---

## 🚀 What's Next: Creating a Spring Boot Controller

### 🎯 The Problem We Need to Solve

**Current state**:
- ✅ Spring Boot project set up
- ✅ Embedded Tomcat running
- ✅ JSP file created (`index.jsp`)
- ❌ No controller to handle requests
- ❌ 404 error when visiting homepage

**Next step**: Create a controller that maps to `/` and returns `index.jsp`

### 🤔 The Questions We'll Answer Next

1. **How do we create a controller in Spring Boot?**
   - What annotations do we use?
   - Where do we put the controller class?

2. **How do we map URLs to controller methods?**
   - What's the difference between `@GetMapping`, `@PostMapping`, etc.?
   - How does URL mapping work automatically?

3. **How do we return views from controllers?**
   - Just return a string? Really?
   - How does Spring Boot find the JSP file?

4. **Do we still use `HttpServlet`?**
   - No! We'll use `@RestController` or `@Controller`
   - Spring Boot handles servlet stuff behind the scenes

### 📋 Preview: What Controller Code Looks Like

**Spoiler alert** - here's a tiny preview of what we'll build:

```java
@Controller
public class HomeController {
    
    @GetMapping("/")
    public String home() {
        return "index";
    }
}
```

**That's it!** 

Compare this to the ~30 lines of servlet registration code from Document 46. This is the power of Spring Boot.

**What this code does**:
- `@Controller` - Tells Spring "this is a web controller"
- `@GetMapping("/")` - "When someone requests `/`, call this method"
- `return "index"` - "Show the `index.jsp` file"

### 🎓 The Learning Journey

**Where we've been**:
- Document 44: Maven project setup
- Document 45: Created first servlet (`HelloServlet`)
- Document 46: Manual servlet URL mapping
- Document 47: Sending HTTP responses with `PrintWriter`
- Document 48: Understanding MVC architecture
- Document 49: Spring Boot project setup
- Document 50 (current): Creating JSP homepage, understanding why controllers are needed

**Where we're going**:
- Document 51 (next): Creating Spring Boot controllers
- Future: Request parameters, model data, form handling, REST APIs

### 💡 Key Insight

**The evolution**:

```
Pure Servlets (Manual Everything)
    ↓
Servlet + JSP (Manual routing, but separate view)
    ↓
Spring MVC (Annotations, but complex setup)
    ↓
Spring Boot (Annotations + Auto-configuration = Magic!)
```

Each step removes boilerplate and lets you focus on **business logic** instead of **infrastructure code**.

---

## 📚 Key Concepts Summary

### ✅ What We Learned

1. **404 on Homepage**
   - Spring Boot doesn't create default content
   - You must explicitly map the root `/` URL
   - MVC pattern requires controllers for all requests

2. **JSP Location**
   - JSP files go in `src/main/webapp/`
   - This follows servlet specification conventions
   - Spring Boot looks specifically in this folder

3. **JSP Structure**
   - `<%@ page language="java" %>` directive is required
   - Standard HTML markup works inside JSP
   - JSP files are compiled to servlets behind the scenes

4. **Why JSP Alone Fails**
   - Views cannot be accessed directly
   - Controllers must handle requests first
   - MVC pattern enforces separation of concerns

5. **Servlets vs Controllers**
   - Servlets run behind the scenes (Spring's `DispatcherServlet`)
   - You write controllers with simple annotations
   - Spring Boot auto-configures all the servlet registration

### ⚠️ Common Mistakes

1. **❌ Putting JSP in wrong folder**
   ```
   BAD:  src/main/resources/index.jsp
   BAD:  src/main/java/index.jsp
   GOOD: src/main/webapp/index.jsp
   ```

2. **❌ Expecting JSP to work without controller**
   - JSP is a view, not a standalone page
   - Always need controller to forward to JSP

3. **❌ Forgetting the JSP directive**
   ```jsp
   <!-- Missing directive = JSP won't process Java code -->
   <%@ page language="java" %>  ← DON'T FORGET THIS
   ```

4. **❌ Using .html instead of .jsp**
   - `.html` files are static (served directly)
   - `.jsp` files are dynamic (processed and can contain Java)

### 💡 Pro Tips

1. **File Naming Convention**
   - `index.jsp` for homepage (convention)
   - `about.jsp`, `contact.jsp`, etc. for other pages
   - Lowercase, hyphenated for multi-word (`user-profile.jsp`)

2. **Understanding the Flow**
   ```
   Always remember:
   Request → Controller → Model (optional) → View → Response
   
   Never:
   Request → View (this doesn't work in MVC)
   ```

3. **Debugging 404 Errors**
   - Check if controller exists
   - Check if URL mapping matches browser request
   - Check if view name matches JSP filename
   - Check if JSP is in `webapp/` folder

4. **Mental Model**
   - Controllers are gatekeepers
   - Views are templates
   - JSP files are never touched directly by browsers

---

## 🔄 Comparison: Then vs Now

### Pure Servlet Approach (Documents 45-47)

**Creating a page that shows "Hello World":**

```java
// 1. Create servlet class (~10 lines)
public class HelloServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, 
                        HttpServletResponse response) throws IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<html><body>");
        out.println("<h2>Hello World</h2>");
        out.println("</body></html>");
    }
}

// 2. Register servlet (~8 lines in main)
Tomcat tomcat = new Tomcat();
tomcat.setPort(8080);
Context context = tomcat.addContext("", null);
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
context.addServletMapping("/", "HelloServlet");
tomcat.start();
tomcat.getServer().await();

// Total: ~18 lines of Java code
// All HTML mixed in Java strings (hard to maintain)
```

### Spring Boot Approach (What We'll Do Next)

**Creating a page that shows "Hello World":**

```java
// 1. Controller class (~6 lines)
@Controller
public class HomeController {
    @GetMapping("/")
    public String home() {
        return "index";
    }
}

// 2. JSP file (clean HTML)
<%@ page language="java" %>
<html>
<body>
    <h2>Hello World</h2>
</body>
</html>

// Total: ~6 lines of Java + separate clean HTML
// Embedded Tomcat auto-configured
// Servlet registration automatic
// URL mapping automatic
```

**Improvement**:
- 📉 70% less code
- 🎨 Clean separation (Java vs HTML)
- ✨ No manual Tomcat configuration
- 🔧 No servlet registration code
- 🧪 Easy to test
- 📝 Easy to maintain

---

## 🎯 Real-World Scenarios

### Scenario 1: Building a Company Website

**Requirement**: Create a homepage, about page, and contact page.

**Pure Servlet Approach**:
```java
// Need 3 servlets
public class HomeServlet extends HttpServlet { ... }
public class AboutServlet extends HttpServlet { ... }
public class ContactServlet extends HttpServlet { ... }

// Need 3 registrations
context.addServletMapping("/", "HomeServlet");
context.addServletMapping("/about", "AboutServlet");
context.addServletMapping("/contact", "ContactServlet");

// Need to write HTML in Java strings (painful!)
out.println("<html>...lots of HTML...</html>");
```

**Spring Boot Approach**:
```java
// One controller
@Controller
public class PageController {
    @GetMapping("/") public String home() { return "index"; }
    @GetMapping("/about") public String about() { return "about"; }
    @GetMapping("/contact") public String contact() { return "contact"; }
}

// Three clean JSP files
webapp/index.jsp
webapp/about.jsp
webapp/contact.jsp
```

**Winner**: Spring Boot (cleaner, maintainable, scalable)

### Scenario 2: Debugging a 404 Error

**Pure Servlet**:
```
Check:
1. Is servlet class compiled?
2. Is Tomcat started?
3. Is context configured?
4. Is servlet registered?
5. Is URL mapping correct?
6. Is servlet instance created?
7. Is doGet() method correct?
```

**Spring Boot**:
```
Check:
1. Is controller annotated with @Controller?
2. Is method annotated with @GetMapping?
3. Is URL path correct?
4. Is view name matching JSP filename?
```

**Winner**: Spring Boot (fewer points of failure)

### Scenario 3: Adding a New Page

**Pure Servlet**:
1. Create new servlet class
2. Extend HttpServlet
3. Override doGet()
4. Write HTML in Java strings
5. Register servlet in main()
6. Add URL mapping
7. Restart application

**Spring Boot**:
1. Add method to controller with `@GetMapping`
2. Create JSP file
3. Done (hot reload often works)

**Winner**: Spring Boot (2 steps vs 7 steps)

---

## 🧪 Hands-On Exercise

### Exercise 1: Verify Your Setup

**Task**: Ensure your project structure matches the requirements.

**Checklist**:
```
✓ src/main/webapp/ folder exists
✓ src/main/webapp/index.jsp file exists
✓ index.jsp contains <%@ page language="java" %>
✓ index.jsp contains some HTML content
✓ Application runs without compilation errors
✓ Browser shows 404 (expected for now)
```

### Exercise 2: Experiment with JSP

**Try this**:

```jsp
<%@ page language="java" %>
<html>
<body>
    <h1>Welcome to My Site</h1>
    <p>Today's date: <%= new java.util.Date() %></p>
</body>
</html>
```

**What's new here?**
- `<%= ... %>` is JSP **expression** syntax
- Embeds Java code result in HTML
- `new java.util.Date()` creates current date

**Expected result**: Still 404 (no controller yet), but you're learning JSP syntax

### Exercise 3: Predict the Outcome

**Scenario**: You create this structure:

```
webapp/
├── index.jsp
├── home.jsp
└── admin/
    └── dashboard.jsp
```

**Question**: Which files are accessible to browser directly?

**Answer**: None! All require controllers in Spring Boot MVC.

**Why**: Views are protected, controllers control access.

---

## 🎬 Conclusion: The Bridge to Controllers

### 🧠 What We Accomplished

In this document, we:
1. ✅ Understood why Spring Boot shows 404 initially
2. ✅ Created the `webapp/` folder structure
3. ✅ Built our first `index.jsp` file
4. ✅ Learned JSP directive syntax
5. ✅ Discovered why JSP alone doesn't work
6. ✅ Understood the MVC pattern requirement
7. ✅ Compared servlets vs controllers
8. ✅ Set the stage for creating controllers

### 🚀 The Next Step

**We have**:
- Spring Boot project ✅
- Embedded Tomcat ✅
- JSP homepage ✅

**We need**:
- Controller to handle `/` requests ❌

**Next video**: We'll solve this by creating a Spring Boot controller using:
- `@Controller` annotation
- `@GetMapping("/")` for URL mapping
- Automatic view resolution

**The payoff**: Finally see "Hello World" in your browser!

### 💭 Final Thought

**The journey from servlets to Spring Boot** shows software evolution:
- First, we had servlets (low-level, powerful, verbose)
- Then, we got JSP (separate view from logic)
- Then, we got Spring MVC (annotations, dependency injection)
- Now, we have Spring Boot (all the power, minimal configuration)

Each layer built on the previous, removing boilerplate and letting developers focus on **what matters**: building features that solve real problems.

**The question we'll answer next**: "How do we create a controller in your Spring Boot app?"

Stay tuned! 🎯
