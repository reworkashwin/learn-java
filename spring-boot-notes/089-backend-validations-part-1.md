# Backend Validations — Your Last Line of Defense (Part 1)

## Introduction

We've seen the dangers of relying only on client-side validation. Now it's time to **fix** the problem. In this lesson, we'll add backend validations to our Spring Boot application using the **Bean Validation** framework (Hibernate Validator). You'll learn how to enforce rules like "email can't be empty," "name must be between 5 and 30 characters," and "userType must be one of these values" — all with simple annotations.

---

## Concept 1: Adding the Validation Starter Dependency

### 🧠 What is it?

Spring Boot provides a starter project called `spring-boot-starter-validation` that brings in the **Hibernate Validator** library — the reference implementation of the Jakarta Bean Validation specification.

### ⚙️ How to add it

Add this dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

After adding, sync your Maven changes and **restart** your application (since it's a new starter dependency).

### ❓ Why "Bean Validation"?

In backend applications, data arrives as **Java bean objects** (your DTOs). The validation framework inspects these beans and enforces rules you define with annotations. That's why it's called "Bean Validation."

---

## Concept 2: Validation Annotations — Defining the Rules

### 🧠 What is it?

You define validation rules by placing **annotations** on the fields of your DTO class. The framework reads these annotations and automatically validates incoming data before your business logic runs.

### ⚙️ Key Annotations

#### `@NotBlank` vs `@NotEmpty`

| Annotation | Allows null? | Allows empty `""`? | Allows whitespace `"   "`? |
|-----------|-------------|--------------------|-----------------------------|
| `@NotEmpty` | ❌ No | ❌ No | ✅ Yes |
| `@NotBlank` | ❌ No | ❌ No | ❌ No |

**Always prefer `@NotBlank`** — because you don't want to accept fields that contain only whitespace characters. A field with just spaces is effectively empty data.

#### `@Email`

Validates that the value is a **well-formatted email address**.

#### `@Size`

Validates the **length** of a string (or size of a collection).

```java
@Size(min = 5, max = 500, message = "Message must be between 5 and 500 characters")
```

#### `@Pattern`

Validates the value against a **regular expression**.

```java
@Pattern(regexp = "job seeker|employer|other",
         message = "User type must be one of: job seeker, employer, other")
```

### 🧪 Example — Annotated DTO

```java
public class ContactRequestDto {

    @NotBlank(message = "Name cannot be empty")
    @Size(min = 5, max = 30, message = "Name must be between 5 and 30 characters")
    private String name;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Subject cannot be empty")
    @Size(min = 5, max = 150, message = "Subject must be between 5 and 150 characters")
    private String subject;

    @NotBlank(message = "Message cannot be empty")
    @Size(min = 5, max = 500, message = "Message must be between 5 and 500 characters")
    private String message;

    @NotBlank(message = "User type cannot be empty")
    @Pattern(regexp = "job seeker|employer|other",
             message = "User type must be one of: job seeker, employer, other")
    private String userType;
}
```

### ❓ Where do the `message` values go?

When validation fails, these messages are what get sent to the client. They should be **user-friendly** — something the end user can read and understand.

### 💡 Insight

All these annotations live in the `jakarta.validation.constraints` package. If you explore this package, you'll find many more: `@Future`, `@Past`, `@NotNull`, `@AssertTrue`, `@Digits`, and others. Use them based on your business requirements.

---

## Concept 3: Triggering Validation with @Valid

### 🧠 What is it?

Defining annotations on the DTO is only **half the job**. You also need to tell the framework: *"Hey, please actually validate this object before passing it to my method."* That's what `@Valid` does.

### ⚙️ How to use it

```java
@PostMapping("/contacts")
public ResponseEntity<String> saveContact(
        @Valid @RequestBody ContactRequestDto dto) {
    // If validation fails, this method is NEVER reached
    // The framework throws MethodArgumentNotValidException
}
```

Place `@Valid` just before the `@RequestBody` parameter.

### ❓ What if I don't want validation for some endpoint?

Simply remove `@Valid`. Without it, the framework won't perform any validation, even if the DTO has validation annotations. This gives you flexibility — same DTO, different validation requirements.

### ⚙️ What happens behind the scenes?

1. Client sends a JSON request
2. Jackson converts JSON → Java DTO object
3. **Before** the controller method executes, the framework checks all validation annotations
4. If validations pass → method executes normally
5. If validations fail → `MethodArgumentNotValidException` is thrown → your method **never runs**

### 💡 Insight

The `@Valid` annotation is your **on/off switch** for validation. The annotations on the DTO define **what** to validate; `@Valid` controls **whether** to validate.

---

## Concept 4: What Happens When Validation Fails?

### 🧠 What is it?

When validation fails, the framework throws a `MethodArgumentNotValidException`. If you haven't handled it in your `GlobalExceptionHandler`, the default error response is a wall of text with a `500` status — not helpful at all.

### 🧪 Example — Default Error Response (Ugly)

Sending all empty fields produces:

```
500 Internal Server Error

"ContactRequestDto has 9 errors:
  Field 'userType': NotBlank - userType cannot be empty
  Field 'name': NotBlank - name cannot be empty
  ..."
```

This is technically correct but **terrible** for clients. They'd need to parse a giant string to extract individual field errors.

### ❓ What's the right approach?

Two problems to fix:
1. **Status code** should be `400 Bad Request`, not `500`
2. **Response body** should be a clean, structured JSON with field-level errors

### ⚙️ Identifying the Exception Type

If you set a breakpoint in your `GlobalExceptionHandler`, you'll see the exception type is `MethodArgumentNotValidException`. This tells you: *"I need to define a new `@ExceptionHandler` method for this specific exception."*

We'll implement the proper handling in Part 2.

---

## ✅ Key Takeaways

1. Add `spring-boot-starter-validation` to your `pom.xml` to enable validation
2. Use **annotations** on DTO fields to define validation rules: `@NotBlank`, `@Email`, `@Size`, `@Pattern`
3. **Always prefer `@NotBlank` over `@NotEmpty`** — whitespace-only values shouldn't be considered valid
4. Use `@Valid` on the controller method parameter to **activate** validation
5. Without `@Valid`, annotations on the DTO are ignored
6. Validation failures throw `MethodArgumentNotValidException`
7. The `message` attribute in each annotation defines the **user-friendly error text**

## ⚠️ Common Mistakes

- Using `@NotEmpty` instead of `@NotBlank` — allows whitespace-only values to pass
- Forgetting to add `@Valid` before `@RequestBody` — validations won't execute
- Forgetting to add the `spring-boot-starter-validation` dependency — annotations have no effect
- Writing technical error messages instead of user-friendly ones

## 💡 Pro Tips

- Explore the `jakarta.validation.constraints` package to discover all available annotations
- Combine multiple annotations on a single field (e.g., `@NotBlank` + `@Email` + `@Size`)
- Use `@Pattern` with regex for custom value restrictions (like enums represented as strings)
- Always restart your application after adding the validation starter dependency
