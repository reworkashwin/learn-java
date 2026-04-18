# Understanding `@NamedQuery` and `@NamedNativeQuery`

## Introduction

So far, we've been placing our JPQL and native SQL queries **directly on repository methods** using `@Query`. This works perfectly, but what if your repository starts getting cluttered with many queries? What if you want to **reuse the same query** across multiple repositories?

Enter `@NamedQuery` and `@NamedNativeQuery` — annotations that let you define queries **on the entity class** instead of the repository, keeping your repositories clean and your queries centralized.

---

## The Problem with `@Query` on Repository Methods

### ❓ What's Wrong with the Current Approach?

Nothing is fundamentally wrong, but as your application grows:

1. **Repository clutter** — Your repository interface gets loaded with long `@Query` strings on multiple methods
2. **No reuse** — A query defined on one repository can't be used in another
3. **Developer experience** — Developers primarily work with repository interfaces, so cluttering them with query strings makes them harder to read

---

## `@NamedQuery` — Centralizing JPQL Queries on Entities

### 🧠 What Is It?

`@NamedQuery` lets you define a named JPQL query **on top of your entity class** instead of inside the repository. The query gets a name, and the repository method references it by that name.

### ⚙️ How It Works

**Step 1: Define the query on the entity class**

```java
@Entity
@NamedQuery(
    name = "Company.fetchCompaniesWithJobsByStatus",
    query = "SELECT DISTINCT c FROM Company c JOIN FETCH c.jobs j WHERE j.status = :status"
)
public class Company {
    // ... fields and methods
}
```

**Step 2: Create a matching method in your repository**

```java
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> fetchCompaniesWithJobsByStatus(@Param("status") String status);
}
```

### 🔍 The Naming Convention

The standard naming pattern is:

```
EntityName.methodName
```

For example: `Company.fetchCompaniesWithJobsByStatus`

### 💡 The Magic: Automatic Matching

If your repository method name matches the part **after the dot** in the named query's name, Spring Data JPA automatically connects them. No `@Query` annotation needed on the method!

```
Entity name:  "Company.fetchCompaniesWithJobsByStatus"
                       ↕ (matches)
Method name:  fetchCompaniesWithJobsByStatus(...)
```

### What If the Names Don't Match?

If you want a different method name, just add `@Query` with the `name` attribute:

```java
@Query(name = "Company.fetchCompaniesWithJobsByStatus")
List<Company> getActiveCompanies(@Param("status") String status);
```

> **Recommendation:** Use the same name so you can skip the `@Query` annotation entirely.

---

## `@NamedNativeQuery` — For Native SQL Queries

### 🧠 How Is It Different?

`@NamedNativeQuery` works the same way but for **native SQL** instead of JPQL. There's one extra required attribute: `resultClass`.

```java
@Entity
@NamedNativeQuery(
    name = "Company.fetchCompaniesWithJobsByStatusNative",
    query = "SELECT DISTINCT c.* FROM companies c " +
            "JOIN jobs j ON c.id = j.company_id " +
            "WHERE j.status = :status",
    resultClass = Company.class
)
public class Company {
    // ...
}
```

### ❓ Why Is `resultClass` Required Here but Not for `@NamedQuery`?

This is a great question:

- **JPQL** works with entities — the query itself mentions `Company c`, so JPA already knows which entity to return
- **Native SQL** works with tables and columns — JPA has no idea how to map database rows to Java objects unless you tell it

And you might wonder: *"Can't the framework figure it out from the method return type?"*

No, because named queries are **validated at startup**, before repository method signatures are parsed. At validation time, the framework doesn't yet know which repository method will call this query.

---

## Defining Multiple Named Queries — Plural Annotations

### ⚙️ `@NamedQueries` (Plural)

To define multiple JPQL queries on one entity:

```java
@Entity
@NamedQueries({
    @NamedQuery(
        name = "Company.fetchCompaniesWithJobsByStatus",
        query = "SELECT DISTINCT c FROM Company c JOIN FETCH c.jobs j WHERE j.status = :status"
    ),
    @NamedQuery(
        name = "Company.findBySize",
        query = "SELECT c FROM Company c WHERE c.size = :size"
    )
})
public class Company {
    // ...
}
```

### ⚙️ `@NamedNativeQueries` (Plural)

Same pattern for native queries:

```java
@NamedNativeQueries({
    @NamedNativeQuery(
        name = "Company.fetchByStatusNative",
        query = "SELECT DISTINCT c.* FROM companies c JOIN jobs j ON c.id = j.company_id WHERE j.status = :status",
        resultClass = Company.class
    )
})
```

---

## Benefits of Named Queries

| Benefit | Explanation |
|---|---|
| **Centralized** | All queries live in one place — the entity class |
| **Validated at startup** | Syntax errors are caught when the app starts, not at runtime |
| **Reusable** | Same query can be used in multiple repositories |
| **Clean repositories** | Repository interfaces contain only method signatures |
| **Entity class organization** | Queries are defined as annotations on the class, not mixed with the class body |

### 💡 Why Developers Like This Tradeoff

Developers open repository interfaces **frequently** — to find methods, invoke them, or check what queries are available. Entity classes are opened less often. So putting queries on entities and keeping repositories clean is a popular pattern.

---

## `@NamedQuery` vs `@Query` — Which to Use?

| Factor | `@NamedQuery` | `@Query` |
|---|---|---|
| Defined at | Entity class | Repository interface |
| Reusability | ✅ Across multiple repos | ❌ Single method only |
| Startup validation | ✅ Always | ✅ For JPQL only |
| Clean repository | ✅ Very clean | ❌ Query strings in methods |
| Ease of use | Requires naming convention | Direct and simple |
| Team preference | Larger teams / enterprise apps | Smaller projects / quick iteration |

Both approaches are perfectly valid. Use whichever fits your team's conventions.

---

## ✅ Key Takeaways

- `@NamedQuery` defines JPQL queries on the **entity class** with a name following `EntityName.methodName` pattern
- `@NamedNativeQuery` does the same for native SQL but requires a `resultClass` attribute
- If the repository method name matches the query name (after the dot), **no `@Query` annotation is needed**
- Named queries are **validated at startup** — errors caught early
- Use `@NamedQueries` and `@NamedNativeQueries` (plural) to define multiple queries on one entity
- The named queries defined with JPQL support `JOIN FETCH` and solve N+1 just like inline `@Query`
- Named native queries have the same limitations as inline native queries (no `FETCH`, no relationship control)

## ⚠️ Common Mistakes

- Not following the `EntityName.methodName` naming convention and then wondering why automatic matching fails
- Forgetting `resultClass` in `@NamedNativeQuery` — the framework can't infer it
- Defining queries on the wrong entity class — the query name prefix should match the entity where it's placed
- Expecting `@NamedNativeQuery` to solve N+1 — it has the same limitations as inline native SQL

## 💡 Pro Tips

- Stick to `@NamedQuery` (JPQL) for all named queries — use `@NamedNativeQuery` only when you truly need database-specific features
- The naming convention `EntityName.methodName` is not enforced — but following it saves you from writing extra `@Query` annotations
- If your entity class starts getting cluttered with annotations, consider whether `@Query` on the repository might be simpler for your project
- All benefits of JPQL (portability, auto join conditions, `FETCH`) apply equally to `@NamedQuery`
