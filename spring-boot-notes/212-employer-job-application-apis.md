# Building Employer APIs to Manage Job Applications

## Introduction

When a job seeker applies for a job, their application sits with a `PENDING` status. But what happens next? The **employer** needs to review applicants, check resumes, and make decisions — interview, hire, or reject.

In this note, we build two new REST APIs that power the employer's side of the job application workflow: one to **view all applicants** for a job and another to **update an application's status and notes**.

---

## The Employer's Workflow

### 🧠 What the Employer Needs

1. **See all applicants** for a specific job posting
2. **View applicant profiles** — resume, skills, cover letter
3. **Update application status** — move from PENDING → IN_REVIEW → INTERVIEW → HIRED or REJECTED
4. **Add internal notes** — e.g., "Scheduled interview for Saturday", "Not suitable for this role"

### 🔄 Application Status Flow

```
PENDING → IN_REVIEW → INTERVIEW → HIRED
                              ↘ REJECTED
```

These statuses are defined as an **enum** to restrict the values the API accepts:

```java
public enum JobApplicationStatus {
    PENDING,
    IN_REVIEW,
    INTERVIEW,
    HIRED,
    REJECTED
}
```

---

## API 1: Get All Applicants for a Job

### ⚙️ The Endpoint

```
GET /api/applicants/{jobId}/employer
```

This endpoint is accessible **only to employers** — the path includes `/employer` and is registered under employer-specific security paths.

### 🧠 How It Works — Layer by Layer

**Controller Layer:**

```java
@GetMapping("/api/applicants/{jobId}/employer")
public ResponseEntity<List<JobApplicationDto>> getApplicants(@PathVariable int jobId) {
    List<JobApplicationDto> applicants = jobService.getJobApplicants(jobId);
    return ResponseEntity.ok(applicants);
}
```

**Service Layer:**

```java
public List<JobApplicationDto> getJobApplicants(int jobId) {
    List<JobApplication> applications =
        jobApplicationRepository.findByJobIdOrderByAppliedAtAsc(jobId);

    return applications.stream()
        .map(ApplicationUtility::mapToJobApplicationDto)
        .collect(Collectors.toList());
}
```

**Repository Layer:**

```java
public interface JobApplicationRepository extends JpaRepository<JobApplication, Integer> {
    List<JobApplication> findByJobIdOrderByAppliedAtAsc(int jobId);
}
```

This is a **derived query method** — Spring Data JPA generates the SQL automatically based on the method name.

### 🧠 The DTO Mapping

Each `JobApplication` entity is converted into a `JobApplicationDto` containing:

| Field | Source | Purpose |
|-------|--------|---------|
| `userId` | User entity | Identify the applicant |
| `name` | User entity | Display name |
| `email` | User entity | Contact info |
| `mobile` | User entity | Phone number |
| `profileDto` | Profile entity | Resume, photo, skills |
| `jobDto` | Job entity | Job details |
| `status` | JobApplication entity | Current application status |
| `appliedAt` | JobApplication entity | When they applied |
| `coverLetter` | JobApplication entity | Applicant's message |
| `notes` | JobApplication entity | Employer's internal notes |

The mapping method `mapToJobApplicationDto()` was moved to a shared `ApplicationUtility` class for reuse across `JobServiceImpl` and `UserServiceImpl`.

---

## API 2: Update Application Status & Notes

### ⚙️ The Endpoint

```
PUT /api/applicant/employer
```

### 🧠 The Input DTO

```java
public class UpdateJobApplicationDto {
    private int applicationId;
    private JobApplicationStatus status;  // Enum — only valid values accepted
    private String notes;
}
```

The `status` field uses the `JobApplicationStatus` enum, so the API **rejects invalid status values** automatically.

### ⚙️ Controller Layer

```java
@PutMapping("/api/applicant/employer")
public ResponseEntity<String> updateApplication(
        @RequestBody @Valid UpdateJobApplicationDto dto) {

    boolean updated = jobService.updateApplicationStatusAndNotes(dto);

    if (updated) {
        return ResponseEntity.ok("Application updated successfully");
    }
    return ResponseEntity.badRequest().body("Failed to update application");
}
```

### ⚙️ Service Layer

