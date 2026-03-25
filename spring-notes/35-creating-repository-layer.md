# 🗄️ Document 35: Creating the Repository Layer with @Repository

## Introduction: Completing the Three-Layer Architecture

We've now reached the third and final layer of our Spring application architecture. In the previous video, we created the service layer with `@Service` where business logic lives. But there's a critical question that remains unanswered: where do we actually write the database code?

The instructor made it crystal clear in Document 34: **"Where you should write your JDBC code is a separate class called repository class."** This isn't just about organization—it's about following one of the most fundamental principles in software architecture: **separation of concerns**. Each layer should have exactly one responsibility, and database access is NOT the responsibility of the service layer.

Think about it this way: your service layer is like a manager who makes business decisions. When the manager decides "we should save this laptop," they don't personally go to the warehouse and update the inventory system themselves. They tell a warehouse worker to do it. The repository layer is that warehouse worker—the specialist who knows exactly how to interact with the database.

In this video, we're going to:

1. **Create the Repository Layer**: Build a dedicated class for database operations
2. **Use the @Repository Annotation**: Mark it properly for Spring to manage
3. **Implement CRUD Operations**: Set up methods like `save()` for database access
4. **Connect Service to Repository**: Use dependency injection to make them work together
5. **Understand Package Organization**: Organize code into service/ and repository/ folders
6. **See Why Annotations Matter**: Experience what happens when we forget @Repository

By the end of this document, you'll have a complete three-layer architecture where Controller → Service → Repository → Database, with each layer having a single, clear responsibility.

---

## Step 1: The Problem Setup - Service Layer Needs Database Access

Let's start with where we left off. We have a `LaptopService` class that looks like this:

```java
package com.telusko.springbootdemo.service;

import org.springframework.stereotype.Service;
import com.telusko.springbootdemo.model.Laptop;

@Service
public class LaptopService {
    
    public void addLaptop(Laptop lap) {
        System.out.println("Method called");
        // Business logic here... but where's the database code?
    }
    
    public boolean isGoodForProgramming(Laptop lap) {
        return true;
    }
}
```

The instructor notes: **"There's some problem with the laptop service. I have entered one there."** Actually, it's not really a **problem**—it's an **incomplete implementation**. The `addLaptop()` method just prints "Method called" but doesn't actually save anything to a database.

Now, the **tempting but WRONG** approach would be to write JDBC code directly in the service class:

```java
// ❌ WRONG APPROACH - Don't do this!
@Service
public class LaptopService {
    
    public void addLaptop(Laptop lap) {
        System.out.println("Method called");
        
        // Bad: Database code in service layer
        Connection conn = DriverManager.getConnection(url, user, password);
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO laptops VALUES (?, ?)");
        stmt.setInt(1, lap.getId());
        stmt.setString(2, lap.getBrand());
        stmt.executeUpdate();
        // ... more JDBC code
    }
}
```

**Why is this wrong?** Because the service layer is responsible for **business logic**, not database access. Mixing these concerns creates:

- **Tight coupling**: Service becomes dependent on specific database technology
- **Hard to test**: Can't test business logic without database
- **Poor maintainability**: Changing database requires modifying service code
- **Violates Single Responsibility Principle**: Service doing two jobs instead of one

The instructor emphasizes: **"Don't write any JDBC steps in the service class."** This is a firm rule, not a suggestion.

---

## Step 2: Creating the Repository Class

The solution is to create a **separate class** dedicated to database operations. The instructor guides us:

**"If you want to work with database, what we can do is we can create another class here. And we'll name this class as maybe laptop repository."**

Let's create this new class:

```java
package com.telusko.springbootdemo.repository;

public class LaptopRepository {
    
    // Database operations will go here
}
```

**What is a Repository?**

Think of a repository as the **gatekeeper to your database**. In real-world terms:

- **Library Analogy**: The repository is like a librarian. When you want a book, you ask the librarian (repository) to find it. You don't go into the back storage room (database) yourself.
- **Store Analogy**: The repository is like a warehouse manager. When a customer orders a product, the sales team (service) requests it from the warehouse manager (repository), who knows exactly where everything is stored.

In software terms, the repository pattern means:

> **Repository**: A class that encapsulates all the logic required to access data sources. It provides a collection-like interface for accessing domain objects.

Martin Fowler defines it as: *"Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects."*

**Why a Separate Class?**

The instructor explains: **"This class is responsible to connect with database."** That's its **one** job. Not business logic. Not request handling. Just database access.

Benefits of separation:
- **Testability**: Service can use mock repository for testing
- **Flexibility**: Can swap database implementations without touching service
- **Clarity**: Database code is all in one place
- **Reusability**: Multiple services can use the same repository

---

## Step 3: Implementing the save() Method

Now we add the actual database operation method:

