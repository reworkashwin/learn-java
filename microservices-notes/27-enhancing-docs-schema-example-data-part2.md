# Enhancing Documentation Using @Schema & Example Data — Part 2

## Introduction

In the previous lecture, we used `@Schema` to make our documentation look professional with business names, descriptions, and example data. But there's a subtle issue — we used `500 Internal Server Error` for both RuntimeExceptions *and* for when update/delete operations simply fail. This confuses clients: "Is it a server crash or just a failed operation?"

In this lecture, we fix this by introducing a more appropriate HTTP status code — `417 Expectation Failed` — for business logic failures, and we refine the API documentation accordingly.

---

## Concept 1: The Problem — Overloaded Status Code 500

### 🧠 What's wrong?

We're using `500 Internal Server Error` for two very different scenarios:
1. **RuntimeException** — Something actually broke (unexpected error)
2. **Update/Delete failure** — A business operation didn't succeed (expected possibility)

These are fundamentally different situations. A 500 says "the server messed up." A failed update says "the operation didn't complete, but the server is fine."

### 💡 Insight

Using the right HTTP status code is part of being a good API citizen. Your clients should be able to distinguish between "something crashed" (500) and "the operation didn't work as expected" (417) without parsing your error messages.

---

## Concept 2: Introducing HTTP 417 — Expectation Failed

### ⚙️ How it works

**In the controller**, change the update and delete failure responses:

```java
// Update operation
@PutMapping("/update")
public ResponseEntity<ResponseDto> updateAccountDetails(...) {
    boolean isUpdated = iAccountsService.updateAccount(customerDto);
    if (isUpdated) {
        return ResponseEntity.status(HttpStatus.OK)
            .body(new ResponseDto(AccountsConstants.STATUS_200, AccountsConstants.MESSAGE_200));
    } else {
        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
            .body(new ResponseDto(AccountsConstants.STATUS_417, AccountsConstants.MESSAGE_417_UPDATE));
    }
}

// Delete operation
@DeleteMapping("/delete")
public ResponseEntity<ResponseDto> deleteAccountDetails(...) {
    boolean isDeleted = iAccountsService.deleteAccount(mobileNumber);
    if (isDeleted) {
        return ResponseEntity.status(HttpStatus.OK)
            .body(new ResponseDto(AccountsConstants.STATUS_200, AccountsConstants.MESSAGE_200));
    } else {
        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
            .body(new ResponseDto(AccountsConstants.STATUS_417, AccountsConstants.MESSAGE_417_DELETE));
    }
}
```

**In the constants class**, add new constants:

```java
public static final String STATUS_417 = "417";
public static final String MESSAGE_417_UPDATE = "Update operation failed. Please try again or contact dev team.";
public static final String MESSAGE_417_DELETE = "Delete operation failed. Please try again or contact dev team.";
```

---

## Concept 3: Updating API Documentation for Multiple Responses

### ⚙️ How it works

Now each API needs accurate `@ApiResponses`:

**Every API** gets a 500 response for RuntimeException:

```java
@ApiResponse(
    responseCode = "500",
    description = "HTTP Status Internal Server Error",
    content = @Content(schema = @Schema(implementation = ErrorResponseDto.class))
)
```

**Update and Delete** get an additional 417 response:

```java
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
    @ApiResponse(responseCode = "417", description = "Expectation Failed"),
    @ApiResponse(
        responseCode = "500",
        description = "HTTP Status Internal Server Error",
        content = @Content(schema = @Schema(implementation = ErrorResponseDto.class))
    )
})
```

### 🧪 Result in Swagger UI

For the Update API, consumers now see three possible responses:
- `200` — Success
- `417` — Expectation Failed (operation didn't complete)
- `500` — Internal Server Error (something actually crashed)

---

## Concept 4: The Example Value Caveat

### ⚠️ The problem with static examples

In `ResponseDto`, we previously had:

```java
@Schema(description = "Status code in the response", example = "200")
private String statusCode;
```

But now the status code could be `200` OR `417`. If we show `200` as the example for the 417 response, it's confusing. Clients see response code 417 but the example body shows `"statusCode": "200"`.

### ⚙️ The fix

Remove the `example` values from `ResponseDto` when they could be misleading:

```java
@Schema(description = "Status code in the response")
private String statusCode;

@Schema(description = "Status message in the response")
private String statusMessage;
```

Now Swagger UI shows `string` instead of a specific value — which is correct because the actual value depends on the scenario.

### 💡 Insight

Example values are powerful but use them wisely. When the same DTO is used across multiple response codes with different values, **removing examples prevents confusion**. Only use examples when the value is predictable and consistent.

---

## ✅ Key Takeaways

- Don't overload `500` for both crashes and business logic failures
- Use `417 Expectation Failed` when an operation simply doesn't succeed
- Keep `500 Internal Server Error` for genuine runtime exceptions
- Every API should have at least two documented responses: success + 500 (RuntimeException)
- Update and Delete operations add a third: 417 for operation failure
- Remove example values when they could be misleading across multiple response codes

## ⚠️ Common Mistakes

- Using 500 for everything — clients can't distinguish between server crashes and failed operations
- Showing wrong example values for specific response codes (e.g., `200` example in a `417` response)
- Forgetting to add the 500 RuntimeException response to all APIs

## 💡 Pro Tips

- `417 Expectation Failed` is a good choice for "operation didn't work" scenarios — it's clear and non-ambiguous
- The `@Content(schema = @Schema(implementation = ...))` pattern works for any response code — use it wherever you need to show a specific response schema
- Consider your response code strategy early — changing it later means updating both code and documentation
