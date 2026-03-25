# 🌐 Document 43: Introduction to Web Applications and Servlets

## Introduction: A New Chapter - Building Web Applications

For the past 42 documents, we've been deep in the world of Spring Core and Spring JDBC. We've learned:

✅ **Spring Core**: Dependency Injection, IoC containers, beans, configuration
✅ **Spring Boot**: Auto-configuration, embedded servers, convention over configuration  
✅ **Spring JDBC**: Database access, JdbcTemplate, connection pooling
✅ **Database Integration**: H2 for development, PostgreSQL for production

We built a complete application that manages students—creating, storing, and retrieving data from databases.

**But here's the question:** How do users actually interact with our application?

Right now, everything runs in `main()`:

```java
public static void main(String[] args) {
    ConfigurableApplicationContext context = SpringApplication.run(...);
    
    Student s = context.getBean(Student.class);
    s.setRollNumber(104);
    s.setName("Naveen");
    s.setMarks(78);
    
    service.addStudent(s);
    System.out.println(service.getStudents());
}
```

**Problems:**
- Only developers can use it (they need the source code!)
- Can't run from web browsers
- No mobile app can connect
- No multiple users simultaneously
- Console output instead of beautiful UI

**What we need:** A **web application** that anyone can access from anywhere!

**"In this module, we'll talk about web application."**

In this video, we're going to:

