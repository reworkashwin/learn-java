# 🏗️ Document 38: Building Service and Repository Layers with Spring

## Introduction: Implementing the Layered Architecture

In Document 37, we created the Student model and prepared our Spring Boot project. We set student data, but hit a wall—there's no way to save it to the database yet! The instructor left us with a cliffhanger: **"So let's create those two layers in the next video."**

Now it's time to build those layers!

The instructor starts: **"Now let's create those two layers. So basically we want to create a service layer and a repository layer."**

Remember the architecture from Document 33-35:

```
Main/Client
    ↓
Service Layer (business logic)
    ↓
Repository Layer (database access)
    ↓
Database (H2)
```

In this video, we're going to:

1. **Create StudentService** with addStudent() method
2. **Create StudentRepo** with save() method
3. **Wire them together** using dependency injection
4. **Test the flow** to make sure layers communicate
5. **Add getStudents() / findAll()** for retrieving data
6. **Set up for JdbcTemplate** (next video will connect to real database)

By the end, we'll have a complete layered architecture—service calling repository, repository ready for database operations. Right now we'll use dummy data to test the flow, then in the next video we'll connect to the actual H2 database using JdbcTemplate.

Let's build!

---

## Step 1: Planning the Service Layer

The instructor explains what we need: **"So we want a add student method in the service layer. Right."**

**Why a Service Layer Method?**

Currently, in our main method, we have:

```java
Student s = context.getBean(Student.class);
s.setRollNumber(101);
s.setName("Naveen");
s.setMarks(78);

// Now what? How do we save this?
```

We need a **service method** that our client (main) can call:

```java
StudentService service = context.getBean(StudentService.class);
service.addStudent(s);  // This is what we want!
```

**Service Layer Responsibilities** (from Document 33):
- Business logic
- Validation
- Transaction coordination
- Orchestrating multiple repositories if needed

For our simple case, the service will:
- Accept student from client
- Delegate to repository for database storage
- Handle any business rules (future: validate marks are 0-100, check for duplicates, etc.)

---

## Step 2: Creating the StudentService Class

**"So what you're going to do is we will create a class called a student service. So let me create a class student service."**

### Creating the Class

**In IntelliJ:**
1. Right-click on `com.telusko.springjdbcexample` package
2. New → Java Class
3. Name: `StudentService`
4. Press Enter

**Initial Class:**

```java
package com.telusko.springjdbcexample;

public class StudentService {
    
}
```

### Moving to Service Package

But wait! The instructor immediately realizes: **"And you have to make sure that this belongs to a different package will say service package."**

**Why a Separate Package?**

From Document 35, we learned to organize code by layer:

```
com.telusko.springjdbcexample/
├── model/
│   └── Student.java
├── service/
│   └── StudentService.java  ← Should be here
└── repository/
    └── StudentRepo.java
```

**Creating and Moving:**

**"And then we have to also create that package. So I will just say move to service."**

1. Right-click on `StudentService.java`
2. Refactor → Move
3. Type: `com.telusko.springjdbcexample.service` (create new package)
4. Click OK

