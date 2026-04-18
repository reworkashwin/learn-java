# Before Advice Demo — Executing Logic Before Business Methods

## Introduction

While Around Advice gives you full control by wrapping the method, sometimes you only need to run logic **before** a method executes. That's where **Before Advice** shines. It's simpler, cleaner, and perfect for scenarios like **input validation**, **security checks**, and **preconditions**. In this section, we'll implement a real-world example — moving registration validation logic out of the controller and into an Aspect.

---

## The Problem — Cluttered Business Methods

### 🧠 What Does the Controller Look Like Now?

Look at the `registerUser()` method in `AuthController`:

```java
public ResponseEntity<?> registerUser(RegisterRequestDto request) {
    // Validation 1: Check if password is compromised
    if (compromisedPasswordChecker.check(request.getPassword())) {
        return ResponseEntity.badRequest().body("Weak password");
    }

    // Validation 2: Check if user already exists
    if (userRepository.existsByEmailOrMobile(request.getEmail(), request.getMobile())) {
        return ResponseEntity.badRequest().body("User already exists");
    }

    // ACTUAL BUSINESS LOGIC — save the user
    userRepository.save(user);
    return ResponseEntity.ok("Registration successful");
}
```

We have just **two** validations here, but in real enterprise applications, you might have **10 different validations**. All of that validation code makes the business method cluttered and hard to read.

### ❓ Why Move This to an Aspect?

- Validation is a **cross-cutting concern** — it's not the actual business logic
- The method should focus on **what it does** (register a user), not **what it checks first**
- If validation rules change, you modify the Aspect — not the controller

---

## Implementing Before Advice

### Step 1: Create the Aspect Class

```java
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RegisterValidationAspect {

    private final CompromisedPasswordChecker compromisedPasswordChecker;
    private final JobPortalUserRepository jobPortalUserRepository;
}
```

Notice we inject dependencies using `@RequiredArgsConstructor` — Aspects are Spring beans, so they support dependency injection just like any other component.

### Step 2: Define the Before Advice Method

```java
@Before("""
    execution(* com.eazybytes.jobportal.controller.AuthController.registerUser(..))
    """)
public void validateBeforeRequest(JoinPoint joinPoint) {
    Object[] args = joinPoint.getArgs();
    RegisterRequestDto request = (RegisterRequestDto) args[0];

    log.info("Validating user registration request");
    Map<String, String> errors = new HashMap<>();

    // Validation 1: Password strength
    if (compromisedPasswordChecker.check(request.getPassword()).isCompromised()) {
        errors.put("password", "Choose a stronger password");
    }

    // Validation 2: Existing user check
    if (jobPortalUserRepository.existsByEmailOrMobile(...)) {
        errors.put("user", "Email or mobile already registered");
    }

    if (!errors.isEmpty()) {
        log.warn("Registration validation failed: {}", errors);
        throw new RegistrationValidationException(errors);
    }

    log.info("Registration validation passed");
}
```

---

## Key Differences from Around Advice

### 🔍 Before Advice vs Around Advice

| Feature | Before Advice | Around Advice |
|---------|--------------|---------------|
| Input parameter | `JoinPoint` | `ProceedingJoinPoint` |
| Can execute target method? | No — it runs automatically after | Yes — you call `proceed()` |
| Can return a value? | No | Yes — you return the result |
| Can stop target method? | Only by throwing an exception | By not calling `proceed()` |
| Receives target method result? | No | Yes |

### 💡 The Critical Point

With Before Advice, your method returns `void`. You **cannot** return anything to the target method. You can only:
1. Execute some logic
2. Optionally **throw an exception** to stop the target method

---

## Stopping Method Execution from Before Advice

### ⚠️ The Only Way: Throw an Exception

Unlike Around Advice (where you simply skip `proceed()`), Before Advice automatically proceeds to the target method after it finishes. The **only way** to prevent the target method from executing is to **throw an exception**.

```java
if (!errors.isEmpty()) {
    throw new RegistrationValidationException(errors);
}
// If no exception, target method runs automatically
```

### Creating the Custom Exception

```java
public class RegistrationValidationException extends RuntimeException {
    @Getter
    private final Map<String, String> errors;

    public RegistrationValidationException(Map<String, String> errors) {
        this.errors = errors;
    }
}
```

### Handling the Exception Globally

```java
@ExceptionHandler(RegistrationValidationException.class)
public ResponseEntity<Map<String, String>> handleValidationException(
        RegistrationValidationException ex) {
    return ResponseEntity.badRequest().body(ex.getErrors());
}
```

This ensures clients get a proper `400 Bad Request` with error details, instead of a generic `500 Internal Server Error`.

---

## The Cleaned-Up Controller

After moving validations to the Aspect, the controller becomes beautifully simple:

```java
public ResponseEntity<?> registerUser(RegisterRequestDto request) {
    // JUST the business logic — no validation clutter
    userRepository.save(user);
    return ResponseEntity.ok("Registration successful");
}
```

All the validation happens **automatically** before this method runs, thanks to AOP.

---

## Reading Method Arguments in Before Advice

### ⚙️ How to Access Input Parameters

```java
Object[] args = joinPoint.getArgs();
RegisterRequestDto request = (RegisterRequestDto) args[0];
```

- `getArgs()` returns all arguments as an `Object[]`
- You cast to the expected type to work with the data
- Since this pointcut targets a **specific method**, we know the first argument is `RegisterRequestDto`

---

## Perfect Use Cases for Before Advice

| Use Case | Example |
|----------|---------|
| **Input validation** | Check password strength, required fields |
| **Security checks** | Verify IP address, country, user role |
| **Preconditions** | Ensure feature flags are enabled |
| **Blocking requests** | Reject requests from banned IPs |
| **Rate limiting** | Check if user has exceeded request limits |

---

## ✅ Key Takeaways

- Before Advice runs **before** the target method and doesn't return anything
- Use `JoinPoint` (not `ProceedingJoinPoint`) — you don't control method execution
- The **only way to stop** a target method from Before Advice is to **throw an exception**
- Always handle thrown exceptions in a `@ExceptionHandler` so clients get proper responses
- Before Advice is perfect for **validation, security checks, and preconditions**
- After moving validation to an Aspect, your business methods become clean and focused
- Aspects support **dependency injection** — you can inject repositories, services, etc.

---

## ⚠️ Common Mistakes

- **Not handling the exception globally** — if you throw from Before Advice without a handler, clients get a generic 500 error
- **Trying to return values from Before Advice** — it's void; use Around if you need to return something
- **Using Before when Around is needed** — if you need access to the method result, Before won't work

---

## 💡 Pro Tips

- Use Java **text blocks** (`"""..."""`) for multi-line execution pointcut expressions — they're much more readable
- Target specific methods when the Aspect logic is method-specific (like our registration validation)
- Keep your custom exceptions **descriptive** — include details that help the client understand what went wrong