1. **Understand Spring's web projects** (Spring Web, Spring MVC)
2. **Learn why web applications dominate** modern software
3. **Explore client-server architecture** (browsers, mobile apps, servers)
4. **Understand static vs dynamic content** (HTML/CSS vs server-generated data)
5. **Discover JSON for data exchange** (the universal format)
6. **Learn what Servlets are** (Java's web component technology)
7. **Understand Servlet containers** (Tomcat - where servlets run)
8. **See Spring's relationship with Servlets** (Spring builds on servlets)
9. **Plan our learning path** (servlets first, then Spring MVC)

This is a foundational video—no coding yet! We're understanding **what** we're building and **why** before diving into **how**.

Let's enter the world of web applications!

---

## Step 1: Spring - The Umbrella Framework

**"When we talk about spring as a framework. It has multiple projects inside it. So it's an umbrella for multiple projects."**

### Spring is Not Just One Thing

When we say "Spring," we're actually talking about an **ecosystem** of projects:

```
Spring Framework (The Umbrella)
├── Spring Core (IoC, DI, Beans)
├── Spring JDBC (Database access)
├── Spring MVC (Web applications - traditional)
├── Spring Web (Web applications - modern)
├── Spring Data (Repository abstraction)
├── Spring Security (Authentication/Authorization)
├── Spring Boot (Auto-configuration & conventions)
├── Spring Cloud (Microservices)
├── Spring Batch (Batch processing)
└── ... many more!
```

**What We've Learned So Far:**

**Documents 1-30:** Spring Core (IoC container, beans, DI, XML/Java config)
**Documents 31-32:** Spring Boot (auto-configuration magic)
**Documents 33-42:** Spring JDBC (database operations)

**What's Next:**

**Documents 43+:** Spring Web / Spring MVC (web applications!)

### The Web Projects

**"And one of the project, in fact there are multiple projects which deals with web application."**

Spring has **two main approaches** for web development:

**1. Spring MVC (Traditional Web Apps):**
```
Spring MVC → Servlet-based → Server-side rendering
Perfect for: Traditional web apps, server-rendered HTML
```

**2. Spring WebFlux (Reactive Web Apps):**
```
Spring WebFlux → Reactive streams → Non-blocking I/O
Perfect for: High-concurrency, reactive systems
```

**"So if you want to build a web application you can use something called spring web. And otherwise if you don't want to use Spring Boot, you also have spring MVC there."**

**Clarification:**

- **Spring MVC** = The framework (older, can work without Spring Boot)
- **Spring Web** = Spring Boot starter that includes Spring MVC
- **Spring Boot + Spring Web** = Modern, recommended approach

**In this course:** We'll use **Spring Boot with Spring Web** (easiest and most modern!)

---

## Step 2: Why Build Web Applications?

**"Now why exactly we need to build web apps again, that's a weird question, right? Because we all know the answer."**

### The Web Dominates Modern Software

**"The world is working on web applications."**

Think about it—what software do you use daily?

- **Gmail** - Web application
- **YouTube** - Web application  
- **Facebook** - Web application
- **Netflix** - Web application
- **Banking** - Web application
- **Shopping (Amazon)** - Web application
- **Your school/college portal** - Web application

Even software that seems "desktop" has a web version:
- Microsoft Office → Office 365 (web)
- Photoshop → Photoshop Online (web)
- Games → Browser games, streaming services

**Why Web Apps Dominate:**

1. **No Installation Required**
   - Just open browser → go to URL → start using
   - No "Download this 500MB installer"

2. **Cross-Platform**
   - Windows, Mac, Linux, ChromeOS—all work with same app
   - One codebase serves everyone

3. **Automatic Updates**
   - Developer deploys new version → everyone gets it instantly
   - No "Please update your software" messages

4. **Accessible Anywhere**
   - Home computer, work computer, internet cafe, friend's laptop
   - Your data follows you

5. **Easier Development**
   - Build once, deploy to server
   - Don't need to support 50 different OS configurations

---

## Step 3: Mobile Apps Still Need Backend Servers

**"Of course you do have mobile applications. But then for every mobile app, okay, not every but 99.99% of mobile application also have a web application."**

### Mobile Apps Aren't Independent

**Common Misconception:**

```
❌ Mobile app = Standalone software with everything built-in
```

**Reality:**

```
✅ Mobile app = Frontend UI + Backend server (web application)
```

**Example: Instagram**

```
Instagram Mobile App (iOS/Android)
        ↓
    Just the UI/Interface
        ↓
Data comes from → Instagram Backend Server (Web Application)
        ↑
Instagram Website (Browser)
```

**Both the mobile app AND the website** connect to the **same backend server**!

**"So the back end remains same for the front end of your desktop and the front end of your mobile application."**

### The Architecture

```
                  Backend Server (Web Application)
                           ↑
                           |
                  +--------+--------+
                  |                 |
           Browser Client      Mobile Client
          (Web Frontend)    (iOS/Android App)
```

**"So can I say that the client, the browser client and the mobile application most of the time will be having the same server?"**

**Yes!** This is the standard architecture.

**Real-World Examples:**

**Twitter:**
- Twitter mobile app (iOS/Android)
- Twitter website (twitter.com)
- Both use same Twitter backend API server

**YouTube:**
- YouTube mobile app
- YouTube website
- YouTube Smart TV app
- All use same YouTube backend servers

**Benefits:**

1. **Write backend once** → Serve multiple clients
2. **Maintain data consistency** → One source of truth
3. **Easier updates** → Fix bug once, all clients benefit
4. **Business logic centralized** → Can't be bypassed by client modifications

---

## Step 4: Our Focus - Building the Backend Server

**"And we are here to focus on how do you build that server."**

### The Client-Server Model

```
CLIENT                           SERVER
------                           ------
Browser                           ?
Mobile App         ←→           What we'll build!
Desktop App                       Java + Spring
```

**What is the Server?**

The server is a program that:
1. **Listens for requests** from clients (HTTP requests)
2. **Processes requests** (business logic, database queries)
3. **Sends responses** back to clients (data, HTML, JSON)
4. **Runs 24/7** (always available)

**Our Goal:** Build this server using **Java and Spring**!

**"Because if you talk about a client, it can be a mobile or a desktop."**

We don't control what clients exist. But we control the server that serves them all!

---

## Step 5: Static Content vs Dynamic Content

**"Maybe on the browser you will be having a page up. On that page you want to show some data, right?"**

### Understanding Static Content

**"See, having that page is not difficult, but getting that data is difficult because every user will have a different data."**

**Static Content:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This is a static page.</p>
</body>
</html>
```

**Characteristics:**
- Same for every user
- Doesn't change unless developer edits the file
- Pure HTML/CSS/JavaScript files
- No server-side processing needed

**"Now I'm talking about dynamic content here, but let's say if you want to build a static content for all the users over the world, you can do that with the help of HTML, CSS, and you will get that beautiful page there."**

**Example Static Sites:**
- Company landing pages
- Portfolio websites
- Documentation sites
- "About Us" pages

### The Problem with Static Content

**Imagine a static student list:**

```html
<h1>Student List</h1>
<ul>
    <li>Naveen - 78 marks</li>
    <li>Kiran - 79 marks</li>
    <li>Hersh - 75 marks</li>
</ul>
```

**Problems:**
- What if new student enrolls? (Developer must manually edit HTML)
- What if marks change? (Edit HTML again)
- What if 10,000 students? (Can't hardcode all!)
- What if each user should see only their own data? (Impossible with static HTML)

**We need Dynamic Content!**

---

## Step 6: Dynamic Content - The Need for Backend Programming

**"But if you want to make it dynamic, that's where you need a back end programming. And one of it is Java."**

### What is Dynamic Content?

Content that **changes based on:**
- Who the user is (personalization)
- Current data in database (real-time information)
- User's request (search queries, filters)
- Time of day (good morning vs good evening)
- User's actions (clicked, purchased, viewed)

**Example: Facebook Feed**

```
Your Facebook page          ≠          Your friend's Facebook page
- Your friends' posts                  - Their friends' posts
- Your profile picture                 - Their profile picture
- Your notifications                   - Their notifications
```

**Same Application, Different Content for Each User!**

**How It Works:**

```
1. User logs in → Server knows who you are
2. User requests feed → Server queries database: "Get posts from User #123's friends"
3. Server generates HTML with that specific data
4. Server sends personalized page to user
```

**"So here we want to make sure that every time you get a request from your client and it goes to the server, basically there should be something on the server which will accept the request, process the request and give back to the client."**

### Backend Programming Languages

**Popular Choices:**
- **Java** (Spring Boot) ← Our focus!
- **Python** (Django, Flask, FastAPI)
- **JavaScript** (Node.js, Express)
- **PHP** (Laravel)
- **Ruby** (Ruby on Rails)
- **C#** (ASP.NET)
- **Go** (Gin, Echo)

**All do the same thing:** Accept HTTP requests → Process → Send responses

**Why Java + Spring?**
- ✅ Enterprise-grade (used by banks, governments, huge companies)
- ✅ Type-safe (fewer bugs)
- ✅ Excellent ecosystem (Spring Framework)
- ✅ Great performance
- ✅ Huge job market

---

## Step 7: JSON - The Universal Data Format

**"Now when you say give back something to the client in nowadays we are talking about data, only the data."**

### Modern Architecture: Frontend + Backend Separation

**Old Way (Server-Side Rendering):**

```
Browser → Request → Server
                      ↓
              Generate complete HTML page
                      ↓
Browser ← HTML ← Server
```

Server sends entire HTML page with data embedded.

**New Way (Frontend-Backend Separation):**

```
Browser → Request → Server
                      ↓
               Query database
                      ↓
Browser ← JSON data ← Server
  ↓
Frontend JavaScript renders data into HTML
```

Server sends just the **data**, frontend handles presentation!

**"Maybe it is possible that the front end which you are building for a web, it is done with the help of react, angular or a vanilla JS."**

### Why JSON?

**JSON = JavaScript Object Notation**

**Example JSON:**

```json
{
  "students": [
    {
      "rollNumber": 101,
      "name": "Naveen",
      "marks": 78
    },
    {
      "rollNumber": 102,
      "name": "Kiran",
      "marks": 79
    }
  ]
}
```

**Characteristics:**
- **Human-readable** (easy to debug)
- **Language-agnostic** (Java, Python, JavaScript all understand it)
- **Lightweight** (smaller than XML)
- **Standard format** (universal acceptance)

**"Important is the back end will send the JSON data to the client."**

### Bidirectional Communication

**Server → Client (JSON):**

```json
{
  "status": "success",
  "data": {
    "users": [...]
  }
}
```

**"And what if client wants to send some data? Of course client can send data in the JSON format."**

**Client → Server (JSON):**

```json
{
  "rollNumber": 105,
  "name": "Priya",
  "marks": 88
}
```

**"Same goes for mobile application."**

**Both web and mobile use JSON!**

---

## Step 8: Real-World Example - Sports Score App

**"So if a mobile want to interact with the server, let's say if you want to check the current score."**

### The Use Case

**"So whatever sports you love and if you're watching a particular game and if you don't have a time to watch a game, but if you want to get the score, you can take your mobile phone out, open the application now."**

**The Process:**

```
1. You open ESPN/Cricbuzz/ESPN app
        ↓
2. App sends request to server: "GET /api/scores/match-123"
        ↓
3. Server queries database: "SELECT score FROM matches WHERE id = 123"
        ↓
4. Server sends JSON response:
   {
     "match": "India vs Australia",
     "score": "India 245/3 (40 overs)"
   }
        ↓
5. App displays score in beautiful UI
```

**"This app will have the layout. What you get from the server is the data."**

**Separation of Concerns:**

- **Mobile App:** Handles layout, colors, fonts, animations
- **Server:** Provides data (scores, statistics, player info)

**Benefits:**

1. **Same data for all platforms:**
   - Mobile app gets JSON
   - Website gets JSON
   - Smart TV app gets JSON

2. **Easy updates:**
   - Score changes → Database updates → All clients see new score immediately

3. **Offline capability:**
   - App can cache JSON data
   - Show last known score when no internet

**"That means we have to generate that data from the server. Maybe this data is coming from the database or this data is coming from some other server."**

### Data Sources

**Server can get data from:**

```
Server
  ↓
  ├─→ Database (PostgreSQL, MySQL)
  ├─→ Another API (Weather API, Payment Gateway)
  ├─→ Cache (Redis, Memcached)
  ├─→ File System (Images, Documents)
  └─→ External Services (Third-party APIs)
```

**Server acts as coordinator:** Gathers data from multiple sources, processes it, sends unified response!

**"Right. So it is possible. Basically all this data passing is happening with the help of JSON data."**

---

## Step 9: Building the Server in Java - Enter Servlets

**"Now question arises how do you build this server in Java. And that's where we got something called servlets."**

### What Are Servlets?

**"So what are servlets. As the name suggests we have serve and let."**

**Breaking Down the Name:**

```
Servlet = Serve + let
          ↓      ↓
        Serve   Little server component
```

**Definition:**

**Servlet** = A Java class that runs on a server to handle HTTP requests and generate HTTP responses.

**Think of it like:**

```java
class MyServlet {
    public void handleRequest(Request request) {
        // Read request data
        String name = request.getParameter("name");
        
        // Process (maybe query database)
        Student student = database.findByName(name);
        
        // Send response
        response.send(student.toJSON());
    }
}
```

**"So basically these are the components the server components which will process. And in fact it will accept the request. It will process the request. It will send data back to the client."**

### Servlet Responsibilities

**1. Accept Requests:**

```
HTTP Request arrives at server
        ↓
Servlet container identifies which servlet to call
        ↓
Servlet's method is invoked
```

**2. Process Requests:**

- Extract data from request (form data, URL parameters)
- Perform business logic
- Query database
- Call other services
- Generate response data

**3. Send Responses:**

- Create HTTP response
- Set headers (content-type, status code)
- Write response body (HTML, JSON, XML)
- Send back to client

**Visual Flow:**

```
Browser                 Servlet                 Database
   |                       |                        |
   |--- GET /students ---->|                        |
   |                       |                        |
   |                       |--- SELECT * ---->      |
   |                       |<--- Student data ---|  |
   |                       |                        |
   |<--- JSON response ----|                        |
   |                       |                        |
```

---

## Step 10: Where Do Servlets Run? - Servlet Containers

**"Now basically to run this servlets you can't simply run your servlets on JVM the way we are doing till now to run this servlets."**

### The Problem

**Regular Java Program:**

```java
public static void main(String[] args) {
    System.out.println("Hello World");
}

// Run directly: java MyProgram
// Runs on JVM → Executes → Exits
```

**Servlet:**

```java
public class MyServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        // How does this get called?
        // Who calls this method?
        // How does it know when a request arrives?
    }
}

