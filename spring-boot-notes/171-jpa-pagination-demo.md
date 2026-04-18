# Hands-On Demo — Paginating Data Using JPA

## Introduction

Let's build the final, production-quality endpoint that supports **both pagination and sorting**. This is the API that our admin UI will actually use — where the admin can choose page size, navigate between pages, and sort by any field.

---

## Step 1 — Controller

Create a new endpoint accepting four query parameters:

```java
@GetMapping("/page/admin")
public ResponseEntity<Page<ContactResponseDto>> fetchNewContactMessagesWithPaginationAndSort(
        @RequestParam(defaultValue = "0") int pageNum,
        @RequestParam(defaultValue = "10") int pageSize,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDirection) {

    Page<ContactResponseDto> responseDtos =
        contactService.fetchNewContactMessagesWithPaginationAndSort(
            pageNum, pageSize, sortBy, sortDirection);

    return ResponseEntity.ok(responseDtos);
}
```

The four parameters:
- `pageNum` — Which page to fetch (0-indexed, defaults to first page)
- `pageSize` — Records per page (defaults to 10)
- `sortBy` — Field to sort on (defaults to `createdAt`)
- `sortDirection` — `asc` or `desc` (defaults to `asc`)

---

## Step 2 — Service Layer

In `IContactService`:

```java
Page<ContactResponseDto> fetchNewContactMessagesWithPaginationAndSort(
    int pageNum, int pageSize, String sortBy, String sortDirection);
```

In `ContactServiceImpl`:

```java
@Override
public Page<ContactResponseDto> fetchNewContactMessagesWithPaginationAndSort(
        int pageNum, int pageSize, String sortBy, String sortDirection) {

    // Build Sort object
    Sort sort = sortDirection.equalsIgnoreCase("desc")
        ? Sort.by(sortBy).descending()
        : Sort.by(sortBy).ascending();

    // Build Pageable with sorting
    Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

    // Fetch paginated, sorted data
    Page<Contact> contacts = contactRepository
        .findContactsByStatus(ApplicationConstants.NEW_MESSAGE, pageable);

    // Convert entity page to DTO page
    return contacts.map(this::transformToDto);
}
```

### Key Detail — Converting Page\<Entity\> to Page\<DTO\>

Notice we use `contacts.map(this::transformToDto)` — not `stream().map()`. The `Page` interface has a built-in `map()` method that transforms the content while preserving all pagination metadata. This is much cleaner than manually creating a new `Page` object.

---

## Step 3 — Repository

Add a third overloaded method that accepts `Pageable`:

```java
Page<Contact> findContactsByStatus(String status, Pageable pageable);
```

Import `Page` from `org.springframework.data.domain`. The return type **must** be `Page<Contact>` when you pass a `Pageable` parameter.

---

## Step 4 — Authorization

Add the new path to `PathsConfig`:

```java
@Bean("adminPaths")
public String[] adminPaths() {
    return new String[]{
        "/api/contacts/admin",
        "/api/contacts/sort/admin",
        "/api/contacts/page/admin"
    };
}
```

---

## Testing with Postman

### First Page (Default Parameters)

```
GET /api/contacts/page/admin
```

Response structure:

```json
{
  "content": [ /* 10 contact message objects */ ],
  "empty": false,
  "first": true,
  "last": false,
  "number": 0,
  "totalElements": 16,
  "totalPages": 2,
  "size": 10
}
```

The `content` array holds the actual data. All the other fields are **pagination metadata** that the frontend uses to build page navigation.

### Second Page

```
GET /api/contacts/page/admin?pageNum=1
```

Returns the remaining 6 records (16 total - 10 on page 0 = 6 on page 1). The metadata shows `"last": true`.

### Custom Sort + Page Size

```
GET /api/contacts/page/admin?pageNum=0&pageSize=5&sortBy=name&sortDirection=asc
```

Returns 5 records per page, sorted by name A → Z. With 16 records and page size 5, there are 4 pages total.

---

## Testing with the UI Application

1. Login as admin
2. Click on **Contact Messages** in the menu
3. The UI sends: `GET /api/contacts/page/admin?pageNum=0&pageSize=10&sortBy=createdAt&sortDirection=asc`
4. Records display in a table with pagination controls at the bottom

### UI Controls in Action

- **Per Page dropdown** — Change from 10 to 25 → Only 1 page needed for 16 records
- **Sort By dropdown** — Select "Name" → Records re-sort alphabetically
- **Page numbers** — Click page 2, 3, 4 → Each triggers a new backend request

Every interaction sends a **new API request** with updated query parameters. The backend handles the heavy lifting — the frontend just displays what it receives.

### What Happens Behind the Scenes

When you navigate to page 4 with a page size of 5:

```sql
-- Spring Data JPA generates:
SELECT * FROM contacts WHERE status = 'NEW' ORDER BY created_at ASC LIMIT 5 OFFSET 15
```

The framework automatically translates `PageRequest.of(3, 5)` into the correct `LIMIT` and `OFFSET` values. If you're using Oracle or PostgreSQL instead of MySQL, it adjusts the SQL syntax accordingly.

---

## ✅ Key Takeaways

- Combine `PageRequest.of(pageNum, pageSize, sort)` for pagination + sorting in one object
- Return `Page<DTO>` from your service — use `page.map()` to convert entities to DTOs while preserving metadata
- The response automatically includes metadata: `totalPages`, `totalElements`, `first`, `last`, `hasNext`, etc.
- Each page navigation triggers a **new backend request** — the backend only processes what's needed
- Spring Data JPA generates database-specific SQL (`LIMIT`/`OFFSET` for MySQL, `ROWNUM` for Oracle, etc.)
- Authorization rules must cover every new endpoint path

## ⚠️ Common Mistake

> Using `stream().map().collect(Collectors.toList())` on a `Page` object and returning a `List`. This **loses all pagination metadata**! Use `page.map()` instead — it returns a new `Page` with transformed content and intact metadata.

## 💡 Pro Tip

> The pagination metadata returned by Spring Data JPA (`totalPages`, `hasNext`, `hasPrevious`, etc.) is designed to be consumed directly by frontend pagination components. Don't reinvent the calculation logic on the client side — just read the metadata.