**"Yes NSC okay."** (Accepting IntelliJ's prompt about package structure)

**Updated Class:**

```java
package com.telusko.springjdbcexample.service;

public class StudentService {
    
}
```

**"So you can see we got a service package. And now in that we have a file called Student service."**

**Project Structure Now:**

```
com.telusko.springjdbcexample/
├── SpringJdbcExampleApplication.java
├── model/
│   └── Student.java
└── service/
    └── StudentService.java ✅
```

---

## Step 3: Adding the addStudent() Method

**"Now in this basically I want a method which says Add student."**

```java
package com.telusko.springjdbcexample.service;

import com.telusko.springjdbcexample.model.Student;

public class StudentService {
    
    public void addStudent(Student student) {
        // Implementation coming
    }
}
```

**Method Signature Breakdown:**

- `public`: Can be called from outside the class (by main)
- `void`: Doesn't return anything (just performs action)
- `addStudent`: Clear, descriptive name
- `Student student`: Takes student object to save

**Why This Signature?**

The client (main) has a student object and wants to save it:

```java
Student s = context.getBean(Student.class);
s.setRollNumber(101);
s.setName("Naveen");
s.setMarks(78);

service.addStudent(s);  // Pass student to service
```

---

## Step 4: Using the Service from Main

Now let's update the main method to use this service:

**"So when I talk about this particular method this should belong to that particular class. And for that what I will do is I will create the object for service student service."**

### Getting the Service Bean

**"So I will say student service. I will say service is equal to. Now instead of creating the object by ourself, we should be asking the context to give you the bean for student service dot class."**

```java
package com.telusko.springjdbcexample;

import com.telusko.springjdbcexample.model.Student;
import com.telusko.springjdbcexample.service.StudentService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringJdbcExampleApplication.class, args);
        
        Student s = context.getBean(Student.class);
        s.setRollNumber(101);
        s.setName("Naveen");
        s.setMarks(78);
        
        // Get service bean
        StudentService service = context.getBean(StudentService.class);
        service.addStudent(s);  // Call the method
    }
}
```

**Pattern Review** (from Spring Core learning):

```java
// ❌ Manual creation - not Spring-managed
StudentService service = new StudentService();

// ✅ Spring-managed - benefits from DI, AOP, transactions
StudentService service = context.getBean(StudentService.class);
```

---

## Step 5: The Missing @Service Annotation

**"Right? But then this will not work because on student service we are not using a annotation."**

If you try to run the code now, you'll get an error:

```
***************************
APPLICATION FAILED TO START
***************************

Description:

No qualifying bean of type 'com.telusko.springjdbcexample.service.StudentService' available
```

**Why?**

Spring doesn't know about `StudentService` because it's not marked as a Spring bean! Remember from Document 27 (Component Scanning)—Spring only manages classes marked with stereotypes like `@Component`, `@Service`, `@Repository`, etc.

**"Now which one we should use? Of course we can use component, but here I want to use service because this is a service class."**

### Adding @Service Annotation

```java
package com.telusko.springjdbcexample.service;

import com.telusko.springjdbcexample.model.Student;
import org.springframework.stereotype.Service;

@Service  // Marks this as a Spring-managed service bean
public class StudentService {
    
    public void addStudent(Student student) {
        // Implementation coming
    }
}
```

**Why @Service instead of @Component?**

From Document 34, we learned that `@Service` IS `@Component` but with semantic meaning:

```java
// @Service source code
@Component  // ← @Service is a specialized @Component
public @interface Service {
    String value() default "";
}
```

**Both work identically, but @Service communicates intent:**

```java
@Component
public class StudentService { }  // Less clear - what type of component?

@Service
public class StudentService { }  // Clear - this is a service layer class
```

**Benefits of @Service:**
1. **Semantic clarity**: Developers know it's the service layer
2. **Architecture alignment**: Follows Domain-Driven Design patterns
3. **Future features**: Spring might add service-specific features
4. **Team communication**: Standard naming convention

Now Spring will detect `StudentService` during component scanning and create a bean!

---

## Step 6: Implementing addStudent() - First Attempt

**"Now if you go back here I can simply say service dot add student. But unfortunately we don't have this method in the service class."**

Actually, we DO have the method signature, but it's empty. Let's add a simple implementation first to test:

**"And at this point I will simply print added. That's it. Nothing fancy, just add it."**

```java
@Service
public class StudentService {
    
    public void addStudent(Student student) {
        System.out.println("Added");  // Temporary - just for testing
    }
}
```

**Why Print Instead of Actually Saving?**

The instructor explains: **"See, in the service class you can have multiple methods, not just for storing data in database, because the actual code for storing data in database will be done in repository."**

**Service vs Repository Responsibilities:**

```java
// ❌ WRONG: Database code in service
@Service
public class StudentService {
    public void addStudent(Student student) {
        // Don't do this in service!
        Connection conn = DriverManager.getConnection(...);
        PreparedStatement ps = conn.prepareStatement("INSERT ...");
        ps.executeUpdate();
    }
}

// ✅ RIGHT: Delegate to repository
@Service
public class StudentService {
    @Autowired
    private StudentRepo repo;
    
    public void addStudent(Student student) {
        // Business logic here (validation, etc.)
        repo.save(student);  // Delegate to repository
    }
}
```

**Service Layer Can Have Many Methods:**

**"Apart from those methods for the Crud, we can have some more methods as well. If you want to say find a student who got a marks more than this or that. I mean whatever extra you want to do, any processing you want to do on students."**

**Example of Service Layer Methods:**

```java
@Service
public class StudentService {
    
    // CRUD methods (delegate to repository)
    public void addStudent(Student student) { }
    public Student getStudent(int rollNumber) { }
    public void updateStudent(Student student) { }
    public void deleteStudent(int rollNumber) { }
    
    // Business logic methods (processing)
    public List<Student> getTopPerformers() {
        // Get all students, filter marks > 90
    }
    
    public double calculateAverageMarks() {
        // Get all students, calculate average
    }
    
    public List<Student> getFailingStudents() {
        // Return students with marks < 40
    }
    
    public boolean isEligibleForScholarship(Student student) {
        // Business rule: marks > 85 and no failures
    }
}
```

**But for now...**

**"Basically you can have all the methods here, but here just want to keep it simple. I just want Add student as of now."**

Focus on learning the architecture first. Complex business logic can come later!

---

## Step 7: Testing the First Version

**"So I will say create a method called add student. And at this point I will simply print added. That's it. Nothing fancy, just add it. Okay."**

**Complete Code So Far:**

**StudentService.java:**
```java
package com.telusko.springjdbcexample.service;

import com.telusko.springjdbcexample.model.Student;
import org.springframework.stereotype.Service;

@Service
public class StudentService {
    
    public void addStudent(Student student) {
        System.out.println("Added");
    }
}
```

**SpringJdbcExampleApplication.java:**
```java
@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringJdbcExampleApplication.class, args);
        
        Student s = context.getBean(Student.class);
        s.setRollNumber(101);
        s.setName("Naveen");
        s.setMarks(78);
        
        StudentService service = context.getBean(StudentService.class);
        service.addStudent(s);
    }
}
```

**The Instructor's Testing Philosophy:**

**"So now let's see. Till this point things are working out. So I always believe that when you do something run it, check if it is working, then go for the next step."**

This is **excellent practice**! 

**Incremental Development Benefits:**
1. **Early error detection**: Catch issues immediately
2. **Smaller debugging scope**: Only new code to check
3. **Confidence building**: Each step verified before next
4. **Avoid compounding errors**: Don't stack unverified changes

**"So there's no compile time issue. That's my ID is saying everything is looking good. Let's see what my runtime says."**

IDE (IntelliJ) shows no red underlines—code compiles. But will it run?

---

## Step 8: The Prototype Scope Error

**"So when I run this code and if I see the output okay we got an error."**

**Error Output:**

```
Error creating bean with name 'student': 
Scope 'prototype' is not active for the current thread; 
consider defining a scoped proxy for this bean if you intend to refer to it from a singleton

Caused by: java.lang.IllegalStateException: 
No Scope registered for scope name 'prototype'
```

**"It says there is no scope stored for scope name prototype. Okay. Looks like we did a mistake while typing this prototype."**

**The Bug in Student.java:**

```java
package com.telusko.springjdbcexample.model;

import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("protoype")  // ❌ Typo! Should be "prototype"
public class Student {
    private int rollNumber;
    private String name;
    private int marks;
    
    // ... getters, setters, toString
}
```

**Can you spot it?** `"protoype"` instead of `"prototype"` (missing 't')!

**Why This Error is Confusing:**

Spring doesn't recognize `"protoype"` as a valid scope name, so it throws a runtime error. The valid scopes are:
- `"singleton"` (default)
- `"prototype"`
- `"request"` (web apps)
- `"session"` (web apps)
- `"application"` (web apps)
- `"websocket"` (websocket apps)

**"Okay. I should have saw that, uh, green line there."**

IntelliJ often shows a subtle warning (green/yellow underline) for unrecognized strings in annotations, but it's easy to miss!

**The Fix:**

```java
@Component
@Scope("prototype")  // ✅ Fixed!
public class Student {
    private int rollNumber;
    private String name;
    private int marks;
    
    // ... rest of code
}
```

**"But anyway, let's run this and let's see if this works."**

---

## Step 9: Success - Service Layer Working

**"Okay. It says it is added. That's great."**

**Console Output:**

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

... Spring startup logs ...

Added
```

**Success!** The flow works:

```
Main
  └─ service.addStudent(s)
      └─ StudentService.addStudent()
          └─ System.out.println("Added")
```

**"Let's come back here. So at least we are able to call this Add student."**

✅ **Milestone achieved**: Client can call service layer!

---

## Step 10: Creating the Repository Layer

**"But then don't you think this should be done on the next layer which is for the repository."**

Yes! The service is printing "Added", but it should delegate to the repository for actual database work.

**Current vs Target:**

**Current:**
```java
@Service
public class StudentService {
    public void addStudent(Student student) {
        System.out.println("Added");  // Service doing the work
    }
}
```

**Target:**
```java
@Service
public class StudentService {
    @Autowired
    private StudentRepo repo;
    
    public void addStudent(Student student) {
        repo.save(student);  // Delegate to repository
    }
}
```

### Creating the Repository Class

**"So what I will do is I will create another class here and I will call this class as student repo."**

**"Of course you can say repository but I love to keep things short. Looks good okay."**

**In IntelliJ:**
1. Right-click on `com.telusko.springjdbcexample` package
2. New → Java Class
3. Name: `StudentRepo`
4. Press Enter

**Naming Convention Note:**

The instructor chooses `StudentRepo` for brevity:
- `StudentRepository` (verbose but clear)
- `StudentRepo` (shorter, still understandable)

Both are fine! Choose what works for your team.

### Moving to Repository Package

**"And here I want to keep this in repo folder. You can also say Dao folder Dao package. So that's something up to you."**

**Naming Options:**
- `repository` (full name, Spring standard)
- `repo` (shorter)
- `dao` (Data Access Object, older pattern)

All mean the same thing: classes that access the database.

**"And I will move this to repo. Click on okay okay."**

1. Right-click on `StudentRepo.java`
2. Refactor → Move
3. Type: `com.telusko.springjdbcexample.repository`
4. Click OK

**"So we got this package."**

**Project Structure Now:**

```
com.telusko.springjdbcexample/
├── SpringJdbcExampleApplication.java
├── model/
│   └── Student.java
├── service/
│   └── StudentService.java
└── repository/
    └── StudentRepo.java ✅
```

**Complete Layered Structure achieved!**

---

## Step 11: Injecting Repository into Service

**"Now what I want to do is I want to have that method which is Add student. So basically first of all if I want to use the repository I have to create object of repository here."**

The service needs to call the repository, so it needs a reference to it.

### Declaring the Repository Dependency

**"So we'll say private student repo let's say repo."**

```java
package com.telusko.springjdbcexample.service;

import com.telusko.springjdbcexample.model.Student;
import com.telusko.springjdbcexample.repository.StudentRepo;
import org.springframework.stereotype.Service;

@Service
public class StudentService {
    
    private StudentRepo repo;  // Dependency declared
    
    public void addStudent(Student student) {
        System.out.println("Added");
    }
}
```

**Why not `new StudentRepo()`?**

```java
// ❌ Manual creation - not Spring-managed
private StudentRepo repo = new StudentRepo();

// ✅ Dependency injection - Spring provides it
@Autowired
private StudentRepo repo;
```

Benefits of DI:
- Repository can have its own dependencies (JdbcTemplate)
- Spring manages lifecycle
- Easy to mock for testing
- Can be configured externally

### Setting Up Autowiring

**"And then for this I need getters and setters. So I will right click here say generate get setters for this particular variable or the reference."**

**Wait!** The instructor is setting up for **setter injection**:

```java
@Service
public class StudentService {
    
    private StudentRepo repo;
    
    public StudentRepo getRepo() {
        return repo;
    }
    
    public void setRepo(StudentRepo repo) {
        this.repo = repo;
    }
    
    public void addStudent(Student student) {
        System.out.println("Added");
    }
}
```

**"And since I want this to be auto wired I can I can write here auto wired."**

```java
@Service
public class StudentService {
    
    private StudentRepo repo;
    
    public StudentRepo getRepo() {
        return repo;
    }
    
    @Autowired  // Spring will inject StudentRepo bean
    public void setRepo(StudentRepo repo) {
        this.repo = repo;
    }
    
    public void addStudent(Student student) {
        System.out.println("Added");
    }
}
```

**Injection Type Reminder** (from Document 28):

```java
// Option 1: Field Injection (simplest)
@Autowired
private StudentRepo repo;

// Option 2: Setter Injection (what instructor is using)
@Autowired
public void setRepo(StudentRepo repo) {
    this.repo = repo;
}

// Option 3: Constructor Injection (best practice)
private final StudentRepo repo;

@Autowired
public StudentService(StudentRepo repo) {
    this.repo = repo;
}
```

All three work! For this tutorial, setter injection is fine.

---

## Step 12: Adding @Repository Annotation

**"So now it will search and then uh you will find it. But then to make it work we also we also have to use a annotation."**

Just like `StudentService` needed `@Service`, `StudentRepo` needs an annotation!

**"Here we can use component. We can use service as well. But we should not be using service here."**

**Why NOT @Service?**

```java
@Service  // ❌ Wrong - this is repository layer, not service layer
public class StudentRepo { }
```

While it would technically work (since `@Service` is a `@Component`), it's **semantically wrong**:
- Confuses developers about layer responsibilities
- Violates naming conventions
- Ruins architecture clarity

**"Component we can. But then better way is to use repository okay."**

**The Right Way:**

```java
package com.telusko.springjdbcexample.repository;

import org.springframework.stereotype.Repository;

@Repository  // ✅ Correct - marks as repository layer
public class StudentRepo {
    
}
```

**Why @Repository?**

From Document 35, we learned that `@Repository`:
1. **Semantic meaning**: Clear it's data access layer
2. **Exception translation**: Converts SQLExceptions to DataAccessExceptions
3. **Architecture communication**: Standard DDD pattern
4. **Future features**: Spring might add repository-specific functionality

**"So we'll use repository here."**

---

## Step 13: Creating the save() Method

Now we need the repository method that the service will call:

**"And then from this particular thing instead of saying added here, what I want to do is I want to use my repo because repo is responsible to store data in database, I can use a method like save."**

### Choosing Method Name

**"Of course you can use any method name. But slowly we are moving towards Spring Data JPA where you will be using some methods of JPA. So save is one of the method. So we'll follow the same convention."**

**Common CRUD Method Names:**

**Spring JDBC (what we're doing now):**
```java
void save(Student student)        // Create/Update
Student findById(int id)          // Read single
List<Student> findAll()           // Read all
void update(Student student)      // Update
void delete(int id)               // Delete
```

**Spring Data JPA (coming later):**
```java
<S extends T> S save(S entity)           // Create/Update
Optional<T> findById(ID id)              // Read single
List<T> findAll()                        // Read all
void deleteById(ID id)                   // Delete
```

The instructor wisely uses JPA naming now so we don't have to relearn later!

### Updating Service to Call Repository

```java
@Service
public class StudentService {
    
    private StudentRepo repo;
    
    @Autowired
    public void setRepo(StudentRepo repo) {
        this.repo = repo;
    }
    
    public void addStudent(Student student) {
        // Remove: System.out.println("Added");
        repo.save(student);  // Delegate to repository
    }
}
```

**"So we'll use save as a method. But unfortunately we don't have a save method here."**

IntelliJ shows red underline under `repo.save(student)` because the method doesn't exist yet.

**"So you know what to do. Let's create that method."**

### Using IntelliJ Quick Fix

**"But of course you have to pass the student object which is s in this case. And I want this method in the repo. So I will click here and say create method save in repo."**

**In IntelliJ:**
1. Click on the red underlined `save`
2. Press Alt+Enter (or Cmd+Enter on Mac)
3. Select "Create method 'save' in 'StudentRepo'"
4. Press Enter

**IntelliJ generates:**

```java
@Repository
public class StudentRepo {
    
    public void save(Student student) {
        // Implementation needed
    }
}
```

**"We got the method."**

---

## Step 14: Understanding Layer Responsibilities

Before implementing `save()`, the instructor takes a moment to clarify responsibilities:

**"And now here I can say so the added part should be part here. You know service has no idea what is happening right."**

### Service Layer's Job

**"So it says okay my job is to send data or call the method of repo. I'm doing it. I don't know what is happening behind the scene, which database we are working with. I have no idea."**

```java
@Service
public class StudentService {
    
    @Autowired
    private StudentRepo repo;
    
    public void addStudent(Student student) {
        // Service doesn't know:
        // - Which database? (MySQL, PostgreSQL, H2)
        // - How data is stored? (JDBC, JPA, MongoDB)
        // - Connection details? (URL, credentials)
        
        repo.save(student);  // Just delegates!
    }
}
```

**Benefits of This Abstraction:**

1. **Flexibility**: Swap H2 for MySQL—service code unchanged
2. **Testing**: Mock repository for unit testing service
3. **Simplicity**: Service focuses on business logic, not database details
4. **Maintainability**: Database changes don't affect service

**"Do you want to do any logging with that? No. I mean service class has no. No idea what rapper is going to do."**

The service doesn't know about:
- Database logging
- Performance metrics
- Connection pooling
- Transaction management

All that is repository's concern!

**"It says hey, therefore it is your responsibility. Save it. Do whatever you want. So service job is done. Okay, but we'll use adds to it later."**

### Repository Layer's Job

```java
@Repository
public class StudentRepo {
    
    public void save(Student student) {
        // Repository knows everything about database:
        // - Connect to H2
        // - Execute INSERT SQL
        // - Handle exceptions
        // - Log database operations
        // - Manage connections
        
        System.out.println("Saved");  // Temporary
    }
}
```

**Separation of Concerns Achieved:**

```
Service Layer               Repository Layer
-------------               ----------------
Business logic              Database access
Validation rules            SQL queries
Workflow orchestration      Connection management
Domain logic                Exception handling
Multiple repo calls         CRUD operations
```

Neither layer knows about the other's implementation details!

---

## Step 15: Implementing save() - Temporary Version

For now, we'll just print to verify the flow works:

```java
@Repository
public class StudentRepo {
    
    public void save(Student student) {
        System.out.println("Saved");  // Temporary - real JDBC coming next video
    }
}
```

**Complete Code at This Point:**

**StudentRepo.java:**
```java
package com.telusko.springjdbcexample.repository;

import com.telusko.springjdbcexample.model.Student;
import org.springframework.stereotype.Repository;

@Repository
public class StudentRepo {
    
    public void save(Student student) {
        System.out.println("Saved");
    }
}
```

**StudentService.java:**
```java
package com.telusko.springjdbcexample.service;

import com.telusko.springjdbcexample.model.Student;
import com.telusko.springjdbcexample.repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudentService {
    
    private StudentRepo repo;
    
    @Autowired
    public void setRepo(StudentRepo repo) {
        this.repo = repo;
    }
    
    public void addStudent(Student student) {
        repo.save(student);
    }
}
```

**SpringJdbcExampleApplication.java:**
```java
@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringJdbcExampleApplication.class, args);
        
        Student s = context.getBean(Student.class);
        s.setRollNumber(101);
        s.setName("Naveen");
        s.setMarks(78);
        
        StudentService service = context.getBean(StudentService.class);
        service.addStudent(s);
    }
}
```

**Run it!**

**Console Output:**
```
... Spring startup logs ...
Saved
```

✅ **Success!** The complete flow works:

```
Main
  └─ service.addStudent(s)
      └─ StudentService.addStudent()
          └─ repo.save(student)
              └─ StudentRepo.save()
                  └─ System.out.println("Saved")
