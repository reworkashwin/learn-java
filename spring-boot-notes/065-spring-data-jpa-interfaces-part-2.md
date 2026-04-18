# Spring Data & Spring Data JPA Important Interfaces — Part 2

## Introduction

In the previous lecture, we explored the foundational interfaces: `Repository`, `CrudRepository`, and `ListCrudRepository`. These handle basic CRUD operations. But real-world applications need more — **pagination**, **sorting**, and **database-specific features**.

That's where the remaining interfaces come in. Let's complete the picture.

---

## Interface 4: PagingAndSortingRepository

```java
public interface PagingAndSortingRepository<T, ID> extends Repository<T, ID> {
    Page<T> findAll(Pageable pageable);
    Iterable<T> findAll(Sort sort);
}
```

### What problem does it solve?

Imagine your database has **1,000 records**. Do you want to fetch all 1,000 at once and dump them on the UI? Of course not! You want to show 10 or 20 records per page, and let the user click "Next" to see more.

That's **pagination** — and this interface provides exactly that.

### The Two Methods

| Method | Purpose |
|---|---|
| `findAll(Pageable pageable)` | Fetch records with **pagination** (page number, page size) |
| `findAll(Sort sort)` | Fetch records with **sorting** (ascending/descending by column) |

### What is Pagination?

Instead of loading all records at once:

```
Page 1: Records 1-10
Page 2: Records 11-20
Page 3: Records 21-30
... and so on
```

The user sees a manageable chunk of data, and clicks "Next" or a page number to load more. This improves performance (less data transferred) and user experience.

### What is Sorting?

Sorting lets you order records by a specific column — alphabetically by name, newest to oldest by date, highest to lowest by rating, etc.

---

## Interface 5: ListPagingAndSortingRepository

```java
public interface ListPagingAndSortingRepository<T, ID>
    extends PagingAndSortingRepository<T, ID> {
    
    List<T> findAll(Sort sort);
}
```

Same pattern as before — this version returns `List<T>` instead of `Iterable<T>`. Use it when you want cleaner return types.

---

## The Spring Data Story So Far

All four interfaces (`CrudRepository`, `ListCrudRepository`, `PagingAndSortingRepository`, `ListPagingAndSortingRepository`) are from the **Spring Data** project — the parent umbrella. They work with **any** database type.

But what about features specific to **relational databases**? That's where Spring Data JPA comes in.

---

## Interface 6: JpaRepository — The Star of the Show

```java
public interface JpaRepository<T, ID> extends
    ListCrudRepository<T, ID>,
    ListPagingAndSortingRepository<T, ID>,
    QueryByExampleExecutor<T> {
    
    // JPA-specific methods
    void flush();
    <S extends T> S saveAndFlush(S entity);
    void deleteAllInBatch();
    void deleteAllByIdInBatch(Iterable<ID> ids);
    // ... more methods
}
```

### Why is JpaRepository special?

It's the **all-in-one** interface. When you extend `JpaRepository`, you get:

1. ✅ All **CRUD methods** (from ListCrudRepository)
2. ✅ All **pagination and sorting methods** (from ListPagingAndSortingRepository)
3. ✅ All methods return `List` (not Iterable)
4. ✅ **JPA-specific methods** for relational databases

### JPA-Specific Methods

| Method | What It Does |
|---|---|
| `flush()` | Commits all pending changes to the database **immediately** (don't wait for transaction commit) |
| `saveAndFlush(entity)` | Saves an entity AND immediately commits to the database |
| `deleteAllInBatch()` | Deletes all records as a **batch operation** (single SQL, much faster) |
| `deleteAllByIdInBatch(ids)` | Deletes specific records as a batch |

### Why batch operations matter

Without batch: Deleting 100 records = 100 separate DELETE SQL statements.
With batch: Deleting 100 records = 1 batch DELETE SQL statement.

Relational databases support batch execution, and `JpaRepository` exposes this capability.

### This is why most developers use JpaRepository

In real applications, developers almost always extend `JpaRepository` instead of the individual interfaces. Why would you extend `CrudRepository` and `PagingAndSortingRepository` separately when `JpaRepository` gives you **everything in one shot** plus additional features?

---

## The Complete Interface Hierarchy

```
                    Repository (marker)
                    /              \
          CrudRepository    PagingAndSortingRepository
               |                      |
      ListCrudRepository    ListPagingAndSortingRepository
               \                     /
                \                   /
                 JpaRepository ←←←←  (combines both + adds JPA features)
```

`JpaRepository` = Everything from Spring Data + JPA-specific capabilities. **This is the interface you'll use 99% of the time.**

---

## Interface Segregation Principle

You might ask: *"Why not just put everything in one interface from the start?"*

Spring Data follows the **Interface Segregation Principle** — one of the SOLID design principles. This means:

- If you only need CRUD → extend `CrudRepository`
- If you only need pagination → extend `PagingAndSortingRepository`
- If you want everything → extend `JpaRepository`

You pick what you need, avoiding unnecessary complexity. But in practice, most developers just use `JpaRepository` because it covers all bases.

---

## Database-Specific Repositories

`JpaRepository` isn't the only database-specific interface. Other Spring Data modules have their own:

| Spring Data Module | Repository Interface | Database |
|---|---|---|
| Spring Data **JPA** | `JpaRepository` | MySQL, Postgres, Oracle |
| Spring Data **MongoDB** | `MongoRepository` | MongoDB |
| Spring Data **Redis** | — (uses `RedisTemplate`) | Redis |
| Spring Data **Elasticsearch** | `ElasticsearchRepository` | Elasticsearch |

Always extend the **appropriate interface** for your database type.

---

## Important: @Repository Annotation vs. Repository Interface

Don't confuse these two:

| Concept | What It Is | Purpose |
|---|---|---|
| `@Repository` annotation | A stereotype annotation (like `@Component`) | Tells Spring to create a bean and treat it as a data access component |
| `Repository` interface | An empty marker interface from Spring Data | Marks an interface as a Spring Data repository for auto-implementation |

They share the same name but serve completely different purposes!

---

## ✅ Key Takeaways

1. **PagingAndSortingRepository** adds pagination and sorting capabilities.
2. **JpaRepository** is the all-in-one interface — CRUD + pagination + sorting + JPA-specific features.
3. In practice, **always extend JpaRepository** — it gives you everything you need in one interface.
4. JPA-specific methods like `flush()`, `saveAndFlush()`, and batch deletes are only in `JpaRepository`.
5. Spring Data follows **Interface Segregation Principle** — multiple focused interfaces, not one bloated one.
6. Each Spring Data module has its own specific repository (e.g., `MongoRepository` for MongoDB).
7. Don't confuse the `@Repository` **annotation** with the `Repository` **interface** — they're different things.

---

## ⚠️ Common Mistakes

- **Extending multiple interfaces manually** (CrudRepository + PagingAndSortingRepository) — just use `JpaRepository`, which includes both.
- **Confusing `@Repository` annotation with `Repository` interface** — one is a bean stereotype, the other is a data access contract.
- **Using database-specific interfaces with the wrong database** — `JpaRepository` is for relational databases only. Use `MongoRepository` for MongoDB.

---

## 💡 Pro Tips

- `JpaRepository` also extends `QueryByExampleExecutor` — this lets you query by providing an example entity (we'll explore this later).
- The `flush()` method is useful when you need data committed **before** a method finishes — for example, when another service needs to read the just-saved data.
- Batch operations (`deleteAllInBatch`) are significantly faster than individual deletes for large datasets — the difference can be 10x or more.
- When looking at interface methods in IntelliJ, toggle "Inherited Members" on/off to see which methods come from which parent interface.
