# 🍃 Switching from JSP to Thymeleaf — Modern View Templates

## 🎯 Introduction

We've built a fully working Spring MVC application using JSP. Controllers handle requests, `@ModelAttribute` binds form data, the View Resolver maps logical names to physical files — everything works.

But here's the thing: **JSP is not directly supported by Spring Boot**. Yes, you *can* use it (and many legacy applications do), but it requires extra setup — the Tomcat Jasper dependency, the `webapp/` folder, custom prefix/suffix configuration. It feels like you're fighting the framework.

Spring Boot's preferred view technology is **Thymeleaf** — a modern, server-side template engine that works with plain HTML files. No special extensions, no special folders (well, a different one), and first-class Spring Boot support.

In this lesson, we'll convert our JSP project to Thymeleaf and see how surprisingly simple the migration is.

---

## 🧩 Concept 1: What is Thymeleaf?

### 🧠 A Modern Template Engine

Thymeleaf (pronounced "time-leaf") is a **server-side Java template engine** for web applications. The official description:

> *"A modern server-side Java template engine for both web and standalone environments."*

But what does that mean in practice?

**A template engine** takes an HTML template with placeholders and replaces those placeholders with actual data before sending the page to the browser. That's exactly what JSP does — but Thymeleaf does it differently and, many would argue, better.

### ❓ How is Thymeleaf Different from JSP?

| Aspect | JSP | Thymeleaf |
|--------|-----|-----------|
| File extension | `.jsp` | `.html` |
| File type | Special JSP syntax | Standard HTML |
| Requires special server | Yes (JSP engine like Tomcat Jasper) | No (works with any servlet container) |
| Viewable in browser without server | No (JSP tags render as garbage) | Yes (natural HTML with fallback values) |
| Spring Boot support | Requires extra dependency + config | First-class, auto-configured |
| Template location | `webapp/` folder | `resources/templates/` |
| Dynamic data syntax | `${variable}` or `<%= expression %>` | `th:text="${variable}"` |
| Page directive | `<%@ page language="java" %>` | Not needed |

The biggest difference: **Thymeleaf templates are valid HTML**. You can open a Thymeleaf file in a browser without running the server, and it looks like a normal web page (with fallback values instead of dynamic data). JSP files, on the other hand, are full of `<% %>` tags that mean nothing to a browser.

### 🎯 Natural Templates

This is Thymeleaf's killer feature. Consider this Thymeleaf template:

```html
<p th:text="${alien}">Placeholder alien data</p>
```

- **Without the server**: The browser shows "Placeholder alien data" (the fallback text between the tags)
- **With the server**: Thymeleaf replaces the content with the actual `alien` value from the model

A designer can open this file in a browser, see the layout with placeholder data, and work on the CSS — without needing a running Spring application. That's what "natural templates" means.

### 💡 Where Does Thymeleaf Stand?

Spring's official documentation lists multiple view technologies:
- **Thymeleaf** — listed first, actively promoted
- **JSP** — supported but not recommended for new projects
- **FreeMarker** — another option
- **Velocity** — legacy option

Thymeleaf is what Spring recommends. That said, in the real world, many modern applications use Spring as a **backend API** with React or Angular for the frontend. Thymeleaf fills the gap when you want server-rendered pages without a separate frontend framework.

---

## 🧩 Concept 2: Migration Steps — JSP to Thymeleaf

### 🧠 What Needs to Change?

Converting a JSP project to Thymeleaf involves five steps:

1. **Remove JSP configuration** from `application.properties`
2. **Replace the dependency** — Tomcat Jasper → Thymeleaf starter
3. **Rename files** — `.jsp` → `.html`
4. **Move files** — `webapp/views/` → `resources/templates/`
5. **Update syntax** — JSP expressions → Thymeleaf attributes

Let's go through each one.

---

## 🧩 Concept 3: Step 1 — Remove View Resolver Configuration

### ⚙️ Before

Our `application.properties` had:

```properties
spring.mvc.view.prefix=/views/
spring.mvc.view.suffix=.jsp
```

### ⚙️ After

**Remove both lines.** Delete them entirely.

```properties
# application.properties is now empty (or has other settings)
```

### ❓ Why?

Thymeleaf **auto-configures** the view resolver. When Spring Boot detects the Thymeleaf dependency on the classpath, it automatically:
- Sets the prefix to `classpath:/templates/`
- Sets the suffix to `.html`

