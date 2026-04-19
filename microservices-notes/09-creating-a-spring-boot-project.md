# Creating a Spring Boot Project

## Introduction

Time to get hands dirty! In this lecture, we move from theory to practice by creating our first microservice — the **Accounts** microservice for the EasyBank application. You'll see just how fast Spring Boot lets you bootstrap a production-ready project.

---

## Concept 1: Spring Initializr — Project Generator

### 🧠 What is it?

**Spring Initializr** (https://start.spring.io) is a web-based tool that generates Spring Boot project skeletons. Instead of manually creating folder structures, writing POM files, and configuring dependencies — you just fill in a form and click "Generate."

### ⚙️ Project Configuration

Here are the settings for our Accounts microservice:

| Setting | Value | Why |
|---------|-------|-----|
| **Build Tool** | Maven | Industry standard for Java dependency management |
| **Language** | Java | Our target language for microservices |
| **Spring Boot Version** | Latest stable (3.x) | Always use the latest stable release |
| **Group** | `com.eazybytes` | Organization identifier |
| **Artifact** | `accounts` | The microservice name |
| **Package Name** | `com.eazybytes.accounts` | Auto-generated from group + artifact |
| **Packaging** | JAR | Fat JAR for microservices (not WAR) |
| **Java Version** | 17+ | LTS version; minimum for Spring Boot 3.x |

### ⚠️ Important Version Notes

- **Spring Boot 3.x requires Java 17 minimum** — Java 8 or 11 won't work
- If you must use Java 8 or 11, you'll need Spring Boot 2.7.x (not recommended)
- Always select the **latest stable** Spring Boot version

---

## Concept 2: Dependencies — What Our Microservice Needs

### 🧠 The Six Essential Dependencies

Each dependency is a **starter project** — a curated bundle that brings in everything you need for a specific capability:

### 1. Spring Web
```
What: Libraries for building web applications and REST APIs
Includes: REST support, Spring MVC, embedded Apache Tomcat
Why: We're building REST-based microservices
```

### 2. H2 Database
```
What: In-memory database that requires zero installation
Why: Quick prototyping without setting up MySQL/PostgreSQL
Note: We'll switch to MySQL later when we add Docker
```

### 3. Spring Data JPA
```
What: Framework for database interaction (CRUD operations)
Includes: Hibernate, JPA libraries
Why: We need to store and retrieve data from the database
```

### 4. Spring Boot Actuator
```
What: Production monitoring and management endpoints
Provides: Health checks, metrics, application info
Why: Microservices need built-in monitoring — no custom code required
```

### 5. Spring Boot DevTools
```
What: Developer productivity tools
Provides: Auto-restart on code changes, live reload
Why: Eliminates manual server restarts during development
```

⚠️ **Note**: DevTools only works in local development. Spring Boot automatically disables it in production — the framework is smart about this.

### 6. Lombok
```
What: Annotation library that reduces boilerplate code
Eliminates: Manual getter/setter methods in POJO classes
Why: Cleaner, more readable code
```

### 7. Validation
```
What: Input validation framework
Why: We committed to validating incoming requests as a best practice
```

---

## Concept 3: Project Setup Steps

### ⚙️ Step-by-Step

1. **Generate** the project from start.spring.io → Downloads a ZIP file
2. **Extract** the ZIP to your workspace folder
3. **Open** in IntelliJ IDEA (or your preferred IDE)
4. **Load Maven** when prompted — this recognizes it as a Maven project
5. **Enable annotation processing** — required for Lombok to work

### 🧪 What You Get

After extraction, the project structure looks like:

```
accounts/
├── src/
│   ├── main/
│   │   ├── java/com/eazybytes/accounts/
│   │   │   └── AccountsApplication.java      ← Main class
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml                                     ← Dependencies
└── mvnw                                        ← Maven wrapper
```

### The Main Class

```java
@SpringBootApplication
public class AccountsApplication {
    public static void main(String[] args) {
        SpringApplication.run(AccountsApplication.class, args);
    }
}
```

The `@SpringBootApplication` annotation is a **combination** of three annotations:
- `@EnableAutoConfiguration` — Configure beans automatically based on classpath
- `@SpringBootConfiguration` — Mark this as a configuration class
- `@ComponentScan` — Scan for Spring beans in this package and sub-packages

---

## ✅ Key Takeaways

- **start.spring.io** is the fastest way to bootstrap a Spring Boot project
- Use **JAR packaging** for microservices (not WAR) — fat JARs include the embedded server
- Spring Boot 3.x requires **Java 17 minimum**
- Starter dependencies are curated bundles — one starter gives you everything for a capability
- DevTools is dev-only; Spring Boot auto-disables it in production
- Always enable **annotation processing** in your IDE for Lombok support

---

## 💡 Pro Tips

- Follow the same naming conventions as the course — it makes comparing code and debugging much easier
- Use the Community (free) edition of IntelliJ — it has everything you need
- Don't install MySQL yet — H2 is perfect for learning. We'll switch to MySQL when we containerize with Docker
- Check the Maven tab in your IDE to confirm dependencies loaded correctly