// Can't run with: java MyServlet
// No main() method!
// Needs something to listen for HTTP requests...
```

**The Challenge:**

- Servlets need to **listen on network ports** (port 8080, 443, etc.)
- Need to **parse HTTP requests** (headers, body, cookies)
- Need to **route requests** to correct servlet
- Need to **manage servlet lifecycle** (create, destroy)
- Need to **handle multiple requests simultaneously** (threading)

**Regular JVM doesn't provide these capabilities!**

### Enter: Servlet Container

**"Now, since it has some extra features that getting the request from the internet and then responding back, we have to use a special container where you can run this. And the special container here is called a servlet container. Or you can say a web container."**

**Servlet Container = Special Runtime Environment for Servlets**

**What It Provides:**

```
Servlet Container
├── HTTP Server (listens on port 8080)
├── Request Parser (converts HTTP to Java objects)
├── Servlet Lifecycle Manager (create, init, destroy)
├── Thread Pool (handle multiple requests)
├── Request Router (map URLs to servlets)
└── Security (authentication, SSL)
```

**How It Works:**

```
1. Container starts → Listens on port 8080
2. HTTP request arrives → Container receives it
3. Container parses HTTP → Creates HttpServletRequest object
4. Container identifies servlet → Based on URL mapping
5. Container calls servlet method → doGet(), doPost(), etc.
6. Servlet processes request → Returns response
7. Container converts to HTTP → Sends back to client
```

**"Now what are the options we have. So one of the best option or the lightweight option we got is Tomcat."**

### Popular Servlet Containers

**1. Apache Tomcat** ← **Most Popular!**
- Open-source
- Lightweight
- Easy to use
- Perfect for learning
- Production-ready

**2. Jetty**
- Lightweight
- Embeddable
- Good for microservices

**3. WildFly (formerly JBoss)**
- Full Java EE application server
- More features (EJB, JMS, etc.)
- Heavier

**4. GlassFish**
- Reference implementation for Java EE
- Open-source

**5. IBM WebSphere**
- Enterprise
- Commercial

**6. Oracle WebLogic**
- Enterprise
- Commercial

**For this course:** We'll use **Tomcat** (embedded in Spring Boot!)

**"Now Tomcat is a server in which you can run your servlets."**

---

## Step 11: Spring and Servlets - The Relationship

**"Now question arise. Hey we are into spring here, right? Why why are we talking about servlets?"**

### The Connection

**"So your thing is ultimately, if you want to build the back end where you're accepting requests from the client, that's where you need a servlet."**

**The Foundation:**

```
Java Web Applications
        ↓
   Built on Servlets
        ↓
