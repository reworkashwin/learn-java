# 💾 Document 39: Implementing JdbcTemplate for Database Operations

## Introduction: From Dummy Data to Real Database

In Document 38, we successfully built the service and repository layers. Everything worked beautifully—the flow was perfect:

```
Main → Service → Repository → "Saved"
```

But there was one problem: **we weren't actually saving anything to a database**. The `save()` method just printed "Saved" and `findAll()` returned an empty list. It was all dummy data to verify the architecture.

Now it's time to make it real!

The instructor announces: **"So let's add the JDBC template is because we want to store this data in database."**

This is the moment we've been building toward since Document 36. We learned the theory of Spring JDBC, we set up the project with H2, we built the layered architecture—now we're actually going to **execute SQL queries and persist data to a database**.

In this video, we're going to:

1. **Inject JdbcTemplate** into StudentRepo
2. **Write INSERT query** with prepared statement syntax
3. **Execute the query** using jdbcTemplate.update()
4. **Pass student data** as parameters
5. **Get rows affected** as confirmation
6. **Encounter "table not found" error** (learning moment!)
7. **Understand why** we need schema initialization

By the end, we'll understand how JdbcTemplate works, how to execute SQL queries with Spring JDBC, and why database schema matters. The "table not found" error at the end isn't a failure—it's a teaching moment that leads us to the next critical concept!

Let's dive in!

---

## Step 1: Understanding What H2 Provides

Before we start coding, the instructor explains what we already have:

**"I think is the moment you add your H2 in your dependency, basically you get the extra database and also the driver for it."**

Remember from Document 37, we added this dependency:

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

**What This Single Dependency Gives Us:**

1. **H2 Database Engine**: In-memory relational database (2MB!)
2. **JDBC Driver**: `org.h2.Driver` implementation
3. **H2 Console**: Web UI at `/h2-console`
4. **Embedded Mode**: Runs inside our JVM

**"So we just have to use it."**

No installation, no separate server, no complex configuration. Just add dependency and go!

---

## Step 2: Spring Boot Auto-Configuration Magic

Here's the beautiful part:

**"And by default it will have some default values. And you don't have to actually configure anything. By default you will get the configuration."**

**What Spring Boot Auto-Configures:**

When Spring Boot detects H2 on the classpath, it automatically:

1. **Creates DataSource**:
   ```java
   // Spring Boot creates this automatically!
   DataSource dataSource = new HikariDataSource();
   dataSource.setJdbcUrl("jdbc:h2:mem:testdb");
   dataSource.setUsername("sa");
   dataSource.setPassword("");
   ```

2. **Configures Connection Pool**:
   ```java
   // HikariCP configured automatically
   HikariConfig config = new HikariConfig();
   config.setMaximumPoolSize(10);
   config.setMinimumIdle(5);
   // ... more settings
   ```

3. **Creates JdbcTemplate Bean**:
   ```java
   // Spring creates this bean automatically!
   @Bean
   public JdbcTemplate jdbcTemplate(DataSource dataSource) {
       return new JdbcTemplate(dataSource);
   }
   ```

4. **Enables H2 Console**:
   ```java
   // Accessible at http://localhost:8080/h2-console
   spring.h2.console.enabled=true  // Auto-enabled in development
   ```

**Default Configuration Values:**

```properties
# All these are set automatically (you don't need to configure)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
```

**"You just have to use a template to save data."**

Everything is ready! We just need to inject `JdbcTemplate` and start using it.

**"Of course if you want to customize it, that's a different thing. But by default you will get the values."**

**Customization Example** (optional):

```properties
# application.properties - if you want to customize
spring.datasource.url=jdbc:h2:mem:mydb  # Different DB name
spring.datasource.username=admin        # Different username
spring.datasource.password=secret123    # Add password
spring.h2.console.path=/my-console      # Custom console path
```

But for learning, defaults are perfect!

---

## Step 3: Preparing the Workspace

Before diving into code, the instructor does some IDE organization:

**"So what I will do here is first of all, let me take this to the right top. I want this, my output to be here. Let's minimize this project okay."**

**IntelliJ Workspace Tips:**

These aren't required but make coding more comfortable:
- **Move console** to side or bottom for easy viewing
- **Minimize project structure** when not needed (more editor space)
- **Split editor** if comparing files
- **Focus mode** when concentrating on one file

