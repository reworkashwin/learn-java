# Getting Header Data with @RequestHeader

## Introduction

We've learned how to read data from the URL — through path variables and query parameters. But there's another crucial part of every HTTP request that often carries important information: **headers**.

Headers are like the **metadata** of an HTTP request. They don't carry the main data (that's the body's job), but they carry information *about* the request — who sent it, what language the user speaks, where they're located, what format they expect, and much more. Let's learn how to read these headers in our Spring Boot REST APIs.

---

## Concept 1: What Are HTTP Request Headers?

### 🧠 Simple Explanation

Think of an HTTP request like a letter:
- The **URL** is the address on the envelope
- The **body** is the letter inside
- The **headers** are the notes written on the envelope — sender info, priority, special instructions

### 🧪 What Headers Look Like in Postman

Open any request in Postman and click the **Headers** tab. You'll see Postman automatically sends several headers:

| Header | Example Value | Purpose |
|--------|---------------|---------|
| `User-Agent` | `PostmanRuntime/7.x` | Identifies the client application |
| `Accept` | `*/*` | What response formats the client accepts |
| `Host` | `localhost:8080` | The server being targeted |
| `Connection` | `keep-alive` | Connection management |

These are **default headers** — Postman sends them with every request. But you can also add **custom headers** for things like:
- User location
- User language preference
- Authentication tokens
- Custom business logic metadata

---

## Concept 2: Reading Headers with @RequestHeader

### ⚙️ Basic Syntax

```java
@GetMapping("/headers")
public String readHeaders(
    @RequestHeader("User-Agent") String userAgent,
    @RequestHeader("User-Location") String userLocation
) {
    return "Received userAgent: " + userAgent + " and location: " + userLocation;
}
```

### 🧠 How It Works

1. You annotate a method parameter with `@RequestHeader("header-name")`
2. Spring extracts the value of that header from the incoming HTTP request
3. The value gets injected into your method parameter

### 🧪 Testing in Postman

1. Create a GET request to `/api/dummy/users/headers`
2. Go to the **Headers** tab
3. `User-Agent` is already present by default
4. Add a new header: Key = `User-Location`, Value = `Hyderabad`
5. Click **Send**

Response:
```
Received userAgent: PostmanRuntime/7.x and location: Hyderabad
```

---

## Concept 3: Making Headers Optional

### ❓ What If a Header Is Missing?

By default, all `@RequestHeader` parameters are **required**. If the client doesn't send a required header, you get a **400 Bad Request**.

### ⚙️ Making It Optional

Just like `@RequestParam`, you can use `required = false`:

```java
@RequestHeader(value = "User-Location", required = false) String userLocation
```

Now if `User-Location` isn't sent, `userLocation` will be `null` instead of causing an error.

### ⚙️ Setting a Default Value

```java
@RequestHeader(value = "User-Location", required = false, defaultValue = "Hyderabad") 
String userLocation
```

- Client sends `User-Location: Delhi` → value is `"Delhi"`
- Client doesn't send `User-Location` → value is `"Hyderabad"`

⚠️ **Important:** When using `required` and `defaultValue` together, you must explicitly assign the header name to either the `name` or `value` parameter. You can't just pass it as the first argument anymore.

---

## Concept 4: Reading All Headers with Map

### ⚙️ Syntax

```java
@GetMapping("/header/map")
public String readHeadersWithMap(@RequestHeader Map<String, String> requestHeaders) {
    String userAgent = requestHeaders.get("user-agent");
    String userLocation = requestHeaders.get("user-location");
    return "Received userAgent: " + userAgent + " and location: " + userLocation;
}
```

### 🧠 What's in the Map?

When you use `Map<String, String>`, Spring puts **all** headers into the map — not just your custom ones. In a typical Postman request, you might see 7+ headers including:
- `user-agent`
- `accept`
- `host`
- `connection`
- `accept-encoding`
- `user-location` (your custom header)

### ⚠️ Watch the Case!

Header names in the Map are **lowercase**. This is a common gotcha:

```java
// ❌ Wrong — won't find the header
requestHeaders.get("User-Agent")

// ✅ Correct — headers are stored in lowercase
requestHeaders.get("user-agent")
```

This caught the instructor during the demo — the initial attempt returned `null` because of uppercase letters!

---

## Concept 5: Reading Headers with HttpHeaders

### 🧠 What is HttpHeaders?

Spring provides a dedicated class called `HttpHeaders` (from `org.springframework.http`) that offers a more structured way to read headers compared to a raw Map.

### ⚙️ Syntax

```java
@GetMapping("/http-headers")
public String readWithHttpHeaders(@RequestHeader HttpHeaders requestHeaders) {
    String userAgent = requestHeaders.get("user-agent").toString();
    String userLocation = requestHeaders.get("user-location").toString();
    return "Received userAgent: " + userAgent + " and location: " + userLocation;
}
```

### 💡 HttpHeaders vs Map — Which One?

| Feature | `Map<String, String>` | `HttpHeaders` |
|---------|----------------------|---------------|
| Type | Generic Java Map | Spring-specific class |
| Access | `map.get("key")` | `headers.get("key")` |
| Extra methods | None | Has utility methods for common headers |
| Import | `java.util.Map` | `org.springframework.http.HttpHeaders` |

Both work well. `HttpHeaders` is more idiomatic in Spring and provides convenience methods for common headers.

⚠️ **Important:** Make sure you import `HttpHeaders` from `org.springframework.http`, **not** from `java.net`.

---

## Concept 6: Three Ways to Read Headers — Summary

```java
@RestController
@RequestMapping("/api/dummy/users")
public class UserController {

    // 1. Individual headers
    @GetMapping("/headers")
    public String individual(
        @RequestHeader("User-Agent") String userAgent,
        @RequestHeader(value = "User-Location", defaultValue = "Unknown") String location
    ) {
        return userAgent + " - " + location;
    }

    // 2. All headers via Map
    @GetMapping("/header/map")
    public String withMap(@RequestHeader Map<String, String> headers) {
        return headers.get("user-agent") + " - " + headers.get("user-location");
    }

    // 3. All headers via HttpHeaders
    @GetMapping("/http-headers")
    public String withHttpHeaders(@RequestHeader HttpHeaders headers) {
        return headers.get("user-agent") + " - " + headers.get("user-location");
    }
}
```

---

## ✅ Key Takeaways

1. **Headers** carry metadata about the HTTP request — client info, location, language, auth tokens, etc.
2. **`@RequestHeader("name")`** reads a single header into a method parameter
3. Headers are **required by default** — missing ones cause `400 Bad Request`
4. Use **`required = false`** and **`defaultValue`** to handle optional headers gracefully
5. Use **`Map<String, String>`** to read all headers at once — but remember keys are **lowercase**
6. Use **`HttpHeaders`** for a Spring-native approach with utility methods
7. Import `HttpHeaders` from **`org.springframework.http`**, not `java.net`

## ⚠️ Common Mistakes

- Using uppercase header names in `Map.get()` — headers are stored in lowercase in the Map
- Importing `HttpHeaders` from `java.net` instead of `org.springframework.http`
- Forgetting to assign the header name to `value` or `name` when using additional parameters like `required` or `defaultValue`

## 💡 Pro Tips

- Use the `@RequestHeader` approach for individual header reads when you know exactly which headers you need
- Use `Map` or `HttpHeaders` when you need to inspect all headers (useful for debugging and logging)
- Set breakpoints in your IDE when using Map/HttpHeaders to inspect what headers are actually arriving — it's a great way to learn what clients send by default
- Custom headers (like `User-Location`) are great for passing contextual information without polluting the URL
