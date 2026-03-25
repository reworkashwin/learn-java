# 🗄️ Document 42: Switching from H2 to PostgreSQL - External Database Configuration

## Introduction: Moving Beyond In-Memory Databases

Throughout Documents 36-41, we built a complete Spring JDBC application using H2—an in-memory database. Everything worked perfectly! We could:

✅ Insert students with `save()`
✅ Retrieve students with `findAll()`
✅ See data persist during application runtime

But there's a catch...

**"Okay. So spring JDBC works. And the way we have done is we have used H2 as a database. Right. Which is an in-memory database."**

**What happens when you close the application?**

All data is **lost**! H2 stores everything in memory (RAM). When the application stops, the database disappears.

**For learning:** Perfect! Clean slate every time.

**For real applications:** Disaster! Imagine losing all customer orders when the server restarts.

**"But what if you want to use some external database. Let's say you want to use MySQL or Postgres. How will it do it."**

External databases like **PostgreSQL** and **MySQL** store data on disk. Data persists even when:
- Application stops
- Server reboots
- Power fails (data written to disk survives)

In this video, we're going to:

1. **Understand the configuration difference** (embedded vs external)
2. **Set up PostgreSQL database** using PgAdmin
3. **Create database and table** manually
4. **Add PostgreSQL driver** to pom.xml
5. **Configure datasource** in application.properties
6. **Verify repository code needs NO changes** (database abstraction!)
7. **Run and test** with PostgreSQL
8. **Confirm data source** using verification technique

By the end, you'll know how to connect Spring Boot to any external database—PostgreSQL, MySQL, Oracle, SQL Server, etc. The principles are the same!

Let's make our application production-ready!

---

## Step 1: Understanding the Configuration Challenge

**"So what happens is when you talk about H2, of course we have talked about we also need data source there now for H2."**

### Every Database Needs a DataSource

Remember from Document 36: **DataSource** is the connection factory.

```java
DataSource → Connection Pool → Database Connections
```

Whether H2 or PostgreSQL, Spring needs:
- Database URL (where is the database?)
- Username (credentials)
- Password (authentication)
- Driver (how to communicate with this database type?)

### H2: Automatic Configuration

**"Since it is a embedded database, it knows where H2 is. What are the configuration required to connect with H2."**

**Spring Boot Auto-Configuration for H2:**

```java
// Spring Boot does this automatically when H2 is on classpath:
DataSource dataSource = new HikariDataSource();
dataSource.setJdbcUrl("jdbc:h2:mem:testdb");  // In-memory, auto-generated
dataSource.setUsername("sa");                 // Default H2 username
dataSource.setPassword("");                   // Default H2 password  
dataSource.setDriverClassName("org.h2.Driver"); // H2 driver
```

**Zero configuration needed!** Spring Boot detects H2 on classpath and configures everything with sensible defaults.

### External Databases: Manual Configuration Required

**"But the moment you talk about external DBMs, it may not work."**

**Why?**

Spring Boot can't guess:
- **Where is your PostgreSQL server?** (localhost? remote server? cloud?)
- **What port?** (5432? 5433? custom?)
- **What database name?** (myapp? production? telusko?)
- **What credentials?** (username/password are unique to your setup)

**External databases require explicit configuration!**

**"So let's see. Let's try."**

---

## Step 2: Choosing Your External Database

**"So in my machine I already have a Postgres database. Doesn't matter which DBMs you have, you just have to change some thing, some configuration to make it work."**

### Popular External Databases

**"So what are you comfortable with? Postgres MySQL, Oracle. Your choice."**

| Database | Port | Use Case | Driver |
|----------|------|----------|--------|
| **PostgreSQL** | 5432 | Open-source, advanced features, JSON support | postgresql-x.x.x.jar |
| **MySQL** | 3306 | Open-source, widely used, simple | mysql-connector-java.jar |
| **Oracle** | 1521 | Enterprise, commercial, robust | ojdbc.jar |
| **SQL Server** | 1433 | Microsoft ecosystem | mssql-jdbc.jar |
| **MariaDB** | 3306 | MySQL fork, enhanced | mariadb-java-client.jar |

**All work with Spring JDBC!** The configuration pattern is identical:
1. Add driver dependency
2. Configure datasource properties

**This tutorial uses PostgreSQL**, but the concepts apply to any database.

### Prerequisites

**For PostgreSQL:**
1. **PostgreSQL installed** (download from postgresql.org)
2. **PgAdmin installed** (GUI tool for PostgreSQL management)
3. **PostgreSQL service running**

**Check if Running:**

```bash
# macOS/Linux
sudo systemctl status postgresql

# Windows
# Check Services panel for "PostgreSQL" service
```

If not installed, download from: https://www.postgresql.org/download/

---

