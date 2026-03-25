# 🚀 Document 49: Creating Spring Boot Web Application with Spring Initializr

## Introduction: From Servlets to Spring Boot

We've completed a comprehensive journey:

**Documents 44-47: Pure Servlets**
- Created HelloServlet manually
- Registered with embedded Tomcat
- Mapped URLs programmatically
- Sent HTTP responses with PrintWriter

**Document 48: MVC Architecture**
- Model-View-Controller pattern
- Servlet = Controller
- JSP = View
- POJO = Model

**Now: Spring Boot Web!** 🎉

**"Now let's see how do we create a web application with the help of spring. So of course we have talked about MVC. So we have to build a MVC project with the help of Spring Framework."**

Today we'll:

1. **Compare two approaches** (Spring Framework vs Spring Boot)
2. **Use Spring Initializr** (project generator)
3. **Configure Spring Boot project** (Maven, dependencies)
4. **Understand embedded Tomcat** (why JAR packaging works)
5. **Download and setup project** (IntelliJ setup)
6. **Examine project structure** (pom.xml, main class)
7. **Run the application** (embedded Tomcat starts automatically)
8. **Test in browser** (404 is expected—no pages yet!)
9. **Prepare for controllers** (next steps)

This is the **transition video**—from manual servlet configuration to Spring Boot magic!

---

## Two Approaches: Spring Framework vs Spring Boot

**"And the beauty is there are two ways of doing it. One is using normal spring framework. And second with the help of Spring Boot."**

### Option 1: Spring Framework (Traditional)

**What you need:**
- Configure DispatcherServlet manually
- Create XML or Java configuration
- Set up view resolver
- Configure component scanning
- Deploy to external Tomcat
- WAR packaging

**Configuration example (Spring MVC):**

```java
// WebMvcConfigurer
@Configuration
@EnableWebMvc
@ComponentScan("com.telusko")
public class WebConfig implements WebMvcConfigurer {
    
    @Bean
    public ViewResolver viewResolver() {
        InternalResourceViewResolver resolver = new InternalResourceViewResolver();
        resolver.setPrefix("/WEB-INF/views/");
        resolver.setSuffix(".jsp");
        return resolver;
    }
}

// WebApplicationInitializer
public class WebAppInitializer implements WebApplicationInitializer {
    
    public void onStartup(ServletContext servletContext) {
        AnnotationConfigWebApplicationContext context = new AnnotationConfigWebApplicationContext();
        context.register(WebConfig.class);
        
        ServletRegistration.Dynamic dispatcher = servletContext.addServlet(
            "dispatcher", new DispatcherServlet(context)
        );
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }
}
```

**Lots of configuration!** 😰

### Option 2: Spring Boot (Modern)

**What you need:**
- Just add spring-boot-starter-web dependency
- Create @Controller classes
- Run main() method
- **That's it!** ✅

**"And we know till this point that if you want to do something with Spring Boot, it is much easier. And if you want to do something with Spring Framework, you have to do some configuration."**

**Spring Boot equivalent:**

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello World";
    }
}
```

**That's the entire configuration!** 🎉

### The Learning Path

**"So start with Spring Boot. Let's understand the concept. How do you how do you build a web application using Spring Boot. And then once once you understand enough then we'll see. How do we create a same project with the help of normal spring MVC."**

**Strategy:**

```
1. Learn Spring Boot first (easy, quick feedback)
        ↓
2. Understand the concepts (controllers, mappings, views)
        ↓
3. Then learn Spring MVC (see all the configuration)
        ↓