Spring also uses Servlets!
```

**Spring doesn't replace servlets—Spring builds on top of servlets!**

### How Spring Uses Servlets

**Behind the Scenes:**

```java
// Spring MVC has a special servlet: DispatcherServlet
public class DispatcherServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        // 1. Parse request
        // 2. Find which @Controller method to call
        // 3. Invoke the method
        // 4. Convert return value to JSON/HTML
        // 5. Send response
    }
}
```

**Spring's Magic:**

Instead of writing:

```java
// Pure Servlet (verbose!)
public class StudentServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        String id = req.getParameter("id");
        Student student = database.find(id);
        String json = convertToJSON(student);
        resp.setContentType("application/json");
        resp.getWriter().write(json);
    }
}
```

You write:

```java
// Spring MVC (clean!)
@RestController
public class StudentController {
    @GetMapping("/students/{id}")
    public Student getStudent(@PathVariable int id) {
        return studentService.findById(id);
    }
}
```

**Spring handles:**
- Servlet creation
- Request parsing
- JSON conversion
- Response generation

**"But then if you want to use spring there, spring will make sure that you are doing it in a easy format. Ultimately, spring will also work with servlet behind the scene."**

---

## Step 12: Servlet vs Reactive - Two Approaches

**"Now we have two options for the web application. One is servlet, or you can also use reactive. But then our focus here will be to work with servlets okay."**

### The Two Models

**1. Servlet Model (Blocking I/O):**

```
Request comes in
    ↓
