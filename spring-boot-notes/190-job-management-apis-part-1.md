# Creating Job Management APIs for Employers — Part 1

## Introduction

With caching covered, it's time to build the **employer-facing functionality** in our job portal. Remember, our application has three roles: Job Seeker, Employer, and Admin. The employer can:
- **View all jobs** posted by their company
- **Update the status** of a job (Active, Closed, Draft)
- **Post a new job**

In this lecture, we'll build the first two REST APIs — fetching employer jobs and updating job status.

---

## Setting Up the Employer — Admin Assigns Company

Before an employer can manage jobs, the **admin must assign them to a company**. Here's the flow:

1. Admin logs in → goes to **Employer Management**
2. Searches for the employer by email (e.g., `sanjana@gmail.com`)
3. Assigns the employer to a company (e.g., Apple) using a dropdown
4. Now Sanjana can log in as employer and see Apple's jobs

Without a company assignment, the employer sees a "failed to fetch jobs" error — because there's no company to pull jobs from.

---

## Project Structure

All employer-related code lives under a new package:

```
com.example.jobportal
└── job
    ├── controller
    │   └── JobController.java
    └── service
        ├── IJobService.java
        └── JobServiceImpl.java
```

---

## REST API 1: Get Employer Jobs

### 🧠 What does it do?

Fetches all jobs posted by the company that the current employer is assigned to.

### The Controller

```java
@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @GetMapping("/employer/v1.0")
    public ResponseEntity<List<JobDto>> getEmployerJobs(Authentication authentication) {
        String employerEmail = authentication.getName();
        List<JobDto> jobs = jobService.getEmployerJobs(employerEmail);
        return ResponseEntity.ok(jobs);
    }
}
```

### Key Design Decision: Using `Authentication` Object

Notice we're not accepting the email as a request parameter. Instead, we inject `Authentication` — Spring Security automatically populates this with the **currently logged-in user's details**.

Why?
- **Security** — we don't trust client-provided email; we use the authenticated identity
- **Simplicity** — client doesn't need to pass anything
- `authentication.getName()` returns the username (which is the email in our app)

### The Service Implementation

```java
@Service
@Transactional(readOnly = true)
public class JobServiceImpl implements IJobService {

    @Override
    public List<JobDto> getEmployerJobs(String employerEmail) {
        // 1. Fetch the employer user
        JobPortalUser employer = userRepository.findByEmail(employerEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Check if company is assigned
        if (employer.getCompany() == null) {
            throw new RuntimeException("No company assigned to this employer");
        }

        // 3. Get all jobs for the company
        List<Job> jobs = employer.getCompany().getJobs();

        // 4. Transform to DTOs
        return jobs.stream()
            .map(ApplicationUtility::transformJobToDto)
            .collect(Collectors.toList());
    }
}
```

### How Does `getCompany().getJobs()` Work?

This leverages JPA relationships:
- `JobPortalUser` has a `@ManyToOne` relationship with `Company` — fetched eagerly
- `Company` has a `@OneToMany` relationship with `Job` — all associated jobs are loaded

So when we call `employer.getCompany().getJobs()`, Hibernate loads **all jobs** for that company — regardless of status (active, closed, draft). The employer sees everything.

### Utility Method: Entity to DTO Transformation

The `transformJobToDto()` method was moved to `ApplicationUtility` because it's needed in multiple places:
- `JobServiceImpl` — for employer's job list
- `CompanyServiceImpl` — for homepage company + jobs display

```java
public class ApplicationUtility {
    public static JobDto transformJobToDto(Job job) {
        // Copy matching fields from entity to DTO
        // Return the DTO
    }
}
```