**"So now what I will do is first of all I want to add a student right now. For this we need a template."**

We're ready to code!

---

## Step 4: Injecting JdbcTemplate into Repository

Now we enter the repository class to add database capabilities:

**"So what I will do is I will just go back here and say private. Let's create a reference for JDBC template. That's this."**

### Declaring the JdbcTemplate Dependency

```java
package com.telusko.springjdbcexample.repository;

import com.telusko.springjdbcexample.model.Student;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;

@Repository
public class StudentRepo {
    
    private JdbcTemplate jdbc;  // Dependency declared
    
    public void save(Student student) {
        System.out.println("Saved");
    }
    
    public List<Student> findAll() {
        return new ArrayList<>();
    }
}
```

**What is JdbcTemplate?**

From Document 36, we learned that `JdbcTemplate` is Spring's class that:
- Simplifies JDBC operations
- Eliminates boilerplate code
- Handles connections automatically
- Manages resources (open/close)
- Translates exceptions
- Provides query methods

**Comparison:**

**Plain JDBC (50+ lines):**
```java
Connection conn = null;
PreparedStatement ps = null;
try {
    conn = DriverManager.getConnection(url, user, pwd);
    ps = conn.prepareStatement("INSERT INTO student VALUES (?, ?, ?)");
    ps.setInt(1, student.getRollNumber());
    ps.setString(2, student.getName());
    ps.setInt(3, student.getMarks());
    ps.executeUpdate();
} catch (SQLException e) {
    throw new RuntimeException(e);
} finally {
    try { if (ps != null) ps.close(); } catch (SQLException e) {}
    try { if (conn != null) conn.close(); } catch (SQLException e) {}
}
```

**JdbcTemplate (3 lines):**
```java
String sql = "INSERT INTO student VALUES (?, ?, ?)";
jdbcTemplate.update(sql, student.getRollNumber(), 
                    student.getName(), student.getMarks());
```

**90% code reduction!**

### Naming the Variable

**"And we'll say this name as database itself. You can have different name. Doesn't matter. But let's use JDBC here."**

**Naming Options:**

```java
// Option 1: jdbc (what instructor chose)
private JdbcTemplate jdbc;

// Option 2: jdbcTemplate (most common)
private JdbcTemplate jdbcTemplate;

// Option 3: template
private JdbcTemplate template;

// Option 4: database (more generic)
private JdbcTemplate database;
```

All are valid! Choose what makes sense to you. The instructor chose `jdbc` for brevity.

---

## Step 5: Setting Up Autowiring

Just like we did with StudentRepo in StudentService (Document 38), we need to inject JdbcTemplate:

**"And now for this particular variable we need to have getters and setters. So I will just right click here and say generate get and setters for this particular variable. Yes. And we got it."**

### Generating Setter Method

**In IntelliJ:**
1. Right-click on `private JdbcTemplate jdbc;`
2. Generate → Getter and Setter
3. Select `jdbc`
4. Click OK

**Generated Code:**

```java
@Repository
public class StudentRepo {
    
    private JdbcTemplate jdbc;
    
    public JdbcTemplate getJdbc() {
        return jdbc;
    }
    
    public void setJdbc(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }
    
    public void save(Student student) {
        System.out.println("Saved");
    }
    
    public List<Student> findAll() {
        return new ArrayList<>();
    }
}
```

### Adding @Autowired

**"Also we want this to be auto wired."**

```java
@Repository
public class StudentRepo {
    
    private JdbcTemplate jdbc;
    
    public JdbcTemplate getJdbc() {
        return jdbc;
    }
    
    @Autowired  // Spring will inject JdbcTemplate bean
    public void setJdbc(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }
    
    // ... rest of code
}
```

**Import needed:**
```java
import org.springframework.beans.factory.annotation.Autowired;
```

**What Happens at Runtime:**

```
Spring Boot Startup
    ↓
Auto-Configuration
    ├─ Creates DataSource (H2 connection)
    ├─ Creates JdbcTemplate (with DataSource)
    ├─ Scans @Repository classes
    ├─ Finds StudentRepo
    ├─ Sees @Autowired on setJdbc()
    └─ Calls setJdbc(jdbcTemplate) with the bean
    
Result: jdbc field populated with working JdbcTemplate!
```

