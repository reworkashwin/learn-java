# Perform Input Data Validations Inside Accounts Microservice

## Introduction

You've built your REST APIs, handled exceptions gracefully, and everything seems to be running smoothly. But there's a critical standard you're still missing — **input validation**. What happens when someone sends a 5-digit mobile number instead of 10? Or an email without the `@` symbol? Or a name that's just one character?

Sure, the database won't crash. But you're firing unnecessary queries with garbage data. That's wasteful, unprofessional, and a potential security risk. The golden rule? **Reject bad data at the gate — never let it get to your business logic or database.**

In this lecture, we'll enforce input validations on all our REST APIs using Spring Boot's validation framework, making our Accounts Microservice production-ready.

---

## Concept 1: Why Input Validation Matters

### 🧠 What is it?

Input validation is the process of checking whether the data received from a client conforms to expected rules *before* processing it. Think of it like a bouncer at a club — only valid data gets in.

### ❓ Why do we need it?

Think about the many ways clients can mess up:
- A 9-digit or 5-digit mobile number instead of 10 digits
- An email missing the `@` symbol
- A name with just 2 characters
- An empty account type or branch address

Even if a bad mobile number won't cause an error (you'll just get "no account found"), you're still **wasting a database query** on data you already know is invalid. Multiply that across thousands of requests, and it becomes a real problem.

### 💡 Insight

Validation is your first line of defense. It protects your database, your business logic, and your API consumers from confusing error messages downstream. Always validate at the boundary — where external data enters your system.

---

## Concept 2: Adding the Validation Dependency

### ⚙️ How it works

Spring Boot provides a starter dependency for validation:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

If you created your project from `start.spring.io` and included "Validation", this is already in your `pom.xml`. This dependency brings in all the annotations and libraries from the **Jakarta Validation** specification (formerly javax.validation).

---

## Concept 3: Annotating DTO Fields with Validation Constraints

### 🧠 What is it?

You declare your validation rules directly on the DTO fields using annotations. Since DTOs hold the data coming from clients, they're the perfect place for validation rules.

### ⚙️ How it works — CustomerDto

Here's how we annotate the `CustomerDto`:

```java
@NotEmpty(message = "Name cannot be null or empty")
@Size(min = 5, max = 30, message = "The length of the customer name should be between 5 and 30")
private String name;

@NotEmpty(message = "Email address cannot be null or empty")
@Email(message = "Email address should be a valid value")
private String email;

@Pattern(regexp = "(^$|[0-9]{10})", message = "Mobile number must be 10 digits")
private String mobileNumber;
```

Let's break this down:

| Annotation | Purpose |
|---|---|
| `@NotEmpty` | Field cannot be null or empty string |
| `@Size(min, max)` | Enforces length constraints |
| `@Email` | Validates email format (checks for `@`, domain, etc.) |
| `@Pattern(regexp)` | Enforces a regex pattern — here, exactly 10 numeric digits |

### ⚙️ How it works — AccountsDto

```java
@NotEmpty(message = "Account number cannot be null or empty")
@Pattern(regexp = "(^$|[0-9]{10})", message = "Account number must be 10 digits")
private String accountNumber;

@NotEmpty(message = "Account type cannot be null or empty")
private String accountType;

@NotEmpty(message = "Branch address cannot be null or empty")
private String branchAddress;
```

### 💡 Insight

You only need to validate DTOs that receive **input from clients**. `ResponseDto` and `ErrorResponseDto` are used to send data *out*, so they don't need validation annotations.

The `jakarta.validation.constraints` package has many more annotations: `@Digits`, `@Future`, `@Past`, `@Min`, `@Max`, `@Positive`, `@NotBlank`, `@NotNull`, `@Negative` — use them based on your business needs.

---

## Concept 4: Activating Validation in the Controller

### 🧠 What is it?

Adding annotations to the DTO is only half the story. You need to tell Spring Boot: "Hey, actually *enforce* these validations when a request comes in."

### ⚙️ How it works

**Step 1:** Add `@Validated` on the controller class:

```java
@RestController
@RequestMapping("/api")
@Validated
public class AccountsController {
    // ...
}
```

