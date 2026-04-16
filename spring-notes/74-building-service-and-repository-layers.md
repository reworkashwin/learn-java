# 🏗️ Building the Service and Repository Layers

## 🎯 Introduction

Our form submission works — the success page shows the posted job. But the data disappears the moment the request ends. It's not stored anywhere. If you go to "View All Jobs," nothing shows up.

In this lesson, we build the **Service** and **Repository** layers to store and retrieve job data. We also wire everything together using `@Autowired`, creating a proper layered architecture: Controller → Service → Repository.

---

## 🧩 Concept 1: Why the Controller Shouldn't Store Data

### 🧠 The Separation of Concerns

If you ask the controller to save data, the controller would say: *"That's not my job."*

A controller's responsibility is **handling HTTP requests** — receive the request, call the right business logic, return a view. Storing data, processing business rules, talking to databases — those are different responsibilities for different layers.

### ⚙️ The Three-Layer Architecture

```
Controller Layer    →  Handles HTTP requests and responses
       ↓
Service Layer       →  Business logic and processing
       ↓
Repository Layer    →  Data access and storage
```

Each layer talks only to the layer below it:
- **Controller** calls **Service** — never directly touches the repository
- **Service** calls **Repository** — handles any processing between controller and data
- **Repository** manages data — could be an in-memory list, a database, a file, or a remote server

### 💡 Why This Matters

If you later switch from an in-memory list to a real database, you **only change the Repository**. The Service and Controller don't need to change — they have no idea where the data lives. That's the power of layered architecture.

---

## 🧩 Concept 2: Creating the Repository — JobRepo

### 🧠 What the Repo Does

The repository is responsible for **data storage and retrieval**. Since we're not using a database yet, we'll store jobs in an `ArrayList` — essentially mocking a database.

### 📁 Package Structure

```
com.telusko.jobapp/
├── controller/
│   └── JobController.java
├── service/
│   └── JobService.java          ← NEW
├── repo/
│   └── JobRepo.java             ← NEW
└── model/
    └── JobPost.java
```

### 🧪 The Code

```java
package com.telusko.jobapp.repo;

import com.telusko.jobapp.model.JobPost;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class JobRepo {

    // In-memory storage — mock database
    List<JobPost> jobs = new ArrayList<>(List.of(
        new JobPost(1, "Java Developer", "Must know Core Java and Advanced Java", 2, 
                    List.of("Java", "Spring")),
        new JobPost(2, "Frontend Developer", "Experience with React or Angular", 3, 
                    List.of("JavaScript", "React", "Angular")),
        new JobPost(3, "Data Scientist", "Python and ML experience required", 4, 
                    List.of("Python", "Machine Learning")),
        new JobPost(4, "DevOps Engineer", "CI/CD and cloud experience", 3, 
                    List.of("Docker", "Kubernetes", "AWS")),
        new JobPost(5, "Full Stack Developer", "Java backend with React frontend", 5, 
                    List.of("Java", "React", "Spring Boot"))
    ));

    public List<JobPost> getAllJobs() {
        return jobs;
    }

    public void addJob(JobPost job) {
        jobs.add(job);
    }
}
```

### 🔍 Key Details

**The `@Repository` annotation:**
```java
@Repository
public class JobRepo { ... }
```

This tells Spring: *"This class handles data access."* It's a specialized form of `@Component`. Spring will create a bean of this class and make it available for dependency injection.

**Why `new ArrayList<>(List.of(...))` instead of just `List.of(...)`?**

```java
// ❌ Immutable — can't add or remove elements
List<JobPost> jobs = List.of(new JobPost(...), new JobPost(...));
jobs.add(new JobPost(...));  // Throws UnsupportedOperationException!

// ✅ Mutable — wrapping in ArrayList allows modification
List<JobPost> jobs = new ArrayList<>(List.of(new JobPost(...), new JobPost(...)));
jobs.add(new JobPost(...));  // Works!
```