**"Now who is responsible to create the instance for this spring will do it. You don't have to worry about it."**

We never write `new JdbcTemplate()`—Spring creates it, configures it, and injects it!

---

## Step 6: Understanding What's Happening Behind the Scenes

The instructor explains the magic:

**"So behind the scene it will use data source to add data. And it will also instantiate the database variable or the object, let's say auto wire."**

### The Complete Dependency Chain

```
H2 Dependency (in pom.xml)
    ↓
Spring Boot Auto-Configuration
    ↓
DataSource Bean Created
    ├─ URL: jdbc:h2:mem:testdb
    ├─ Driver: org.h2.Driver
    ├─ Pool: HikariCP
    ↓
JdbcTemplate Bean Created
    ├─ Uses DataSource
    ├─ Configured by Spring
    ↓
@Autowired in StudentRepo
    ├─ Spring finds JdbcTemplate bean
    ├─ Calls setJdbc(jdbcTemplate)
    ↓
jdbc field ready to use!
```

**DataSource Role:**

`JdbcTemplate` doesn't manage connections directly. It delegates to `DataSource`:

```java
// Inside JdbcTemplate (simplified)
public class JdbcTemplate {
    private DataSource dataSource;
    
    public int update(String sql, Object... args) {
        Connection conn = dataSource.getConnection();  // Get from pool
        PreparedStatement ps = conn.prepareStatement(sql);
        // Set parameters, execute
        return ps.executeUpdate();
        // Return connection to pool (automatic)
    }
}
```

**DataSource** provides:
- Connection pooling (HikariCP)
- Connection reuse (performance!)
- Automatic resource management
- Thread-safe access

**"That's it. Nothing fancy. We just created one particular reference here for template."**

One field + one annotation = database access ready!

---

## Step 7: Implementing save() with JdbcTemplate

Now for the real work—actually saving data to the database:

**"Now using this template I want to save the data. Right. So instead of saying added what I will do is let's use JDBC dot."**

### Exploring JdbcTemplate Methods

**"Now if you can see we have a lot of methods here."**

**In IntelliJ:** Type `jdbc.` and press Ctrl+Space to see all methods.

**JdbcTemplate Methods Overview:**

```java
// UPDATE operations (INSERT, UPDATE, DELETE)
int update(String sql, Object... args)
int[] batchUpdate(String sql, List<Object[]> batchArgs)

// QUERY operations (SELECT)
<T> List<T> query(String sql, RowMapper<T> rowMapper, Object... args)
<T> T queryForObject(String sql, RowMapper<T> rowMapper, Object... args)
<T> T queryForObject(String sql, Class<T> requiredType, Object... args)
List<Map<String, Object>> queryForList(String sql, Object... args)

// EXECUTE operations (DDL - CREATE, DROP, ALTER)
void execute(String sql)

// And many more...
```

**Hundreds of methods!** But don't worry, we'll focus on the essential ones.

---

## Step 8: Understanding execute() vs update() vs query()

Before choosing a method, the instructor teaches the fundamental JDBC concepts:

**"Now if you know JDBC, the actual concept of Java database connectivity. And if you want to execute a query we have two options. In fact we have three. But let's talk about it two."**

### The Two Main Categories

**"So we have execute update and we have execute query."**

**In Plain JDBC:**

```java
Statement stmt = conn.createStatement();

// For INSERT, UPDATE, DELETE
int rows = stmt.executeUpdate("INSERT INTO student VALUES (...)");
// Returns: number of rows affected

// For SELECT
ResultSet rs = stmt.executeQuery("SELECT * FROM student");
// Returns: ResultSet with data
```

**The Rule:**

**"Now when you want to update data like inserting updating deleting that's what we use execute update. And when you want to fire a Select query we use execute query."**

**DML Operations (Data Manipulation Language):**

```sql
-- Use executeUpdate() / update()
INSERT INTO student VALUES (101, 'Naveen', 78);
UPDATE student SET marks = 85 WHERE roll_number = 101;
DELETE FROM student WHERE roll_number = 101;
```

All these **modify data**, so they use `executeUpdate()` which returns the number of rows affected.

**DQL Operations (Data Query Language):**

```sql
-- Use executeQuery() / query()
SELECT * FROM student;
SELECT * FROM student WHERE marks > 80;
SELECT AVG(marks) FROM student;
```