## Step 3: Opening PgAdmin and Exploring Databases

**"So let me open Postgres and for that I'll be using Pgadmin. I want a dashboard."**

### What is PgAdmin?

**PgAdmin** is a web-based GUI tool for managing PostgreSQL databases. Think of it as:
- **MySQL Workbench** for MySQL
- **SQL Server Management Studio** for SQL Server
- **Oracle SQL Developer** for Oracle

**Launch PgAdmin:**

```
Applications → PgAdmin
Or
Browser: http://localhost:16543/browser/
```

**"Now this is a Postgres. Now in this you can see I already have three databases here."**

### PostgreSQL Default Databases

When you install PostgreSQL, you get system databases:

```
Servers
└── PostgreSQL 15
    └── Databases
        ├── postgres    ← Default admin database
        ├── template0   ← Template (don't modify)
        ├── template1   ← Template for new databases
        └── (your custom databases)
```

**What are these?**

- **postgres**: Default database for admin tasks
- **template0**: Clean template (never modified)
- **template1**: Template you can customize (new databases copy this)

**Don't delete these!** They're required for PostgreSQL to function.

---

## Step 4: Creating the "telusko" Database

**"Let me create another database here. Let me say the database name is Talisker okay."**

(Instructor says "Talisker" but likely means "telusko" based on code shown.)

### Creating Database in PgAdmin

**Steps:**

1. **Right-click on "Databases"**
2. **Create → Database**
3. **Enter Database Name:** `telusko`
4. **Owner:** postgres (default)
5. **Click "Save"**

**Command-Line Alternative:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE telusko;

# Verify
\l  -- List all databases

# Connect to it
\c telusko
```

**Result:**

```
Databases
├── postgres
├── template0
├── template1
└── telusko  ← Our new database!
```

**"That's the database. And in this database I want to create a table."**

---

## Step 5: Creating the Student Table

**"So I will just go to schema. And you know to create this table I can actually say I'm under the disco. Now I can just run the query here."**

### Opening Query Tool

**In PgAdmin:**

1. Expand **Servers → PostgreSQL 15 → Databases → telusko**
2. Right-click on **telusko**
3. Select **Query Tool**

This opens an SQL editor where you can run queries!

### Getting the Schema

**"Now which query we need to run or to create a table. So basically if you go back to your application you know we have this schema here."**

**"So if I go back to schema SQL this is the query which I want to run."**

**From our project:** `src/main/resources/schema.sql`

```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

**"So I will just paste it here because I want the same table."**

### Executing the Query

**In PgAdmin Query Tool:**

1. Paste the CREATE TABLE statement
2. Click **Execute** button (▶️) or press **F5**

**"I will just run this okay it worked."**

**Success Message:**

```
Query returned successfully in 45 msec.
```

**"You can see we got a table but where you will find it."**

### Locating the Table

**"So in Postgres you can just expand your tables. And this is where you can see student."**

**Navigation:**

```
Databases
└── telusko
    └── Schemas
        └── public  ← Default schema
            └── Tables
                └── student  ← Our new table!
```

**"And this is where you can see the columns."**

Expand **student** → **Columns**:

```
student
├── roll_number (integer, PK)
├── name (character varying(50))
└── marks (integer)
```

---

## Step 6: Inserting Sample Data

**"I want some data as well. So I will just remove this and say I want this data in my database before I do any coding."**

### Getting the Data

**From our project:** `src/main/resources/data.sql`

```sql
INSERT INTO student (roll_number, name, marks) VALUES (101, 'Kiran', 79);
INSERT INTO student (roll_number, name, marks) VALUES (102, 'Hersh', 68);
INSERT INTO student (roll_number, name, marks) VALUES (103, 'Sushil', 82);
```

**In PgAdmin Query Tool:**

1. Clear previous query
2. Paste INSERT statements
3. Execute

**"So I will run this and I hope I got this data."**

### Verifying the Data

**"The way you can check that is go to tables. I mean go to student. Uh right click on student and say view all rows."**

**Steps:**
1. Right-click on **student** table
2. Select **View/Edit Data → All Rows**

**"Of course you can also fire a query which is select star. I mean that's what it is doing for you."**

Behind the scenes, PgAdmin executes:

```sql
SELECT * FROM student;
```

**"And you can see we got this table here."**

**Result:**

```
+-------------+---------+-------+
| roll_number | name    | marks |
+-------------+---------+-------+
| 101         | Kiran   | 79    |
| 102         | Hersh   | 68    |
| 103         | Sushil  | 82    |
+-------------+---------+-------+
```

Three students inserted successfully!

---

## Step 7: The Verification Trick - Changing Hersh's Marks

**"I want to make only one change instead of having marks for herShe is 68 because that's what we have data in S2. I want to change it."**

### Why Change the Data?