4. Appreciate Spring Boot's magic!
```

**"And then you can see the difference that how much configuration we can save with the help of Spring Boot."**

**Perfect teaching approach!** Start easy, then show the hard way to appreciate the abstraction.

---

## Creating Project with Spring Initializr

**"Now question arise if you want to create a spring boot project how will do it? It's very simple. You go to your start.spring.io, which is your initializer."**

### Three Ways to Create Spring Boot Projects

**"Or if you are using eclipse with the spring tools, or if you're using IntelliJ ultimate version. In that case, you will get the option directly in your IDE."**

**Option 1: Spring Initializr Website**
- URL: https://start.spring.io
- Web-based, always available
- **Our approach** (works with Community Edition)

**Option 2: IntelliJ IDEA Ultimate**
- File → New → Project → Spring Initializr
- Built-in wizard
- Requires paid version

**Option 3: Eclipse (STS - Spring Tool Suite)**
- File → New → Spring Starter Project
- Free plugin
- Good Eclipse integration

**"But since we are using the community version of IntelliJ, which is a free one, we don't have that option directly in the IDE. And that's why we can use the initializer, which is actually a good thing to do."**

**Advantage of Web Initializr:**
- ✅ Works with any IDE
- ✅ Always up-to-date
- ✅ No plugin installation
- ✅ Clear visual interface

**"So let's go to the initializer."**

---

## Configuring the Project

**"And here I will create a project."**

### Project Settings

### 1. Project Type

**"Now what kind of project I want I want a maven project. So I will select that."**

**Options:**
- **Maven Project** ✅ (XML-based dependency management)
- **Gradle - Groovy** (Groovy DSL)
- **Gradle - Kotlin** (Kotlin DSL)

**Why Maven?**
- Most widely used
- Industry standard
- Simple XML configuration
- We've used it before (familiar pom.xml)

### 2. Language

**"The language is Java."**

**Options:**
- **Java** ✅ (our choice)
- Kotlin (JVM language, concise syntax)
- Groovy (dynamic JVM language)

### 3. Spring Boot Version

**"Then in the spring boot I have to mention a version. So I will go for 3.2."**

**Available Versions:**
```
3.3.x (SNAPSHOT) - Bleeding edge, unstable
3.2.x (GA) - ✅ Latest stable (General Availability)
3.1.x - Previous stable
3.0.x - Older stable
2.7.x - Legacy support
```

**Choose GA (General Availability)** for production-ready features!

**GA = General Availability** (stable, tested, recommended)

### 4. Project Metadata

**"And here I will mention the group ID as the telescope."**

**Group ID:** `com.telusko`
- Company/organization domain (reversed)
- Follows Java package naming convention

**"And we are making our first spring boot project. So I will say Spring Boot web one for the first project."**

**Artifact ID:** `spring-boot-web1`
- Project name
- Becomes JAR/WAR filename

**Generated Package Name:** `com.telusko.springbootweb1`
- Combination of group + artifact
- Base package for your code

### 5. Packaging

**"And then the packaging for this is Jar."**

**Options:**
- **Jar** ✅ (Java Archive - self-contained)
- War (Web Archive - for external Tomcat)

**"Now this is interesting. Why do we have a packaging there?"**

This deserves deep explanation!

---

## Understanding JAR vs WAR Packaging

### Traditional Web Application (WAR)

**"See, a thing is when you talk about web application this works on some server right. We have to use Tomcat or something. And when you want to deploy your project on Tomcat we normally create a Jar file."**

(Instructor says "Jar" but means "War")

**WAR = Web Archive**

**"Now what file stands for Web Archive."**

**Structure:**
```
myapp.war
├── WEB-INF/
│   ├── web.xml (deployment descriptor)
│   ├── classes/ (compiled Java classes)
│   └── lib/ (dependency JARs)
├── META-INF/
└── index.html, CSS, JS files
```

**Deployment:**

```
1. Create WAR file (mvn package)
2. Install external Tomcat
3. Copy WAR to tomcat/webapps/
4. Start Tomcat
5. Tomcat deploys WAR
6. Application runs
```

**"So you take a file, you put that on Tomcat and you can make it run."**

### Modern Approach (JAR with Embedded Server)

**"But we can also use a jar. But then question arises how will you run this on Tomcat. We'll see that in some time okay."**

**JAR = Java Archive**

**With Spring Boot:**

```
myapp.jar
├── BOOT-INF/
│   ├── classes/ (your compiled code)
│   ├── lib/ (dependencies including tomcat-embed-core!)
│   └── classpath.idx
├── META-INF/
│   └── MANIFEST.MF (main class defined)
└── org/springframework/boot/loader/ (Spring Boot loader)
```

**Embedded Tomcat Inside!**

**Execution:**

```bash
java -jar myapp.jar
    ↓
Spring Boot starts
    ↓
Embedded Tomcat starts (included in JAR!)
    ↓
Application deploys automatically
    ↓