```

---

## Step 16: Adding getStudents() - Retrieving Data

Now let's add functionality to retrieve students:

**"What I also want is I want to get one more method here. Let's I want to print all the students here."**

### Adding getStudents() in Main

```java
@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringJdbcExampleApplication.class, args);
        
        Student s = context.getBean(Student.class);
        s.setRollNumber(101);
        s.setName("Naveen");
        s.setMarks(78);
        
        StudentService service = context.getBean(StudentService.class);
        service.addStudent(s);
        
        // Retrieve all students
        List<Student> students = service.getStudents();
        System.out.println(students);
    }
}
```

**"So I will say list of students. I will say students equal to. And then I want my service class to get me all the students."**

Need to add import:
```java
import java.util.List;
```

**"So if I say get students, it should return all the students. And then I want to print students."**

**"So basically after adding the value, I want to fetch all the data from database and print it here."**

**The Flow:**
1. Add student to database
2. Retrieve all students from database
3. Print them to verify the data was saved

---

## Step 17: Creating getStudents() in Service

**"But again in the service we don't have this method. So let's create this method."**

**Using IntelliJ Quick Fix:**
1. Click on red underlined `getStudents()`
2. Alt+Enter / Cmd+Enter
3. "Create method 'getStudents' in 'StudentService'"

**"So you can see we have a method here which says a get student so public which returns a list of student get student."**

```java
@Service
public class StudentService {
    
