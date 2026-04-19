# Introduction to REST APIs & Best Practices

## Introduction

At its core, a microservice is a service that **exposes its business logic** to the outside world via **REST APIs**. Before we start coding, we need to understand what REST is, how it works, and what standards to follow — because poorly designed APIs lead to painful integration, security holes, and maintenance nightmares.

---

## Concept 1: What are REST APIs?

### 🧠 What is it?

REST (Representational State Transfer) is a way for applications to communicate over **HTTP** using lightweight data formats like **JSON**.

Compare this to the older SOAP approach that used heavy XML payloads — REST is simpler, lighter, and the industry standard.

### ❓ Why do microservices need REST?

Microservices are independently deployed services that need to talk to each other. REST provides that communication channel:

- **UI to Backend** — A React/Angular frontend fetches data from a backend microservice
- **Backend to Backend** — Accounts microservice calls Loans microservice to check eligibility
- **External clients to your API** — Mobile apps, third-party integrations

### ⚙️ Synchronous Communication

When a client sends a REST request, it **waits** for the response before proceeding. This is **synchronous** communication — the most common pattern in microservices.

> REST isn't the only option. For asynchronous scenarios, we use message queues (RabbitMQ, Kafka) — but REST is the starting point.

---

## Concept 2: HTTP Methods — The CRUD Standard

### 🧠 What are they?

REST APIs support CRUD (Create, Read, Update, Delete) operations, and each operation maps to a specific HTTP method:

| Operation | HTTP Method | When to Use |
|-----------|------------|-------------|
| **Create** | `POST` | Saving new data (e.g., creating a new account) |
| **Read** | `GET` | Fetching data (e.g., getting account details) |
| **Update (full)** | `PUT` | Replacing an entire record |
| **Update (partial)** | `PATCH` | Updating specific fields only |
| **Delete** | `DELETE` | Removing data |

### ⚠️ Common Mistakes

- Using `GET` to create or modify data — `GET` should **never** change state
- Using `POST` for everything — each operation has its correct HTTP method
- Confusing `PUT` and `PATCH`:
  - **PUT** = "Here's the complete updated record, replace everything"
  - **PATCH** = "Here's just the fields that changed, update only those"

---

## Concept 3: Best Practices for REST APIs

### Practice 1: Input Validation

### ❓ Why is this critical?

Your REST API can be called by **anyone** — a UI application, a mobile app, another microservice, or even a malicious actor. You can't trust that the calling system has validated the data.

**Always validate incoming data** on your API side:
- Required fields present?
- Data types correct?
- Values within expected range?
- No malicious content?

> Never rely on client-side validation. Your API is your last line of defense.

### Practice 2: Exception Handling

### ❓ Why does this matter?

When something goes wrong — a runtime error, a validation failure, a business rule violation — your API must send a **meaningful, structured error response**.

Bad API response:
```
500 Internal Server Error
```

Good API response:
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Account number must be 10 digits",
  "timestamp": "2024-01-15T10:30:00"
}
```

Without good error handling, your clients are **clueless** about what went wrong and you'll spend hours manually explaining issues.

### Practice 3: API Documentation

### ❓ Why document your APIs?

Imagine your organization has **1,000 REST APIs** consumed by hundreds of client applications. If every client team asks:
- "What's the request format?"
- "What validations do you perform?"
- "What does the response look like?"

You'd spend all your time in meetings instead of building software.

**Solution**: Document your APIs using standards like **OpenAPI Specification** (Swagger). This auto-generates interactive documentation that clients can explore themselves.

---

## ✅ Key Takeaways

- REST APIs are the primary communication mechanism in microservices
- Always use the correct HTTP method: POST (create), GET (read), PUT/PATCH (update), DELETE (delete)
- Three non-negotiable standards: **input validation**, **exception handling**, **API documentation**
- REST is synchronous — for async communication, use message queues
- JSON is the standard data format for REST — lightweight and universal

---

## 💡 Pro Tips

- Design your API paths around **resources** (nouns), not actions: `/accounts` not `/getAccounts`
- Always return appropriate **HTTP status codes**: 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Server Error)
- Invest in API documentation early — it saves exponentially more time as your system grows
- Think of input validation as **security**, not just correctness
