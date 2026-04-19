# Implementing Circuit Breaker Pattern in Gateway — Part 1

## Introduction

Theory is great, but nothing beats seeing the circuit breaker **in action**. In this section, we implement the circuit breaker directly in the Spring Cloud Gateway — the edge server that handles all incoming traffic. We'll configure it, test it, and watch the state transitions happen in real time through actuator endpoints.

---

## Step 1: Add the Dependency

In the Gateway Server's `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-reactor-resilience4j</artifactId>
</dependency>
```

**Why `reactor-resilience4j`?** Because Spring Cloud Gateway is built on Spring WebFlux (reactive). The regular `resilience4j` library won't work here — you need the reactive variant.

---

## Step 2: Apply Circuit Breaker Filter in Routing

Inside the `GatewayServerApplication` class where routing is configured:

```java
.route(p -> p
    .path("/eazybank/accounts/**")
    .filters(f -> f
        .rewritePath("/eazybank/accounts/(?<segment>.*)", "/${segment}")
        .circuitBreaker(config -> config.setName("accountsCircuitBreaker"))
    )
    .uri("lb://ACCOUNTS"))
```

The `.circuitBreaker()` filter is a **built-in Gateway filter**. You just give it a name — `accountsCircuitBreaker` — and it wraps all traffic to that route with circuit breaker logic.

### Why a name?

You might have circuit breakers for different routes (accounts, loans, cards). The name lets you:
- Configure each one independently
- Monitor each one separately via actuator
- Apply different thresholds to different services

---

## Step 3: Configure Circuit Breaker Properties

In `application.yml`:

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

### What each property means:

| Property | Value | Meaning |
|----------|-------|---------|
| `sliding-window-size` | 10 | Monitor 10 requests before deciding |
| `permitted-number-of-calls-in-half-open-state` | 2 | Allow 2 test requests in Half-Open |
| `failure-rate-threshold` | 50 | Open circuit if ≥50% of calls fail |
| `wait-duration-in-open-state` | 10000 | Wait 10 seconds in Open before moving to Half-Open |

These are under `configs.default` — meaning they apply to **all** circuit breakers. Want specific config for one breaker? Replace `default` with the breaker name (e.g., `accountsCircuitBreaker`).

---

## Step 4: Observe via Actuator

Spring Boot Actuator exposes circuit breaker state in real time:

### Overall status:
```
GET http://localhost:8072/actuator/circuitBreakers
```

Returns the current state (CLOSED, OPEN, HALF_OPEN), failure rate, slow call rate, and call counts.

### Event history:
```
GET http://localhost:8072/actuator/circuitbreakerevents?name=accountsCircuitBreaker
```

Shows every event: SUCCESS, ERROR, STATE_TRANSITION. You can watch the circuit breaker's decision-making in real time.

---

## The Live Demo

### Setup:
- Start Config Server → Eureka → Accounts → Gateway
- No need to start Loans/Cards — circuit breaker is only on Accounts

### Simulating a slow service:
Put a **breakpoint** in the AccountsController's `contactInfo()` method and never release it. This simulates a service that accepts requests but never responds.

### What happens:

1. **First few calls** — Gateway waits, eventually times out → 504 Gateway Timeout
2. **Circuit breaker monitors** — failure count increases
3. **After enough failures** (>50% of 10 calls) → circuit transitions from **Closed → Open**
4. **Now every call fails immediately** → 503 Service Unavailable with message "upstream service is temporarily unavailable"
5. **Wait 10 seconds** → circuit moves to **Half-Open**, allows 2 test calls
6. **If those fail** → back to **Open**, waits another 10 seconds
7. **Remove the breakpoint** → next test calls succeed → circuit transitions to **Closed**

### The key observation:

When the circuit is **Open**, the error response is instant — no waiting, no thread blocking, no resource consumption. The Gateway is fully protected.

---

## Watching the State Transitions via Actuator

The events endpoint shows the full journey:

```json
{"type": "SUCCESS"}
{"type": "SUCCESS"}
{"type": "ERROR"}
{"type": "ERROR"}
// ... more errors
{"type": "FAILURE_RATE_EXCEEDED"}
{"type": "STATE_TRANSITION", "stateTransition": "CLOSED_TO_OPEN"}
{"type": "NOT_PERMITTED"}  // calls rejected while open
{"type": "STATE_TRANSITION", "stateTransition": "OPEN_TO_HALF_OPEN"}
{"type": "ERROR"}  // test call failed
{"type": "STATE_TRANSITION", "stateTransition": "HALF_OPEN_TO_OPEN"}
// ... eventually
{"type": "SUCCESS"}
{"type": "STATE_TRANSITION", "stateTransition": "HALF_OPEN_TO_CLOSED"}
```

---

## ✅ Key Takeaways

- In Gateway, circuit breaker is applied as a **built-in filter** — just call `.circuitBreaker()` in your route definition
- Use `reactor-resilience4j` dependency for reactive Gateway (not the regular one)
- Properties under `configs.default` apply globally; use the breaker name for specific overrides
- Actuator endpoints (`/circuitBreakers`, `/circuitbreakerevents`) let you observe state in real time
- The circuit breaker transitions are fully automatic based on your configuration

## ⚠️ Common Mistakes

- Using `spring-cloud-starter-circuitbreaker-resilience4j` instead of the `reactor` variant for Gateway — it won't work with WebFlux
- Setting `sliding-window-size` too high — you'll need many failures before the circuit opens, which may be too slow to protect the system
- Forgetting that circuit breaker's default timeout is ~1 second — if your service normally takes 2 seconds, legitimate requests will trigger the breaker

## 💡 Pro Tip

Use the actuator endpoints in production monitoring dashboards. If you see a circuit breaker in OPEN state, it's an immediate signal that a downstream service has issues — often faster than traditional alerting.
