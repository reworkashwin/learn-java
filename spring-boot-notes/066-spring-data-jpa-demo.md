# Demo of Spring Data JPA — Putting It All Together

## Introduction

We've learned the theory — Entity classes, Repository interfaces, JPA annotations, the interface hierarchy. Now it's time for the **magic moment**: actually talking to the database with barely any code. In this lecture, we wire everything together — Entity → Repository → Service → Controller — and see data flow from the database to a REST API response.

---

## Step 1: Ensure Dependencies Are Configured

Before writing any code, two things must be in your `pom.xml`:

```xml
<!-- Database (H2 for now) -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

And in `application.properties`, your database configuration:

```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver
```

Spring Data JPA reads these properties and **automatically creates a database connection** during startup. You never write connection code yourself.

---

## Step 2: Create the Repository Interface

Create a new package `com.easybytes.jobportal.repository` and add:

```java
@Repository  // Optional — framework auto-detects it anyway
public interface CompanyRepository extends JpaRepository<Company, Long> {
}
```

That's it. Seriously. **Two lines of code** and you have a fully functional data access layer with:
- `findAll()` — fetch all companies
- `findById(Long id)` — fetch by primary key
- `save(Company company)` — insert or update
- `delete(Company company)` — remove a record
- `count()` — number of records
- And many more methods

### How does it work?

When Spring Boot starts:
1. It scans for interfaces extending `JpaRepository`
2. It generates an **implementation class** with all the method logic
3. It creates a **Spring bean** of that implementation
4. The bean is ready for dependency injection

> "But this is an interface — how can Spring create an object of it?" Great question! The framework generates a concrete implementation class behind the scenes. You never see it, but it's there.

### The Two Generic Parameters

```java
JpaRepository<Company, Long>
//            ^Entity  ^Primary Key Type
```

- `Company` — the Entity class representing the `COMPANIES` table
- `Long` — the data type of the `id` field (primary key)

---

## Step 3: Build the Service Layer

### Why not call Repository directly from Controller?

Best practice is to have a **layered architecture**:

```
Controller → Service → Repository → Database
```

The Controller handles HTTP requests. The Service contains business logic. The Repository talks to the database. Each layer has a clear responsibility.

### Create the Service Interface

```java
public interface ICompanyService {
    List<Company> getAllCompanies();
}
```

### Create the Implementation

```java
@Service
public class CompanyServiceImpl implements ICompanyService {

    private final CompanyRepository companyRepository;

    public CompanyServiceImpl(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Override
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }
}
```

Look at how simple the `getAllCompanies()` method is. **One line of code.** No SQL. No connections. No ResultSet iteration. No exception handling. No transaction management. The framework handles all of it.

### Why use an interface (ICompanyService)?

By injecting `ICompanyService` instead of `CompanyServiceImpl` into the Controller, you gain **flexibility**:
- Switch implementations without changing the Controller
- Use different implementations for different environments (QA vs Production)
- Mark one as `@Primary` to control which one gets injected

---

## Step 4: Wire Up the Controller

```java
@RestController
@RequestMapping("/api")
public class CompanyController {

    private final ICompanyService companyService;

    public CompanyController(ICompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/companies")
    public ResponseEntity<List<Company>> getAllCompanies() {
        List<Company> companyList = companyService.getAllCompanies();
        return ResponseEntity.ok(companyList);
    }
}
```

### The dependency injection chain

```
Controller has → ICompanyService (injected via constructor)
ServiceImpl has → CompanyRepository (injected via constructor)
CompanyRepository → extends JpaRepository (auto-implemented by framework)
```

Spring resolves this entire chain automatically during startup.

---

## Step 5: Don't Forget Getters and Setters!

The Entity class needs **getter and setter methods** for all fields. Without them, the framework can't read from or write to your fields.

```java
@Entity
@Table(name = "COMPANIES")
public class Company {
    // ... fields ...

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    // ... getters and setters for all fields ...
}
```

> Don't worry — in the next lecture, we'll learn about **Lombok**, which eliminates all this boilerplate.

---

## Step 6: Test It!

Start the application and hit the REST API from Postman:

```
GET http://localhost:8080/api/companies
```

**Result:** A JSON array with all company records from the database! Every field — id, name, logo, industry, size, rating — all there, formatted as JSON.

### The Magical Moment

Let that sink in:
- **No SQL written anywhere** in Java code
- **No database connection management**
- **No ResultSet processing**
- **No exception handling for database operations**

Just one method call — `companyRepository.findAll()` — and the framework did everything.

---

## What Happened Behind the Scenes?

When you called `companyRepository.findAll()`:

1. Spring Data JPA's auto-generated implementation kicked in
2. It created a `SELECT * FROM COMPANIES` SQL statement
3. Used the pre-configured database connection
4. Executed the query
5. Mapped each row to a `Company` object (using getters/setters)
6. Returned the `List<Company>`
7. Spring Boot serialized it to JSON and sent the HTTP response

All with **one line of code** on your part.

---

## ✅ Key Takeaways

1. A Repository interface extending `JpaRepository` needs **zero implementation code** — the framework generates everything.
2. Follow the **Controller → Service → Repository** layered architecture.
3. `companyRepository.findAll()` fetches all records — no SQL, no connections, no boilerplate.
4. Inject **interfaces** (not implementations) into controllers for flexibility.
5. Entity classes **must have getters and setters** — the framework uses them to map data.
6. Spring auto-detects `JpaRepository` sub-interfaces and creates beans automatically (even without `@Repository`).
7. The `@Repository` annotation is **optional** on JPA repository interfaces — the framework detects them through `JpaRepository` inheritance.

---

## ⚠️ Common Mistakes

- **Forgetting getters and setters** on the Entity class — the framework can't map data without them.
- **Calling Repository directly from Controller** — always use a Service layer in between.
- **Injecting the implementation class** instead of the interface — inject `ICompanyService`, not `CompanyServiceImpl`.
- **Not adding `spring-boot-starter-data-jpa`** dependency — without it, none of this works.

---

## 💡 Pro Tips

- `@Repository` annotation on the interface is optional when extending `JpaRepository`. Spring identifies it automatically.
- With a single constructor, `@Autowired` is optional — Spring injects dependencies through the constructor by default.
- This `findAll()` method is just the beginning. In coming lectures, you'll learn custom queries with WHERE conditions, pagination, sorting, and much more.
- The next lecture introduces **Lombok**, which will eliminate all those getter/setter lines and reduce your Entity class from 180+ lines to 60.
