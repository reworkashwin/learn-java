# Enhancing Documentation Using @Schema & Example Data — Part 1

## Introduction

We've documented our controller and API operations. The top section looks great, each API has a summary and description, and response codes are properly listed. But look at the schema section at the bottom — it shows technical names like `AccountsDto` and fields display `string` as their example value. Not very helpful for someone trying to understand your API, right?

In this lecture, we enhance the **DTO-level documentation** using the `@Schema` annotation to provide meaningful names, descriptions, and example data for every field.

---

## Concept 1: @Schema on DTO Classes

### 🧠 What is it?

`@Schema` is an OpenAPI annotation that lets you control how your DTO classes and their fields appear in the Swagger UI documentation. You can provide business-friendly names, descriptions, and example values.

### ⚙️ How it works — Class Level

```java
@Schema(
    name = "Customer",
    description = "Schema to hold Customer and Account information"
)
public class CustomerDto {
    // ...
}
```

Before: Schema shows `CustomerDto` (technical name)
After: Schema shows `Customer` with a meaningful description

Apply the same pattern to all DTOs:

```java
@Schema(name = "Accounts", description = "Schema to hold Account information")
public class AccountsDto { ... }

@Schema(name = "Response", description = "Schema to hold successful response information")
public class ResponseDto { ... }

@Schema(name = "ErrorResponse", description = "Schema to hold error response information")
public class ErrorResponseDto { ... }
```

---

## Concept 2: @Schema on Individual Fields

### 🧠 What is it?

Field-level `@Schema` lets you describe each field and provide **example values**. This is where your documentation becomes truly self-explanatory.

### ⚙️ How it works — CustomerDto Fields

```java
@Schema(description = "Name of the customer", example = "Eazy Bytes")
@NotEmpty(message = "Name cannot be null or empty")
@Size(min = 5, max = 30, message = "...")
private String name;

@Schema(description = "Email address of the customer", example = "tutor@eazybytes.com")
@NotEmpty(message = "Email address cannot be null or empty")
@Email(message = "...")
private String email;

@Schema(description = "Mobile number of the customer", example = "9345432123")
@Pattern(regexp = "(^$|[0-9]{10})", message = "...")
private String mobileNumber;

@Schema(description = "Account details of the customer")
private AccountsDto accountsDto;
```

Notice: for the `accountsDto` field, we skip the `example` — because its details are documented in the `AccountsDto` class itself.

### ⚙️ How it works — AccountsDto Fields

```java
@Schema(description = "Account Number of EazyBank account", example = "3456789012")
@NotEmpty(message = "Account number cannot be null or empty")
@Pattern(regexp = "(^$|[0-9]{10})", message = "...")
private String accountNumber;

@Schema(description = "Account type of EazyBank account", example = "Savings")
@NotEmpty(message = "Account type cannot be null or empty")
private String accountType;

@Schema(description = "EazyBank branch address", example = "123 NewYork")
@NotEmpty(message = "Branch address cannot be null or empty")
private String branchAddress;
```

### ⚙️ How it works — ResponseDto Fields

```java
@Schema(description = "Status code in the response", example = "200")
private String statusCode;

@Schema(description = "Status message in the response", example = "Request processed successfully")
private String statusMessage;
```

### ⚙️ How it works — ErrorResponseDto Fields

```java
@Schema(description = "API path invoked by client")
private String apiPath;

@Schema(description = "Error code representing the error happened")
private HttpStatus errorCode;

@Schema(description = "Error message representing the error happened")
private String errorMessage;

@Schema(description = "Time representing when the error happened")
private LocalDateTime errorTime;
```

For error fields, we skip examples because errors vary by scenario.

### 💡 Insight

The `example` parameter is optional. Use it when it helps clarify the expected format. Skip it when the field value varies too much (like error messages or timestamps).

---

## Concept 3: The Impact in Swagger UI

### 🧪 What changes?

**Schemas section** — Now shows business names (`Customer`, `Accounts`, `Response`) instead of Java class names, with descriptions for each schema and field.

**API operations** — The "Try it out" example body now shows realistic data:

```json
{
    "name": "Eazy Bytes",
    "email": "tutor@eazybytes.com",
    "mobileNumber": "9345432123",
    "accountsDto": {
        "accountNumber": "3456789012",
        "accountType": "Savings",
        "branchAddress": "123 NewYork"
    }
}
```

Compare this to the old version showing `"string"` for every field. Night and day difference.

---

## Concept 4: Documenting ErrorResponseDto in ApiResponse Using @Content and @Schema

### ❓ The problem

The `ErrorResponseDto` doesn't appear in Swagger UI automatically. Why? Because it's only thrown from the `GlobalExceptionHandler` — not returned directly from any controller method. The OpenAPI scanner can't pick it up.

### ⚙️ The solution

Add `@Content` with `@Schema` inside your `@ApiResponse` to explicitly link the error schema:

```java
@ApiResponse(
    responseCode = "500",
    description = "HTTP Status Internal Server Error",
    content = @Content(
        schema = @Schema(implementation = ErrorResponseDto.class)
    )
)
```

This tells the documentation: "When a 500 error occurs, the response body follows the `ErrorResponseDto` schema."

### 🧪 Result

Now the `ErrorResponseDto` appears in the schemas section, and the 500 response in Swagger UI shows its structure: `apiPath`, `errorCode`, `errorMessage`, `errorTime`.

---

## ✅ Key Takeaways

- `@Schema` on DTO classes provides business-friendly names and descriptions
- `@Schema` on fields provides descriptions and example values
- Example values make Swagger UI's "Try it out" feature much more useful
- Use `@Content(schema = @Schema(implementation = ...))` inside `@ApiResponse` to document error response schemas
- `example` is optional — use it where clarifying, skip where values vary

## ⚠️ Common Mistakes

- Providing incorrect example values that confuse clients (e.g., 200 as example in a status field that could also be 201 or 417)
- Forgetting to document `ErrorResponseDto` — it won't appear automatically since it comes from the exception handler
- Using technical DTO names instead of meaningful business names in `@Schema(name = ...)`

## 💡 Pro Tips

- The `name` in `@Schema` doesn't have to match the Java class name — use something that makes business sense
- Field-level `@Schema` coexists perfectly with validation annotations — keep both
- If your error DTO is shared across all APIs, document it once with `@Content` and add it to every 500 response
