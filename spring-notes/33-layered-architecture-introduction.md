# 🏗️ Layered Architecture - Service and Repository Layers

## Introduction

**From Document 32, we learned:**
- @Component marks classes for Spring management
- All Spring Core concepts work in Spring Boot
- @SpringBootApplication handles auto-configuration

**But @Component isn't alone!**

**The instructor reveals:**

> "Now till this point, we have talked about one of the stereotype annotation, which is your @Component. So if you want Spring to manage your class or the object, we have to write @Component on top of it. Right? Now this is not the only stereotype annotation available."

**Wait... there are more stereotype annotations?** 🤔

**Why do we need more?**

> "So if you talk about any application you'll be having multiple layers there."

**Today's big concept:** 🏗️

Real applications have multiple layers, and each layer has specific responsibilities. Spring provides specialized stereotype annotations for different layers:
- @Component (general purpose)
- @Service (business logic)
- @Repository (data access)
- @Controller (web layer - coming later)

**In this lesson, you'll learn:**
- Why @Component alone isn't enough
- Understanding layered architecture in applications
- Client-Server-Database architecture
- The three main server layers: Controller, Service, Repository
- Controller layer: request handling and response
- Service layer: business logic and processing
- Repository/DAO layer: database interaction
- Data flow through layers: Client → Server → Database
- Request and response cycle complete flow
- Real-world examples of each layer's responsibility
- When to use each layer
- Why separation of concerns matters
- Setting up for @Service and @Repository annotations
- Preparing to implement layers in code

Get ready to architect real applications! 🏗️

---

## Concept 1: Beyond @Component

### 🧠 What we know so far

**From Documents 27-32:**

**We learned @Component:**
```java
@Component
public class Alien { ... }

@Component
public class Laptop { ... }

@Component
public class Desktop { ... }
```

**All marked as @Component!**

**This works, but...**

**The instructor points out:**

> "Now this is not the only stereotype annotation available."

**There are MORE stereotype annotations!**

### 🧠 Why more annotations?

**The instructor explains the reason:**

> "So if you talk about any application you'll be having multiple layers there."

**Real applications have structure:**
- Not just random classes
- Organized into layers
- Each layer has specific responsibility
- Need to identify purpose of each class

**@Component is generic:**
- Works for anything
- Doesn't indicate purpose
- Doesn't show layer
- No semantic meaning

**We need specialized annotations!**

---

## Concept 2: Application Architecture Overview

### 🧠 Simple vs full-fledged applications

**The instructor sets context:**

> "Now this is not a web application. This is a simple console based application. But let's say if you have a full fledged application you'll be having multiple layers."

**Our current app (simple):**
```
Console Application
└── Alien, Laptop, Desktop (all @Component)
```

**Real-world app (complex):**
```
Web Application
├── Presentation Layer (Web pages, UI)
├── Controller Layer (Request handling)
├── Service Layer (Business logic)
├── Repository Layer (Data access)
└── Database Layer (Data storage)
```

**Multiple organized layers!**

### 🧠 The three-tier architecture

**The instructor introduces:**

> "So normally you will be having a client. Now client will interact with the server. And of course when you build an application you will also have a database there."

**Basic architecture diagram:**

```
┌─────────────────┐
│     CLIENT      │  (Browser, Mobile App, Desktop App)
│  - Web Browser  │
│  - Mobile App   │
│  - Desktop App  │
└────────┬────────┘
         │
         │ HTTP Request
         │
         ▼
┌─────────────────┐
│     SERVER      │  (Spring Boot Application)
│  - Controller   │
│  - Service      │
│  - Repository   │
└────────┬────────┘
         │
         │ SQL/JDBC
         │
         ▼
┌─────────────────┐
│    DATABASE     │  (MySQL, PostgreSQL, MongoDB)
│  - Tables       │
│  - Data         │
└─────────────────┘
```

**Three main tiers:**
1. **Client** - User interface (browser, app)
2. **Server** - Business logic (Spring Boot app)
3. **Database** - Data storage (MySQL, etc.)

**The instructor confirms:**

> "And of course when you talk about web application we'll be talking about Spring Web later. But just to give you a scenario, we have a client, we have a server in between, and then we have a database."

**Foundation of modern applications!**