Server running on port 8080
```

**"We'll see that in some time okay."**

### Comparison

| Feature | WAR (Traditional) | JAR (Spring Boot) |
|---------|------------------|-------------------|
| Server | External Tomcat required | Embedded Tomcat included |
| Setup | Install Tomcat separately | Just run the JAR |
| Deployment | Copy to webapps/ | `java -jar app.jar` |
| Portability | Needs Tomcat installed | Runs anywhere with Java |
| Packaging | War file | Jar file (fatter) |

**Spring Boot Default: JAR** (easier, self-contained)

### 6. Java Version

**"And then we'll say Java version I'm using Java 21 so I will use that."**

**Available Options:**
- Java 21 ✅ (latest LTS - Long-Term Support)
- Java 17 (previous LTS)
- Java 11 (older LTS)
- Java 8 (very old, legacy)

**Match with your installed Java version!**

```bash
java --version
# java 21.0.1 2023-10-17 LTS
```

---

## Adding Dependencies

**"Now what kind of dependency I want to add just one. So click on Add Dependency and say I want to create a web project."**

### Searching for Dependencies

**"Now when you search for web you will see an option of spring web there."**

**Spring Initializr Dependency Search:**
- Type "web" in search box
- Shows matching dependencies
- Each with description

### Available Web Options

**Option 1: Spring Web** ✅

**"And for RESTful APIs you can use Spring Web."**

**Description:** Build web, including RESTful, applications using Spring MVC. Uses Apache Tomcat as the default embedded container.

**Includes:**
- Spring MVC framework
- RESTful API support
- Embedded Tomcat
- Jackson (JSON serialization)
- Validation support

**Use for:**
- REST APIs
- Traditional MVC applications
- Server-side rendering

**Option 2: Spring Reactive Web**

**"Apart from this we also have an option of Spring Reactive web. So if you want to do reactive programming in Java you can do that. So for that we have a framework called Web Flux."**

**Description:** Build reactive web applications with Spring WebFlux and Netty.

**Includes:**
- Spring WebFlux (reactive framework)
- Embedded Netty (not Tomcat!)
- Reactive streams
- Non-blocking I/O

**Use for:**
- High-concurrency applications
- Streaming data
- Reactive programming model

**Comparison:**

| Feature | Spring Web | Spring Reactive Web |
|---------|------------|---------------------|
| Model | Blocking (thread per request) | Non-blocking (reactive) |
| Server | Tomcat | Netty |
| Programming | Imperative (traditional) | Reactive (functional) |
| Learning Curve | Easy | Advanced |
| Use Case | Most applications | High concurrency |

**"Again we'll discuss RESTful API later. But if you want to do that you can use a web here."**

We'll use **Spring Web** (traditional, easier to learn).

### View Technology Option

**"Now the engine I was talking about, the theme leaf is one of the engine, which is one of the view technology. So if you don't want to use JSP you can also use them live there."**

**Thymeleaf Dependency** (optional):

**Description:** A modern server-side Java template engine for web and standalone environments.

**Features:**
- Natural templating (valid HTML)
- Works without server (preview in browser)
- Spring integration
- Modern alternative to JSP

**Example:**
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Student</title>
</head>
<body>
    <h1 th:text="${student.name}">Student Name</h1>
    <p th:text="${student.marks}">Marks</p>
</body>
</html>
```

**For now:** We'll skip Thymeleaf (can add later if needed).

**"So we'll select a spring web here. That's the only dependency we need."**

---

## Understanding Embedded Tomcat

**"And once you do that we can click on generate. But if you see this line it says something here which is interesting. It says uses a Apache Tomcat as a default embedded container."**

### The Key Insight

**"Remember when we talked about web applications? To run this you have to use a Tomcat or some server. So basically you have to externally you have to create a server. And then you have to run them and put your project inside it."**

**Traditional Approach:**

```
1. Install Tomcat separately
    ↓
2. Configure Tomcat (ports, directories)
    ↓
3. Build WAR file
    ↓
4. Deploy to Tomcat (copy to webapps/)
    ↓
5. Start Tomcat
    ↓
6. Access application
```

**Multiple steps, complex setup!**

### Spring Boot's Magic

**"Otherwise we can use embedded Tomcat. In fact we have done that in summit as well."**

(Referring to Document 44-47 where we used embedded Tomcat manually)

**"So Spring Boot says we will be having a embedded Tomcat inside the project. That means when you run this project, you already have a Tomcat there."**

**Spring Boot Approach:**

```
1. Run main() method
    ↓
Spring Boot starts embedded Tomcat automatically
    ↓
Application deployed automatically
    ↓
Server running!
```

**One step!** Just run the application!

### Why This Allows JAR Packaging

**"And that's why we can run a packaging as jar because we have a Tomcat installed inside the project."**

