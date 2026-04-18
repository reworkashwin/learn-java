# Common @Transactional Pitfalls You Must Avoid in Production

## Introduction

`@Transactional` is powerful, but it has some sharp edges that can silently break your transaction management. These pitfalls don't throw compile-time errors — your code runs, but transactions quietly don't work as expected. Data corruption in production is never fun.

Let's walk through the four most dangerous pitfalls every Spring Boot developer must know.

---

## Pitfall 1: Internal Method Calls — The Proxy Bypass

### 🧠 The Problem

If you call a `@Transactional` method from **another method inside the same class**, the transaction annotation is **completely ignored**.

```java
@Service
public class UserService {

    @Transactional
    public void createUser() {
        // ... save user
        setupProfile();  // ❌ @Transactional on setupProfile is IGNORED!
    }

    @Transactional
    public void setupProfile() {
        // This runs WITHOUT a separate transaction!
    }
}
```

### ❓ Why Does This Happen?

Spring uses **proxy objects** to implement `@Transactional`. When an external caller (like a controller) invokes `createUser()`, the call goes through the proxy, which adds transaction logic. But when `createUser()` calls `setupProfile()` internally, it uses `this` — which is the actual object, **not the proxy**. The proxy is bypassed entirely.

```
Controller → [Proxy] → createUser()    ✅ Transaction works
                         ↓
               setupProfile()           ❌ Proxy bypassed, no transaction
```

### ✅ The Fix

**Option A:** Move `setupProfile()` to a **separate service class**:

```java
@Service
public class UserService {
    @Autowired
    private ProfileService profileService;

    @Transactional
    public void createUser() {
        // ... save user
        profileService.setupProfile();  // ✅ Goes through proxy
    }
}
```

**Option B:** Combine both methods' logic into a **single method**.

> 💡 **Rule of thumb:** Never rely on `@Transactional` for internal method-to-method calls within the same class.

---

## Pitfall 2: Non-Public Methods — Invisible to the Proxy

### 🧠 The Problem

`@Transactional` on `private`, `protected`, `final`, or `static` methods is **completely ignored**.

```java
@Transactional   // ❌ IGNORED — private method
private void updateBalance() {
    // No transaction management!
}

@Transactional   // ❌ IGNORED — final method
public final void processPayment() {
    // No transaction management!
}
```

### ❓ Why?

Spring's proxy mechanism uses **CGLIB** (Code Generation Library) to create subclasses of your service beans. These subclasses override your methods to add transaction logic. But:

- `private` methods can't be overridden
- `final` methods can't be overridden
- `static` methods belong to the class, not instances

No override = no proxy magic = no transaction.

### ✅ The Fix

Always keep `@Transactional` methods **public** and **non-final**.

```java
@Transactional  // ✅ Works — public method
public void updateBalance() {
    // Transaction management active!
}
```

---

## Pitfall 3: Rollback Rules — Checked Exceptions Don't Rollback

### 🧠 The Problem

By default, `@Transactional` only rolls back for **unchecked (runtime) exceptions**. Checked exceptions like `IOException` or `SQLException` result in a **commit**.

```java
@Transactional
public void processOrder() throws IOException {
    orderRepository.save(order);      // Persisted
    throw new IOException("Oops!");   // ❌ Transaction COMMITS, not rollbacks!
}
```

### ✅ The Fix

If you need rollback for all exceptions:

```java
@Transactional(rollbackFor = Exception.class)
public void processOrder() throws IOException {
    // Now ANY exception triggers rollback
}
```

To exclude specific exceptions:

```java
@Transactional(noRollbackFor = BusinessException.class)
public void processOrder() {
    // Rollback for everything EXCEPT BusinessException
}
```

---

## Pitfall 4: Swallowing Exceptions — Silent Commit

### 🧠 The Problem

If you **catch and swallow** an exception without re-throwing it, Spring never knows an error occurred. No exception reaching the proxy = no rollback.

```java
@Transactional
public void transferMoney() {
    try {
        debit(account1);
        credit(account2);
    } catch (Exception e) {
        log.error("Transfer failed", e);  // Logged but...
        // ❌ Exception swallowed! Transaction COMMITS with partial data!
    }
}
```

The debit succeeded, the credit failed, but because you caught the exception, Spring commits the debit. Money is lost!

### ✅ The Fix

Always **re-throw** the exception (or a new one) after logging:

```java
@Transactional
public void transferMoney() {
    try {
        debit(account1);
        credit(account2);
    } catch (Exception e) {
        log.error("Transfer failed", e);
        throw new RuntimeException("Transfer failed", e);  // ✅ Re-throw!
    }
}
```

You can catch, log, and handle — but you must eventually let an exception propagate out of the method for rollback to work.

---

## Quick Reference — All Four Pitfalls

| Pitfall | What Happens | Fix |
|---------|-------------|-----|
| Internal method calls | Proxy bypassed, no transaction | Move to separate bean |
| Non-public methods | Annotation ignored | Keep methods `public` |
| Checked exceptions | Transaction commits | Use `rollbackFor = Exception.class` |
| Swallowed exceptions | Framework unaware of failure | Re-throw after catch |

---

## ✅ Key Takeaways

- **Never** call a `@Transactional` method from another method in the same class — the proxy is bypassed
- **Always** keep `@Transactional` methods `public` — private/final/static methods won't work
- **Remember** that checked exceptions commit by default — use `rollbackFor` to customize
- **Never swallow exceptions** inside `@Transactional` methods — always re-throw for rollback to work

## ⚠️ Common Mistakes

- Assuming `@Transactional` works on private helper methods — it doesn't
- Catching exceptions inside a transactional method without re-throwing — silently corrupts data
- Not testing transactional behavior — these pitfalls don't throw compile errors, they fail silently

## 💡 Pro Tips

- If you suspect a transaction isn't working, check for internal method calls first — it's the most common cause
- Enable `DEBUG` logging for `org.springframework.transaction` to see when transactions actually start and commit
- Write integration tests that verify rollback behavior — unit tests with mocks won't catch these issues