---

## Concept 3: The Role of Database

### 🧠 Why databases?

**The instructor explains:**

> "Now in this server as well we have multiple layers. Now when you want to work with data, of course that's why we have database there. And in every application you will be having some kind of database."

**Applications need to:**
- Store data permanently
- Query data efficiently
- Update data safely
- Handle concurrent access
- Persist data between restarts

**Examples of data:**
- User accounts
- Product catalog
- Order history
- Customer information
- Transactions
- Logs

**Database is essential!** 📊

### 🧠 Fetching data flow

**The instructor describes the flow:**

> "Now if you want to fetch this data. So let's say if a client wants data, the request goes to the server. Server sends a request to the database. And database says okay that's your data, get your data back. Data goes to the server. Server sends that data to the client."

**Data retrieval flow:**

```
1. Client requests data
   │
   ▼
2. Server receives request
   │
   ▼
3. Server queries database
   │
   ▼
4. Database returns data
   │
   ▼
5. Server processes data
   │
   ▼
6. Server sends response
   │
   ▼
7. Client receives data
```

**Example:**
```
User clicks "View Profile"
    ↓
Browser sends GET /profile/123
    ↓
Server receives request
    ↓
Server queries: SELECT * FROM users WHERE id=123
    ↓
Database returns user data
    ↓
Server converts to JSON
    ↓
Browser receives JSON
    ↓
Display profile page
```

**Complete round trip!**

---

## Concept 4: Server-Side Layers

### 🧠 Why multiple layers in server?

**The instructor introduces server complexity:**

> "Now of course depending upon client it can be a web page. It can be only JSON data. But ultimately it is server who is responsible to accept and return data. Now even this server will have multiple layers."

**Server has multiple responsibilities:**
- Accept requests
- Validate input
- Execute business logic
- Access database
- Format response
- Handle errors
- Security checks
- Logging

**Too complex for one layer!**

**Solution: Divide into specialized layers!**

### 🧠 The three main layers

**Server layer structure:**

```
┌──────────────────────────────────────┐
│           SERVER                      │
│                                       │
│  ┌────────────────────────────────┐ │
│  │   CONTROLLER LAYER             │ │
│  │   - Accept requests            │ │
│  │   - Return responses           │ │
│  └─────────────┬──────────────────┘ │
│                │                     │
│                ▼                     │
│  ┌────────────────────────────────┐ │
│  │   SERVICE LAYER                │ │
│  │   - Business logic             │ │
│  │   - Processing                 │ │
│  └─────────────┬──────────────────┘ │
│                │                     │
│                ▼                     │
│  ┌────────────────────────────────┐ │
│  │   REPOSITORY LAYER             │ │
│  │   - Database access            │ │
│  │   - Data operations            │ │
│  └─────────────┬──────────────────┘ │
└────────────────┼────────────────────┘
                 │
                 ▼
            DATABASE
```

**Three specialized layers!**

---

## Concept 5: Controller Layer

### 🧠 What is a controller?

**The instructor introduces:**

> "So you'll be having a controller. Again, we'll talk about this thing in detail later when we talk about Spring MVC. But we have a controller now. Controller job is to only work with the request."

**Controller responsibility:**
- Accept HTTP requests
- Extract request parameters
- Route to appropriate service
- Format responses
- Return to client

**The instructor emphasizes:**

> "So whatever request you send from the client and if you want someone to handle that, you will do it with the help of controller."

### 🧠 Controller's limited role

**The instructor clarifies:**

> "Now, controller says my only job here is to accept the request and send data back. My job is not to do any processing."

**What controller DOES:**
✅ Accept requests
✅ Extract parameters
✅ Call service methods
✅ Format responses
✅ Return results

**What controller DOES NOT do:**
❌ Business logic
❌ Calculations
❌ Data processing
❌ Database access
❌ Complex operations

**Controller is just a messenger!** 📮

### 💡 Controller example (preview)