    private StudentRepo repo;
    
    @Autowired
    public void setRepo(StudentRepo repo) {
        this.repo = repo;
    }
    
    public void addStudent(Student student) {
        repo.save(student);
    }
    
    public List<Student> getStudents() {
        // Implementation coming
        return null;
    }
}
```

**"And here I can say hey Depot. Again I will ask from the repo. In fact I will say return repo dot."**

### Naming the Repository Method

**"So we can use certain methods in repo. We can also say get student. But then the better way is to use find all."**

**Why `findAll()` instead of `getStudents()`?**

**"Again, I'm trying to use the methods of JPA so that when you go towards JPA, you will find the same method name. So it will make much more sense, right?"**

**Spring Data JPA Standard Methods:**
- `findAll()` - Get all entities
- `findById(ID id)` - Get one by ID
- `findByName(String name)` - Get by specific field (auto-generated)
- `save(T entity)` - Save entity
- `deleteById(ID id)` - Delete entity

**"Why? To remember multiple method names when you can have limitation right."**

Better to learn one set of method names that work everywhere!

**Updated Service:**

```java
@Service
public class StudentService {
    
    @Autowired
    private StudentRepo repo;
    
    public void addStudent(Student student) {
        repo.save(student);
    }
    
    public List<Student> getStudents() {
        return repo.findAll();  // Delegate to repository
    }
}
```

---

## Step 18: Creating findAll() in Repository

**"So we'll do that. So you can see we are saying find all now. Now in this repo we don't have find all. So let's create one."**

**Using IntelliJ Quick Fix:**
1. Click on red `findAll()`
2. Alt+Enter
3. "Create method 'findAll' in 'StudentRepo'"

**"So you can see we got a find all method."**

```java
@Repository
public class StudentRepo {
    