Server assigns thread to handle it
    ↓
Thread processes request (waits for database, external API, etc.)
    ↓
Thread blocked until response ready
    ↓
Response sent
    ↓
Thread freed for next request
```

**Characteristics:**
- **One thread per request**
- **Blocking operations** (thread waits)
- **Easy to understand** (sequential code)
- **Scales with thread pool**

**Example Use Cases:**
- Traditional web apps
- REST APIs
- Most business applications

**2. Reactive Model (Non-Blocking I/O):**

```
Request comes in
    ↓
Handler starts processing on thread
    ↓
When blocking operation needed (DB query) → Thread released immediately
    ↓
When operation completes → Any available thread continues
    ↓
Response sent
```

**Characteristics:**
- **Multiple requests per thread**
- **Non-blocking operations**
- **Complex to understand** (callback hell, async)
- **Highly scalable** (handles huge concurrency)

**Example Use Cases:**
- High-traffic streaming services
- Real-time applications
- Event-driven systems

### Why Servlet for This Course?

**"But then our focus here will be to work with servlets okay."**

**Reasons:**

1. **Easier to learn** (sequential, blocking code is intuitive)
2. **More common** (90% of Spring applications use servlets)
3. **Better debugging** (stack traces make sense)
4. **Foundation first** (learn reactive after mastering basics)

**Reactive is powerful but complex!** Better to master servlets first.

---

## Step 13: Our Learning Path - Servlets First, Then Spring

**"Now question arises how do we create servlet."**

### The Pedagogical Approach

**"So as I mentioned, even if you're using spring MVC or spring web it is using servlet behind the scene."**

**Why Learn Servlets First?**

**Analogy:**

Learning Spring MVC without servlets is like:
- Learning to drive an automatic car without understanding what an engine does
- Using a smartphone without knowing what an operating system is
- Using Django without knowing Python

**You can do it, but you won't understand what's happening under the hood!**

**"So we'll not directly start with Spring Boot MVC. We are going to first start with the servlet and then we'll move towards spring."**

### The Learning Journey

**Phase 1: Pure Servlets (Understanding Foundations)**

```
Documents 44-46:
├── What is a servlet?
├── HttpServlet class
├── doGet() and doPost() methods
├── HttpServletRequest and HttpServletResponse
├── Deploying on Tomcat
└── Servlet lifecycle
```

**Phase 2: Spring MVC (Simplified Development)**

```
Documents 47-50:
├── @Controller and @RestController
├── @RequestMapping, @GetMapping
├── Path variables and request parameters
├── JSON conversion (@ResponseBody)
└── Spring Boot embedded Tomcat
```

**Phase 3: Advanced Topics**

```
Documents 51+:
├── Form handling
├── File uploads
├── Exception handling
├── Validation
└── RESTful API design
```

### The Progression

**Where We're Going:**

**1. Pure Servlet (Document 44):**

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        resp.getWriter().write("Hello World");
    }
}
```