`List.of()` creates an **immutable list**. Since we need to add new jobs, we wrap it in `new ArrayList<>()` to make it **mutable**. This was the bug mentioned from the earlier demo — using `List.of()` directly caused errors when trying to add new jobs.

**Two methods:**
- `getAllJobs()` — Returns the entire list of jobs
- `addJob(JobPost job)` — Adds a new job to the list

In the future, when we connect a database, we'll only change **this class**. The methods stay the same, but instead of an ArrayList, they'll talk to a database.

---

## 🧩 Concept 3: Creating the Service — JobService

### 🧠 What the Service Does

The service layer sits between the controller and the repository. It handles **business logic** — any processing, validation, or transformation that needs to happen between receiving a request and accessing data.

Right now, our service is simple — it just passes calls through to the repo. But in a real application, this is where you'd add:
- Validation (is the experience a valid number?)
- Business rules (should duplicate job posts be rejected?)
- Data transformation (format dates, calculate derived fields)

### 🧪 The Code

```java
package com.telusko.jobapp.service;

import com.telusko.jobapp.model.JobPost;
import com.telusko.jobapp.repo.JobRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    @Autowired
    private JobRepo repo;

    public void addJob(JobPost jobPost) {
        repo.addJob(jobPost);
    }

    public List<JobPost> getAllJobs() {
        return repo.getAllJobs();
    }
}
```

### 🔍 Key Details

**The `@Service` annotation:**
```java
@Service
public class JobService { ... }
```

Tells Spring this is a service layer bean. Like `@Repository`, it's a specialized `@Component`.

**`@Autowired` on the repo:**
```java
@Autowired
private JobRepo repo;
```

Spring automatically injects the `JobRepo` bean into this field. We don't write `new JobRepo()` — Spring handles object creation and injection. This is **Dependency Injection**.

**The methods mirror the repo** — `addJob()` calls `repo.addJob()`, `getAllJobs()` calls `repo.getAllJobs()`. The service is a pass-through for now, but the layer exists for future business logic.

---

## 🧩 Concept 4: Spring Stereotype Annotations — @Component vs @Service vs @Repository

### 🧠 What Are They?

All three are ways to tell Spring: *"This is a bean — manage it."* But they communicate **intent**:

| Annotation | Purpose | Used For |
|-----------|---------|----------|
| `@Component` | Generic Spring bean | Any class that doesn't fit the others |
| `@Controller` | Web layer | Classes that handle HTTP requests |
| `@Service` | Business layer | Classes with business logic |
| `@Repository` | Data layer | Classes that access data/databases |

### ❓ Could You Use @Component Everywhere?

Technically, yes. `@Service` and `@Repository` are just `@Component` with a different name. But using the right annotation:
- Makes code **self-documenting** — you immediately know what layer a class belongs to
- Enables **layer-specific features** — `@Repository` adds automatic exception translation for database errors
- Follows **professional conventions** — every Spring developer expects these annotations in the right places

---

## 🧩 Concept 5: Wiring It All Together — @Autowired

### 🧠 The Dependency Chain

```
JobController  →  needs  →  JobService
JobService     →  needs  →  JobRepo
```

Each layer depends on the layer below it. Instead of creating objects manually (`new JobService()`), we let Spring inject them using `@Autowired`.

### 🧪 The Controller — Updated

```java
@Controller
public class JobController {

    @Autowired
    private JobService service;

    @GetMapping({"/", "home"})
    public String home() {
        return "home";
    }

    @GetMapping("addjob")
    public String addJob() {
        return "addJob";
    }

    @PostMapping("handleForm")
    public String handleForm(JobPost jobPost) {
        service.addJob(jobPost);                    // Save the job
        System.out.println(service.getAllJobs());    // Verify (temporary)
        return "success";
    }
}
```

### 🔍 What Changed

1. **Added `@Autowired private JobService service`** — Spring injects the service
2. **Called `service.addJob(jobPost)`** in the form handler — saves the job to the repo
3. **Temporary print** — `System.out.println(service.getAllJobs())` to verify in the console that the job was added

