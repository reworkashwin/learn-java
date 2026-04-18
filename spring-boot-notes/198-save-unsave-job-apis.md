# Building Save & Unsave Job APIs — Bookmarking Feature

## Introduction

With the `@ManyToMany` relationship configured between users and jobs, it's time to build the **REST APIs** that power the bookmarking feature. We need three APIs: **save a job**, **unsave a job**, and **get all saved jobs**. This lecture walks through the complete implementation — controller, service layer, and a hands-on demo with both the UI and Postman.

---

## The Three REST APIs

| # | HTTP Method | Path | Purpose |
|---|-------------|------|---------|
| 1 | `POST` | `/api/v1/saved-jobs/{jobId}/jobseeker` | Save (bookmark) a job |
| 2 | `DELETE` | `/api/v1/saved-jobs/{jobId}/jobseeker` | Unsave (unbookmark) a job |
| 3 | `GET` | `/api/v1/saved-jobs/jobseeker` | Get all saved jobs for the logged-in user |

Notice the pattern: all paths end with `/jobseeker` to enforce that only users with the `JOB_SEEKER` role can access them.

---

## API 1: Save a Job

### Controller

```java
@PostMapping("/api/v1/saved-jobs/{jobId}/jobseeker")
public ResponseEntity<JobDto> saveJob(@PathVariable Long jobId,
                                       Authentication authentication) {
    String email = authentication.getName();
    JobDto savedJob = userService.saveJob(email, jobId);
    return ResponseEntity.status(HttpStatus.CREATED).body(savedJob);
}
```

- `@PostMapping` because we're **creating** a new entry in the join table
- `{jobId}` as a path variable — the client tells us which job to save
- Returns `201 CREATED` status with the saved job details

### Service Layer

```java
@Transactional
public JobDto saveJob(String email, Long jobId) {
    JobPortalUser user = userRepository.findByEmail(email);

    Job job = jobRepository.findById(jobId)
        .orElseThrow(() -> new RuntimeException("Job not found"));

    user.getSavedJobs().add(job);
    // No explicit save needed — Hibernate tracks the user entity

    return ApplicationUtility.mapToJobDto(job);
}
```

### Why No `userRepository.save(user)`?

This is a subtle but important point. The `user` object was **loaded from the database** by `findByEmail()`. Because of this, Hibernate is **already tracking it** in its persistence context. When the method ends (and the transaction commits), Hibernate automatically detects that `savedJobs` changed and runs the `INSERT` into the join table.

This is called **dirty checking** — Hibernate compares the current state of tracked entities against their original state and automatically persists any changes.

However, explicitly calling `save()` is not wrong — it's just unnecessary in this case. Both approaches work.

💡 **Pro Tip:** If the entity is loaded from the database within the same `@Transactional` method, you usually don't need to call `save()`. Hibernate handles it automatically.

---

## API 2: Unsave a Job

### Controller

```java
@DeleteMapping("/api/v1/saved-jobs/{jobId}/jobseeker")
public ResponseEntity<String> unsaveJob(@PathVariable Long jobId,
                                         Authentication authentication) {
    String email = authentication.getName();
    userService.unsaveJob(email, jobId);
    return ResponseEntity.ok("Job unsaved successfully");
}
```

- `@DeleteMapping` because we're **removing** an entry from the join table
- Returns `200 OK` with a confirmation message

### Service Layer

```java
@Transactional
public void unsaveJob(String email, Long jobId) {
    JobPortalUser user = userRepository.findByEmail(email);

    Job job = jobRepository.findById(jobId)
        .orElseThrow(() -> new RuntimeException("Job not found"));

    user.getSavedJobs().remove(job);
    // Hibernate will automatically DELETE from saved_jobs
}
```

Calling `remove()` on the `Set` tells Hibernate to delete the corresponding row from the `saved_jobs` join table. Behind the scenes:

```sql
DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?
```

---

## API 3: Get All Saved Jobs

### Controller

```java
@GetMapping("/api/v1/saved-jobs/jobseeker")
public ResponseEntity<List<JobDto>> getSavedJobs(Authentication authentication) {
    String email = authentication.getName();
    List<JobDto> savedJobs = userService.getSavedJobs(email);
    return ResponseEntity.ok(savedJobs);
}
```

### Service Layer

```java
public List<JobDto> getSavedJobs(String email) {
    JobPortalUser user = userRepository.findByEmail(email);

    return user.getSavedJobs().stream()
        .map(ApplicationUtility::mapToJobDto)
        .collect(Collectors.toList());
}
```

When `user.getSavedJobs()` is called, JPA **lazy-loads** the saved jobs. It goes to the `saved_jobs` join table, finds all `job_id` entries for the user, then fetches the full job details from the `jobs` table.

---

## Security Configuration

Add the new paths to the job seeker security configuration:

```java
@Bean
public String[] jobSeekerPaths() {
    return new String[] {
        "/api/v1/profile/jobseeker",
        "/api/v1/saved-jobs/*/jobseeker",   // Save and unsave
        "/api/v1/saved-jobs/jobseeker",      // Get saved jobs
    };
}
```

---

## End-to-End Demo — UI

### Saving Jobs

1. Log in as a job seeker (e.g., John)
2. Navigate to **Find Jobs**
3. Click the **heart/save icon** on any job → "Job saved" confirmation
4. Save 3-4 jobs from the list
5. Navigate to **Saved Jobs** → all saved jobs appear with unsave options

You can also save from the **Job Detail** page using the "Save Job" button.

### Verifying in the Database

Open the `saved_jobs` table:

| user_id | job_id |
|---------|--------|
| 3 | 901 |
| 3 | 905 |
| 3 | 912 |
| 3 | 918 |

User ID 3 (John) saved four jobs. Clean and simple.

### Unsaving Jobs

Click the heart icon again (or "Unsave") → job is removed from saved jobs. Database count decreases accordingly.

---

## End-to-End Demo — Postman

### Save a Job

**POST** `/api/v1/saved-jobs/912/jobseeker`
- Headers: Bearer token, CSRF token
- Body: none
- Response: `201 Created` with job details

### Get Saved Jobs

**GET** `/api/v1/saved-jobs/jobseeker`
- Headers: Bearer token
- Response: `200 OK` with array of saved job DTOs

### Unsave a Job

**DELETE** `/api/v1/saved-jobs/912/jobseeker`
- Headers: Bearer token, CSRF token
- Response: `200 OK` — "Job unsaved successfully"

---

## ✅ Key Takeaways

1. **Save = `add()` on the Set** → Hibernate inserts into the join table automatically
2. **Unsave = `remove()` on the Set** → Hibernate deletes from the join table automatically
3. **No explicit `save()` needed** for tracked entities within `@Transactional` — dirty checking handles it
4. **`@PostMapping`** for save (creating), **`@DeleteMapping`** for unsave (deleting), **`@GetMapping`** for reading
5. **Lazy loading** is the default for `@ManyToMany` — saved jobs are fetched only when accessed
6. **Security paths** must be updated whenever new API endpoints are added
7. **Stream API** with `map()` cleanly converts entity sets to DTO lists
8. **Always verify** in the database after testing — check that rows are inserted/deleted correctly
