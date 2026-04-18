# Spring Data & Spring Data JPA Important Interfaces — Part 1

## Introduction

We've created our Entity class representing the `companies` table. The next step? We need **Java methods** to interact with the database — save a record, fetch records, delete records, and so on.

Here's the beautiful part: **with Spring Data JPA, you don't write any of these methods yourself.** The framework provides them all. You just need to understand a few key interfaces, make some configurations, and everything works out of the box.

Let's explore the important interfaces, starting from the foundation.

---

## The Interface Hierarchy — Big Picture

Before diving into each interface, here's the hierarchy:

```
Repository (marker interface - Spring Data)
    ├── CrudRepository (CRUD operations - Spring Data)
    │       └── ListCrudRepository (returns List instead of Iterable)
    └── PagingAndSortingRepository (pagination + sorting - Spring Data)
            └── ListPagingAndSortingRepository (returns List)
```

All of these interfaces live in the **Spring Data** project (not Spring Data JPA). That means they work consistently regardless of which database you use.

---

## Interface 1: Repository (The Root)

```java
package org.springframework.data.repository;

public interface Repository<T, ID> {
    // Empty! It's a marker interface.
}
```

### What is it?

`Repository` is a **marker interface** — it has no methods at all. It's completely empty.

### Why does an empty interface exist?

It serves as the **common ancestor** for all repository interfaces in Spring Data. Any interface that extends `Repository` is recognized by the Spring framework as a **Spring Data Repository**, and the framework will:

1. Auto-detect it during application startup
2. Generate implementation code for all its abstract methods
3. Create a Spring bean of that implementation

> **Analogy:** Think of it as a membership card. If your interface "carries" this card (extends Repository), Spring knows it's part of the data access club and treats it accordingly.

### The Generics — T and ID

Every repository interface uses two generic parameters:

| Generic | Represents | Example |
|---|---|---|
| `T` | The Entity class (your database table) | `Company` |
| `ID` | The data type of the primary key | `Long` |

So if you have a `Company` entity with a `Long` primary key, you'd replace `T` with `Company` and `ID` with `Long`.

---

## Interface 2: CrudRepository — The Workhorse

```java
public interface CrudRepository<T, ID> extends Repository<T, ID> {
    // CRUD methods here
}
```

### What is it?

`CrudRepository` provides methods for all four **CRUD** operations:

- **C**reate (insert)
- **R**ead (fetch/find)
- **U**pdate (modify)
- **D**elete (remove)

### Available Methods

#### Find (Read) Methods

| Method | What It Does |
|---|---|
| `findAll()` | Fetches **all** records from the table |
| `findById(ID id)` | Fetches **one** record by its primary key |
| `findAllById(Iterable<ID> ids)` | Fetches **multiple** records by a list of IDs |

#### Save (Create/Update) Methods

| Method | What It Does |
|---|---|
| `save(T entity)` | Saves a **single** entity (insert or update) |
| `saveAll(Iterable<T> entities)` | Saves **multiple** entities at once |

How does the framework decide between insert and update? Simple:
- If no record exists with the given ID → **INSERT**
- If a record already exists → **UPDATE**

#### Delete Methods

| Method | What It Does |
|---|---|
| `delete(T entity)` | Deletes a **single** record |
| `deleteById(ID id)` | Deletes by **primary key** |
| `deleteAll()` | Deletes **all** records |
| `deleteAllById(Iterable<ID> ids)` | Deletes **multiple** records by IDs |

#### Utility Methods

| Method | What It Does |
|---|---|
| `count()` | Returns the **total number** of records |
| `existsById(ID id)` | Returns `true` if a record with that ID exists |

### The Key Insight

**You never write implementation code for these methods.** The Spring Data framework generates the implementation automatically at startup. You just extend the interface, and all these methods are ready to use.

---

## Interface 3: ListCrudRepository — The Improved Version

```java
public interface ListCrudRepository<T, ID> extends CrudRepository<T, ID> {
    List<T> findAll();
    List<T> findAllById(Iterable<ID> ids);
    List<T> saveAll(Iterable<T> entities);
}
```

### What's different from CrudRepository?

The only difference is the **return type**:

| Interface | Return Type of `findAll()` |
|---|---|
| `CrudRepository` | `Iterable<T>` |
| `ListCrudRepository` | `List<T>` |

### Why does this matter?

With `Iterable`, you'd have to manually iterate and collect results into a List:

```java
// Iterable approach (CrudRepository) - more work
Iterable<Company> iterable = repository.findAll();
List<Company> list = new ArrayList<>();
iterable.forEach(list::add);
```

With `List`, you get the collection directly:

```java
// List approach (ListCrudRepository) - clean and simple
List<Company> list = repository.findAll();
```

> **Bottom line:** `ListCrudRepository` saves you from the extra step of converting `Iterable` to `List`. Use it whenever you want `List` return types.

---

## Summary — What We've Covered So Far

| Interface | Package | Purpose |
|---|---|---|
| `Repository` | Spring Data | Marker interface — root of all repositories |
| `CrudRepository` | Spring Data | CRUD operations (returns `Iterable`) |
| `ListCrudRepository` | Spring Data | CRUD operations (returns `List`) |

All three are from the **Spring Data** project — they work with any database type.

---

## ✅ Key Takeaways

1. **Repository** is an empty marker interface — extending it tells Spring "this is a data access component."
2. **CrudRepository** provides all CRUD methods — find, save, delete, count, exists.
3. **ListCrudRepository** extends CrudRepository but returns `List` instead of `Iterable` — more convenient for most use cases.
4. The `save()` method handles **both** insert and update — the framework decides based on whether the record exists.
5. **You never write implementation code** — Spring Data generates it automatically at startup.
6. Generic parameters: `T` = Entity class, `ID` = Primary key data type.

---

## ⚠️ Common Mistakes

- **Confusing the `@Repository` annotation with the `Repository` interface** — the annotation is a stereotype (like `@Component`); the interface is for data access patterns. They're completely different.
- **Writing implementation classes for repository interfaces** — you don't need to! The framework generates them automatically.
- **Using `CrudRepository` when you need `List` return types** — use `ListCrudRepository` instead to avoid manual conversion.

---

## 💡 Pro Tips

- In IntelliJ, uncheck "Inherited Members" in the structure view to see only the methods introduced by a specific interface (not inherited ones).
- The `existsById()` method is great for validation — check if a record exists before trying to update or delete it.
- The `save()` method returns the saved entity with the auto-generated ID populated — useful when you need the ID immediately after insert.
