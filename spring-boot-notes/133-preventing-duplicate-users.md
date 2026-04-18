# Preventing Duplicate Users Using Derived Query Methods

## Introduction

In the previous lesson, we built a registration API that saves users to the database. But there's a critical gap: **nothing stops a user from registering twice** with the same email or mobile number. If they try, we'd get either a database unique constraint violation (ugly 500 error) or — worse — duplicate accounts.

In this lesson, we fix both problems from the previous lecture using derived query methods:
1. Replace `findById(1L)` with a proper **name-based role lookup**.
2. Add **duplicate user detection** before saving.

---

## Problem 1: Replacing `findById(1L)` for Role Lookup

### ❌ The Fragile Approach

```java
Role role = roleRepository.findById(1L).orElseThrow();
```

Primary key IDs can differ across environments. ID `1` might be `ROLE_JOB_SEEKER` in dev but `ROLE_ADMIN` in production.

### ✅ The Proper Approach: Query by Name

Define a derived query method in `RoleRepository`:

```java
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findRoleByName(String name);
}
```

#### Understanding the Method Name

| Part     | Meaning                          |
|---------|----------------------------------|
| `find`  | Introducer — SELECT operation    |
| `Role`  | Infix — optional, improves readability ("find a Role") |
| `By`    | Separator                        |
| `Name`  | Criteria — filter by the `name` field |

Behind the scenes, Spring generates:
```sql
SELECT * FROM roles WHERE name = ?
```

### Using It in the Controller

```java
private static final String ROLE_JOB_SEEKER = "ROLE_JOB_SEEKER";

Role role = roleRepository.findRoleByName(ROLE_JOB_SEEKER)
    .orElseThrow(() -> new RuntimeException("Role not found: " + ROLE_JOB_SEEKER));
jobPortalUser.setRole(role);
```

- We use a **constant** for the role name — no magic strings scattered around.
- `orElseThrow()` gives a clear error if the role doesn't exist.
- Now the code works correctly regardless of what primary key the role has.

---

## Problem 2: Preventing Duplicate Registrations

### ❓ What Could Go Wrong?

If a user registers with an email or mobile number that already exists in the database:

- The database UNIQUE constraint will fail → **500 Internal Server Error** → terrible user experience.
- We should catch this **before** attempting to save and return a friendly error message.

### ⚙️ Step 1: Create the Derived Query Method

We need to check if a user already exists with the given email **OR** mobile number:

```java
public interface JobPortalUserRepository extends JpaRepository<JobPortalUser, Long> {
    Optional<JobPortalUser> readUserByEmailOrMobileNumber(String email, String mobileNumber);
}
```

#### Breaking Down the Method Name

| Part           | Meaning                                |
|---------------|----------------------------------------|
| `read`        | Introducer — SELECT (same as `find`)   |
| `User`        | Infix — readability ("read a User")    |
| `By`          | Separator                              |
| `Email`       | First criteria field                   |
| `Or`          | Logical OR operator                    |
| `MobileNumber`| Second criteria field                  |

Generated SQL:
```sql
SELECT * FROM users WHERE email = ? OR mobile_number = ?
```

### ⚙️ Step 2: Check for Duplicates Before Saving

```java
Optional<JobPortalUser> existingUser = jobPortalUserRepository
    .readUserByEmailOrMobileNumber(
        registerRequestDto.email(), 
        registerRequestDto.mobileNumber()
    );

if (existingUser.isPresent()) {
    Map<String, String> errors = new HashMap<>();
    JobPortalUser found = existingUser.get();
    
    if (found.getEmail().equals(registerRequestDto.email())) {
        errors.put("email", "Email is already registered");
    }
    if (found.getMobileNumber().equals(registerRequestDto.mobileNumber())) {
        errors.put("mobileNumber", "Mobile number is already registered");
    }
    
    return ResponseEntity.badRequest().body(errors);
}
```

### 🔍 How This Works

1. **Query the database** for any user matching the email OR mobile number.
2. **If found**: Build an error map identifying exactly which field(s) are duplicated.
3. **Return 400 Bad Request** with the error details — the UI can display specific messages.
4. **If not found**: Proceed with normal registration.

### Handling Mixed Return Types

Since the happy path returns a `String` and the error path returns a `Map`, change the method signature to use a wildcard:

```java
public ResponseEntity<?> registerUser(...)
```

The `?` tells Spring Boot: "I'll return whatever type makes sense in context."

---

## The Complete Registration Flow

Here's the full, improved registration logic:

```java
@PostMapping("/api/register/public/v1.0")
public ResponseEntity<?> registerUser(@RequestBody RegisterRequestDto dto) {

    // 1. Check for duplicate user
    Optional<JobPortalUser> existing = jobPortalUserRepository
        .readUserByEmailOrMobileNumber(dto.email(), dto.mobileNumber());
    
    if (existing.isPresent()) {
        Map<String, String> errors = new HashMap<>();
        if (existing.get().getEmail().equals(dto.email())) {
            errors.put("email", "Email is already registered");
        }
        if (existing.get().getMobileNumber().equals(dto.mobileNumber())) {
            errors.put("mobileNumber", "Mobile number is already registered");
        }
        return ResponseEntity.badRequest().body(errors);
    }

    // 2. Create entity and copy properties
    JobPortalUser user = new JobPortalUser();
    BeanUtils.copyProperties(dto, user);

    // 3. Hash the password
    user.setPasswordHash(passwordEncoder.encode(dto.password()));

    // 4. Assign default role
    Role role = roleRepository.findRoleByName(ROLE_JOB_SEEKER)
        .orElseThrow(() -> new RuntimeException("Default role not found"));
    user.setRole(role);

    // 5. Save to database
    jobPortalUserRepository.save(user);

    return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
}
```

---

## ✅ Key Takeaways

- Always query by **meaningful business values** (role name), not primary key IDs.
- Use `Optional<>` as return type for derived queries that might return no results — it forces callers to handle the "not found" case.
- Check for duplicates **before** saving — don't let the database throw constraint violations at your users.
- Use `ResponseEntity<?>` when your endpoint might return different types in different scenarios.
- Use constants for repeated strings like role names.

## ⚠️ Common Mistakes

- **Querying by primary key for business lookups** — IDs are environment-specific; names are universal.
- **Not checking for duplicates** — leads to ugly 500 errors or, worse, duplicate data.
- **Hardcoding role names as strings everywhere** — use constants to avoid typos and enable refactoring.

## 💡 Pro Tips

- The `read` introducer works the same as `find` — use whichever reads more naturally.
- Infixes (like `User` in `readUserByEmail`) are optional but make methods self-documenting.
- IntelliJ Ultimate can generate and test derived query methods interactively — a huge productivity boost.
