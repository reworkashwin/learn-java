# 🏗️ Creating Service Layer with @Service Annotation

## Introduction

**From Document 33, we learned:**
- Applications have multiple layers
- Controller handles requests
- Service handles business logic
- Repository handles database access
- Clear separation of concerns

**Today we implement it!** 🎯

**The instructor begins:**

> "So let's create those layers. The layers which we talked about: service and repository."

**The plan:**
1. Organize code into proper packages
2. Create model package for entities
3. Create LaptopService with @Service
4. Understand @Service vs @Component
5. Add business logic methods
6. Preview repository layer

**In this lesson, you'll learn:**
- Why package organization matters
- Creating model package for entities (Alien, Laptop, Desktop)
- Moving classes to appropriate packages
- Creating service package for business logic
- Implementing LaptopService class
- Using @Service stereotype annotation
- Why @Service is better than @Component for services
- Understanding that @Service IS @Component (under the hood)
- Adding business logic methods to service
- Examples: isGoodForProgramming(), addLaptop()
- Testing service layer independently
- Why database code doesn't belong in service
- Separation between processing (service) and data access (repository)
- Setting up for repository layer creation
- Best practices for package structure

Let's build real application architecture! 🏗️

---

## Concept 1: Package Organization

### 🧠 Why packages matter?

**The instructor emphasizes:**

> "In fact, the first thing is we have to make sure that you use different packages for different things."

**Current structure (messy):**
```
com.telusko.springbootdemo/
├── SpringBootDemoApplication.java
├── Alien.java
├── Laptop.java
├── Desktop.java
├── Computer.java
└── LaptopService.java  (about to create)
```

**All classes in one package!** 😰

**Problems:**
- Hard to find classes
- Purpose unclear
- Scales poorly
- No organization

**Better structure (organized):**
```
com.telusko.springbootdemo/
├── SpringBootDemoApplication.java
├── model/
│   ├── Alien.java
│   ├── Laptop.java
│   ├── Desktop.java
│   └── Computer.java
├── service/
│   └── LaptopService.java
└── repository/
    └── LaptopRepository.java
```

**Clear organization by purpose!** ✨

### 🧠 The model package concept

**The instructor introduces:**

> "What we have not discussed in these layers is we have one more object which we pass between different layers. Right? And that object, you can say model at this point. So example: Alien, Laptop, Desktop - they actually represent some model, the actual entity which you're going to store in database."

**Model/Entity classes:**
- Represent real-world objects
- Data holders
- Will be stored in database
- POJOs (Plain Old Java Objects)

**Examples:**
- Laptop (product entity)
- User (user entity)
- Order (order entity)
- Product (product entity)

**The instructor decides:**

> "So it's better to save that in a model package. So all these things will be part of a model package."

---

## Concept 2: Creating Model Package

### ⚙️ Create the package

**The instructor creates:**

> "So in fact I will just create a new package. And let me just name this as model package."

**Creating model package:**
```
com.telusko.springbootdemo.model/
```

**The instructor adds:**

> "And again you will get more idea once we talk about the MVC. So everything goes into model package."

**MVC = Model-View-Controller (coming later)**

### ⚙️ Move entities to model package

**Move these classes:**
```
Alien.java → com.telusko.springbootdemo.model.Alien
Laptop.java → com.telusko.springbootdemo.model.Laptop
Desktop.java → com.telusko.springbootdemo.model.Desktop
Computer.java → com.telusko.springbootdemo.model.Computer
```

**Updated structure:**
```
com.telusko.springbootdemo/
├── SpringBootDemoApplication.java
└── model/
    ├── Alien.java
    ├── Laptop.java
    ├── Desktop.java
    └── Computer.java
```

**Clean separation!** ✅

---

## Concept 3: Simplifying the Example

### 🧠 Focusing on Laptop

**The instructor decides:**

