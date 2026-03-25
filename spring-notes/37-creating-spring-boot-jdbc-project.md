# 🚀 Document 37: Creating Spring Boot JDBC Project - Setup and Student Model

## Introduction: From Theory to Practice

In Document 36, we learned **why** Spring JDBC matters—it eliminates the boilerplate of plain JDBC and gives us powerful tools like `JdbcTemplate` and connection pooling. Now it's time to actually build something!

The instructor announces: **"So let's start our journey of creating a project using spring JDBC and of course with H2."**

This is where the rubber meets the road. We're going to:

1. **Create a new Spring Boot project** with the right dependencies
2. **Set up H2 database** for in-memory data storage
3. **Create a Student model** to represent our data
4. **Understand the table-to-class mapping** concept
5. **Configure Spring beans** with proper scope and annotations
6. **Organize code** into proper packages (model, service, repository)

By the end of this document, you'll have a working Spring Boot project with database capabilities, ready to implement CRUD operations in the next videos.

**The Example**: We're building a **student management system**. Simple enough to understand, but representative of real-world applications. The concepts you learn here apply to any domain—users, products, orders, employees, anything!

Let's dive in!

---

## Step 1: Creating the Project with Spring Initializr

The instructor guides us to the starting point: **"So we'll go to your spring initializer and then we'll mention the project type I'm going for Maven."**

