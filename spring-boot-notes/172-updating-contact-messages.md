# From New to Closed — Updating Contact Messages

## Introduction

We can now view, sort, and paginate contact messages. But what happens after the admin resolves a customer's issue? They need to **close** the message — update its status from `NEW` to `CLOSED`. This lecture covers building the update API, enforcing authorization, and fixing an auditing bug along the way.

---

## Building the Update REST API

### Step 1 — Controller

```java
@PatchMapping("/{id}/status/admin")
public ResponseEntity<String> closeContactMessage(@PathVariable int id) {
    boolean updated = contactService.updateContactMessageStatus(
        id, ApplicationConstants.CLOSED_MESSAGE);

    if (updated) {
        return ResponseEntity.ok("Contact message updated successfully");
    }
    return ResponseEntity.badRequest().body("Failed to update contact message");
}
```

Why `@PatchMapping`? Because we're doing a **partial update** — only changing the `status` column, not the entire record. `PATCH` is the correct HTTP method for this.

The path structure: `/api/contacts/{id}/status/admin`
- `{id}` — Path variable for the record's primary key
- `status` — Indicates we're updating the status
- `admin` — Convention that this is an admin-only endpoint

### Step 2 — Service Layer

In `IContactService`:

```java
boolean updateContactMessageStatus(int id, String status);
```

In `ContactServiceImpl`:

```java
@Override
public boolean updateContactMessageStatus(int id, String status) {
    Contact contact = contactRepository.findById(id).orElse(null);

    if (contact == null) {
        return false;
    }

    contact.setStatus(status);
    contactRepository.save(contact);
    return true;
}
```

Here's what's happening:
1. **Fetch** the record by ID using `findById()` (provided by `CrudRepository`)
2. If no record exists → Return `false` → Controller sends `400 Bad Request`
3. If found → Update the status → Save the record
4. `save()` checks: does this object have an ID? Yes → **Update**. No → **Insert**
5. Return `true` → Controller sends `200 OK`

### ⚠️ This Isn't Optimal

This approach fires **two SQL queries**: one `SELECT` to find the record, and one `UPDATE` to save it. In a production app, you'd use a single `UPDATE` query:

```sql
UPDATE contacts SET status = 'CLOSED' WHERE id = ?
```

We'll learn more optimized approaches (like `@Modifying` queries) in future sections.

---

## Step 3 — Authorization

Add the new path to `adminPaths`:

```java
@Bean("adminPaths")
public String[] adminPaths() {
    return new String[]{
        "/api/contacts/admin",
        "/api/contacts/sort/admin",
        "/api/contacts/page/admin",
        "/api/contacts/*/status/admin"  // Wildcard for path variable
    };
}
```

The `*` wildcard matches any value in the `{id}` position.

---

## Testing

### Valid Update

```
PATCH /api/contacts/1/status/admin
```

**Response:** `200 OK` — "Contact message updated successfully"

Check the database: record with ID 1 now has `status = 'CLOSED'`.

### Invalid ID

```
PATCH /api/contacts/9999/status/admin
```

**Response:** `400 Bad Request` — "Failed to update contact message"

---

## Fixing the Audit Bug

After updating, we notice the `updated_by` column shows `anonymous user` instead of the actual admin's email. The problem is in `AuditAwareImpl` — it always returns "anonymous user."

### The Fix — ApplicationUtility Class

Create a utility class to detect the current logged-in user:

```java
public class ApplicationUtility {

    public static String getCurrentUsername() {
        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

        // No authentication or anonymous user
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return ApplicationConstants.SYSTEM;
        }

        // If principal is our user entity
        Object principal = authentication.getPrincipal();
        if (principal instanceof JobPortalUser jobPortalUser) {
            return jobPortalUser.getEmail();
        }

        // Fallback — principal is a string (from JWT filter)
        return principal.toString();
    }
}
```

### Why Two Different Principal Types?

- **During login** (in `AuthenticationProvider`): The `Authentication` object stores a `JobPortalUser` entity as the principal
- **During JWT validation** (in `JWTTokenValidationFilter`): The `Authentication` object stores the email string as the principal (because we don't want to hit the database again)

The utility method handles both cases.

### Fix the JWT Token Validator

In `JWTTokenValidationFilter`, make sure you're reading the email from claims:

```java
String username = claims.get("email").toString(); // Not "sub"!
```

### Update AuditAwareImpl

```java
@Override
public Optional<String> getCurrentAuditor() {
    return Optional.of(ApplicationUtility.getCurrentUsername());
}
```

Now Spring Data JPA gets the correct username for `createdBy` and `updatedBy` columns.

### Add the Constant

In `ApplicationConstants`:

```java
public static final String SYSTEM = "SYSTEM";
```

This value is used when no user is logged in (e.g., public API calls that trigger audited inserts).

---

## After the Fix

Update a record again and check the database:

| Column | Before Fix | After Fix |
|---|---|---|
| `updated_by` | `anonymous user` | `admin@gmail.com` |
| `updated_at` | ✅ Correct | ✅ Correct |

---

## UI Testing

1. Login as admin → Navigate to Contact Messages
2. Click **Close** on any message
3. Success notification appears
4. The message status updates to `CLOSED`

---

## ✅ Key Takeaways

- Use `@PatchMapping` for partial updates (not `@PutMapping`)
- `CrudRepository.findById()` returns an `Optional` — use `.orElse(null)` for simple null checks
- `CrudRepository.save()` performs an **update** when the entity has an existing ID, **insert** when it doesn't
- The current two-query approach (SELECT + UPDATE) works but isn't optimal — a single `@Modifying` update query is better
- `SecurityContextHolder.getContext().getAuthentication()` gives you the current user's details anywhere in the application
- The principal object type depends on *where* the authentication was set — it could be an entity or a string

## ⚠️ Common Mistake

> Forgetting to update the JWT token filter to read the correct claim name for the username. If the claim name doesn't match what was set during token creation, the audit trail will have wrong values.

## 💡 Pro Tip

> Create a utility class like `ApplicationUtility` early in your project. You'll need to access the current user's email/username in many places — auditing, logging, business logic. Having a central method avoids code duplication and ensures consistent behavior.