**The Connection:**

```
Embedded Tomcat in JAR
    ↓
No external Tomcat needed
    ↓
Self-contained JAR
    ↓
java -jar app.jar (it just works!)
```

**Benefits:**

✅ **No installation needed** (just Java)
✅ **Portable** (run anywhere)
✅ **Version control** (Tomcat version in pom.xml)
✅ **Consistent environments** (dev = prod)
✅ **Simplified deployment** (one file to deploy)

---

## Generating and Downloading Project

**"Okay, so click on generate. It will give you the project."**

### What Happens

**Browser downloads:** `spring-boot-web1.zip`

**Contents:**
```
spring-boot-web1.zip
└── spring-boot-web1/
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   └── com/telusko/springbootweb1/
    │   │   │       └── Application.java
    │   │   └── resources/
    │   │       ├── application.properties
    │   │       ├── static/
    │   │       └── templates/
    │   └── test/
    │       └── java/
    ├── pom.xml
    ├── mvnw (Maven wrapper - Unix)
    ├── mvnw.cmd (Maven wrapper - Windows)
    └── .gitignore
```

**"The only thing you have to do is you have to unzip it. So unzipping done."**

### Opening in IntelliJ

**"Let me open the project in my IntelliJ Idea okay."**

**Steps:**

1. **Unzip** the downloaded file
2. **File → Open** in IntelliJ
3. **Navigate to** unzipped folder
4. **Select folder** (containing pom.xml)
5. **Open as Project**
6. **Wait** for Maven to download dependencies

**"So I got this project which is in download folder. Doesn't matter."**

Location doesn't matter—IntelliJ works with any folder!

---

## Examining the Project Structure

**"So basically we got this project which is your spring boot web."**

### Project Files

```
spring-boot-web1/
├── .idea/ (IntelliJ settings)
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com.telusko.springbootweb1/
│   │   │       └── Application.java ← Main class
│   │   └── resources/
│   │       ├── application.properties ← Configuration
│   │       ├── static/ (CSS, JS, images)
│   │       └── templates/ (HTML templates)
│   └── test/
│       └── java/ (Test classes)
├── target/ (Compiled classes)
├── pom.xml ← Dependencies
└── README.md
```

### The Main Class (Application.java)

```java
package com.telusko.springbootweb1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**@SpringBootApplication** = Magic annotation!
- Enables auto-configuration
- Enables component scanning
- Marks as configuration class

**SpringApplication.run()** = Starts everything!
- Creates ApplicationContext
- Scans for beans
- Starts embedded Tomcat
- Deploys application

---

## Examining pom.xml

**"And if you see in the Pom file, uh, so make sure that you have the same configuration we are, we got spring boot starter web. This is the dependency which we need. And the version is 3.2. As I mentioned before."**

### The pom.xml File

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    
    <modelVersion>4.0.0</modelVersion>
    
    <!-- Spring Boot Parent (manages versions) -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <!-- Project Metadata -->
    <groupId>com.telusko</groupId>
    <artifactId>spring-boot-web1</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>spring-boot-web1</name>
    <description>First Spring Boot Web Project</description>
    
    <!-- Java Version -->
    <properties>
        <java.version>21</java.version>
    </properties>
    
    <!-- Dependencies -->
    <dependencies>
        <!-- Spring Web (includes Tomcat) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- Testing Support -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <!-- Build Plugin -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
    
</project>
```

### Key Dependencies

**spring-boot-starter-web** includes:

```
spring-boot-starter-web
├── spring-boot-starter (core)
├── spring-boot-starter-tomcat (embedded Tomcat!)
├── spring-webmvc (Spring MVC)
├── spring-web (web utilities)
├── jackson-databind (JSON support)
└── validation-api (validation)
```

**One dependency, many capabilities!**

**spring-boot-starter-parent** provides:
- Default dependency versions
- Maven plugins configuration
- Resource filtering
- Plugin management

**spring-boot-maven-plugin** enables:
- `mvn spring-boot:run` (run from Maven)
- `mvn package` (creates executable JAR)
- Repackaging with embedded dependencies

---

## Examining External Libraries

**"If you expand your external libraries you will see certain files here which is Apache Tomcat which is embedded, and multiple things which we don't need at this point. But we got our project now."**

### Maven Dependencies Downloaded

**External Libraries (expanded):**

