# Advanced RestClient Usage — Testing and Security

## Introduction

In the previous lesson, we built a complete REST consumer using `RestClient`. Now it's time to **test everything end-to-end** through Postman and learn how to **pass security credentials** when consuming secured REST APIs.

---

## Testing All Operations via Postman

### ⚙️ Setup: Security Configuration

Before testing, ensure the todo paths are publicly accessible:

```java
// In PathsConfig
@Bean
public List<String> publicPaths() {
    return List.of("/api/todos/**");
}
```

The `/**` wildcard ensures all sub-paths under `/api/todos` are also permitted.

### 📖 GET All Todos

**Request:** `GET /api/todos`

**Result:** Returns the full list of todos from the third-party API. This confirms our RestClient is making the external HTTP call, receiving the JSON response, and converting it to Java objects correctly.

### 📖 GET Single Todo

**Request:** `GET /api/todos/1`

**Result:** Returns a single todo object with `id: 1`.

### ✏️ POST — Create a Todo

**Request:** `POST /api/todos`

**Body:**
```json
{
    "userId": 1,
    "title": "Learn RestClient",
    "completed": false
}
```

**Important:** Since this is a POST request, you must include a **CSRF token** in the headers. The response returns a `201 Created` status with the created object (including a fake `id: 201`).

> Remember — JSONPlaceholder is fake. Nothing is actually saved on the server.

### ✏️ PUT — Update a Todo

**Request:** `PUT /api/todos/1`

**Body:**
```json
{
    "userId": 1,
    "title": "Testing",
    "completed": true
}
```

Returns a successful response showing the "updated" data. But if you fetch the same record again, the original data is still there — it's all fake.

### 🗑️ DELETE a Todo

**Request:** `DELETE /api/todos/1`

Requires a CSRF token. Returns a successful response confirming the delete.

---

## Passing Security Credentials with RestClient

### 🧠 Why Is This Important?

In the real world, most REST APIs you'll consume are **secured**. You'll need to send authentication credentials — whether that's a JWT token, basic auth username/password, or API keys.

### ⚙️ Option 1: Configure Security at Bean Level

When creating the `RestClient` bean, you can set default security headers that apply to **every request**:

```java
this.restClient = builder
        .baseUrl("https://jsonplaceholder.typicode.com")
        .defaultHeader("Accept", "application/json")
        .defaultHeaders(headers -> {
            headers.setBearerAuth("your-jwt-token-here");
        })
        .build();
```

For **Basic Authentication** (username + password):

```java
.defaultHeaders(headers -> {
    headers.setBasicAuth("username", "password");
})
```

> Setting credentials at the bean level means every request made by this RestClient will include those credentials automatically.

### ⚙️ Option 2: Configure Security Per Request

You can also set credentials for individual requests in your service methods:

```java
public List<TodoDto> findAll() {
    return restClient.get()
            .uri(TODOS_API)
            .headers(headers -> {
                headers.setBearerAuth("your-jwt-token");
            })
            .retrieve()
            .body(new ParameterizedTypeReference<>() {});
}
```

### 🤔 Bean-Level vs Request-Level?

| Approach | When to Use |
|----------|-------------|
| Bean-level (`defaultHeaders`) | When all requests to this API use the same credentials |
| Request-level (`.headers()`) | When different requests need different tokens or credentials |

### 📋 Available Auth Methods

| Method | Purpose |
|--------|---------|
| `headers.setBearerAuth(token)` | Send a JWT/Bearer token |
| `headers.setBasicAuth(user, pass)` | Send Basic Auth credentials |
| `headers.setBasicAuth(encodedCredentials)` | Send pre-encoded credentials |

---

## ✅ Key Takeaways

- Always include CSRF tokens for POST, PUT, DELETE requests when testing with Postman
- Use `defaultHeaders()` on the builder to set credentials for all requests
- Use `.headers()` on individual requests for per-request credentials
- `setBearerAuth()` for JWT tokens, `setBasicAuth()` for username/password
- Both bean-level and request-level security configuration are valid approaches

## ⚠️ Common Mistakes

- Forgetting the CSRF token for write operations — you'll get `403 Forbidden`
- Hardcoding tokens in source code — use externalized configuration in production
- Not configuring `permitAll` for test endpoints — requests will be blocked by Spring Security

## 💡 Pro Tips

- In production, inject tokens from configuration properties or a secret manager — never hardcode
- Use **request interceptors** for more complex authentication logic (e.g., refreshing expired tokens)
- The `defaultHeaders` consumer lambda gives you access to all `HttpHeaders` methods — explore them for advanced use cases