**Smart verification technique!**

In our H2 data.sql, Hersh has **68 marks**.
In PostgreSQL, we'll change it to **75 marks**.

**Later, when we run the application:**
- If output shows **68** → Still using H2 (configuration didn't work!)
- If output shows **75** → Using PostgreSQL (success!)

**"So basically that's how you configure this to work with Postgres."**

This is a **marker** to confirm the data source!

### Writing the UPDATE Query

**"So I will say update. I should have done that when I was doing this, inserting the values. But anyway, I will just fire a update query."**

```sql
UPDATE student 
SET marks = 75 
WHERE roll_number = 102;
```

**"So I will say update student. Uh, set the marks to 75 where the row number is equal to 102."**

**Breakdown:**

```sql
UPDATE student          -- Table to update
SET marks = 75          -- New value
WHERE roll_number = 102 -- Which row (Hersh)
```

**"That is meant for hershe I am setting the marks as 75."**

### Executing and Verifying

**Execute the UPDATE query.**

**"And now if you say view all rows so you can see for her it is 75 now."**

**Updated Result:**

```
+-------------+---------+-------+
| roll_number | name    | marks |
+-------------+---------+-------+
| 101         | Kiran   | 79    |
| 102         | Hersh   | 75    | ← Changed from 68!
| 103         | Sushil  | 82    |
+-------------+---------+-------+
```

**"But in our H2 when we were running this, the marks were 68. So if you get 75 now you know that it is coming from Postgres, right?"**

Perfect verification strategy!

---

## Step 8: Understanding What Needs to Change in the Application

**"Okay. So let's go back to the application now."**

### Files That DON'T Need Changes

**"So I will not be using this schema and data SQL because that's only for H2."**

Wait, actually:

**schema.sql and data.sql:**
- These are for **automatic initialization** on startup
- Spring Boot runs them for embedded databases (H2, HSQLDB, Derby)
- For external databases (PostgreSQL), we manually created table/data in PgAdmin
- So these files won't be used (but keeping them doesn't hurt)

**"Even if you have that, that's no problem I will keep it here. It will not be using this."**

They're only executed for embedded databases by default!

**What About Our Code?**

**"But how exactly we are going to connect the first change we need to make. Okay, first of all I have to make I have to close all the classes here. Extra files."**

**Repository (StudentRepo.java):**

**"I will not change anything in the repo. And that's the beauty, right?"**

```java
@Repository
public class StudentRepo {
    @Autowired
    private JdbcTemplate jdbc;
    
    public void save(Student student) {
        String sql = "INSERT INTO student VALUES (?, ?, ?)";
        jdbc.update(sql, student.getRollNumber(), 
                         student.getName(), 
                         student.getMarks());
    }
    
    public List<Student> findAll() {
        String sql = "SELECT * FROM student";
        return jdbc.query(sql, (rs, rowNum) -> {
            Student s = new Student();
            s.setRollNumber(rs.getInt("roll_number"));
            s.setName(rs.getString("name"));
            s.setMarks(rs.getInt("marks"));
            return s;
        });
    }
}
```

**"Even if you want to switch your DBMs, you don't have to change your repo because nowhere we are saying hey, this is for SQL or I mean this is for MySQL, this for Postgres, this is for H2. No where we have mentioned that."**

**This is database abstraction!** Our code uses:
- Standard SQL (works on all databases)
- JdbcTemplate (database-agnostic Spring abstraction)
- No H2-specific or PostgreSQL-specific code

**"So no need to change here."**

**Service Class:**

**"No need to change our class or service class. No."**

```java
@Service
public class StudentService {
    @Autowired
    private StudentRepo repo;
    
    public void addStudent(Student student) {
        repo.save(student);
    }
    
    public List<Student> getStudents() {
        return repo.findAll();
    }
}
```

No database-specific code here either!

**Main Class:**

**"Do we have to change your main class? Of course not."**

```java
public static void main(String[] args) {
    ConfigurableApplicationContext context = 
        SpringApplication.run(SpringJdbcExampleApplication.class, args);
    
    Student s = context.getBean(Student.class);
    s.setRollNumber(104);
    s.setName("Naveen");
    s.setMarks(78);
    
    StudentService service = context.getBean(StudentService.class);
    service.addStudent(s);
    
    System.out.println(service.getStudents());
}
```

No database-specific code!

### Files That NEED Changes

**"The only thing you're going to change is your pom.xml. In fact, you have to change two files, but we'll start with Pom.xml."**

**Two files:**
1. **pom.xml** - Add PostgreSQL driver
2. **application.properties** - Configure datasource

That's it! Just configuration changes.

---

## Step 9: Replacing H2 Dependency with PostgreSQL Driver

**"Now, in the pom.xml, we have to make sure that we are not using H2 anymore. So I will comment this."**