```
External Libraries
├── Maven: org.springframework.boot:spring-boot-starter-web:3.2.0
├── Maven: org.springframework.boot:spring-boot:3.2.0
├── Maven: org.springframework:spring-core:6.1.0
├── Maven: org.springframework:spring-context:6.1.0
├── Maven: org.springframework:spring-webmvc:6.1.0
├── Maven: org.apache.tomcat.embed:tomcat-embed-core:10.1.16 ← Embedded Tomcat!
├── Maven: org.apache.tomcat.embed:tomcat-embed-el:10.1.16
├── Maven: org.apache.tomcat.embed:tomcat-embed-websocket:10.1.16
├── Maven: com.fasterxml.jackson.core:jackson-databind:2.15.3 ← JSON
└── ... many more
```

**Notice:** `tomcat-embed-core` is there!

This is the embedded Tomcat that will run our application.

**"And multiple things which we don't need at this point."**

Don't worry about all libraries now—Spring Boot manages them!

---

## First Run: Testing the Application

**"Will this project works? That was that's what I want to see."**

### Attempting Browser Access (Before Running)

**"So what I will do is I will open my browser okay. So in this browser I will search for uh, so when you run this project basically you can access this on localhost 8080."**

**URL:** `http://localhost:8080`

**"So by default the Tomcat will have a port number 8080. So I will say enter."**

**Browser Error:**

```
Safari cannot connect to the server
```

**"And you can see we got an error. It says Safari cannot find cannot cannot connect to the server. You know why. Because we got the project but we are not running it."**

**The Issue:**

```
Browser → localhost:8080
        ↓
No server listening! ❌
        ↓
Connection refused
```

**We haven't started the application yet!**

---

## Running the Spring Boot Application

**"So let's run this now. So right click here and say. Okay. Don't see the run option. Let me open my main file. Right click run."**

### Two Ways to Run

**Option 1: Right-click package → Run** (sometimes visible)

**Option 2: Open Application.java → Right-click → Run** ✅

**Or:** Click the green play button next to main() method

### Starting the Application

**"Okay, taking some time, but it should run."**

**Console Output:**

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

2023-12-20T14:30:15.234  INFO 12345 --- [main] c.t.s.Application : Starting Application
2023-12-20T14:30:15.237  INFO 12345 --- [main] c.t.s.Application : No active profile set
2023-12-20T14:30:16.123  INFO 12345 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer : Tomcat initialized with port 8080 (http)
2023-12-20T14:30:16.134  INFO 12345 --- [main] o.apache.catalina.core.StandardService  : Starting service [Tomcat]
2023-12-20T14:30:16.135  INFO 12345 --- [main] o.apache.catalina.core.StandardEngine   : Starting Servlet engine: [Apache Tomcat/10.1.16]
2023-12-20T14:30:16.234  INFO 12345 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer : Tomcat started on port 8080 (http)
2023-12-20T14:30:16.242  INFO 12345 --- [main] c.t.s.Application : Started Application in 1.234 seconds
```

**"So if you scroll down you can see it says the Tomcat has started."**

### Key Log Messages

**Important Lines:**

```
Tomcat initialized with port 8080 (http)
    ↓
Tomcat starting...
    ↓
Starting Servlet engine: [Apache Tomcat/10.1.16]
    ↓
Tomcat started on port 8080 (http) ← Success!
    ↓
Started Application in 1.234 seconds
```

**"So Tomcat which is a embedded tomcat here started on port number 8080. That means now we have a server up and running."**

✅ **Server is running!**
✅ **Embedded Tomcat active**
✅ **Listening on port 8080**

---

## Testing in Browser: 404 is Expected!

**"Let's go back to the browser and say refresh now."**

### Browser Response (After Starting)

**URL:** `http://localhost:8080`

**Browser Display:**

```
Whitelabel Error Page

This application has no explicit mapping for /error, so you are seeing this as a fallback.

Wed Dec 20 14:30:45 UTC 2023
There was an unexpected error (type=Not Found, status=404).
```

**"And you can see this time we got a different error. It's not like Safari is not able to connect to the server. It's now able to connect."**

### Understanding the Progress

**Before Running:**
```
Connection Refused
(No server listening)
```

**After Running:**
```
404 Not Found
(Server running, but no page at /)
```

**This is PROGRESS!** 🎉

**"But then it still says four, not four is because it is sending a request to the home page and there is no home page."**

### Why 404 is Normal

**Browser requests:** `GET /`