```java
package com.telusko.springbootdemo.repository;

import com.telusko.springbootdemo.model.Laptop;

public class LaptopRepository {
    
    public void save(Laptop lap) {
        // JDBC steps will go here
    }
}
```

The instructor notes: **"You can write some methods here. Let's say public void save. And you can take a laptop object let's say lap. And then in this you can write your JDBC steps."**

**What would the JDBC steps look like?** (We're not implementing them yet, but here's what they would be)

```java
public void save(Laptop lap) {
    // JDBC steps that will be written later:
    
    // 1. Load the JDBC driver
    // Class.forName("com.mysql.cj.jdbc.Driver");
    
    // 2. Establish connection
    // Connection conn = DriverManager.getConnection(url, username, password);
    
    // 3. Create prepared statement
    // String sql = "INSERT INTO laptops (id, brand, price) VALUES (?, ?, ?)";
    // PreparedStatement ps = conn.prepareStatement(sql);
    
    // 4. Set parameters
    // ps.setInt(1, lap.getId());
    // ps.setString(2, lap.getBrand());
    // ps.setDouble(3, lap.getPrice());
    
    // 5. Execute query
    // ps.executeUpdate();
    
    // 6. Close resources
    // ps.close();
    // conn.close();
    
    // For now, we'll just simulate success:
    System.out.println("Saved in database");
}
```

The instructor clarifies: **"Of course we're not going to write this in this video. But later on we'll do that."**

**Why not implement it now?**

Because this video is focused on **architecture** and **annotations**, not JDBC implementation. The goal is to understand:
- Where database code should live (repository layer)
- How layers connect (dependency injection)
- Why proper annotations matter (Spring bean management)

The actual JDBC implementation is a separate lesson that will come later.

---

## Step 4: CRUD Operations Overview

The instructor mentions an important concept: **"You can have all the Crud operations here create read update delete and whatever extra you want to have."**

**What are CRUD operations?**

CRUD is an acronym for the four basic database operations:

1. **C**reate: Insert new records (e.g., `save()`, `insert()`)
2. **R**ead: Retrieve records (e.g., `findById()`, `findAll()`)
3. **U**pdate: Modify existing records (e.g., `update()`, `modify()`)
4. **D**elete: Remove records (e.g., `delete()`, `remove()`)

A complete repository would look like this:

```java
public class LaptopRepository {
    
    // CREATE
    public void save(Laptop lap) {
        // INSERT query
        System.out.println("Saved in database");
    }
    
    // READ (single)
    public Laptop findById(int id) {
        // SELECT query with WHERE clause
        return laptop;
    }
    
    // READ (multiple)
    public List<Laptop> findAll() {
        // SELECT query for all records
        return laptops;
    }
    
    // UPDATE
    public void update(Laptop lap) {
        // UPDATE query
        System.out.println("Updated in database");
    }
    
    // DELETE
    public void delete(int id) {
        // DELETE query
        System.out.println("Deleted from database");
    }
    
    // Custom queries
    public List<Laptop> findByBrand(String brand) {
        // SELECT with WHERE brand = ?
        return laptops;
    }
    
    public List<Laptop> findExpensiveLaptops(double minPrice) {
        // SELECT with WHERE price > ?
        return laptops;
    }
}
```

**The Pattern**: Repository contains **all** database access logic. Service layer calls these methods instead of writing SQL directly.

The instructor emphasizes: **"This is a class where you can do everything."** Meaning: all database operations, custom queries, complex joins—everything database-related goes here.

---

## Step 5: Updating the Service to Use Repository

Now we need to connect the service layer to the repository layer. The instructor explains:

**"From the service basically you don't need to I mean you will not print method called. We need to call the method save of repository."**

Let's update the service:

```java
@Service
public class LaptopService {
    
    public void addLaptop(Laptop lap) {
        // Remove this:
        // System.out.println("Method called");
        
        // Add this:
        repo.save(lap);  // But wait... where does 'repo' come from?
    }
}
```

The instructor asks the key question: **"How do you call this method save here."**

To call `repo.save()`, we need an instance of `LaptopRepository`. This is where **dependency injection** comes in—the exact same pattern we learned with `@Autowired` in Document 28!

---

## Step 6: Injecting Repository into Service

The instructor guides us step by step:

**"To call the method of course you need object of the laptop repository. So let's do that here. So I will say private laptop repository I will say repo."**

```java
@Service
public class LaptopService {
    
    private LaptopRepository repo;  // Declare the dependency
    
    public void addLaptop(Laptop lap) {
        repo.save(lap);
    }
}
```

**"And then I want to inject it. Of course we can use data injection. But let's say if I'm using the field injection. So I'm injecting this object by using auto wired."**

