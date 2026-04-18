# Integrating Spring Data JPA into the Job Portal Application

## Introduction

We've learned Spring Data JPA with a simple student example — saving, fetching, updating, deleting. Now it's time to apply everything to our **real project**: the Job Portal application.

Until now, the job portal used a plain `ArrayList` in the repository layer to store data. No database. No persistence. Every time the server restarted, the data was gone. Let's change that by wiring in Spring Data JPA with PostgreSQL.

---

## Concept 1: The Current Architecture

### 🧠 What we have right now

The job portal follows the standard layered architecture:

```
Client → Controller → Service → Repository
```

The controller handles HTTP requests, the service contains business logic, and the repository manages data. But here's the problem — our repository is just a class with a `List<JobPost>` and hardcoded default values. There's no real database.

Now we'll replace that in-memory list with an actual **PostgreSQL database** using Spring Data JPA.

---

## Concept 2: Adding the Dependencies

### ⚙️ Step 1: Update pom.xml

To use Spring Data JPA, we need two dependencies:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

- **spring-boot-starter-data-jpa** — brings in JPA, Hibernate, and all the Spring Data magic
- **postgresql** — the JDBC driver so Java can talk to PostgreSQL

After adding these, **reload Maven** so the dependencies are downloaded and available.

### 💡 Insight

You can copy these directly from the student project's `pom.xml` if it's already set up. Just make sure you copy the complete `<dependency>` tags.

---

## Concept 3: Converting the Repository — Class to Interface

### 🧠 The big shift

This is the most important change. Our `JobRepo` was a **class** with methods like `addJob()`, `getAllJobs()`, etc., all operating on a list. Now it becomes an **interface** extending `JpaRepository`.

### ⚙️ Before (list-based)

```java
@Repository
public class JobRepo {
    List<JobPost> jobs = new ArrayList<>(/* hardcoded data */);

    public void addJob(JobPost job) { jobs.add(job); }
    public List<JobPost> getAllJobs() { return jobs; }
    // ... more methods
}
```

### ⚙️ After (JPA-based)

```java
public interface JobRepo extends JpaRepository<JobPost, Integer> {
    // Empty! Everything is inherited.
}
```

That's it. The entire class with all its methods gets replaced by **one line** — an empty interface.

### 🧠 What do the type parameters mean?

```java
JpaRepository<JobPost, Integer>
```

- `JobPost` — the entity class this repository manages
- `Integer` — the type of the primary key (`postId` is an `int`, so we use `Integer`)

By extending `JpaRepository`, you automatically get `save()`, `findAll()`, `findById()`, `deleteById()`, and many more — all wired to interact with the database.

---

## Concept 4: Updating the Service Layer

### ❓ Why does the service need changes?

Because the method names are different now. Our old repo had custom names like `addJob()` and `getAllJobs()`. JPA repository uses standard names like `save()` and `findAll()`.

### ⚙️ Mapping old methods to new ones

| Old repo method | New JPA method |
|----------------|----------------|
| `repo.addJob(jobPost)` | `repo.save(jobPost)` |
| `repo.getAllJobs()` | `repo.findAll()` |
| `repo.getJob(postId)` | `repo.findById(postId).orElse(new JobPost())` |
| `repo.updateJob(jobPost)` | `repo.save(jobPost)` |
| `repo.deleteJob(postId)` | `repo.deleteById(postId)` |

### 🧪 Updated service methods

```java
// CREATE
public void addJob(JobPost jobPost) {
    repo.save(jobPost);
}

// READ ALL
public List<JobPost> getAllJobs() {
    return repo.findAll();
}

// READ ONE
public JobPost getJob(int postId) {
    return repo.findById(postId).orElse(new JobPost());
}

// UPDATE
public void updateJob(JobPost jobPost) {
    repo.save(jobPost);  // Same as create — save handles both
}

// DELETE
public void deleteJob(int postId) {
    repo.deleteById(postId);
}
```

Notice `findById()` returns an `Optional`, so we use `orElse(new JobPost())` to handle the case where the ID doesn't exist. In a real application, you might throw a custom exception instead.

### 💡 Insight — the controller stays untouched

Here's the beautiful part: **the controller doesn't need any changes**. It calls service methods, and the service methods still have the same signatures. The controller has no idea that the data source changed from a list to a database.

This is the power of **layered architecture** — changes in one layer don't ripple into others.

---

## Concept 5: Loading Initial Data

### ❓ The problem

With the list-based repo, we had hardcoded data that was always available. With JPA, the database starts empty. We need a way to load some initial data.

### ⚙️ Creating a load endpoint

One approach is to create an endpoint that loads default data into the database:

```java
// In the Controller
@GetMapping("load")
public String loadData() {
    service.load();
    return "success";
}
```

```java
// In the Service
public void load() {
    List<JobPost> jobs = new ArrayList<>(List.of(
        new JobPost(1, "Java Developer", "Must know Java", 2, List.of("Java", "Spring")),
        new JobPost(2, "Frontend Developer", "Must know React", 1, List.of("React", "JavaScript")),
        // ... more jobs
    ));

    repo.saveAll(jobs);
}
```

### 🧠 What is saveAll?

Instead of calling `save()` five times in a loop, `saveAll()` accepts a list and saves everything in one go. Cleaner and more efficient.

### ⚙️ How to use it

Hit `GET /load` once to populate the database. The data persists across server restarts — that's the whole point of using a database.

---

## Concept 6: What's Still Missing

### ⚠️ This won't work yet!

We've set up the repository and service, but two critical things are still missing:

**1. Entity annotations on JobPost**

The `JobPost` class needs to be marked as a JPA entity:

```java
@Entity
public class JobPost {
    @Id
    private int postId;
    // ... other fields
}
```

Without `@Entity`, JPA doesn't know this class maps to a database table. Without `@Id`, JPA doesn't know which field is the primary key.

**2. Database configuration in application.properties**

Spring needs to know *which* database to connect to:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

Without this, the application can't connect to PostgreSQL and will fail on startup.

These two steps are coming next.

---

## ✅ Key Takeaways

- Converting from list-based to JPA-based repository means changing the repo from a **class** to an **interface** extending `JpaRepository`
- The interface is **empty** — all CRUD methods come from JpaRepository automatically
- Service layer methods need to be updated to use JPA names: `save()`, `findAll()`, `findById()`, `deleteById()`
- The **controller layer stays unchanged** — it only talks to the service, which shields it from data layer changes
- Use `saveAll(list)` to bulk-insert initial data
- Two things still needed: `@Entity`/`@Id` annotations on the model class, and database config in `application.properties`

## ⚠️ Common Mistakes

- Forgetting to reload Maven after adding dependencies — the JPA classes won't be available until dependencies are downloaded
- Keeping `JobRepo` as a class instead of converting it to an interface — JpaRepository only works with interfaces
- Not handling the `Optional` returned by `findById()` — you'll get a compile error if you try to assign it directly to a `JobPost` variable

## 💡 Pro Tips

- If your IDE doesn't auto-suggest JpaRepository after adding the dependency, try invalidating caches and restarting — sometimes the IDE index gets stale
- You could use `@PostConstruct` on a method to load initial data automatically when the application starts, instead of creating a manual `/load` endpoint
