# Aspect Order of Resiliency Patterns

## Introduction

You've now learned Circuit Breaker, Retry, Rate Limiter, and Bulkhead — all individually. But what happens when you **combine** multiple patterns on the same method? Which one runs first? Does Retry wrap Circuit Breaker, or the other way around?

The execution order matters because it changes the behavior.

---

## Default Execution Order

When multiple Resilience4j patterns are applied to a single method, they execute in this order (outermost to innermost):

```
Retry
  └─ CircuitBreaker
       └─ RateLimiter
            └─ TimeLimiter
                 └─ Bulkhead
                      └─ Your Method
```

Reading from the **inside out** (how your method call is wrapped):

1. **Bulkhead** — first layer around your method (innermost)
2. **TimeLimiter** — wraps the bulkhead
3. **RateLimiter** — wraps the time limiter
4. **CircuitBreaker** — wraps the rate limiter
5. **Retry** — outermost layer, applied last

This means **Retry** is the last to execute. It retries the entire chain: circuit breaker check → rate limiter check → time limiter check → bulkhead check → method execution.

---

## Why Does Order Matter?

Consider this scenario: you have both `@Retry` and `@CircuitBreaker` on a method.

With the **default order** (Retry is outermost):
- Circuit Breaker opens after failures
- Retry retries the request, including checking the Circuit Breaker state
- If Circuit Breaker is open, Retry gets a quick failure — no wasted time

If the order were **reversed** (Circuit Breaker outermost):
- Retry would retry multiple times
- Only then the Circuit Breaker would count it as one attempt
- The Circuit Breaker wouldn't "see" the individual retries

---

## Changing the Default Order

If the default order doesn't fit your needs, you can customize it via `application.yml`:

```yaml
resilience4j:
  retry:
    retryAspectOrder: 1
  circuitbreaker:
    circuitBreakerAspectOrder: 2
```

Higher value = higher priority = **executed first** (outermost).

So with this configuration:
- Retry (order 1) executes first (outermost)
- Circuit Breaker (order 2) executes after, meaning it starts *after* Retry finishes

Wait — that seems backward from the default? The documentation says: "Circuit breaker starts after the Retry finish its work." The ordering system determines nesting depth.

---

## A Word of Caution

⚠️ **Don't overuse resiliency patterns.** Stacking Circuit Breaker + Retry + Rate Limiter + Bulkhead on every API is **overengineering**.

- Each pattern adds latency and complexity
- Without proper testing, combining patterns can produce unexpected behavior
- Only apply what's **necessary** for your specific use case

Do your due diligence. Test thoroughly. Apply patterns where they solve real problems.

---

## ✅ Key Takeaways

- Default order: `Retry → CircuitBreaker → RateLimiter → TimeLimiter → Bulkhead → Method`
- Retry is the outermost (applied last, wraps everything)
- Bulkhead is the innermost (applied first, closest to the method)
- You can customize the order via `*AspectOrder` properties
- Don't combine all patterns blindly — apply only what's needed
- Always test combined patterns thoroughly before deploying to production

💡 **Pro Tip:** If you're combining patterns, draw the nesting structure on paper first. Understand what happens at each layer for both success and failure scenarios. This prevents surprises in production.
