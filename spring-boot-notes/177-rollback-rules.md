# Rollback Rules in Spring — Checked vs Runtime Exceptions

## Introduction

The whole purpose of `@Transactional` is to **rollback** when things go wrong. But here's a surprise that catches many developers off guard: Spring does NOT roll back for **all** exceptions. By default, it only rolls back for **runtime (unchecked) exceptions**. Checked exceptions like `IOException`? The transaction commits anyway.

In this lesson, we'll see this behavior in action, understand why it's designed this way, and learn how to customize rollback rules.

---

## The Default Behavior

### 🧠 The Rule

```
Runtime Exception (unchecked) → ROLLBACK ✅
Checked Exception             → COMMIT (no rollback) ❌
Error                         → ROLLBACK ✅
```

From the framework's documentation:

> "By default, a transaction will be rolled back on **RuntimeException** and **Error**, but NOT on checked exceptions (business exceptions)."

### ❓ Why This Design?

The reasoning is:

- **Checked exceptions** (like `IOException`, `SQLException`) are typically *business exceptions* — expected scenarios that your code should handle gracefully. They shouldn't undo database work.
- **Runtime exceptions** (like `NullPointerException`, `IllegalArgumentException`) indicate *bugs* or unexpected failures — the data state is unreliable, so rollback is the safe choice.

---

## Demo: Runtime Exception → Rollback Happens

```java
@Transactional
public boolean closeContactMessage(int id) {
    int updatedRows = contactRepository.updateStatusById("CLOSED", id, ...);
    throw new NullPointerException("Bad day!");  // Runtime exception
}
```

**What happens:**
1. The UPDATE query executes, changing status to "CLOSED"
2. `NullPointerException` is thrown
3. Spring detects a runtime exception → **ROLLBACK**
4. Database still shows status as "NEW" — the update was undone

---

## Demo: Checked Exception → No Rollback

```java
@Transactional
public boolean closeContactMessage(int id) throws IOException {
    int updatedRows = contactRepository.updateStatusById("CLOSED", id, ...);
    throw new IOException("Bad day!");  // Checked exception
}
```

**What happens:**
1. The UPDATE query executes, changing status to "CLOSED"
2. `IOException` is thrown
3. Spring detects a *checked* exception → **COMMIT** (no rollback)
4. Database shows status as "CLOSED" — the update persisted despite the exception!

> ⚠️ This catches many developers by surprise. Just because an exception occurred doesn't mean the transaction rolls back.

---

## Customizing Rollback Behavior

### Roll Back for ALL Exceptions

```java
@Transactional(rollbackFor = Exception.class)
public boolean closeContactMessage(int id) {
    // Now ANY exception (checked or unchecked) triggers rollback
}
```

Since every exception in Java extends `Exception.class`, this catches everything.

### Roll Back for Specific Exceptions

```java
@Transactional(rollbackFor = {IOException.class, SQLException.class})
public boolean processData(int id) {
    // Rollback only for IOException and SQLException
}
```

### Roll Back by Class Name Pattern

```java
@Transactional(rollbackForClassName = "Exception")
public boolean processData(int id) {
    // Rollback for any exception with "Exception" in its name
}
```

### Exclude Specific Exceptions from Rollback

```java
@Transactional(noRollbackFor = SQLException.class)
public boolean processData(int id) {
    // Rollback for runtime exceptions EXCEPT SQLException
}
```

---

## Summary of Rollback Properties

| Property | Purpose | Example |
|----------|---------|---------|
| `rollbackFor` | Roll back for specific exception classes | `rollbackFor = IOException.class` |
| `rollbackForClassName` | Roll back by exception name pattern | `rollbackForClassName = "Exception"` |
| `noRollbackFor` | Skip rollback for specific exceptions | `noRollbackFor = SQLException.class` |
| `noRollbackForClassName` | Skip rollback by name pattern | `noRollbackForClassName = "BusinessException"` |

---

## When to Customize?

In most cases, the **default behavior is fine**:

- Runtime exceptions = bugs → rollback makes sense
- Checked exceptions = expected scenarios → commit makes sense

Only customize when you have specific business requirements, like:

- "Always rollback, even for business exceptions" → `rollbackFor = Exception.class`
- "Don't rollback for this specific SQL error" → `noRollbackFor = SQLException.class`

> 💡 **Pro Tip:** Be very cautious with `rollbackFor = Exception.class`. Even a harmless business exception (like "user not found") will trigger a rollback, which might not be what you want.

---

## ✅ Key Takeaways

- By default, `@Transactional` rolls back only for **runtime exceptions** and **errors**
- **Checked exceptions** (IOException, SQLException) result in a **commit**, not a rollback
- Use `rollbackFor = Exception.class` to roll back for all exception types
- Use `noRollbackFor` to exclude specific exceptions from triggering rollback
- Most applications work fine with the default rollback behavior
- Throughout this course, we'll use plain `@Transactional` without custom rollback rules

## ⚠️ Common Mistakes

- Assuming all exceptions trigger rollback — they don't!
- Using `rollbackFor = Exception.class` everywhere without considering business exceptions
- Not understanding the difference between checked and unchecked exceptions in Java

## 💡 Pro Tips

- If you're building financial or critical data operations, consider using `rollbackFor = Exception.class` for maximum safety
- When debugging unexpected committed data, check if a checked exception occurred — the transaction may have committed despite the error
- You can combine `rollbackFor` and `noRollbackFor` to create nuanced rules for your specific business requirements
