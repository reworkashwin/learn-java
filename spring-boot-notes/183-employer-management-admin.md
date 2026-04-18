# Building Employer Management Features for Admin Users

## Introduction

With company management in place, the next admin feature is **Employer Management**. This is the bridge between user registration and job posting — an employer needs to be elevated from a regular Job Seeker role to an Employer role, and then assigned to a specific company.

In this lesson, we'll build three REST APIs that support: searching users by email, elevating a user to employer, and assigning a company to an employer.

---

## The Employer Onboarding Flow

Here's how a new employer joins the platform:

```
1. Person registers as a normal user → Gets ROLE_JOB_SEEKER by default
2. Person contacts the admin (offline negotiation)
3. Admin searches the user by email
4. Admin elevates the user to ROLE_EMPLOYER
5. Admin assigns the employer to a specific company
6. Employer can now log in and post jobs for that company
```

This multi-step process ensures that only authorized users can post jobs.

---

## API 1: Search User by Email — GET

### Controller (UserController — new class)

```java
@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping("/search/admin/v1.0")
    public ResponseEntity<UserDto> searchUser(@RequestParam String email) {
        Optional<UserDto> user = userService.searchUserByEmail(email);
        return user.map(ResponseEntity::ok)
                   .orElseThrow(() -> new ResponseStatusException(
                       HttpStatus.NOT_FOUND, "User not found with email: " + email));
    }
}
```

### Service (UserServiceImpl — new class)

```java
@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements IUserService {

    public Optional<UserDto> searchUserByEmail(String email) {
        Optional<JobPortalUser> user = userRepository.findJobPortalUserByEmail(email);
        return user.map(this::mapToUserDto);
    }

    private UserDto mapToUserDto(JobPortalUser user) {
        UserDto dto = new UserDto();
        // Copy relevant fields from entity to DTO
        return dto;
    }
}
```

### Repository — Derived Query Method

```java
Optional<JobPortalUser> findJobPortalUserByEmail(String email);
```

A simple derived query method — Spring Data JPA generates the SQL automatically based on the method name.

---

## API 2: Elevate User to Employer — PATCH

### Controller

```java
@PatchMapping("/elevate/admin/v1.0/{userId}")
public ResponseEntity<UserDto> elevateToEmployer(@PathVariable int userId) {
    UserDto updatedUser = userService.elevateToEmployer(userId);
    return ResponseEntity.ok(updatedUser);
}
```

> 💡 We use `@PatchMapping` because we're updating a **single field** (role ID) — not the entire user record.

### Service

```java
@Transactional  // Override readOnly — this modifies data
public UserDto elevateToEmployer(int userId) {
    // 1. Load the user
    JobPortalUser user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

    // 2. Check if already an employer
    if (user.getRole().getName().equals(ROLE_EMPLOYER)) {
        return mapToUserDto(user);  // Already an employer, return as-is
    }

    // 3. Prevent elevating admin users
    if (user.getRole().getName().equals(ROLE_ADMIN)) {
        throw new RuntimeException("Cannot elevate admin user to employer");
    }

    // 4. Fetch the EMPLOYER role and assign it
    Role employerRole = roleRepository.findByName(ROLE_EMPLOYER);
    user.setRole(employerRole);

    // 5. No need to call save() — Hibernate auto-flushes managed entities!
    return mapToUserDto(user);
}
```

### 💡 Key Insight — Managed Entity Auto-Flush

Notice we **don't call `userRepository.save(user)`** at the end. Why?

When you load an entity using `findById()` inside a `@Transactional` method, that entity becomes a **managed entity**. Hibernate tracks all changes to it. Before the transaction closes, Hibernate automatically flushes (commits) any modifications.

```
findById() → entity is "managed" by Hibernate
user.setRole(employerRole) → Hibernate detects the change
method exits → transaction commits → Hibernate auto-flushes the UPDATE
```

Calling `save()` is optional and redundant in this scenario.

---

## API 3: Assign Company to Employer — PATCH

### Controller

```java
@PatchMapping("/assign-company/admin/v1.0/{userId}/{companyId}")
public ResponseEntity<UserDto> assignCompany(@PathVariable int userId,
                                              @PathVariable int companyId) {
    UserDto updatedUser = userService.assignCompanyToEmployer(userId, companyId);
    return ResponseEntity.ok(updatedUser);
}
```

### Service

```java
@Transactional  // Override readOnly — this modifies data
public UserDto assignCompanyToEmployer(int userId, int companyId) {
    // 1. Load the user
    JobPortalUser user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // 2. Validate the user is an employer
    if (!user.getRole().getName().equals(ROLE_EMPLOYER)) {
        throw new RuntimeException("User must be an employer to be assigned a company");
    }

    // 3. Load the company
    Company company = companyRepository.findById(companyId)
        .orElseThrow(() -> new RuntimeException("Company not found"));

    // 4. Assign the company
    user.setCompany(company);

    // 5. Hibernate auto-flushes — no save() needed!
    return mapToUserDto(user);
}
```

Again, no explicit `save()` call needed — Hibernate's managed entity tracking handles the update automatically when the transaction commits.

---

## Spring Security — Restrict to Admin Only

Don't forget to add the new API paths to your admin security configuration:

```java
private String[] adminPaths() {
    return new String[]{
        "/users/search/admin/**",
        "/users/elevate/admin/**",
        "/users/assign-company/admin/**",
        // ... other admin paths
    };
}
```

---

## Business Validation Summary

| Scenario | Response |
|----------|----------|
| User not found | RuntimeException: "User not found" |
| User already an employer | Return current user details (no change) |
| User is an admin | RuntimeException: "Cannot elevate admin" |
| User is not an employer (for company assignment) | RuntimeException: "Must be employer" |
| Company not found | RuntimeException: "Company not found" |

---

## ✅ Key Takeaways

- Three APIs for employer management: Search (GET), Elevate (PATCH), Assign Company (PATCH)
- `@PatchMapping` is appropriate when updating a single field rather than the entire resource
- **Managed entities** in Hibernate auto-flush changes — explicit `save()` is optional inside `@Transactional` methods
- Business validations prevent invalid state transitions (e.g., admin → employer)
- Always update Spring Security paths for new admin APIs

## ⚠️ Common Mistakes

- Forgetting `@Transactional` on methods that modify the user entity — auto-flush won't work without a transaction
- Not validating role transitions — allowing admin users to be downgraded
- Forgetting Spring Security configuration — APIs become accessible to all authenticated users

## 💡 Pro Tips

- Hibernate's managed entity auto-flush is powerful but subtle — understand it well before relying on it
- Though `save()` is optional for managed entities, adding it explicitly makes code more readable for developers unfamiliar with Hibernate internals
- Build these APIs as an assignment first, then compare with the reference implementation