**What a controller looks like (we'll learn later):**

```java
@RestController
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public User getUser(@PathVariable int id) {
        // Controller job: accept request, call service, return result
        return userService.findUser(id);
        // No business logic here!
    }
}
```

**Simple and focused!**

---

## Concept 6: Service Layer

### 🧠 What is a service?

**The instructor asks:**

> "What if you want to do any processing? In that case we have to use something called a service."

**Service = Business Logic Layer**

**The instructor explains:**

> "Now service is a layer who is responsible to do any kind of processing."

**Service responsibilities:**
- Business logic
- Calculations
- Data processing
- Validation
- Complex operations
- Workflow orchestration

### 🧠 Service examples

**The instructor provides examples:**

> "Let's say if you want to add two numbers, if you want to find a factorial, if you want to find a logic, let's say which is a best stock to invest in, if you want to sort the product based on their average rating. So all the thing will be done in the service class."

**Service layer examples:**

**Example 1: Mathematical operations**
```java
@Service
public class CalculatorService {
    public int add(int a, int b) {
        return a + b;  // Processing
    }
    
    public int factorial(int n) {
        int result = 1;
        for (int i = 1; i <= n; i++) {
            result *= i;  // Processing
        }
        return result;
    }
}
```

**Example 2: Stock analysis**
```java
@Service
public class StockService {
    public Stock findBestStock(List<Stock> stocks) {
        // Complex business logic
        return stocks.stream()
            .filter(s -> s.getRating() > 4.0)
            .max(Comparator.comparing(Stock::getGrowthRate))
            .orElse(null);
    }
}
```

**Example 3: Product sorting**
```java
@Service
public class ProductService {
    public List<Product> sortByRating(List<Product> products) {
        // Processing logic
        return products.stream()
            .sorted(Comparator.comparing(Product::getAverageRating).reversed())
            .collect(Collectors.toList());
    }
}
```

**All business logic in service!**

### 🧠 Service's dependency on repository

**The instructor introduces the problem:**

> "Now what if you want some data from database? So let's say you're saying, 'Hey you know what, I want to find best products within the range of $10 to $100.'"

**The challenge:**
- Service needs to process data
- Data is in database
- Service doesn't have data
- Service can't connect to database directly

**The instructor explains:**

> "Now at this point you don't have your data in your application. You have that in your database. But where you will do this processing? You will do the processing inside service. But unfortunately service don't have data."

**Service needs help!**

---

## Concept 7: Repository Layer

### 🧠 What is a repository?

**The instructor introduces the solution:**

> "Now service has to connect with database. Now in that case you will be having a layer in between which will be your data layer which is called data access object. Or we can say repository."

**Repository = Data Access Layer**

**Also called:**
- DAO (Data Access Object)
- Repository
- Data Layer
- Persistence Layer

**The instructor explains:**

> "Now this is a layer who is responsible to interact with database. Get the data, give it to the service."

**Repository responsibilities:**
- Connect to database
- Execute SQL queries
- Fetch data
- Insert data
- Update data
- Delete data
- Handle database exceptions

### 💡 Repository example (preview)

**What a repository looks like:**

```java
@Repository
public class ProductRepository {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<Product> findProductsByPriceRange(double min, double max) {
        String sql = "SELECT * FROM products WHERE price BETWEEN ? AND ?";
        return jdbcTemplate.query(sql, 
            new Object[]{min, max}, 
            new ProductRowMapper());
        // Database interaction here!
    }
    
    public Product save(Product product) {
        String sql = "INSERT INTO products (name, price) VALUES (?, ?)";
        jdbcTemplate.update(sql, product.getName(), product.getPrice());
        return product;
    }
}
```

**Handles all database operations!**

### 🧠 Repository-Service collaboration

**The instructor describes:**

> "Now service will do some processing on that and then give the data back to the controller."

**How they work together:**

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository repository;
    
    public List<Product> findBestProductsInRange(double min, double max) {
        // 1. Get data from repository
        List<Product> products = repository.findProductsByPriceRange(min, max);
        
        // 2. Service does processing
        return products.stream()
            .filter(p -> p.getRating() >= 4.0)
            .sorted(Comparator.comparing(Product::getRating).reversed())
            .limit(10)
            .collect(Collectors.toList());
        
        // 3. Return processed data
    }
}
```

**Repository gets data, Service processes it!**

---

## Concept 8: Complete Data Flow

### 🧠 Request flow (Client to Database)

**The instructor describes the complete flow:**

> "So how is the flow from the client? Data goes to the controller. Controller says service, service and store repository. From repository request goes to database."

**Request flow diagram:**

```
┌─────────┐
│ CLIENT  │ "Get products $10-$100"
└────┬────┘
     │ HTTP GET /products?min=10&max=100
     ▼
