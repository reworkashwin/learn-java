# READ API Inside Accounts Microservice

## Introduction

We can create accounts — now let's build the API to **fetch** customer and account details. This is a GET operation where clients pass a mobile number and receive the complete customer profile with linked account information. We'll also create the `ResourceNotFoundException` and see how to chain queries across related entities.

---

## The Fetch Endpoint

```java
@GetMapping("/fetch")
public ResponseEntity<CustomerDto> fetchAccountDetails(
        @RequestParam String mobileNumber) {
    CustomerDto customerDto = iAccountsService.fetchAccount(mobileNumber);
    return ResponseEntity.status(HttpStatus.OK).body(customerDto);
}
```

Key design choices:
- **`@GetMapping`** — Read operations always use HTTP GET
- **`@RequestParam`** — The mobile number comes as a query parameter: `/api/fetch?mobileNumber=9345432123`
- **`HttpStatus.OK` (200)** — Standard response for successful data retrieval

### `@RequestParam` vs `@RequestBody` vs `@PathVariable`

When should you use which?

| Annotation | Use Case | Example |
|---|---|---|
| `@RequestParam` | Simple values in query string | `GET /api/fetch?mobileNumber=123` |
| `@PathVariable` | Resource identifiers in URL path | `GET /api/accounts/{id}` |
| `@RequestBody` | Complex objects in POST/PUT body | `POST /api/create` with JSON body |

For our fetch API, `@RequestParam` is appropriate because we're passing a single search value.

---

## The Service Logic — Chaining Queries

```java
@Override
public CustomerDto fetchAccount(String mobileNumber) {
    // Step 1: Find customer by mobile number
    Customer customer = customerRepository.findByMobileNumber(mobileNumber)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Customer", "mobileNumber", mobileNumber
            ));

    // Step 2: Find account by customer ID
    Accounts accounts = accountsRepository.findByCustomerId(customer.getCustomerId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Account", "customerId", customer.getCustomerId().toString()
            ));

    // Step 3: Map entities to DTOs and combine
    CustomerDto customerDto = CustomerMapper.mapToCustomerDto(customer, new CustomerDto());
    customerDto.setAccountsDto(AccountsMapper.mapToAccountsDto(accounts, new AccountsDto()));
    
    return customerDto;
}
```

### The Query Chain

The client sends a **mobile number**, but the accounts table doesn't have a mobile number column. So we need two hops:

```
Mobile Number → Customer Table → customerId → Accounts Table → Account Details
```

1. **Find customer** by mobile number → get `customerId`
2. **Find account** by `customerId` → get account details
3. **Combine both** into a single `CustomerDto` (with embedded `AccountsDto`)

### New Derived Method: `findByCustomerId`

Just like `findByMobileNumber`, we add to `AccountsRepository`:

```java
@Repository
public interface AccountsRepository extends JpaRepository<Accounts, Long> {
    Optional<Accounts> findByCustomerId(Long customerId);
}
```

---

## The `ResourceNotFoundException`

```java
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceName, String fieldName, String fieldValue) {
        super(String.format("%s not found with the given input data %s : '%s'", 
              resourceName, fieldName, fieldValue));
    }
}
```

This is more descriptive than a generic exception. When thrown, it produces messages like:
- *"Customer not found with the given input data mobileNumber : '9999999999'"*
- *"Account not found with the given input data customerId : '42'"*

The three-parameter constructor (`resourceName`, `fieldName`, `fieldValue`) is reusable across any "not found" scenario in the entire application.

### Registering in GlobalExceptionHandler

```java
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ErrorResponseDto> handleResourceNotFoundException(
        ResourceNotFoundException exception, WebRequest webRequest) {
    ErrorResponseDto errorResponse = new ErrorResponseDto(
        webRequest.getDescription(false),
        HttpStatus.NOT_FOUND,
        exception.getMessage(),
        LocalDateTime.now()
    );
    return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
}
```

---

## The `orElseThrow()` Pattern

When a repository returns `Optional<T>`, `orElseThrow()` is the cleanest way to handle "not found":

```java
Customer customer = customerRepository.findByMobileNumber(mobileNumber)
    .orElseThrow(() -> new ResourceNotFoundException("Customer", "mobileNumber", mobileNumber));
```

If the Optional is empty → throw the exception. If it has a value → unwrap and return it. One line, clean and readable.

---

## Testing

**Success case:**
```
GET /api/fetch?mobileNumber=9345432123
// Response: 200 with full customer + account details
```

**Not found:**
```
GET /api/fetch?mobileNumber=0000000000
// Response: 404 - "Customer not found with the given input data mobileNumber : '0000000000'"
```

---

## ✅ Key Takeaways

- Use **`@GetMapping`** for read operations, **`@RequestParam`** for query parameters
- **Chain queries** across related entities using the ID from the first query result
- **`orElseThrow()`** is the idiomatic way to handle missing records with Optional
- Create a **reusable `ResourceNotFoundException`** with descriptive three-parameter constructor
- Map entities to DTOs and **embed related DTOs** (e.g., `AccountsDto` inside `CustomerDto`)

⚠️ **Common Mistakes**
- Using `@RequestBody` for GET requests — GET requests should use query params or path variables, not request bodies
- Forgetting to register custom exceptions in the `GlobalExceptionHandler` — Spring returns a generic error page
- Returning raw entity objects instead of DTOs — exposes internal structure to clients
