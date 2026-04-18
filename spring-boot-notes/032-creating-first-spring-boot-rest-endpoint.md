# Creating Your First Spring Boot REST Endpoint

## Introduction

Enough theory — let's **build something**. In this note, we'll create a Spring Boot web application from scratch, write our very first REST API, and see it running in the browser. By the end, you'll experience firsthand why developers love Spring Boot — it's fast, simple, and almost magical.

---

## Step 1: Generating a Spring Boot Project

### 🧠 What is start.spring.io?

The easiest and most popular way to create a Spring Boot project is through **[start.spring.io](https://start.spring.io)** — an official website maintained by the Spring team itself. Think of it as a project generator: you tell it what you want, and it gives you a ready-to-go skeleton.

### ⚙️ How to Configure Your Project

Here's exactly what you need to select:

| Setting | Value |
|---|---|
| **Project** | Maven |
| **Language** | Java |
| **Spring Boot Version** | Default (latest stable) |
| **Group** | `com.eazybytes` |
| **Artifact** | `backend` |
| **Name** | `backend` |
| **Description** | Backend project for job portal application |
| **Package Name** | `com.eazybytes.backend` (auto-populated) |
| **Packaging** | Jar |
| **Java Version** | Default |

### 📦 Adding Dependencies

Search for **"Web"** and add the **Spring Web** dependency. This single dependency gives you:
- The ability to build REST APIs
- An **embedded Apache Tomcat server** (no manual deployment needed!)

### 💡 Pro Tip

> Keep your `group` and `artifact` values consistent with the course instructor's values. This makes it much easier to compare code with any shared GitHub repository when debugging.

Once configured, click **"Generate"** to download the project as a `.zip` file (~15 KB — it's just a skeleton!).

---

## Alternative: Generating via IntelliJ IDEA

If you're using IntelliJ IDEA (Ultimate/Premium edition), there's a built-in approach:

1. Click **New Project** → Select **Spring Boot** under Generators
2. Fill in the same configuration (name, group, artifact, language, build tool)
3. Select **Spring Web** dependency
4. Click **Create**

Under the hood, IntelliJ uses the same `start.spring.io` service. Both approaches produce identical results.

---

## Step 2: Opening and Building the Project

### ⚙️ Setup in IntelliJ

1. **Open** the extracted project folder in IntelliJ
2. If prompted, **Trust the project**
3. Go to the **Maven** tab → Click **Reload All Maven Projects** (this downloads all dependencies)
4. **Build** the project: `Cmd + F9` (Mac) or `Ctrl + F9` (Windows)

At this point, you have a fully functional Spring Boot project — without writing a single line of code yet.

---

## Step 3: Writing Your First REST API

### 🧠 Project Structure

When you open the project, you'll see:

```
src/
└── main/
    └── java/
        └── com/eazybytes/backend/
            └── BackendApplication.java    ← Main class (auto-generated)
```

The `BackendApplication.java` has the `@SpringBootApplication` annotation — we'll decode this in a later note. For now, let's focus on building a REST API.

### ⚙️ Creating the Controller

**Step 1:** Create a new sub-package called `controller` under `com.eazybytes.backend`

```
com.eazybytes.backend.controller
```

Why `controller`? Because **REST APIs accept requests from client applications**, and all client-facing logic belongs in the controller layer. It's a convention that keeps your code organized.

**Step 2:** Create a new class called `DemoController`

```java
package com.eazybytes.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DemoController {

    @GetMapping("/home")
    public String sayHello() {
        return "Hello World";
    }
}
```

### 🔍 Breaking Down the Code

| Element | Purpose |
|---|---|
| `@RestController` | Tells Spring this class contains REST API endpoints |
| `@GetMapping("/home")` | Maps HTTP GET requests to the `/home` path |
| `sayHello()` | The method that handles the request and returns a response |
| `"Hello World"` | The response sent back to the client |

Don't worry about fully understanding `@RestController` and `@GetMapping` yet — we'll cover them in dedicated notes. The goal right now is to **see how simple it is**.

---

## Step 4: Running the Application

### ⚙️ Starting the Server

1. Go to `BackendApplication.java` (the main class)
2. Click the **Debug** or **Run** button next to the `main` method
3. Watch the console — your app starts on **port 8080** by default

### 🎯 The Magic Moment

Notice what you did **NOT** have to do:
- ❌ Configure a server
- ❌ Write deployment descriptors
- ❌ Install or set up Tomcat
- ❌ Define any XML configuration

Spring Boot handled **all of that** behind the scenes. As a developer, you only focused on:
- ✅ Adding a dependency
- ✅ Writing a controller class
- ✅ Defining a REST endpoint

---

## Step 5: Testing Your REST API

Open your browser and navigate to:

```
http://localhost:8080/home
```

| Part | Meaning |
|---|---|
| `localhost` | Your local machine |
| `8080` | The port where Spring Boot started the app |
| `/home` | The path you defined in `@GetMapping` |

You should see: **Hello World** 🎉

That's your first REST API — alive and responding!

---

## What Spring Boot Is Doing Behind the Scenes

Let's appreciate what just happened with minimal code:

```
You wrote ~10 lines of code
    ↓
Spring Boot:
    ✅ Created an embedded Tomcat server
    ✅ Configured the server to listen on port 8080
    ✅ Scanned your classes for REST endpoints
    ✅ Registered your @GetMapping("/home") endpoint
    ✅ Deployed your app into the embedded server
    ✅ Started accepting HTTP requests
```

For comparison:
- **Plain Java (no framework):** ~500+ lines of code for the same result
- **Spring Framework alone:** ~100+ lines of code
- **Spring Boot:** ~10 lines ✅

---

## The Bigger Picture — What Spring Boot Solves

When an outsider looks at a web application, they only see the UI and business logic. But behind the scenes, a web application requires:

- Sessions and Caching
- Transaction Management
- Security
- Logging
- Database Persistence
- Data Transfer (JSON/XML)
- Batch Processing
- And much more...

For **every single one** of these challenges, Spring Boot and the Spring ecosystem have answers. Throughout this course, you'll explore these features while building a real enterprise application.

---

## ✅ Key Takeaways

1. **start.spring.io** is the official project generator — use it to create Spring Boot skeletons in seconds.
2. **Spring Web dependency** gives you REST API support + an embedded Tomcat server.
3. A REST API needs just **three things**: `@RestController` on the class, `@GetMapping` on the method, and a return value.
4. **Spring Boot auto-configures everything** — server, deployment, scanning — so you focus only on business logic.
5. Your app runs at `http://localhost:8080` by default — no manual server setup needed.

---

## ⚠️ Common Mistakes

- **Forgetting the `@RestController` annotation** — without it, Spring won't recognize your class as a REST controller.
- **Not reloading Maven dependencies** — if your IDE doesn't download dependencies, nothing will compile.
- **Using the wrong path** — if you defined `@GetMapping("/home")`, you must hit `/home`, not `/` or `/hello`.
- **Port already in use** — if port 8080 is occupied by another process, the app won't start. Stop the other process first.

---

## 💡 Pro Tips

- **Always create a `controller` package** for your REST API classes. It's a Spring convention and keeps your project organized.
- **Use Debug mode** instead of Run — it allows you to set breakpoints and inspect your application during development.
- After making code changes, **rebuild and restart** the application to see updates (we'll learn about hot-reload later).