```java
@Service
public class LaptopService {
    
    @Autowired
    private LaptopRepository repo;  // Inject the dependency
    
    public void addLaptop(Laptop lap) {
        repo.save(lap);  // Now we can use it!
    }
}
```

**What's Happening Here?**

This is **dependency injection** - the same concept we learned in Document 28. Let's review:

1. **Dependency Declaration**: `private LaptopRepository repo;` declares that LaptopService **depends on** LaptopRepository
2. **Injection Request**: `@Autowired` tells Spring "please inject a LaptopRepository bean here"
3. **Spring's Job**: Spring searches its container for a bean of type `LaptopRepository` and injects it

**Injection Types Reminder** (from Document 28):

The instructor mentions: **"Of course we can use data injection."** (He likely means constructor injection.) We have three options:

```java
// Option 1: Field Injection (what we're using)
@Service
public class LaptopService {
    @Autowired
    private LaptopRepository repo;
}

// Option 2: Constructor Injection (generally preferred)
@Service
public class LaptopService {
    private final LaptopRepository repo;
    
    @Autowired
    public LaptopService(LaptopRepository repo) {
        this.repo = repo;
    }
}

// Option 3: Setter Injection
@Service
public class LaptopService {
    private LaptopRepository repo;
    
    @Autowired
    public void setRepo(LaptopRepository repo) {
        this.repo = repo;
    }
}
```

For this demonstration, we're using **field injection** because it's the shortest and clearest for learning. In production code, **constructor injection** is generally preferred.

---

## Step 7: Completing the Service Method

Now we can finish implementing the `addLaptop()` method:

```java
@Service
public class LaptopService {
    
    @Autowired
    private LaptopRepository repo;
    
    public void addLaptop(Laptop lap) {
        repo.save(lap);  // Delegate to repository
    }
}
```

The instructor adds one more thing: **"And what I will do here is I will just print saved in database. That's it. Nothing fancy."**

Actually, this print statement goes in the **repository**, not the service:

```java
// LaptopRepository.java
public class LaptopRepository {
    
    public void save(Laptop lap) {
        // Imagine all JDBC steps here...
        System.out.println("Saved in database");
    }
}
```

The instructor clarifies: **"I'm just trying to say print something. Imagine I'm writing all database steps and it is executing the query, saving the data in the database. And you got response as saved. Imagine everything."**

This is a **simulation**. In a real application:
- JDBC code would execute SQL INSERT statement
- Database would save the data
- Method would return success/failure or saved object

But for now, `System.out.println("Saved in database")` proves the method was called and reached the repository layer.

---

## Step 8: The First Run - Bean Not Found Error

Now comes the learning moment. The instructor says: **"And now let's run this and let's see what happens. If you run this code you will get an error I mean that's what I'm expecting okay."**

**Why is he expecting an error?** Because we forgot something critical!

Let's say our main class looks like this:

```java
@SpringBootApplication
public class SpringBootDemoApplication {
    
    public static void main(String[] args) {
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringBootDemoApplication.class, args);
        
        Laptop lap = context.getBean(Laptop.class);
        LaptopService service = context.getBean(LaptopService.class);
        
        service.addLaptop(lap);
    }
}
```

**When we run this:**

```
***************************
APPLICATION FAILED TO START
***************************

Description:

Field repo in com.telusko.springbootdemo.service.LaptopService required a bean of type 'com.telusko.springbootdemo.repository.LaptopRepository' that could not be found.

Action:

Consider defining a bean of type 'com.telusko.springbootdemo.repository.LaptopRepository' in your configuration.
```

The instructor confirms: **"So you can see we got an error. It says the laptop repository could not be found. The been not found."**

**Why This Error Happens:**

Remember from Document 31: `@SpringBootApplication` includes `@ComponentScan`, which tells Spring to scan for components. But Spring only manages beans that are marked with stereotypes like:
- `@Component`
- `@Service`
- `@Repository`
- `@Controller`
- etc.

Our `LaptopRepository` class currently has **no annotation**:

```java
public class LaptopRepository {  // ❌ No annotation!
    public void save(Laptop lap) {
        System.out.println("Saved in database");
    }
}
```

Since it's not marked as a Spring bean, Spring doesn't create an instance of it. When `LaptopService` tries to inject `LaptopRepository` with `@Autowired`, Spring searches its container and finds... nothing.

**Result**: Bean not found error.

This is the same concept from Document 27 (component scanning) and Document 28 (autowiring). If a class isn't a Spring bean, it can't be injected!

---

## Step 9: First Solution - Using @Component

The instructor explains the fix: **"It's because on top of this, we have to write a annotation. As I mentioned before, you can also write add component. It will work."**

Let's try `@Component`:

```java
package com.telusko.springbootdemo.repository;

import org.springframework.stereotype.Component;
import com.telusko.springbootdemo.model.Laptop;

@Component
public class LaptopRepository {
    
    public void save(Laptop lap) {
        System.out.println("Saved in database");
    }
}
```

