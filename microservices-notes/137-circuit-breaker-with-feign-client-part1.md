# Implementing Circuit Breaker with Feign Client — Part 1

## Introduction

We implemented circuit breaker at the Gateway level. But what about **inside** the microservices themselves? The Accounts service calls Loans and Cards via Feign Client. If either of those services goes down, Accounts needs its own circuit breaker protection — regardless of what the Gateway does.

The good news: Feign Client has **built-in integration** with Resilience4j circuit breaker. Let's implement it.

---

## The Setup

### Where's the problem?

Accounts service has a `fetchCustomerDetails` API that calls:
- `LoansFeignClient.fetchLoanDetails()`
- `CardsFeignClient.fetchCardDetails()`

If Loans or Cards becomes slow/unavailable, the Accounts thread waits indefinitely. With circuit breaker + fallback, it can fail fast and return partial data instead.

---

## Step 1: Add the Dependency

In the Accounts `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
```

**Notice:** This is `resilience4j`, NOT `reactor-resilience4j`. Accounts is a traditional Spring MVC application (not reactive like the Gateway), so we use the standard variant.

---

## Step 2: Enable Circuit Breaker for Feign

In `application.yml`:

```yaml
spring:
  cloud:
    openfeign:
      circuitbreaker:
        enabled: true
```

That's it. With this single property, **every Feign Client method** in your application is automatically wrapped with a circuit breaker. No annotations on individual methods needed.

---

## Step 3: Add Circuit Breaker Properties

Same properties as before, in `application.yml`:

```yaml
resilience4j:
  circuitbreaker:
    configs:
      default:
        sliding-window-size: 10
        permitted-number-of-calls-in-half-open-state: 2
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10000
```

---

## Step 4: Create Fallback Classes

This is where Feign's circuit breaker integration shines. Instead of catching exceptions, you create a **fallback class** that implements the same Feign interface:

### `LoansFallback.java`:

```java
@Component
public class LoansFallback implements LoansFeignClient {
    @Override
    public LoansDto fetchLoanDetails(String correlationId, String mobileNumber) {
        return null;  // Return null when Loans is unavailable
    }
}
```

### `CardsFallback.java`:

```java
@Component
public class CardsFallback implements CardsFeignClient {
    @Override
    public CardsDto fetchCardDetails(String correlationId, String mobileNumber) {
        return null;  // Return null when Cards is unavailable
    }
}
```

### How this works:

When the circuit breaker detects that the real Loans microservice is failing, instead of calling the actual service, it calls the **fallback implementation** of the same interface. The fallback returns `null`, a cached value, or whatever makes sense for your business.

In production, instead of `null`, you might:
- Return data from a cache
- Return a default object
- Call a backup service
- Return an "unavailable" marker that the UI handles gracefully

---

## Step 5: Register Fallback in Feign Interface

Update the `@FeignClient` annotation to point to the fallback:

```java
@FeignClient(name = "loans", fallback = LoansFallback.class)
public interface LoansFeignClient {
    @GetMapping("/api/fetch")
    LoansDto fetchLoanDetails(
        @RequestHeader("eazybank-correlation-id") String correlationId,
        @RequestParam String mobileNumber);
}
```

```java
@FeignClient(name = "cards", fallback = CardsFallback.class)
public interface CardsFeignClient {
    @GetMapping("/api/fetch")
    CardsDto fetchCardDetails(
        @RequestHeader("eazybank-correlation-id") String correlationId,
        @RequestParam String mobileNumber);
}
```

---

## Step 6: Add Null Checks in the Service Layer

Since the fallback returns `null`, the service layer must handle it:

```java
// In CustomerServiceImpl
ResponseEntity<LoansDto> loansResponse = loansFeignClient.fetchLoanDetails(correlationId, mobileNumber);
if (null != loansResponse) {
    customerDetailsDto.setLoansDto(loansResponse.getBody());
}

ResponseEntity<CardsDto> cardsResponse = cardsFeignClient.fetchCardDetails(correlationId, mobileNumber);
if (null != cardsResponse) {
    customerDetailsDto.setCardsDto(cardsResponse.getBody());
}
```

Without these null checks, you'd get a `NullPointerException` when the fallback kicks in.

---

## The Pattern in Summary

```
              Normal Flow                     Failure Flow
              ────────────                    ────────────
FeignClient → Loans Service → LoansDto    FeignClient → Circuit Open → LoansFallback → null
```

The caller (`CustomerServiceImpl`) doesn't even know a fallback happened — it just receives a return value (data or null) and proceeds.

---

## ✅ Key Takeaways

- Feign + Resilience4j integration requires only a dependency, one property, and fallback classes
- Fallback classes **implement the same Feign interface** — clean and type-safe
- `spring.cloud.openfeign.circuitbreaker.enabled: true` wraps ALL Feign methods with circuit breakers automatically
- The naming convention for auto-created circuit breakers: `interfaceName#methodName(paramTypes)`
- Always add null checks in the service layer when fallbacks can return null

## ⚠️ Common Mistakes

- Using `reactor-resilience4j` in a non-reactive service (Accounts) — use the standard `resilience4j`
- Forgetting `@Component` on fallback classes — Spring won't find them for injection
- Not handling null returns from fallbacks — `NullPointerException` in the service layer

## 💡 Pro Tip

Circuit breakers at the Gateway level protect the **Gateway's** resources. Circuit breakers in the microservice protect the **microservice's** resources. In production, you typically want both — defense in depth.
