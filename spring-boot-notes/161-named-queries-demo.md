# Demo of `@NamedQuery` and `@NamedNativeQuery`

## Introduction

We've learned the theory behind `@NamedQuery` and `@NamedNativeQuery`. Now let's implement them step by step in our Company entity, wire them to our repository, and verify everything works — including confirming that JPQL-based named queries keep the N+1 problem at bay.

---

## Step 1: Define `@NamedQueries` on the Entity

### ⚙️ Adding the JPQL Named Query

On top of the `Company` entity class, add `@NamedQueries`:

```java
@Entity
@NamedQueries({
    @NamedQuery(
        name = "Company.fetchCompaniesWithJobsByStatus",
        query = "SELECT DISTINCT c FROM Company c JOIN FETCH c.jobs j WHERE j.status = :status"
    )
})
public class Company {
    // ... existing fields
}
```

The query itself is the **same JPQL** we used with inline `@Query`. We're just moving it from the repository to the entity.

### 🔍 Breaking Down the Name

```
Company.fetchCompaniesWithJobsByStatus
   ↑              ↑
Entity name    Method name in repository
```

By following this convention, Spring Data JPA will automatically match this query to a repository method named `fetchCompaniesWithJobsByStatus`.

---

## Step 2: Define `@NamedNativeQueries` on the Entity

### ⚙️ Adding the Native SQL Named Query

Below the `@NamedQueries`, add `@NamedNativeQueries`:

```java
@Entity
@NamedQueries({
    @NamedQuery(
        name = "Company.fetchCompaniesWithJobsByStatus",
        query = "SELECT DISTINCT c FROM Company c JOIN FETCH c.jobs j WHERE j.status = :status"
    )
})
@NamedNativeQueries({
    @NamedNativeQuery(
        name = "Company.fetchCompaniesWithJobsByStatusNative",
        query = "SELECT DISTINCT c.* FROM companies c " +
                "JOIN jobs j ON c.id = j.company_id " +
                "WHERE j.status = :status",
        resultClass = Company.class
    )
})
public class Company {
    // ...
}
```

Remember: `resultClass = Company.class` is **mandatory** for `@NamedNativeQuery` because native SQL doesn't know about JPA entities.

---

## Step 3: Create Repository Methods

### ⚙️ The JPQL Named Query Method

```java
public interface CompanyRepository extends JpaRepository<Company, Long> {
    
    // Matches "Company.fetchCompaniesWithJobsByStatus" — no @Query needed!
    List<Company> fetchCompaniesWithJobsByStatus(@Param("status") String status);
    
    // Matches "Company.fetchCompaniesWithJobsByStatusNative"
    List<Company> fetchCompaniesWithJobsByStatusNative(@Param("status") String status);
}
```

Since the method names match the names defined in the entity annotations (after `Company.`), **no `@Query` annotation is required** on these methods. Spring Data JPA finds the matching named query automatically.

### 💡 How the Matching Works

```
Entity:     @NamedQuery(name = "Company.fetchCompaniesWithJobsByStatus", ...)
                                         ↕ (automatic match)
Repository: List<Company> fetchCompaniesWithJobsByStatus(...)
```

---

## Step 4: Wire It Up in the Service

### ⚙️ Using the Named Query Method

In `CompanyServiceImpl`, invoke the JPQL named query method:

```java
companyRepository.fetchCompaniesWithJobsByStatus(ApplicationConstants.ACTIVE_STATUS);
```

---

## Step 5: Test and Verify

### 🧪 Testing the JPQL Named Query

From Postman, invoke the REST API:

- Search for `CLOSED` status in response → **No results** ✅
- Search for `ACTIVE` status in response → **998 matches** ✅
- Console logs show a **single SQL query** for both companies and jobs ✅
- **No N+1 problem** — `JOIN FETCH` is doing its job ✅

### 🧪 What About the Native Named Query?

If you switch to the native query method (`fetchCompaniesWithJobsByStatusNative`):

- The **N+1 problem returns** (reduced by batch fetching, but not eliminated)
- Job filtering by status **doesn't work properly** (Hibernate loads all jobs separately)
- You'd need `@SQLRestriction` and `@BatchSize` workarounds

This confirms what we learned earlier: **native SQL queries don't control JPA relationship loading**.

---

## Keeping Both Methods for Reference

### 💡 Practical Approach

You can keep both methods in your repository for reference:

```java
// ✅ Use this one — JPQL, solves N+1, proper filtering
List<Company> fetchCompaniesWithJobsByStatus(@Param("status") String status);

// 📚 Keep for reference — native SQL, has limitations
List<Company> fetchCompaniesWithJobsByStatusNative(@Param("status") String status);
```

But in `CompanyServiceImpl`, **always use the JPQL method**:

```java
companyRepository.fetchCompaniesWithJobsByStatus(ApplicationConstants.ACTIVE_STATUS);
```

---

## Section Recap — Everything We've Learned

This section covered a complete journey through advanced JPA querying:

| Topic | Key Lesson |
|---|---|
| **Derived query limits** | Can't handle multi-table filtering |
| **N+1 problem** | 1 query for parent + N queries for children = performance disaster |
| **Batch fetching** | Reduces N+1 to N/batchSize but doesn't eliminate it |
| **`@Query` with JPQL** | Full control, `JOIN FETCH` eliminates N+1 completely |
| **`@Query` with native SQL** | Full SQL power but loses relationship awareness |
| **`@NamedQuery`** | Centralize JPQL queries on entities, clean repositories |
| **`@NamedNativeQuery`** | Same for native SQL, requires `resultClass` |

### 🎯 The Decision Guide for Daily Development

```
Simple single-table query?
  → Derived Query Methods

Complex multi-table query?
  → @Query with JPQL (or @NamedQuery)

Need DB-specific features?
  → @Query with native SQL (or @NamedNativeQuery) — rare
```

---

## ✅ Key Takeaways

- `@NamedQuery` with JPQL works identically to inline `@Query` — same `JOIN FETCH`, same N+1 fix, same filtering
- `@NamedNativeQuery` has the same limitations as inline native queries — no relationship loading control
- Automatic method matching eliminates the need for `@Query` on repository methods when naming conventions are followed
- `resultClass` is mandatory for `@NamedNativeQuery` but not needed for `@NamedQuery`
- Always use the JPQL variant in your service layer — keep native variants as reference only
- These querying patterns will be reused throughout the application whenever multi-table data fetching is needed

## ⚠️ Common Mistakes

- Switching to the native named query method in the service layer without realizing it has N+1 and filtering issues
- Not checking console SQL logs after changing the query method — always verify your query count
- Defining `@NamedQuery` on one entity but trying to match it in a repository for a different entity
- Forgetting that React dev mode doubles API calls — use Postman for accurate query count verification

## 💡 Pro Tips

- For simple single-table queries, **derived query methods remain the best choice** — don't overcomplicate things
- If you're unsure whether your query is working correctly, check two things: (1) the response data is filtered correctly, and (2) the console shows minimal SQL queries
- Bookmark this section for reference — `@Query` with JPQL is one of the most frequently used patterns in Spring Boot applications
- The `default_batch_fetch_size` property should stay in your `application.properties` as a safety net, even after implementing `JOIN FETCH` queries
