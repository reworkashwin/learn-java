# 📋 Configuring the DispatcherServlet in web.xml

## 🎯 Introduction

Our Spring MVC project is deployed on Tomcat, but when we hit `localhost:8080/SpringMVCDemo/`, we get a **404 — Not Found**. We have a controller. We have views. We have the Spring dependency. So why doesn't it work?

The answer: **Tomcat doesn't know about Spring**. It doesn't know our `@Controller` classes exist. It doesn't know how to route requests to them. In Spring Boot, this was all automatic. Without Spring Boot, we need to manually tell Tomcat: *"Hey, send all requests to Spring's DispatcherServlet."*

In this lesson, we'll:
- Understand the **Front Controller pattern** and why DispatcherServlet is needed
- Configure DispatcherServlet in **web.xml** using servlet and servlet-mapping tags
- Fix build path issues (Tomcat library, Java version)
- Progress from a **404** to a **500** error — and understand why that's actually progress
- Discover that DispatcherServlet itself needs a configuration file

---

## 🧩 Concept 1: Why Tomcat Can't Find Our Controller

### 🧠 The Core Problem

We have a controller:

```java
@Controller
public class HomeController {
    @RequestMapping("/")
    public String home() {
        return "index";
    }
}
```

And we expect Tomcat to call this when someone visits the homepage. But here's the thing:

**Tomcat is a Servlet Container.** It understands **servlets** — Java classes that extend `HttpServlet`. It does **not** understand `@Controller` or `@RequestMapping`. Those are Spring annotations. Tomcat has never heard of them.

In Spring Boot, something automatically bridged this gap. That something was the **DispatcherServlet**, which was auto-registered. Without Spring Boot, nobody has told Tomcat about it.

### 🎯 Analogy

Imagine a building with a reception desk. Visitors (HTTP requests) arrive and ask for specific people (controllers). But the building has **no receptionist**. Visitors walk in, look around confused, and leave. That's our 404 error.

We need to hire a receptionist (DispatcherServlet) and tell the building management (Tomcat) to direct all visitors to that receptionist first.

---

## 🧩 Concept 2: The Front Controller Pattern — DispatcherServlet

### 🧠 What is a Front Controller?

In a web application, you might have many controllers:
- `HomeController` handles `/`
- `AlienController` handles `/addAlien`
- `ProductController` handles `/products`
- `UserController` handles `/users`

If every request went directly to a random controller, chaos would ensue. Who decides which controller handles which request?

That's the job of the **Front Controller** — a single entry point that sits between the client and all your controllers:

```
Client sends request
        ↓
  Front Controller (DispatcherServlet)
        ↓              ↓              ↓
HomeController   AlienController   ProductController
```

Every request goes through the Front Controller first. It examines the URL, checks the `@RequestMapping` annotations, and forwards the request to the right controller.

### 🧠 DispatcherServlet = Spring's Front Controller

Spring provides a ready-made Front Controller called **DispatcherServlet**. You don't create it — it's already a class inside the `spring-webmvc` JAR:

```
org.springframework.web.servlet.DispatcherServlet
```

You can find it by expanding Maven Dependencies → `spring-webmvc` → `org.springframework.web.servlet` → `DispatcherServlet`.

Your job is not to write it — your job is to **register** it with Tomcat so that Tomcat knows to forward requests to it.

### ❓ Wasn't DispatcherServlet in Spring Boot Too?

Yes! In Spring Boot, the DispatcherServlet was:
- Automatically created
- Automatically registered with the embedded Tomcat
- Automatically mapped to `/` (all requests)

We never had to think about it. Now we do.

---

## 🧩 Concept 3: Configuring DispatcherServlet in web.xml

### 🧠 What is web.xml?

`web.xml` is the **deployment descriptor** — a configuration file that Tomcat reads when it starts an application. It's located at:

```
src/main/webapp/WEB-INF/web.xml
```

This is the file where you tell Tomcat: *"When requests come in, here's how to handle them."* Every traditional Java web application has this file.

### ⚙️ The Two Tags You Need

To register DispatcherServlet, you need two XML tags:

1. **`<servlet>`** — Declares the servlet (tells Tomcat about DispatcherServlet)
2. **`<servlet-mapping>`** — Maps URLs to that servlet (tells Tomcat which requests go to it)

### 🧪 The Configuration

```xml
<web-app>

    <!-- Step 1: Declare the DispatcherServlet -->
    <servlet>
        <servlet-name>telusko</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    </servlet>

    <!-- Step 2: Map all requests to the DispatcherServlet -->
    <servlet-mapping>
        <servlet-name>telusko</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>

</web-app>
```

### 🔍 Breaking Down Each Part

**The `<servlet>` tag — "Here's a servlet":**