> "Let me do one more thing here. So let's say we don't have the Alien. Let's ignore Alien for some time and let's focus on Laptop."

**Why simplify?**
- Focus on service layer concept
- Avoid complexity
- Clear demonstration
- Easier to understand

**Focus:**
```java
Laptop lap = ...;
// Work with laptop only
```

**Alien, Desktop temporarily ignored!**

### ⚙️ Getting Laptop bean

**SpringBootDemoApplication.java:**
```java
package com.telusko.springbootdemo;

import com.telusko.springbootdemo.model.Laptop;  // Import from model!
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class SpringBootDemoApplication {

    public static void main(String[] args) {
        ApplicationContext context = 
            SpringApplication.run(SpringBootDemoApplication.class, args);
        
        Laptop lap = context.getBean(Laptop.class);
        
        // Use laptop...
    }
}
```

**The instructor codes:**

> "So we have to import the package now because they are not in the same package. So it's Laptop lap equal to new Laptop. Oh, we should not do that right. I will be saying context.getBean()."

**Import needed because Laptop moved to model package!**

### 💡 Prototype scope consideration

**The instructor mentions:**

> "And since I will be creating multiple objects of laptop, it makes sense to make this prototype. But at this point I'm going to use only one for this example. But normally we should be creating this as a prototype scope."

**When to use prototype:**
```java
@Component
@Scope("prototype")
public class Laptop {
    // New instance each time
}
```

**For this demo: singleton (default) is fine!**

---

## Concept 4: Creating Service Package

### 🧠 Why service package?

**The instructor explains:**

> "Next we have to create a layer for service. So let's say, why do we need service here?"

**Service layer handles:**
- Business logic
- Data processing
- Validation
- Calculations
- Orchestration

**Creating service package:**
```
com.telusko.springbootdemo.service/
```

**The instructor emphasizes:**

> "I have to make sure that you keep your classes in the right package. It will not give you error, but if you have your classes in separate packages, it will be easier for you to manage them and find them."

**Package organization = code maintainability!**

---

## Concept 5: Using the Service

### ⚙️ Calling service from main

**The instructor codes the usage first:**

> "And then I want to save this laptop. So of course we don't have data yet. And in laptop we don't even have data. But let's say we have some data I want to store them. So what we can do is we can simply use a method. We can use a class called service class."

**SpringBootDemoApplication.java:**
```java
@SpringBootApplication
public class SpringBootDemoApplication {

    public static void main(String[] args) {
        ApplicationContext context = 
            SpringApplication.run(SpringBootDemoApplication.class, args);
        
        Laptop lap = context.getBean(Laptop.class);
        
        // Get service bean
        LaptopService service = context.getBean(LaptopService.class);
        
        // Use service to save laptop
        service.addLaptop(lap);
    }
}
```

**The instructor explains:**

> "So I can say service.addLaptop and I can pass this laptop or lap object. Now basically the job of service here is to do any processing with the laptop."

**Service processes and saves data!**

### 🧠 Service capabilities

**The instructor gives examples:**

> "Of course you can find, is this laptop good for programming or is this laptop good for gaming? So you can have those type of methods in the service class."

**Example service methods:**
```java
service.addLaptop(lap);
service.isGoodForProgramming(lap);
service.isGoodForGaming(lap);
service.calculateRating(lap);
service.findBestLaptop();
```

**Business logic methods!**

---

## Concept 6: Creating LaptopService Class

### ⚙️ IDE assistance

**The instructor uses IDE:**

> "But at this point I don't have that class. So I can just create that class here. So I can say laptop service class. Service equals context.getBean LaptopService.class. But unfortunately we don't have this class. So let's create one."

**IDE helps create class:**

> "So I can just click here and say hey IDE, I want to get a laptop class, laptop service class, and this should be a part of a service package."

**Creating:**
```
com.telusko.springbootdemo.service.LaptopService
```

### ⚙️ Initial LaptopService

