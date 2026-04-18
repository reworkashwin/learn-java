# Implementing Job Application Workflow Using REST APIs

## Introduction

The "Apply for Job" feature is the **core purpose** of any job portal. We've designed the `job_applications` table, created the JPA entity with `@ManyToOne` relationships, and set up the repository. Now it's time to build the **three REST APIs** that power the workflow: apply, withdraw, and list applications. This lecture covers the complete implementation with all the business logic details.

---

## The Three REST APIs at a Glance

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | `POST` | `/api/v1/job-applications/jobseeker` | Apply for a job |
| 2 | `DELETE` | `/api/v1/job-applications/{jobId}/jobseeker` | Withdraw an application |
| 3 | `GET` | `/api/v1/job-applications/jobseeker` | List all applied jobs |

---

## The Apply Job Request DTO

```java
public record ApplyJobRequestDto(
    @NotNull Long jobId,
    String coverLetter  // Optional — no validation annotations
) {}
```

- `jobId` is mandatory — you can't apply without specifying which job
- `coverLetter` is optional — some users skip it, and that's fine

---

## API 1: Apply for a Job

### Controller

```java
@PostMapping("/api/v1/job-applications/jobseeker")
public ResponseEntity<JobApplicationDto> applyForJob(
    @RequestBody @Valid ApplyJobRequestDto dto,
    Authentication authentication
) {
    String email = authentication.getName();
    JobApplicationDto result = userService.applyForJob(email, dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(result);
}
```

Key observations:
- `@RequestBody @Valid` — validates that `jobId` is not null
- Returns `201 CREATED` — because we're creating a new resource

### Service Layer — Step by Step

```java
@Transactional
public JobApplicationDto applyForJob(String email, ApplyJobRequestDto dto) {
    // Step 1: Fetch the user
    JobPortalUser user = userRepository.findByEmail(email);

    // Step 2: Check for duplicate application
    if (jobApplicationRepository.existsByUserIdAndJobId(user.getId(), dto.jobId())) {
        throw new RuntimeException("You have already applied for this job");
    }

    // Step 3: Fetch the job
    Job job = jobRepository.findById(dto.jobId())
        .orElseThrow(() -> new RuntimeException("Job not found"));

    // Step 4: Create the application
    JobApplication application = new JobApplication();
    application.setUser(user);
    application.setJob(job);
    application.setAppliedAt(LocalDateTime.now());
    application.setStatus("PENDING");
    application.setCoverLetter(dto.coverLetter());

    // Step 5: Save it
    jobApplicationRepository.save(application);

    // Step 6: Update application count on the job
    job.setApplicationsCount(
        (job.getApplicationsCount() == null ? 0 : job.getApplicationsCount()) + 1
    );
    // No need to call jobRepository.save(job) — it's tracked by Hibernate

    // Step 7: Convert to DTO and return
    return mapToJobApplicationDto(application);
}
```

### Deep Dive on Each Step

#### Step 2: Duplicate Prevention

Before creating a new application, we check if one already exists:

```java
boolean existsByUserIdAndJobId(Long userId, Long jobId);
```

This is a **derived query method** in the repository — Spring Data JPA generates the SQL automatically. Without this check, a user could apply for the same job multiple times (the unique constraint would throw a database error, but catching it early gives a better user experience).

#### Step 4: Setting the Status

The initial status is always `"PENDING"`. The status lifecycle looks like:

```
PENDING → REVIEWED → SHORTLISTED → INTERVIEWED → OFFERED
                                                 → REJECTED
PENDING → WITHDRAWN (by the applicant)
```

Only the employer can move the status forward. The applicant can only `WITHDRAW`.

#### Step 6: Updating Application Count

Every job has an `applicationsCount` column. When someone applies, we increment it. Why? So the jobs listing page can show "15 applicants" without running a count query every time.

Notice we handle `null` gracefully — if the count hasn't been set yet, treat it as 0.

Also notice: **we don't call `jobRepository.save(job)`**. The `job` object was loaded from the database within this `@Transactional` method, so Hibernate tracks it. The updated count will be persisted automatically when the transaction commits.

#### Step 7: The JobApplicationDto

```java
public record JobApplicationDto(
    Long id,
    Long userId,
    Long jobId,
    LocalDateTime appliedAt,
    String status,
    String coverLetter,
    String notes,
    ProfileDto profile,
    JobDto job
) {}
```