```xml
<servlet>
    <servlet-name>telusko</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
</servlet>
```

- `<servlet-name>` — A name you choose for this servlet. Can be anything: `"telusko"`, `"dispatcher"`, `"myApp"`. This name is used to connect `<servlet>` with `<servlet-mapping>`.
- `<servlet-class>` — The fully qualified class name of the DispatcherServlet. This is the actual Spring class that handles request routing.

**The `<servlet-mapping>` tag — "Send these requests to that servlet":**

```xml
<servlet-mapping>
    <servlet-name>telusko</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

- `<servlet-name>` — Must match the name in `<servlet>`. This is how Tomcat connects the mapping to the servlet declaration.
- `<url-pattern>` — Which URLs should go to this servlet. `/` means **all requests**.

### 💡 How the Two Tags Connect

The `<servlet-name>` is the glue:

```
<servlet>
    <servlet-name>telusko</servlet-name>     ← Same name
    ...
</servlet>

<servlet-mapping>
    <servlet-name>telusko</servlet-name>     ← Same name
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

They must match! If the `<servlet>` says `"telusko"` and the `<servlet-mapping>` says `"dispatcher"`, Tomcat can't connect them and nothing works.

### ❓ Why Can You Have Multiple Servlets?

In theory, a web application can have multiple servlets, each handling different URL patterns. That's why the `<servlet-name>` exists — to distinguish between them. In a Spring application, you typically have just one (the DispatcherServlet), and it handles everything.

### 🎯 What This Configuration Says

In plain English:

> *"Dear Tomcat, I have a servlet called 'telusko'. It's Spring's DispatcherServlet. Please send ALL requests (URL pattern '/') to this servlet. It will figure out what to do with them."*

---

## 🧩 Concept 4: Build Path Issues — Tomcat Library and Java Version

### ⚠️ Missing Tomcat Library

After adding the web.xml configuration, the project might still not work. One common issue: the **Tomcat runtime library** isn't on the project's build path.

**To fix this:**

1. Right-click the project → **Build Path** → **Configure Build Path**
2. Go to the **Libraries** tab
3. Click **Add Library** → **Server Runtime** → Select your Tomcat server
4. Click **Apply and Close**

### ⚠️ Java Version Mismatch

Make sure your project is using the correct Java version:

1. In Build Path → Libraries tab
2. Check the **JRE System Library**
3. If it's outdated (e.g., Java 1.5), edit it to use **Java 21** (or your installed version)
4. Click **Apply and Close**

### 💡 One-Time Configuration

This build path setup is a **one-time thing**. You won't need to do it again for this project. This is the kind of configuration Spring Boot automates — and reminds you why Spring Boot exists.

---

## 🧩 Concept 5: From 404 to 500 — Progress Through Errors

### 🔄 Error Progression

After configuring web.xml and fixing the build path, restart the server and refresh the browser. The error changes:

| Before | After |
|--------|-------|
| **404 — Not Found** | **500 — Internal Server Error** |

This is actually progress! Here's why:

- **404** meant Tomcat couldn't find anything to handle the request — like nobody was home.
- **500** means Tomcat found the DispatcherServlet and called it, but the DispatcherServlet itself crashed — the receptionist showed up but couldn't find the staff directory.

### 🧠 Reading the 500 Error

The error message says:

```
IOException: Could not open ServletContext resource [/WEB-INF/telusko-servlet.xml]
```

Key details:
- It's looking for a file called **`telusko-servlet.xml`**
- It expects this file in `/WEB-INF/`
- The file doesn't exist — we never created it

### ❓ Where Does "telusko-servlet.xml" Come From?

The filename is **derived from the servlet-name** in web.xml:

```
servlet-name = "telusko"
Expected file = "telusko-servlet.xml"
```

The convention is: `{servlet-name}-servlet.xml`

If you had named your servlet `"dispatcher"`:
```
servlet-name = "dispatcher"
Expected file = "dispatcher-servlet.xml"
```

If you had named it `"myApp"`:
```
servlet-name = "myApp"
Expected file = "myApp-servlet.xml"
```

This is a **Spring convention** — the DispatcherServlet automatically looks for a configuration file named after itself.

---

## 🧩 Concept 6: Why Does DispatcherServlet Need a Configuration File?

### 🧠 The DispatcherServlet's Problem

We told Tomcat: *"Send all requests to DispatcherServlet."*

DispatcherServlet receives the request and thinks: *"Okay, I got a request for `/`. Now what? Where are the controllers? Where are the views? How do I resolve view names?"*

**DispatcherServlet is not magic.** It needs to be told:

1. **Where to find controllers** — Which packages to scan for `@Controller` classes
2. **How to resolve views** — The View Resolver configuration (prefix, suffix)
3. **Any other Spring beans** — Services, repositories, etc.

