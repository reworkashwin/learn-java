# Creating Hello World REST API using @RestController

## Introduction

With our Spring Boot project ready, let's write our very first REST API — the classic "Hello World." This simple exercise demonstrates the elegance of Spring Boot: how little code you need to expose a fully functional REST endpoint to the world.

---

## Concept 1: @RestController — Declaring a REST API Class

### 🧠 What is it?

`@RestController` is a Spring annotation that tells the framework: *"This class contains methods that should be exposed as REST API endpoints."*

When you place this annotation on a class, Spring Boot will:
1. Register the class as a Spring Bean
2. Map its methods to HTTP endpoints
3. Automatically serialize return values to JSON (or plain text)

### ⚙️ Creating the Controller

First, create a new package for controllers, then create the class:

```java
package com.eazybytes.accounts.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AccountsController {

    @GetMapping("/sayHello")
    public String sayHello() {
        return "Hello World";
    }
}
```

Let's break down every piece:

### Package Structure
```
com.eazybytes.accounts.controller
```
Organize REST controllers in a dedicated `controller` package. This is a standard convention — keeps your code clean and predictable.

### @RestController
Placed on the **class** level. Tells Spring: "Expose the methods in this class as REST endpoints."

### @GetMapping("/sayHello")
Placed on the **method** level. This does two things:
1. Maps this method to the URL path `/sayHello`
2. Specifies that it responds to **HTTP GET** requests

Why GET? Because this method only **returns** data — it doesn't create, update, or delete anything.

### The Method
```java
public String sayHello() {
    return "Hello World";
}
```
Simple: accepts no parameters, returns a plain string.

---

## Concept 2: Running and Testing

### ⚙️ Starting the Application

Run the `AccountsApplication` main class (in debug mode for convenience). Watch the console output:

```
Tomcat started on port 8080
Started AccountsApplication in 6.8 seconds
```

Spring Boot automatically:
- Started an **embedded Tomcat** server on port 8080
- Configured the **H2 database** (detected from dependencies)
- Set up **Actuator** endpoints
- Deployed the application with an **empty context path**

All of this happened with **zero configuration** from you.

### 🧪 Testing the API

Open a browser and navigate to:
```
http://localhost:8080/sayHello
```

Response:
```
Hello World
```

That's it. A working REST API in just a few lines of code. Browsers always send GET requests, which is exactly what `@GetMapping` responds to.

---

## Concept 3: DevTools — Automatic Restarts

### 🧠 What is it?

Remember the **Spring Boot DevTools** dependency we added? Here's where it shines.

### 🧪 Example

1. Change the return string from `"Hello World"` to `"Hi World"`
2. Save the file and trigger a build
3. **Don't restart the server manually**

Check the console:
```
Restarted application in 0.008 seconds
```

Spring Boot DevTools detected the change and **restarted only the changed classes** — in 8 milliseconds, compared to the 6+ seconds for a cold start.

Refresh the browser → You see `Hi World`.

### ❓ Why does this matter?

In traditional monolithic development without Spring Boot, **every code change** requires a full manual restart. For developers making dozens of changes per hour, this adds up to significant lost time.

DevTools eliminates that friction entirely — save, build, and your changes are live in milliseconds.

---

## Concept 4: IDE Configuration Tips

### Enable Annotation Processing

Required for **Lombok** to work:
- IntelliJ: `Settings → Build → Compiler → Annotation Processors → Enable`

Without this, Lombok annotations (`@Getter`, `@Setter`, `@Data`, etc.) won't generate code, and you'll get compilation errors.

---

## ✅ Key Takeaways

- `@RestController` marks a class as a REST API controller
- `@GetMapping("/path")` maps a method to an HTTP GET endpoint at the given path
- Spring Boot auto-configures everything: embedded server, database, actuator — with zero manual setup
- DevTools provides lightning-fast auto-restarts (milliseconds vs seconds)
- A complete REST endpoint requires just **one class, one annotation, one method**

---

## ⚠️ Common Mistakes

- Forgetting `@RestController` on the class — your methods won't be exposed as endpoints
- Using `@GetMapping` for operations that modify data — use `@PostMapping`, `@PutMapping`, or `@DeleteMapping` instead
- Not enabling annotation processing — Lombok won't work and you'll see cryptic errors
- Creating the controller outside the base package — Spring's `@ComponentScan` won't find it

---

## 💡 Pro Tips

- Always create controllers in a sub-package of your main application package (e.g., `com.eazybytes.accounts.controller`) — this ensures component scanning picks them up
- Use debug mode when running locally — it provides more detailed logs and allows breakpoints
- Think of `@RestController` as `@Controller` + `@ResponseBody` combined — it automatically serializes return values
- The Hello World endpoint is a great **smoke test** for any new microservice — always create one first to verify your setup works
