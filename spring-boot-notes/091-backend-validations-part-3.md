# Backend Validations — Your Last Line of Defense (Part 3)

## Introduction

So far, we've validated data that arrives as a **Java object** (DTO) in the request body. But REST APIs also accept data through **query parameters** and **path variables**. How do we validate those? The approach is slightly different — and that's what we'll cover in this lesson. We'll also recap the full validation strategy and best practices.

---

## Concept 1: Validating Query Parameters (Request Params)

### 🧠 What is it?

When your REST API accepts data via query parameters (e.g., `?status=open`), the data isn't wrapped in a DTO — it comes in as a simple `String` or other primitive type. You validate it by placing annotations **directly on the method parameter**.

### ⚙️ How to implement it

```java
@Validated
@RestController
public class ContactController {

    @GetMapping("/contacts")
    public ResponseEntity<String> fetchOpenContacts(
            @RequestParam
            @NotBlank(message = "Status cannot be blank")
            @Size(min = 4, message = "Status length should be of minimum 4 chars")
            String status) {

        return ResponseEntity.ok("These are the contacts with the status: " + status);
    }
}
```

### ❓ Wait — why `@Validated` instead of `@Valid`?

Great question! There's an important distinction:

| Annotation | Used for | Where to put it |
|-----------|---------|-----------------|
| `@Valid` | Validating **DTO objects** (`@RequestBody`) | Before the DTO parameter |
| `@Validated` | Validating **individual parameters** (query params, path variables) | On the **controller class** or method |

When validating DTOs, the `@Valid` annotation triggers validation on the object's fields. But for individual parameters like `@RequestParam String status`, you need `@Validated` on the controller class to activate method-level validation.

> **Note:** `@Validated` on the controller is technically optional in recent Spring Boot versions — the behavior works without it too. But it's considered a **best practice** to include it for clarity.

### 🧪 Example — Testing

**Send empty status** (`?status=`):

```json
{
    "status": "Status cannot be blank, Status length should be of minimum 4 chars"
}
```

**Send single character** (`?status=O`):

```json
{
    "status": "Status length should be of minimum 4 chars"
}
```

**Send valid value** (`?status=open`):

```
"These are the contacts with the status: open"
```

---

## Concept 2: Handling HandlerMethodValidationException

### 🧠 What is it?

When query parameter or path variable validation fails, the framework throws `HandlerMethodValidationException` — a **different** exception from the `MethodArgumentNotValidException` we handled for DTO validation.

### ❓ Why a different exception?

Because the validation mechanism is different:
- **DTO validation** (`@Valid` + `@RequestBody`) → `MethodArgumentNotValidException`
- **Parameter validation** (`@Validated` + `@RequestParam`/`@PathVariable`) → `HandlerMethodValidationException`

### ⚙️ How to handle it

```java
@ExceptionHandler(HandlerMethodValidationException.class)
public ResponseEntity<Map<String, String>> handleMethodValidation(
        HandlerMethodValidationException exception) {

    Map<String, String> errors = new HashMap<>();

    exception.getParameterValidationResults().forEach(result -> {
        String paramName = result.getMethodParameter().getParameterName();
        String errorMessage = result.getResolvableErrors().stream()
            .map(error -> error.getDefaultMessage())
            .collect(Collectors.joining(", "));
        errors.put(paramName, errorMessage);
    });

    return ResponseEntity.badRequest().body(errors);
}
```

### ⚙️ Step-by-step breakdown

1. **`getParameterValidationResults()`** → returns a list of `ParameterValidationResult`
2. **`getMethodParameter().getParameterName()`** → gives the parameter name (e.g., `"status"`)
3. **`getResolvableErrors()`** → returns the list of error messages for that parameter
4. **Multiple errors are joined with commas** — because one parameter can have multiple validation annotations

### 🧪 Example Response

```json
{
    "status": "Status cannot be blank, Status length should be of minimum 4 chars"
}
```

---

## Concept 3: The Complete Validation Architecture

### 🧠 Summary of all the pieces

Here's the full picture of validation in a Spring Boot application:

```
┌──────────────────────────────────────────────┐
│              pom.xml                          │
│  spring-boot-starter-validation dependency   │
└──────────────────────┬───────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    DTO Validation              Param Validation
         │                           │
   Annotations on               Annotations on
   DTO fields                   method params
   (@NotBlank, @Email,          (@NotBlank, @Size,
    @Size, @Pattern)             @Min, @Max)
         │                           │
   @Valid on                    @Validated on
   @RequestBody                 controller class
         │                           │
   Throws:                     Throws:
   MethodArgument...            HandlerMethod...
   NotValidException            ValidationException
         │                           │
         └─────────────┬─────────────┘
                       │
              GlobalExceptionHandler
              (@RestControllerAdvice)
```

### ⚙️ The three handler methods in GlobalExceptionHandler

| Method | Exception | Status | Purpose |
|--------|-----------|--------|---------|
| `handleException()` | `Exception.class` | `500` | Catches all unhandled exceptions |
| `handleValidationException()` | `MethodArgumentNotValidException` | `400` | DTO body validation errors |
| `handleMethodValidation()` | `HandlerMethodValidationException` | `400` | Query param / path variable errors |

---

## Concept 4: Best Practices for Backend Validation

### 🧠 Rules to follow

1. **Use DTOs for request validation** — Never put validation annotations on entity classes. Keep your JPA entities clean and separate from your API contracts.

2. **Return meaningful error messages** — The `message` attribute should be written for the **end user**, not for developers.

3. **Always return `400 Bad Request`** — This tells the client it's a **client-side problem** (bad input), not a server-side problem.

4. **Centralize validation error handling** — Use `@RestControllerAdvice` so all error responses follow the same format.

5. **Debug unknown exceptions** — If you get `500` errors from the generic handler when you expect `400`, check the exception type with a debugger and add a specific handler.

### 💡 Insight

Whenever you encounter a new exception type flowing into your generic handler, it's a signal: *"I need to add a new `@ExceptionHandler` method for this."* This is how you iteratively build a robust error handling system.

---

## ✅ Key Takeaways

1. **DTO validation** → `@Valid` + annotations on DTO fields → throws `MethodArgumentNotValidException`
2. **Query param / path variable validation** → `@Validated` + annotations on method params → throws `HandlerMethodValidationException`
3. Both exceptions need **separate handler methods** in `GlobalExceptionHandler`
4. Both should return `400 Bad Request` with clear, field-level error messages
5. Always **debug and identify exception types** when unexpected errors occur
6. Use DTOs for validation — never entity classes
7. `@Validated` on the controller class is a best practice for parameter-level validation

## ⚠️ Common Mistakes

- Using `@Valid` for query parameters — it won't work; use `@Validated` instead
- Not defining a handler for `HandlerMethodValidationException` — falls through to the `500` generic handler
- Putting validation annotations on JPA entity classes instead of DTOs
- Returning `500` for validation errors

## 💡 Pro Tips

- Always check the exception type with a debugger when you get unexpected errors
- You can combine multiple validation annotations on a single query param (`@NotBlank` + `@Size`)
- The same approach works for `@PathVariable` parameters
- Keep your `GlobalExceptionHandler` growing organically — add handlers as you discover new exception types