### Current pom.xml (H2)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

### Removing H2

**Comment out or delete H2 dependency:**

```xml
<!-- H2 no longer needed
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
-->
```

**"So I don't want H2 dependency. What I want is Postgres."**

---

## Step 10: Adding PostgreSQL Driver from Maven Repository

**"So for that I will go to my browser and we'll visit this website which is Mvn repository."**

### Finding PostgreSQL Driver

**Website:** https://mvnrepository.com/

**"And here we are going to search for Postgres."**

**Search:** "postgresql" or "postgres jdbc"

**"Now this is a driver we have to add."**

**Result:** **PostgreSQL JDBC Driver**

```
Group ID: org.postgresql
Artifact ID: postgresql
```

**"So firstly for H2 you get this driver by default. But for Postgres you have to add this jar file by yourself."**

### Why Drivers Are Needed

**JDBC Driver = Database-Specific Translator**

```
Your Java Code (JDBC API)
        ↓
JDBC Driver (postgresql.jar, mysql-connector.jar, etc.)
        ↓
Database Wire Protocol
        ↓
PostgreSQL / MySQL / Oracle Database
```

Each database has its own:
- Communication protocol
- Data types
- SQL dialect
- Network format

**The driver translates generic JDBC calls to database-specific commands!**

**H2 Driver:** Included in `h2.jar` (comes with database)
**PostgreSQL Driver:** Separate jar (`postgresql-x.x.x.jar`)

### Selecting Driver Version

**"So you have to select a version. I prefer to go for any stable version. So we'll go with this."**

**Version Selection Tips:**

```
postgresql
├── 42.7.1 (Dec 2023) ← Latest stable
├── 42.6.0 (2023)
├── 42.5.4 (2023)
├── 42.3.8 (2022)
└── ... older versions
```

**Choose:**
- **Latest stable version** for new projects
- **Specific version** if you need compatibility with older PostgreSQL

**Click on version** (e.g., 42.7.1)

### Copying Maven Dependency

**"And I need this particular dependency here. So I can just say copy and paste."**

**Maven tab:**

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
</dependency>
```

**Note:** `<version>` can be omitted if Spring Boot manages it:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

Spring Boot's dependency management includes PostgreSQL driver version!

---

## Step 11: Updating pom.xml and Reloading Maven

### Adding PostgreSQL Dependency

**Paste into pom.xml:**

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    
    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

**Explanation:**

- `<scope>runtime</scope>`: Driver only needed at runtime, not compile time
- Same pattern as H2 dependency

### Reloading Maven Changes

**"Now by doing that I need of course you have to reload your uh maven changes. So I will just click there."**

**In IntelliJ:**
- **Maven tool window** → Click **Reload All Maven Projects** 🔄
- Or right-click pom.xml → **Maven → Reload Project**

**This downloads postgresql-42.x.x.jar from Maven Central!**

**"And now it will make sure that you don't have H2 in your dependency. You have Postgres."**

### Verifying the Dependency

**"So let's see if that happens. If I expand my external libraries, you can see I do have Postgres here."**

**External Libraries:**

```
External Libraries
├── Maven: org.springframework.boot:spring-boot-starter-jdbc:3.2.0
├── Maven: org.springframework:spring-jdbc:6.1.0
├── Maven: com.zaxxer:HikariCP:5.0.1
├── Maven: org.postgresql:postgresql:42.7.1  ← Added!
└── ...
```

**"So our job is done. We have added Postgres now."**

---

## Step 12: First Run Attempt - The Configuration Error

**"But will it work. Let's try. Let's see what errors you get."**

**"So I click here run this application. And if I expand this you can see we got an error."**

### The Error Message

```
***************************
APPLICATION FAILED TO START
***************************

Description:

Failed to configure a DataSource: 'url' attribute is not specified and no 
embedded datasource could be configured.

Reason: Failed to determine a suitable driver class
```

**"It says application failed to start. But why."**

**"It says the URL for data source is not specified."**

### Understanding the Error

**Why This Happens:**

With H2:
```
Spring Boot detects H2 on classpath
    ↓
"Oh, H2 is embedded database!"
    ↓
Auto-configure DataSource with defaults:
    URL: jdbc:h2:mem:testdb
    Username: sa
    Password: (empty)
    Driver: org.h2.Driver
    ↓
Application starts successfully
```

With PostgreSQL:
```
Spring Boot detects PostgreSQL on classpath
    ↓
"Oh, PostgreSQL is external database!"
    ↓
Look for datasource configuration...
    ↓
No URL found in application.properties
    ↓
