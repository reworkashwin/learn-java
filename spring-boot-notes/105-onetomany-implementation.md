# Let's Code — Implementing OneToMany & ManyToOne Mappings Step by Step

## Introduction

Theory is done. Configurations are in place. Now it's time to **wire everything together** — DTO classes, Service layer, Controller — and see the actual data flowing from database to API response. By the end of this lecture, our REST API will return company data **along with** all associated job data, and our UI will display it beautifully.

Let's code.

---

## Step 1: Create the Job DTO

We never send entity objects directly to the client. We always use **DTOs** (Data Transfer Objects). Let's create one for jobs.

### Creating JobDto

Navigate to your DTO package and create a new Java `record`:

```java
public record JobDto(
    Long id,
    String title,
    String location,
    String workType,
    String jobType,
    String category,
    String experienceLevel,
    BigDecimal salaryMin,
    BigDecimal salaryMax,
    String salaryCurrency,
    String salaryPeriod,
    String description,
    String requirements,
    String benefits,
    LocalDate postedDate,
    LocalDate applicationDeadline,
    Integer applicationsCount,
    Boolean featured,
    Boolean urgent,
    Boolean remote,
    String status
) {}
```

> ⚠️ **Important**: Use the exact same field names shown above. The UI application expects these specific names for display logic. Different names will break the frontend.

---

## Step 2: Update CompanyDto to Include Jobs

The whole point of relationships is that when you fetch a company, you also get its jobs. So `CompanyDto` needs a list of `JobDto`:

```java
public record CompanyDto(
    // ... existing company fields ...
    List<JobDto> jobs     // ← Add this field
) {}
```

Now every company response will include a `jobs` array with all associated job details.

---

## Step 3: Update the Service Layer

### The Transformation Logic

Open `CompanyServiceImpl`. We need to transform `Job` entities into `JobDto` objects.

#### Create a Private Helper Method

```java
private JobDto transformJobToDto(Job job) {
    return new JobDto(
        job.getId(),
        job.getTitle(),
        job.getLocation(),
        job.getWorkType(),
        job.getJobType(),
        job.getCategory(),
        job.getExperienceLevel(),
        job.getSalaryMin(),
        job.getSalaryMax(),
        job.getSalaryCurrency(),
        job.getSalaryPeriod(),
        job.getDescription(),
        job.getRequirements(),
        job.getBenefits(),
        job.getPostedDate(),
        job.getApplicationDeadline(),
        job.getApplicationsCount(),
        job.getFeatured(),
        job.getUrgent(),
        job.getRemote(),
        job.getStatus()
    );
}
```

#### Update the Company Transformation Method

In the existing `transformCompanyToDto` method, extract the jobs from the company entity and transform them:

```java
private CompanyDto transformCompanyToDto(Company company) {
    List<JobDto> jobsDto = company.getJobs()
        .stream()
        .map(this::transformJobToDto)
        .collect(Collectors.toList());

    return new CompanyDto(
        // ... existing company fields ...
        jobsDto    // Pass the transformed job DTOs
    );
}
```

### What's Happening Behind the Scenes

Look at how simple the service code is:

```java
public List<CompanyDto> getAllCompanies() {
    List<Company> companies = companyRepository.findAll();
    return companies.stream()
        .map(this::transformCompanyToDto)
        .collect(Collectors.toList());
}
```

That's it. One `findAll()` call. Thanks to the **OneToMany/ManyToOne** configurations:

1. `findAll()` fetches all companies from the database
2. For each company, the associated **job entities are also available** inside the company object
3. We iterate through `company.getJobs()` and transform each into a DTO
4. The complete data flows to the client

> Spring Data JPA generates the necessary SQL JOIN statements behind the scenes. You write Java, JPA writes SQL.

---

## Step 4: Test with Postman

### Sending the Request

1. Open the **GetAllCompanies** request in Postman
2. Make sure the `Accept` header is set correctly
3. Click **Send**

### The Response

Each company now includes a `jobs` array:

```json
{
    "id": 1,
    "name": "TechCorp Inc",
    "founded": "2005",
    "employees": 15000,
    "jobs": [
        {
            "id": 1,
            "title": "Senior Java Developer",
            "location": "San Francisco",
            "workType": "hybrid",
            "jobType": "full-time",
            "salaryMin": 120000,
            "salaryMax": 180000,
            ...
        },
        {
            "id": 2,
            "title": "Cloud Architect",
            ...
        }
    ]
}
```

---

## Step 5: What the SQL Looks Like

Check the console logs. JPA generates SQL statements like:

```sql
SELECT c.* FROM companies c;

SELECT j.* FROM jobs j WHERE j.company_id = ?;
```

The framework works with Hibernate to generate the optimal SQL for your business logic. You never had to write a single SQL query.

---

## Step 6: See It on the UI

Start the UI application and navigate to the homepage:

- **Jobs section**: Displays 6 jobs by default (out of 1,000)
- **Load More Jobs**: Click to reveal more
- **Click a job**: Navigate to the job detail page — see title, company, pay, requirements
- **Click the company**: Navigate to the company profile — see all jobs posted by that company
- **View All Jobs button**: Shows all jobs for a company (e.g., Apple has 33 jobs)

Everything is connected. Company → Jobs → Company. Bi-directional navigation in the UI, powered by bi-directional JPA relationships in the backend.

---

## The Current Limitation

There's one intentional **defect** we're leaving for now.

### The Problem

The `jobs` table has a `status` column with values: `active`, `closed`, `draft`. Our `findAll()` loads **all** jobs regardless of status. But the UI should only display **active** jobs — why show a job that's already closed?

If you change a couple of jobs' status to `closed` in the database, the UI still shows all 1,000 jobs instead of 998.

### Why We're Not Fixing It Yet

Filtering related entities by custom conditions (e.g., "only active jobs") is an **advanced** Spring Data JPA concept. We'll cover it in a future section when we learn about custom queries. Until then, this defect stays.

> This is a great example of why backend development isn't just about loading data — it's about loading the **right** data.

---

## ✅ Key Takeaways

- Always use **DTO classes** to send data to clients — never expose entity objects directly
- The service layer transforms entities to DTOs — including nested related entities
- With JPA relationships configured, `findAll()` gives you parent entities **with** their children already loaded
- Spring Data JPA generates all SQL statements — you write only Java
- Testing with Postman confirms the API returns nested company + jobs data
- Current limitation: We can't filter jobs by status yet — that's an advanced topic for later

---

## ⚠️ Common Mistakes

- **Using different field names in DTOs** — The UI expects exact names; mismatched names break the frontend
- **Sending entity objects directly to the client** — This exposes internal details and can cause circular reference issues (company → jobs → company → jobs → ...)
- **Forgetting to add jobs to CompanyDto** — Without the `List<JobDto>` field, the API response won't include job data

---

## 💡 Pro Tip

> When dealing with bi-directional relationships and JSON serialization, be aware of **infinite recursion**. If `Company` has a list of `Job`, and each `Job` has a reference back to `Company`, Jackson (the JSON serializer) can loop forever. Using **DTOs** (as we do here) naturally solves this because DTOs don't have circular references — `JobDto` doesn't contain a `CompanyDto` reference.
