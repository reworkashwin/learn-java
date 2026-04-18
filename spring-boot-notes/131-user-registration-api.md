# User Registration REST API

## Introduction

With our database tables, entities, and repositories in place, it's time to build the **registration REST API** — the endpoint that allows new users to create their own accounts. This is a critical piece of any application: without it, every user has to be manually created in the database.

In this lesson, we'll build the API step by step, encounter real errors, debug them, and iteratively improve the logic until it works.

---

## Building the Registration Endpoint

### 🧠 The Goal

Create a `POST` endpoint that:
1. Accepts user details (name, email, password, mobile number).
2. Hashes the password.
3. Assigns a default role.
4. Saves the user to the database.
5. Returns a success response.

### ⚙️ The Controller Method

```java
@PostMapping("/api/register/public/v1.0")
public ResponseEntity<String> registerUser(@RequestBody RegisterRequestDto registerRequestDto) {

    JobPortalUser jobPortalUser = new JobPortalUser();
    BeanUtils.copyProperties(registerRequestDto, jobPortalUser);

    // Hash the password before storing
    jobPortalUser.setPasswordHash(
        passwordEncoder.encode(registerRequestDto.password())
    );

    // Save to database
    jobPortalUserRepository.save(jobPortalUser);

    return ResponseEntity.status(HttpStatus.CREATED)
            .body("User registered successfully");
}
```

### 🔍 Step-by-Step Breakdown

#### Step 1: Copy Properties

```java
BeanUtils.copyProperties(registerRequestDto, jobPortalUser);
```

This copies matching field names from the DTO to the entity. Fields with **the same name** (`name`, `email`, `mobileNumber`) are copied automatically. But `password` → `passwordHash` does **not** match, so it's skipped.

#### Step 2: Hash the Password

```java
jobPortalUser.setPasswordHash(
    passwordEncoder.encode(registerRequestDto.password())
);
```

- The `PasswordEncoder` (BCrypt) takes the plain text password and generates a hash.
- We store the **hash** in the database, never the original password.
- The `encode()` method accepts raw password → returns hashed string.

#### Step 3: Save to Database

```java
jobPortalUserRepository.save(jobPortalUser);
```

JPA handles the INSERT statement behind the scenes.

---

## The First Error: Missing Role

### ❌ What Happened?

When we tested the API, we got a **500 Internal Server Error**:

> "Column 'role_id' cannot be null"

### ❓ Why?

The `role_id` column is `NOT NULL` in the database. We never assigned a role to the user before saving.

### ✅ The Fix

Fetch the default role and assign it before saving:

```java
Role role = roleRepository.findById(1L)
    .orElseThrow(() -> new RuntimeException("Default role not found"));
jobPortalUser.setRole(role);
```

This fetches the role with primary key `1` (which is `ROLE_JOB_SEEKER`) and assigns it to the user.

### ⚠️ Problem With This Approach

Using `findById(1L)` is **not production-safe**. Why?

- Primary key values can differ across environments (dev, staging, production).
- If someone re-orders the seed data, ID `1` might no longer be `ROLE_JOB_SEEKER`.

The right approach is to fetch by **role name** — but that requires **derived query methods**, which we'll learn in the next lesson.

---

## Making the Registration Path Public

Don't forget to add the registration endpoint to your public paths configuration:

```java
// In PathsConfig
public static final String[] PUBLIC_PATHS = {
    "/api/login/**",
    "/api/register/**"
};
```

Without this, Spring Security will block unauthenticated access to the registration endpoint.

---

## Injecting Required Dependencies

The controller needs three beans:

```java
private final PasswordEncoder passwordEncoder;
private final JobPortalUserRepository jobPortalUserRepository;
private final RoleRepository roleRepository;
```

- **`PasswordEncoder`** — to hash passwords (BCrypt bean from `SecurityConfig`).
- **`JobPortalUserRepository`** — to save user records.
- **`RoleRepository`** — to fetch the default role.

---

## What's Still Missing?

After getting the basic flow working, we identified two improvements needed:

1. **Duplicate check** — We're not verifying if a user with the same email or mobile number already exists. This could cause unique constraint violations.
2. **Role fetching** — We're using `findById(1L)` instead of querying by role name, which is fragile.

Both will be addressed in upcoming lessons using **derived query methods**.

---

## Where Should the Logic Live?

In this lesson, the registration logic lives directly in the **controller**. Typically, you'd move business logic to a **service layer**. However:

- Authentication logic is often limited in scope.
- For smaller applications, keeping it in the controller is acceptable.
- For enterprise applications with complex registration flows, definitely use a service layer.

---

## ✅ Key Takeaways

- Use `BeanUtils.copyProperties()` to transfer data from DTO → Entity when field names match.
- Always **hash passwords** with `PasswordEncoder.encode()` before storing.
- Assign a **default role** (`ROLE_JOB_SEEKER`) during registration — never let users choose.
- Mark the registration endpoint as a **public path** so unauthenticated users can access it.
- Using `findById(primaryKey)` for role lookup is fragile — prefer querying by name.

## ⚠️ Common Mistakes

- **Forgetting to assign a role** — causes NOT NULL constraint violations.
- **Not hashing the password** — storing plain text is a critical security vulnerability.
- **Not adding the endpoint to public paths** — users can't register if the endpoint is secured.

## 💡 Pro Tips

- When `BeanUtils.copyProperties()` skips fields (different names), handle those manually.
- Always return meaningful HTTP status codes: `201 Created` for successful registration, `400 Bad Request` for validation errors.
- Test your API with invalid data first to see which validations fire and which errors need handling.