    public void save(Student student) {
        System.out.println("Saved");
    }
    
    public List<Student> findAll() {
        // Will query database here
        return null;
    }
}
```

---

## Step 19: Returning Dummy Data for Testing

**"Now at this point I'm not connecting with a database right. We are not doing anything to fetch data."**

We haven't implemented JdbcTemplate yet, so we can't actually query the database. But we can test the flow!

**"So I will return some dummy data to see if these things are working out."**

```java
@Repository
public class StudentRepo {
    
    public void save(Student student) {
        System.out.println("Saved");
    }
    
    public List<Student> findAll() {
        // Create dummy data for testing
        List<Student> students = new ArrayList<>();
        return students;
    }
}
```

Need import:
```java
import java.util.ArrayList;
import java.util.List;
```

**"So I will create a list of students as a student equal to new ArrayList. And let's return the students. Of course it will be empty, but at least I want to complete the flow here and that's what we are doing."**

**Why Return Empty List?**

This verifies:
1. Method is called successfully
2. Service → Repository connection works
3. Data flows back to main
4. No errors in the chain

Once this works, we can add real database queries!

---

## Step 20: Testing the Complete Flow

**"Let's rerun this. So first of all we are adding and then we are returning. So it should say added and it will return a empty array. Or at least that's what we got."**

**Complete Main Method:**

```java
@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringJdbcExampleApplication.class, args);
        
        Student s = context.getBean(Student.class);
        s.setRollNumber(101);
        s.setName("Naveen");
        s.setMarks(78);
        
        StudentService service = context.getBean(StudentService.class);
        service.addStudent(s);  // Save student
        
        List<Student> students = service.getStudents();  // Retrieve students
        System.out.println(students);  // Print
    }
}
```

**Console Output:**

```
... Spring startup logs ...
Saved
[]
```

**Output Breakdown:**
1. `Saved` - From `StudentRepo.save()`, confirms save was called
2. `[]` - Empty list from `StudentRepo.findAll()`, confirms retrieval works

**"So things are working out."**

✅ **Complete flow verified:**

```
Main
  ├─ addStudent(s)
  │   └─ Service → Repository → "Saved"
  │
  └─ getStudents()
      └─ Service → Repository → []
          └─ Main prints: []
