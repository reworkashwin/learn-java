# Understanding Transaction Propagation Without Confusion

## Introduction

What happens when a transactional method calls *another* transactional method? Does the second method join the existing transaction? Does it create a new one? Or does it refuse to run?

That's what **transaction propagation** controls. It defines the relationship between transactions when methods call each other. Spring provides seven propagation types, and understanding them is essential for building robust backend applications.

---

## What Is Transaction Propagation?

Transaction propagation answers one question:

> **What should happen if a `@Transactional` method is called when another transaction already exists?**

You configure it using the `propagation` property:

```java
@Transactional(propagation = Propagation.REQUIRED)
public void myMethod() { ... }
```

---

## The Seven Propagation Types

### 1. REQUIRED (Default) — Join or Create

```java
@Transactional(propagation = Propagation.REQUIRED)
```

**Behavior:** If a transaction exists, join it. If not, create a new one.

**Example — Placing an Order:**
```java
@Transactional  // REQUIRED is the default
public void placeOrder() {
    saveOrder();      // Uses the SAME transaction
    saveOrderItems(); // Uses the SAME transaction
}
```

When `placeOrder()` starts, a transaction is created. When `saveOrder()` and `saveOrderItems()` are called, they reuse the same transaction. If *any* method fails, ALL changes are rolled back.

> 💡 This is the default because it's what developers want **90% of the time** — one big transaction wrapping your entire business operation.

---

### 2. SUPPORTS — Use If Available, Otherwise Run Without

```java
@Transactional(propagation = Propagation.SUPPORTS)
```

**Behavior:** If a transaction exists, join it. If not, run without a transaction.

**Use case:** Read-only operations that can work with or without a transaction.

> ❓ "How can a database operation run without a transaction?" — For read operations, you're not committing any changes. There's nothing to rollback. A SELECT query can run perfectly fine without transaction overhead.

---

### 3. MANDATORY — Transaction Must Already Exist

```java
@Transactional(propagation = Propagation.MANDATORY)
```

**Behavior:** A transaction **must** already exist. If not, throw an exception.

**Use case:** Enforcing that certain operations can only be called as part of a larger operation.

**Example:** A `debit()` method should NEVER be called standalone — it must always be part of a `checkout()` flow:

```java
@Transactional(propagation = Propagation.MANDATORY)
public void debit(Long accountId, BigDecimal amount) {
    // If called without an existing transaction → exception thrown!
}
```

---

### 4. REQUIRES_NEW — Always Start Fresh

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
```

**Behavior:** Suspend the current transaction and **always** start a brand new one.

**Use case:** Operations that should succeed regardless of whether the main operation fails.

**Example — Audit Logging:**
```java
@Transactional
public void processPayment() {
    chargeCustomer();  // Main operation
    auditLog();        // Uses REQUIRES_NEW — logged even if payment fails
}

@Transactional(propagation = Propagation.REQUIRES_NEW)
public void auditLog() {
    // Runs in its OWN transaction — committed independently
}
```

Other scenarios: login attempts, failure history, sending notifications.

---

### 5. NOT_SUPPORTED — Always Run Without Transaction

```java
@Transactional(propagation = Propagation.NOT_SUPPORTED)
```

**Behavior:** If a transaction exists, **suspend** it. Always run without a transaction.

**Use case:** Read-heavy operations where you want maximum performance with no locking.

The difference from `SUPPORTS`:
- `SUPPORTS`: Uses transaction if available, skips if not
- `NOT_SUPPORTED`: ALWAYS suspends any existing transaction

> ⚠️ No transaction means no safety net. Never use this for operations that modify data.

---

### 6. NEVER — Reject Transactions

```java
@Transactional(propagation = Propagation.NEVER)
```

**Behavior:** If a transaction exists, **throw an exception**. Never run inside a transaction.

**Use case:** External API calls. If a method makes an HTTP call to an external service while inside a transaction, the transaction stays open waiting for the response — causing long-running locks. `NEVER` prevents this:

```java
@Transactional(propagation = Propagation.NEVER)
public ResponseDto callExternalApi() {
    // If called within a DB transaction → exception thrown!
    // Forces developers to restructure their code properly
}
```

---

### 7. NESTED — Sub-Transactions with Savepoints

```java
@Transactional(propagation = Propagation.NESTED)
```

**Behavior:** Create a **sub-transaction** (savepoint) inside the main transaction.

**Analogy:** Like checkpoints in a video game. If you fail, you restart from the checkpoint, not from the beginning.

```java
@Transactional
public void processItems() {
    processItem1();  // Sub-transaction 1 (savepoint)
    processItem2();  // Sub-transaction 2 (savepoint)
}
```

If `processItem2()` fails, only its changes are rolled back. `processItem1()`'s changes remain intact — **partial rollback**.

---

## Quick Reference Table

| Propagation | Existing TX? | No TX? | Use Case |
|-------------|-------------|--------|----------|
| **REQUIRED** | Join it | Create new | Default business logic |
| **SUPPORTS** | Join it | Run without | Read-only operations |
| **MANDATORY** | Join it | Throw exception | Strict enforcement |
| **REQUIRES_NEW** | Suspend, create new | Create new | Audit logging, notifications |
| **NOT_SUPPORTED** | Suspend it | Run without | Reports, heavy reads |
| **NEVER** | Throw exception | Run without | External API calls |
| **NESTED** | Create savepoint | Create new | Partial rollback scenarios |

---

## ✅ Key Takeaways

- **REQUIRED** is the default and covers 90% of use cases — one transaction for the entire business operation
- **REQUIRES_NEW** is useful for audit logs and notifications that must persist regardless of main operation outcome
- **MANDATORY** enforces that a method can only be called within an existing transaction
- **NEVER** is a safety mechanism to prevent database locks during external API calls
- **NESTED** enables partial rollbacks using savepoints
- Throughout this course, we'll use **REQUIRED** (the default) for all transactions

## ⚠️ Common Mistakes

- Using `REQUIRES_NEW` everywhere "just to be safe" — this creates too many transactions and hurts performance
- Calling external APIs inside a `REQUIRED` transaction — holds the DB connection open unnecessarily
- Confusing `SUPPORTS` with `NOT_SUPPORTED` — one uses existing transactions, the other suspends them

## 💡 Pro Tips

- If you're not sure which propagation to use, stick with `REQUIRED` (the default)
- `REQUIRES_NEW` creates an independent transaction — if the main transaction rolls back, the `REQUIRES_NEW` data stays committed
- `NESTED` requires JDBC savepoint support from your database driver — not all databases support it equally