**Step 2:** Add `@Valid` before `@RequestBody` in your method parameters:

```java
@PostMapping("/create")
public ResponseEntity<ResponseDto> createAccount(@Valid @RequestBody CustomerDto customerDto) {
    // ...
}

@PutMapping("/update")
public ResponseEntity<ResponseDto> updateAccountDetails(@Valid @RequestBody CustomerDto customerDto) {
    // ...
}
```

**Step 3:** For query parameters (GET/DELETE), add `@Pattern` directly on the parameter:

```java
@GetMapping("/fetch")
public ResponseEntity<CustomerDto> fetchAccountDetails(
        @RequestParam @Pattern(regexp = "(^$|[0-9]{10})", message = "Mobile number must be 10 digits") String mobileNumber) {
    // ...
}
```

### 💡 Insight

- `@Validated` on the class activates validation for all methods
- `@Valid` on `@RequestBody` triggers validation on the DTO object
- `@Pattern` directly on `@RequestParam` validates query parameters that aren't part of a DTO

---

## Concept 5: Handling Validation Errors Globally

### ❓ Why do we need this?

Spring Boot now knows *what* to validate and *what messages* to throw. But it doesn't know *how* to format the error response. Without a handler, clients get an ugly, framework-default error response.

### ⚙️ How it works

In your `GlobalExceptionHandler`, extend `ResponseEntityExceptionHandler` and override the `handleMethodArgumentNotValid` method:

```java
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        Map<String, String> validationErrors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            validationErrors.put(fieldName, message);
        });

        return new ResponseEntity<>(validationErrors, HttpStatus.BAD_REQUEST);
    }
}
```

What this does:
1. Creates an empty `Map<String, String>` to collect errors
2. Iterates over all validation failures from `getBindingResult().getAllErrors()`
3. Extracts the **field name** and the **error message** for each failure
4. Returns the map as a `400 BAD_REQUEST` response

### 🧪 Example Response

If you send a request with a 1-character name, invalid email, and 9-digit mobile:

```json
{
    "name": "The length of the customer name should be between 5 and 30",
    "email": "Email address should be a valid value",
    "mobileNumber": "Mobile number must be 10 digits"
}
```

Clean, readable, and actionable for the client.

---

## Concept 6: Testing Validation Across All APIs

### 🧪 Example — Testing with Postman

**Create API** — Send invalid data:
- Name: `"A"` (too short) → Validation fails
- Email: `"testgmail.com"` (missing `@`) → Validation fails
- Mobile: `"123456789"` (9 digits) → Validation fails

**Fetch API** — Send 9-digit mobile → `400: Mobile number must be 10 digits`

**Update API** — Remove `@` from email → `400: Email address should be a valid value`

**Delete API** — Send 9-digit mobile → `400: Mobile number must be 10 digits`

All four REST APIs are now protected with input validation.

---

## ✅ Key Takeaways

- Always validate input at the API boundary — never trust client data
- Use `spring-boot-starter-validation` for annotation-based validation
- Annotate DTO fields with `@NotEmpty`, `@Size`, `@Email`, `@Pattern`, etc.
- Use `@Validated` on the controller class and `@Valid` before `@RequestBody`
- For query params, use `@Pattern` directly on the parameter
- Override `handleMethodArgumentNotValid` in your global exception handler to return clean error responses
- Only validate DTOs that receive input — not response DTOs

## ⚠️ Common Mistakes

- Forgetting `@Valid` before `@RequestBody` — annotations on the DTO will be silently ignored
- Not extending `ResponseEntityExceptionHandler` — validation errors won't be formatted properly
- Validating response DTOs — they don't need validation since they go outbound
- Using `@NotNull` when you mean `@NotEmpty` — `@NotNull` allows empty strings

## 💡 Pro Tips

- The regex `(^$|[0-9]{10})` means: either empty string OR exactly 10 digits — this is a common pattern for optional-but-must-be-valid fields
- Explore the full `jakarta.validation.constraints` package — there are powerful annotations like `@Future`, `@Past`, `@Positive`, `@Digits` for specialized needs
- Validation messages are your API's way of communicating with developers — make them clear and specific
