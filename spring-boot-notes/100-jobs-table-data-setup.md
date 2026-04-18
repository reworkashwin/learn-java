# Data Setup — Creating the Jobs Table and Bulk Loading Test Data

## Introduction

Before we can write any Java relationship code, we need the actual **database table** to work with. In this lecture, we'll create the `jobs` table with all necessary columns — including the critical **foreign key** to the `companies` table — and then bulk-load 1,000 test job records. This is the data foundation for everything that follows.

---

## Step 1: Setting Up the Project

Since we're in a new section, the recommended workflow is:

1. Create a **new folder** in your workspace for this section
2. **Copy the code** from the previous section into it
3. All changes moving forward happen in this new folder

You can find the complete code for this section in the **GitHub repository**.

---

## Step 2: Creating the Jobs Table

### The SQL Script

Open the `schema.sql` file (where we already have the `companies` table script). Add the following SQL for the `jobs` table:

```sql
CREATE TABLE jobs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    company_id      BIGINT NOT NULL,
    location        VARCHAR(255),
    work_type       VARCHAR(50),      -- onsite, remote, hybrid
    job_type        VARCHAR(50),      -- full-time, part-time, contract, freelance
    category        VARCHAR(100),
    experience_level VARCHAR(50),
    salary_min      DECIMAL(10,2),
    salary_max      DECIMAL(10,2),
    salary_currency VARCHAR(10),
    salary_period   VARCHAR(20),
    description     TEXT,
    requirements    TEXT,
    benefits        TEXT,
    posted_date     DATE,
    application_deadline DATE,
    applications_count INT DEFAULT 0,
    featured        BOOLEAN DEFAULT FALSE,
    urgent          BOOLEAN DEFAULT FALSE,
    remote          BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'active',  -- active, closed, draft
    created_at      TIMESTAMP,
    created_by      VARCHAR(255),
    updated_at      TIMESTAMP,
    updated_by      VARCHAR(255),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
```

### Understanding the Key Columns

Let's break down what each group of columns does:

| Column Group | Columns | Purpose |
|-------------|---------|---------|
| **Identity** | `id` | Unique primary key for each job |
| **Core Info** | `title`, `location`, `work_type`, `job_type` | Basic job details |
| **Categorization** | `category`, `experience_level` | For filtering/searching |
| **Salary** | `salary_min`, `salary_max`, `salary_currency`, `salary_period` | Compensation details |
| **Content** | `description`, `requirements`, `benefits` | Detailed job information |
| **Dates** | `posted_date`, `application_deadline` | Timeline information |
| **Flags** | `featured`, `urgent`, `remote` | Boolean filters |
| **Status** | `status` | Controls visibility: `active`, `closed`, `draft` |
| **Audit** | `created_at`, `created_by`, `updated_at`, `updated_by` | Tracking who changed what |

### 🔑 The Foreign Key — The Most Important Part

```sql
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
```

This single line does three critical things:

1. **`FOREIGN KEY (company_id)`** — Declares `company_id` as a foreign key column
2. **`REFERENCES companies(id)`** — Links it to the `id` column in the `companies` table
3. **`ON DELETE CASCADE`** — If a company is deleted, **all its jobs are automatically deleted** by the database

> Without this foreign key, the `jobs` table would have no formal connection to `companies`. You could insert a job with `company_id = 9999` even if no such company exists!

---

## Step 3: Executing the Script

### Prerequisites

Before running anything:

1. **Docker Desktop** must be running (for the database container)
2. **Stop** any backend application running from the previous section

### Creating the Table

- If using **IntelliJ Premium**: Select the SQL script → Click "Execute Statement"
- If using **SQLECTRON** (free alternative): Paste and execute the script there

After execution, you should see the `jobs` table appear alongside `companies` and `contacts`.

---

## Step 4: Bulk Loading 1,000 Job Records

### Why Bulk Insert?

In a real application, jobs would be created one-by-one by recruiters through the UI. But for **testing purposes**, we need realistic data — and asking you to manually create 1,000 jobs through a UI would be crazy. That's why pre-built `INSERT` statements are provided.

### The Process

1. Open the `jobportal-data.sql` file
2. You'll find the existing 30 company `INSERT` statements (`id` values 1 through 30)
3. **Paste the 1,000 job `INSERT` statements** right after the company data

### ⚠️ Critical: Company ID Alignment

The job insert statements assume your companies have IDs ranging from **1 to 30**. If your company IDs are different (e.g., because you inserted data at different times):

1. **Drop** the `companies` table
2. **Recreate** it using the schema script
3. **Re-insert** the 30 companies
4. **Then** insert the 1,000 jobs

If the company IDs don't match, the foreign key constraint will fail and inserts will error out.

### Executing the Inserts

- Select all 1,000 `INSERT` statements
- Click "Execute"
- **Be patient** — IntelliJ may take 1-2 minutes to process all records
- If you face issues, try inserting **100 records at a time** instead of all at once

### Verifying the Data

After insertion, query the `jobs` table:

- IntelliJ shows 500 records per page by default
- Change the page size to 1,000 to see all records at once
- Each job should have a valid `company_id` linking to one of the 30 companies

---

## ✅ Key Takeaways

- The `jobs` table has many columns covering job details, salary, flags, and status
- The **`company_id` foreign key** is the backbone — it connects every job to a company
- **`ON DELETE CASCADE`** ensures orphan jobs don't exist if a company is deleted
- We loaded 1,000 test records for realistic testing
- Company IDs must match between the `companies` and `jobs` tables — always verify alignment

---

## ⚠️ Common Mistakes

- **Mismatched company IDs** — If your `companies` table has auto-generated IDs that don't start from 1, the job inserts will fail on the foreign key constraint
- **Forgetting Docker** — The database container must be running before you start the application
- **Running duplicate inserts** — If you accidentally insert twice, you'll have 2,000 jobs. Drop the table and start over if needed

---

## 💡 Pro Tip

> In real-world projects, you'd use tools like **Flyway** or **Liquibase** for database migrations and **seed scripts** for test data. Manual SQL execution is fine for learning, but production applications need versioned, repeatable migration strategies.