**Spring Initializr** (https://start.spring.io/) is the official tool for bootstrapping Spring Boot projects. Think of it as a **project generator** that creates the skeleton of your application with all the necessary configuration files and dependencies.

### Project Configuration Choices

Let's go through each configuration option and understand why the instructor chooses each one:

#### 1. Project Type: Maven

**"And then I will be setting the language to Java because that's what you're doing."**

**Project Type Options:**
- **Maven**: Uses `pom.xml` for dependency management
- **Gradle (Groovy)**: Uses `build.gradle` with Groovy syntax
- **Gradle (Kotlin)**: Uses `build.gradle.kts` with Kotlin syntax

The instructor chooses **Maven** because:
- **Industry Standard**: Most widely used in enterprise Java projects
- **Simple XML Configuration**: Easy to read and understand
- **Mature Ecosystem**: Decades of plugins and tools available
- **Great Documentation**: Extensive resources and community support

**What Maven Does:**
```xml
<!-- You declare what you need -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>

<!-- Maven downloads it for you -->
<!-- Plus all transitive dependencies (dependencies of dependencies) -->
```

Maven handles:
- Downloading libraries from Maven Central repository
- Managing dependency versions
- Building the project (compiling, packaging)
- Running tests
- Creating JAR/WAR files

#### 2. Language: Java

**"Spring boot version 3.2. Whatever latest version you have to whenever you're watching this."**

**Language Options:**
- **Java**: Traditional, verbose but clear
- **Kotlin**: Modern, concise, fully interoperable with Java
- **Groovy**: Dynamic typing, scripting capabilities

We're using **Java** because it's the most common language in Spring Boot projects and what we've been learning throughout this course.

#### 3. Spring Boot Version: 3.2.x (or latest)

**Why "latest version"?**

The instructor wisely says: **"Whatever latest version you have to whenever you're watching this."**

This is important because:
- **Security updates**: Latest versions fix vulnerabilities
- **Bug fixes**: Resolved issues from previous versions
- **New features**: Latest capabilities and improvements
- **Better performance**: Optimizations in newer releases

**However, avoid:**
- Snapshot versions (e.g., 3.3.0-SNAPSHOT) - unstable, in development
- Milestone versions (e.g., 3.3.0-M1) - pre-release, not production-ready

**Choose:** Stable releases (e.g., 3.2.0, 3.2.5, 3.3.0) - tested and production-ready

**Version Format Explained:**
```
3.2.5
│ │ │
│ │ └─ Patch version (bug fixes, security patches)
│ └─── Minor version (new features, backward compatible)
└───── Major version (breaking changes, new architecture)
```

**Spring Boot 3.x Requirements:**
- Java 17 or later (minimum)
- Jakarta EE 9+ (namespace change from javax.* to jakarta.*)
- Native compilation support (GraalVM)

#### 4. Project Metadata

**"And let's set the group ID to com dot telescope."**

**Group ID**: Identifies your organization or project group. Convention is reverse domain name:
- `com.telusko` (instructor's choice)
- `com.example` (default for practice projects)
- `org.apache` (Apache projects)
- `com.google` (Google projects)

**"Let's set the artifact ID to spring JDBC example."**

**Artifact ID**: Identifies the specific project. Should be:
- Lowercase
- Hyphen-separated (kebab-case)
- Descriptive of what the project does

**"And demo project for spring boot and JDBC."**

This becomes the project **name** and **description** - helpful for documentation.

**"The packaging I will stick to jar."**

**Packaging Options:**
- **JAR (Java Archive)**: Standalone application with embedded server (Tomcat)
- **WAR (Web Archive)**: For deployment to external application servers

We choose **JAR** because:
- Spring Boot embeds Tomcat/Jetty/Undertow
- Self-contained executable
- Easier to deploy (just run: `java -jar myapp.jar`)
- Modern microservices pattern

**"And the version of Java which I have in my machine is Java 17. Or maybe I can also work with Java 21 because that's what I have upgraded to."**

**Java Version**: Must match what's installed on your machine. Spring Boot 3.x requires:
- **Minimum**: Java 17
- **Supported**: Java 17, 18, 19, 20, 21
- **Recommended**: Java 17 (LTS) or Java 21 (latest LTS)

**LTS = Long-Term Support**: Receives updates for years, stable for production.

**Final Configuration Summary:**

```
Project: Maven Project
Language: Java
Spring Boot: 3.2.x
Group: com.telusko
Artifact: spring-jdbc-example
Name: spring-jdbc-example
Description: Demo project for Spring Boot and JDBC
Package name: com.telusko.springjdbcexample
Packaging: Jar
Java: 17 (or 21)
```

---

## Step 2: Adding Dependencies

Now comes the crucial part: **"And now it's time to add the dependencies. I will click on Add Dependency."**

Dependencies are libraries that add functionality to your project. Without them, you'd have to write everything from scratch!

### Dependency 1: Spring JDBC

**"Now what are dependencies we need? First of all, we need the spring JDBC. So if you can simply search for JDBC this is what you will get jdbc API."**

**Search term**: `JDBC`

**Dependency**: `Spring JDBC` or `JDBC API`

**What you see in Spring Initializr:**
```
JDBC API
JDBC (Java Database Connectivity) API with Spring Boot
```

**What this adds to pom.xml:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
```

**What's Included** (transitive dependencies):

```
spring-boot-starter-jdbc
├── spring-jdbc (JdbcTemplate, DataSource, etc.)
├── spring-tx (Transaction management)
├── HikariCP (Connection pooling)
└── spring-boot-starter (core Spring Boot)
```

**This gives you:**
- **JdbcTemplate**: Simplified JDBC operations
- **DataSource**: Connection factory
- **HikariCP**: High-performance connection pool
- **Transaction Management**: @Transactional support
- **Exception Translation**: SQLException → DataAccessException

### Dependency 2: H2 Database

**"Next we have to add for database. So we'll say we'll search for H2."**

**Search term**: `H2`

**Dependency**: `H2 Database`

**What you see in Spring Initializr:**
```
H2 Database
Provides a fast in-memory database that supports JDBC API and R2DBC access, 
with a small (2MB) footprint. Supports embedded and server modes as well as 
a browser based console application.
```

The instructor notes: **"Now if you want to connect to MySQL Postgres it's your choice. You can just add that driver there."**

**Alternative Database Options:**

**MySQL:**
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

**PostgreSQL:**
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

**Oracle:**
```xml
<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ojdbc8</artifactId>
    <scope>runtime</scope>
</dependency>
```

**Why H2 for This Tutorial?**

The instructor explains: **"But when you add H2 database it will also add the JDBC driver for you."**

**What H2 adds to pom.xml:**
```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

**Advantages of H2:**

1. **Includes JDBC Driver**: One dependency gets you database + driver
2. **No Installation**: No separate database server to install
3. **Lightweight**: The instructor confirms: **"And you can see it's a very lightweight database. Only two MB footprint."**
4. **Zero Configuration**: Works out of the box
5. **Fast**: In-memory = lightning fast operations
6. **Built-in Console**: Web UI to view database
7. **Perfect for Learning**: Focus on code, not database administration

**"That's good okay."**

With these two dependencies, we have everything needed to connect to a database!

### The scope="runtime" Explanation

You might notice `<scope>runtime</scope>` on the H2 dependency. What does this mean?

**Dependency Scopes:**

```xml
<!-- Compile scope (default) - available everywhere -->
<dependency>
    <artifactId>spring-boot-starter-jdbc</artifactId>
    <!-- No scope = compile scope -->
</dependency>

<!-- Runtime scope - only needed when running -->
<dependency>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>  <!-- Not needed for compilation -->
</dependency>

<!-- Test scope - only for tests -->
<dependency>
    <artifactId>junit</artifactId>
    <scope>test</scope>
</dependency>
```

**Why H2 is runtime?**

Your code doesn't reference H2 classes directly:
```java
// You write this (generic JDBC):
Connection conn = dataSource.getConnection();

// Not this (H2-specific):
org.h2.jdbcx.JdbcConnectionPool pool = ...;  // ❌ Bad practice
```

Since your code uses only JDBC interfaces (compile-time), H2 is only needed at runtime (when the JVM loads the driver).

**Benefits:**
- **Database Independence**: Code isn't tied to H2
- **Easy Switching**: Change H2 to MySQL by swapping dependency
- **Cleaner Classpath**: IDE doesn't autocomplete H2-specific classes

---

## Step 3: Generating and Downloading the Project

**"With this let's click on generate. It will create a project for you."**

When you click **Generate**, Spring Initializr:

1. Creates project structure based on your choices
2. Generates `pom.xml` with selected dependencies
3. Creates main application class with `@SpringBootApplication`
4. Adds `application.properties` for configuration
5. Includes test setup with JUnit
6. Packages everything into a ZIP file
7. Downloads to your computer

**"And you can see the project is here. It's time to unzip it and open that in IntelliJ okay."**

**Downloaded ZIP Contents:**

```
spring-jdbc-example.zip
└── spring-jdbc-example/
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   └── com/telusko/springjdbcexample/
    │   │   │       └── SpringJdbcExampleApplication.java
    │   │   └── resources/
    │   │       ├── application.properties
    │   │       ├── static/
    │   │       └── templates/
    │   └── test/
    │       └── java/
    │           └── com/telusko/springjdbcexample/
    │               └── SpringJdbcExampleApplicationTests.java
    ├── .gitignore
    ├── mvnw (Maven Wrapper - Unix)
    ├── mvnw.cmd (Maven Wrapper - Windows)
    ├── pom.xml
    └── README.md
```

**Key Files:**

- **pom.xml**: Maven configuration and dependencies
- **SpringJdbcExampleApplication.java**: Entry point with `main()` method
- **application.properties**: Configuration (database URL, credentials, etc.)
- **mvnw / mvnw.cmd**: Maven Wrapper (uses project-specific Maven version)

**"So I'm opening the project okay."**

**Opening in IntelliJ IDEA:**

1. Unzip the downloaded file
2. Open IntelliJ IDEA
3. File → Open
4. Select the project folder
5. IntelliJ detects it's a Maven project
6. Wait for Maven to download dependencies (first time takes a few minutes)

---

## Step 4: Examining the Generated pom.xml

**"So this is the project which we have downloaded. And if you can see if you go to the Pom dot XML file."**

Let's look at what Spring Initializr generated:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <!-- Parent POM - inherits Spring Boot defaults -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <!-- Project Coordinates -->
    <groupId>com.telusko</groupId>
    <artifactId>spring-jdbc-example</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>spring-jdbc-example</name>
    <description>Demo project for Spring Boot and JDBC</description>
    
    <!-- Java Version -->
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <!-- Dependencies -->
    <dependencies>
        <!-- Spring JDBC -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
        
        <!-- H2 Database -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Testing -->
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

The instructor confirms: **"Now this is the dependency which we have added. So basically we have added spring boot starter JDBC. And next we have added is H2."**

**Breaking Down the Dependencies Section:**

```xml
<dependencies>
    <!-- Our selected dependencies -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
        <!-- Version inherited from parent -->
    </dependency>
    
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
        <!-- Version inherited from parent -->
    </dependency>
    
    <!-- Auto-included for testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

**Why no version numbers?**

Versions are managed by `spring-boot-starter-parent`:

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>  <!-- Controls all dependency versions -->
</parent>
```

Spring Boot parent POM includes **dependency management** that specifies compatible versions for hundreds of libraries. This prevents version conflicts and ensures everything works together!

**The Instructor's Summary**: **"So we only need two dependency at this point so that we can connect with database."**

That's the beauty of Spring Boot—two dependencies get you:
- Complete JDBC framework
- Connection pooling
- Transaction management
- In-memory database
- JDBC driver
- All supporting libraries

---

## Step 5: Planning the Application Structure

Before diving into code, the instructor thinks about architecture: **"Now we have to create certain layers here okay."**

**What Layers?**

Remember from Documents 33-35, we learned about **layered architecture**:

```
Client/Main
    ↓
Service Layer (business logic)
    ↓
Repository Layer (database access)
    ↓
Database (H2)
```

Additionally, we need:
- **Model Layer**: Classes representing data (Student)

**Project Structure We're Building:**

```
com.telusko.springjdbcexample/
├── SpringJdbcExampleApplication.java (Main class)
├── model/
│   └── Student.java (Entity)
├── repository/
│   └── StudentRepository.java (Database access)
└── service/
    └── StudentService.java (Business logic)
```

The instructor starts with the foundation: **"So the first thing we need here is a class to represent the data which you are going to work with."**

This is the **Model** or **Entity** class. It represents what data looks like in your application.

---

## Step 6: Testing the Project First

But before creating anything, the instructor does something very wise:

**"Even before that I want to make sure that this application runs. I don't trust any project which I get from the internet, so it's always better to test it by running."**

This is **excellent practice**! Always verify the base project works before adding your code. Why?

**Reasons to Test First:**

1. **Verify Dependencies**: Ensure Maven downloaded everything correctly
2. **Check Java Version**: Confirm Java version compatibility
3. **Validate Configuration**: Catch any setup issues early
4. **Establish Baseline**: Know the project works before your changes
5. **Avoid Debugging Hell**: Don't troubleshoot your code AND setup issues simultaneously

**Running the Application:**

```java
package com.telusko.springjdbcexample;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringJdbcExampleApplication.class, args);
    }
}
```

**How to Run:**
- **IntelliJ**: Click green play button next to `main()` method
- **Command Line**: `mvn spring-boot:run`
- **Terminal**: `./mvnw spring-boot:run` (using Maven Wrapper)

**Expected Output:**

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

2024-03-19T10:30:15.123  INFO 12345 --- [main] c.t.s.SpringJdbcExampleApplication       : Starting SpringJdbcExampleApplication
2024-03-19T10:30:15.456  INFO 12345 --- [main] c.t.s.SpringJdbcExampleApplication       : No active profile set, falling back to 1 default profile: "default"
2024-03-19T10:30:16.789  INFO 12345 --- [main] o.s.b.a.h2.H2ConsoleAutoConfiguration    : H2 console available at '/h2-console'. Database available at 'jdbc:h2:mem:testdb'
2024-03-19T10:30:17.012  INFO 12345 --- [main] c.t.s.SpringJdbcExampleApplication       : Started SpringJdbcExampleApplication in 2.345 seconds
```

The instructor confirms: **"Okay, so no problem, it runs."**

**Key Observations from Output:**

1. **Spring Boot banner**: Application started successfully
2. **H2 Console message**: H2 database is configured and available
3. **No errors**: Everything is working
4. **Application keeps running**: Because it's a Spring Boot app (would shut down immediately if just a plain main method)

**"And maybe if you want you can also print Hello World if you want to check it out."**

Adding a print statement for extra confirmation:

```java
@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringJdbcExampleApplication.class, args);
        System.out.println("Hello World");  // Verification print
    }
}
```

**Output:**
```
... Spring Boot startup logs ...
Hello World
```

**"But it works. You can see we got the output. We have not got any error. That's important."**

✅ **Project verified working!** Now we can proceed with confidence.

---

## Step 7: Defining the Application Domain

**"Now the question is which type of entity we are going to work with and what we are trying to achieve here."**

This is about defining the **problem domain**—what are we building?

**"So the logic is not important. We are here to learn about spring and JDBC and spring boot. So logic is not important. What we are going to do is we are going to build application for student management."**

**Important Philosophy:**

The instructor emphasizes: **"Logic is not important."** and **"But concepts are important. So I'm focusing on that okay."**

This is crucial for learning. We're not building the next Facebook or Amazon. We're learning **concepts** that apply to ANY domain:

- How to connect to database? → Works for students, users, products, orders
- How to save data? → Same pattern for any entity
- How to retrieve data? → Same queries, different tables
- How to organize layers? → Same architecture everywhere

**Student Management System** is perfect because:
- **Simple**: Everyone understands what a student is
- **Relatable**: Similar to real-world systems (users, employees, customers)
- **Complete**: Has all CRUD operations naturally (add student, view students, update marks, remove student)
- **Not Distracting**: Focus on Spring/JDBC, not complex business rules

**Functionality:**

**"Let's say adding student retrieving student deleting student if you want. So that's what we are doing here."**

**Our CRUD Operations:**
- **Create**: Add new student to database
- **Read**: Retrieve student by ID or get all students
- **Update**: Modify student information (update marks, change name)
- **Delete**: Remove student from system

**For Complex Examples:**

**"Now if you want complex example you are welcome. You can just write whatever code you want to."**

Once you understand these concepts, you can apply them to:
- **E-Commerce**: Product management with categories, inventory, pricing
- **Banking**: Account management with transactions, transfers, balances
- **HR System**: Employee management with departments, salaries, attendance
- **Hospital**: Patient management with appointments, prescriptions, billing

The patterns are **identical**. Only the domain logic changes!

---

## Step 8: Creating the Student Model Class

**"The first thing I want to do is I want to create a student class."**

### Creating the Java Class

**"Now student will have certain things right. Uh, so I will say Java class, this is for the student okay."**

**In IntelliJ:**
1. Right-click on `com.telusko.springjdbcexample` package
2. New → Java Class
3. Name: `Student`
4. Press Enter

**Generated Class:**

```java
package com.telusko.springjdbcexample;