**"So if I run this with add component so you can see it works."**

**Output:**
```
Saved in database
```

Success! The error is gone because:

1. `@Component` marks `LaptopRepository` as a Spring bean
2. Spring creates an instance during component scanning
3. `@Autowired` in `LaptopService` can now find and inject it
4. `service.addLaptop(lap)` calls `repo.save(lap)` successfully

**So we're done, right?** Not quite!

---

## Step 10: Better Solution - Using @Repository

The instructor continues: **"But then when you have a repository layer, instead of using component or service, we are going to use a repository as a annotation."**

Let's change it:

```java
package com.telusko.springbootdemo.repository;

import org.springframework.stereotype.Repository;
import com.telusko.springbootdemo.model.Laptop;

@Repository  // Better than @Component for repository layer
public class LaptopRepository {
    
    public void save(Laptop lap) {
        System.out.println("Saved in database");
    }
}
```

**"And if you run this code, it will work the same way."**

**Output (identical to before):**
```
Saved in database
```

**Wait - if both work, why change it?**

Great question! The instructor explains: **"It does the same thing. It is also implementing component. It has annotation component on top of it."**

Let's look at the `@Repository` source code:

```java
package org.springframework.stereotype;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component  // ← See? @Repository IS a @Component!
public @interface Repository {
    @AliasFor(annotation = Component.class)
    String value() default "";
}
```

**Key Discovery**: `@Repository` is annotated with `@Component`! This is the same relationship we saw with `@Service` in Document 34.

**Hierarchy Visualization:**

```
@Component (base stereotype)
    ↑
    ├── @Service (for service layer)
    ├── @Repository (for repository layer)
    └── @Controller (for presentation layer)
```

All specialized stereotypes (`@Service`, `@Repository`, `@Controller`) are **types of** `@Component`. They all:
- Mark classes as Spring beans
- Enable component scanning detection
- Support dependency injection
- Work with `@Autowired`

**So why use @Repository instead of @Component?**

---

## Step 11: Why @Repository Matters - Semantic Clarity

The instructor provides the key reason: **"But again, if you are using any, uh, domain driven design, it makes sense to use repository. And also for developers who will be seeing your code later. If they say repository, then it makes sense to them that yeah, this is a repository layer."**

**Reason 1: Semantic Meaning**

`@Repository` communicates **intent**. When a developer sees:

```java
@Repository
public class LaptopRepository { }
```

They immediately know:
- This class handles database access
- It's part of the repository layer
- It probably contains CRUD operations
- It shouldn't have business logic

Compare to:

```java
@Component
public class LaptopRepository { }
```

Less clear. Is it a utility? A helper? A repository? You can't tell from the annotation alone.

**Reason 2: Domain-Driven Design (DDD)**

In Domain-Driven Design, a repository is a specific architectural pattern:

> **Repository Pattern**: An abstraction that encapsulates the set of objects persisted in a data store and the operations performed over them, providing a more object-oriented view of the persistence layer.

Using `@Repository` shows you're following established architectural patterns.

**Reason 3: Exception Translation** (Advanced Feature)

`@Repository` has a special capability: it enables automatic exception translation. When JDBC or JPA throws database-specific exceptions (like `SQLException`), Spring automatically converts them to Spring's `DataAccessException` hierarchy.

Why this matters:
- **Database Independence**: Your code isn't coupled to specific database exceptions
- **Consistency**: All data access exceptions follow Spring's exception hierarchy
- **Easier Testing**: Mock repositories can throw Spring exceptions instead of database-specific ones

Example without @Repository:

```java
@Component
public class LaptopRepository {
    public void save(Laptop lap) throws SQLException {  // Database-specific exception
        // JDBC code that might throw SQLException
    }
}
```

Example with @Repository:

```java
@Repository
public class LaptopRepository {
    public void save(Laptop lap) {  // No throws clause needed
        // JDBC code - any SQLException automatically converted to DataAccessException
    }
}
```

This is a more advanced feature that becomes important as you work with real databases.

---

## Step 12: Complete Code Review

Let's look at the complete three-layer structure:

**Model Layer** (Laptop.java):

```java
package com.telusko.springbootdemo.model;

import org.springframework.stereotype.Component;

@Component
public class Laptop {
    private int id;
    private String brand;
    private double price;
    
    // Constructors, getters, setters...
}
```

**Repository Layer** (LaptopRepository.java):

```java
package com.telusko.springbootdemo.repository;

import org.springframework.stereotype.Repository;
import com.telusko.springbootdemo.model.Laptop;

@Repository
public class LaptopRepository {
    
    public void save(Laptop lap) {
        // JDBC steps will be written later
        System.out.println("Saved in database");
    }
    
    // Future methods:
    // public Laptop findById(int id) { }
    // public List<Laptop> findAll() { }
    // public void update(Laptop lap) { }
    // public void delete(int id) { }
}
```

