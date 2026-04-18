# Global Exception Handling in Spring Boot — Part 2 (Validation & Demo)

## Introduction

In Part 1, we set up the `@RestControllerAdvice` with `@ExceptionHandler` methods and created a standardized `ErrorResponseDto`. Now it's time to see it all in action — validate that the global exception handling actually works, understand the priority rules, and see how different exception types trigger different handlers.

---

## Concept 1: Validating the Global Exception Handler

### 🧠 What is it?

We intentionally throw exceptions from a controller method to verify that the `GlobalExceptionHandler` catches them and returns a properly structured JSON error response.

### 🧪 Example — RuntimeException

With a `throw new RuntimeException("It's a bad day")` in the controller and no try-catch, invoking the API from Postman returns:

```json
{
    "apiPath": "uri=/api/contacts",
    "errorCode": "INTERNAL_SERVER_ERROR",
    "errorMessage": "It's a bad day",
    "errorTime": "2025-04-18T10:30:00"
}
```

- **HTTP Status**: `500 Internal Server Error`
- The response is **structured**, **consistent**, and **meaningful**

The `GlobalExceptionHandler` method annotated with `@ExceptionHandler(Exception.class)` caught this because `RuntimeException` is a subclass of `Exception`.

### 💡 Insight

This is the real power of Spring Boot — you write exception handling logic **once** in one class, and every controller in your application automatically benefits. No try-catch blocks needed anywhere.

---

## Concept 2: Specific Exception Handlers

### 🧠 What is it?

You can define multiple `@ExceptionHandler` methods in your `GlobalExceptionHandler` class, each targeting a **different exception type**. Spring Boot picks the **most specific** handler that matches the exception.

### 🧪 Example — NullPointerException

If the controller throws `new NullPointerException("It's a bad day")`, and you have:

```java
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
```

The response will be:

```json
{
    "apiPath": "uri=/api/contacts",
    "errorCode": "INTERNAL_SERVER_ERROR",
    "errorMessage": "A NullPointerException occurred due to: It's a bad day",
    "errorTime": "2025-04-18T10:32:00"
}
```

Notice the message is different — `"A NullPointerException occurred due to..."` — confirming the specific handler was invoked, not the generic one.

### ⚙️ How does Spring decide which handler to invoke?

Spring follows this priority:
1. **Most specific match first** — If there's a handler for `NullPointerException.class`, it's used for NPEs
2. **Fall back to parent** — If no specific handler exists, the handler for `Exception.class` (the parent) catches it
3. **Controller-level > Global** — Handlers inside a controller class override the global handler

---

## Concept 3: Controller-Level Exception Handlers — Priority Rules

### 🧠 What is it?

You can also define `@ExceptionHandler` methods **inside a controller class** (not just in the `@RestControllerAdvice` class). When you do this, the controller-specific handler takes priority over the global one for that controller.

### 🧪 Example

```java
@RestController
public class ContactController {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleLocalException(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Exception from controller class due to: " + e.getMessage());
    }

    @PostMapping("/contacts")
    public ResponseEntity<String> saveContact(@RequestBody ContactRequestDto dto) {
        throw new RuntimeException("It's a bad day");
    }
}
```

When this API is invoked, the response comes from the **controller-level handler**, not the `GlobalExceptionHandler`.

### ❓ When should you use controller-level handlers?

Almost never. Use them **only** when a specific controller needs to handle exceptions in a **unique way** that doesn't fit the global pattern. In 99% of cases, the `@RestControllerAdvice` approach is sufficient and preferred.

### 💡 Insight

Think of it like a chain of command:
1. **Controller-level handler** → checked first
2. **Global handler (specific exception)** → checked next
3. **Global handler (generic Exception)** → fallback

---

## Concept 4: Defining Multiple Methods for Different Exceptions

### 🧠 What is it?

Inside `GlobalExceptionHandler`, you can define as many `@ExceptionHandler` methods as you need — each handling a different exception type with different logic.

### ⚙️ How it works

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Catches ALL exceptions (fallback)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleException(...) { ... }

    // Catches only NullPointerException
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ErrorResponseDto> handleNullException(...) { ... }

    // You could add more:
    // @ExceptionHandler(IllegalArgumentException.class)
    // @ExceptionHandler(CustomBusinessException.class)
}
```

### ⚠️ Important Rule

Each method must handle a **different** exception type. You **cannot** have two methods both handling the same exception class — that creates ambiguity and Spring will throw an error.

### 💡 Insight

A practical strategy:
- Define **specific handlers** for known, common exceptions (validation errors, not-found scenarios, business rule violations)
- Keep a **generic `Exception.class` handler** as the last safety net for anything unexpected

---

## Concept 5: Summary of Key Annotations

### 🧠 The Two Essential Annotations

| Annotation | Purpose |
|-----------|---------|
| `@RestControllerAdvice` | Marks a class as a global exception handler for all controllers. Combines `@ControllerAdvice` + `@ResponseBody`. |
| `@ExceptionHandler` | Marks a method as a handler for a specific exception type. Specify the exception class as the annotation value. |

### ⚙️ How they work together

```java
@RestControllerAdvice  // ← "I handle exceptions globally"
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)  // ← "I handle this type of exception"
    public ResponseEntity<ErrorResponseDto> handleException(...) {
        // build and return error response
    }
}
```

---

## ✅ Key Takeaways

1. The `GlobalExceptionHandler` catches exceptions from **all layers** — data, service, and controller — as they propagate up
2. **Specific exception handlers** take priority over generic ones
3. **Controller-level handlers** override global handlers for that specific controller
4. You can define **multiple handler methods** — each for a different exception type
5. Always keep a **generic `Exception.class` handler** as a safety net
6. The `ErrorResponseDto` ensures consistent, predictable error responses across your entire API

## ⚠️ Common Mistakes

- Defining two methods for the **same exception type** → causes ambiguity errors
- Putting exception handlers in every controller → defeats the purpose of global handling
- Forgetting to remove test `throw` statements from controllers after debugging
- Not testing the exception handling flow end-to-end with tools like Postman

## 💡 Pro Tips

- Use Postman or similar tools to test each exception scenario explicitly
- Keep test `throw` statements temporarily to verify handlers work, then **always clean them up**
- For production apps, log the full stack trace on the server side but only send clean messages to the client
- In future sections, you'll add exception handlers for validation errors (`MethodArgumentNotValidException`) — the pattern stays the same