public class Student {
    
}
```

Simple start! Now we need to define what data a Student contains.

---

## Step 9: Understanding Table-to-Class Mapping

Before adding fields, the instructor teaches a fundamental concept:

**"Now this student basically will have the data in database as well. So normally what happens you know when you have a table."**

This is about the **Object-Relational Mapping (ORM)** concept. Let's understand how database tables relate to Java classes.

### The Database Table Concept

**"So let's say if you want to store data about student you will have a student table a student will have a row number a name and a marks if you want."**

**Database Table - STUDENT:**

```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

**Visual Representation:**

```
STUDENT TABLE
+-------------+---------+-------+
| roll_number | name    | marks |
+-------------+---------+-------+
| 101         | Naveen  | 78    |
| 102         | Raj     | 85    |
| 103         | Priya   | 92    |
| 104         | Amit    | 67    |
+-------------+---------+-------+
```

The instructor explains: **"I mean whatever field you want to go with. But let's say row number, name and marks. We have this three fields."**

**Table Components:**

**"Now in those table you'll be having columns which is your column names. And also you will be having multiple rows."**

- **Columns**: Define the structure (what data exists)
  - `roll_number` - integer
  - `name` - string/varchar
  - `marks` - integer

- **Rows**: Actual data records (instances)
  - Row 1: 101, Naveen, 78
  - Row 2: 102, Raj, 85
  - etc.

