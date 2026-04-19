# Handle All Runtime Exceptions Using Global Logic

## Introduction

Our accounts microservice has four working CRUD APIs. We've already handled two **business exceptions** — `CustomerAlreadyExistsException` and `ResourceNotFoundException`. But what about unexpected **runtime exceptions**? A null pointer, a database connection failure, a serialization error? Without a catch-all handler, clients get ugly stack traces and unhelpful 500 errors. In this lecture, we add the final safety net.

---

## The Problem

Right now, our `GlobalExceptionHandler` only catches two specific exception types. If anything else goes wrong — a `NullPointerException`, `DataAccessException`, `IllegalArgumentException`, or any other unchecked exception — Spring Boot returns its default error page with a raw stack trace. That's:

- **Insecure** — Stack traces reveal internal class names, file paths, and library versions
- **Unhelpful** — Clients get an HTML error page instead of structured JSON
- **Inconsistent** — Some errors return clean JSON (our custom ones), others return raw text

---

## The Solution: A Catch-All Exception Handler

Add one more method to `GlobalExceptionHandler`:

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    // ... existing handlers for CustomerAlreadyExistsException, ResourceNotFoundException ...

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGlobalException(
            Exception exception, WebRequest webRequest) {
        
        ErrorResponseDto errorResponse = new ErrorResponseDto(
            webRequest.getDescription(false),
            HttpStatus.INTERNAL_SERVER_ERROR,
            exception.getMessage(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

### How Spring Resolves Exception Handlers

When an exception occurs, Spring follows this priority:

1. **Exact match first** — Is there a handler for `CustomerAlreadyExistsException.class`? Use it.
2. **Parent class match** — Is there a handler for `RuntimeException.class`? Use it.
3. **Fall back to `Exception.class`** — The ultimate catch-all, since every exception in Java extends `Exception`.

So `ResourceNotFoundException` → caught by its specific handler (returns 404).
A random `NullPointerException` → no specific handler → caught by the `Exception.class` handler (returns 500).

This layered approach means:
- Custom exceptions get **specific, meaningful responses**
- Everything else gets a **clean, structured error** instead of a stack trace

---

## The Complete GlobalExceptionHandler

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomerAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDto> handleCustomerAlreadyExistsException(
            CustomerAlreadyExistsException exception, WebRequest webRequest) {
        ErrorResponseDto error = new ErrorResponseDto(
            webRequest.getDescription(false), HttpStatus.BAD_REQUEST,
            exception.getMessage(), LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleResourceNotFoundException(
            ResourceNotFoundException exception, WebRequest webRequest) {
        ErrorResponseDto error = new ErrorResponseDto(
            webRequest.getDescription(false), HttpStatus.NOT_FOUND,
            exception.getMessage(), LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGlobalException(
            Exception exception, WebRequest webRequest) {
        ErrorResponseDto error = new ErrorResponseDto(
            webRequest.getDescription(false), HttpStatus.INTERNAL_SERVER_ERROR,
            exception.getMessage(), LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

### The Pattern

Every handler method follows the same structure:
1. Accept the exception + `WebRequest`
2. Build an `ErrorResponseDto` with path, status, message, and timestamp
3. Return it wrapped in `ResponseEntity` with the appropriate HTTP status

---

## Testing Runtime Exceptions

To intentionally trigger a runtime exception, temporarily remove `@AllArgsConstructor` from `AccountsController`. Without it, the `IAccountsService` field won't be autowired and remains `null`. Any API call will produce a `NullPointerException`:

```json
POST /api/create
// Response: 500
{
    "apiPath": "uri=/api/create",
    "errorCode": "INTERNAL_SERVER_ERROR",
    "errorMsg": "Cannot invoke method on null object reference",
    "errorTime": "2024-01-15T10:30:45.123"
}
```

Clean, structured, and informative — instead of a raw stack trace.

---

## Real-World Enhancements

In production, the global exception handler is where you'd add:

- **Email alerts** to the ops team when critical exceptions occur
- **Exception logging** to a database table for reporting and analytics
- **Correlation IDs** so clients can reference specific errors in support tickets
- **Sanitized messages** — replace internal exception messages with user-friendly text for security

---

## The Two Key Annotations — Interview Gold

If someone asks **"How do you implement global exception handling in Spring Boot?"**, the answer is:

1. **`@ControllerAdvice`** — on the class: "Handle exceptions from ALL controllers"
2. **`@ExceptionHandler(SomeException.class)`** — on each method: "This method handles this exception type"

That's the entire mechanism. The combination of these two annotations provides centralized, consistent error handling across your entire application.

---

## ✅ Key Takeaways

- **`@ExceptionHandler(Exception.class)`** is the catch-all for any unhandled runtime exception
- Spring resolves handlers from **most specific to most general** — exact match first, then parent classes
- **Every API response** (success or failure) should be structured JSON, not raw stack traces
- `@ControllerAdvice` + `@ExceptionHandler` is the standard pattern — it's a common interview question
- The `ErrorResponseDto` format (path, code, message, timestamp) should be **consistent** across all errors

💡 **Pro Tip**: In production, log the full stack trace server-side but send only a sanitized message to the client. Never expose internal class names or file paths in API responses.

⚠️ **Common Mistakes**
- Not having a catch-all `Exception.class` handler — clients see raw stack traces
- Putting the catch-all handler in a separate class from specific handlers — keep them together in one `@ControllerAdvice` class
- Forgetting `@ControllerAdvice` — without it, your `@ExceptionHandler` methods only apply to the controller they're defined in