┌─────────────────┐
│  CONTROLLER     │ "Accept request"
│                 │
│  getProducts()  │
└────┬────────────┘
     │ Call findProductsInRange(10, 100)
     ▼
┌─────────────────┐
│  SERVICE        │ "Process request"
│                 │
│  Business logic │
└────┬────────────┘
     │ Call repository to get data
     ▼
┌─────────────────┐
│  REPOSITORY     │ "Get data from DB"
│                 │
│  SQL queries    │
└────┬────────────┘
     │ SQL: SELECT * FROM products WHERE price BETWEEN 10 AND 100
     ▼
┌─────────────────┐
│  DATABASE       │ "Return data"
│                 │
│  MySQL/Postgres │
└─────────────────┘
```

**Flow: Client → Controller → Service → Repository → Database** ➡️

### 🧠 Response flow (Database to Client)

**The instructor describes the return journey:**

> "Database says okay this is your data. Repository sends back data to the service. Service does the processing, give it back to the controller and controller give it back to the client."

**Response flow diagram:**

```
┌─────────────────┐
│  DATABASE       │ Returns: [Product1, Product2, Product3, ...]
└────┬────────────┘
     │ Raw data
     ▼
┌─────────────────┐
│  REPOSITORY     │ Converts to Java objects
│                 │
│  List<Product>  │
└────┬────────────┘
     │ Return List<Product>
     ▼
┌─────────────────┐
│  SERVICE        │ Filters, sorts, calculates
│                 │
│  Process data   │
└────┬────────────┘
     │ Return processed List<Product>
     ▼
┌─────────────────┐
│  CONTROLLER     │ Format to JSON
│                 │
│  Return response│
└────┬────────────┘
     │ HTTP Response: JSON
     ▼
┌─────────┐
│ CLIENT  │ Display products
└─────────┘
```

**Flow: Database → Repository → Service → Controller → Client** ⬅️

### 🧠 Complete cycle

**The instructor summarizes:**

> "That's the entire flow here."

**Complete round trip:**

```
REQUEST FLOW:
Client → Controller → Service → Repository → Database

RESPONSE FLOW:
Database → Repository → Service → Controller → Client
```

**Each layer has specific responsibility!**

---

## Concept 9: Separation of Concerns

### 🧠 Why separate layers?

**Benefits of layered architecture:**

**1. Single Responsibility Principle**
- Each layer does ONE thing
- Controller handles requests
- Service handles logic
- Repository handles data

**2. Maintainability**
- Change database? → Only modify repository
- Change business logic? → Only modify service
- Change API? → Only modify controller

**3. Testability**
- Test each layer independently
- Mock dependencies
- Unit test service without database

**4. Reusability**
- Service can be used by multiple controllers
- Repository can be used by multiple services

**5. Clarity**
- Code organization obvious
- Easy to find code
- New developers understand structure

### 💡 Real-world example

**E-commerce system:**

**Controller (API endpoints):**
```java
@RestController
public class OrderController {
    @Autowired
    private OrderService orderService;
    
