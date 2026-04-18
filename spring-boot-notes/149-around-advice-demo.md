# Hands-On Around Advice — Logging & Performance Use Case

## Introduction

Theory is great, but seeing AOP in action is where it truly clicks. In this section, we take everything we've learned about Aspect, Advice, and Pointcut, and put it together into a working **Around Advice** implementation that handles logging and performance monitoring — all without touching a single line of business logic.

---

## The Pointcut Expression

### ⚙️ Constructing the Execution Pattern

For our logging aspect, we want to intercept **every method** in the application. Here's the pointcut expression:

```java
@Around("execution(* com.eazybytes.jobportal..*(..))")
```

Let's decode each part:

| Part | Meaning |
|------|---------|
| `*` | Any return type |
| `com.eazybytes.jobportal` | The base package |
| `..` | And all its sub-packages |
| `*` | Any method name |
| `(..)` | Any number of parameters |

No modifiers pattern is specified (it's optional), so methods of all access levels are intercepted.

---

## The Complete Aspect Class

```java
@Aspect
@Component
@Slf4j
public class LoggingAndPerformanceAspect {

    @Around("execution(* com.eazybytes.jobportal..*(..))")
    public Object logAndMeasureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().toShortString();
        Object[] args = joinPoint.getArgs();

        log.info("Entering method: {}", methodName);
        log.info("Arguments: {}", Arrays.toString(args));

        Object result = joinPoint.proceed();

        long executionTime = System.currentTimeMillis() - startTime;
        log.info("Execution time: {} ms", executionTime);
        log.info("Method executed successfully: {}", methodName);

        return result;
    }
}
```

---

## Seeing It Work

### 🧪 Testing the Aspect

After starting the application, invoke the public companies REST API from Postman. Here's what appears in the console:

```
Entering method: CompanyController.getAllCompanies()
Arguments: []
Entering method: CompanyServiceImpl.getAllCompanies()
Arguments: []
Entering method: ListCrudRepository.findAll()
Arguments: []
Method executed successfully: CompanyServiceImpl — 272 ms
Method executed successfully: CompanyController.getAllCompanies() — 277 ms
```

### 🧠 What's Happening Behind the Scenes?

1. Client calls the REST API
2. **Proxy intercepts** the controller method → logs "Entering"
3. Controller calls the service method → **Proxy intercepts** again → logs "Entering"
4. Service calls the repository method → **Proxy intercepts** again → logs "Entering"
5. JPA executes the actual database query
6. Results flow back through each layer, logging execution times

Notice how the **entire call chain** is intercepted automatically — controller, service, AND repository — all from a single Aspect class, without adding a single log statement to any business method.

---

## Controlling Log Visibility

### ⚙️ Using Logback Configuration

The aspect uses `log.info()`, so you control visibility through `logback.xml`:

```xml
<logger name="com.eazybytes.jobportal" level="INFO"/>
```

- Set to `INFO` → aspect logs are visible
- Set to `ERROR` → aspect logs are hidden (only errors show)
- Set to `DEBUG` → even more detail if needed

### 💡 The Power of Single-Point Change

Want to change from `info` to `debug`? Change it in **one place** — the Aspect class. With the old approach, you'd have to visit hundreds of methods. This is the real value of AOP.

---

## Important Rules for Around Advice

### ⚠️ Three Things You Must Remember

1. **Accept `ProceedingJoinPoint`** as input — without it, you can't call `proceed()`
2. **Call `joinPoint.proceed()`** — otherwise the target method never executes
3. **Return the result** — whatever `proceed()` returns, your aspect must return it too

### 🛑 What If You Don't Return the Result?

If your aspect method doesn't return the result from `proceed()`, the caller gets `null`. For a REST API, this means the client gets an empty response — your application appears broken even though the method executed successfully.

### 🔇 Suppressing Method Execution

Around Advice is unique because you can choose **not** to call `proceed()`:

```java
if (someConditionFails) {
    // Don't call proceed() — target method never runs
    return someDefaultResponse;
}
Object result = joinPoint.proceed();
return result;
```

This gives you the power to **block** method execution based on custom conditions.

---

## ✅ Key Takeaways

- The pointcut `execution(* com.eazybytes.jobportal..*(..))` intercepts ALL methods in the package and sub-packages
- Around Advice automatically intercepts the entire call chain — controller → service → repository
- Log visibility is controlled through `logback.xml` configuration, not by modifying the Aspect
- A single Aspect class replaces what would be hundreds of manual log statements
- Always return the result from `proceed()` in your Around Advice method
- You can change logging behavior (level, format, content) in ONE place

---

## ⚠️ Common Mistakes

- **Pointcut too broad** — intercepting every method (including framework internals) can cause performance issues or unexpected behavior
- **Not configuring log levels** — if `logback.xml` is set to `ERROR`, your `info` logs won't appear
- **Forgetting `@Component`** — without it, Spring doesn't manage the Aspect bean and AOP won't work

---

## 💡 Pro Tips

- Enable detailed logging only when debugging — keep `ERROR` level for normal operation
- Use `toShortString()` instead of `toLongString()` for cleaner method names in logs
- Performance monitoring via AOP is a common real-world pattern — many enterprise applications use exactly this approach
- You can have multiple `@Around` methods in the same Aspect class, each with different pointcuts