All these **retrieve data**, so they use `executeQuery()` which returns a `ResultSet`.

### Spring's Simplified Method Names

**"Now in this case we will make the method shorter. I mean they have made the word shorter. So instead of using execute update we are going to use only update okay which is actually execute update behind the scene."**

**Naming Comparison:**

```
Plain JDBC              JdbcTemplate
----------              ------------
executeUpdate()    →    update()      (shorter!)
executeQuery()     →    query()       (shorter!)
execute()          →    execute()     (same)
```

Spring made the API cleaner and more intuitive!

**For Our INSERT:**

We're inserting a student, which modifies data, so we use:

```java
jdbc.update(...)  // Executes INSERT/UPDATE/DELETE
```

---

## Step 9: Understanding update() Method Parameters

**"In this we have to pass some parameters. So if you say control space you can see we have multiple options here."**

**update() Method Overloads:**

```java
// Option 1: SQL with varargs parameters (most common)
int update(String sql, Object... args)

// Option 2: SQL with PreparedStatementSetter
int update(String sql, PreparedStatementSetter pss)

// Option 3: SQL with PreparedStatementCreator
int update(PreparedStatementCreator psc)

// Option 4: SQL with PreparedStatementCreator and KeyHolder
int update(PreparedStatementCreator psc, KeyHolder generatedKeyHolder)

// And more...
```

**"So we are going to use one thing where you pass a query. So the first parameter would be query. And the remaining parameter will be your values."**

**We'll use:**

```java
int update(String sql, Object... args)
```

**Parameters:**
1. `String sql` - The SQL query with `?` placeholders
2. `Object... args` - Variable number of arguments to replace `?`

**The Varargs Magic (`Object... args`):**

```java
// These are all valid calls:
jdbc.update(sql);                    // No parameters
jdbc.update(sql, param1);            // 1 parameter
jdbc.update(sql, param1, param2);    // 2 parameters
jdbc.update(sql, param1, param2, param3);  // 3 parameters
// ... as many as needed
```

Spring will map them to the `?` placeholders in order!

---

## Step 10: Writing the INSERT SQL Query

**"Remember when we talked about prepare statement we could use question marks there. So same thing we can do here."**

### Prepared Statement Syntax

From JDBC fundamentals, we know **Prepared Statements** use `?` as placeholders:

```java
// Plain JDBC PreparedStatement
String sql = "INSERT INTO student VALUES (?, ?, ?)";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setInt(1, 101);        // Replace first ?
ps.setString(2, "Naveen"); // Replace second ?
ps.setInt(3, 78);          // Replace third ?
ps.executeUpdate();
```

**Benefits of Prepared Statements:**
1. **SQL Injection Prevention**: Values are escaped automatically
2. **Type Safety**: Database validates types
3. **Performance**: Query is pre-compiled and cached
4. **Readability**: Separates SQL structure from data

**Same concept in JdbcTemplate!**

### Creating the SQL String

**"So let's create a query for this. So I will say string SQL is equal to. And let's write a query here."**

```java
public void save(Student student) {
    String sql = "INSERT INTO student VALUES (?, ?, ?)";
    // More code coming...
}
```

**Wait!** The instructor provides more detail:

**"So this is your insert into student. And we have to specify which particular properties we are going to add."**

**Better SQL Syntax** (explicit columns):

```java
String sql = "INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)";
```

**Why specify columns?**

```sql
-- Implicit columns (brittle)
INSERT INTO student VALUES (?, ?, ?)
-- Problem: If table structure changes (new column added), this breaks!

-- Explicit columns (robust)
INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)
-- Benefit: Only inserts specified columns, ignores others
```

**"So I'm going to add row number name and marks. These are three variables we have."**

**Table Structure Reminder:**

```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

Three columns = three values needed!

**"And let's add values. Now since we don't have values at this point I will put question marks there. So in total we need three question marks right."**

**Complete SQL:**

```java
String sql = "INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)";
```

**SQL Breakdown:**

```
INSERT INTO student         -- Target table
(roll_number, name, marks)  -- Columns to insert
VALUES (?, ?, ?)            -- Values (placeholders)
       ↑  ↑  ↑
       |  |  |
    Column 1, 2, 3 in order