ERROR: Can't configure DataSource
```

**"Because when we use a embedded database like H2 or Derby. You get all the configuration and it works by default. But since we are not using edge two, we are using a external database. We have to set this URL."**

### The JDBC Configuration Requirements

**"Now, if you remember when we talked about JDBC normal JDBC. At that point you have to configure certain things right. You have to mention the URL. You have to mention the username password and the driver."**

**Plain JDBC Setup (Refresher):**

```java
// Plain JDBC configuration
String url = "jdbc:postgresql://localhost:5432/telusko";
String username = "postgres";
String password = "0000";
String driver = "org.postgresql.Driver";

Class.forName(driver);  // Load driver
Connection conn = DriverManager.getConnection(url, username, password);
```

**"Remember the same thing you will be doing here."**

We need to provide the same four things to Spring Boot!

---

## Step 13: Configuration Options - Where to Put Datasource Config?

**"But how of course I don't want to change my repo class because then it will not make any sense, right?"**

**Bad Approach (hardcoding in repository):**

```java
@Repository
public class StudentRepo {
    public void save(Student student) {
        // DON'T DO THIS!
        String url = "jdbc:postgresql://localhost:5432/telusko";
        Connection conn = DriverManager.getConnection(url, "postgres", "0000");
        // ...
    }
}
```

**Problems:**
- Violates separation of concerns
- Can't change database without recompiling
- Credentials in code (security risk!)
- Defeats purpose of Spring configuration

**"I don't want to touch this class, so if you want to provide an extra configuration, you can use XML configuration, a separate file. You can create a bean for data source, or you can use the configuration class to achieve that."**

### Configuration Options

**Option 1: XML Configuration**
```xml
<bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
    <property name="url" value="jdbc:postgresql://localhost:5432/telusko"/>
    <property name="username" value="postgres"/>
    <property name="password" value="0000"/>
</bean>
```

**Option 2: Java Configuration Class**
```java
@Configuration
public class DatabaseConfig {
    @Bean
    public DataSource dataSource() {
        DataSource ds = new DriverManagerDataSource();
        ds.setUrl("jdbc:postgresql://localhost:5432/telusko");
        ds.setUsername("postgres");
        ds.setPassword("0000");
        return ds;
    }
}
```

**Option 3: application.properties (BEST!)**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/telusko
spring.datasource.username=postgres
spring.datasource.password=0000
```

**"The simple way is go to your resources. There is one file called application dot properties."**

---

## Step 14: Configuring Datasource in application.properties

**"So if you want to specify some properties, mentioned that here. As soon as your application loads, it will look at this file by saying okay I can see some configuration there. I can see some properties set. Let me use them so we can change the properties."**

### What is application.properties?

**Location:** `src/main/resources/application.properties`

**Purpose:** Externalized configuration for Spring Boot applications.

**Benefits:**
- ✅ **Externalized**: Change config without recompiling
- ✅ **Environment-specific**: Different properties for dev/prod
- ✅ **Spring Boot convention**: Auto-loaded on startup
- ✅ **Type-safe**: Spring Boot validates property names

**How It Works:**

```
Application starts
    ↓
Spring Boot loads application.properties
    ↓
Reads spring.datasource.* properties
    ↓
Creates DataSource bean with those values
    ↓
JdbcTemplate uses that DataSource
    ↓
Your code works without knowing database details!
```

### The Four Required Properties

**"So what are the properties we have to change. The first thing you have to change is the URL."**

**1. URL (where is the database?)**
```properties
spring.datasource.url=
```

**2. Username (authentication)**
```properties
spring.datasource.username=
```

**3. Password (authentication)**
```properties
spring.datasource.password=
```

**4. Driver Class Name (which JDBC driver to use)**
```properties
spring.datasource.driver-class-name=
```

Let's fill in each one!

---

## Step 15: Configuring the Database URL

**"So URL belongs to spring dot data source dot URL we have to set for."**

### JDBC URL Format

**"What is a URL. Now when you work with Postgres in fact any JDBC it starts with JDBC colon."**

**Generic Format:**

```
jdbc:<database-type>://<host>:<port>/<database-name>
```

**For PostgreSQL:**

```
jdbc:postgresql://localhost:5432/telusko
  ↓       ↓         ↓         ↓     ↓
 JDBC  Database   Host      Port  Database
       Type                        Name
```

**Breakdown:**

**"Then you have to mention your DBMs name which is PostgreSQL in this case."**

```
jdbc:postgresql://...
      ↑
   Database type (not "postgres", but "postgresql")
```

**"And then you have to specify the IP address which is the localhost."**

```
jdbc:postgresql://localhost:...
                   ↑
              IP or hostname
              localhost = 127.0.0.1
```

**"And then the port number. For Postgres the port number is 5432."**

```
jdbc:postgresql://localhost:5432/...
                            ↑
                        Port number
```

**"For MySQL you can use 3306 and depend upon your DBMs. You can change that."**

