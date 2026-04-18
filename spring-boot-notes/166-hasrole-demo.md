# Hands-On Demo — Securing APIs with hasRole()

## Introduction

Theory is done — now let's **build** it. In this demo, we'll create a new REST API that returns contact messages, configure it so only admin users can access it, and test what happens when a regular user tries to call it. This is authorization in action.

---

## Step 1 — Create the Response DTO

First, we need a DTO to shape the data we send to the client. Under the `dto` package, create a record class:

```java
public record ContactResponseDto(
    int id,
    String name,
    String email,
    String userType,
    String subject,
    String message,
    String status,
    LocalDateTime createdAt
) {}
```

⚠️ Use the **exact same field names** shown above — the UI code expects them.

---

## Step 2 — Build the Repository Method

In `ContactRepository`, create a derived query method to fetch contacts by status:

```java
List<Contact> findContactsByStatus(String status);
```

Spring Data JPA will automatically generate the query: `SELECT * FROM contacts WHERE status = ?`

---

## Step 3 — Create Service Layer Logic

### Define the Abstract Method

In `IContactService`:

```java
List<ContactResponseDto> fetchNewContactMessages();
```

### Implement It

In `ContactServiceImpl`:

```java
@Override
public List<ContactResponseDto> fetchNewContactMessages() {
    List<Contact> contacts = contactRepository
        .findContactsByStatus(ApplicationConstants.NEW_MESSAGE);

    return contacts.stream()
        .map(this::transformToDto)
        .collect(Collectors.toList());
}

private ContactResponseDto transformToDto(Contact contact) {
    return new ContactResponseDto(
        contact.getId(),
        contact.getName(),
        contact.getEmail(),
        contact.getUserType(),
        contact.getSubject(),
        contact.getMessage(),
        contact.getStatus(),
        contact.getCreatedAt()
    );
}
```

Define constants in `ApplicationConstants`:

```java
public static final String NEW_MESSAGE = "NEW";
public static final String CLOSED_MESSAGE = "CLOSED";
```

---

## Step 4 — Create the Controller Endpoint

In `ContactController`:

```java
@GetMapping("/admin")
public ResponseEntity<List<ContactResponseDto>> fetchNewContactMessages() {
    List<ContactResponseDto> responseDtos = contactService.fetchNewContactMessages();
    return ResponseEntity.ok(responseDtos);
}
```

The path ends with `/admin` — a naming convention that signals this endpoint is admin-only.

---

## Step 5 — Configure Authorization

### Define Admin Paths

In `PathsConfig`, create a new bean:

```java
@Bean("adminPaths")
public String[] adminPaths() {
    return new String[]{"/api/contacts/admin"};
}
```

### Apply hasRole() in Security Config

In `JobPortalSecurityConfig`, inject the admin paths and configure authorization:

```java
@Autowired
@Qualifier("adminPaths")
private String[] adminPaths;
```

In the security filter chain, add authorization rules in this **exact order**:

```java
// 1. Public paths first
.requestMatchers(permitAllPaths).permitAll()

// 2. Authorization-restricted paths
.requestMatchers(adminPaths).hasRole("ADMIN")

// 3. Any other secured path — just needs authentication
.requestMatchers(securedPaths).authenticated()

// 4. Everything else — deny
.anyRequest().denyAll()
```

⚠️ **Order matters!** `permitAll()` → Authorization rules → `authenticated()` → `denyAll()`

### Why `hasRole("ADMIN")` and Not `hasRole("ROLE_ADMIN")`?

When you call `hasRole("ADMIN")`, Spring Security automatically adds the `ROLE_` prefix internally. So it checks against `ROLE_ADMIN` in the user's authorities — which is exactly what we stored in the database.

---

## Step 6 — Testing with Postman

### Test as Regular User

1. Get CSRF token
2. Login as `john@gmail.com` (regular job seeker) → Get JWT token
3. Call `GET /api/contacts/admin` with the JWT token
4. **Result:** `401 Unauthorized` ❌

The user is authenticated but doesn't have the `ADMIN` role.

### Test as Admin User

1. Login as `admin@gmail.com` → Get JWT token
2. Call `GET /api/contacts/admin` with the admin JWT token
3. **Result:** `200 OK` with all 16 contact messages ✅

---

## The 401 vs 403 Problem

Wait — when a regular user tried to access an admin endpoint, we got `401 Unauthorized` instead of `403 Forbidden`. That's wrong! A `401` means "you're not authenticated," but the user *is* authenticated — they just don't have the right role.

Why is this happening? Because by default, Spring Security uses `BasicAuthenticationEntryPoint`, which always returns `401` for any security exception — whether it's authentication or authorization.

We'll fix this in the next lecture by customizing the error handling.

---

## ✅ Key Takeaways

- Create DTOs to shape API responses — don't expose entity objects directly
- Use `hasRole("ADMIN")` in security config — Spring auto-adds the `ROLE_` prefix
- **Order of security rules matters:** permitAll → hasRole → authenticated → denyAll
- Naming your path with `/admin` makes it immediately clear which endpoints are restricted
- The default Spring Security behavior returns `401` for both auth failures — customize this!

## ⚠️ Common Mistake

> Placing `authenticated()` rules **before** `hasRole()` rules. If a path matches `authenticated()` first, the authorization check with `hasRole()` will never be reached. Always put more specific rules first.