### The Java Class Parallel

Now comes the key insight: **"Can you connect the table with the class with the with the class or object."**

**Java Class - Student:**

```java
public class Student {
    private int rollNumber;
    private String name;
    private int marks;
}
```

**The Mapping:**

**"Basically you can say that your class is similar to your table because class will have a class name, and class will have certain variables."**

```
DATABASE TABLE          JAVA CLASS
---------------         ----------
Table name      ←→      Class name
    STUDENT                 Student

Column          ←→      Field/Property
    roll_number             rollNumber
    name                    name
    marks                   marks

Row (record)    ←→      Object (instance)
    (101,'Naveen',78)       new Student(101, "Naveen", 78)
```

**The Rule:**

**"Now in your table, if you have three columns, your class will have three properties, right? The row number, name, and marks."**

**Perfect Alignment:**

```
Table Columns               Class Fields
=============               ============
roll_number (INT)           int rollNumber
name (VARCHAR)              String name
marks (INT)                 int marks
```

Each column in your database table becomes a field in your Java class!

### The Object-to-Row Relationship

This is where it gets powerful:

**"And every object of this class will be one row in your table. So if you create ten objects for student, imagine you have ten rows."**

**In Java:**

```java
Student s1 = new Student();
s1.setRollNumber(101);
s1.setName("Naveen");
s1.setMarks(78);

Student s2 = new Student();
s2.setRollNumber(102);
s2.setName("Raj");
s2.setMarks(85);

Student s3 = new Student();
s3.setRollNumber(103);
s3.setName("Priya");
s3.setMarks(92);
```