You don't need to tell it — it just knows. This is Spring Boot's auto-configuration at work.

### 💡 This Is Why Spring Boot is Loved

With JSP, you had to manually configure prefix and suffix. With Thymeleaf, you add the dependency and Spring Boot figures out the rest. Less configuration = fewer mistakes = faster development.

---

## 🧩 Concept 4: Step 2 — Swap the Dependency

### ⚙️ In pom.xml

**Remove** the Tomcat Jasper dependency (it was only for JSP):

```xml
<!-- REMOVE THIS -->
<dependency>
    <groupId>org.apache.tomcat</groupId>
    <artifactId>tomcat-jasper</artifactId>
    <version>...</version>
</dependency>
```

**Add** the Thymeleaf starter:

```xml
<!-- ADD THIS -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

### 🔍 Notice the Pattern

The Thymeleaf dependency follows the Spring Boot starter naming convention:
- `spring-boot-starter-web` — for web applications
- `spring-boot-starter-thymeleaf` — for Thymeleaf support
- `spring-boot-starter-data-jpa` — for database access (we'll use later)

All starters follow `spring-boot-starter-{technology}`. This makes them easy to find and remember.

### ⚠️ Reload Maven

After changing `pom.xml`, you must **reload Maven** so that the new dependency is downloaded:
- IntelliJ: Click the Maven refresh icon, or right-click `pom.xml` → Maven → Reload Project
- Eclipse: Right-click project → Maven → Update Project

---

## 🧩 Concept 5: Step 3 — Rename Files from .jsp to .html

### ⚙️ The Change

```
Before:                          After:
webapp/views/index.jsp    →    templates/index.html
webapp/views/result.jsp   →    templates/result.html
```

Simply rename the file extensions from `.jsp` to `.html`.

### 🧠 Why .html?

Because Thymeleaf templates **are** HTML files. There's no special extension. They contain standard HTML tags with Thymeleaf-specific attributes (`th:text`, `th:each`, etc.) that the template engine processes.

This means:
- Your IDE gives you full HTML/CSS/JS support (syntax highlighting, autocompletion, validation)
- Browsers can render the files directly (with fallback values)
- No special tooling needed

### 💡 Remove JSP-Specific Code

The JSP page directive is no longer needed:

```html
<!-- REMOVE THIS LINE -->
<%@ page language="java" %>
```

This was a JSP instruction telling the server it's a Java page. In Thymeleaf, the file is plain HTML — no server directives needed.

---

## 🧩 Concept 6: Step 4 — Move Files to templates/

### ⚙️ The New Location

```
Before:                              After:
src/main/webapp/views/              src/main/resources/templates/
├── index.jsp                       ├── index.html
└── result.jsp                      └── result.html
```

Thymeleaf looks for templates in `src/main/resources/templates/` by default. This is different from JSP which used `src/main/webapp/`.

### ❓ Why templates/?

When Spring Boot detects Thymeleaf, its auto-configuration sets:
- **Prefix**: `classpath:/templates/`
- **Suffix**: `.html`

So when your controller returns `"result"`, Thymeleaf resolves it to:

```
"result" → classpath:/templates/result.html
```

The exact same prefix + name + suffix formula from the View Resolver — but Spring Boot sets it automatically for Thymeleaf.

### 📂 Updated Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/example/demo/
│   │       ├── DemoApplication.java
│   │       ├── HomeController.java
│   │       └── Alien.java
│   └── resources/
│       ├── application.properties        ← No prefix/suffix needed
│       ├── static/
│       │   └── style.css                 ← Static files stay here
│       └── templates/                    ← NEW! Thymeleaf templates
│           ├── index.html
│           └── result.html
└── pom.xml                               ← Thymeleaf starter instead of Jasper
```

Notice: `webapp/` folder is **gone entirely**. Everything lives under `resources/` now. Static files in `static/`, templates in `templates/`. Clean and organized.

---

## 🧩 Concept 7: Step 5 — Convert JSP Syntax to Thymeleaf

### 🧠 The HTML Structure

First, add the Thymeleaf namespace to your HTML tag:

```html
<html xmlns:th="http://www.thymeleaf.org">
```

This tells the HTML file that attributes starting with `th:` are Thymeleaf-specific. Without this, your IDE might flag them as unknown attributes.

### ⚙️ Converting Dynamic Content

**JSP syntax:**
```html
<p>${alien}</p>
<p>Welcome to the ${course} world</p>
```

