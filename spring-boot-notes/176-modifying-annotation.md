# Why @Modifying is Mandatory for Update/Delete Queries

## Introduction

So far we've focused on reading data with `@Transactional(readOnly = true)`. But what about when you need to **update** or **delete** records using your own custom queries? Spring Data JPA has a rule you must follow: you need both `@Transactional` and `@Modifying`. Skip either one, and your query will fail.

In this lesson, we'll build a real update query, see what happens without `@Modifying`, understand why the framework requires it, and explore its advanced configurations.

---

## The Problem — Two Queries for One Update

Remember our `closeContactMessage()` method?

```java
Contact contact = contactRepository.findById(id);  // SELECT query
contact.setStatus("CLOSED");
contactRepository.save(contact);                    // UPDATE query
```

**Two SQL queries** just to update one column. The better approach: execute a **single UPDATE statement** directly.

---

## Building a Custom Update Query

### Step 1: Define the Repository Method

```java
public interface ContactRepository extends JpaRepository<Contact, Integer> {

    int updateStatusById(String status, int id, String updatedBy);
}
```

The return type `int` tells you how many records were affected by the update.

### Step 2: Create the Named Query

Inside the `Contact` entity class:

```java
@NamedQueries({
    @NamedQuery(
        name = "Contact.updateStatusById",
        query = "UPDATE Contact c SET c.status = :status, " +
                "c.updatedAt = CURRENT_TIMESTAMP, " +
                "c.updatedBy = :updatedBy " +
                "WHERE c.id = :id"
    )
})
@Entity
public class Contact { ... }
```

### ❓ Why Update Audit Columns Manually?

You might ask: "Doesn't Spring Data JPA auditing handle `updatedAt` and `updatedBy` automatically?"

Yes, but **only when using framework methods** like `save()`. When you write a custom query with `@Query` or `@NamedQuery`, you're telling the framework "execute this query as-is." The auditing mechanism can't intercept custom queries. So it's your responsibility to update audit columns.

### Step 3: Update the Service Method

```java
@Transactional
public boolean closeContactMessage(int id) {
    int updatedRows = contactRepository.updateStatusById(
        "CLOSED", id, ApplicationUtility.getLoggedInUser()
    );
    return updatedRows > 0;
}
```

Clean, efficient — one SQL statement, one method call.

---

## What Happens Without @Modifying?

If you try to run this without `@Modifying` on the repository method, you'll get an error:

```
InvalidDataAccessApiUsageException: 
The query executed via getResultSet or getSingleResult must be a SELECT query
```

### 🧠 Why This Error?

By default, Spring Data JPA **assumes every query is a SELECT query**. It tries to execute your UPDATE statement as if it were a SELECT and fails because there's no result set to return.

You need to explicitly tell the framework: "This query modifies data."

---

## Adding @Modifying — The Fix

```java
public interface ContactRepository extends JpaRepository<Contact, Integer> {

    @Modifying
    int updateStatusById(String status, int id, String updatedBy);
}
```

With `@Modifying`, the framework knows to execute the query as a data modification operation, not a select.

---

## @Modifying Properties — Advanced Configurations

### flushAutomatically (default: false)

```java
@Modifying(flushAutomatically = true)
```

**What it does:** Before executing your modifying query, flushes all pending changes from the Hibernate persistent context to the database.

**When to use:** When you've made changes to entities via setter methods earlier in the same transaction, and you need those changes committed to the database *before* your custom query runs — so the query operates on the latest data.

### clearAutomatically (default: false)

```java
@Modifying(clearAutomatically = true)
```

**What it does:** After executing your modifying query, clears the Hibernate persistent context. This forces Hibernate to reload fresh data from the database on the next read.

**When to use:** When your custom query updates data that entities in the persistent context might still hold stale copies of. Clearing ensures subsequent reads reflect the latest database state.

### 💡 Understanding the Persistent Context

Think of the persistent context as Hibernate's "working memory":

- It stores entity snapshots, cached data, and tracked changes
- Similar to how Spring Security has a SecurityContext, Hibernate has the **Persistent Context**
- `flushAutomatically` = "save my working memory to the database before running my query"
- `clearAutomatically` = "forget everything in working memory after my query runs"

> In most scenarios, you don't need either property. Plain `@Modifying` is enough. Use them only when dealing with complex multi-step operations within a single transaction.

---

## The Complete Pattern

```java
// Repository
public interface ContactRepository extends JpaRepository<Contact, Integer> {

    @Modifying
    int updateStatusById(String status, int id, String updatedBy);
}

// Service
@Service
@Transactional(readOnly = true)
public class ContactServiceImpl implements IContactService {

    @Transactional  // Override readOnly for write operation
    public boolean closeContactMessage(int id) {
        int updatedRows = contactRepository.updateStatusById(
            "CLOSED", id, ApplicationUtility.getLoggedInUser()
        );
        return updatedRows > 0;
    }
}
```

---

## When Do You Need @Modifying?

| Scenario | @Modifying Needed? |
|----------|-------------------|
| Using `save()`, `deleteById()` from JPA | ❌ No — framework handles it |
| Custom `@Query` with SELECT | ❌ No |
| Custom `@Query` with UPDATE | ✅ Yes |
| Custom `@Query` with DELETE | ✅ Yes |
| Custom `@Query` with INSERT | ✅ Yes |
| Derived query methods (find/read) | ❌ No |

---

## ✅ Key Takeaways

- `@Modifying` tells Spring Data JPA that your custom query **modifies data** (UPDATE/DELETE/INSERT)
- Without it, the framework treats every query as a SELECT and throws an exception
- Always pair `@Modifying` (on the repository method) with `@Transactional` (on the service method)
- `flushAutomatically = true` — flush pending changes to DB before your query runs
- `clearAutomatically = true` — clear persistent context after your query runs
- You do NOT need `@Modifying` when using framework-provided methods like `save()` or `deleteById()`

## ⚠️ Common Mistakes

- Forgetting `@Modifying` on custom update/delete queries — results in `InvalidDataAccessApiUsageException`
- Using `@Modifying` without `@Transactional` — the write operation won't have transaction support
- Forgetting to update audit columns (`updatedAt`, `updatedBy`) in custom queries — auditing doesn't apply to custom queries

## 💡 Pro Tips

- Custom update queries are more efficient than `findById()` + `save()` because they execute a single SQL statement instead of two
- The `int` return type from modifying queries tells you exactly how many rows were affected — use it for validation
- For most CRUD operations, `flushAutomatically` and `clearAutomatically` can stay at their defaults (false)