**In Database:**

```sql
INSERT INTO student VALUES (101, 'Naveen', 78);
INSERT INTO student VALUES (102, 'Raj', 85);
INSERT INTO student VALUES (103, 'Priya', 92);
```

**Result - Three objects = Three rows:**

```
STUDENT TABLE
+-------------+---------+-------+
| roll_number | name    | marks |
+-------------+---------+-------+
| 101         | Naveen  | 78    | ←  Student s1
| 102         | Raj     | 85    | ←  Student s2
| 103         | Priya   | 92    | ←  Student s3
+-------------+---------+-------+
```

**The Insight:**

**"So that's how basically you can relate your class and your tables."**

This is the foundation of **Object-Relational Mapping (ORM)**:

- **One Class** = One Table
- **One Object** = One Row
- **Class Fields** = Table Columns
- **Field Values** = Column Values

When you save an object to the database, you're inserting a row. When you retrieve a row from the database, you create an object!

---

## Step 10: Adding Fields to Student Class

**"So the columns which I want in my table is this one. So first one is I want the row number."**

Let's add the fields:

```java
package com.telusko.springjdbcexample;

public class Student {
    private int rollNumber;
    private String name;
    private int marks;
}
```

**"Then I want name and I want marks."**

The instructor makes a correction: **"And with this three fields here in fact row number can be in capital okay."**

**Naming Convention Note:**

In Java, we use **camelCase** for field names:
- `rollNumber` not `roll_number` (database style)
- `firstName` not `first_name`
- `totalMarks` not `total_marks`

But the instructor might prefer `ROLLNUMBER` as a constant-style name if it's treated as an identifier. However, since it's a regular field that can change, camelCase is more appropriate:

```java
public class Student {
    private int rollNumber;  // Best practice: camelCase
    private String name;
    private int marks;
}
```

**Why private?**

- **Encapsulation**: Hide internal state
- **Control Access**: Use getters/setters to validate data
- **Flexibility**: Change internal representation without breaking external code

**Field Types:**

- `int rollNumber`: Whole number (101, 102, 103...)
- `String name`: Text ("Naveen", "Raj", "Priya"...)
- `int marks`: Whole number (0-100)

---

## Step 11: Generating Getters and Setters

Now we need ways to access and modify these private fields:

**"And with this uh three variables we also need the getter status for it. So I will say generate getter setters for all these three variables."**

**Why Getters and Setters?**

Since fields are `private`, we can't access them directly:

```java
Student s = new Student();
s.rollNumber = 101;  // ❌ Compiler error: rollNumber has private access
```

We need **public methods** to access private data:

```java
Student s = new Student();
s.setRollNumber(101);  // ✅ Works!
int roll = s.getRollNumber();  // ✅ Works!
```

**Generating in IntelliJ:**

1. Inside the `Student` class, right-click (or press Alt+Insert / Cmd+N)
2. Select "Generate"
3. Select "Getter and Setter"
4. Select all three fields (`rollNumber`, `name`, `marks`)
5. Click OK

**Generated Code:**

```java
public class Student {
    private int rollNumber;
    private String name;
    private int marks;
    
    // Getter for rollNumber
    public int getRollNumber() {
        return rollNumber;
    }
    
    // Setter for rollNumber
    public void setRollNumber(int rollNumber) {
        this.rollNumber = rollNumber;
    }
    
    // Getter for name
    public String getName() {
        return name;
    }
    
    // Setter for name
    public void setName(String name) {
        this.name = name;
    }
    
    // Getter for marks
    public int getMarks() {
        return marks;
    }
    
    // Setter for marks
    public void setMarks(int marks) {
        this.marks = marks;
    }
}
```

**"Click on okay."**

**Benefits of Getters/Setters:**

1. **Encapsulation**: Control how fields are accessed
2. **Validation**: Add checks in setters
   ```java
   public void setMarks(int marks) {
       if (marks < 0 || marks > 100) {
           throw new IllegalArgumentException("Marks must be 0-100");
       }
       this.marks = marks;
   }
   ```
3. **Read-Only Fields**: Provide getter without setter
4. **Computed Properties**: Calculate values on the fly
   ```java
   public String getGrade() {
       return marks >= 90 ? "A" : marks >= 80 ? "B" : "C";
   }
   ```
5. **Debugging**: Add logging to track access
6. **Framework Compatibility**: Spring, Hibernate, Jackson all use getters/setters

---

## Step 12: Adding toString() Method

**"And maybe I also want to have a two string method if I want to print the object."**

Without `toString()`, printing an object gives useless output:

```java
Student s = new Student();
s.setRollNumber(101);
s.setName("Naveen");
s.setMarks(78);

System.out.println(s);
// Output: com.telusko.springjdbcexample.Student@15db9742
```

That's the **default Object.toString()** which shows class name + hash code. Not helpful!

**Generating toString():**

