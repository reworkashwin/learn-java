# Enhancing Documentation Using @Tag, @Operation, @ApiResponse

## Introduction

We've enhanced the top-level metadata of our documentation. But dive into the endpoints themselves and what do you see? A technical class name like "AccountsController" and no descriptions for individual APIs. If a client sees `PUT /api/update`, they still need to guess what it does.

In this lecture, we go deeper — enhancing documentation at the **controller level** and the **individual API level** using `@Tag`, `@Operation`, and `@ApiResponse` annotations.

---

## Concept 1: @Tag — Grouping and Describing Your Controller

### 🧠 What is it?

`@Tag` provides a human-friendly name and description for a group of APIs — typically all the endpoints in a single controller class. In Swagger UI, this replaces the raw Java class name.

### ⚙️ How it works

```java
@RestController
@RequestMapping("/api")
@Tag(
    name = "CRUD REST APIs for Accounts in EazyBank",
    description = "CRUD REST APIs in EazyBank to CREATE, UPDATE, FETCH, and DELETE account details"
)
public class AccountsController {
    // ...
}
```

### 🧪 Result

Before: `AccountsController` (technical, meaningless to consumers)
After: `CRUD REST APIs for Accounts in EazyBank` with a clear description underneath

### 💡 Insight

When you have multiple controllers, `@Tag` becomes essential. Clients can collapse/expand each section and immediately understand what group of APIs each controller serves — without reading a single endpoint.

---

## Concept 2: @Operation — Documenting Individual APIs

### 🧠 What is it?

`@Operation` provides a **summary** and **description** for a single API endpoint. It tells consumers: "This is what this specific API does."

### ⚙️ How it works

```java
@PostMapping("/create")
@Operation(
    summary = "Create Account REST API",
    description = "REST API to create new Customer and Account inside EazyBank"
)
public ResponseEntity<ResponseDto> createAccount(@Valid @RequestBody CustomerDto customerDto) {
    // ...
}
```

| Parameter | Purpose |
|---|---|
| `summary` | Short one-liner shown in the collapsed view |
| `description` | Detailed explanation shown when the endpoint is expanded |

Apply `@Operation` to every API method in your controller:

```java
@GetMapping("/fetch")
@Operation(
    summary = "Fetch Account Details REST API",
    description = "REST API to fetch Customer and Account details based on a mobile number"
)
public ResponseEntity<CustomerDto> fetchAccountDetails(...) { ... }

@PutMapping("/update")
@Operation(
    summary = "Update Account Details REST API",
    description = "REST API to update Customer and Account details based on account number"
)
public ResponseEntity<ResponseDto> updateAccountDetails(...) { ... }

@DeleteMapping("/delete")
@Operation(
    summary = "Delete Account Details REST API",
    description = "REST API to delete Customer and Account details based on a mobile number"
)
public ResponseEntity<ResponseDto> deleteAccountDetails(...) { ... }
```

---

## Concept 3: @ApiResponse — Documenting Response Codes

### ❓ Why do we need this?

By default, Swagger UI shows `200 OK` for every endpoint. But your create API returns `201 Created`, and your update/delete APIs might return `500 Internal Server Error` on failure. Without `@ApiResponse`, clients don't know what responses to expect.

### ⚙️ How it works — Single Response

For the **Create** API (only returns 201):

```java
@PostMapping("/create")
@Operation(summary = "Create Account REST API", description = "...")
@ApiResponse(responseCode = "201", description = "HTTP Status CREATED")
public ResponseEntity<ResponseDto> createAccount(...) { ... }
```

### ⚙️ How it works — Multiple Responses

For **Update** and **Delete** APIs that can return either success or failure:

```java
@PutMapping("/update")
@Operation(summary = "Update Account Details REST API", description = "...")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
    @ApiResponse(responseCode = "500", description = "HTTP Status Internal Server Error")
})
public ResponseEntity<ResponseDto> updateAccountDetails(...) { ... }
```

Notice the difference:
- **Single response** → Use `@ApiResponse` (singular)
- **Multiple responses** → Use `@ApiResponses` (plural, wrapping multiple `@ApiResponse` annotations)

### 🧪 Result in Swagger UI

For the Update API, consumers now see:
- `200` — HTTP Status OK (with response schema)
- `500` — HTTP Status Internal Server Error (with response schema)

This gives clients a complete picture of what to expect.

### 💡 Insight

Always document **all possible responses**, not just the happy path. If your API can throw a `400`, `404`, `417`, or `500`, document each one. The client developer will thank you.

---

## Concept 4: The Full Picture — All Annotations Together

Here's what a fully documented API method looks like:

```java
@DeleteMapping("/delete")
@Operation(
    summary = "Delete Account Details REST API",
    description = "REST API to delete Customer and Account details based on a mobile number"
)
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
    @ApiResponse(responseCode = "500", description = "HTTP Status Internal Server Error")
})
public ResponseEntity<ResponseDto> deleteAccountDetails(
    @RequestParam @Pattern(regexp = "(^$|[0-9]{10})", message = "Mobile number must be 10 digits")
    String mobileNumber) {
    // ...
}
```

Layer by layer:
1. `@Tag` on the class → Groups all APIs with a meaningful name
2. `@Operation` on each method → Describes what the API does
3. `@ApiResponses` on each method → Lists all possible responses
4. Validation annotations → Auto-documented constraints

---

## ✅ Key Takeaways

- `@Tag` on the controller class provides a group name and description in Swagger UI
- `@Operation` on each API method provides summary and description
- `@ApiResponse` documents a single expected response code
- `@ApiResponses` (plural) documents multiple possible response codes
- Always document all possible responses — success and failure paths
- These annotations come from the `io.swagger.v3.oas.annotations` package

## ⚠️ Common Mistakes

- Using `@ApiResponse` when you have multiple responses — use `@ApiResponses` (plural) instead
- Forgetting to document error responses — clients need to know about `500`, `417`, `404` too
- Writing vague descriptions like "API endpoint" — be specific about what the API does and what it returns

## 💡 Pro Tips

- The `summary` appears in the collapsed view — make it concise and scannable
- The `description` appears when expanded — use it for additional context
- If you copy-paste `@Operation` between APIs, don't forget to update the summary and description for each one
- Next step: enhance schema objects with `@Schema` for example data and field descriptions
