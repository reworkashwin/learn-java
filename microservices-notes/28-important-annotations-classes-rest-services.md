# Important Annotations & Classes That Support Building REST Services

## Introduction

We've completed the Accounts Microservice — CRUD APIs, validation, exception handling, auditing, and documentation. Along the way, we used dozens of annotations and classes from the Spring Boot framework. This lecture is a **revision and reference guide** — a concise summary of every important annotation and class you need to know for building REST services. Keep this handy for interviews and for when you're starting a new microservice.

---

## Concept 1: @RestController

### 🧠 What is it?

The foundational annotation for building REST APIs. Place it on a class to tell Spring Boot: "Expose the methods in this class as REST endpoints."

```java
@RestController
@RequestMapping("/api")
public class AccountsController {
    // All methods here become REST APIs
}
```

### ❓ What about @Controller?

`@RestController` = `@Controller` + `@ResponseBody`

If your class has **only REST APIs**, use `@RestController`.

If your class mixes REST APIs **and** Spring MVC methods (returning HTML views), use `@Controller` and add `@ResponseBody` only on the REST methods.

---

## Concept 2: @ResponseBody

### 🧠 What is it?

Tells Spring Boot that the return value of a method should be serialized as JSON (or XML) and sent as the HTTP response body — not resolved as a view name.

```java
@Controller
public class MixedController {

    @GetMapping("/view")
    public String showPage() {
        return "index"; // Returns HTML view
    }

    @GetMapping("/api/data")
    @ResponseBody
    public CustomerDto getData() {
        return customerDto; // Returns JSON
    }
}
```

When using `@RestController`, `@ResponseBody` is implied on every method — you don't need to add it.

---

## Concept 3: ResponseEntity

### 🧠 What is it?

A **class** (not an annotation) that represents the entire HTTP response: status code, headers, and body. It gives you fine-grained control over what you send back.

```java
return ResponseEntity
    .status(HttpStatus.CREATED)
    .body(new ResponseDto("201", "Account created successfully"));
```

The generic type tells Spring what the body type is:

```java
public ResponseEntity<CustomerDto> fetchAccount(...) { ... }
public ResponseEntity<ResponseDto> createAccount(...) { ... }
```

### 💡 Insight

Always prefer `ResponseEntity` over just returning a plain object. It lets you set meaningful HTTP status codes, which is critical for well-designed REST APIs.

---

## Concept 4: @ControllerAdvice and @ExceptionHandler

### 🧠 What are they?

The combination for **global exception handling**.

- `@ControllerAdvice` — Marks a class as a global exception handler for all controllers
- `@ExceptionHandler` — Marks a method to handle a specific exception type

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleResourceNotFound(ResourceNotFoundException ex) {
        // Build and return error response
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponseDto> handleRuntimeException(RuntimeException ex) {
        // Build and return error response
    }
}
```

### @RestControllerAdvice

Just like `@RestController` = `@Controller` + `@ResponseBody`, we have:

`@RestControllerAdvice` = `@ControllerAdvice` + `@ResponseBody`

If you want to strictly ensure JSON responses from your exception handler, use `@RestControllerAdvice`. In most cases, `@ControllerAdvice` works perfectly fine.

---

## Concept 5: RequestEntity

### 🧠 What is it?

The counterpart to `ResponseEntity` — it wraps both the **request headers** and **request body** into a single object.

```java
@PostMapping("/create")
public ResponseEntity<ResponseDto> create(RequestEntity<CustomerDto> request) {
    HttpHeaders headers = request.getHeaders();
    CustomerDto body = request.getBody();
    // ...
}
```

### ❓ When to use it?

Only when you need **both** request headers and request body in the same method. If you only need the body (most common), stick with `@RequestBody`.

---

## Concept 6: @RequestHeader and @RequestBody

### 🧠 What are they?

Individual annotations for extracting parts of the HTTP request:

```java
// Extract a specific header
@GetMapping("/check")
public String check(@RequestHeader("Authorization") String authToken) { ... }

// Extract the entire request body
@PostMapping("/create")
public ResponseEntity<ResponseDto> create(@RequestBody CustomerDto customer) { ... }
```

| Annotation | Extracts |
|---|---|
| `@RequestHeader` | A specific HTTP header value |
| `@RequestBody` | The entire request body (deserialized from JSON) |
| `RequestEntity` | Both headers and body together |

---

## Concept 7: The Interview Story — How to Explain REST API Development

### 💡 The Winning Narrative

If someone asks "How do you build REST APIs with Spring Boot?", here's the flow:

1. **Create a class** → Annotate with `@RestController`
2. **Define methods** → Annotate with `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
3. **Accept input** → Use `@RequestBody` for JSON bodies, `@RequestParam` for query params, `@RequestHeader` for headers
4. **Validate input** → Use `@Valid` + Jakarta validation annotations (`@NotEmpty`, `@Pattern`, `@Size`)
5. **Return responses** → Use `ResponseEntity<T>` with appropriate HTTP status codes
6. **Handle exceptions** → Use `@ControllerAdvice` + `@ExceptionHandler` for global error handling
7. **Document APIs** → Use OpenAPI annotations (`@Tag`, `@Operation`, `@ApiResponse`, `@Schema`)

This sequence shows a complete, professional understanding of REST API development.

---

## ✅ Key Takeaways

- `@RestController` = `@Controller` + `@ResponseBody`
- `@RestControllerAdvice` = `@ControllerAdvice` + `@ResponseBody`
- `ResponseEntity` gives full control over status, headers, and body
- `RequestEntity` wraps both headers and body (use when you need both)
- `@RequestBody` and `@RequestHeader` extract specific parts of the request
- Global exception handling uses `@ControllerAdvice` + `@ExceptionHandler`
- These annotations form the backbone of every Spring Boot REST service

## ⚠️ Common Mistakes

- Using `@Controller` without `@ResponseBody` for REST APIs — returns view names instead of JSON
- Returning plain objects without `ResponseEntity` — loses control over HTTP status codes
- Confusing `@ControllerAdvice` with `@RestControllerAdvice` — they're similar, both work for JSON APIs

## 💡 Pro Tips

- Keep this reference handy for interviews — explain REST API development as a flow, not as isolated annotations
- In real projects, you'll use `@RestController` and `@ControllerAdvice` 99% of the time
- `RequestEntity` is rarely needed — most APIs only need `@RequestBody`