**"So I will just click here say generate. I want a two string method for all these variables here that's done."**

1. Right-click → Generate (Alt+Insert / Cmd+N)
2. Select "toString()"
3. Select all fields (`rollNumber`, `name`, `marks`)
4. Click OK

**Generated toString():**

```java
@Override
public String toString() {
    return "Student{" +
            "rollNumber=" + rollNumber +
            ", name='" + name + '\'' +
            ", marks=" + marks +
            '}';
}
```

**Now when we print:**

```java
System.out.println(s);
// Output: Student{rollNumber=101, name='Naveen', marks=78}
```

Much better! We can see all the student's data at a glance.

**When toString() is Useful:**

1. **Debugging**: Quickly inspect object state
2. **Logging**: Log object information
   ```java
   logger.info("Saved student: " + student);
   ```
3. **Testing**: Verify object contents
4. **Console Output**: Display information to users

**Complete Student Class So Far:**

```java
package com.telusko.springjdbcexample;

public class Student {
    private int rollNumber;
    private String name;
    private int marks;
    
    // Getters
    public int getRollNumber() {
        return rollNumber;
    }
    
    public String getName() {
        return name;
    }
    
    public int getMarks() {
        return marks;
    }
    
    // Setters
    public void setRollNumber(int rollNumber) {
        this.rollNumber = rollNumber;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public void setMarks(int marks) {
        this.marks = marks;
    }
    
    // toString
    @Override
    public String toString() {
        return "Student{" +
                "rollNumber=" + rollNumber +
                ", name='" + name + '\'' +
                ", marks=" + marks +
                '}';
    }
}
```

---

## Step 13: Making Student a Spring-Managed Bean

**"And now I want this particular class object to be managed by Spring Framework."**

Why? Remember from Spring Core learning: Spring manages object lifecycle, dependency injection, and configuration. Instead of manually creating students with `new`, we let Spring manage them.

**"And since we have talked about all those things, I can be a bit quicker here and I will make this as a component."**

**Adding @Component Annotation:**

```java
package com.telusko.springjdbcexample;

import org.springframework.stereotype.Component;

@Component
public class Student {
    private int rollNumber;
    private String name;
    private int marks;
    
    // ... getters, setters, toString
}
```

**What @Component Does:**

From Document 27, we learned that `@Component`:
- Marks class for component scanning
- Spring creates bean during application startup
- Bean available for dependency injection
- Managed by Spring container

**"So basically I can create this object from the student class or from this main class. And then I can create the object, I can add the values and I can save it in database."**

Now we can get Student from Spring's application context:

```java
@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringJdbcExampleApplication.class, args);
        
        // Get Student bean from Spring
        Student s = context.getBean(Student.class);
        
        // Set values
        s.setRollNumber(101);
        s.setName("Naveen");
        s.setMarks(78);
        
        // Later: save to database
    }
}
```

---

## Step 14: Understanding Scope - Singleton vs Prototype

But wait! There's a problem. By default, Spring beans are **singleton**:

```java
Student s1 = context.getBean(Student.class);
s1.setRollNumber(101);
s1.setName("Naveen");

Student s2 = context.getBean(Student.class);
s2.setRollNumber(102);
s2.setName("Raj");

// Problem: s1 and s2 are THE SAME OBJECT!
System.out.println(s1.getRollNumber());  // Output: 102 (not 101!)
```

**Why?** Singleton means Spring creates **one instance** and reuses it.

The instructor recognizes this: **"And since we are going to work with multiple students it makes sense to make this scope as prototype."**

### Singleton vs Prototype

**From Document 30 - Scope Annotation:**

**Singleton (default):**
```java
@Component
@Scope("singleton")  // Default, can omit
public class Student { }

// Spring creates ONE instance
// Every getBean() returns same object
```

**Prototype:**
```java
@Component
@Scope("prototype")
public class Student { }

// Spring creates NEW instance each time
// Every getBean() returns different object
```

**Adding @Scope("prototype"):**

```java
package com.telusko.springjdbcexample;

import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype")  // New instance per request
public class Student {
    private int rollNumber;
    private String name;
    private int marks;
    
    // ... rest of code
}
```

**Now it works correctly:**

```java
Student s1 = context.getBean(Student.class);  // New instance
s1.setRollNumber(101);
s1.setName("Naveen");

Student s2 = context.getBean(Student.class);  // Different new instance
s2.setRollNumber(102);
s2.setName("Raj");

System.out.println(s1.getRollNumber());  // Output: 101 ✅
System.out.println(s2.getRollNumber());  // Output: 102 ✅
```

**When to Use Each:**

**Singleton (default):**
- Stateless services
- Repositories
- Controllers
- Utilities
- Shared resources

**Prototype:**
- Entity/Model objects (like Student)
- Request-scoped data
- Objects with unique state
- Temporary working objects

**The instructor notes**: **"By default it will be singleton. We have to make it prototype."**

---

## Step 15: Organizing Code with Packages

**"But then we don't have a context here. So application context context equal to spring application dot one."**

Before updating the main class, the instructor realizes something:

**"You know, one more thing. Let's follow the pattern where you store everything in a proper package."**

This is about **clean code organization**—remember from Documents 33-35, we separate layers into packages.

**"So I will say this belongs to a package. Package is already there. This belongs to a package model."**

### Creating the model Package

