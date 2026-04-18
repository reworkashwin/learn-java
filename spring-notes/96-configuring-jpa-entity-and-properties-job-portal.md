# Configuring JPA Entity and Properties for the Job Portal

## Introduction

In the previous video, we set up the repository interface and updated the service layer. But we left two critical pieces missing — the `@Entity` and `@Id` annotations on the model class, and the database configuration in `application.properties`. Without these, nothing works.

Let's wire them in and see the entire job portal come alive with a real PostgreSQL database.

---

## Concept 1: Marking JobPost as a JPA Entity

### ⚙️ What needs to change

The `JobPost` class needs two annotations:

```java
@Entity
public class JobPost {
    @Id
    private int postId;
    private String postProfile;
    private String postDesc;
    private int reqExperience;
    private List<String> postTechStack;
}
```

- `@Entity` — tells JPA this class maps to a database table
- `@Id` — marks `postId` as the primary key

Without `@Entity`, JPA doesn't know this class should be persisted. Without `@Id`, JPA doesn't know which field uniquely identifies each row.

---

## Concept 2: Adding Database Properties

### ⚙️ application.properties configuration

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

We're reusing the same PostgreSQL database from the student example. That's perfectly fine — JPA creates **separate tables** for each entity. The `student` table stays untouched, and a new `job_post` table gets created.

### 💡 Insight

`ddl-auto=update` means Hibernate checks if the `job_post` table exists on startup. If it doesn't, it creates one. If it does, it updates the schema if needed. This is the same behavior we saw with the student example.

---

## Concept 3: Running the Application — Table Creation

### 🧪 What happens on startup

Run the application. In the console, you'll see:

```sql
Hibernate: create table job_post (
    post_id integer not null,
    post_desc varchar(255),
    post_profile varchar(255),
    req_experience integer not null,
    post_tech_stack varchar(255) array,
    primary key (post_id)
)
```

A few things to notice:

- **Table name**: `job_post` — Hibernate converts the camelCase class name `JobPost` to snake_case `job_post`
- **Column names**: `postId` becomes `post_id`, `postProfile` becomes `post_profile`, etc.
- **Tech stack**: The `List<String>` field becomes a `varchar(255) array` — PostgreSQL supports array types natively, so Hibernate maps the Java list to a PostgreSQL array column

### 🧪 Verifying in pgAdmin

Open pgAdmin, navigate to the `postgres` database, and you'll see the `job_post` table with all columns. But the table is **empty** — we haven't loaded any data yet.

---

## Concept 4: Loading Data via the /load Endpoint

### ⚙️ Hitting the load URL

Open Postman and send a GET request:

```
GET http://localhost:8080/load
```

Response: `success`

Behind the scenes, the `load()` method in the service layer calls `repo.saveAll(jobs)`, which inserts all the default job posts into the database.

### 🧪 Verifying in pgAdmin

Go back to pgAdmin, right-click the `job_post` table, select **View All Rows**, and you'll see all five entries:

| post_id | post_profile | post_desc | req_experience | post_tech_stack |
|---------|-------------|-----------|---------------|-----------------|
| 1 | Java Developer | Must know Java | 2 | {Java, Spring} |
| 2 | Frontend Developer | Must know React | 1 | {React, JavaScript} |
| ... | ... | ... | ... | ... |

The tech stack is stored as a PostgreSQL array — you can see the curly brace notation `{Java, Spring}`. This is how PostgreSQL represents arrays.

### 💡 Insight

There are different ways to handle a list of strings in a database. Some approaches create a **separate table** with a foreign key relationship (normalized design). Here, PostgreSQL's native array type is used, which keeps things simpler for a small, fixed list like tech stack. For more complex relationships, a separate table would be better.

---

## Concept 5: Testing All CRUD Operations

### 🧪 Fetch all jobs

```
GET http://localhost:8080/jobPosts
```

Returns all job posts from the database as JSON. Everything that was in the list before now comes from PostgreSQL.

### 🧪 Fetch one job

```
GET http://localhost:8080/jobPost/2
```

Returns the job post with ID 2. `findById(2)` fires a `SELECT` with `WHERE post_id = 2`.

### 🧪 Update a job

```
PUT http://localhost:8080/jobPost
Body: { "postId": 2, "postProfile": "Senior Frontend Dev", ... }
```

`save()` sees the ID already exists, fires a `SELECT` then an `UPDATE`.

### 🧪 Delete a job

```
DELETE http://localhost:8080/jobPost/2
```

`deleteById(2)` removes the record from the database.

All four CRUD operations — working with a real database, zero SQL written by hand.

---

## Concept 6: The Bigger Picture — What Changed and What Didn't

### 📋 Changes made

| Layer | What changed |
|-------|-------------|
| **Model** | Added `@Entity` and `@Id` annotations |
| **Repository** | Class → Interface extending `JpaRepository` |
| **Service** | Updated method names to match JPA (`save`, `findAll`, etc.) |
| **Properties** | Added database connection config |
| **pom.xml** | Added JPA and PostgreSQL dependencies |

### 📋 What stayed the same

| Layer | Status |
|-------|--------|
| **Controller** | **No changes at all** |
| **API endpoints** | Same URLs, same request/response format |
| **Client (React/Postman)** | Works exactly as before |

The controller and the client don't care whether data comes from a list or a database. That's the beauty of layered architecture — you swapped the entire data layer, and everything above it kept working.

---

## ✅ Key Takeaways

- Adding `@Entity` and `@Id` to the model class is essential — without them, JPA can't map the class to a database table
- Hibernate auto-converts camelCase names to snake_case for tables and columns (`JobPost` → `job_post`)
- `List<String>` maps to a PostgreSQL array column automatically
- The `/load` endpoint with `saveAll()` populates the database with initial data
- **The controller needed zero changes** — layered architecture isolates data layer changes from the rest of the application
- All CRUD operations work through JPA — no SQL written manually

## ⚠️ Common Mistakes

- Forgetting `@Entity` or `@Id` — the application will fail with mapping errors on startup
- Not reloading Maven after adding dependencies — JPA classes won't be available
- Calling `/load` multiple times without checking for duplicates — you'll get primary key constraint violations on the second call

## 💡 Pro Tips

- Use `@GeneratedValue` on the `@Id` field if you want the database to auto-generate primary keys instead of setting them manually
- Consider using `@PostConstruct` or a `CommandLineRunner` bean to load initial data automatically on startup instead of a manual `/load` endpoint — it's cleaner for development and testing