> 💡 **Pro Tip:** When you find yourself duplicating transformation logic across services, extract it into a utility class. This follows the DRY (Don't Repeat Yourself) principle.

---

## Securing Employer Endpoints

### Path Configuration

All employer-related paths are defined in a dedicated bean:

```java
// PathsConfig
@Bean
public List<String> employerPaths() {
    return List.of("/api/jobs/employer/**");
}
```

### Security Configuration

In `JobPortalSecurityConfig`, the employer paths are restricted to users with `ROLE_EMPLOYER`:

```java
@Autowired
private List<String> employerPaths;

// In security filter chain:
.requestMatchers(employerPaths.toArray(new String[0]))
    .hasRole("EMPLOYER")
```

Anyone without the `EMPLOYER` role gets a **403 Forbidden** error.

---

## REST API 2: Update Job Status

### 🧠 What does it do?

Allows the employer to change a job's status between: **Active**, **Closed**, **Draft**.

### The Flow

```
New Job → Status: DRAFT
Employer reviews → Changes to: ACTIVE (visible to job seekers)
Enough applicants → Changes to: CLOSED (no longer visible)
Want to re-open → Changes to: ACTIVE
```

### The Controller

```java
@PatchMapping("/employer/v1.0/{jobId}")
public ResponseEntity<JobDto> updateJobStatus(
        @PathVariable Long jobId,
        @RequestBody Map<String, String> requestBody,
        Authentication authentication) {

    String status = requestBody.get("status");
    if (status == null || status.isEmpty()) {
        return ResponseEntity.badRequest().build();
    }

    String employerEmail = authentication.getName();
    JobDto updatedJob = jobService.updateJobStatus(jobId, status, employerEmail);
    return ResponseEntity.ok(updatedJob);
}
```

### Why `Map<String, String>` Instead of a DTO?

Since we're only receiving a single field (`status`), using a full DTO class would be overkill. A `Map<String, String>` keeps it simple:

```json
{
    "status": "ACTIVE"
}
```

> 💡 In production, a dedicated DTO is still cleaner. But for a single field, a Map is an acceptable shortcut.

### The Service Implementation

```java
@Transactional
@Override
public JobDto updateJobStatus(Long jobId, String status, String employerEmail) {
    // 1. Validate status
    if (!status.equals("ACTIVE") && !status.equals("CLOSED") && !status.equals("DRAFT")) {
        throw new RuntimeException("Invalid status. Must be ACTIVE, CLOSED, or DRAFT");
    }

    // 2. Fetch employer
    JobPortalUser employer = userRepository.findByEmail(employerEmail)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // 3. Verify company assignment
    if (employer.getCompany() == null) {
        throw new RuntimeException("No company assigned");
    }

    // 4. Find the specific job
    Job job = employer.getCompany().getJobs().stream()
        .filter(j -> j.getId().equals(jobId))
        .findFirst()
        .orElseThrow(() -> new RuntimeException("Job not found"));

    // 5. Update status
    job.setStatus(status);

    // 6. Return updated DTO
    return ApplicationUtility.transformJobToDto(job);
}
```

### Why No `save()` Call?

Notice we call `job.setStatus(status)` but never call `repository.save(job)`. Why?

Because the `job` entity was **loaded from the database** through JPA relationships — Hibernate is **tracking** this object. When the `@Transactional` method completes, Hibernate automatically detects the change and commits it to the database.

This is called **dirty checking** — one of Hibernate's core features.

> ⚠️ This only works because the entity was loaded within the same transaction. If you create a **new** entity object (not loaded from DB), you MUST call `save()` explicitly.

### Why `@Transactional` Is Required

The class-level `@Transactional(readOnly = true)` doesn't allow writes. Since this method updates data, we override it with `@Transactional` (without `readOnly`).

---

## ✅ Key Takeaways

1. Use the `Authentication` object to get the current user — never trust client-provided identity.
2. JPA relationships (`@ManyToOne`, `@OneToMany`) let you navigate entity graphs seamlessly — `employer.getCompany().getJobs()`.
3. **Dirty checking** — Hibernate auto-commits changes to tracked entities; no `save()` needed for existing entities.
4. Secure employer endpoints using `hasRole("EMPLOYER")` in the security configuration.
5. Use `@PatchMapping` for partial updates (like changing just the status).
6. Always **validate** input data (status must be ACTIVE, CLOSED, or DRAFT).
7. Extract shared transformation logic into utility classes to avoid duplication.

⚠️ **Common Mistake:** Forgetting to add `@Transactional` on methods that modify data. Without it, the database changes won't be committed, and you'll end up with silent failures.