```

**All layers communicating successfully!**

---

## Step 21: What We've Accomplished

**"So in this video we created two layers service and repo. And things are working out."**

**Created Components:**

1. ✅ **StudentService** (service layer)
   - `@Service` annotation
   - `addStudent()` method
   - `getStudents()` method
   - Dependency on StudentRepo

2. ✅ **StudentRepo** (repository layer)
   - `@Repository` annotation
   - `save()` method
   - `findAll()` method
   - Ready for database code

3. ✅ **Dependency Injection**
   - Service → Repository wiring
   - `@Autowired` setter injection
   - Spring manages everything

4. ✅ **Layered Architecture**
   - Proper package organization
   - Clear separation of concerns
   - Service delegates to repository

**"But not exactly the way we wanted. We want to get this data from database."**

Right now:
- `save()` just prints "Saved" (doesn't actually save to database)
- `findAll()` returns empty list (doesn't query database)

We need to connect to the actual H2 database!

---

## Step 22: Preview - JdbcTemplate Coming Next

**"And you will say do we have database. Of course we have H2 available. Right."**

Yes! Remember from Document 37, we added the H2 dependency:

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

**"So H2 will have a default database available for us."**

Spring Boot auto-configures H2 when it's on the classpath:
- Creates in-memory database: `jdbc:h2:mem:testdb`
- Starts H2 console at: `http://localhost:8080/h2-console`
- Provides DataSource bean automatically
- Sets up connection pooling with HikariCP

