# Creating Job Management APIs for Employers — Part 2

## Introduction

In Part 1, we built APIs for fetching employer jobs and updating job status. Now let's complete the employer functionality by building the **Create Job** REST API — the endpoint that lets employers post brand new job listings. We'll also test everything end-to-end with both the UI and Postman.

---

## REST API 3: Create a New Job

### 🧠 What does it do?

Allows an employer to post a new job requirement for their company. The job starts with a **draft** status by default.

### The Controller

```java
@PostMapping("/employer/v1.0")
public ResponseEntity<JobDto> createJob(
        @Valid @RequestBody JobDto jobDto,
        Authentication authentication) {

    String employerEmail = authentication.getName();
    JobDto savedJob = jobService.createJob(jobDto, employerEmail);
    return ResponseEntity.status(HttpStatus.CREATED).body(savedJob);
}
```

### Key Points in the Controller

1. **`@Valid`** — Triggers Jakarta Bean Validation on the incoming `JobDto`. If validations fail, Spring returns a `400 Bad Request` automatically.
2. **`@RequestBody JobDto`** — The full job details come from the client as JSON.
3. **`Authentication`** — We extract the employer's email from the security context, not from the request body.

---

## Adding Validations to the DTO

The `JobDto` already existed, but now we add validation annotations to enforce data integrity:

```java
public class JobDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Minimum salary is required")
    @DecimalMin(value = "0.0", message = "Minimum salary must be positive")
    private Double salaryMin;

    @NotNull(message = "Maximum salary is required")
    @DecimalMin(value = "0.0", message = "Maximum salary must be positive")
    private Double salaryMax;

    @NotBlank(message = "Job type is required")
    private String jobType;

    // ... other fields with appropriate validations
}
```

> ⚠️ **Important:** Make sure your DTO field names match exactly what the frontend application sends. Mismatched field names = silent data loss.

---

## The Service Implementation

```java
@Transactional
@Override
public JobDto createJob(JobDto jobDto, String employerEmail) {
    // 1. Validate employer exists
    JobPortalUser employer = userRepository.findByEmail(employerEmail)
        .orElseThrow(() -> new RuntimeException("Employer not found"));

    // 2. Verify company assignment
    if (employer.getCompany() == null) {
        throw new RuntimeException("No company assigned to this employer");
    }

    // 3. Transform DTO to Entity
    Job job = transformDtoToJob(jobDto);

    // 4. Set system-controlled fields
    job.setPostedDate(Instant.now());
    job.setApplicationsCount(0);
    job.setStatus("DRAFT");

    // 5. Assign to company
    job.setCompany(employer.getCompany());

    // 6. Save (MUST call save — this is a NEW entity!)
    Job savedJob = jobRepository.save(job);

    // 7. Return DTO
    return ApplicationUtility.transformJobToDto(savedJob);
}
```

### Understanding the Transformation

The `transformDtoToJob` method converts DTO fields to entity fields:

```java
private Job transformDtoToJob(JobDto dto) {
    Job job = new Job();
    BeanUtils.copyProperties(dto, job);
    return job;
}
```

`BeanUtils.copyProperties()` copies matching field values from source (DTO) to target (entity). Fields with the same name and compatible types are automatically mapped.

### System-Controlled Fields

Some fields should **not** come from the client:

| Field | Value | Why |
|-------|-------|-----|
| `postedDate` | `Instant.now()` | Server determines when the job was posted |
| `applicationsCount` | `0` | New job has zero applications |
| `status` | `"DRAFT"` | New jobs start as drafts |

> 💡 **Pro Tip:** Never trust the client to set system fields like timestamps, counters, or statuses. Always override them on the server side to prevent manipulation.

### Why `save()` is Required Here (But Wasn't in Update)

Remember from Part 1 — when we updated job status, we didn't call `save()` because the entity was **loaded from the database** and tracked by Hibernate.

Here, we created a **brand new `Job` object** using `new Job()`. Hibernate is NOT tracking this object. So we MUST call `jobRepository.save(job)` explicitly.

```
Existing entity (loaded from DB) → Hibernate tracks it → Auto-commits changes
New entity (created with 'new') → Hibernate doesn't know about it → Must call save()
```

### Why `@Transactional` is Needed