**Thymeleaf syntax:**
```html
<p th:text="${alien}">Placeholder alien data</p>
<p th:text="'Welcome to the ' + ${course} + ' world'">Greeting</p>
```

### 🔍 Breaking Down the Thymeleaf Syntax

**`th:text`** — The core Thymeleaf attribute for displaying dynamic text.

```html
<p th:text="${alien}">Placeholder alien data</p>
```

- `th:text` — Tells Thymeleaf: "Replace the content of this element with the evaluated expression"
- `${alien}` — The expression to evaluate (same `${}` syntax as JSP/JSTL)
- `Placeholder alien data` — **Fallback text** shown when the template is opened without the server

When rendered by the server, the output becomes:
```html
<p>Alien [aid=12, aname=Navin]</p>
```

The fallback text is completely replaced by the dynamic value.

### ⚙️ Mixing Static Text with Dynamic Values

When you need to combine static text with a variable:

```html
<p th:text="'Welcome to the ' + ${course} + ' world'">Greeting</p>
```

Notice:
- Static strings are wrapped in **single quotes** inside the double quotes: `'Welcome to the '`
- Variables use `${}`: `${course}`
- They're concatenated with `+`
- The result: `Welcome to the Java world`

### 🧪 The Complete result.html

**Before (JSP):**

```html
<%@ page language="java" %>
<html>
<head>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
    <h2>Welcome to Telusko</h2>
    <p>${alien}</p>
    <p>Welcome to the ${course} world</p>
</body>
</html>
```

**After (Thymeleaf):**

```html
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
    <h2>Welcome to Telusko</h2>
    <p th:text="${alien}">Placeholder alien data</p>
    <p th:text="'Welcome to the ' + ${course} + ' world'">Greeting</p>
</body>
</html>
```

### 🧪 The Complete index.html

**Before (JSP):**

```html
<%@ page language="java" %>
<html>
<head>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
    <form action="addAlien">
        Enter ID: <input type="text" name="aid"><br>
        Enter Name: <input type="text" name="aname"><br>
        <input type="submit">
    </form>
</body>
</html>
```

**After (Thymeleaf):**

```html
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
    <form action="addAlien">
        Enter ID: <input type="text" name="aid"><br>
        Enter Name: <input type="text" name="aname"><br>
        <input type="submit">
    </form>
</body>
</html>
```

The form page barely changes! The form itself is pure HTML — no dynamic content, no JSP expressions. The only change is removing the JSP directive and adding the Thymeleaf namespace.

---

## 🧩 Concept 8: What Stays the Same — The Controller

### 🧠 Zero Controller Changes

Here's the important part: **the controller doesn't change at all**.

```java
@Controller
public class HomeController {

    @ModelAttribute("course")
    public String courseName() {
        return "Java";
    }

    @RequestMapping("/")
    public String home() {
        return "index";
    }

    @RequestMapping("/addAlien")
    public String addAlien(Alien alien) {
        return "result";
    }
}
```

This is exactly the same controller we had with JSP. The return values (`"index"`, `"result"`) are logical view names — they don't include file extensions or paths. The View Resolver (now Thymeleaf's auto-configured one) handles the translation.

This is the beauty of **separation of concerns** and the View Resolver pattern:
- **Change the view technology** → Update templates and dependencies
- **Controller stays untouched** → It only deals with logical names and model data

You could switch from Thymeleaf to FreeMarker tomorrow, and the controller code wouldn't change. That's powerful.

### 💡 The Alien Class Also Stays the Same

```java
public class Alien {
    private int aid;
    private String aname;
    // getters, setters, toString() — unchanged
}
```

Entity classes have nothing to do with view technology. They represent data. Data doesn't care how it's displayed.

---

## 🧩 Concept 9: No Restart Needed for HTML Changes

### 💡 A Nice Thymeleaf Bonus

With JSP, changing a file often required restarting the application (or at least waiting for Tomcat to recompile the JSP).

With Thymeleaf, **editing an HTML file takes effect immediately** — just refresh the browser. No restart needed for template changes.

This speeds up frontend development significantly. Change some text, refresh, see the result. Change a `th:text` expression, refresh, see the updated data.

⚠️ Note: You still need to restart for **Java code changes** (controller logic, new dependencies). Only HTML template changes are hot-reloaded.

---

## 🧩 Concept 10: Summary of All Changes

### 📋 Complete Migration Checklist

