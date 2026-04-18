# Hands-On Demo — Sorting Records Using JPA

## Introduction

Time to implement both static and dynamic sorting in our contact messages API. We'll modify the existing method for static sorting, then create a brand-new endpoint that supports dynamic sorting via query parameters.

---

## Static Sorting — Quick Change

### Update the Repository Method

In `ContactRepository`, update the existing method by appending `OrderBy`:

```java
// Before (no sorting)
List<Contact> findContactsByStatus(String status);

// After (static sort by createdAt ascending)
List<Contact> findContactsByStatusOrderByCreatedAtAsc(String status);
```

Update the service layer to call this new method name, rebuild, and test. Every call now returns contacts sorted by creation date in ascending order — no client input needed.

But static sorting is limited. What if the admin wants to sort by name? Or by ID in descending order? Let's build dynamic sorting.

---

## Dynamic Sorting — New REST API

### Step 1 — Controller

Create a new endpoint that accepts sort parameters:

```java
@GetMapping("/sort/admin")
public ResponseEntity<List<ContactResponseDto>> fetchNewContactMessagesWithSort(
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDirection) {

    List<ContactResponseDto> responseDtos =
        contactService.fetchNewContactMessagesWithSort(sortBy, sortDirection);

    return ResponseEntity.ok(responseDtos);
}
```

Key points:
- `sortBy` — The field name to sort on (defaults to `createdAt`)
- `sortDirection` — `asc` or `desc` (defaults to `asc`)
- Both have default values, so clients can omit them

### Step 2 — Service Layer

In `IContactService`:

```java
List<ContactResponseDto> fetchNewContactMessagesWithSort(String sortBy, String sortDirection);
```

In `ContactServiceImpl`:

```java
@Override
public List<ContactResponseDto> fetchNewContactMessagesWithSort(String sortBy, String sortDirection) {
    Sort sort = sortDirection.equalsIgnoreCase("desc")
        ? Sort.by(sortBy).descending()
        : Sort.by(sortBy).ascending();

    List<Contact> contacts = contactRepository
        .findContactsByStatus(ApplicationConstants.NEW_MESSAGE, sort);

    return contacts.stream()
        .map(this::transformToDto)
        .collect(Collectors.toList());
}
```

The ternary operator checks the direction string and creates the appropriate `Sort` object.

### Step 3 — Repository

Add a new method that accepts `Sort`:

```java
List<Contact> findContactsByStatus(String status, Sort sort);
```

Import `Sort` from `org.springframework.data.domain`.

---

## Testing with Postman

### Sort by Name, Descending

```
GET /api/contacts/sort/admin?sortBy=name&sortDirection=desc
```

**Result:** Records sorted Z → A. Will Smith appears first, followed by other names in reverse alphabetical order.

### Sort by ID, Descending

```
GET /api/contacts/sort/admin?sortBy=id&sortDirection=desc
```

**Result:** Record with ID 21 first, then 20, 19, 18... confirming dynamic sorting works perfectly.

### Default Sort (No Parameters)

```
GET /api/contacts/sort/admin
```

**Result:** Sorted by `createdAt` in ascending order (the defaults).

---

## Don't Forget Authorization!

The new endpoint path is `/api/contacts/sort/admin`. If you don't add it to your `adminPaths` configuration, it falls under generic secured paths — any authenticated user can access it.

Update `PathsConfig`:

```java
@Bean("adminPaths")
public String[] adminPaths() {
    return new String[]{
        "/api/contacts/admin",
        "/api/contacts/sort/admin"
    };
}
```

### Testing Authorization

1. Login as regular user (`john@gmail.com`) → Call sort API → **403 Forbidden** ✅
2. Login as admin (`admin@gmail.com`) → Call sort API → **200 OK with sorted data** ✅

---

## ✅ Key Takeaways

- Static sorting: Append `OrderByFieldAsc` or `OrderByFieldDesc` to your derived query method name
- Dynamic sorting: Accept `sortBy` and `sortDirection` as `@RequestParam` with sensible defaults
- Use a ternary operator to build the `Sort` object based on the direction string
- The same repository method name can be **overloaded** — one version with `Sort`, one without
- Always enforce authorization on new endpoints by adding paths to `adminPaths`
- Sorting + filtering together is the standard pattern for production APIs

## ⚠️ Common Mistake

> Forgetting to add new endpoint paths to the authorization configuration. Every new admin-only endpoint must be registered in `adminPaths`, otherwise it defaults to `authenticated()` — meaning any logged-in user can access it.

## 💡 Pro Tip

> Use default parameter values (`@RequestParam(defaultValue = "createdAt")`) so that clients don't *have* to specify sort criteria. If they don't care about sorting, they get a sensible default. If they do, they send query params.
