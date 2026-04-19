# Update Audit Columns Using Spring Data

## Introduction

In every database table of our Accounts Microservice, we maintain four metadata columns: `created_at`, `created_by`, `updated_at`, and `updated_by`. These columns tell us *when* a record was created or modified, and *by whom*. Until now, we've been manually setting these values in our service layer — and there's even a bug where `updated_at` and `updated_by` aren't being populated during updates.

Here's the thing: since Spring Data JPA already controls all our SQL operations (inserts, updates, deletes, selects), why not hand over the auditing responsibility to the framework too? That's exactly what **JPA Auditing** does — it automatically populates these metadata columns without you writing a single line of manual code.

---

## Concept 1: The Problem with Manual Auditing

### 🧠 What is it?

Manual auditing means you, the developer, explicitly write code like:

```java
customer.setCreatedAt(LocalDateTime.now());
customer.setCreatedBy("ADMIN");
```

### ❓ Why is this a problem?

- It's **repetitive** — you have to write it for every entity, every operation
- It's **error-prone** — easy to forget (like we forgot `updatedAt` and `updatedBy`)
- It's **not DRY** — the same pattern repeated across multiple service classes
- It mixes **infrastructure concerns** with **business logic**

Spring Data JPA already manages all SQL interactions. It makes perfect sense to let it handle auditing too.

---

## Concept 2: Annotating the BaseEntity for Automatic Auditing

### ⚙️ How it works

Go to your `BaseEntity` class (where the four audit columns live) and add these annotations:

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public class BaseEntity {

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedDate
    @Column(insertable = false)
    private LocalDateTime updatedAt;

    @LastModifiedBy
    @Column(insertable = false)
    private String updatedBy;
}
```

| Annotation | Purpose |
|---|---|
| `@CreatedDate` | Automatically sets the timestamp when a record is **first inserted** |
| `@CreatedBy` | Automatically sets *who* created the record |
| `@LastModifiedDate` | Automatically sets the timestamp on every **update** |
| `@LastModifiedBy` | Automatically sets *who* last modified the record |
| `@EntityListeners(AuditingEntityListener.class)` | Tells JPA to listen for entity lifecycle events and trigger auditing |

### 💡 Insight

Spring Data can get the date/time from the system clock. But for `createdBy` and `lastModifiedBy`, it doesn't know *who* is making the change. You need to tell it — that's where `AuditorAware` comes in.

---

## Concept 3: Implementing AuditorAware

### 🧠 What is it?

`AuditorAware` is an interface from Spring Data that you implement to tell the framework: "This is the current user/auditor."

### ⚙️ How it works

Create a class in an `audit` package:

```java
@Component("auditAwareImpl")
public class AuditAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        return Optional.of("ACCOUNTS_MS");
    }
}
```

Right now, we're returning a hardcoded value `"ACCOUNTS_MS"` (MS = microservice). Later, when you integrate Spring Security, you'll replace this with the actual logged-in user or client application name.

### 💡 Insight

The `@Component("auditAwareImpl")` annotation registers this class as a Spring bean with a specific name. That name is important — you'll reference it in the next step.

---

## Concept 4: Enabling JPA Auditing

### ⚙️ How it works

Go to your Spring Boot main class and add the `@EnableJpaAuditing` annotation:

```java
@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditAwareImpl")
public class AccountsApplication {
    public static void main(String[] args) {
        SpringApplication.run(AccountsApplication.class, args);
    }
}
```

The `auditorAwareRef` parameter points to the bean name of your `AuditorAware` implementation. This tells Spring: "Activate JPA auditing, and use this bean to determine the current auditor."

---

## Concept 5: Cleaning Up Manual Code

### ⚙️ How it works

Now that Spring Data handles auditing automatically, **remove the manual code** from your `AccountsServiceImpl`:

Before (manual):
```java
customer.setCreatedAt(LocalDateTime.now());
customer.setCreatedBy("ADMIN");
```

After: **Delete these lines entirely.** Spring Data takes care of it.

This applies to both `create` and `update` operations. Remove all manual audit column assignments.

---

## Concept 6: The Complete Audit Flow

Here's how it all fits together:

1. `@EnableJpaAuditing` activates the auditing feature
2. `auditorAwareRef` links to your `AuditorAware` bean for "who" information
3. `@EntityListeners(AuditingEntityListener.class)` on `BaseEntity` tells JPA to intercept entity lifecycle events
4. `@CreatedDate` / `@CreatedBy` fire on **insert**
5. `@LastModifiedDate` / `@LastModifiedBy` fire on **update**
6. Date/time comes from the system clock; the auditor comes from your `AuditorAware` implementation

### 🧪 Example — Testing

**Create a customer** → Check database:
- `created_by` = `ACCOUNTS_MS` ✅
- `created_at` = current timestamp ✅

**Update the account** → Check database:
- `updated_by` = `ACCOUNTS_MS` ✅
- `updated_at` = current timestamp ✅

No manual code needed. Both `Customer` and `Account` tables get audited automatically because they both extend `BaseEntity`.

---

## ✅ Key Takeaways

- Spring Data JPA supports automatic auditing of `createdAt`, `createdBy`, `updatedAt`, `updatedBy`
- Use `@CreatedDate`, `@CreatedBy`, `@LastModifiedDate`, `@LastModifiedBy` on your entity fields
- Implement `AuditorAware<String>` to tell the framework who the current user is
- Add `@EntityListeners(AuditingEntityListener.class)` on the base entity
- Enable the feature with `@EnableJpaAuditing(auditorAwareRef = "beanName")` on your main class
- Remove all manual audit code from your service layer

## ⚠️ Common Mistakes

- Forgetting `@EnableJpaAuditing` — the annotations on entities do nothing without it
- Not implementing `AuditorAware` — `@CreatedBy` and `@LastModifiedBy` won't work
- Forgetting `@EntityListeners(AuditingEntityListener.class)` on the entity — no lifecycle events will be intercepted
- Misspelling the `auditorAwareRef` bean name — must match exactly

## 💡 Pro Tips

- The hardcoded `"ACCOUNTS_MS"` is a placeholder — replace it with `SecurityContextHolder.getContext().getAuthentication().getName()` once you integrate Spring Security
- Since `BaseEntity` is a `@MappedSuperclass`, all entities extending it inherit auditing automatically
- This pattern scales beautifully — add more microservices, and each one gets auditing for free