**Service Layer** (LaptopService.java):

```java
package com.telusko.springbootdemo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.telusko.springbootdemo.model.Laptop;
import com.telusko.springbootdemo.repository.LaptopRepository;

@Service
public class LaptopService {
    
    @Autowired
    private LaptopRepository repo;
    
    public void addLaptop(Laptop lap) {
        // Business logic here (validation, processing, etc.)
        repo.save(lap);  // Delegate database work to repository
    }
    
    public boolean isGoodForProgramming(Laptop lap) {
        // Business logic to check specifications
        return true;
    }
}
```

**Main Application**:

```java
package com.telusko.springbootdemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import com.telusko.springbootdemo.model.Laptop;
import com.telusko.springbootdemo.service.LaptopService;

@SpringBootApplication
public class SpringBootDemoApplication {
    
    public static void main(String[] args) {
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringBootDemoApplication.class, args);
        
        Laptop lap = context.getBean(Laptop.class);
        LaptopService service = context.getBean(LaptopService.class);
        
        service.addLaptop(lap);
    }
}
```

**Output:**
```
Saved in database
```

**Data Flow:**

```
Main Application
    ↓ calls service.addLaptop(lap)
Service Layer (LaptopService)
    ↓ calls repo.save(lap)
Repository Layer (LaptopRepository)
    ↓ executes JDBC code
Database
```

The instructor celebrates: **"But now if you can differentiate we have laptop service or we have service annotation. We got laptop repository. We have repository."**

**The Clarity Achievement:**

- See `@Service`? → Business logic layer
- See `@Repository`? → Database access layer
- See `@Controller`? → Request handling layer (coming later)

Each annotation tells a story about the class's purpose!

---

## Step 13: Package Organization - Creating Separate Folders

The instructor realizes an organizational improvement: **"And one thing we forgot we should be saving this in a different package called repo."**

**Current Structure** (everything in one package):

```
com.telusko.springbootdemo/
├── SpringBootDemoApplication.java
├── Laptop.java
├── LaptopService.java
└── LaptopRepository.java
```

**Better Structure** (organized by layers):

```
com.telusko.springbootdemo/
├── SpringBootDemoApplication.java
├── model/
│   └── Laptop.java
├── service/
│   └── LaptopService.java
└── repository/
    └── LaptopRepository.java
```

**How to Refactor:**

The instructor shows: **"Move to depot. Yeah."** (Using IDE refactoring)

In IntelliJ IDEA or VS Code:
1. Right-click on `LaptopRepository.java`
2. Select "Refactor" → "Move"
3. Create/select package: `com.telusko.springbootdemo.repository`
4. IDE automatically updates imports everywhere

The result: **"So you can see we have different folders."**

**Package Structure Benefits:**

```
repository/  ← All database access classes
    LaptopRepository.java
    UserRepository.java
    OrderRepository.java
    
service/  ← All business logic classes
    LaptopService.java
    UserService.java
    OrderService.java
    
model/  ← All entity/domain classes
    Laptop.java
    User.java
    Order.java
```

**Why This Matters:**

1. **Clarity**: You instantly know where to find classes by their purpose
2. **Scalability**: As project grows, organization prevents chaos
3. **Team Collaboration**: Multiple developers can work on different packages without conflicts
4. **Convention**: Industry-standard structure that all Spring developers recognize

---

## Step 14: Looking Forward - Real Projects and Spring Web

The instructor provides important context: **"This will make much more sense once we understood spring web, because that's where we are going to literally create all these packages and save our files there."**

**Why waiting for Spring Web?**

Currently we're using a simple `main()` method to test our layers:

```java
public static void main(String[] args) {
    ConfigurableApplicationContext context = 
        SpringApplication.run(SpringBootDemoApplication.class, args);
    
    LaptopService service = context.getBean(LaptopService.class);
    service.addLaptop(lap);
}
```

In **Spring Web** (coming soon), we'll have:

**Controller Layer:**

```java
@RestController
@RequestMapping("/api/laptops")
public class LaptopController {
    
    @Autowired
    private LaptopService service;
    
    @PostMapping
    public ResponseEntity<String> addLaptop(@RequestBody Laptop lap) {
        service.addLaptop(lap);
        return ResponseEntity.ok("Laptop added successfully");
    }
}
```

**Complete Four-Layer Architecture:**

```
HTTP Request (Postman/Browser)
    ↓
Controller Layer (LaptopController) - Handles HTTP requests
    ↓
Service Layer (LaptopService) - Business logic
    ↓
Repository Layer (LaptopRepository) - Database access
    ↓
Database (MySQL/PostgreSQL)
```

