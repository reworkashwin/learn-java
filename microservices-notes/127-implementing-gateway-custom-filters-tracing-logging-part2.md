# Implementing Cross-Cutting Concerns: Tracing & Logging Using Gateway — Part 2

## Introduction

In Part 1, we built the Gateway filters that generate and attach a correlation ID to every request. Now comes the second half — making each individual microservice **accept** that correlation ID, **log** it, and **forward** it to downstream services. This completes the end-to-end tracing chain.

---

## Accepting the Correlation ID in Microservices

### The Entry Point: `CustomerController` in Accounts

The `fetchCustomerDetails` API is our target because it's the one that fans out to Loans and Cards. We need it to read the correlation ID header sent by the Gateway.

How? The same way you accept query params, but for headers — using `@RequestHeader`:

```java
@GetMapping("/fetchCustomerDetails")
public ResponseEntity<CustomerDetailsDto> fetchCustomerDetails(
        @RequestParam String mobileNumber,
        @RequestHeader("eazybank-correlation-id") String correlationId) {
    
    logger.debug("eazybank-correlation-id found: {}", correlationId);
    // ... business logic
}
```

**What's happening:** The Gateway adds `eazybank-correlation-id` as a request header. Spring automatically maps it to the `correlationId` parameter. Now you can log it, pass it around, and use it for debugging.

---

## Propagating the Correlation ID Downstream

The Accounts service doesn't just *use* the correlation ID — it needs to **forward** it when calling Loans and Cards microservices.

### The propagation chain:

1. **Controller** receives `correlationId` → passes it to the **Service layer**
2. **Service layer** passes it to **Feign Client** interfaces
3. **Feign Client** sends it as a `@RequestHeader` to the downstream microservice

```
CustomerController → ICustomerService → CustomerServiceImpl → LoansFeignClient / CardsFeignClient
```

### In the Feign Client interfaces:

```java
@FeignClient(name = "loans")
public interface LoansFeignClient {
    @GetMapping("/api/fetch")
    LoansDto fetchLoanDetails(
        @RequestHeader("eazybank-correlation-id") String correlationId,
        @RequestParam String mobileNumber);
}
```

The `@RequestHeader` annotation on a Feign Client method parameter tells Feign: "When you make the HTTP call, add this as a request header." This is how the correlation ID travels from Accounts → Loans and Accounts → Cards.

---

## Adding Logging in Loans and Cards Controllers

Each downstream service needs to:
1. Accept the `@RequestHeader("eazybank-correlation-id")` parameter
2. Create a `Logger` variable
3. Log the correlation ID

```java
// In LoansController
private static final Logger logger = LoggerFactory.getLogger(LoansController.class);

@GetMapping("/api/fetch")
public ResponseEntity<LoansDto> fetchLoanDetails(
        @RequestHeader("eazybank-correlation-id") String correlationId,
        @RequestParam String mobileNumber) {
    logger.debug("eazybank-correlation-id found: {}", correlationId);
    // ... business logic
}
```

The same pattern applies to `CardsController`.

---

## Enabling Debug Logging Everywhere

Each microservice needs the logging level configured in its `application.yml`:

```yaml
# accounts
logging:
  level:
    com.eazybytes.accounts: DEBUG

# loans
logging:
  level:
    com.eazybytes.loans: DEBUG

# cards
logging:
  level:
    com.eazybytes.cards: DEBUG
```

Without this, your `logger.debug(...)` statements are invisible.

---

## Validating the Complete Flow

After restarting all services and creating test data, invoking `fetchCustomerDetails` through the Gateway:

1. **Response headers** include `eazybank-correlation-id` — the client can see the trace ID
2. **Gateway Server logs** show two entries: one from `RequestTraceFilter` (generation) and one from `ResponseTraceFilter` (attaching to response)
3. **Accounts logs** show the correlation ID was received
4. **Loans logs** show the same correlation ID
5. **Cards logs** show the same correlation ID

One UUID → visible in all four services → complete traceability.

### Real-world power of this:

A client raises a support ticket: *"Request with correlation ID `abc-123-xyz` returned wrong data."*

The developer searches `abc-123-xyz` across all service logs and immediately sees:
- The request reached the Gateway ✓
- Forwarded to Accounts ✓
- Accounts called Loans ✓
- Accounts called Cards — exception at this point ✗

Problem located in seconds, not hours.

---

## ✅ Key Takeaways

- `@RequestHeader` on controller methods accepts headers; on Feign Client methods, it *sends* headers
- The correlation ID must be explicitly propagated through each layer: Controller → Service → Feign Client
- Every microservice needs debug logging enabled in `application.yml` for trace logs to appear
- The Gateway handles both ends: generating the ID (pre-filter) and attaching it to the response (post-filter)

## ⚠️ Common Mistakes

- Forgetting to pass the correlation ID through the service layer — it gets accepted in the controller but never reaches the Feign Client
- Not enabling debug logging in every microservice — you'll wonder why logs don't appear
- Using different header name strings in different places — consistency matters (`eazybank-correlation-id` everywhere)

## 💡 Pro Tip

In production, you wouldn't manually implement correlation IDs like this. Tools like **Spring Cloud Sleuth** or **Micrometer Tracing** with **Zipkin** do this automatically. But understanding the manual approach teaches you *what* these tools do under the hood — which is invaluable for debugging and interviews.