**Common Database Ports:**

| Database | Default Port |
|----------|--------------|
| PostgreSQL | 5432 |
| MySQL | 3306 |
| SQL Server | 1433 |
| Oracle | 1521 |
| MongoDB | 27017 |

**"And then you have to mention your database name. Database name for us is the CEO."**

(Instructor says "CEO" but means "telusko" - the database we created in PgAdmin)

```
jdbc:postgresql://localhost:5432/telusko
                                  ↑
                            Database name
```

### Setting the URL Property

**"So let's use that. So that's the first property which you have assigned. Let's keep it here."**

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/telusko
```

**For Other Databases:**

```properties
# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/telusko

# SQL Server
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=telusko

# Oracle
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:telusko
```

---

## Step 16: Configuring Username and Password

### Setting Username

**"Next is the username. Username for my Postgres is Postgres I have not changed it. It's default Postgres."**

```properties
spring.datasource.username=postgres
```

**Default PostgreSQL credentials:**
- **Username:** `postgres` (superuser account created during installation)
- Can be changed during PostgreSQL setup

**For MySQL:**
- **Username:** `root` (default superuser)

### Setting Password

**"The password for my Postgres setup is 0000. So whatever setup you have, whatever password you have set up, just use that."**

```properties
spring.datasource.password=0000
```

**Security Note:**

**For Development:** Hardcoding password in application.properties is fine.

**For Production:** Use environment variables or secrets management:

```properties
# Use environment variable
spring.datasource.password=${DB_PASSWORD}
```

Then set environment variable:

```bash
export DB_PASSWORD=super_secret_password
java -jar myapp.jar
```

Or use Spring Cloud Config, Vault, AWS Secrets Manager, etc.

---

## Step 17: Configuring the Driver Class Name

**"And then you have to mention the driver class name. The driver class name is OJ dot PostgreSQL dot driver."**

```properties
spring.datasource.driver-class-name=org.postgresql.Driver
```

**What Is This?**

The fully qualified class name of the JDBC driver.

**How to Find It?**

Look in the driver jar file:

```
postgresql-42.7.1.jar
└── org/
    └── postgresql/
        └── Driver.class  ← This class!
```

**Full class name:** `org.postgresql.Driver`

**"Now again this change is based on your DBMs."**

### Driver Class Names for Different Databases

```properties
# PostgreSQL
spring.datasource.driver-class-name=org.postgresql.Driver

# MySQL
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# SQL Server
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# Oracle
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# H2
spring.datasource.driver-class-name=org.h2.Driver
```

**"For MySQL you have to use MySQL driver for Postgres. I'm using a Postgres driver."**

---

## Step 18: Complete application.properties Configuration

**"And that's it. You have to make those four changes and I hope this will work now."**

### Final application.properties

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/telusko
spring.datasource.username=postgres
spring.datasource.password=0000
spring.datasource.driver-class-name=org.postgresql.Driver
```

**That's all!** Four simple properties.

### What Spring Boot Does With These

```java
// Spring Boot creates this automatically:
HikariDataSource dataSource = new HikariDataSource();
dataSource.setJdbcUrl("jdbc:postgresql://localhost:5432/telusko");
dataSource.setUsername("postgres");
dataSource.setPassword("0000");
dataSource.setDriverClassName("org.postgresql.Driver");

// Then creates JdbcTemplate:
JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

// Available for @Autowired in your repository!
```

**Zero Java code needed!** All configuration through properties.

---

## Step 19: Running with PostgreSQL

**"So let me just rerun this okay."**

### Starting the Application

**Click Run** or press **Shift+F10** (IntelliJ)

### Console Output (Initial Confusion)

**"And we got some problem. Looks like there is some problem. No it's just that I have wrapped the content and that's why you can see this way."**

**Line wrapping in console can make output look like errors!**

**"But if I unwrap this okay, this is how this is how it looks like."**

### Successful Output

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

... Spring startup logs ...

HikariPool-1 - Starting...
HikariPool-1 - Start completed.

1 affected
[Student{rollNumber=101, name='Kiran', marks=79}, 
 Student{rollNumber=102, name='Hersh', marks=75}, 
 Student{rollNumber=103, name='Sushil', marks=82}, 
 Student{rollNumber=104, name='Naveen', marks=78}]