**"It's time to work with the database. Let's actually store this data in database and fetch this from database."**

**What's Coming:**

1. **JdbcTemplate**: Spring's class for executing SQL queries
2. **SQL Queries**: Write INSERT, SELECT statements
3. **RowMapper**: Convert ResultSet to Student objects
4. **Database Table**: Create STUDENT table
5. **Real Data**: Actually save and retrieve from H2

**"And to achieve that we have to use something called a JDBC template."**

From Document 36, we learned that `JdbcTemplate`:
- Eliminates JDBC boilerplate
- Handles connections automatically
- Manages resources (opens/closes)
- Translates exceptions
- Provides simple API

**Real Implementation Preview:**

```java
@Repository
public class StudentRepo {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public void save(Student student) {
        String sql = "INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, 
            student.getRollNumber(), 
            student.getName(), 
            student.getMarks());
        System.out.println("Saved");
    }
    
    public List<Student> findAll() {
        String sql = "SELECT * FROM student";
        return jdbcTemplate.query(sql, new StudentRowMapper());
    }
}
```

**50+ lines of JDBC code → 5 lines with JdbcTemplate!**

**"How do we do that. Let's see in the next video."**

---

## Key Concepts Summary

### 1. Service Layer (@Service)
**Purpose**: Business logic layer between client and repository.

**Responsibilities:**
- Business validation
- Workflow orchestration
- Multiple repository coordination
- Business rule enforcement

**Example:**
```java
@Service
public class StudentService {
    @Autowired
    private StudentRepo repo;
    
    public void addStudent(Student student) {
        // Validation
        if (student.getMarks() < 0 || student.getMarks() > 100) {
            throw new IllegalArgumentException("Invalid marks");
        }
        // Delegate
        repo.save(student);
    }
}
```

