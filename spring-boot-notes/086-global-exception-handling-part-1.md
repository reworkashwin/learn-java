# Global Exception Handling in Spring Boot Using @RestControllerAdvice — Part 1

## Introduction

Let's be honest — as developers, we tend to be overconfident. We think our code is bulletproof, that every scenario is covered. But reality hits hard once the application goes to production. Unexpected runtime exceptions pop up in ways you never imagined.

So what happens when your REST API throws an exception? If you don't handle it properly, the client gets a confusing, possibly misleading error response. That's terrible user experience and even worse developer experience for whoever is consuming your API.

In this lesson, we'll learn **why exception handling matters**, explore the naive approach (try-catch in every method), and then discover the elegant Spring Boot solution — **Global Exception Handling** using `@RestControllerAdvice`.

---

## Concept 1: The Problem — Unhandled Exceptions in REST APIs

### 🧠 What is it?

When a REST API method throws a runtime exception and there's no handling logic, Spring Boot returns a default error response that can be **misleading** or **unhelpful** to the client.

### ❓ Why is this a problem?

Imagine your controller throws a `RuntimeException` with the message "It's a bad day." What does the client see? A `404 Not Found` — which has nothing to do with the actual error! The client developer thinks the API path doesn't exist, but the real issue is a runtime failure on the backend.

There's a **clear mismatch** between what's happening on the server and what's being communicated to the client.

### 🧪 Example

```java
@PostMapping("/contacts")
public ResponseEntity<String> saveContact(@RequestBody ContactRequestDto dto) {
    // some logic...
    throw new RuntimeException("It's a bad day");
}
```

The client sees `404 Not Found`, but the server logs show `RuntimeException: It's a bad day`. Confusing, right?

### 💡 Insight

As a backend developer, it's your responsibility to return **proper HTTP status codes** and **meaningful error messages** so that client applications know exactly what went wrong and can respond accordingly.

---

## Concept 2: The Naive Approach — Try-Catch in Every Method

### 🧠 What is it?

The most straightforward way to handle exceptions is wrapping your controller logic in a `try-catch` block and returning a custom error response.

### ⚙️ How it works

```java
@PostMapping("/contacts")
public ResponseEntity<String> saveContact(@RequestBody ContactRequestDto dto) {
    try {
        // business logic...
        throw new RuntimeException("It's a bad day");
    } catch (Exception e) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Request processing failed due to: " + e.getMessage());
    }
}
```

Now the client gets:
- **Status**: `500 Internal Server Error`
- **Body**: `"Request processing failed due to: It's a bad day"`

### ❓ Why is this not ideal?

It works — but think about scale. If you have **100 REST API methods**, you'd need try-catch blocks in every single one. And if you ever want to change how errors are formatted, you'd have to visit **all 100 places**. That's a maintenance nightmare.

### 💡 Insight

The try-catch approach is fine for small projects or special cases, but it violates the **DRY (Don't Repeat Yourself)** principle. There has to be a better way — and there is.

---

## Concept 3: The Better Way — Global Exception Handling with @RestControllerAdvice

### 🧠 What is it?

Spring Boot provides a mechanism to handle exceptions **globally** — in one central place — so you don't have to repeat try-catch blocks across all your controllers. This is done using the `@RestControllerAdvice` annotation.

### ❓ Why do we need it?

- Eliminates repetitive try-catch blocks
- Provides a **single place** to manage all exception handling
- Makes it easy to change error response format in the future
- Produces **consistent error responses** across all APIs

### ⚙️ How it works — Step by Step

**Step 1: Create a Global Exception Handler class**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    // exception handling methods go here
}
```

The `@RestControllerAdvice` annotation tells Spring Boot: *"Whenever an exception occurs in any controller, execute the handling logic defined in this class."*

> `@RestControllerAdvice` = `@ControllerAdvice` + `@ResponseBody`
>
> - `@RestControllerAdvice` → sends error response as **JSON**
> - `@ControllerAdvice` → can send error details as **HTML**
>
> Since we're building a REST API backend, we use `@RestControllerAdvice`.

**Step 2: Create a standardized Error Response DTO**

```java
public record ErrorResponseDto(
    String apiPath,
    HttpStatus errorCode,
    String errorMessage,
    LocalDateTime errorTime
) {}
```

This ensures **every error** from your application follows the same structure. The client always knows what to expect:
- `apiPath` — which API was called
- `errorCode` — the HTTP status code
- `errorMessage` — what went wrong
- `errorTime` — when it happened

**Step 3: Define exception handler methods**

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponseDto> handleException(
        Exception exception, WebRequest webRequest) {

    ErrorResponseDto error = new ErrorResponseDto(
        webRequest.getDescription(false),  // API path (no session info)
        HttpStatus.INTERNAL_SERVER_ERROR,
        exception.getMessage(),
        LocalDateTime.now()
    );

    return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
}
```