Each layer will have its own package with multiple classes, making the organization even more critical.

---

## Step 15: The Reality of Real Projects

The instructor addresses a concern: **"I know you might be thinking in one folder, you got only one file, as you can see, but in real project you'll be having multiple entities, multiple objects to work with."**

**Current Learning Project** (simple):

```
model/
    └── Laptop.java  ← Only one entity

service/
    └── LaptopService.java  ← Only one service

repository/
    └── LaptopRepository.java  ← Only one repository
```

**Real E-Commerce Project** (complex):

```
model/
    ├── User.java
    ├── Product.java
    ├── Order.java
    ├── OrderItem.java
    ├── Address.java
    ├── Payment.java
    ├── Category.java
    └── Review.java  ← 8+ entities

service/
    ├── UserService.java
    ├── ProductService.java
    ├── OrderService.java
    ├── PaymentService.java
    ├── EmailService.java
    └── InventoryService.java  ← 6+ services

repository/
    ├── UserRepository.java
    ├── ProductRepository.java
    ├── OrderRepository.java
    ├── OrderItemRepository.java
    ├── AddressRepository.java
    ├── PaymentRepository.java
    ├── CategoryRepository.java
    └── ReviewRepository.java  ← 8+ repositories

controller/
    ├── UserController.java
    ├── ProductController.java
    ├── OrderController.java
    └── PaymentController.java  ← 4+ controllers
```

**The instructor's point**: **"So they will have multiple classes here. Multiple interfaces."**

In real projects:
- **Dozens or hundreds** of entities
- **Complex relationships** between classes
- **Multiple developers** working simultaneously
- **Clear organization** becomes absolutely critical

That's when package structure stops being "nice to have" and becomes **absolutely essential**.

---

## Step 16: Preview of What's Coming

The instructor concludes: **"In fact let's create a separate project based on all these things which we have learned because slowly we are moving towards actually connecting with database."**

**The Learning Progression:**

✅ **Phase 1: Spring Core** (Documents 1-30)
- Dependency injection
- Bean lifecycle
- Configuration styles (XML, Java, Annotations)
- Component scanning
- Autowiring

✅ **Phase 2: Spring Boot Basics** (Documents 31-35)
- Understanding @SpringBootApplication
- Applying Spring Core concepts
- Layered architecture
- Service and Repository layers

🔄 **Phase 3: Coming Next**
- **New Project**: Student management instead of laptops
- **Real Database Connection**: Actual JDBC implementation
- **CRUD Operations**: Complete create, read, update, delete
- **Spring Web**: REST APIs and controllers
- **Data Flow**: End-to-end request → database → response

The instructor teases: **"Let's use different example next time maybe for student instead of alien and laptop and see how do you manage students using different layers."**

**Why a new example?**

- **Fresh perspective**: Helps reinforce concepts by applying them again
- **Practical domain**: Student management is relatable
- **Clean slate**: Start fresh without accumulated complexity
- **Progressive learning**: Each project adds new techniques

---

## Key Concepts Summary

### 1. Repository Pattern
**Definition**: A class that encapsulates all database access logic, providing a collection-like interface for domain objects.

**Purpose**: Separate database concerns from business logic.

**Example**:
```java
@Repository
public class LaptopRepository {
    public void save(Laptop lap) { }
    public Laptop findById(int id) { }
    public List<Laptop> findAll() { }
    public void update(Laptop lap) { }
    public void delete(int id) { }
}
```

### 2. @Repository Annotation
**What it does**:
- Marks class as Spring bean (like @Component)
- Indicates repository/DAO layer
- Enables exception translation (database → Spring exceptions)

**Source code**:
```java
@Component
public @interface Repository { }
```

**When to use**: Any class that directly accesses the database.

### 3. Service → Repository Dependency Injection
**Pattern**:
```java
@Service
public class LaptopService {
    @Autowired
    private LaptopRepository repo;  // Inject dependency
    
    public void addLaptop(Laptop lap) {
        repo.save(lap);  // Delegate to repository
    }
}
```

**Why**: Service needs repository, but shouldn't create it (Dependency Inversion Principle).

### 4. CRUD Operations
**Acronym**: Create, Read, Update, Delete

**Standard methods**:
- `save()` / `insert()` - Create new records
- `findById()` / `findAll()` - Read records
- `update()` - Modify existing records
- `delete()` - Remove records

**Repository responsibility**: Implement ALL data access operations.

### 5. Package Organization
**Standard structure**:
```
com.company.project/
├── controller/  (HTTP handling)
├── service/     (Business logic)
├── repository/  (Database access)
└── model/       (Domain entities)
```

**Benefits**: Clarity, scalability, team collaboration.

### 6. Separation of Concerns
**Principle**: Each layer has ONE responsibility.