This information goes in the **`{servlet-name}-servlet.xml`** file — a Spring configuration file that the DispatcherServlet reads at startup.

### 🎯 Analogy

The DispatcherServlet is like a new receptionist on their first day:

- **Tomcat** (building management) says: *"You're the receptionist now. Handle all visitors."*
- **DispatcherServlet** (receptionist) says: *"Great! But where's the employee directory? Where are the offices? What's the seating plan?"*
- **The servlet XML file** is the employee directory and office map.

Without it, the receptionist sits at the desk but can't direct anyone anywhere.

### 🔄 What Spring Boot Did

In Spring Boot:
- The DispatcherServlet was auto-registered ✅
- The controller scanning was auto-configured (based on the main class package) ✅
- The View Resolver was configured from `application.properties` ✅

All of this happened without any XML files. Spring Boot created the configuration **in memory** using Java-based configuration. No XML needed.

Without Spring Boot, we write the XML ourselves.

---

## 🧩 Concept 7: The Complete web.xml So Far

Here's the full `web.xml` after our changes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee 
         https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">

    <servlet>
        <servlet-name>telusko</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    </servlet>

    <servlet-mapping>
        <servlet-name>telusko</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>

</web-app>
```

This file lives at: `src/main/webapp/WEB-INF/web.xml`

---

## 🧩 Concept 8: The Configuration Layers — A Map of What's Needed

Let's visualize the full configuration picture:

```
Layer 1: Tomcat knows about DispatcherServlet
    → Configured in: web.xml
    → Status: ✅ Done

Layer 2: DispatcherServlet knows about controllers and views
    → Configured in: telusko-servlet.xml
    → Status: ❌ Not created yet (next step)

Layer 3: Controller code
    → Already written: HomeController.java with @Controller, @RequestMapping
    → Status: ✅ Done

Layer 4: View files
    → Already created: index.jsp, result.jsp in webapp/views/
    → Status: ✅ Done
```

We've completed Layer 1. The 500 error tells us Layer 2 is missing. Once we create `telusko-servlet.xml` with the right configuration, the chain will be complete:

```
Browser request → Tomcat → DispatcherServlet → Controller → View → Response
```

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. Tomcat doesn't understand `@Controller` — it only knows servlets. **DispatcherServlet bridges the gap** between Tomcat and Spring controllers.
2. DispatcherServlet is Spring's **Front Controller** — all requests go through it, and it routes to the right `@Controller` class.
3. Register DispatcherServlet in **`web.xml`** using `<servlet>` and `<servlet-mapping>` tags.
4. The `<servlet-name>` must be **identical** in both tags — it's the link between declaration and URL mapping.
5. `<url-pattern>/</url-pattern>` means **all requests** go to the DispatcherServlet.
6. The DispatcherServlet expects a configuration file named **`{servlet-name}-servlet.xml`** in `WEB-INF/`.
7. A **404 → 500 error change** means progress — Tomcat found the servlet but the servlet can't initialize without its config file.
8. Don't forget to add the **Tomcat runtime library** and correct **Java version** to the build path.

### ⚠️ Common Mistakes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Different `<servlet-name>` in servlet vs servlet-mapping | Requests don't reach DispatcherServlet | Use the exact same name in both tags |
| Wrong DispatcherServlet class name | ClassNotFoundException at startup | Use `org.springframework.web.servlet.DispatcherServlet` |
| Missing Tomcat library in build path | Compilation errors or deployment failures | Add Server Runtime via Build Path → Libraries |
| Not creating `{name}-servlet.xml` | 500 error — IOException for missing file | Create the file in `WEB-INF/` (next lesson) |
| Naming the servlet "dispatcher" but expecting "telusko-servlet.xml" | File name mismatch | File name follows convention: `{servlet-name}-servlet.xml` |

### 💡 Pro Tips

1. **The servlet name matters** — Whatever you put in `<servlet-name>` determines the expected XML config filename. Choose a memorable name.
2. **Read error messages carefully** — The 500 error literally told us which file was missing and where it expected it. Error messages are your best debugging tool.
3. **This is a one-time setup** — All this web.xml and build path configuration happens once per project. After setup, you focus on writing controllers and views.
4. **Spring Boot does all of this automatically** — `web.xml`, DispatcherServlet registration, config file creation — all handled behind the scenes. Now you know what "auto-configuration" really means.

---

## 🔗 What's Next?

The DispatcherServlet is registered with Tomcat, but it's asking for its configuration file — `telusko-servlet.xml`. In the next lesson, we'll create this file and configure:

1. **Component scanning** — Tell Spring where to find `@Controller` classes
2. **View Resolver** — Map logical view names to JSP file paths

Once that file is in place, the entire request chain will be connected and the application will finally work.