| # | What to Change | Before (JSP) | After (Thymeleaf) |
|---|---------------|--------------|-------------------|
| 1 | `application.properties` | `spring.mvc.view.prefix=/views/`<br>`spring.mvc.view.suffix=.jsp` | Remove both lines |
| 2 | `pom.xml` dependency | `tomcat-jasper` | `spring-boot-starter-thymeleaf` |
| 3 | File extensions | `.jsp` | `.html` |
| 4 | File location | `src/main/webapp/views/` | `src/main/resources/templates/` |
| 5 | Page directive | `<%@ page language="java" %>` | Remove (not needed) |
| 6 | HTML namespace | None | `xmlns:th="http://www.thymeleaf.org"` |
| 7 | Dynamic values | `${variable}` directly in HTML | `th:text="${variable}"` on elements |
| 8 | Controller code | No change | No change |
| 9 | Entity classes | No change | No change |

### 🔄 What Thymeleaf Auto-Configures

When Spring Boot sees `spring-boot-starter-thymeleaf` on the classpath, it automatically:
- Sets the template prefix to `classpath:/templates/`
- Sets the template suffix to `.html`
- Configures the Thymeleaf template engine
- Registers the Thymeleaf view resolver

You get all of this **just by adding the dependency**. No manual configuration needed.

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. **Thymeleaf** is Spring Boot's recommended view technology — modern, HTML-based, auto-configured
2. Thymeleaf templates are **valid HTML files** (`.html`) that work in browsers without a server
3. The Thymeleaf dependency is `spring-boot-starter-thymeleaf` — replaces `tomcat-jasper`
4. Templates go in `src/main/resources/templates/` — not `webapp/`
5. Remove `prefix`/`suffix` from `application.properties` — Thymeleaf auto-configures them
6. Use `th:text="${variable}"` for dynamic content — replaces JSP's `${variable}` syntax
7. Add `xmlns:th="http://www.thymeleaf.org"` to the `<html>` tag
8. **Controllers don't change** — logical view names and model data work the same way
9. Thymeleaf provides **fallback text** between tags for when templates are viewed without a server
10. HTML template changes are **hot-reloaded** — no server restart needed

### ⚠️ Common Mistakes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Leaving JSP prefix/suffix in properties | Thymeleaf looks in wrong location | Remove both `spring.mvc.view.prefix` and `suffix` |
| Files still in `webapp/views/` | 404 — templates not found | Move to `src/main/resources/templates/` |
| Files still have `.jsp` extension | Thymeleaf expects `.html` | Rename to `.html` |
| Missing Thymeleaf namespace on `<html>` | IDE warnings, `th:` attributes not recognized | Add `xmlns:th="http://www.thymeleaf.org"` |
| Using `${variable}` directly (JSP style) | Displays literal `${variable}` text | Use `th:text="${variable}"` on an element |
| Forgetting to reload Maven after adding dependency | Thymeleaf classes not found | Reload Maven project |
| Leaving `<%@ page ... %>` directive | Displays as raw text in browser | Remove all JSP directives |

### 💡 Pro Tips

1. **Use fallback text** — Always put meaningful placeholder text between your tags: `<p th:text="${name}">John Doe</p>`. This helps designers and makes templates self-documenting.
2. **Thymeleaf has much more** — `th:each` for loops, `th:if` for conditionals, `th:href` for dynamic links. We'll explore these as needed.
3. **Static files stay in `static/`** — CSS, JavaScript, and images still go in `resources/static/`. Only templates move to `templates/`.
4. **Don't mix JSP and Thymeleaf** — Pick one view technology for your project. Mixing them creates confusion and configuration conflicts.
5. **The real world** — Most modern applications use Spring Boot as a REST API with React/Angular/Vue on the frontend. Thymeleaf is great for server-rendered pages, admin panels, or simpler applications where a full JavaScript framework is overkill.

---

## 🔗 What's Next?

We've successfully migrated from JSP to Thymeleaf. Our application now uses:
- ✅ Modern `.html` templates instead of `.jsp` files
- ✅ Auto-configured view resolution (no manual prefix/suffix)
- ✅ Clean Thymeleaf syntax for dynamic content
- ✅ The same clean controller code — completely unchanged

The Spring MVC fundamentals we learned (controllers, `@RequestMapping`, `@ModelAttribute`, Model, View Resolver) all carry forward. Only the view layer changed. That's the power of good architecture — swap out one layer without touching the rest.

Going forward, we can explore more Thymeleaf features and continue building our Spring Boot application with this modern view technology!
