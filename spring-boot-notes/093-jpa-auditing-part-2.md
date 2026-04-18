# Tracking Who Did What — Spring JPA Auditing (Part 2)

## Introduction

In Part 1, we created a `BaseEntity` to avoid repeating audit fields across entity classes. But we were still **manually** setting `createdAt` and `createdBy` in our service layer code. That's tedious and error-prone. In this lesson, we hand over that responsibility to the **Spring Data JPA Auditing** framework — so the audit fields get populated automatically, without a single line of business logic code.

---

## Concept 1: The Four Steps of JPA Auditing

### 🧠 What is it?

Spring Data JPA Auditing is a feature that **automatically** populates audit fields (`createdAt`, `createdBy`, `updatedAt`, `updatedBy`) whenever a record is inserted or updated. You configure it once, and it works silently behind the scenes for every entity that extends `BaseEntity`.

### ⚙️ The four steps

| Step | What to do |
|------|-----------|
| **Step 1** | Annotate `BaseEntity` fields + add `@EntityListeners(AuditingEntityListener.class)` |
| **Step 2** | Make all entities extend `BaseEntity` (already done in Part 1) |
| **Step 3** | Create an `AuditorAware` implementation to provide the current user |
| **Step 4** | Enable auditing with `@EnableJpaAuditing` on the main application class |

---

## Concept 2: Step 1 — Annotating the BaseEntity

### 🧠 What is it?

JPA can't guess which field is for "created date" and which is for "last modified by." You need to tell it explicitly using annotations.

### ⚙️ The annotated BaseEntity

```java
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public class BaseEntity {

    @CreatedDate
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedDate
    @UpdateTimestamp
    @Column(insertable = false)
    private LocalDateTime updatedAt;

    @LastModifiedBy
    @Column(insertable = false)
    private String updatedBy;
}
```

### ⚙️ What each annotation does

| Annotation | Purpose |
|-----------|---------|
| `@CreatedDate` + `@CreationTimestamp` | Tells JPA: "Populate this field with the current date/time when a **new record** is created" |
| `@CreatedBy` | Tells JPA: "Populate this field with the **current auditor** when a new record is created" |
| `@LastModifiedDate` + `@UpdateTimestamp` | Tells JPA: "Update this field with the current date/time when a record is **modified**" |
| `@LastModifiedBy` | Tells JPA: "Update this field with the **current auditor** when a record is modified" |
| `@EntityListeners(AuditingEntityListener.class)` | Registers the JPA listener that triggers all this auditing magic |

### ❓ Why don't we need to provide the date/time?

Java can determine the current date and time by calling `LocalDateTime.now()`. The framework handles this automatically. But it **can't** know who the current user is — that's application-specific. That's why we need Step 3.

---

## Concept 3: Step 3 — The AuditorAware Implementation

### 🧠 What is it?

`AuditorAware` is a functional interface with one method — `getCurrentAuditor()`. By implementing it, you tell Spring Data JPA **who is performing the current operation**.

### ⚙️ Implementation

```java
@Component("auditAwareImpl")
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        return Optional.of("AnonymousUser");
    }
}
```

For now, we're hardcoding `"AnonymousUser"` because we haven't implemented security yet. Once Spring Security is integrated, this method will return the **actual logged-in username**.

### ❓ Why is the bean named explicitly?

We give the bean a specific name (`"auditAwareImpl"`) because we'll reference it by name in Step 4. This makes the connection clear and explicit.

---

## Concept 4: Step 4 — Enabling JPA Auditing

### 🧠 What is it?

The final step is enabling the auditing feature on the main application class using `@EnableJpaAuditing`.

### ⚙️ Implementation

```java
@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditAwareImpl")
public class JobPortalApplication {
    public static void main(String[] args) {
        SpringApplication.run(JobPortalApplication.class, args);
    }
}
```

The `auditorAwareRef` property points to the **bean name** of our `AuditorAwareImpl` component. This tells the framework: *"Whenever you need to know who the current auditor is, call the `getCurrentAuditor()` method from this bean."*

---

## Concept 5: Removing Manual Audit Code

### 🧠 What is it?

Now that the framework handles auditing automatically, you can **remove** all manual code that sets `createdAt`, `createdBy`, `updatedAt`, and `updatedBy` from your service layer.

### 🧪 Before (manual)

```java
// In ContactServiceImpl
contact.setCreatedAt(LocalDateTime.now());
contact.setCreatedBy("Admin");
```

### 🧪 After (automatic)

```java
// Nothing! The framework handles it automatically.
contactRepository.save(contact);
// createdAt and createdBy are populated by JPA Auditing
```

### 🧪 Result in database

| createdAt | createdBy | updatedAt | updatedBy |
|-----------|-----------|-----------|-----------|
| 2025-04-18 10:30:00 | AnonymousUser | null | null |

The `createdAt` is the current timestamp (set by the framework), and `createdBy` is "AnonymousUser" (from our `AuditorAwareImpl`).

---

## Concept 6: The Complete Auditing Flow

### ⚙️ What happens when you save a new record?

```
contactRepository.save(contact)
    ↓
AuditingEntityListener detects INSERT operation
    ↓
Sets createdAt ← LocalDateTime.now()
Sets createdBy ← AuditorAwareImpl.getCurrentAuditor() → "AnonymousUser"
    ↓
Record saved with audit data automatically populated
```

### ⚙️ What happens when you update an existing record?

```
contactRepository.save(existingContact)
    ↓
AuditingEntityListener detects UPDATE operation
    ↓
Sets updatedAt ← LocalDateTime.now()
Sets updatedBy ← AuditorAwareImpl.getCurrentAuditor() → "AnonymousUser"
    ↓
createdAt and createdBy remain UNCHANGED (because updatable = false)
```

---

## ✅ Key Takeaways

1. **Spring Data JPA Auditing** automatically populates audit fields — no manual code needed
2. Four annotations mark the audit fields: `@CreatedDate`, `@CreatedBy`, `@LastModifiedDate`, `@LastModifiedBy`
3. `@EntityListeners(AuditingEntityListener.class)` on `BaseEntity` activates the listener
4. Implement `AuditorAware<String>` to tell the framework **who** the current user is
5. `@EnableJpaAuditing(auditorAwareRef = "beanName")` on the main class enables the feature
6. Date/time fields are handled automatically; only the **auditor** needs your implementation
7. Once security is added, update `AuditorAwareImpl` to return the actual logged-in user

## ⚠️ Common Mistakes

- Forgetting `@EntityListeners(AuditingEntityListener.class)` on `BaseEntity` — auditing won't trigger
- Forgetting `@EnableJpaAuditing` on the main class — auditing won't be enabled
- Not providing `auditorAwareRef` — the framework won't know who the auditor is
- Forgetting `@Column(updatable = false)` on created fields — they get overwritten on updates
- Leaving manual audit code in the service layer — it conflicts with automatic auditing

## 💡 Pro Tips

- Every new entity should extend `BaseEntity` — make this your **default pattern**
- When implementing Spring Security later, update `AuditorAwareImpl` to use `SecurityContextHolder.getContext().getAuthentication().getName()`
- You can test auditing by checking database records after each INSERT and UPDATE
- The `AuditingEntityListener` runs inside the same transaction — if the save fails, audit changes are rolled back too