**LaptopService.java (first version):**
```java
package com.telusko.springbootdemo.service;

import com.telusko.springbootdemo.model.Laptop;

public class LaptopService {
    
    public void addLaptop(Laptop lap) {
        System.out.println("Method called");
    }
}
```

**Basic structure created!**

**The instructor confirms:**

> "And now you can see there's no problem."

---

## Concept 7: Adding Business Logic Methods

### ⚙️ Method examples

**The instructor adds:**

> "The only problem is we don't have this particular method. So we can say addLaptop. As I mentioned before, we can return a boolean: isGoodForProgramming."

**LaptopService.java (with methods):**
```java
package com.telusko.springbootdemo.service;

import com.telusko.springbootdemo.model.Laptop;

public class LaptopService {
    
    public void addLaptop(Laptop lap) {
        System.out.println("Method called");
        // Will add database logic later
    }
    
    public boolean isGoodForProgramming(Laptop lap) {
        // Business logic to determine if laptop is good for programming
        // Check RAM, processor, etc.
        return true;  // Placeholder for now
    }
}
```

**The instructor explains:**

> "So maybe we can create some methods like this. So pass a laptop object and we can return whatever the configuration is. So based on the configuration you can return if it is good or bad."

### 💡 Real business logic example

**What isGoodForProgramming() could actually do:**

```java
public boolean isGoodForProgramming(Laptop lap) {
    // Business logic
    if (lap.getRam() >= 16 && lap.getProcessor().contains("i7")) {
        return true;
    }
    return false;
}
```

**Or more complex:**

```java
public boolean isGoodForGaming(Laptop lap) {
    // Check multiple factors
    boolean hasGoodGPU = lap.getGpu().contains("RTX") || lap.getGpu().contains("Radeon");
    boolean hasEnoughRAM = lap.getRam() >= 16;
    boolean hasGoodProcessor = lap.getProcessor().contains("i7") || 
                               lap.getProcessor().contains("Ryzen");
    
    return hasGoodGPU && hasEnoughRAM && hasGoodProcessor;
}

public int calculateRating(Laptop lap) {
    int rating = 0;
    
    // Calculate based on specs
    if (lap.getRam() >= 8) rating++;
    if (lap.getRam() >= 16) rating++;
    if (lap.getRam() >= 32) rating++;
    
    if (lap.getProcessor().contains("i7")) rating += 2;
    if (lap.getProcessor().contains("i9")) rating += 3;
    
    if (lap.hasSSd()) rating += 2;
    
    return rating;
}
```

**Service contains business rules!**

---

## Concept 8: Using @Service Annotation

### 🧠 The problem

**Current LaptopService:**
```java
public class LaptopService {
    public void addLaptop(Laptop lap) { ... }
}
```

**Main class tries:**
```java
LaptopService service = context.getBean(LaptopService.class);
```

**Error:** NoSuchBeanDefinitionException

**Why?** Spring doesn't know about LaptopService!

**The instructor asks:**

> "But this is your service class right now. If you want to get this object, which annotation we are going to use here? Because what we are doing in this is we are saying context.getBean LaptopService. This will not work if you don't have @Component on top of it."

**Need to mark it as Spring-managed bean!**

### 🧠 Introducing @Service

**The instructor reveals:**

> "But as I mentioned before, @Component is not the only option. If you want to work with service class, we can also use @Service stereotype."

**@Service annotation!**

**LaptopService.java (with @Service):**
```java
package com.telusko.springbootdemo.service;

import com.telusko.springbootdemo.model.Laptop;
import org.springframework.stereotype.Service;

@Service  // Marks this as a service layer bean!
public class LaptopService {
    
    public void addLaptop(Laptop lap) {
        System.out.println("Method called");
    }
    
    public boolean isGoodForProgramming(Laptop lap) {
        return true;
    }
}
```

**Now Spring can manage it!** ✅

---