The DTO includes not just the application data, but also the **user's profile** and **job details**. Why? Because when an employer views applicants, they need to see the candidate's profile (name, experience, resume) alongside the application details — all in one response.

---

## API 2: Withdraw an Application

### Controller

```java
@DeleteMapping("/api/v1/job-applications/{jobId}/jobseeker")
public ResponseEntity<String> withdrawApplication(
    @PathVariable Long jobId,
    Authentication authentication
) {
    String email = authentication.getName();
    userService.withdrawApplication(email, jobId);
    return ResponseEntity.ok("Application withdrawn successfully");
}
```

### Service Layer

```java
@Transactional
public void withdrawApplication(String email, Long jobId) {
    JobPortalUser user = userRepository.findByEmail(email);

    // Verify the application exists
    if (!jobApplicationRepository.existsByUserIdAndJobId(user.getId(), jobId)) {
        throw new RuntimeException("No application found for this job");
    }

    // Delete the application
    jobApplicationRepository.deleteByUserIdAndJobId(user.getId(), jobId);

    // Decrement application count
    Job job = jobRepository.findById(jobId).orElseThrow();
    if (job.getApplicationsCount() != null && job.getApplicationsCount() > 0) {
        job.setApplicationsCount(job.getApplicationsCount() - 1);
    }
}
```

### Hard Delete vs. Soft Delete

In this demo, we **hard delete** the application record — it's completely removed from the database. In real enterprise applications, this is usually a bad idea. Instead, you'd do a **soft delete**:

```java
// Hard delete (what we're doing — for training)
jobApplicationRepository.deleteByUserIdAndJobId(userId, jobId);

// Soft delete (what enterprises do)
application.setStatus("WITHDRAWN");
application.setIsActive(false);
jobApplicationRepository.save(application);
```

With soft delete, the data is preserved for auditing, analytics, and legal compliance. The record is just flagged as inactive.

⚠️ **Common Mistake:** Using hard deletes in production. Always ask your team about the delete strategy before implementing.

---

## API 3: List All Applied Jobs

### Controller

```java
@GetMapping("/api/v1/job-applications/jobseeker")
public ResponseEntity<List<JobApplicationDto>> getAppliedJobs(
    Authentication authentication
) {
    String email = authentication.getName();
    List<JobApplicationDto> applications = userService.getJobSeekerApplications(email);
    return ResponseEntity.ok(applications);
}
```

### Service Layer

```java
public List<JobApplicationDto> getJobSeekerApplications(String email) {
    JobPortalUser user = userRepository.findByEmail(email);

    return user.getJobApplications().stream()
        .map(this::mapToJobApplicationDto)
        .collect(Collectors.toList());
}
```

The `getJobApplications()` call triggers a lazy load — Hibernate fetches all `JobApplication` records for this user using the `@OneToMany` mapping. Then we stream through them, converting each to a DTO.

---

## Security Configuration

```java
@Bean
public String[] jobSeekerPaths() {
    return new String[] {
        "/api/v1/profile/jobseeker",
        "/api/v1/saved-jobs/*/jobseeker",
        "/api/v1/saved-jobs/jobseeker",
        "/api/v1/job-applications/*/jobseeker",
        "/api/v1/job-applications/jobseeker",
    };
}
```

The same path pattern serves both `POST` and `GET` for `/job-applications/jobseeker`. Spring differentiates by HTTP method. Two new path entries cover all three APIs.

---

## ✅ Key Takeaways

1. **Always check for duplicates** before creating records — use `existsByUserIdAndJobId()`
2. **Explicit `save()` is mandatory** for new entities created with `new` — Hibernate doesn't track them
3. **Tracked entities** (loaded from DB) don't need explicit `save()` — dirty checking handles updates
4. **Application count** is a denormalized field for performance — update it on apply/withdraw
5. **Soft delete > hard delete** in production — preserve data for auditing
6. **Status lifecycle** begins at `PENDING` — only the employer moves it forward
7. **DTOs can contain nested DTOs** (ProfileDto, JobDto inside JobApplicationDto) — useful for complex responses
8. **`@Transactional`** is essential on methods that create or delete records
9. **Derived query methods** (`existsBy...`, `deleteBy...`, `findBy...OrderBy...`) keep repository code clean