```

**"So you can see we got one affected. That means the insertion was possible or worked."**

---

## Step 20: Verifying PostgreSQL Connection

### Key Output Analysis

**"This is the first object. Then we got the third object. Maybe they have. They are getting sorted by some order. Doesn't matter."**

**Data Returned:**

```
Student{rollNumber=101, name='Kiran', marks=79}
Student{rollNumber=102, name='Hersh', marks=75}  ← THE PROOF!
Student{rollNumber=103, name='Sushil', marks=82}
Student{rollNumber=104, name='Naveen', marks=78}
```

**"Then you can see we got Hirsch because Hirsch got changed later. Right."**

### The Smoking Gun

**"And now you can see we got the marks as 75."**

**Remember our verification trick?**

| Database | Hersh's Marks |
|----------|---------------|
| H2 (data.sql) | 68 |
| PostgreSQL | 75 (we updated it!) |

**Output shows 75!**

**"That means the data is coming from Postgres."**

**Proof positive!** We're reading from PostgreSQL, not H2.

**"And the new entry which we have added."**

The new student (104, Naveen, 78) was also successfully inserted into PostgreSQL!

### What We Verified

✅ **INSERT works** (1 affected)
✅ **SELECT works** (retrieved 4 students)
✅ **PostgreSQL connected** (Hersh has 75, not 68)
✅ **Data persists** (data created in PgAdmin + runtime insert both present)
✅ **No code changes needed** (repository worked as-is!)

---

## Step 21: Summary of Changes

**"So basically that's how you configure this to work with Postgres. And doesn't matter which DBMs you have, you just have to change two files actually one for the dependency and one for the configuration."**

### File Changes Required

**1. pom.xml (Dependency)**

```xml
<!-- Before: H2 -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- After: PostgreSQL -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

**2. application.properties (Configuration)**

```properties
# Add these four properties:
spring.datasource.url=jdbc:postgresql://localhost:5432/telusko
spring.datasource.username=postgres
spring.datasource.password=0000
spring.datasource.driver-class-name=org.postgresql.Driver
```

### Files That DON'T Change

✅ **Repository class** - Database-agnostic JDBC code
✅ **Service class** - Business logic unchanged
✅ **Main class** - Application logic unchanged
✅ **Model class** - POJOs unchanged
✅ **SQL queries** - Standard SQL works everywhere

**This is the power of abstraction!**

---

## Key Concepts Summary

### 1. Embedded vs External Databases

**Embedded (H2, HSQLDB, Derby):**
- Runs inside application JVM
- Auto-configured by Spring Boot
- No separate server needed
- Data lost on shutdown (in-memory mode)
- Perfect for development/testing

**External (PostgreSQL, MySQL, Oracle):**
- Separate server process
- Manual configuration required
- Production-grade
- Data persists on disk
- Scalable and robust

### 2. DataSource Configuration

**What Spring Boot Needs:**

| Property | Purpose | Example |
|----------|---------|---------|
| url | Database location | jdbc:postgresql://localhost:5432/telusko |
| username | Authentication | postgres |
| password | Authentication | 0000 |
| driver-class-name | JDBC driver | org.postgresql.Driver |

**Configuration Location:** `src/main/resources/application.properties`

### 3. JDBC URL Format

**Generic:**
```
jdbc:<db-type>://<host>:<port>/<database>
```

**Examples:**
```properties
# PostgreSQL
jdbc:postgresql://localhost:5432/mydb

# MySQL  
jdbc:mysql://localhost:3306/mydb

# SQL Server
jdbc:sqlserver://localhost:1433;databaseName=mydb

# Oracle
jdbc:oracle:thin:@localhost:1521:mydb
```

### 4. JDBC Drivers

**Purpose:** Translate JDBC calls to database-specific protocol.

**How to Add:**
1. Find driver on Maven Repository
2. Add dependency to pom.xml
3. Set driver-class-name in application.properties

**Driver Classes:**
- PostgreSQL: `org.postgresql.Driver`
- MySQL: `com.mysql.cj.jdbc.Driver`
- SQL Server: `com.microsoft.sqlserver.jdbc.SQLServerDriver`
- Oracle: `oracle.jdbc.OracleDriver`

### 5. Database Abstraction

**Repository code remains unchanged when switching databases because:**

✅ Uses standard SQL (SELECT, INSERT, UPDATE, DELETE)
✅ Uses JdbcTemplate (database-agnostic Spring abstraction)
✅ No database-specific APIs
✅ Configuration externalized to properties file

**This is separation of concerns in action!**

### 6. PgAdmin

**What:** GUI tool for PostgreSQL management.

**Features:**
- Create/manage databases
- Execute SQL queries
- View table data
- Manage users/permissions
- Monitor performance

**Similar Tools:**
- MySQL Workbench (MySQL)
- SQL Server Management Studio (SQL Server)
- Oracle SQL Developer (Oracle)

---

## Configuration for Different Databases

### MySQL Configuration

**pom.xml:**
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

**application.properties:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/telusko
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

### SQL Server Configuration

**pom.xml:**
```xml
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <scope>runtime</scope>
</dependency>
```

**application.properties:**
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=telusko
spring.datasource.username=sa
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
```

### Oracle Configuration

**pom.xml:**
```xml
<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ojdbc8</artifactId>
    <scope>runtime</scope>
