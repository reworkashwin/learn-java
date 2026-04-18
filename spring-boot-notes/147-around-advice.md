# Mastering Around Advice — Full Control Over Method Execution

## Introduction

Among all the Advice types in Spring AOP, **Around Advice** is the most powerful. It wraps the target method execution completely — you can run logic **before** the method, **after** the method, and even decide whether to execute the target method **at all**. In this section, we'll understand all the Advice types and then deep-dive into implementing Around Advice with a real logging and performance monitoring aspect.

---

## The Five Advice Types

Before focusing on Around, let's understand all available Advice types:

| Advice Type | Annotation | When It Runs |
|-------------|-----------|-------------|
| **Before** | `@Before` | Before the target method starts |
| **After** | `@After` | After the target method finishes (regardless of success or failure) |
| **AfterReturning** | `@AfterReturning` | Only after the target method returns **successfully** |
| **AfterThrowing** | `@AfterThrowing` | Only when the target method **throws an exception** |
| **Around** | `@Around` | Wraps the method — runs both before AND after |

### 💡 The Key Difference

- `@After` runs no matter what — success or exception
- `@AfterReturning` runs ONLY on success
- `@AfterThrowing` runs ONLY when there's an exception
- `@Around` gives you **full control** — you decide everything

---

## Setting Up for AOP

### ⚙️ Do You Need to Add AOP Dependencies?

If you're using Spring Boot with **Spring Data JPA**, you already have AOP in your classpath! Here's why:

```
spring-boot-starter-data-jpa
  └── spring-data-jpa
        └── spring-aspects  ← AOP is already here!
```

Spring Data JPA itself uses AOP behind the scenes. Remember those repository interfaces where you define method names like `findRoleByName()` and magically get SQL execution without writing implementation? That's AOP at work — a proxy intercepts your method call, generates the SQL, executes it, and returns the result.

> 💡 Anytime there's "magic" happening in Spring Boot, you can assume AOP is involved.

If you're NOT using Spring Data JPA, you'd need to add the AOP starter dependency manually.

---

## Creating Your First Aspect

### Step 1: Create the Aspects Package

Create a new package called `aspects` — this is where all your AOP logic will live.

### Step 2: Define the Aspect Class

```java
@Aspect
@Component
@Slf4j
public class LoggingAndPerformanceAspect {
    // Aspect logic goes here
}
```

Three annotations are needed:
- `@Aspect` — tells Spring this class contains Aspect logic
- `@Component` — registers it as a Spring bean (so Spring manages it)
- `@Slf4j` — gives us a logger

---

## Understanding `ProceedingJoinPoint`

When using **Around Advice**, your aspect method must accept a `ProceedingJoinPoint` as input. This is your handle to control the target method execution.

### ❓ Why Is It Called "Proceeding"?

Because it exposes the `proceed()` method — which is how you tell Spring to **go ahead and execute** the actual target method. Without calling `proceed()`, the target method **never runs**.

### What Can You Do With `ProceedingJoinPoint`?

| Method | What It Does |
|--------|-------------|
| `joinPoint.proceed()` | Execute the actual target method |
| `joinPoint.getSignature().toShortString()` | Get the method name being intercepted |
| `joinPoint.getArgs()` | Get the input arguments passed to the target method |

---

## The Around Advice Logic — Step by Step

Here's the complete aspect method:

```java
@Around("execution(* com.eazybytes.jobportal..*(..))")
public Object logAndMeasureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
    // BEFORE — capture start time
    long startTime = System.currentTimeMillis();
    String methodName = joinPoint.getSignature().toShortString();
    Object[] args = joinPoint.getArgs();

    log.info("Entering method: {}", methodName);
    log.info("Arguments: {}", Arrays.toString(args));

    // EXECUTE the actual target method
    Object result = joinPoint.proceed();

    // AFTER — calculate execution time
    long executionTime = System.currentTimeMillis() - startTime;
    log.info("Execution time: {} ms", executionTime);
    log.info("Method executed successfully: {}", methodName);

    // RETURN the result (critical!)
    return result;
}
```

Let's walk through each part:

### 🕐 Before the Method (Aspect Logic 1)

1. **Capture start time** — `System.currentTimeMillis()` gives us the current timestamp
2. **Get method name** — `getSignature().toShortString()` tells us which method is being intercepted
3. **Get arguments** — `getArgs()` returns an `Object[]` because we don't know the argument types at compile time
4. **Log the entry** — record that we're entering the method

### ▶️ Execute the Actual Method

```java
Object result = joinPoint.proceed();
```

This single line is **critical**. It tells the proxy to call the actual business method. The return type is `Object` because we can't predict what the target method returns — it could be a `String`, a `List<Company>`, `void`, anything.

### 🕐 After the Method (Aspect Logic 2)

1. **Calculate execution time** — subtract start time from current time
2. **Log the performance data** — how long the method took in milliseconds
3. **Log successful completion** — confirms the method finished

### ↩️ Return the Result

```java
return result;
```

This is **absolutely critical**. If you don't return the result from your aspect method, the original caller will get `null` instead of the actual response. This would break your entire application.

---

## Why Use `Object` Everywhere?

You'll notice we use `Object` for both arguments and return values. Why?

- Arguments could be `int`, `String`, `Person`, `List<Job>` — we can't predict
- Return values could be `String`, `ResponseEntity`, `void`, `List<Company>` — we can't predict
- Using `Object` makes our Aspect **reusable** across ALL methods

---

## The Power of Around Advice

Around Advice gives you unique capabilities that other advice types don't:

1. **Suppress the target method** — if a condition isn't met, don't call `proceed()` and the method never runs
2. **Modify the result** — you can change what the method returns
3. **Handle exceptions** — wrap `proceed()` in try/catch for custom error handling
4. **Measure performance** — since you control before AND after, you can time the execution

---

## ✅ Key Takeaways

- **Around Advice** is the most powerful Advice type — it wraps the entire method execution
- You MUST accept `ProceedingJoinPoint` as input when using `@Around`
- Call `joinPoint.proceed()` to execute the actual target method
- Always **return the result** from your aspect method — otherwise callers get `null`
- Use `Object` for arguments and results since you can't predict types at compile time
- Around Advice can **suppress** method execution by not calling `proceed()`
- The Aspect class needs `@Aspect`, `@Component`, and optionally `@Slf4j`

---

## ⚠️ Common Mistakes

- **Forgetting to call `proceed()`** — the target method will never execute
- **Not returning the result** — callers will get `null` and your app breaks
- **Not accepting `ProceedingJoinPoint`** — you won't be able to invoke the target method
- **Logging sensitive arguments** — passwords, SSNs, tokens should never be logged

---

## 💡 Pro Tips

- Be cautious about logging method arguments in production — they may contain sensitive data like passwords or personal information
- Around Advice is perfect for **performance monitoring** because you have access to both the start and end of execution
- If your aspect logic doesn't need to wrap the method (just run before OR after), consider using `@Before` or `@After` instead — they're simpler