### 🔄 The Complete Data Flow

```
User clicks Submit
        ↓
POST /handleForm → JobController.handleForm(jobPost)
        ↓
controller calls → service.addJob(jobPost)
        ↓
service calls → repo.addJob(jobPost)
        ↓
repo adds to → ArrayList (in-memory storage)
        ↓
Controller returns "success" → success.jsp renders
```

---

## 🧩 Concept 6: Data Transfer Objects (DTO)

### 🧠 What is a DTO?

The `JobPost` object travels through multiple layers:

```
Controller  →  Service  →  Repository
   ↑                           ↑
   jobPost is passed through all layers
```

When an object is passed between layers like this, it's called a **Data Transfer Object (DTO)**. It's not doing any processing — it's just carrying data from one place to another.

### 💡 Why the Term Matters

In professional Spring development, you'll hear "DTO" frequently. Sometimes the DTO is the model class itself (like our `JobPost`). In more complex applications, you might have separate DTO classes that transform data between layers — for example, a `JobPostDTO` that excludes internal fields not meant for the frontend.

For now, `JobPost` serves as both the model and the DTO.

---

## 🧩 Concept 7: Verifying It Works

### 🔄 Testing the Flow

1. Start the application
2. Go to homepage → Click "Add Job"
3. Fill in: ID = 101, Profile = "Java Dev", Description = "Some desc", Experience = 1, Tech = Java
4. Click Submit → Success page shows the data
5. Check the console → The printed list shows all jobs, **including the new entry with ID 101**

The data is being stored! The last entry in the printed list is the newly added job. Our three-layer architecture is working.

### ⚠️ What's Still Missing

The data is stored in the ArrayList, but we haven't built the `/viewalljobs` mapping yet. The "View All Jobs" page still doesn't work — we can't display the list in the browser yet. That's the next step.

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. **Controllers don't store data** — that's the Repository's job. Each layer has a specific responsibility.
2. **Three-layer architecture**: Controller (HTTP) → Service (business logic) → Repository (data access).
3. **`@Repository`** marks the data access layer. **`@Service`** marks the business logic layer. Both are specialized `@Component`.
4. **`@Autowired`** lets Spring inject dependencies — no `new` keyword needed. Controller gets Service, Service gets Repo.
5. **`List.of()` creates immutable lists.** Wrap in `new ArrayList<>()` if you need to add/remove elements.
6. The `JobPost` object passed between layers is a **DTO (Data Transfer Object)**.
7. Changing the data source later means **only changing the Repository** — Controller and Service don't change.

### ⚠️ Common Mistakes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Using `List.of()` directly for mutable data | `UnsupportedOperationException` when adding | Wrap in `new ArrayList<>(List.of(...))` |
| Forgetting `@Repository` or `@Service` | `@Autowired` fails — bean not found | Add the appropriate stereotype annotation |
| Controller calling Repo directly (skipping Service) | Works but breaks architecture | Always go through the Service layer |
| Service calling itself instead of the Repo | Infinite recursion or wrong data | Check variable names — `repo.addJob()` not `service.addJob()` |
| Wrong package imports | Class not found errors | Verify all imports match `com.telusko.jobapp.*` |

### 💡 Pro Tips

1. **Even if the Service is a pass-through, create it.** When business requirements grow, you'll need that layer. Adding it later means refactoring the controller.
2. **The Repository is your database abstraction.** Today it's an ArrayList, tomorrow it's MySQL — and nothing else in the app needs to change. That's clean architecture.
3. **Use `System.out.println()` for quick verification** during development, but remove it before production. Later, you'll use proper logging with SLF4J.
4. **`@Autowired` works because of component scanning.** Spring scans `com.telusko.jobapp` (the main class package), finds `@Controller`, `@Service`, `@Repository`, creates beans, and wires them together. All automatic.
