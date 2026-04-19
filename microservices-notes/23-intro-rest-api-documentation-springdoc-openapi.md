# Introduction to Documentation of REST APIs Using springdoc-openapi

## Introduction

You've built your REST APIs. They work. They validate input. They handle exceptions. So why bother documenting them?

Here's the reality: the moment someone else needs to consume your APIs — a frontend team, a mobile app team, a QA team, a third-party partner — they'll bombard you with questions. *What's the request format? What's the response? What validations do you enforce? What status codes do you return?*

You could answer these questions in meetings. Once. Twice. Ten times. Or... you could document your APIs using an industry standard, give them a URL, and let them **self-serve**. That's exactly what **OpenAPI specification** and **Swagger UI** give you — and with Spring Boot, it takes literally one Maven dependency.

---

## Concept 1: Why Document REST APIs?

### 🧠 What is it?

API documentation is a machine-readable and human-readable description of your REST APIs — what endpoints exist, what they accept, what they return, and what rules they enforce.

### ❓ Why do we need it?

Consider these scenarios:
- A **UI team** wants to integrate with your backend — they need to know request/response formats
- A **QA team** wants to write test cases — they need to know expected behaviors
- A **third-party partner** wants to consume your service — they need everything documented
- A **new developer** joins the team — they need to understand existing APIs quickly

Without documentation, you become the human documentation. That doesn't scale.

### 💡 Insight

Many senior developers skip this step during development and only add documentation when they deploy to production and someone complains. Don't follow that pain process. Add it early — it costs you almost nothing.

---

## Concept 2: OpenAPI Specification

### 🧠 What is it?

**OpenAPI** is an open-source standard for describing HTTP APIs. It provides a standardized way to define:
- API endpoints and their HTTP methods
- Request parameters and body formats
- Response formats and status codes
- Validation rules
- Authentication requirements

Think of it as a universal language for describing REST APIs, so that tools, teams, and machines can all understand your API the same way.

### ❓ Why not just write a Word document?

Because OpenAPI is **machine-readable**. Tools can:
- Auto-generate interactive documentation (Swagger UI)
- Generate client code in any language
- Generate server stubs
- Create automated test cases
- Validate API contracts

---

## Concept 3: springdoc-openapi — The Magic Dependency

### 🧠 What is it?

`springdoc-openapi` is a library that automatically scans your Spring Boot application — controllers, DTOs, annotations — and generates OpenAPI documentation without you writing any documentation code.

### ⚙️ How it works

**Step 1:** Add the dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.x.x</version> <!-- Check GitHub for latest -->
</dependency>
```

> ⚠️ This version works with **Spring Boot 3.x**. For Spring Boot 2.x, use `springdoc-openapi` v1.7.0 instead.

**Step 2:** Reload Maven and restart your application.

**Step 3:** Open your browser and navigate to:

```
http://localhost:8080/swagger-ui/index.html
```

That's it. You've added zero configuration, zero documentation code — and you get a beautiful, interactive API documentation page.

### 🧪 What you see in Swagger UI

The auto-generated documentation shows:
- **All controllers** and their REST API endpoints
- **HTTP methods** (GET, POST, PUT, DELETE) for each endpoint
- **Request body schema** — field names, types, validation constraints
- **Response schema** — what the response looks like
- **Query parameters** — names, types, required/optional
- **Try It Out** button — clients can test APIs directly from the documentation page!

### 💡 Insight

The library reads your existing code to generate docs:
- `@PostMapping`, `@GetMapping` → HTTP method and path
- `@RequestBody CustomerDto` → request body schema
- `@RequestParam` → query parameters
- `@NotEmpty`, `@Size`, `@Pattern` → validation rules shown in schema
- `ResponseEntity<ResponseDto>` → response schema

Your validation annotations double as documentation. That's elegant engineering.

---

## Concept 4: What Auto-Generated Documentation Includes

### Everything it picks up automatically:

| Source | What it generates |
|---|---|
| Controller methods | API endpoints, HTTP methods, paths |
| `@RequestBody` DTOs | Request body schema with all fields |
| `@RequestParam` | Query parameter definitions |
| Validation annotations | Constraints (min, max, pattern, required) |
| Return types | Response schema |
| DTO structure | Nested object relationships |

### What's missing (and we'll fix later):

- ❌ Meaningful API names (shows Java class names like "AccountsController")
- ❌ API descriptions and summaries
- ❌ Example values for fields (shows "string" instead of actual examples)
- ❌ Contact information, version, license
- ❌ Custom response codes (shows default 200 OK even if you return 201)

---

## Concept 5: The Power of Try It Out

### 🧠 What is it?

Swagger UI isn't just documentation — it's an **interactive API client**. Click "Try it out" on any endpoint, fill in the parameters, hit "Execute", and see the real response from your running server.

This means:
- Developers can test your API without Postman
- QA teams can explore your API without writing any code
- Product managers can see what the API returns in real-time

---

## ✅ Key Takeaways

- API documentation is a production standard, not a nice-to-have
- OpenAPI specification is the industry standard for describing REST APIs
- `springdoc-openapi-starter-webmvc-ui` auto-generates documentation from your existing code
- Just add the dependency, restart, and visit `/swagger-ui/index.html`
- Your validation annotations automatically appear as documentation
- Swagger UI provides interactive "Try it out" functionality
- The auto-generated docs need enhancement — which we'll do with additional annotations

## ⚠️ Common Mistakes

- Using `springdoc-openapi` v1.x with Spring Boot 3.x (use the starter for Spring Boot 3)
- Forgetting to restart the application after adding the dependency
- Thinking this is a complex setup — it's literally one dependency
- Ignoring documentation because "I know my own APIs" — it's not for you, it's for everyone else

## 💡 Pro Tips

- Add this dependency at the beginning of development, not at the end
- Validate the version number against the GitHub repo — it may get updated
- The Swagger UI URL (`/swagger-ui/index.html`) is configurable via `application.yml`
- Even the basic auto-generated docs are 100x better than no docs at all