    @PostMapping("/orders")
    public Order createOrder(@RequestBody OrderRequest request) {
        return orderService.createOrder(request);
    }
}
```

**Service (business logic):**
```java
@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private InventoryService inventoryService;
    @Autowired
    private PaymentService paymentService;
    
    public Order createOrder(OrderRequest request) {
        // 1. Validate order
        validateOrder(request);
        
        // 2. Check inventory
        if (!inventoryService.isAvailable(request.getProductId())) {
            throw new OutOfStockException();
        }
        
        // 3. Process payment
        Payment payment = paymentService.processPayment(request.getPayment());
        
        // 4. Create order
        Order order = new Order(request, payment);
        
        // 5. Save to database
        return orderRepository.save(order);
    }
}
```

**Repository (database access):**
```java
@Repository
public class OrderRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public Order save(Order order) {
        String sql = "INSERT INTO orders (customer_id, product_id, amount) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, 
            order.getCustomerId(), 
            order.getProductId(), 
            order.getAmount());
        return order;
    }
}
```

**Clear separation!** ✨

---

## Concept 10: Preparing to Implement Layers

### 🧠 Setting up the example

**The instructor sets context:**

> "Now if you want to create those classes in Java, which annotation you're going to use? In fact, let me just do that here."

**The plan:**
- Remove Desktop (simplify)
- Focus on Laptop only
- Imagine database for laptop
- Create service layer
- Create repository layer

**The instructor explains:**

> "So what I will do is I will create - I will add extra layers here. So let me close this Desktop. Let's only work with Laptop here I don't need all these things open."

**Simplified structure:**
```java
@Component
public class Laptop implements Computer {
    public void compile() {
        System.out.println("Compiling in Laptop");
    }
}
```

### 🧠 The scenario

**The instructor describes:**

> "So let's say we only have Laptop here. And imagine we do have a database for laptop somewhere."

**Scenario:**
- Laptop data stored in database
- Client wants laptop information
- Need to fetch from database
- Need to process data
- Need to return to client

**The instructor asks:**

> "So how will we create this layer?"

### 🧠 Redefining layers for our example

**The instructor maps our example:**

> "So let's say this is your client layer. Or maybe you can imagine this as a controller if you want. But at this point client makes much more sense."

**Our simplified architecture:**

```
┌──────────────────────┐
│  MAIN APP            │
│  (Client/Controller) │  ← Current SpringBootDemoApplication.main()
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  SERVICE LAYER       │  ← Need to create
│  (Business Logic)    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  REPOSITORY LAYER    │  ← Need to create
│  (Data Access)       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  DATABASE            │  ← Imaginary for now
│  (Laptop data)       │
└──────────────────────┘
```

**The instructor describes the flow:**

> "So let's say this is your client layer. From this layer you are requesting to the server. Now on server let's replace controller. The request directly goes to the service layer. Now what service will do. Let's say you want data about laptop."

**Example scenario:**
```
Client: "Give me laptop with id=10"
    ↓
Service: "Let me get that for you..."
    ↓
Repository: "Fetching from database..."
    ↓
Database: "Here's laptop id=10"
```

**The instructor continues:**

> "Now the client sends request to the server. The service will say okay I will give you the data, but I have to get data from the repository. So you'll be having one more layer there."

**Need to create both layers!**

### 🧠 The key question

**The instructor poses the challenge:**

> "But how do we create those layers and how do we annotate that?"

**Questions to answer:**
- What annotation for service?
- What annotation for repository?
- How to connect them?
- How to inject dependencies?

**The instructor teases:**

> "Let's do the code in the next video."

**Coming next: @Service and @Repository annotations!** 🚀

---

## ✅ Key Takeaways

### About Stereotype Annotations

1. **@Component is not alone**
   - Multiple stereotype annotations exist
   - Each serves specific purpose
   - Semantic meaning important

2. **Specialized annotations for layers**
   - @Service for business logic
   - @Repository for data access
   - @Controller for web layer (coming later)

3. **All are components**
   - All are managed by Spring
   - All support dependency injection
   - Specialized behavior possible

### About Layered Architecture

1. **Three-tier architecture**
   - Client tier (UI)
   - Server tier (Logic)
   - Database tier (Storage)

2. **Server has three layers**
   - Controller: request handling
   - Service: business logic
   - Repository: data access

3. **Clear separation of concerns**
   - Each layer has one responsibility
   - No mixing of concerns
   - Easy to maintain and test

### About Controller Layer

1. **Request handler only**
   - Accept HTTP requests
   - Extract parameters
   - Call service methods
   - Return responses

2. **No business logic**
   - Just routing
   - Just formatting
   - Delegate to service

3. **Coming later**
   - Spring MVC
   - @RestController
   - @GetMapping, @PostMapping

### About Service Layer

1. **Business logic home**
   - All processing here
   - Calculations
   - Validation
   - Complex operations

2. **Orchestrates workflow**
   - Calls multiple repositories
   - Combines data
   - Applies business rules

3. **No direct database access**
   - Uses repository
   - Focuses on logic
   - No SQL here

### About Repository Layer

1. **Database access only**
   - Execute SQL
   - Fetch data
   - Save data
   - No business logic

2. **Data conversion**
   - SQL results to Java objects
   - Java objects to SQL
   - Handle database types

3. **Multiple names**
   - Repository
   - DAO (Data Access Object)
   - Data Layer
   - Persistence Layer

### About Data Flow

1. **Request flow**
   ```
   Client → Controller → Service → Repository → Database
   ```

2. **Response flow**
   ```
   Database → Repository → Service → Controller → Client
   ```

3. **Each layer transforms data**
   - Controller: HTTP to Java
   - Service: Raw to processed
   - Repository: Java to SQL

---

## 💡 Final Insights

### Why This Architecture Matters

**Without layers (bad):**
```java
@Component
public class LaptopManager {
    