```java
public boolean updateApplicationStatusAndNotes(UpdateJobApplicationDto dto) {
    int updatedRows = jobApplicationRepository.updateStatusAndNotesById(
        dto.getStatus().name(),  // Enum → String
        dto.getNotes(),
        dto.getApplicationId(),
        ApplicationUtility.getLoggedInUser()  // For audit columns
    );
    return updatedRows > 0;
}
```

### ⚙️ Repository — Named Query (JPQL)

Since we're updating specific fields without loading the full entity, we use a **named query**:

```java
@Entity
@NamedQuery(
    name = "JobApplication.updateStatusAndNotesById",
    query = "UPDATE JobApplication j SET j.status = :status, j.notes = :notes, " +
            "j.updatedAt = CURRENT_TIMESTAMP, j.updatedBy = :updatedBy " +
            "WHERE j.id = :id"
)
public class JobApplication { ... }
```

**Why a named query instead of `save()`?**

The `save()` method updates **all fields**. Here, we only want to update `status`, `notes`, and audit fields — more efficient and intentional.

**Why manually update audit fields?**

JPA auditing (via `@LastModifiedDate`, `@LastModifiedBy`) only works when entities are loaded and saved through the entity manager. Direct JPQL queries bypass the entity lifecycle, so audit fields must be set manually.

---

## Security Configuration

Both new API paths must be registered under employer-authorized paths:

```java
// In security config
.requestMatchers("/api/applicants/*/employer", "/api/applicant/employer")
    .hasRole("EMPLOYER")
```

Only users with the `EMPLOYER` role can access these endpoints.

---

## The UI Workflow

### 🧪 Applying for a Job (Job Seeker Side)

1. Job seeker logs in → browses companies → finds a job
2. Clicks **"Apply Now"** → enters cover letter → submits
3. Application created with `PENDING` status

### 🧪 Reviewing Applications (Employer Side)

1. Employer logs in → goes to **"My Job Postings"**
2. Clicks **"Applicants"** on a job → sees all applicants
3. For each applicant:
   - **View Profile** — see resume, skills, experience
   - **View Resume** — download/view the uploaded resume
   - **Contact Applicant** — email or phone
4. Updates status and adds notes:
   - `INTERVIEW` + "Scheduled interview for Saturday"
   - `IN_REVIEW` + "Need to check with my manager"
   - `REJECTED` + "Not suitable"
   - `HIRED` + "Offer extended"

### 🔄 Status Visibility

Status updates by the employer are **immediately visible** to the job seeker:
- Job seeker goes to **"Applied Jobs"** → sees updated status (e.g., `IN_REVIEW`, `INTERVIEW`)

---

## Bug Fix: Status Value Mismatch

### ⚠️ The Issue

The React UI was sending `IN_REVIEW` (with a space) while the Java enum expected `IN_REVIEW` (with an underscore). This caused a deserialization error.

### 🛡️ The Fix

Ensure the frontend sends enum-compatible values. Status values must exactly match the Java enum: `PENDING`, `IN_REVIEW`, `INTERVIEW`, `HIRED`, `REJECTED`.

---

## ✅ Key Takeaways

1. The **Get Applicants** API uses a derived query method to fetch all applications for a job, ordered by application date
2. The **Update Application** API uses a **named JPQL query** for efficient partial updates (only status + notes)
3. Use **enums** for status fields to restrict values and prevent invalid data
4. **Audit fields** must be updated manually in JPQL queries since JPA auditing doesn't apply to direct queries
5. Both APIs are secured to the **EMPLOYER role** — job seekers cannot access them

## ⚠️ Common Mistakes

- Using `save()` for partial updates — it overwrites all fields, potentially losing data
- Forgetting to manually update audit columns in JPQL queries
- Not registering new API paths in the security configuration — results in `403 Forbidden`
- Frontend sending status values that don't match the backend enum exactly

## 💡 Pro Tips

- Move reusable mapping methods to a utility class rather than duplicating across services
- Use `@Valid` on request DTOs to enforce validation before the service layer processes the request
- Test both the positive path (successful update) and negative path (invalid application ID) in your APIs
- Ensure enum values between frontend and backend are synchronized — consider documenting the valid values in your API contract
