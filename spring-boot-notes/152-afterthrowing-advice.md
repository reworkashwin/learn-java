# Centralized Exception Logging with AfterThrowing Advice

## Introduction

Exceptions are inevitable in any application. The question isn't *if* they'll happen, but *when*. When they do, you need detailed information — which method failed, what arguments were passed, what type of exception occurred, and what was the error message. **AfterThrowing Advice** lets you handle all of this in a single, centralized location instead of scattering try-catch blocks across every method.

---

## What Is AfterThrowing Advice?

### 🧠 The Simple Explanation

AfterThrowing Advice runs **only when a target method throws an exception**. If the method executes successfully, this Aspect is never invoked.

Think of it as an **exception observer** — it watches method executions and springs into action only when things go wrong.

### ❓ How Is It Different from Other After Types?

| Advice | Runs When | Gets Exception? | Gets Return Value? |
|--------|----------|-----------------|-------------------|
| `@After` | Always (success or failure) | ❌ | ❌ |
| `@AfterReturning` | Only on success | ❌ | ✅ |
| `@AfterThrowing` | Only on exception | ✅ | ❌ |

These three complement each other perfectly — together they cover every possible outcome.

---

## Implementing AfterThrowing Advice

### The Aspect Class

```java
@Aspect
@Component
@Slf4j
public class ExceptionAuditAspect {

    @AfterThrowing(
        pointcut = "execution(* com.eazybytes.jobportal..*(..))",
        throwing = "ex"
    )
    public void logAfterException(JoinPoint joinPoint, Exception ex) {
        String methodName = joinPoint.getSignature().toShortString();
        Object[] args = joinPoint.getArgs();

        log.error("Exception in method: {}", methodName);
        log.error("Arguments: {}", Arrays.toString(args));
        log.error("Exception type: {}", ex.getClass().getSimpleName());
        log.error("Exception message: {}", ex.getMessage());
    }
}
```

---

## Understanding the Annotation Parameters

### 🔑 The `pointcut` Parameter

```java
pointcut = "execution(* com.eazybytes.jobportal..*(..))"
```

This casts a **wide net** — intercepting ALL methods across all packages. This is ideal for exception logging because you want to catch exceptions **everywhere**, not just in specific methods.

### 🔑 The `throwing` Parameter

```java
throwing = "ex"
```

Just like `returning` in AfterReturning, the `throwing` value must **match the parameter name** in your method:

```java
public void logAfterException(JoinPoint joinPoint, Exception ex) {
//                                                          ^^
//                                               Must match "throwing" value
```

Spring passes the actual exception thrown by the target method into this parameter.

---

## What Information Can You Capture?

### From `JoinPoint`:

| Method | What It Returns |
|--------|----------------|
| `joinPoint.getSignature().toShortString()` | Method name that threw the exception |
| `joinPoint.getArgs()` | Arguments passed to the failing method |

### From `Exception`:

| Method | What It Returns |
|--------|----------------|
| `ex.getClass().getSimpleName()` | Type of exception (e.g., `RuntimeException`, `NullPointerException`) |
| `ex.getMessage()` | The error message |
| `ex.getStackTrace()` | Full stack trace |

---

## Testing the AfterThrowing Advice

### 🧪 Step 1: Force an Exception

Temporarily add a `throw` statement to a controller method:

```java
@GetMapping("/companies")
public ResponseEntity<?> getAllCompanies() {
    throw new RuntimeException("AOP testing");
}
```

### 🧪 Step 2: Invoke the REST API

Call the companies API from Postman. You get:
- HTTP `500` response from `GlobalExceptionHandler`

### 🧪 Step 3: Check the Console

```
ERROR - Exception in method: CompanyController.getAllCompanies()
ERROR - Arguments: []
ERROR - Exception type: RuntimeException
ERROR - Exception message: AOP testing
```

All logged by the Aspect — not by any code in the controller!

### 🧪 Step 4: Remove the Exception and Verify

After removing the `throw` statement, invoke the API again. This time:
- You get a successful `200` response
- **No error logs appear** — because the AfterThrowing Aspect only runs when exceptions occur

---

## Important Behavior to Understand

### ⚠️ AfterThrowing Does NOT Swallow Exceptions

A critical point: AfterThrowing Advice **observes** the exception — it does **not** catch or handle it. After your Aspect logic executes, the exception continues to propagate normally up the call stack.

```
Method throws exception
    → AfterThrowing Aspect runs (logs the error)
    → Exception continues propagating
    → GlobalExceptionHandler catches it
    → Client gets the error response
```

If you need to actually **catch and handle** exceptions (suppress them or return a different value), use **Around Advice** with a try-catch block.

---

## Real-World Use Cases

In production environments, AfterThrowing can do much more than just logging:

| Use Case | What It Does |
|----------|-------------|
| **Centralized error logging** | Log all exceptions with method context |
| **Alert triggers** | Send alerts to operations team via Slack/PagerDuty |
| **Metrics collection** | Push error counts to monitoring systems (Prometheus, Grafana) |
| **Audit events** | Record failure events for compliance |
| **Error classification** | Categorize errors by type for analysis |

---

## ✅ Key Takeaways

- **AfterThrowing** runs only when a target method **throws an exception**
- Use the `throwing` attribute to capture the exception object
- The `throwing` value must **match** the method parameter name
- AfterThrowing **does NOT swallow** the exception — it still propagates normally
- Use a **broad pointcut** for exception logging since you want to catch errors everywhere
- Log the method name, arguments, exception type, and message for maximum debugging value
- All logs use `ERROR` severity — appropriate since they represent exception scenarios

---

## ⚠️ Common Mistakes

- **Thinking AfterThrowing handles the exception** — it doesn't; the exception still propagates
- **Mismatched `throwing` name** — must exactly match the parameter name in your method
- **Not using ERROR log level** — exception logs should be `error`, not `info` or `debug`
- **Logging too much** — in high-traffic apps, excessive exception logging can fill up disk space

---

## 💡 Pro Tips

- Use AfterThrowing for **observation** and Around Advice for **exception handling**
- Combine AfterThrowing with monitoring tools to create automated alerting pipelines
- In production, consider limiting the stack trace depth logged to avoid enormous log files
- You can have multiple AfterThrowing aspects — one for logging, one for metrics, one for alerts