**Layer responsibilities**:
- **Controller**: Handle HTTP requests/responses
- **Service**: Implement business logic
- **Repository**: Access database
- **Model**: Represent domain entities

**Anti-pattern**: Writing JDBC code in service layer.

### 7. Exception Translation
**Feature**: `@Repository` enables automatic conversion of database exceptions to Spring's `DataAccessException`.

**Example**:
```java
@Repository
public class LaptopRepository {
    public void save(Laptop lap) {
        // SQLException automatically converted to DataAccessException
    }
}
```

**Benefit**: Database independence and consistent exception handling.

---

## Common Mistakes and How to Avoid Them

### Mistake 1: Forgetting @Repository Annotation

**Problem**:
```java
public class LaptopRepository {  // ❌ No annotation
    public void save(Laptop lap) { }
}
```

**Error**:
```
required a bean of type 'LaptopRepository' that could not be found
```

**Solution**: Always annotate repository classes:
```java
@Repository
public class LaptopRepository { }
```

### Mistake 2: Writing Database Code in Service Layer

**Problem**:
```java
@Service
public class LaptopService {
    public void addLaptop(Laptop lap) {
        // ❌ JDBC code in service
        Connection conn = DriverManager.getConnection(...);
        PreparedStatement ps = conn.prepareStatement(...);
        ps.executeUpdate();
    }
}
```

**Solution**: Always delegate to repository:
```java
@Service
public class LaptopService {
    @Autowired
    private LaptopRepository repo;
    
    public void addLaptop(Laptop lap) {
        repo.save(lap);  // ✅ Repository handles database
    }
}
```

### Mistake 3: Using @Component Instead of @Repository

**Problem**: Works, but semantically wrong:
```java
@Component  // ❌ Too generic
public class LaptopRepository { }
```

**Solution**: Use the specific stereotype:
```java
@Repository  // ✅ Clear intent
public class LaptopRepository { }
```

### Mistake 4: Poor Package Organization

**Problem**: Everything in one package:
```
com.telusko/
├── LaptopRepository.java
├── LaptopService.java
├── Laptop.java
└── LaptopController.java  // Mixed together
```

**Solution**: Organize by layer:
```
com.telusko/
├── repository/
│   └── LaptopRepository.java
├── service/
│   └── LaptopService.java
├── model/
│   └── Laptop.java
└── controller/
    └── LaptopController.java
```

### Mistake 5: Not Injecting Repository Properly

**Problem**: Creating repository manually:
```java
@Service
public class LaptopService {
    private LaptopRepository repo = new LaptopRepository();  // ❌ Manual creation
}
```

**Solution**: Use dependency injection:
```java
@Service
public class LaptopService {
    @Autowired  // ✅ Let Spring inject it
    private LaptopRepository repo;
}
```

---

## Real-World Application: E-Commerce Example

Let's see how repository pattern works in a real e-commerce system:

**Product Repository**:
```java
@Repository
public class ProductRepository {
    
    public void save(Product product) {
        // INSERT INTO products ...
    }
    
    public Product findById(Long id) {
        // SELECT * FROM products WHERE id = ?
    }
    
    public List<Product> findByCategory(String category) {
        // SELECT * FROM products WHERE category = ?
    }
    
    public List<Product> findInPriceRange(double min, double max) {
        // SELECT * FROM products WHERE price BETWEEN ? AND ?
    }
    
    public void updateStock(Long id, int quantity) {
        // UPDATE products SET stock = stock - ? WHERE id = ?
    }
}
```

**Product Service**:
```java
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepo;
    
    @Autowired
    private InventoryService inventoryService;
    
    public void addProduct(Product product) {
        // Business logic: validate product details
        if (product.getPrice() <= 0) {
            throw new InvalidProductException("Price must be positive");
        }
        
        // Delegate to repository
        productRepo.save(product);
        
        // Additional business logic: update inventory
        inventoryService.initializeStock(product.getId());
    }
    
    public List<Product> getAffordableProducts(double budget) {
        // Business logic: find products within budget
        return productRepo.findInPriceRange(0, budget)
                          .stream()
                          .filter(p -> p.isInStock())
                          .collect(Collectors.toList());
    }
}
```

**Separation of Concerns**:
- **Repository**: Pure database operations (SQL queries)
- **Service**: Business rules (validation, filtering, orchestration)
- **Controller**: HTTP handling (coming with Spring Web)

---

## Testing Benefits of Repository Pattern

The repository pattern makes testing much easier:

**Without Repository Pattern**:
```java
@Service
public class LaptopService {
    public void addLaptop(Laptop lap) {
        // Direct JDBC code - hard to test without database
        Connection conn = DriverManager.getConnection(...);
        // ...
    }
}

// Testing requires actual database connection
```

