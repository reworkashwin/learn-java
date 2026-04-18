# REST API Consumers — The Other Side of REST

## Introduction

So far in this course, we've been **building** REST APIs — we've been the **producers**. We created endpoints, handled requests, returned responses. But here's a question: what happens when *your* backend application needs to **call someone else's** REST API?

In real enterprise applications, this happens all the time. You might need to integrate with a payment gateway, fetch data from a third-party service, or communicate with another microservice within your organization. In all these scenarios, **your application becomes the consumer** — the one making the HTTP request, not receiving it.

This section is all about learning how to **consume REST APIs** from within a Spring Boot application.

---

## The Two Sides of REST

### 🧠 What Are Producers and Consumers?

Think of REST APIs like a restaurant:
- The **producer** is the kitchen — it prepares and serves the food (data).
- The **consumer** is the customer — it places the order and receives the food.

In technical terms:
- **Producer**: The application that **exposes** REST APIs for others to call.
- **Consumer**: The application that **invokes** (calls) REST APIs exposed by another application.

Until now, we've only been the kitchen. Now we're also going to learn how to be the customer.

### ❓ When Does Your App Become a Consumer?

Imagine your Job Portal backend needs to integrate with a third-party service — let's say a service that provides todo lists. The communication between your app and the third-party app happens over **HTTP using REST APIs**. Your application sits on the **client side**.

> Whenever your backend application makes an HTTP call to another service's REST API, you are **consuming** that API.

---

## JSONPlaceholder — Our Practice API

### 🧠 What Is It?

Since we don't have a real third-party API to integrate with, we'll use **JSONPlaceholder** — a free, fake REST API available at `jsonplaceholder.typicode.com`.

It provides fake data for resources like:
- **Posts** — blog-style posts with `userId`, `id`, `title`, and `body`
- **Todos** — task items with `userId`, `id`, `title`, and `completed`
- **Albums**, **Users**, and more

### ⚙️ What Operations Can We Perform?

| Operation | HTTP Method | Example Path |
|-----------|-------------|--------------|
| Get all posts | GET | `/posts` |
| Get single post | GET | `/posts/1` |
| Create a post | POST | `/posts` |
| Update a post | PUT | `/posts/1` |
| Patch a post | PATCH | `/posts/1` |
| Delete a post | DELETE | `/posts/1` |

> Nothing is actually saved or deleted on the server — it's all **fake responses** for testing purposes.

Throughout this section, we'll practice with **Posts** and **Todos** APIs.

---

## Setting Up the Dependency

### 🧠 What Do We Need?

To consume REST APIs in a Spring Boot application, you need the **HTTP Client starter dependency**:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-rest-client</artifactId>
</dependency>
```

This starter gives you **two options** for making HTTP calls:

| Option | Status | Recommendation |
|--------|--------|----------------|
| `RestTemplate` | **Deprecated** | Do NOT use — will be removed in future versions |
| `RestClient` | **Modern & Recommended** | Use this for synchronous HTTP calls |

### ⚠️ What About WebClient?

If you're building **reactive (asynchronous)** applications using the reactive tech stack, you'd use a different starter:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

This provides **WebClient**, which allows asynchronous REST API calls — meaning your code doesn't wait for the response before continuing. Reactive programming is a separate topic and is **out of scope** for this course.

---

## RestClient vs RestTemplate — Why RestClient Wins

### ⚠️ RestTemplate Is Deprecated

The Spring team has explicitly stated:

> *"As of 6.1, RestClient offers a more modern API for synchronous HTTP access. For asynchronous and streaming scenarios, consider WebClient."*

Both `RestTemplate` and `RestClient` share the same underlying infrastructure, but **RestClient is where all new features will be added**. The Spring team plans to **remove RestTemplate** in future versions.

### ✅ Use RestClient

`RestClient` is an **interface** that provides a fluent, modern API for making synchronous HTTP calls. It's the focus of all new Spring development for HTTP consumers.

---

## ✅ Key Takeaways

- **Producer** = exposes REST APIs; **Consumer** = calls REST APIs
- In enterprise apps, your backend frequently needs to consume external APIs
- Use `spring-boot-starter-rest-client` for synchronous HTTP calls
- **RestClient** is the modern, recommended approach — avoid `RestTemplate`
- **WebClient** is for reactive/async scenarios only
- JSONPlaceholder is a great practice API for learning REST consumption

## ⚠️ Common Mistakes

- Using `RestTemplate` in new projects — it's deprecated and will be removed
- Confusing producers and consumers — your app can be **both** at the same time
- Mixing up `RestClient` (synchronous) and `WebClient` (asynchronous)

## 💡 Pro Tips

- In microservices architecture, almost every service is both a producer AND a consumer
- Always add the `rest-client` starter dependency before writing any REST consumption code
- JSONPlaceholder (`jsonplaceholder.typicode.com`) is your best friend for practicing REST API consumption without any setup
