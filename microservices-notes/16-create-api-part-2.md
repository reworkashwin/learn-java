# CREATE API Inside Accounts Microservice — Part 2

## Introduction

In Part 1, we set up the controller, service interface, mapper, and constants. Now let's wire everything together — write the actual service logic that saves customer and account records, implement **custom exception handling**, and build a **global exception handler** that catches errors across all controllers.

---

## The Create Account Service Logic

```java
@Override
public void createAccount(CustomerDto customerDto) {
    Customer customer = CustomerMapper.mapToCustomer(customerDto, new Customer());
    
    // Check if customer already exists
    Optional<Customer> optionalCustomer = customerRepository.findByMobileNumber(customerDto.getMobileNumber());
    if (optionalCustomer.isPresent()) {
        throw new CustomerAlreadyExistsException(
            "Customer already registered with given mobile number: " + customerDto.getMobileNumber()
        );
    }
    
    // Populate audit fields
    customer.setCreatedAt(LocalDateTime.now());
    customer.setCreatedBy("Anonymous");
    
    // Save customer and create linked account
    Customer savedCustomer = customerRepository.save(customer);
    accountsRepository.save(createNewAccount(savedCustomer));
}
```

### The Flow

1. **Convert DTO → Entity** using the mapper
2. **Validate** — check if a customer with this mobile number already exists
3. **Set audit fields** — `createdAt` and `createdBy` (we'll automate this later)
4. **Save the customer** — JPA auto-generates the `customerId`
5. **Create and save a linked account** — using the generated `customerId`

### Generating Account Numbers

```java
private Accounts createNewAccount(Customer customer) {
    Accounts newAccount = new Accounts();
    newAccount.setCustomerId(customer.getCustomerId());
    long randomAccNumber = 1000000000L + new Random().nextInt(900000000);
    newAccount.setAccountNumber(randomAccNumber);
    newAccount.setAccountType(AccountsConstants.SAVINGS);
    newAccount.setBranchAddress(AccountsConstants.ADDRESS);
    newAccount.setCreatedAt(LocalDateTime.now());
    newAccount.setCreatedBy("Anonymous");
    return newAccount;
}
```

We generate a **10-digit random number** instead of using JPA's auto-increment. Real bank account numbers aren't sequential — they're long identifiers.

---

## Custom Derived Query Methods

JPA gives us `findById()` for free, but we need to find customers by mobile number. Enter **derived named methods**:

```java
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByMobileNumber(String mobileNumber);
}
```

How does Spring Data JPA know what SQL to generate? It **parses the method name**:
- `findBy` → SELECT query
- `MobileNumber` → WHERE clause on the `mobileNumber` column

The return type `Optional<Customer>` indicates there might or might not be a result.

### Building More Complex Queries

```java
findByNameAndEmail(String name, String email)       // WHERE name = ? AND email = ?
findByEmailOrMobileNumber(String email, String mobile) // WHERE email = ? OR mobile_number = ?
findByNameOrderByCreatedAtDesc(String name)           // WHERE name = ? ORDER BY created_at DESC
```

💡 **Pro Tip**: The field name in the method must match the field name in the entity class exactly (case-insensitive, but spelling must match).

---

## Custom Exception Handling

### Step 1: Create a Custom Exception

```java
@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class CustomerAlreadyExistsException extends RuntimeException {
    public CustomerAlreadyExistsException(String message) {
        super(message);
    }
}
```

- Extends `RuntimeException` — unchecked, no need for `throws` declarations
- **`@ResponseStatus(BAD_REQUEST)`** — Tells Spring to return HTTP 400 when this is thrown

### Step 2: Build a Global Exception Handler

Instead of try-catch blocks scattered across every controller, we create **one centralized handler**:

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomerAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDto> handleCustomerAlreadyExistsException(
            CustomerAlreadyExistsException exception, WebRequest webRequest) {
        
        ErrorResponseDto errorResponse = new ErrorResponseDto(
            webRequest.getDescription(false),
            HttpStatus.BAD_REQUEST,
            exception.getMessage(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}
```

**How it works:**
- **`@ControllerAdvice`** — Tells Spring: "This class handles exceptions from ALL controllers"
- **`@ExceptionHandler(SomeException.class)`** — This method handles this specific exception type
- **`WebRequest`** — Gives access to request details (like the API path the client called)
- **`webRequest.getDescription(false)`** — Returns just the API path (not IP/headers)

When `CustomerAlreadyExistsException` is thrown anywhere in any controller, Spring intercepts it and routes it to this handler. The client gets a clean JSON error response instead of a stack trace.

---

## Testing the API

**Success case:**
```json
POST /api/create
{
    "name": "Madan Reddy",
    "email": "madan@example.com",
    "mobileNumber": "9345432123"
}
// Response: 201 - "Account created successfully"
```

**Duplicate mobile number:**
```json
POST /api/create  (same mobile number again)
// Response: 400 - "Customer already registered with given mobile number: 9345432123"
```

---

## ✅ Key Takeaways

- **Derived named methods** like `findByMobileNumber()` let JPA auto-generate queries from method names
- **Custom exceptions** should extend `RuntimeException` and use `@ResponseStatus`
- **`@ControllerAdvice` + `@ExceptionHandler`** = Global exception handling for all controllers
- The `ErrorResponseDto` gives clients structured error info (path, code, message, timestamp)
- Always **validate business rules** (like duplicate mobile number) before saving to the database

⚠️ **Common Mistakes**
- Forgetting to populate audit fields (`createdAt`, `createdBy`) before saving — causes NOT NULL constraint violations
- Handling exceptions in every controller method instead of using global exception handling
- Returning raw exception stack traces to clients — always wrap in a clean `ErrorResponseDto`