```

---

## Step 11: Passing Values to Replace Placeholders

**"So in the prepared statement we do the same thing in the JDBC dot update. You just have to pass this query."**

**Current code:**

```java
public void save(Student student) {
    String sql = "INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)";
    jdbc.update(sql);  // Not enough! Need to replace ?
}
```

**"But don't you think we have some question marks which we have to replace."**

Yes! Three `?` placeholders need three values.

**"So this question mark will be replaced by the actual values. The actual values are there in the student object right."**

### Extracting Values from Student Object

The `student` parameter has all the data we need:

```java
student.getRollNumber()  // 101
student.getName()        // "Naveen"
student.getMarks()       // 78
```

**"So I will say s dot get row number comma s dot get not marks name because that's the sequence. And then s dot get marks."**

**Complete update() Call:**

```java
public void save(Student student) {
    String sql = "INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)";
    jdbc.update(sql, 
                student.getRollNumber(),  // Replace first ?
                student.getName(),        // Replace second ?
                student.getMarks());      // Replace third ?
}
```

**What JdbcTemplate Does:**

```java
// Internally (simplified):
PreparedStatement ps = conn.prepareStatement(sql);
ps.setInt(1, student.getRollNumber());     // Set ? #1
ps.setString(2, student.getName());        // Set ? #2  
ps.setInt(3, student.getMarks());          // Set ? #3
int rows = ps.executeUpdate();
ps.close();
return rows;
```

All the boilerplate is handled automatically!

---

## Step 12: Parameter Order is Critical!

**"You have to make sure that the sequence are matching."**

This is **crucial**! The order of arguments must match the order of `?` in SQL.

**"So the first question mark is your row number. The second question mark is for the name. And the third question mark is for the marks."**

**Correct Order:**

```java
INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)
                     ↓           ↓     ↓
jdbc.update(sql, rollNumber, name, marks);  ✅
```

**Wrong Order (bug!):**

```java
INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)
                     ↓           ↓     ↓
jdbc.update(sql, name, marks, rollNumber);  ❌
// Tries to set:
// roll_number = "Naveen" (STRING in INT column - ERROR!)
// name = 78 (INT in STRING column)
// marks = 101 (wrong value in wrong place)
```

**Visual Mapping:**

```
SQL:            INSERT INTO student (roll_number, name,     marks) VALUES (?, ?,      ?)
                                     ↓           ↓         ↓              ↓  ↓       ↓
Arguments:      jdbc.update(sql,                                          101, "Naveen", 78)
                                                                           ↓  ↓       ↓
PreparedStatement:                                                         1st, 2nd,     3rd ?
```

**The Rule:** Arguments are mapped to `?` placeholders **positionally** (by order), not by name!

---

## Step 13: Getting the Return Value

**"And that's it. This should work."**

Almost! But there's one more thing:

**"How do we know if it will work. So if I click on update you can see update returns a integer value. That means the number of rows affected."**

### Understanding the Return Value

**update() Signature:**

```java
int update(String sql, Object... args)
```

Returns `int` - the number of rows affected by the operation.

**Possible Return Values:**

```java
int rows = jdbc.update(sql, args);

// rows = 0  → No rows inserted (failure or constraint violation)
// rows = 1  → 1 row inserted (success for single INSERT)
// rows = 5  → 5 rows inserted (success for batch or multi-row INSERT)
```

**For Our Case:**

```java
INSERT INTO student VALUES (?, ?, ?)  // Single row INSERT
```

Expected: `rows = 1` (one row inserted)

### Capturing and Printing Result

**"So I can say int rows and I can print the number. I can say rows plus affected."**

```java
public void save(Student student) {
    String sql = "INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)";
    int rows = jdbc.update(sql, 
                           student.getRollNumber(),
                           student.getName(),
                           student.getMarks());
    System.out.println(rows + " affected");
}
```

**Expected Output:**

```
1 affected
```

**Why This Matters:**

```java
// Validation example
public void save(Student student) {
    String sql = "INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)";
    int rows = jdbc.update(sql, 
                           student.getRollNumber(),
                           student.getName(),
                           student.getMarks());
    
    if (rows == 0) {
        throw new RuntimeException("Failed to save student!");
    }
    
    System.out.println(rows + " affected");
}
```

The return value tells you if the operation succeeded!

**"So at least we'll know something has changed. If it is zero then that means the data is not added. If it is one, data is added."**

---

## Step 14: Complete save() Implementation

Let's see the complete implementation:

```java
package com.telusko.springjdbcexample.repository;