    public void handleRequest(String request) {
        // Parse request
        // Connect to database
        // Execute SQL
        // Process data
        // Format response
        // Everything mixed together!
    }
}
```

**Problems:**
- ❌ Everything in one class
- ❌ Hard to test
- ❌ Hard to maintain
- ❌ Can't reuse code
- ❌ Changes affect everything

**With layers (good):**
```java
@RestController
public class LaptopController {
    @Autowired
    private LaptopService service;
    
    @GetMapping("/laptops/{id}")
    public Laptop getLaptop(@PathVariable int id) {
        return service.findLaptop(id);
    }
}

@Service
public class LaptopService {
    @Autowired
    private LaptopRepository repository;
    
    public Laptop findLaptop(int id) {
        Laptop laptop = repository.findById(id);
        // Process/validate
        return laptop;
    }
}

@Repository
public class LaptopRepository {
    public Laptop findById(int id) {
        // Database query
        return laptop;
    }
}
```

**Benefits:**
- ✅ Clear responsibilities
- ✅ Easy to test
- ✅ Easy to maintain
- ✅ Reusable components
- ✅ Changes isolated

---

### Real-World Application Structure

**Complete Spring Boot application:**

```
com.company.laptopstore/
├── LaptopStoreApplication.java     ← @SpringBootApplication
├── controller/
│   ├── LaptopController.java       ← @RestController
│   ├── OrderController.java        ← @RestController
│   └── UserController.java         ← @RestController
├── service/
│   ├── LaptopService.java          ← @Service
│   ├── OrderService.java           ← @Service
│   └── UserService.java            ← @Service
├── repository/
│   ├── LaptopRepository.java       ← @Repository
│   ├── OrderRepository.java        ← @Repository
│   └── UserRepository.java         ← @Repository
└── model/
    ├── Laptop.java                 ← Plain POJO
    ├── Order.java                  ← Plain POJO
    └── User.java                   ← Plain POJO
```

**Clear organization!**

---

### The Complete Flow Example

**Scenario: Get laptop by ID**

**1. Client request:**
```
GET http://localhost:8080/api/laptops/5
```

**2. Controller receives:**
```java
@RestController
@RequestMapping("/api/laptops")
public class LaptopController {
    
    @Autowired
    private LaptopService laptopService;
    
    @GetMapping("/{id}")
    public Laptop getLaptop(@PathVariable int id) {
        // Controller: Just route the request
        return laptopService.findLaptopById(id);
    }
}
```

**3. Service processes:**
```java
@Service
public class LaptopService {
    
    @Autowired
    private LaptopRepository laptopRepository;
    
    public Laptop findLaptopById(int id) {
        // Service: Business logic
        Laptop laptop = laptopRepository.findById(id);
        
        if (laptop == null) {
            throw new LaptopNotFoundException("Laptop not found: " + id);
        }
        
        // Calculate discount
        laptop.setDiscountedPrice(calculateDiscount(laptop.getPrice()));
        
        return laptop;
    }
    
    private double calculateDiscount(double price) {
        // Business logic here
        return price * 0.9;
    }
}
```

**4. Repository queries:**
```java
@Repository
public class LaptopRepository {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public Laptop findById(int id) {
        // Repository: Database access
        String sql = "SELECT * FROM laptops WHERE id = ?";
        
