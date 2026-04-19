# Implementing Circuit Breaker with Feign Client — Part 2: Demo

## Introduction

We've wired everything up: dependency, property, fallback classes, null checks. Now let's watch it work. We'll stop services, observe fallback behavior, monitor circuit breaker state transitions via actuator, and see how graceful degradation looks in practice.

---

## The Setup

All services running: Config Server, Eureka, Accounts, Loans, Cards, and Gateway. Test data created for a mobile number across all three services.

### Actuator endpoints for monitoring (on Accounts, port 8080):

- **Circuit breaker status**: `http://localhost:8080/actuator/circuitBreakers`
- **Circuit breaker events**: `http://localhost:8080/actuator/circuitbreakerevents`

---

## Observing the Circuit Breakers

### After the first successful request:

The actuator shows **two circuit breakers** automatically created by Feign:

```
cardsFeignClient#fetchCardDetails(String, String)  → CLOSED
loansFeignClient#fetchLoanDetails(String, String)   → CLOSED
```

Notice the naming pattern: `interfaceName#methodName(parameterTypes)`. This is how Feign auto-names circuit breakers — you don't need to configure names manually.

---

## Demo 1: Stop Loans Microservice

### What happens:
1. Stop the Loans application
2. Call `fetchCustomerDetails` via Gateway
3. **Response includes**: Account details ✅, Card details ✅, Loans = `null`

### The result:
Instead of a RuntimeException crashing the entire request, the client gets **partial data**. Accounts and Cards info is returned; Loans is simply absent.

### Behind the scenes:
- Feign tries to call Loans → fails
- Circuit breaker detects the failure → invokes `LoansFallback`
- Fallback returns `null`
- Service layer skips setting loans data (null check)
- Client receives what *is* available

---

## Demo 2: Stop Both Loans AND Cards

### What happens:
1. Stop both Loans and Cards
2. Call `fetchCustomerDetails`
3. **Response includes**: Account details ✅, Loans = `null`, Cards = `null`

At least the client gets accounts information. Without circuit breaker and fallback, this would be a complete failure — 500 Internal Server Error, no data at all.

---

## Watching State Transitions

### After multiple failures to stopped services:

Actuator shows:
```
loansFeignClient#fetchLoanDetails  → OPEN
cardsFeignClient#fetchCardDetails  → OPEN
```

Events log shows:
```
ERROR, ERROR, ERROR, ...
FAILURE_RATE_EXCEEDED
STATE_TRANSITION: CLOSED → OPEN
NOT_PERMITTED, NOT_PERMITTED, ...
```

### The "Not Permitted" effect:
When the circuit is **OPEN**, Feign doesn't even attempt to call the service. It goes straight to the fallback. This means:
- No threads wasted on connection attempts
- No TCP handshake timeouts
- Immediate response from the fallback

---

## The Amazon Example

Think about Amazon's homepage. Behind it, dozens of microservices provide:
- Product listings
- Price information
- User recommendations
- Order history
- Deals and banners

If the **recommendation service** goes down, does Amazon's entire homepage crash? Of course not. They show products, prices, and deals. The "Recommended for You" section simply doesn't appear.

That's exactly what we've built here. Cards is down? Fine — we still show accounts and loans. That's **graceful degradation**.

---

## Recovery

Start Loans and Cards back up. After the `waitDurationInOpenState` (10 seconds), the circuit breaker moves to HALF_OPEN, sends test requests, gets successful responses, and transitions back to CLOSED.

From the client's perspective: after a few seconds, loans and cards data starts appearing in responses again. **No restart needed, no manual intervention.** The system heals itself.

---

## Summary of Implementation Steps

1. Add `spring-cloud-starter-circuitbreaker-resilience4j` dependency
2. Enable: `spring.cloud.openfeign.circuitbreaker.enabled: true`
3. Create fallback classes implementing Feign interfaces with `@Component`
4. Add `fallback = XxxFallback.class` to `@FeignClient` annotations
5. Add null checks in service layer for fallback returns
6. Configure circuit breaker properties in `application.yml`

---

## ✅ Key Takeaways

- With Feign + Resilience4j, each Feign method gets its own circuit breaker automatically
- Fallback returns partial/null data instead of throwing exceptions — **graceful degradation**
- Circuit breakers auto-recover when the downstream service comes back
- `actuator/circuitBreakers` and `actuator/circuitbreakerevents` provide real-time monitoring
- You can have circuit breakers at both Gateway AND microservice level — defense in depth

## ⚠️ Common Mistakes

- Not creating test data after service restart — H2 in-memory database loses data on restart
- Expecting immediate recovery — circuit stays OPEN for the configured wait duration even after the service comes back
- Returning heavy objects from fallbacks — keep fallback logic lightweight; it runs during failures when resources may already be strained

## 💡 Pro Tip

In production, monitor circuit breaker state transitions as **alerts**. A circuit going OPEN means a service is having trouble. A circuit that flaps between OPEN and HALF_OPEN repeatedly means the service is partially recovering but still unstable — you may need to investigate root cause rather than relying on auto-recovery.