import com.telusko.springjdbcexample.model.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;

@Repository
public class StudentRepo {
    
    private JdbcTemplate jdbc;
    
    @Autowired
    public void setJdbc(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }
    
    public void save(Student student) {
        String sql = "INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)";
        int rows = jdbc.update(sql, 
                               student.getRollNumber(),
                               student.getName(),
                               student.getMarks());
        System.out.println(rows + " affected");
    }
    
    public List<Student> findAll() {
        // Still returning dummy data - we'll implement this later
        return new ArrayList<>();
    }
}
```

**Code Summary:**

1. ✅ JdbcTemplate injected via `@Autowired`
2. ✅ SQL query with prepared statement placeholders
3. ✅ Arguments passed in correct order
4. ✅ Return value captured and printed
5. ✅ All JDBC boilerplate handled by Spring

**From 50+ lines of plain JDBC to 6 lines with JdbcTemplate!**

---

## Step 15: No Configuration Required!

Before running, the instructor emphasizes something important:

**"And what do you think? Will it work?"**

**"We're just using database template. We have not done any configuration."**

**What We DIDN'T Have to Do:**

```java
// ❌ No manual DataSource creation
DataSource ds = new HikariDataSource();
ds.setJdbcUrl("jdbc:h2:mem:testdb");

// ❌ No manual JdbcTemplate creation  
JdbcTemplate template = new JdbcTemplate(ds);

// ❌ No manual configuration
@Bean
public DataSource dataSource() { ... }

@Bean
public JdbcTemplate jdbcTemplate(DataSource ds) { ... }
```

**All Done Automatically by Spring Boot!**

Just these two dependencies:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
</dependency>
```

And Spring Boot:
1. Creates H2 DataSource
2. Creates JdbcTemplate bean
3. Makes them available for injection

**Zero configuration needed!** This is Spring Boot's auto-configuration power.

---

## Step 16: The Learning Moment - Running and Expecting Errors

**"Let's see what errors you get because you learn from the errors. Right."**

This is **excellent teaching philosophy**! Errors aren't failures—they're learning opportunities.

**"So I will just run this code here and let's see what happens."**

**Current Main Method** (from Document 38):

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
        service.addStudent(s);  // This will call jdbc.update()
        
        List<Student> students = service.getStudents();
        System.out.println(students);
    }
}
```

**Expected Flow:**

```
Main
  └─ service.addStudent(s)
      └─ StudentService.addStudent()
          └─ repo.save(student)
              └─ StudentRepo.save()
                  └─ jdbc.update(sql, ...)
                      └─ Execute INSERT query
                          └─ Database stores data
                              └─ Print "1 affected"
```

Let's run it!

---

## Step 17: The "Table Not Found" Error

**"Okay we got error. So let's see what the error is."**

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

Exception in thread "main" org.springframework.jdbc.BadSqlGrammarException: 
PreparedStatementCallback; bad SQL grammar [INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)]; 
nested exception is org.h2.jdbc.JdbcSQLSyntaxErrorException: 
Table "STUDENT" not found; SQL statement:
INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?) [42102-200]
```

**"So ETA is it says the table should not found."**

The error message is clear:

```
Table "STUDENT" not found
```

---

## Step 18: Understanding the Problem

**"Oh that's weird. Actually you know we do have the data DBMs which is two. We do have a database but we don't have a table."**

**What We Have:**

```
✅ H2 Database Engine (in-memory)
✅ Database Created: jdbc:h2:mem:testdb
✅ DataSource Bean
✅ JdbcTemplate Bean
✅ Connection Pool (HikariCP)
```

**What We DON'T Have:**

```
❌ STUDENT table
❌ Table schema definition
❌ Table columns (roll_number, name, marks)
```

**The Realization:**

An **empty database** was created, but it has **no tables**!

**Real-World Analogy:**

Imagine you build a beautiful filing cabinet (database) but forget to put any folders (tables) inside it. When you try to file a document (insert data), you realize there's nowhere to put it!

**"We have not asked our H two to create a table for us. That's something we are missing."**

