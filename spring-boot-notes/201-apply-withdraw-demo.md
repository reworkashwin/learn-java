# Live Demo — Apply & Withdraw Job APIs

## Introduction

We've built the apply, withdraw, and list-applications APIs. Now let's see them in action — first through the **React UI**, then through **Postman**. This lecture is a hands-on verification that everything works as expected, from the user experience down to the database records.

---

## Demo via the React UI

### Checking Initial State

After logging in as a job seeker:
- Navigate to **Applied Jobs** → shows **0 applications**
- The `job_applications` table in the database should be empty for this user

### Applying for Jobs

#### Quick Apply from Jobs List

1. Go to **Find Jobs**
2. Click the **Quick Apply** button on any job
3. A popup asks for an optional cover letter — skip it for now
4. Click **Submit Application**
5. Confirmation: "Job applied successfully"
6. The count on the Applied Jobs menu updates to **1**
7. A **Withdraw** option appears next to the applied job

#### Apply from Job Detail Page

1. Open any job's **View Details** page
2. Click **Apply Now** → cover letter popup appears
3. Enter a cover letter: "I am passionate about this role and bring 5 years of experience..."
4. Click **Submit Application**
5. The button changes from "Apply Now" to **"Withdraw Application"** — confirming the application was recorded

### Viewing Applied Jobs

Navigate to **Applied Jobs**:
- Shows **2 jobs** (both we just applied to)
- Each entry displays:
  - Job title and company
  - **Status: PENDING** — the initial status
  - A **Withdraw** option
- The status will update as the employer reviews the application (REVIEWED → SHORTLISTED → etc.)

### Verifying in the Database

Open the `job_applications` table:

| id | user_id | job_id | status | applied_at | cover_letter |
|----|---------|--------|--------|------------|--------------|
| 1 | 3 | 901 | PENDING | 2025-04-18 10:30:00 | NULL |
| 2 | 3 | 905 | PENDING | 2025-04-18 10:31:00 | I am passionate... |

- Two records for user_id 3
- Status is `PENDING` for both
- First application has no cover letter (NULL), second one has the text we entered

### Withdrawing an Application

1. On the **Applied Jobs** page, click **Withdraw** on one job
2. Or navigate to the **Job Detail** page where it shows "Withdraw Application" and click it
3. Confirmation: "Application withdrawn successfully"
4. Applied Jobs count decreases

After withdrawal, the database record is **deleted** (hard delete in our demo).

---

## Demo via Postman

### Prerequisites

1. Generate a **CSRF token**
2. Log in as a job seeker (e.g., `smith@gmail.com`) → copy the **JWT token**
3. Set the JWT in the Authorization header for all requests

### Test 1: Apply for a Job

**Request:**
```
POST /api/v1/job-applications/jobseeker
Content-Type: application/json
Authorization: Bearer <jwt-token>
X-CSRF-TOKEN: <csrf-token>

{
    "jobId": 918,
    "coverLetter": "Excited about this opportunity..."
}
```

**Response:** `201 Created` with the full `JobApplicationDto` — including job details, profile info, status ("PENDING"), and the cover letter.

**Database verification:** A new row in `job_applications` for user_id 17, job_id 918.

### Test 2: Get Applied Jobs

**Request:**
```
GET /api/v1/job-applications/jobseeker
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK` with an array containing the application we just created. The response includes:
- `appliedAt` — the timestamp
- `status` — "PENDING"
- `coverLetter` — the text we submitted
- Nested `job` object with job details
- Nested `profile` object with user profile info

### Test 3: Withdraw an Application

**Request:**
```
DELETE /api/v1/job-applications/918/jobseeker
Authorization: Bearer <jwt-token>
X-CSRF-TOKEN: <csrf-token>
```

⚠️ **Watch the job ID!** Make sure the job ID in the URL matches a job you actually applied for. If you pass a wrong ID, you'll get an error: "No application found for this job."

**Response:** `200 OK` — "Application withdrawn successfully"

**Database verification:** The record for user_id 17, job_id 918 is gone.

---

## Common Errors and How to Fix Them

### Wrong Job ID in Withdraw

```
DELETE /api/v1/job-applications/916/jobseeker  ← Wrong! You applied for 918
```

Response: RuntimeException — "No application found for this job"

**Fix:** Use the correct job ID that matches the applied job.

### Missing CSRF Token

Any `POST` or `DELETE` request without the CSRF token returns `403 Forbidden`.

**Fix:** Always include the `X-CSRF-TOKEN` header for state-changing operations.

### Duplicate Application

Trying to apply for the same job twice returns a RuntimeException: "You have already applied for this job."

**Fix:** This is by design. Check `existsByUserIdAndJobId()` before inserting.

---

## Section Summary

This section covered the **complete job seeker workflow**:

1. **Profile Management** — designing the profiles table, handling file uploads with multipart form data, building CRUD APIs for text and binary data
2. **Saved Jobs** (Bookmarking) — `@ManyToMany` relationship, join table with only two FK columns, save/unsave/list APIs
3. **Job Applications** — when `@ManyToMany` won't work (extra columns), using a separate entity with two `@ManyToOne` relationships, apply/withdraw/list APIs with status tracking

### The Key Relationship Patterns

| Feature | Relationship | Join Table Columns |
|---------|-------------|-------------------|
| User ↔ Profile | `@OneToOne` | N/A (FK in profiles table) |
| User ↔ Saved Jobs | `@ManyToMany` | user_id, job_id (2 only) |
| User ↔ Applications | `@ManyToOne` × 2 | user_id, job_id, status, applied_at, cover_letter, ... |

### The Decision Rule

- **Pure link, no extra data** → `@ManyToMany`
- **Extra columns, business logic, lifecycle** → Separate entity with `@ManyToOne`

---

## ✅ Key Takeaways

1. **Always test end-to-end** — UI, Postman, and database verification
2. **Quick Apply** from job lists and **Apply Now** from detail pages both use the same backend API
3. **Status tracking** starts at `PENDING` — future sections will add employer-side status updates
4. **Use the correct job ID** in withdraw requests — verify against applied jobs
5. **CSRF tokens** are mandatory for all state-changing operations (POST, PUT, DELETE)
6. **Hard delete vs. soft delete** — we use hard delete for training; production uses soft delete
7. **`@ManyToMany` vs. separate entity** — the decision hinges on whether the join table has extra columns
8. The complete job seeker flow is: **Complete Profile → Save Jobs → Apply for Jobs → Track Status**