</dependency>
```

**application.properties:**
```properties
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:telusko
spring.datasource.username=system
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
```

---

## Best Practices

### 1. Never Hardcode Credentials in Code

```java
// BAD - Don't do this!
@Repository
public class StudentRepo {
    private String password = "0000";  // Security risk!
}
```

```properties
# GOOD - Externalize in properties
spring.datasource.password=0000
```

### 2. Use Environment-Specific Properties

```
application.properties          ← Default/common properties
application-dev.properties      ← Development database
application-prod.properties     ← Production database
```

**Activate profile:**
```bash
java -jar myapp.jar --spring.profiles.active=prod
```

### 3. Use Environment Variables for Secrets

```properties
spring.datasource.password=${DB_PASSWORD}
```

```bash
export DB_PASSWORD=super_secret
java -jar myapp.jar
```

### 4. Explicitly Specify Driver (Optional but Recommended)

Spring Boot can auto-detect driver from URL, but being explicit is clearer:

```properties
# Explicit (better)
spring.datasource.driver-class-name=org.postgresql.Driver

# Auto-detected
# spring.datasource.driver-class-name=  (Spring Boot infers from URL)
```

### 5. Connection Pool Configuration

```properties
# HikariCP settings (optional, has good defaults)
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
```

---

## Troubleshooting Common Issues

### Issue 1: "Connection refused" Error

**Error:**
```
Connection to localhost:5432 refused
```

**Cause:** PostgreSQL server not running.

**Solution:**
```bash
# macOS/Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service in Services panel
```

### Issue 2: "Password authentication failed"

**Error:**
```
FATAL: password authentication failed for user "postgres"
```

**Cause:** Wrong password in application.properties.

**Solution:** Verify password matches PostgreSQL setup.

```bash
# Reset PostgreSQL password (if forgotten)
psql -U postgres
ALTER USER postgres PASSWORD 'newpassword';
```

### Issue 3: "Database does not exist"

**Error:**
```
FATAL: database "telusko" does not exist
```

**Cause:** Database not created in PostgreSQL.

**Solution:**
```sql
-- In PgAdmin or psql
CREATE DATABASE telusko;
```

### Issue 4: "Driver class not found"

**Error:**
```
Cannot load driver class: org.postgresql.Driver
```

**Cause:** PostgreSQL dependency not added or not reloaded.

**Solution:**
1. Verify dependency in pom.xml
2. Reload Maven project
3. Check External Libraries for postgresql jar

### Issue 5: "Table does not exist"

**Error:**
```
ERROR: relation "student" does not exist
```

**Cause:** Table not created in PostgreSQL database.

**Solution:**
```sql
-- Run in PgAdmin Query Tool
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

---

## Verification Technique Explained

### The Marker Strategy

**Problem:** How to confirm which database is actually being used?

**Solution:** Change data in target database to unique value.

**Example:**
```
H2 data.sql:    Hersh → 68 marks
PostgreSQL:     Hersh → 75 marks (manually updated)

Application output: 75
Conclusion: Using PostgreSQL ✅
```

**This technique works for:**
- Verifying database connection
- Testing environment switches (dev → production)
- Debugging configuration issues

**General Pattern:**
1. Know expected value in Database A
2. Set different value in Database B
3. Run application
4. Check output
5. Determine which database was used

---

## What's Next

**We've mastered database configuration!** Our application can now:

✅ Connect to any JDBC-compliant database
✅ Switch databases with minimal configuration changes  
✅ Persist data beyond application lifecycle
✅ Use production-grade external databases

**Future Topics:**
- Advanced JdbcTemplate features (batch operations, callbacks)
- Transaction management (@Transactional)
- Connection pooling optimization
- Spring Data JPA (even simpler database access)
- Migration tools (Flyway, Liquibase)
- Database schema versioning

**"So I hope this makes sense now. See you in the next video."**

---

## Conclusion: Production-Ready Database Access

We've successfully migrated from H2 to PostgreSQL with minimal changes:

✅ **Understood embedded vs external databases** (auto-config vs manual)
✅ **Set up PostgreSQL** with PgAdmin
✅ **Added PostgreSQL driver** to pom.xml
✅ **Configured datasource** in application.properties
✅ **Verified zero code changes** needed (abstraction works!)
✅ **Tested successfully** with verification technique
✅ **Learned universal pattern** (works for any database)

**Key Takeaway:**

**"Even if you want to switch your DBMs, you don't have to change your repo because nowhere we are saying hey, this is for SQL or I mean this is for MySQL, this for Postgres, this is for H2."**

This is the **power of Spring's database abstraction**! Write code once, run on any database.

Your application is now production-ready with PostgreSQL persistence! 🎯🗄️