### ❓ What does `@ExceptionHandler` do?

This annotation tells Spring: *"When this specific type of exception occurs, execute this method."*

- `@ExceptionHandler(Exception.class)` → catches **all** exceptions (since `Exception` is the parent of all exceptions in Java)
- `@ExceptionHandler(NullPointerException.class)` → catches **only** NullPointerExceptions

### 🧪 Example — Multiple Exception Handlers

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleException(
            Exception exception, WebRequest webRequest) {
        ErrorResponseDto error = new ErrorResponseDto(
            webRequest.getDescription(false),
            HttpStatus.INTERNAL_SERVER_ERROR,
            exception.getMessage(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ErrorResponseDto> handleNullException(
            NullPointerException exception, WebRequest webRequest) {
        ErrorResponseDto error = new ErrorResponseDto(
            webRequest.getDescription(false),
            HttpStatus.INTERNAL_SERVER_ERROR,
            "A NullPointerException occurred due to: " + exception.getMessage(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

When a `NullPointerException` is thrown, the second method (more specific) is called. For any other exception, the first method (generic) handles it.

### 💡 Insight

Think of `@RestControllerAdvice` as a **safety net** stretched under all your controllers. No matter which controller throws an exception, this net catches it and produces a clean, consistent error response. You write the handling logic **once**, and it works **everywhere**.

---

## Concept 4: How the Exception Propagation Works

### 🧠 What is it?

When an exception occurs at any layer — data layer, service layer, or controller layer — and it's not caught, it **propagates upward**. The data layer exception bubbles up to the service layer, and from there to the controller layer, where `@RestControllerAdvice` catches it.

### ⚙️ How it works

```
Data Layer → throws exception
    ↓ (propagates)
Service Layer → doesn't catch → propagates further
    ↓ (propagates)
Controller Layer → doesn't catch → propagates further
    ↓ (caught!)
GlobalExceptionHandler (@RestControllerAdvice) → handles it
```

### ❓ What if I want to handle some exceptions locally?

You absolutely can! For special scenarios where you need business-specific exception handling in the service layer, use try-catch there. The global handler only catches what **isn't caught** along the way.

### 💡 Insight

If you define an `@ExceptionHandler` method **inside a controller class**, it takes **higher priority** than the global handler for that specific controller. Controller-specific handlers override global handlers — but use this only when you need unique behavior for a particular controller.

---

## ✅ Key Takeaways

1. **Never leave exceptions unhandled** — it leads to confusing error responses for clients
2. **Don't use try-catch in every controller method** — it's repetitive and hard to maintain
3. **Use `@RestControllerAdvice`** to create a centralized, global exception handling mechanism
4. **Use `@ExceptionHandler`** to define which exception types each method handles
5. **Create a standardized `ErrorResponseDto`** so all error responses follow the same structure
6. **`Exception.class`** catches all exceptions; use specific exception classes for targeted handling
7. Controller-level `@ExceptionHandler` methods have **higher priority** than global ones

## ⚠️ Common Mistakes

- Forgetting to annotate the handler class with `@RestControllerAdvice`
- Using `@ControllerAdvice` instead of `@RestControllerAdvice` for REST API projects (you'd need to add `@ResponseBody` separately)
- Defining multiple handler methods for the **same exception type** — this causes ambiguity
- Not passing meaningful messages in the error response

## 💡 Pro Tips

- Always use `@RestControllerAdvice` for pure REST API backends
- Keep your `ErrorResponseDto` consistent across the entire application
- Use `WebRequest.getDescription(false)` to get the API path without sensitive session information
- Define specific exception handlers for known exception types, and keep a generic `Exception.class` handler as a catchall