**2. Spring MVC (Document 47+):**

```java
@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello World";
    }
}
```

**3. Complete REST API (Document 50+):**

```java
@RestController
@RequestMapping("/api/students")
public class StudentController {
    
    @Autowired
    private StudentService service;
    
    @GetMapping
    public List<Student> getAllStudents() {
        return service.getStudents();
    }
    
    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return service.addStudent(student);
    }
    
    @GetMapping("/{id}")
    public Student getStudent(@PathVariable int id) {
        return service.getStudent(id);
    }
}
```

**By understanding servlets first, you'll appreciate Spring's abstractions!**

---

## Key Concepts Summary

### 1. Web Applications

**Purpose:** Applications accessed via web browsers or HTTP clients.

**Types:**
- **Static:** HTML/CSS/JS files (same for everyone)
- **Dynamic:** Server-generated content (personalized per user)

**Why Popular:**
- No installation required
- Cross-platform
- Accessible anywhere
- Easy updates

### 2. Client-Server Architecture

**Model:**

```
Multiple Clients (Browser, Mobile, Desktop)
            ↓
    One Backend Server
            ↓
        Database
```

**Benefits:**
- Write backend once
- Serve multiple client types
- Centralized business logic
- Consistent data

### 3. JSON Format

**Purpose:** Universal data exchange format.