## Concept 9: @Service vs @Component

### 🧠 What's the difference?

**The instructor explains:**

> "Now @Service and @Component does the same thing. They both say it becomes a managed bean."

**Both create Spring-managed beans!**

**The instructor proves it:**

> "Because if you click on @Service you can see Service itself is annotated with @Component."

**@Service source code:**
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component  // ← @Service IS @Component!
public @interface Service {
    @AliasFor(annotation = Component.class)
    String value() default "";
}
```

**@Service = @Component + semantic meaning!**

### 🧠 Why use @Service then?

**The instructor explains the reasons:**

> "It's just that if you want to create some documentation or if you are writing some domain specific language or application, it makes sense to use @Service on top of it. It also helps you to understand what type of class you're working with."

**Benefits of @Service:**

**1. Semantic clarity**
```java
@Service
public class UserService { }  // "This is a service layer class"

@Component
public class UserService { }  // "This is... some component?"
```

**Intent clear from annotation!**

**2. Documentation value**
```java
// Looking at class list:
@Service - OrderService      // Ah, business logic!
@Service - PaymentService    // Ah, business logic!
@Repository - OrderRepository // Ah, data access!
@Controller - OrderController // Ah, web layer!
```

**Architecture visible!**

**3. Future framework features**
```java
// Framework could add service-specific behavior
@Service  // Maybe transaction management
@Service  // Maybe caching
@Service  // Maybe metrics
```

**Room for specialization!**

### 🧠 They behave the same

**The instructor clarifies:**

> "When you have @Service on top of it, you can understand that this is a service class. Again, even if you write @Component, you will not get the error. It will work. But using @Service makes much more sense."

**Both work identically:**
```java
@Component
public class LaptopService { }  // ✅ Works

@Service
public class LaptopService { }  // ✅ Works (better practice)
```

**The instructor emphasizes:**

> "But the kind of application which we are building, everything is same. There is no difference between @Component and @Service. So for different purposes you can differentiate between component and service. At this point they both are same, will behave the same way."

**Technical behavior: identical!**
**Semantic meaning: different!**

---

## Concept 10: Testing the Service

### 🧪 Run the application

**Complete code:**

**LaptopService.java:**
```java
package com.telusko.springbootdemo.service;

import com.telusko.springbootdemo.model.Laptop;
import org.springframework.stereotype.Service;

@Service
public class LaptopService {
    
    public void addLaptop(Laptop lap) {
        System.out.println("Method called");
    }
    
    public boolean isGoodForProgramming(Laptop lap) {
        return true;
    }
}
```

**SpringBootDemoApplication.java:**
```java
@SpringBootApplication
public class SpringBootDemoApplication {

    public static void main(String[] args) {
        ApplicationContext context = 
            SpringApplication.run(SpringBootDemoApplication.class, args);
        
        Laptop lap = context.getBean(Laptop.class);
        
        LaptopService service = context.getBean(LaptopService.class);
        service.addLaptop(lap);
    }
}
```

**Run it...**

**Output:**
```
Method called
```

**The instructor confirms:**

> "Let's run this and okay it says method call. So service is working."

**Service layer working!** ✅

---

## Concept 11: Database Access Consideration

### 🧠 Where to store data?

**The instructor poses the question:**

> "Apart from this, what if you want to store this data in database? You want to store this lap in database. In this case where you will write your database steps?"

**Current addLaptop method:**
```java
public void addLaptop(Laptop lap) {
    System.out.println("Method called");
    // Where to add database code?
}
```

**Need to save to database!**

### 🧠 JDBC reminder

**The instructor recalls:**

> "Of course when you say database steps, remember when we talked about JDBC. So if you want to connect your Java application with database we need JDBC in between which is Java Database Connectivity."

**JDBC = Java Database Connectivity**

**JDBC code example:**
```java
// Traditional JDBC
Connection conn = DriverManager.getConnection(url, username, password);
PreparedStatement stmt = conn.prepareStatement(
    "INSERT INTO laptops (name, price) VALUES (?, ?)");