**Current Structure:**
```
com.telusko.springjdbcexample/
├── SpringJdbcExampleApplication.java
└── Student.java  ← In root package
```

**Better Structure:**
```
com.telusko.springjdbcexample/
├── SpringJdbcExampleApplication.java
└── model/
    └── Student.java  ← In model package
```

**Moving the Class:**

**"And I can say move to model. Yeah. So you can see I've moved the student class to model."**

**In IntelliJ:**
1. Right-click on `Student.java`
2. Refactor → Move
3. Create/select package: `com.telusko.springjdbcexample.model`
4. Click OK

**Updated Student.java:**

```java
package com.telusko.springjdbcexample.model;  // Updated package

import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype")
public class Student {
    private int rollNumber;
    private String name;
    private int marks;
    
    // ... getters, setters, toString
}
```

**"That means we have to import the package here okay."**

**In SpringJdbcExampleApplication.java:**

```java
package com.telusko.springjdbcexample;

import com.telusko.springjdbcexample.model.Student;  // Import added
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringJdbcExampleApplication.class, args);
        
        // Now we can use Student
        Student s = context.getBean(Student.class);
    }
}
```

IntelliJ usually auto-imports, but if not, press Alt+Enter (or Cmd+Enter on Mac) when cursor is on the red underlined class name.

---

## Step 16: Getting Student Bean from Context

**"And then of course I don't want to say new student. I want to say context."**

We need the `ApplicationContext` to get beans:

**"But then we don't have a context here. So application context context equal to spring application dot one."**

**Adding the Context:**

```java
@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        // Run application and get the context
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringJdbcExampleApplication.class, args);
        
        // Get Student bean
        Student s = context.getBean(Student.class);
    }
}
```

**Note**: `SpringApplication.run()` returns `ConfigurableApplicationContext`, which is a subinterface of `ApplicationContext` with extra methods for managing the application lifecycle.

**Why Get Bean from Context?**

```java
// ❌ Manual creation - not managed by Spring
Student s = new Student();

// ✅ Spring-managed - benefits from Spring features
Student s = context.getBean(Student.class);
```

Benefits of Spring-managed beans:
- Dependency injection works
- Lifecycle callbacks (init, destroy)
- AOP proxies can be applied
- Consistent with rest of Spring ecosystem

---

## Step 17: Setting Student Data

**"And now if you go back let's add some data here. So I will say S dot set row number. Let's say 101S dot set name I will go for Naveen and set marks let's say 78."**

```java
@SpringBootApplication
public class SpringJdbcExampleApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = 
            SpringApplication.run(SpringJdbcExampleApplication.class, args);
        
        Student s = context.getBean(Student.class);
        
        // Set student data
        s.setRollNumber(101);
        s.setName("Naveen");
        s.setMarks(78);
        
        System.out.println(s);  // Student{rollNumber=101, name='Naveen', marks=78}
    }
}
```

**"I know that's a random number, but let's go with this numbers."**

The data itself doesn't matter—we're learning the pattern!

---

## Step 18: The Missing Piece - Service Layer

**"And then what I want to do is I basically want to add this student."**

Now we want to save this student to the database. But how?

**"So whatever student object I'm creating I want to add it. But question arises where is this method add and your client."**

We need a method like:
```java
addStudent(s);  // But where does this come from?
```

**The Architecture Question:**

**"So basically we are not creating a web application. So your main becomes your client."**

In a web application:
```
Browser → Controller → Service → Repository → Database
```

In our console application:
```
Main → Service → Repository → Database
```

**"So how exactly this is going to interact with or with which class is going to interact."**

Should `main` talk directly to `StudentRepository`?

**NO!** Remember the layered architecture from Document 33:

```
Client (Main)
    ↓
Service Layer (business logic)
    ↓
Repository Layer (database access)
```

**"Of course will not be directly interacting with the uh repository layer. We need a layer in between which is service."**

**Why Not Skip Service Layer?**

You might think: "It's a simple app, why not call repository directly?"

```java
// ❌ Bad: Skipping service layer
StudentRepository repo = context.getBean(StudentRepository.class);
repo.save(student);  // Direct database access from client
```

**Problems:**
1. **No business logic layer**: Where do you validate student data?
2. **Tight coupling**: Client depends on repository implementation
3. **Hard to test**: Can't mock repository for testing client
4. **Poor scalability**: Adding business rules requires changing client code

**Better:**

```java
// ✅ Good: Using service layer
StudentService service = context.getBean(StudentService.class);
service.addStudent(student);  // Service handles business logic and database
```

**Service layer provides:**
- Business logic (validation, calculations)
- Transaction management
- Error handling
- Abstraction over data access

---

## Step 19: Preparing for Service and Repository Layers

The instructor concludes: **"So let's create those two layers in the next video."**

**What's Coming Next:**

1. **Create StudentService**: Business logic layer
   ```java
   @Service
   public class StudentService {
       @Autowired
       private StudentRepository repository;
       
       public void addStudent(Student student) {
           // Validate student
           // Call repository
       }
   }
   ```

2. **Create StudentRepository**: Database access layer
   ```java
   @Repository
   public class StudentRepository {
       @Autowired
       private JdbcTemplate jdbcTemplate;
       
       public void save(Student student) {
           // JDBC code to insert into database
       }
   }
   ```