### 2. Repository Layer (@Repository)
**Purpose**: Database access layer.

**Responsibilities:**
- SQL queries
- Database connections
- CRUD operations
- Data mapping

**Example:**
```java
@Repository
public class StudentRepo {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public void save(Student student) {
        String sql = "INSERT INTO student VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, student.getRollNumber(), 
                           student.getName(), student.getMarks());
    }
}
```

### 3. Dependency Injection
**Concept**: Service needs repository, Spring injects it.

**Types:**
```java
// Field injection
@Autowired
private StudentRepo repo;

// Setter injection
@Autowired
public void setRepo(StudentRepo repo) { }

// Constructor injection (best)
@Autowired
public StudentService(StudentRepo repo) { }
```

### 4. Separation of Concerns
**Principle**: Each layer has ONE responsibility.

**Benefits:**
- Easy testing (mock dependencies)
- Flexible (swap implementations)
- Maintainable (changes isolated)
- Clear (each class has clear purpose)

### 5. Incremental Testing
**Practice**: Test after each change.

**Benefits:**
- Early error detection
- Smaller debugging scope
- Confidence building
- Avoid error compounding

### 6. Method Naming Conventions
**JPA-style names** (for consistency with Spring Data JPA):
- `save()` - Create/update
- `findAll()` - Get all
- `findById()` - Get one
- `deleteById()` - Delete

**Benefit**: One naming convention across JDBC and JPA.

---

## Complete Code Snapshot

**Project Structure:**
```
com.telusko.springjdbcexample/
├── SpringJdbcExampleApplication.java
├── model/
│   └── Student.java
├── service/
│   └── StudentService.java
└── repository/
    └── StudentRepo.java
```

**Student.java:**
```java
package com.telusko.springjdbcexample.model;

import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype")
public class Student {
    private int rollNumber;
    private String name;
    private int marks;
    
    // Getters, setters, toString
}
```

**StudentService.java:**
```java
package com.telusko.springjdbcexample.service;

import com.telusko.springjdbcexample.model.Student;
import com.telusko.springjdbcexample.repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentService {
    
    private StudentRepo repo;
    
    @Autowired
    public void setRepo(StudentRepo repo) {
        this.repo = repo;
    }
    
    public void addStudent(Student student) {
        repo.save(student);
    }
    
    public List<Student> getStudents() {
        return repo.findAll();
    }
}
```

**StudentRepo.java:**
```java
package com.telusko.springjdbcexample.repository;

import com.telusko.springjdbcexample.model.Student;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;

@Repository
public class StudentRepo {
    
    public void save(Student student) {
        // JdbcTemplate code coming next video
        System.out.println("Saved");
    }
    
    public List<Student> findAll() {
        // JdbcTemplate code coming next video
        return new ArrayList<>();
    }
}
```

**SpringJdbcExampleApplication.java:**
```java
package com.telusko.springjdbcexample;

import com.telusko.springjdbcexample.model.Student;
import com.telusko.springjdbcexample.service.StudentService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import java.util.List;

@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringJdbcExampleApplication.class, args);
        
        Student s = context.getBean(Student.class);
        s.setRollNumber(101);
        s.setName("Naveen");
        s.setMarks(78);
        
        StudentService service = context.getBean(StudentService.class);
        service.addStudent(s);
        
        List<Student> students = service.getStudents();
        System.out.println(students);
    }
}
```

---

## What's Next

In the next video (Document 39), we'll:

1. **Inject JdbcTemplate** into StudentRepo
2. **Create Database Table** (STUDENT table with schema)
3. **Implement save()** with real INSERT query
4. **Implement findAll()** with real SELECT query
5. **Create RowMapper** to convert ResultSet → Student
6. **Test with H2 Console** to verify data persisted

**The Goal**: Replace dummy implementations with real database operations!

---

## Conclusion: Architecture Complete, Database Next

We've built a complete three-layer architecture:

✅ **Model Layer**: Student entity with proper scope
✅ **Service Layer**: Business logic with addStudent() and getStudents()
✅ **Repository Layer**: Database access methods ready for JDBC
✅ **Dependency Injection**: Layers properly wired together
✅ **Package Organization**: Clean separation by layer
✅ **Flow Verified**: Main → Service → Repository all working

**Current State:**
- Layers communicate correctly
- Annotations properly configured
- Dependency injection working
- Methods return dummy data

**Next State:**
- Connect to H2 database
- Execute real SQL queries
- Store and retrieve actual data
- Verify persistence survives method calls

The architecture is solid. Now we add the database power with JdbcTemplate! 🚀