        return jdbcTemplate.queryForObject(sql, 
            new Object[]{id}, 
            (rs, rowNum) -> {
                Laptop laptop = new Laptop();
                laptop.setId(rs.getInt("id"));
                laptop.setName(rs.getString("name"));
                laptop.setPrice(rs.getDouble("price"));
                return laptop;
            });
    }
}
```

**5. Database returns:**
```sql
SELECT * FROM laptops WHERE id = 5;
-- Returns: id=5, name="MacBook Pro", price=2000.0
```

**6. Response flows back:**
```
Repository → Service → Controller → Client
```

**7. Client receives:**
```json
{
    "id": 5,
    "name": "MacBook Pro",
    "price": 2000.0,
    "discountedPrice": 1800.0
}
```

**Every layer played its role!**

---

### Why Spring Provides Specialized Annotations

**Technical reasons:**

**1. Semantic clarity**
```java
@Service
public class OrderService { }  // "This is business logic"

@Repository
public class OrderRepository { }  // "This is data access"
```

**Clear intent from annotation!**

**2. Different behavior**
- @Repository adds exception translation
- @Service may add transaction management
- @Controller adds web-specific features

**3. Better tooling support**
- IDEs recognize layers
- Better autocomplete
- Better navigation

**4. Framework features**
- AOP can target specific layers
- Different caching strategies
- Different security rules

**5. Documentation**
- Self-documenting code
- Architecture visible in code
- New developers understand structure

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Mixing concerns

**Wrong:**
```java
@Service
public class UserService {
    
    public User getUser(int id) {
        // BAD: Direct SQL in service!
        Connection conn = DriverManager.getConnection(...);
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id=" + id);
        // ...
    }
}
```

**Correct:**
```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User getUser(int id) {
        return userRepository.findById(id);
    }
}
```

### Mistake 2: Business logic in controller

**Wrong:**
```java
@RestController
public class ProductController {
    
    @GetMapping("/products/{id}")
    public Product getProduct(@PathVariable int id) {
        // BAD: Business logic in controller!
        Product product = repository.findById(id);
        product.setDiscountedPrice(product.getPrice() * 0.9);
        return product;
    }
}
```

**Correct:**
```java
@RestController
public class ProductController {
    @Autowired
    private ProductService productService;
    
    @GetMapping("/products/{id}")
    public Product getProduct(@PathVariable int id) {
        return productService.findProductWithDiscount(id);
    }
}
```

### Mistake 3: Skipping layers

**Wrong:**
```java
@RestController
public class OrderController {
    @Autowired
    private OrderRepository orderRepository;  // BAD: Controller talks to repository directly!
    
    @GetMapping("/orders/{id}")
    public Order getOrder(@PathVariable int id) {
        return orderRepository.findById(id);
    }
}
```

**Correct:**
```java
@RestController
public class OrderController {
    @Autowired
    private OrderService orderService;  // Controller → Service → Repository
    
    @GetMapping("/orders/{id}")
    public Order getOrder(@PathVariable int id) {
        return orderService.findOrder(id);
    }
}
```

---

## 🎯 Practice Exercises

### Exercise 1: Identify layers

Given code snippets, identify which layer they belong to (Controller, Service, or Repository).

### Exercise 2: Design layers

Design a User management system with proper layers. Define responsibilities for each layer.

### Exercise 3: Trace data flow

Given a complete request example, trace the flow through each layer and back.

### Exercise 4: Refactor monolith

Take a single class doing everything and refactor into proper Controller, Service, Repository layers.

### Exercise 5: Identify violations

Find separation of concerns violations in provided code. Fix them.

---

## 🔗 Quick Summary

**Layered architecture fundamentals:**

**Three-tier architecture:**
```
Client (UI) ↔ Server (Logic) ↔ Database (Storage)
```

**Server has three layers:**
```
Controller → Service → Repository → Database
```

**Responsibilities:**
- **Controller**: Accept requests, return responses
- **Service**: Business logic, processing
- **Repository**: Database access, data operations

**Data flow:**
```
REQUEST:  Client → Controller → Service → Repository → DB
RESPONSE: DB → Repository → Service → Controller → Client
```

**Benefits:**
- ✅ Separation of concerns
- ✅ Maintainability
- ✅ Testability
- ✅ Reusability
- ✅ Clarity

**Coming next: @Service and @Repository annotations in action!** 🚀

**We'll create:**
- LaptopService with @Service
- LaptopRepository with @Repository
- Wire them together
- See layers in action!