This method performs a database **write** operation. The class-level `@Transactional(readOnly = true)` would prevent this. By adding `@Transactional` at the method level, we override the read-only behavior for this specific method.

---

## The Default Status Problem

Originally, the SQL `CREATE TABLE` statement defined `status` with a default value of `ACTIVE`:

```sql
CREATE TABLE jobs (
    ...
    status VARCHAR(20) DEFAULT 'ACTIVE'
    ...
);
```

This meant new jobs were immediately visible to job seekers — which isn't ideal. The employer should review the listing before making it active.

**Fix:** Override the default in the service layer:

```java
job.setStatus("DRAFT");
```

Now the flow is:
1. Employer posts a job → status = **DRAFT** (not visible to seekers)
2. Employer reviews and activates → status = **ACTIVE** (visible)
3. Enough applicants received → status = **CLOSED** (hidden again)

---

## Testing with the UI

### Posting a New Job

1. Log in as employer (e.g., `sanjana@gmail.com`)
2. Click **Post New Job**
3. Fill in details: title, location, description, job type, salary, etc.
4. Click **Post Job**
5. Job appears in the list with **Draft** status
6. Employer can change status to Active when ready

### Updating Status

In the job list:
- **A** button → changes status to Active
- **C** button → changes status to Closed
- **D** button → changes status to Draft

Click any status button → database updates instantly → page reflects the change.

---

## Testing with Postman

### Step 1: Authenticate as Employer

```
POST /api/auth/login
Body: {
    "username": "sanjana@gmail.com",
    "password": "..."
}
```

Copy the JWT token from the response.

### Step 2: Create a Job

```
POST /api/jobs/employer/v1.0
Headers:
    Authorization: Bearer <JWT_TOKEN>
    X-CSRF-TOKEN: <CSRF_TOKEN>
Body: {
    "title": "Java Backend Developer",
    "location": "Hyderabad",
    "description": "Looking for a skilled Java developer...",
    "jobType": "FULL_TIME",
    "workType": "ONSITE",
    "category": "TECHNOLOGY",
    "experienceLevel": "MID_LEVEL",
    "salaryMin": 80000,
    "salaryMax": 120000,
    "currency": "USD",
    "salaryPeriod": "YEAR",
    "featured": true,
    "urgentHiring": true,
    "remoteFriendly": true,
    "requirements": "5+ years Java experience...",
    "benefits": "Health insurance, 401k..."
}
```

Response: `201 Created` with the job DTO (status = "DRAFT").

### Step 3: Update Job Status

```
PATCH /api/jobs/employer/v1.0/{jobId}
Headers:
    Authorization: Bearer <JWT_TOKEN>
    X-CSRF-TOKEN: <CSRF_TOKEN>
Body: {
    "status": "ACTIVE"
}
```

Response: `200 OK` with updated job DTO.

---

## Summary of All Three Employer REST APIs

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/jobs/employer/v1.0` | Fetch all jobs for employer's company |
| `POST` | `/api/jobs/employer/v1.0` | Create a new job |
| `PATCH` | `/api/jobs/employer/v1.0/{jobId}` | Update job status |

---

## ✅ Key Takeaways

1. **`@Valid`** on `@RequestBody` triggers automatic validation — annotate DTO fields with `@NotBlank`, `@NotNull`, `@DecimalMin`, etc.
2. **New entities must be saved explicitly** — `jobRepository.save(job)`. Hibernate only auto-commits changes on entities it's already tracking.
3. **Override system fields** (status, posted date, application count) on the server — never trust client input for these.
4. Use `BeanUtils.copyProperties()` to quickly copy matching fields between DTO and entity.
5. Always **use the same field names and API paths** as the UI expects — otherwise the frontend won't work.
6. Default status should be **DRAFT**, not ACTIVE — gives the employer a chance to review before publishing.
7. `@PatchMapping` is ideal for partial updates (like status change), `@PostMapping` for full resource creation.

⚠️ **Common Mistake:** Not removing `status` from the `@Valid` DTO when the server should control it. If `@NotBlank` is on the `status` field, the client must send it — but we want the server to set it to "DRAFT". Remove the validation annotation from `status`.

💡 **Pro Tip:** Build your own REST APIs following this pattern. Don't just read the code — type it out yourself. You'll learn more about the design decisions when you hit the same problems and have to solve them.