**Spring Boot checks:**
```
Do we have a controller for "/" ?
    ↓
No controller found!
    ↓
No static file at src/main/resources/static/index.html
    ↓
Return: 404 Not Found
```

**We haven't created any controllers yet!**

**"So this is a simple project which we got from the spring initializer, and we have done nothing till now. So we don't have a home page."**

### What We Have

```
✅ Spring Boot application (working)
✅ Embedded Tomcat (running)
✅ Server listening (port 8080)
✅ Request handling (returning 404)

❌ No controllers (nothing to display)
❌ No static pages (no index.html)
❌ No mappings (no URLs configured)
```

**We need to add content!**

---

## Next Steps: Creating Controllers

**"How do we get the home page? How do you create something? Where or how do you create a controller? Remember in MVC we talked about controller."**

### What We Need

**"So we have to create a servlet which will accept the request. But do we use servlet in Spring Boot. Let's see that in the next video."**

**The Questions:**

**1. How to create controllers in Spring Boot?**
- Do we use `extends HttpServlet`? (No!)
- What annotation? (@Controller, @RestController)
- Where to create? (in main package)

**2. How to map URLs?**
- Do we use `addServletMapping()`? (No!)
- What annotation? (@RequestMapping, @GetMapping)
- How to specify URL pattern?

**3. How to return responses?**
- Do we use `response.getWriter()`? (No!)
- Just return String? (Yes!)
- What about views? (Return view name)

**Spring Boot simplifies everything!**

---

## Complete Project Structure Summary

### Folder Structure

```
spring-boot-web1/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com.telusko.springbootweb1/
│   │   │       └── Application.java ← Main class
│   │   │
│   │   └── resources/
│   │       ├── application.properties ← Config
│   │       ├── static/ ← CSS, JS, images
│   │       ├── templates/ ← HTML templates
│   │       └── public/ ← Public static files
│   │
│   └── test/
│       └── java/ ← Test classes
│
├── target/ ← Compiled output
├── pom.xml ← Dependencies
└── mvnw, mvnw.cmd ← Maven wrapper
```

### Key Files

**pom.xml:**
- Project configuration
- Dependencies (spring-boot-starter-web)
- Build plugins

**Application.java:**
- Main class with @SpringBootApplication
- Entry point (main method)
- Starts Spring Boot

**application.properties:**
- Configuration settings (empty for now)
- Can set port, database, logging, etc.

**static/ folder:**
- CSS files
- JavaScript files
- Images
- Served directly (no controller needed)

**templates/ folder:**
- Thymeleaf templates (if using Thymeleaf)
- JSP files (if using JSP)
- View templates

---

## Key Concepts Summary

### 1. Spring Boot vs Spring Framework

**Spring Framework:**
- Manual configuration
- XML or Java config required
- External Tomcat deployment
- WAR packaging
- More control, more complexity

**Spring Boot:**
- Auto-configuration
- Convention over configuration
- Embedded Tomcat included
- JAR packaging (self-contained)
- Less code, faster development

### 2. Spring Initializr

**Web Tool:** https://start.spring.io

**Purpose:**
- Generate Spring Boot project structure
- Select dependencies
- Configure project metadata
- Download ready-to-use project

**Advantages:**
- Quick start (seconds!)
- Consistent structure
- No manual setup
- Latest versions

### 3. Embedded Tomcat

**Included in:** spring-boot-starter-web

**Benefits:**
- No external installation
- Version controlled (in pom.xml)
- Portable (runs anywhere with Java)
- Simplified deployment (java -jar)

**How it works:**
- Tomcat libraries in JAR
- Spring Boot starts Tomcat programmatically
- Application deploys automatically
- Server ready in seconds

### 4. JAR vs WAR Packaging

**JAR (Spring Boot default):**
```bash
java -jar app.jar  # Runs immediately!
```
- Self-contained executable
- Embedded Tomcat inside
- Portable, easy to deploy

**WAR (Traditional):**
```bash
# Need external Tomcat
cp app.war tomcat/webapps/
./tomcat/bin/startup.sh
```
- Requires external server
- Traditional deployment
- More steps

### 5. Project Structure

**Standard Spring Boot Layout:**
```
src/main/java/ - Java source code
src/main/resources/ - Configuration, templates
src/test/java/ - Test code
pom.xml - Maven configuration
```

**Convention over configuration!**

### 6. The Main Class