3. **Wire them together**: Dependency injection
   ```
   Main
    ↓ getBean(StudentService)
   StudentService
    ↓ @Autowired
   StudentRepository
    ↓ @Autowired
   JdbcTemplate
    ↓
   H2 Database
   ```

**Final Project Structure Preview:**

```
com.telusko.springjdbcexample/
├── SpringJdbcExampleApplication.java
├── model/
│   └── Student.java ✅ (Done)
├── service/
│   └── StudentService.java (Next video)
└── repository/
    └── StudentRepository.java (Next video)
```

---

## Key Concepts Summary

### 1. Spring Initializr
**Purpose**: Web-based tool to generate Spring Boot projects.

**Configuration Options:**
- Project type (Maven/Gradle)
- Language (Java/Kotlin/Groovy)
- Spring Boot version
- Project metadata (group, artifact, name)
- Packaging (JAR/WAR)
- Java version

**URL**: https://start.spring.io/

### 2. Essential Dependencies
**spring-boot-starter-jdbc:**
- JdbcTemplate
- DataSource configuration
- HikariCP connection pool
- Transaction management

**h2:**
- In-memory database
- JDBC driver included
- Web console
- Only 2MB footprint

### 3. Table-to-Class Mapping
**Concept**: Database tables map to Java classes.

**Mapping:**
```
Table name → Class name
Column → Field/Property
Row → Object instance
Data type → Java type
```

**Example:**
```
STUDENT table → Student class
roll_number INT → int rollNumber
name VARCHAR → String name
marks INT → int marks
```

### 4. Generated Methods
**Getters/Setters:**
- Access private fields
- Enable validation
- Framework compatibility

**toString():**
- Readable object representation
- Debugging aid
- Logging support

### 5. Spring Bean Annotations
**@Component:**
- Marks class for component scanning
- Spring manages lifecycle
- Available for dependency injection

**@Scope("prototype"):**
- New instance per request
- Essential for entity objects
- Alternative to singleton (default)

### 6. Package Organization
**Structure:**
```
com.company.project/
├── model/ (entities)
├── service/ (business logic)
└── repository/ (database access)
```

**Benefits:**
- Clear separation of concerns
- Easy navigation
- Scalable for growth
- Industry standard

### 7. ConfigurableApplicationContext
**Purpose**: Access Spring's IoC container.

**Usage:**
```java
ConfigurableApplicationContext context = 
    SpringApplication.run(Application.class, args);

Student s = context.getBean(Student.class);
```

**Provides:**
- Bean retrieval
- Lifecycle management
- Application configuration

---

## Common Questions

### Q1: Why H2 instead of MySQL for learning?
**A:** H2 requires zero setup (no installation, no configuration), runs in memory (fast), and includes a web console. Perfect for learning where you want to focus on Spring JDBC concepts, not database administration.

### Q2: Can I use this same code with MySQL later?
**A:** Yes! Just change the dependency (H2 → MySQL) and configuration (database URL). All your Spring JDBC code stays the same—that's the beauty of abstraction.

### Q3: Why is Student @Component and not @Entity?
**A:** We're using plain Spring JDBC, not JPA. `@Entity` is a JPA annotation for ORM frameworks like Hibernate. With JDBC, we manually map between objects and database rows, so plain `@Component` with `@Scope("prototype")` is sufficient.

### Q4: Do I need getters/setters if fields are public?
**A:** Technically no, but it's bad practice. Getters/setters provide encapsulation, validation, and framework compatibility (Spring, Jackson, etc. all expect them). Always use private fields with getters/setters.

### Q5: Why @Scope("prototype") for Student?
**A:** We're creating multiple students with different data. Singleton (default) would give us the same object every time, overwriting previous data. Prototype creates a new instance for each student.

### Q6: What if I have 100 entity classes?
**A:** All go in the `model` package:
```
model/
├── Student.java
├── Teacher.java
├── Course.java
├── ... (97 more)
```
If it gets too large, create subpackages like `model.academic`, `model.administrative`.

---

## What's Next

In the next video, we'll:

1. **Create StudentService**: Add business logic layer
2. **Create StudentRepository**: Implement database access with JdbcTemplate
3. **Wire them together**: Connect service → repository using dependency injection
4. **Implement save()**: Write actual SQL INSERT statement
5. **Test end-to-end**: Run main → service → repository → database

The architecture is taking shape:

```
✅ Model Layer (Student) - Done
🔄 Service Layer (StudentService) - Next
🔄 Repository Layer (StudentRepository) - Next
🔄 Database (H2) - Next
```

**The Goal**: By next video's end, we'll successfully save a student to the H2 database and see the data persisted!

---

## Conclusion: Foundation Complete

We've accomplished a lot in this video:

✅ **Created Spring Boot project** with Spring Initializr
✅ **Added dependencies** (spring-boot-starter-jdbc, h2)
✅ **Verified project runs** without errors
✅ **Created Student model** with three fields
✅ **Understood table-to-class mapping** (fundamental ORM concept)
✅ **Generated getters, setters, toString** for bean convention
✅ **Made Student Spring-managed** with @Component
✅ **Set prototype scope** for multiple instances
✅ **Organized code** into model package
✅ **Got Student bean** from ApplicationContext
✅ **Set student data** ready for saving

**Next Step**: Create the service and repository layers to actually save this student to the database using Spring JDBC!

The foundation is solid. Now we build the database access layer! 🚀