**With Repository Pattern**:
```java
@Service
public class LaptopService {
    @Autowired
    private LaptopRepository repo;
    
    public void addLaptop(Laptop lap) {
        repo.save(lap);  // Can be mocked!
    }
}

// Testing uses mock repository - no database needed
@Test
public void testAddLaptop() {
    // Create mock repository
    LaptopRepository mockRepo = mock(LaptopRepository.class);
    
    // Inject mock into service
    LaptopService service = new LaptopService();
    service.setRepo(mockRepo);
    
    // Test business logic without database
    Laptop lap = new Laptop();
    service.addLaptop(lap);
    
    // Verify repository was called
    verify(mockRepo).save(lap);
}
```

**Benefits**:
- Tests run fast (no database)
- Tests are isolated (no external dependencies)
- Can test error scenarios easily (mock exceptions)

---

## The Complete Three-Layer Data Flow

Let's trace a complete request through all layers:

**Scenario**: Adding a laptop to the system

**Step 1 - Main Application** (Currently - will be Controller later):
```java
public static void main(String[] args) {
    ConfigurableApplicationContext context = 
        SpringApplication.run(SpringBootDemoApplication.class, args);
    
    // Create laptop object
    Laptop lap = new Laptop();
    lap.setId(1);
    lap.setBrand("Dell");
    lap.setPrice(50000);
    
    // Get service and call method
    LaptopService service = context.getBean(LaptopService.class);
    service.addLaptop(lap);  // 👈 Request starts here
}
```

**Step 2 - Service Layer** (Business Logic):
```java
@Service
public class LaptopService {
    
    @Autowired
    private LaptopRepository repo;
    
    public void addLaptop(Laptop lap) {
        // Business logic layer
        System.out.println("Service: Processing laptop...");
        
        // Could have validation:
        // if (lap.getPrice() < 0) throw new InvalidPriceException();
        
        // Could have business rules:
        // if (lap.getBrand().equals("Apple")) lap.setWarranty(3);
        
        // Delegate to repository
        repo.save(lap);  // 👈 Pass to repository
        
        System.out.println("Service: Laptop processed successfully");
    }
}
```

**Step 3 - Repository Layer** (Database Access):
```java
@Repository
public class LaptopRepository {
    
    public void save(Laptop lap) {
        // Database layer
        System.out.println("Repository: Connecting to database...");
        
        // JDBC steps (will be implemented later):
        // 1. Get connection
        // 2. Prepare INSERT statement
        // 3. Set parameters
        // 4. Execute query
        // 5. Close resources
        
        System.out.println("Saved in database");  // 👈 Database operation
        System.out.println("Repository: Connection closed");
    }
}
```

**Step 4 - Output**:
```
Service: Processing laptop...
Repository: Connecting to database...
Saved in database
Repository: Connection closed
Service: Laptop processed successfully
```

**Complete Flow Diagram**:
```
Main/Controller
    ↓ service.addLaptop(lap)
    ↓
Service Layer (LaptopService)
    ├─ Validate business rules
    ├─ Apply business logic
    ↓ repo.save(lap)
    ↓
Repository Layer (LaptopRepository)
    ├─ Connect to database
    ├─ Execute SQL INSERT
    ├─ Close connection
    ↓ returns
    ↓
Service Layer
    ↓ returns
    ↓
Main/Controller
```

Each layer has a clear job, and the flow is unidirectional: Controller → Service → Repository → Database.

---

## Conclusion: Architecture Complete, Implementation Pending

We've now completed the three-layer architecture setup:

✅ **Model Layer**: Domain entities (`@Component` on Laptop)
✅ **Service Layer**: Business logic (`@Service` on LaptopService)
✅ **Repository Layer**: Database access (`@Repository` on LaptopRepository)

The instructor summarizes: **"Yeah that's about this particular topic of service and repository."**

**What We Accomplished**:

1. **Created Repository Class**: Dedicated location for database code
2. **Used @Repository Annotation**: Proper stereotype for data access layer
3. **Implemented Dependency Injection**: Service → Repository connection
4. **Organized Packages**: Separated service/ and repository/
5. **Understood CRUD Operations**: Create, Read, Update, Delete pattern
6. **Experienced Bean Not Found Error**: Learned importance of annotations
7. **Compared @Component vs @Repository**: Semantic meaning matters

**What's Still Coming**:

- **JDBC Implementation**: Actual database connection and SQL queries
- **New Project**: Student management with all layers
- **Spring Web**: Controller layer and REST APIs
- **Complete Data Flow**: HTTP request → Controller → Service → Repository → Database

The instructor previews: **"See you in the next video."**

We're at an exciting transition point. We've built the architectural foundation. Now we're ready to add real database functionality and create a complete, production-ready Spring Boot application!

The layered architecture is no longer theoretical—it's implemented, organized, and ready for real work! 🎉