stmt.setString(1, lap.getName());
stmt.setDouble(2, lap.getPrice());
stmt.executeUpdate();
```

**Where should this code go?**

### 🧠 Can we put it in service?

**The instructor asks:**

> "Where you will write your JDBC steps inside service class? You can of course there is no harm. I mean there is a harm, but there is no error when you do that."

**Technically possible:**
```java
@Service
public class LaptopService {
    
    public void addLaptop(Laptop lap) {
        // BAD: Database code in service!
        try {
            Connection conn = DriverManager.getConnection(...);
            PreparedStatement stmt = conn.prepareStatement(...);
            stmt.setString(1, lap.getName());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

**No compile error, but BAD practice!** ❌

### 🧠 Why not in service?

**Problems with database code in service:**

**1. Mixing concerns**
- Service = business logic
- Database = data access
- Different responsibilities!

**2. Hard to test**
```java
// Can't test business logic without database
@Test
public void testBusinessLogic() {
    // Needs real database connection!
}
```

**3. Hard to change database**
```java
// Switch from MySQL to MongoDB?
// Change every service method!
```

**4. Code duplication**
```java
// Same connection code everywhere
public void addLaptop() {
    Connection conn = ...  // Duplicate
}

public void updateLaptop() {
    Connection conn = ...  // Duplicate
}

public void deleteLaptop() {
    Connection conn = ...  // Duplicate
}
```

### 🧠 The better approach

**The instructor explains:**

> "But it's not a good practice. Where you should write your JDBC code is a separate class called repository class, where you will have all the database connections. The only job of that class is to work with database."

**Separation:**
```
Service → Repository → Database
```

**The instructor clarifies roles:**

> "The job of service is to process the data or do some processing on some objects and something, but not connecting with database."

**Clear division:**
- **Service**: Process data (business logic)
- **Repository**: Connect to database (data access)

---

## Concept 12: Preview of Repository Layer

### 🧠 What's coming next?

**The instructor teases:**

> "So what you will do it, we'll do that in the next video and that too in different class."

**Next steps:**
1. Create LaptopRepository class
2. Use @Repository annotation
3. Add JDBC code there
4. Service calls repository
5. Clean separation

**Preview:**

**LaptopRepository.java (coming next):**
```java
@Repository
public class LaptopRepository {
    
    public void save(Laptop lap) {
        // JDBC code here
        // Connect to database
        // Execute INSERT
    }
    
    public Laptop findById(int id) {
        // JDBC code here
        // Execute SELECT
    }
}
```

**LaptopService.java (will be updated):**
```java
@Service
public class LaptopService {
    
    @Autowired
    private LaptopRepository repository;
    
    public void addLaptop(Laptop lap) {
        // Business logic
        if (lap.getPrice() < 0) {
            throw new IllegalArgumentException("Price can't be negative");
        }
        
        // Call repository to save
        repository.save(lap);
    }
}
```

**Complete layer separation!** 🎯

---

## ✅ Key Takeaways

### About Package Organization

1. **Separate packages for each layer**
   ```
   model/      - Entities (Laptop, Alien)
   service/    - Business logic (LaptopService)
   repository/ - Data access (LaptopRepository)
   ```

2. **Model package for entities**
   - Classes that represent data
   - Will be stored in database
   - POJOs (Plain Old Java Objects)

3. **Benefits of organization**
   - Easy to find classes
   - Clear purpose
   - Scales better
   - Professional structure

### About @Service Annotation

1. **@Service creates managed bean**
   ```java
   @Service
   public class LaptopService { }
   ```

2. **@Service IS @Component**
   - Same functionality underneath
   - @Service annotated with @Component
   - Technical behavior identical

3. **Why use @Service over @Component**
   - Semantic clarity (this is a service)
   - Self-documenting code
   - Architecture visible
   - Best practice for service layer

### About Service Layer

1. **Service handles business logic**
   - Calculations
   - Validation
   - Processing
   - Workflow orchestration

2. **Service does NOT handle database**
   - No JDBC code here
   - No SQL here
   - Delegate to repository

3. **Service methods reflect business operations**
   ```java
   addLaptop()
   isGoodForProgramming()
   isGoodForGaming()
   calculateRating()
   ```

### About Separation of Concerns

1. **Each layer has one responsibility**
   - Service: business logic
   - Repository: data access
   - Clear boundaries

2. **Don't mix concerns**
   - ❌ Database code in service
   - ✅ Repository handles database
   - ✅ Service calls repository

3. **Benefits**
   - Easy to test
   - Easy to maintain
   - Easy to change
   - Professional code

---

## 💡 Final Insights

### The Complete Service Example

**What a real service looks like:**

```java
package com.telusko.springbootdemo.service;

import com.telusko.springbootdemo.model.Laptop;
import com.telusko.springbootdemo.repository.LaptopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LaptopService {
    
    @Autowired
    private LaptopRepository repository;
    
    // Save laptop with validation
    public void addLaptop(Laptop lap) {
        // Business logic: validation
        if (lap.getName() == null || lap.getName().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }
        
        if (lap.getPrice() < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        
        // Delegate to repository
        repository.save(lap);
    }
    
    // Business logic: determine if good for programming
    public boolean isGoodForProgramming(Laptop lap) {
        return lap.getRam() >= 16 && 
               lap.getProcessor().contains("i7") &&
               lap.hasSSD();
    }
    
    // Business logic: determine if good for gaming
    public boolean isGoodForGaming(Laptop lap) {
        return lap.getRam() >= 16 &&
               (lap.getGpu().contains("RTX") || lap.getGpu().contains("Radeon")) &&
               lap.getProcessor().contains("i7");
    }
    
    // Business logic: calculate rating
    public int calculateRating(Laptop lap) {
        int rating = 0;
        
        if (lap.getRam() >= 8) rating += 1;
        if (lap.getRam() >= 16) rating += 2;
        if (lap.getRam() >= 32) rating += 3;
        
        if (lap.getProcessor().contains("i5")) rating += 1;
        if (lap.getProcessor().contains("i7")) rating += 2;
        if (lap.getProcessor().contains("i9")) rating += 3;
        
        if (lap.hasSSD()) rating += 2;
        
        return rating;
    }
    
    // Business logic: find best laptop within budget
    public Laptop findBestLaptopInBudget(double maxPrice) {
        // Get all laptops from repository
        List<Laptop> laptops = repository.findByPriceLessThan(maxPrice);
        
        // Process: find best one
        return laptops.stream()
            .filter(l -> l.getRam() >= 8)
            .max((l1, l2) -> Integer.compare(
                calculateRating(l1), 
                calculateRating(l2)))
            .orElse(null);
    }
}
```

**All business logic in service!**
**No database code!**
**Clean and focused!**

---

### Project Structure Evolution

**Before (messy):**
```
springbootdemo/
├── SpringBootDemoApplication.java
├── Alien.java
├── Laptop.java
├── Desktop.java
└── Computer.java
```

**After (organized):**
```
springbootdemo/
├── SpringBootDemoApplication.java
├── model/
│   ├── Alien.java
│   ├── Laptop.java
│   ├── Desktop.java
│   └── Computer.java
├── service/
│   └── LaptopService.java
└── repository/
    └── LaptopRepository.java  (coming next)
```

**Professional structure!** ✨

---

### Why This Matters

**Small app (10 classes):**
```
✓ One package is okay
✓ Can find everything
✓ Not too messy
```

**Medium app (100 classes):**
```
✗ One package is chaos
✓ Organized packages help
✓ Can navigate easily
```

**Large app (1000+ classes):**
```
✗ One package impossible
✓ Package organization essential
✓ Multiple developers productive
✓ Easy to maintain
```

**Good habits now = success later!**

---

### The Stereotype Annotation Family

**All stereotype annotations:**

```java
@Component  // Generic component
public class SomeClass { }

@Service    // Service layer (business logic)
public class UserService { }

@Repository // Repository layer (data access)
public class UserRepository { }

@Controller // Web layer (MVC controller)
public class UserController { }

@RestController // REST API controller
public class UserRestController { }
```

**All create Spring-managed beans!**
**Each has semantic meaning!**

**Hierarchy:**
```
@Component
    ├── @Service
    ├── @Repository
    └── @Controller
            └── @RestController
```

**All are @Component with specialized purpose!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Database code in service

**Wrong:**
```java
@Service
public class LaptopService {
    public void addLaptop(Laptop lap) {
        // BAD: JDBC in service!
        Connection conn = DriverManager.getConnection(...);
        // ...
    }
}
```

**Correct:**
```java
@Service
public class LaptopService {
    @Autowired
    private LaptopRepository repository;
    
    public void addLaptop(Laptop lap) {
        // Business logic only
        validateLaptop(lap);
        repository.save(lap);  // Delegate to repository
    }
}
```

### Mistake 2: No package organization

**Wrong:**
```
com.company.app/
├── App.java
├── User.java
├── UserService.java
├── UserRepository.java
├── Product.java
├── ProductService.java
└── ProductRepository.java
```

**Correct:**
```
com.company.app/
├── App.java
├── model/
│   ├── User.java
│   └── Product.java
├── service/
│   ├── UserService.java
│   └── ProductService.java
└── repository/
    ├── UserRepository.java
    └── ProductRepository.java
```

### Mistake 3: Using @Component for service

**Not ideal:**
```java
@Component  // Generic, unclear purpose
public class LaptopService { }
```

**Better:**
```java
@Service  // Clear: this is a service layer class
public class LaptopService { }
```

### Mistake 4: Forgetting @Service

**Wrong:**
```java
// No annotation!
public class LaptopService { }
```

**Error:** NoSuchBeanDefinitionException

**Correct:**
```java
@Service  // Required!
public class LaptopService { }
```

---

## 🎯 Practice Exercises

### Exercise 1: Create UserService

Create UserService with @Service. Add methods: registerUser(), validateEmail(), calculateAge(). Test from main.

### Exercise 2: Package organization

Reorganize existing project into model, service, repository packages. Fix imports.

### Exercise 3: Business logic methods

Create ProductService with methods: applyDiscount(), calculateTax(), isOnSale(). Implement actual logic.

### Exercise 4: Multiple services

Create OrderService and PaymentService. OrderService uses PaymentService. Wire them with @Autowired.

### Exercise 5: Identify bad practices

Given code with mixed concerns, identify violations. Refactor into proper layers.

---

## 🔗 Quick Summary

**Creating service layer:**

**1. Create service package:**
```
com.company.app.service/
```

**2. Create service class:**
```java
@Service
public class LaptopService {
    
    public void addLaptop(Laptop lap) {
        // Business logic here
    }
    
    public boolean isGoodForProgramming(Laptop lap) {
        // Business logic here
        return true;
    }
}
```

**3. Use from main:**
```java
LaptopService service = context.getBean(LaptopService.class);
service.addLaptop(lap);
```

**Key points:**
- ✅ @Service for service layer classes
- ✅ @Service IS @Component (but more semantic)
- ✅ Business logic in service
- ✅ NO database code in service
- ✅ Organize into packages
- ✅ Repository handles database (next lesson)

**Next: Creating Repository layer with @Repository!** 🗄️

**Coming:**
- LaptopRepository class
- @Repository annotation
- JDBC database code
- Service → Repository interaction
- Complete layered architecture!