### Why H2 Can't Create Tables Automatically

Unlike some ORMs (like Hibernate with JPA), H2 doesn't automatically create tables based on your Java classes:

```java
// This Student class...
@Component
public class Student {
    private int rollNumber;
    private String name;
    private int marks;
}

// Doesn't automatically create this table:
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

**You must explicitly define the table schema!**

---

## Step 19: How to Create Database Tables

**"So how do we create that table."**

**Options for Creating Tables:**

### Option 1: Manual SQL Execution (Not Scalable)
```java
@PostConstruct
public void createTable() {
    jdbc.execute("CREATE TABLE student (roll_number INT PRIMARY KEY, name VARCHAR(50), marks INT)");
}
```

**Problems:**
- Mix database schema with application code
- Hard to version control schema changes
- Runs every time application starts (errors on subsequent runs)

### Option 2: schema.sql File (Spring Boot Convention) ✅
```sql
-- src/main/resources/schema.sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

**Benefits:**
- Separate SQL from Java code
- Spring Boot automatically executes on startup
- Easy to version control
- Clear separation of concerns

### Option 3: Flyway/Liquibase (Production-Grade)
```sql
-- db/migration/V1__create_student_table.sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

**Benefits:**
- Database migration versioning
- Rollback support
- Track schema evolution
- Production-ready

**For Learning:** We'll use **Option 2 (schema.sql)** - Spring Boot's built-in mechanism!

---

## Step 20: Preview - Populating Initial Data

The instructor mentions another important concept:

**"And also maybe I want to populate data before we do all this operation."**

**Why Populate Data?**

Sometimes you want **sample data** in your database for:
- Testing without manual entry
- Demo purposes
- Development environment setup
- Unit/integration test fixtures

**Spring Boot Supports data.sql:**

```sql
-- src/main/resources/data.sql
INSERT INTO student (roll_number, name, marks) VALUES (101, 'Rahul', 85);
INSERT INTO student (roll_number, name, marks) VALUES (102, 'Priya', 92);
INSERT INTO student (roll_number, name, marks) VALUES (103, 'Amit', 78);
```

Spring Boot will:
1. Execute `schema.sql` (create tables)
2. Execute `data.sql` (insert sample data)
3. Then start your application

**The Sequence:**

```
Application Startup
    ↓
1. schema.sql executes
   └─ CREATE TABLE student ...
    ↓
2. data.sql executes (optional)
   └─ INSERT INTO student ...
    ↓
3. Application runs
   └─ Your code can query pre-populated data
```

---

## Step 21: Setting Up for Next Video

**"How do you populate the data and how do you create a schema. Let's see that in the next video."**

**What's Coming in Document 40:**

1. **Create schema.sql**: Define STUDENT table structure
2. **Create data.sql**: Add sample data (optional)
3. **Configure Spring Boot**: Tell it to use schema initialization
4. **Re-run Application**: See successful INSERT!
5. **Query Data**: Implement findAll() to retrieve students
6. **H2 Console**: View data in web interface

**The Complete Picture:**

```
Document 36: Learn Spring JDBC theory
Document 37: Create project, add dependencies, build Student model
Document 38: Build service & repository layers (architecture)
Document 39: Implement JdbcTemplate (database operations) ← Current
Document 40: Create database schema, see data persist ← Next
```

---

## Key Concepts Summary

### 1. JdbcTemplate
**Purpose**: Spring's class to simplify JDBC operations.

**Benefits:**
- Eliminates boilerplate (90% code reduction)
- Automatic resource management
- Exception translation
- Connection pooling integration

**Usage:**
```java
@Autowired
private JdbcTemplate jdbcTemplate;

jdbcTemplate.update("INSERT INTO student VALUES (?, ?, ?)", 
                    rollNumber, name, marks);
```

### 2. Spring Boot Auto-Configuration
**What's Auto-Configured:**
- DataSource bean (H2 connection)
- JdbcTemplate bean
- Connection pool (HikariCP)
- H2 console

**Zero configuration needed!**

### 3. update() Method
**Purpose**: Execute INSERT, UPDATE, DELETE queries.

**Signature:**
```java
int update(String sql, Object... args)
```

**Returns:** Number of rows affected

**Example:**
```java
int rows = jdbc.update("INSERT INTO student VALUES (?, ?, ?)", 101, "Naveen", 78);
// rows = 1 (one row inserted)
```

### 4. Prepared Statements
**Syntax:** Use `?` as placeholders

**Benefits:**
- SQL injection prevention
- Type safety
- Performance (query caching)
- Readability

**Parameter Mapping:**
```java
INSERT INTO student (col1, col2, col3) VALUES (?, ?, ?)
                     ↓     ↓     ↓
