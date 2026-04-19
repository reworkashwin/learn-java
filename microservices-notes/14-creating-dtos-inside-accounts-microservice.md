# Creating DTOs Inside Accounts Microservice

## Introduction

Now that we understand the DTO pattern conceptually, let's put it into practice. In this lecture, we create all the DTO classes our accounts microservice needs — not just for customer and account data, but also for **success responses** and **error responses**. This gives us a clean, standardized way to communicate with client applications.

---

## DTO Classes for Our Entities

### `AccountsDto`

```java
@Data
public class AccountsDto {
    private Long accountNumber;
    private String accountType;
    private String branchAddress;
}
```

Notice what's **missing** compared to the `Accounts` entity: `customerId`, and all four metadata columns. The client doesn't need to know about internal database IDs or audit fields.

### `CustomerDto`

```java
@Data
public class CustomerDto {
    private String name;
    private String email;
    private String mobileNumber;
    private AccountsDto accountsDto;
}
```

Again, `customerId` is deliberately excluded — it's an internal implementation detail. We've also embedded `AccountsDto` inside `CustomerDto` so we can return aggregated customer + account data in a single response.

### Why `@Data` on DTOs But Not on Entities?

The `@Data` annotation is a Lombok shortcut that generates `@Getter`, `@Setter`, `@ToString`, `@EqualsAndHashCode`, and `@RequiredArgsConstructor` all in one.

For **DTOs** — this is perfect. DTOs are simple data carriers.

For **entities** — `@Data` generates `hashCode()` and `equals()` methods that can cause issues with JPA's proxy objects and lazy loading. That's why we use `@Getter @Setter` separately on entities.

---

## DTOs for API Responses

Beyond data DTOs, we need standardized response formats so clients always know what to expect.

### `ResponseDto` — For Successful Operations

```java
@Data
@AllArgsConstructor
public class ResponseDto {
    private String statusCode;
    private String statusMsg;
}
```

When a create/update/delete operation succeeds, we send back a status code and message. The `@AllArgsConstructor` is added because `@Data` doesn't generate a constructor accepting all fields — we need that to create response objects inline:

```java
new ResponseDto("201", "Account created successfully")
```

### `ErrorResponseDto` — For Failures

```java
@Data
@AllArgsConstructor
public class ErrorResponseDto {
    private String apiPath;
    private HttpStatus errorCode;
    private String errorMsg;
    private LocalDateTime errorTime;
}
```

When something goes wrong, we give the client **everything they need to debug**:
- **`apiPath`** — Which API endpoint they called
- **`errorCode`** — The HTTP status (400, 404, 500, etc.)
- **`errorMsg`** — Human-readable explanation of what went wrong
- **`errorTime`** — Exact timestamp of the failure (helps correlate with server logs)

---

## The Complete DTO Package Structure

```
com.eazybytes.accounts.dto/
├── AccountsDto.java       // Fields from Accounts entity (minus internal IDs)
├── CustomerDto.java        // Fields from Customer entity + embedded AccountsDto
├── ResponseDto.java        // Standard success response format
└── ErrorResponseDto.java   // Standard error response format
```

---

## ✅ Key Takeaways

- **DTO classes strip away** internal fields (IDs, metadata) that clients don't need
- Use **`@Data`** on DTOs (but not on entities) for maximum convenience
- Always create **standardized response DTOs** — both success (`ResponseDto`) and error (`ErrorResponseDto`)
- **Embed DTOs** inside other DTOs (like `AccountsDto` inside `CustomerDto`) to return aggregated data
- End every DTO class name with `Dto` to distinguish from entities at a glance

💡 **Pro Tip**: The `ErrorResponseDto` pattern is something you'll reuse across every microservice. Consider putting it in a shared library later.

⚠️ **Common Mistakes**
- Including the entity's primary key (`customerId`) in the DTO when the client doesn't need it
- Forgetting `@AllArgsConstructor` on response DTOs — you won't be able to construct them inline
- Not creating error response DTOs — clients get cryptic Spring Boot error pages instead of structured JSON