```java
@SpringBootApplication  // Magic annotation!
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**This single class:**
- Enables auto-configuration
- Scans for components
- Starts embedded Tomcat
- Deploys application

**One method call starts everything!**

### 7. 404 is Expected (Initially)

**When you first run:**
- Server starts ✅
- No controllers yet ❌
- Request to / returns 404 ✅

**This is normal!** We haven't added any content yet.

---

## Comparison: Pure Servlets vs Spring Boot

### What We Did in Documents 44-47 (Pure Servlets)

```java
// Create Tomcat
Tomcat tomcat = new Tomcat();

// Create context
Context context = tomcat.addContext("", null);

// Register servlet
HelloServlet servlet = new HelloServlet();
Tomcat.addServlet(context, "HelloServlet", servlet);

// Map URL
context.addServletMapping("/hello", "HelloServlet");

// Start Tomcat
tomcat.start();
tomcat.getServer().await();

// Create servlet class
public class HelloServlet extends HttpServlet {
    public void doGet(HttpServletRequest request, 
                     HttpServletResponse response) throws IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<h1>Hello World</h1>");
    }
}
```

**30+ lines of setup code!**

### What We'll Do in Next Video (Spring Boot)

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello World";
    }
}
```

**10 lines total, 5 for controller!** 🎉

**Spring Boot handles:**
- ✅ Tomcat creation
- ✅ Context setup
- ✅ Servlet registration
- ✅ URL mapping
- ✅ Request handling
- ✅ Response generation

**We just write business logic!**

---

## Common First-Time Issues

### Error 1: Port 8080 Already in Use

**Error:**
```
***************************
APPLICATION FAILED TO START
***************************

Description:
Web server failed to start. Port 8080 was already in use.
```

**Cause:** Another application using port 8080.

**Solution 1:** Stop other application

**Solution 2:** Change port in application.properties
```properties
server.port=8081
```

### Error 2: Maven Dependencies Not Downloaded

**Symptom:** Red underlines in code, classes not found

**Cause:** IntelliJ hasn't downloaded dependencies

**Solution:**
1. Right-click project → Maven → Reload Project
2. Or: Click the Maven icon in right sidebar → Reload

### Error 3: Wrong Java Version

**Error:**
```
java.lang.UnsupportedClassVersionError: ... has been compiled by a more recent version of the Java Runtime
```

**Cause:** Code compiled with Java 21, running with Java 11

**Solution:** Update Java installation or change pom.xml:
```xml
<properties>
    <java.version>17</java.version>
</properties>
```

### Error 4: Application Not Stopping

**Symptom:** Can't restart, port still in use

**Solution:**
- Click red stop button in IntelliJ
- Or: Terminal → Ctrl+C
- Or: `kill -9 <process-id>`

---

## What We've Accomplished

### Setup Complete! 🎉

✅ **Created Spring Boot project** (via Spring Initializr)
✅ **Configured project** (Maven, Java 21, Spring Web)
✅ **Understood embedded Tomcat** (included in JAR)
✅ **Downloaded and opened project** (IntelliJ setup)
✅ **Examined pom.xml** (dependencies configured)
✅ **Ran application** (server started successfully)
✅ **Tested in browser** (404 is expected—no controllers yet)
✅ **Ready for next step** (create controllers!)

### The Foundation

**We now have:**
- Working Spring Boot application
- Embedded Tomcat running
- Port 8080 listening
- Ready to add controllers

**Next:** Create @Controller classes and handle requests!

---

## Conclusion: From Manual to Automatic

**The Journey:**

```
Documents 44-47: Pure Servlets
├── Manual Tomcat setup
├── Manual servlet registration
├── Manual URL mapping
└── Manual response handling
        ↓
Document 48: MVC Concepts
├── Model-View-Controller pattern
├── Separation of concerns
└── Architecture principles
        ↓
Document 49: Spring Boot Setup ← Today!
├── Spring Initializr
├── Embedded Tomcat (automatic!)
├── Auto-configuration
└── Ready to code
        ↓
Next: Spring Boot Controllers
├── @RestController annotation
├── @GetMapping for URLs
└── Return data easily
```

**From 30 lines of setup → 1 line:** `SpringApplication.run()`

**This is the power of Spring Boot!** 🚀

We've set up the project, the server is running, and we're ready to create our first Spring Boot controller. Next video will show how simple Spring Boot makes web development compared to pure servlets!

The foundation is solid—let's build our first Spring Boot web endpoint! 🎯