jdbc.update(sql, value1, value2, value3);
```

**Order matters!** Parameters mapped positionally.

### 5. executeUpdate() vs executeQuery()
**executeUpdate() / update():**
- For DML: INSERT, UPDATE, DELETE
- Returns: int (rows affected)

**executeQuery() / query():**
- For SELECT queries
- Returns: ResultSet / List

### 6. Database Schema
**Concept:** Table structure must exist before inserting data.

**Error:** `Table "STUDENT" not found`

**Solution:** Create schema using:
- schema.sql file
- Manual SQL execution
- Database migration tools (Flyway/Liquibase)

### 7. schema.sql and data.sql
**schema.sql:** Create tables (DDL)
```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

**data.sql:** Insert sample data (DML)
```sql
INSERT INTO student VALUES (101, 'Rahul', 85);
```

Spring Boot executes these automatically on startup!

---

## Complete Code Review

**StudentRepo.java (with JdbcTemplate):**

```java
package com.telusko.springjdbcexample.repository;

import com.telusko.springjdbcexample.model.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;

@Repository
public class StudentRepo {
    
    private JdbcTemplate jdbc;
    
    @Autowired
    public void setJdbc(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }
    
    public void save(Student student) {
        String sql = "INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?)";
        int rows = jdbc.update(sql, 
                               student.getRollNumber(),
                               student.getName(),
                               student.getMarks());
        System.out.println(rows + " affected");
    }
    
    public List<Student> findAll() {
        // TODO: Implement with SELECT query
        return new ArrayList<>();
    }
}
```

**What Works:**
- ✅ JdbcTemplate injection
- ✅ SQL query with prepared statement
- ✅ Parameter passing
- ✅ Return value handling

**What's Missing:**
- ❌ Database table (schema.sql needed)
- ❌ findAll() implementation

---

## Learning from the Error

The instructor's wisdom: **"Let's see what errors you get because you learn from the errors. Right."**

**What We Learned:**

1. **JdbcTemplate is easy to use** - Just inject and call methods
2. **SQL syntax is straightforward** - Prepared statements with `?`
3. **Spring Boot does heavy lifting** - Auto-configuration is magical
4. **Databases need schema** - Tables don't create themselves
5. **Errors are instructive** - "Table not found" clearly shows what's missing

**The Error-Driven Development Cycle:**

```
1. Write code
2. Run it
3. Get error
4. Understand error
5. Fix issue
6. Repeat until success
```

This is **normal** and **healthy** in software development! Every error teaches you something.

---

## What's Next

In Document 40, we'll:

1. **Create schema.sql**:
   ```sql
   CREATE TABLE student (
       roll_number INT PRIMARY KEY,
       name VARCHAR(50),
       marks INT
   );
   ```

2. **Optionally create data.sql** for sample data

3. **Configure Spring Boot** (if needed)

4. **Re-run the application** and see:
   ```
   1 affected
   ```

5. **Implement findAll()** with SELECT query

6. **Explore H2 Console** to see persisted data

**The Payoff:** Finally see data actually saved to and retrieved from a database!

---

## Conclusion: So Close to Success!

We accomplished a lot:

✅ **Injected JdbcTemplate** into repository
✅ **Wrote INSERT SQL** with prepared statement syntax
✅ **Called jdbc.update()** with correct parameters
✅ **Understood parameter ordering** and return values
✅ **Learned about auto-configuration** (no manual setup needed)
✅ **Encountered meaningful error** (table not found)
✅ **Identified the solution** (schema.sql needed)

**Current State:**
- Code is correct
- SQL is correct
- Configuration is automatic
- Only missing: database schema

**One File Away from Success:**

```
src/main/resources/schema.sql  ← Create this!
```

The instructor left us at a perfect teaching moment. The error isn't a failure—it's the bridge to understanding database schema initialization!

Next video: We create that schema and watch everything work beautifully! 🎯
