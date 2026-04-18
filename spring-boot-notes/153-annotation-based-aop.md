# Annotation-Based AOP — Cleaner, More Readable Aspects

## Introduction

So far, we've been targeting methods using **execution pointcut expressions** — patterns that match methods by their package, name, return type, and parameters. But there's an alternative approach: **annotation-based AOP**. Instead of writing complex expressions, you create a custom annotation and place it on any method you want intercepted. Only annotated methods trigger the Aspect. It's cleaner, more explicit, and gives developers precise control.

---

## Two Approaches to Targeting Methods

### 🔍 Comparison

| Approach | How It Works | Best For |
|----------|-------------|----------|
| **Execution Pointcut** | Pattern-based matching (package, method name, params) | Intercepting **large groups** of methods |
| **Annotation-Based** | Only methods with a specific annotation are intercepted | Intercepting **specific, hand-picked** methods |

### ❓ Why Would You Choose Annotation-Based?

With execution pointcuts like `execution(* com.app..*(..))`, you intercept a **broad set** of methods — potentially every method in a package. That's powerful but sometimes too aggressive.

With annotation-based AOP, developers explicitly **opt-in** by placing the annotation on methods they want intercepted. This is:
- **More readable** — you can see which methods are intercepted just by looking at the annotation
- **More controlled** — nothing gets intercepted by accident
- **Self-documenting** — the annotation name tells you what aspect applies

---

## Implementing Annotation-Based AOP

### Step 1: Create the Custom Annotation

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogAspect {
}
```

Let's break this down:

| Annotation | Purpose |
|------------|---------|
| `@Target(ElementType.METHOD)` | This annotation can only be placed on **methods** (not classes, fields, etc.) |
| `@Retention(RetentionPolicy.RUNTIME)` | The annotation is available at **runtime** (so Spring AOP can read it) |
| `@interface` | Declares this as an **annotation** (not a class or interface) |

### ❓ Why `RUNTIME` Retention?

If you set retention to `SOURCE` or `CLASS`, the annotation information would be discarded before the application runs. Since Spring AOP operates at **runtime** (using proxies), the annotation must be retained at runtime.

---

### Step 2: Use `@annotation` Instead of `execution`

In your Aspect class, replace the `execution` expression with `@annotation`:

```java
@Aspect
@Component
@Slf4j
public class LoggingAndPerformanceAspect {

    // BEFORE (execution-based):
    // @Around("execution(* com.eazybytes.jobportal..*(..))")

    // AFTER (annotation-based):
    @Around("@annotation(com.eazybytes.jobportal.aspects.LogAspect)")
    public Object logAndMeasureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        // ... same aspect logic as before ...
    }
}
```

The key change:
```java
// From this:
"execution(* com.eazybytes.jobportal..*(..))"

// To this:
"@annotation(com.eazybytes.jobportal.aspects.LogAspect)"
```

You must provide the **full package path** to the annotation.

---

### Step 3: Annotate the Methods You Want Intercepted

```java
@RestController
public class CompanyController {

    @LogAspect  // ← This method WILL be intercepted
    @GetMapping("/companies")
    public ResponseEntity<?> getAllCompanies() {
        return companyService.getAllCompanies();
    }

    @GetMapping("/companies/{id}")  // ← This method will NOT be intercepted
    public ResponseEntity<?> getCompanyById(@PathVariable Long id) {
        return companyService.getCompanyById(id);
    }
}
```

Only `getAllCompanies()` has `@LogAspect`, so only it triggers the Aspect. The service method called inside it is **also not intercepted** — because it doesn't have the annotation either.

---

## Seeing the Difference

### 🧪 With Execution Pointcut

When you invoke the companies API, the console shows logs from:
- `CompanyController.getAllCompanies()` ✅
- `CompanyServiceImpl.getAllCompanies()` ✅
- `CrudRepository.findAll()` ✅

Every method in the chain is intercepted.

### 🧪 With Annotation-Based Pointcut

Same API call, but the console shows logs from:
- `CompanyController.getAllCompanies()` ✅

Only the annotated method is logged. The service and repository methods are **not intercepted** because they don't have `@LogAspect`.

---

## Pros and Cons

### ✅ Advantages of Annotation-Based AOP

| Advantage | Why It Matters |
|-----------|---------------|
| **Explicit opt-in** | Developers choose which methods are intercepted |
| **Self-documenting** | Seeing `@LogAspect` on a method tells you logging is applied |
| **Precise control** | No accidental interception of unintended methods |
| **Easy to add/remove** | Just add or remove the annotation |

### ⚠️ Disadvantages

| Disadvantage | Why It Matters |
|-------------|---------------|
| **Manual placement** | You must manually annotate each method |
| **Easy to forget** | New methods don't get intercepted unless annotated |
| **Scattered annotations** | You have to check each file to see which methods are annotated |

---

## When to Use Which Approach

| Scenario | Recommended Approach |
|----------|---------------------|
| Intercept ALL methods in a package | Execution pointcut |
| Intercept only specific methods | Annotation-based |
| Logging across the entire application | Execution pointcut |
| Security checks on specific endpoints | Annotation-based |
| Performance monitoring for critical methods | Annotation-based |
| Transaction management | Execution pointcut |

---

## The Syntax Summary

### Execution-Based

```java
@Around("execution(* com.eazybytes.jobportal..*(..))")
```

### Annotation-Based

```java
@Around("@annotation(com.eazybytes.jobportal.aspects.LogAspect)")
```

Both can be used with ANY advice type — `@Around`, `@Before`, `@After`, `@AfterReturning`, `@AfterThrowing`.

---

## Going Further — Official Documentation

AOP is a vast topic with many advanced features beyond what we've covered. For enterprise scenarios or unique requirements, refer to the **Spring Framework official documentation**:

> **Core Technologies → Aspect Oriented Programming with Spring**

This section covers advanced topics like:
- Multiple pointcut combinations with `&&`, `||`
- Named pointcuts with `@Pointcut`
- Aspect ordering with `@Order`
- Introduction advice

---

## ✅ Key Takeaways

- **Annotation-based AOP** uses a custom annotation to mark which methods should be intercepted
- Create the annotation with `@Target(ElementType.METHOD)` and `@Retention(RetentionPolicy.RUNTIME)`
- In the Aspect, use `@annotation(full.package.AnnotationName)` instead of `execution(...)`
- Only methods **explicitly annotated** will be intercepted — nothing else
- Both approaches work with **all** advice types (Around, Before, After, etc.)
- **Execution pointcuts** are better for broad interception; **annotation-based** is better for selective interception
- For advanced AOP requirements, always refer to the Spring Framework official documentation

---

## ⚠️ Common Mistakes

- **Forgetting `@Retention(RetentionPolicy.RUNTIME)`** — without it, Spring can't see the annotation at runtime and AOP won't work
- **Not providing the full package path** — `@annotation(LogAspect)` won't work; use `@annotation(com.eazybytes.jobportal.aspects.LogAspect)`
- **Expecting sub-method interception** — annotation-based AOP only intercepts the annotated method, not methods called within it

---

## 💡 Pro Tips

- You can create multiple custom annotations for different concerns: `@LogAspect`, `@SecurityCheck`, `@PerformanceMonitor`
- In a team setting, annotation-based AOP is often preferred because it makes interception **visible** to the developer reading the code
- You can combine both approaches — use execution for broad concerns (like exception logging) and annotations for targeted concerns (like performance monitoring of critical methods)
- Consider using `@Pointcut` to define reusable pointcut expressions that can be referenced by multiple advice methods