**Characteristics:**
- Human-readable
- Language-agnostic
- Lightweight
- Standard

**Usage:**
- Server → Client (responses)
- Client → Server (requests)

### 4. Servlets

**Definition:** Java classes that handle HTTP requests and responses.

**Responsibilities:**
- Accept requests
- Process requests
- Send responses

**Lifecycle:**
- Created by servlet container
- Initialized once
- Services multiple requests
- Destroyed on shutdown

### 5. Servlet Container (Tomcat)

**Purpose:** Runtime environment for servlets.

**Provides:**
- HTTP server functionality
- Request parsing
- Servlet lifecycle management
- Thread management
- Security

**Popular Containers:**
- Apache Tomcat (most popular)
- Jetty
- WildFly

### 6. Spring and Servlets

**Relationship:**
- Spring builds ON TOP of servlets
- Spring simplifies servlet development
- Spring's DispatcherServlet handles routing
- Spring hides servlet complexity

**Progression:**
- Servlets = Foundation
- Spring MVC = Abstraction layer
- Learn servlets first for understanding!

---

## What's Coming Next

In the next video (Document 44), we'll:

✅ **Create our first servlet** from scratch
✅ **Understand HttpServlet class** and its methods
✅ **Learn doGet() and doPost()** methods
✅ **Work with request and response objects**
✅ **Deploy on Tomcat** and access from browser
✅ **See the complete request-response cycle** in action

**We're moving from console applications to web applications!**

---

## Conclusion: The Foundation of Modern Web Development

This was a conceptual overview—no code yet! But we've laid critical groundwork:

✅ **Understood Spring's ecosystem** (umbrella of projects)
✅ **Learned why web apps dominate** (accessibility, updates, cross-platform)
✅ **Grasped client-server architecture** (multiple clients, one backend)
✅ **Discovered JSON's role** (universal data format)
✅ **Understood what servlets are** (Java's web components)
✅ **Learned about servlet containers** (Tomcat provides runtime)
✅ **Saw Spring's relationship with servlets** (builds on top)
✅ **Established learning path** (servlets first, then Spring MVC)

**Key Insight:**

**"So as I mentioned, even if you're using spring MVC or spring web it is using servlet behind the scene."**

Understanding servlets = Understanding how Spring MVC actually works!

**Next Step:** Let's create our first servlet and enter the world of web development! 🌐🚀
