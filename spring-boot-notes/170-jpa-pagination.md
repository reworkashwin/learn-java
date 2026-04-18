# Understanding Pagination in Spring Data JPA

## Introduction

What if your database has 50,000 contact messages? Sending all of them in one API response is a recipe for disaster — slow backend, clogged network, frustrated users staring at an endless page. Pagination solves this by breaking data into **small, manageable pages** — just like a book.

Spring Data JPA provides built-in pagination support, so you don't have to write raw SQL with `LIMIT` and `OFFSET`. Let's see how it works.

---

## Why Pagination Matters

Imagine opening Amazon.com and it tries to load every single product on the home page — millions of items. How would you feel? Frustrated, because:

1. The page takes forever to load
2. Scrolling through millions of items is useless
3. The server has to process and transmit an enormous amount of data

Instead, Amazon shows 20-50 products per page with page numbers at the bottom. That's pagination.

### The Book Analogy

When you read a book, you don't read all 300 pages at once. You read **one page at a time** and flip to the next when you're ready. Database pagination works the same way — you request one "page" of records at a time.

---

## Key Components in Spring Data JPA

### 1. `Pageable` Interface

This interface carries your pagination requirements — which page you want and how many records per page. Think of it as a **request** for a specific page.

### 2. `PageRequest` Class

The most common implementation of `Pageable`. You create it with the `of()` method:

```java
// Page 0 (first page), 10 records per page
Pageable pageable = PageRequest.of(0, 10);
```

⚠️ **Page numbering starts at 0**, just like array indices. Page 0 is the first page, page 1 is the second, and so on.

### 3. `Page<T>` Interface

The response wrapper. Instead of returning `List<Contact>`, you return `Page<Contact>`. A `Page` contains:
- The actual data (records)
- Metadata about the pagination (total pages, total elements, etc.)

---

## Basic Pagination Example

```java
// Create the page request
Pageable pageable = PageRequest.of(0, 10); // First page, 10 records

// Pass it to a repository method
Page<Customer> page = customerRepository.findAll(pageable);
```

That's it! Spring Data JPA automatically adds `LIMIT` and `OFFSET` to the SQL query.

---

## What's Inside a Page Object?

The `Page` interface provides powerful metadata methods:

| Method | Description | Example (60 records, page size 10) |
|---|---|---|
| `getContent()` | The actual list of records | 10 `Customer` objects |
| `getTotalElements()` | Total records in the database | `60` |
| `getTotalPages()` | Total number of pages | `6` |
| `getNumber()` | Current page number (0-indexed) | `0` |
| `getSize()` | Max records per page | `10` |
| `hasNext()` | Is there a next page? | `true` |
| `hasPrevious()` | Is there a previous page? | `false` (on first page) |
| `isFirst()` | Is this the first page? | `true` |
| `isLast()` | Is this the last page? | `false` |

These metadata methods are **gold** for building UI pagination controls. The frontend doesn't have to calculate anything — it just reads the metadata.

💡 **Note:** If you have 55 records and page size is 10, `getTotalPages()` returns `6`. The last page (page 5) will have only 5 records.

---

## Combining Pagination with Sorting

Here's where it gets powerful. `PageRequest.of()` also accepts a `Sort` object as a third parameter:

```java
Sort sort = Sort.by("createdAt").descending();
Pageable pageable = PageRequest.of(0, 10, sort);

Page<Customer> page = customerRepository.findAll(pageable);
```

This fetches the first 10 records, sorted by creation date (newest first). One object handles **both** pagination and sorting — clean and efficient.

---

## Using Pagination with Custom Finder Methods

You can combine pagination with your derived query methods:

```java
// In your repository
Page<Contact> findByStatus(String status, Pageable pageable);
```

When calling it:

```java
Pageable pageable = PageRequest.of(0, 10, Sort.by("name").ascending());
Page<Contact> page = contactRepository.findByStatus("NEW", pageable);
```

Spring Data JPA generates: `SELECT * FROM contacts WHERE status = 'NEW' ORDER BY name ASC LIMIT 10 OFFSET 0`

The key change: the return type is `Page<Contact>` instead of `List<Contact>`.

---

## List vs Page — When to Use What

| Return Type | What It Provides | When to Use |
|---|---|---|
| `List<T>` | Just the data | Small datasets, no pagination needed |
| `Page<T>` | Data + full metadata (total pages, total elements, etc.) | Standard pagination with UI controls |
| `Slice<T>` | Data + hasNext/hasPrevious (no total count) | Infinite scroll (no page numbers needed) |

For most admin dashboards and data tables, use `Page<T>`.

---

## ✅ Key Takeaways

- **Pagination** breaks large datasets into manageable pages — essential for production apps
- `PageRequest.of(page, size)` creates a pageable request (page index starts at **0**)
- `PageRequest.of(page, size, sort)` combines pagination with sorting in one object
- Return `Page<T>` instead of `List<T>` — it includes metadata like `totalPages`, `totalElements`, `hasNext`
- Repository methods just need to accept `Pageable` as a parameter — Spring Data JPA handles the SQL
- No need to write `LIMIT`/`OFFSET` SQL manually — the framework generates database-specific queries

## 💡 Pro Tip

> **Pagination + Sorting** is a best practice for any production API that returns lists of data. Always implement both together — it's the standard approach in enterprise applications.
