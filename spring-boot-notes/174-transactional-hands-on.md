# Hands-On — Using @Transactional in a Production-Style Backend

## Introduction

In the previous lesson, we learned the theory behind `@Transactional`. Now it's time to see it in action. We'll explore how Spring Data JPA implements transactions internally, then apply `@Transactional` to our own service layer classes following production best practices.

The goal? Understand the strategy, see the framework internals, and apply the pattern confidently to any Spring Boot project.

---

## Peeking Inside Spring Data JPA — SimpleJpaRepository

### 🧠 Where Does the Magic Happen?

Every repository interface you create (extending `JpaRepository`) is backed by a class called `SimpleJpaRepository`. This is where Spring Data JPA implements all the built-in methods like `findAll()`, `save()`, and `delete()`.

### ⚙️ How It's Structured

```java
@Transactional(readOnly = true)  // Class-level: all methods default to read-only
public class SimpleJpaRepository<T, ID> implements JpaRepository<T, ID> {

    // READ methods — inherit readOnly = true from class level
    public List<T> findAll() { ... }
    public Optional<T> findById(ID id) { ... }

    // WRITE methods — override with plain @Transactional
    @Transactional
    public <S extends T> S save(S entity) { ... }

    @Transactional
    public void delete(T entity) { ... }
}
```

Notice the pattern:
1. **Class level:** `@Transactional(readOnly = true)` — safe default for all methods
2. **Write methods:** Override with plain `@Transactional` — removes the read-only restriction

This is exactly the same pattern we'll use in our own service classes!

### 💡 Insight — Transaction Reuse

When your service method calls `findAll()` on the repository, and your service method already has a transaction running, the repository method **reuses** the existing transaction. It doesn't create a new one. This is the default `REQUIRED` propagation behavior.

---

## Applying @Transactional to CompanyServiceImpl

### Step 1: Add Class-Level @Transactional

```java
@Service
@Transactional(readOnly = true)  // Import from org.springframework.transaction.annotation
public class CompanyServiceImpl implements ICompanyService {
    // ...
}
```

With this single annotation, every public method in this class gets a read-only transaction by default.

### Step 2: Review Each Method

Go through every public method and ask: *Does this method modify data?*

For `CompanyServiceImpl`, all methods were performing read operations (fetching companies with their jobs). No overrides needed — the class-level `readOnly = true` covers everything.

> ⚠️ **Important:** `@Transactional` only applies to **public** methods. Private methods do NOT get transaction management. We'll explore why in a later lesson on pitfalls.

---

## Applying @Transactional to ContactServiceImpl

This class has both read and write operations, making it a perfect real-world example.

### Step 1: Class-Level Read-Only

```java
@Service
@Transactional(readOnly = true)
public class ContactServiceImpl implements IContactService {
    // ...
}
```

### Step 2: Identify Write Methods and Override

```java
@Transactional  // Override: this creates a new record
public boolean saveContact(ContactDto contactDto) {
    // ... saves to database
}

// No override needed — read-only (inherits class config)
public Page<Contact> fetchNewContactMessages(...) { ... }

// No override needed — read-only
public Contact getContactById(int id) { ... }

@Transactional  // Override: this updates a record
public boolean closeContactMessage(int id) {
    // ... updates status in database
}
```

### The Decision Tree

For each public method, ask yourself:

```
Does this method modify data (INSERT/UPDATE/DELETE)?
  ├── YES → Add @Transactional (without readOnly)
  └── NO  → Let it inherit the class-level readOnly = true
```

---

## Testing After Changes

After applying `@Transactional` annotations:

1. **Build and restart** the application
2. **Test read operations** — Homepage showing companies with jobs ✅
3. **Test write operations** — Admin closing a contact message ✅

If everything works, your transaction configuration is correct.

---

## The Production Strategy — Summary

Here's the strategy you should follow for every service class:

```
1. Add @Transactional(readOnly = true) on the SERVICE CLASS
2. For each public method:
   - READ only?  → No annotation needed (inherits class default)
   - WRITE data? → Add @Transactional (overrides readOnly)
3. Don't add @Transactional on repository interfaces
   (the service-layer transaction already covers repository calls)
```

### Why Not on the Repository?

When your service method has `@Transactional`, a transaction is already running by the time repository methods are called. Repository methods simply join the existing transaction. Adding `@Transactional` on repositories is redundant in most cases.

---

## ✅ Key Takeaways

- `SimpleJpaRepository` uses `@Transactional(readOnly = true)` on the class and overrides with plain `@Transactional` on write methods — follow this exact pattern
- Always start with `@Transactional(readOnly = true)` on your service class
- Override with plain `@Transactional` only on methods that modify data
- Repository methods reuse the transaction started by the service layer
- Always import from `org.springframework.transaction.annotation.Transactional`
- Private methods are NOT covered by `@Transactional` — only public methods

## ⚠️ Common Mistakes

- Forgetting to add `@Transactional` on write methods when the class has `readOnly = true` — this will cause runtime exceptions
- Adding `@Transactional` on both the service and repository layers — redundant and confusing
- Using `@Transactional` from `javax.transaction` instead of `org.springframework.transaction.annotation`

## 💡 Pro Tips

- After adding `@Transactional`, always test both your read and write operations
- If something breaks after adding `readOnly = true`, check if you forgot to override a write method
- The "million dollar question" — what advantages does `readOnly = true` actually bring? That's covered in the next lesson!
