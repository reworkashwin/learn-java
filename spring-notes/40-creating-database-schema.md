# 🗄️ Document 40: Creating Database Schema and Initial Data with schema.sql

## Introduction: From Error to Solution

In Document 39, we hit a wall. We wrote perfect JdbcTemplate code to save a student to the database, but when we ran it, we got this error:

```
Table "STUDENT" not found
```

The instructor explained: **"We do have the data DBMs which is two. We do have a database but we don't have a table. We have not asked our H two to create a table for us."**

An empty database exists, but it has no tables. It's like having a filing cabinet with no folders—you can't file anything!

Now it's time to fix this. We need to create the database schema (table structure) so our INSERT queries have somewhere to store data.

The instructor announces: **"Okay, so it's time to create this schema."**

In this video, we're going to:

1. **Understand schema creation options** (manual vs file-based)
2. **Create schema.sql file** in resources folder
3. **Write CREATE TABLE statement** for student table
4. **Create data.sql file** for sample data
5. **Write INSERT statements** to pre-populate database
6. **Run the application** and see it work!
7. **Fix SQL syntax error** (double quotes vs single quotes)
8. **Verify success** with "1 affected" message
9. **Set up for next video** (implementing findAll())

By the end, we'll have a database with a proper table structure, pre-loaded sample data, and working INSERT operations. The architecture will be complete and functional!

Let's create that schema!

---

## Step 1: Understanding Schema Creation Options

Before diving into the solution, the instructor explains the traditional approach:

**"Now how do you create a schema? So normally when you have a DBMs let's say a Postgres or MySQL, basically you can open that software and you can write the query to create the schema. And then it will work. Right."**

### Traditional Database Setup (MySQL/PostgreSQL)

**With Standalone Databases:**

1. **Install Database Server**:
   ```bash
   # PostgreSQL
   sudo apt-get install postgresql
   
   # MySQL
   sudo apt-get install mysql-server
   ```

2. **Start Database Server**:
   ```bash
   sudo service postgresql start
   sudo service mysql start
   ```

3. **Connect with Client**:
   ```bash
   # PostgreSQL
   psql -U postgres
   
   # MySQL
   mysql -u root -p
   ```

4. **Create Schema Manually**:
   ```sql
   CREATE DATABASE myapp;
   USE myapp;
   CREATE TABLE student (
       roll_number INT PRIMARY KEY,
       name VARCHAR(50),
       marks INT
   );
   ```

5. **Then Run Your Application**:
   ```bash
   java -jar myapp.jar
   ```

**This approach requires:**
- Database installation and setup
- Manual schema creation
- Keeping SQL scripts in sync with application
- Different process for each developer

**For production:** This is fine! Databases are usually managed separately.

**For development/learning:** Too much overhead! We want to focus on Spring, not database administration.

---

## Step 2: The H2 Challenge - No Console Yet

**"But since we are using H2 and we are not using a web application to get the H2 console..."**

**Why No H2 Console?**

H2 includes a web-based console to manage the database:

```
http://localhost:8080/h2-console
```

But we haven't built a web application yet! Our application is just a console app with a `main()` method:

```java
public static void main(String[] args) {
    // Just a console application
    ConfigurableApplicationContext context = 
        SpringApplication.run(SpringJdbcExampleApplication.class, args);
    // ...
}
```

**No web server = No H2 console access (yet!)**

**Solution Preview:**

Later, when we add Spring Web, we'll access H2 console like this:

```properties
# application.properties
spring.h2.console.enabled=true
```

Visit `http://localhost:8080/h2-console` and manage database visually!

But for now, we need a different approach...

---

## Step 3: Spring Boot's Schema File Convention

The instructor introduces the elegant solution:

**"What you can do is if you want to create a schema in the resource folder, you can actually create a schema."**

**Spring Boot Convention:**

Spring Boot looks for these files in `src/main/resources/`:

1. **schema.sql**: Database schema (CREATE TABLE statements)
2. **data.sql**: Initial data (INSERT statements)

If these files exist, Spring Boot automatically:
1. Executes `schema.sql` on startup (creates tables)
2. Executes `data.sql` on startup (inserts sample data)
3. Then starts your application

**Zero configuration needed!** Just create the files and Spring Boot handles the rest.

**The Magic Happens Because:**

Spring Boot's `spring-boot-autoconfigure` detects:
- JDBC on classpath (spring-boot-starter-jdbc)
- Database available (H2)
- schema.sql exists in resources

Then auto-configures `DataSourceInitializer` which runs the SQL scripts!

---

## Step 4: Creating schema.sql File

**"How do we do that? It's very simple. Right click and say new file and name this as schema dot SQL."**

### Creating the File in IntelliJ

**In IntelliJ IDEA:**

1. Navigate to `src/main/resources/` in Project view
2. Right-click on `resources` folder
3. New → File
4. Type: `schema.sql`
5. Press Enter

**File Location:**

```
src/
├── main/
│   ├── java/
│   │   └── com/telusko/springjdbcexample/
│   │       ├── SpringJdbcExampleApplication.java
│   │       ├── model/
│   │       ├── service/
│   │       └── repository/
│   └── resources/
│       ├── application.properties
│       ├── schema.sql ← Create this!
│       └── static/
└── test/
```

**Why `resources` folder?**

The `resources` folder is for **non-Java files** that need to be on the classpath:
- Properties files (application.properties)
- SQL scripts (schema.sql, data.sql)
- Configuration files (logback.xml, etc.)
- Static assets (images, CSS, JS - for web apps)

When you build the application, everything in `resources` gets packaged into the JAR file and is accessible at runtime.

---

## Step 5: Creating data.sql File

The instructor also creates the data file immediately:

**"So basically we can create two files, one for the schema and one for the data."**

**"In the schema you will only specify what exact table you want."**

**Separation of Concerns:**

- **schema.sql**: Structure (DDL - Data Definition Language)
  - CREATE TABLE
  - ALTER TABLE
  - DROP TABLE
  - CREATE INDEX

- **data.sql**: Content (DML - Data Manipulation Language)
  - INSERT
  - UPDATE
  - DELETE

**Creating data.sql:**

1. Right-click on `resources` folder
2. New → File
3. Type: `data.sql`
4. Press Enter

**"So I will say enter. And this is where you have to write a schema. In fact I will create two tables here or two two files, one for data as well which is data SQL."**

**Project Structure Now:**

```
src/main/resources/
├── application.properties
├── schema.sql ← Database structure
└── data.sql   ← Sample data
```

**"And let's minimize this okay. So we got schema dot SQL and we got data dot SQL."**

---

## Step 6: Writing the CREATE TABLE Statement

**"Let's work with schema first. Now how do you get a schema in SQL. It's very simple."**

### Basic CREATE TABLE Syntax

**"You say create table and you mention the table name which is student in this case."**

```sql
CREATE TABLE student
```

**"And then in the round brackets you mention your fields your your columns."**

```sql
CREATE TABLE student (
    -- columns go here
)
```

### Defining the Columns

**"So what are the columns we need."**

Remember our Student class from Document 37:

```java
public class Student {
    private int rollNumber;
    private String name;
    private int marks;
}
```

We need three columns to match these three fields!

#### Column 1: roll_number (Primary Key)

**"The first column I need is row number. And this is of type int. And I want this to be primary key."**

```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY
)
```

**Column Definition Breakdown:**

- `roll_number`: Column name
- `INT`: Data type (integer number)
- `PRIMARY KEY`: Constraint (unique, not null, indexed)

**What is a Primary Key?**

A primary key is a column (or set of columns) that uniquely identifies each row in a table.

**Primary Key Rules:**
1. **Unique**: No two rows can have the same primary key value
2. **Not Null**: Cannot be NULL/empty
3. **Immutable**: Should not change (best practice)
4. **One per table**: Only one primary key per table

**Example:**

```
STUDENT TABLE
+-------------+---------+-------+
| roll_number | name    | marks |
+-------------+---------+-------+
| 101         | Naveen  | 78    | ← Uniquely identified by 101
| 102         | Raj     | 85    | ← Uniquely identified by 102
| 101         | ERROR!  | XX    | ← Cannot insert! Duplicate PK
+-------------+---------+-------+
```

**Why roll_number as Primary Key?**

Each student has a unique roll number—perfect identifier!

#### Column 2: name (VARCHAR)

**"Next is name which is varchar. And let's say the size I want to have is 50."**

```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50)
)
```

**What is VARCHAR?**

- **VAR**iable **CHAR**acter - variable-length string
- Stores text with specified maximum length
- `VARCHAR(50)` means "up to 50 characters"

**VARCHAR vs CHAR:**

```sql
-- CHAR(10) - Fixed length, always 10 characters
name CHAR(10)
'Raj'      → Stored as 'Raj       ' (padded with spaces)
'Alexander' → Stored as 'Alexander ' (10 chars)

-- VARCHAR(10) - Variable length, up to 10 characters  
name VARCHAR(10)
'Raj'      → Stored as 'Raj' (3 chars, no padding)
'Alexander' → Stored as 'Alexander' (9 chars)
```

**VARCHAR is more efficient** for variable-length text!

#### The Name Length Debate

The instructor shares a personal anecdote:

**"And normally you know we can have 1020 maybe 30. But then there are certain names which are very big, you know, especially South Indian names."**

**Common Naming Conventions:**

- **Western names**: Usually 20-30 characters
  - "John Smith" = 10 chars
  - "Alexander Hamilton" = 18 chars

- **Asian names**: Can be longer
  - Full Chinese names with middle names
  - South Indian names with family lineage

**"I'm a South Indian, so you know my full name. And you might be saying my full name is Naveen Reddy, uh, but not my full name. I'm a pure South Indian, so I have a very big name."**

**The Revelation:**

**"Uh, I don't reveal that on social media, but let's see. Let's do it here. So my full name, I will just say it once and don't go back and listen to the same thing again, because it's weird. You will not remember that."**

**"My full name is Tadepalli Naveen Kumar Reddy. Okay, that's the that's my full name."**

**Name Breakdown:**

```
Tadepalli  Naveen  Kumar  Reddy
↓          ↓       ↓      ↓
Family     First   Middle Last
Name       Name    Name   Name
```

**Character Count:** Let's count!

```
T a d e p a l l i _ N a v e e n _ K u m a r _ R e d d y
1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
```

**29 characters!** (including spaces)

Without spaces: `TadepalliNaveenKumarReddy` = 25 characters

**"So it will. And you let me know how many characters were there."**

**The Decision:**

**"Uh, but anyway, I will just go with 50."**

`VARCHAR(50)` is a safe choice! It handles:
- Short names: "John" = 4 chars (no waste with VARCHAR)
- Medium names: "Alexander Hamilton" = 18 chars
- Long names: "Tadepalli Naveen Kumar Reddy" = 29 chars
- Very long names: Still have room up to 50!

**Best Practice:** Choose VARCHAR length based on your domain:
- `VARCHAR(20)`: Tight constraint if you know names are short
- `VARCHAR(50)`: Good default for most applications
- `VARCHAR(100)`: If you need to support very long names
- `VARCHAR(255)`: Maximum for many databases (but often overkill)

#### Column 3: marks (INT)

**"And then I will just say so the number name and also need marks here. So I will say marks int and that's it."**

```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
)
```

**Why INT for marks?**

- Stores whole numbers: 0, 78, 95, 100
- Sufficient for typical grading systems
- No need for decimals (if marks are out of 100)

**Alternative Data Types:**

If you needed decimals:
```sql
marks DECIMAL(5,2)  -- 5 total digits, 2 after decimal
-- Examples: 98.75, 100.00, 0.50
```

But for whole numbers, `INT` is perfect!

### Complete schema.sql

```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

**"So basically we need these three variables here. So schema is done."**

**Three columns = three Student fields!**

```
Student.java          schema.sql
------------          ----------
int rollNumber   →    roll_number INT PRIMARY KEY
String name      →    name VARCHAR(50)
int marks        →    marks INT
```

Perfect mapping!

---

## Step 7: Understanding Why We Need Sample Data

**"But as I mentioned we also want some data right."**

**Why Pre-Populate Data?**

1. **Testing**: Have data available immediately without manual insertion
2. **Development**: Don't start with empty database every time
3. **Demos**: Show features with existing data
4. **Learning**: See queries work without waiting

**Without data.sql:**

```
Application starts
    ↓
Database empty
    ↓
Manually insert data
    ↓
Test queries
```

**With data.sql:**

```
Application starts
    ↓
Database pre-loaded with 3 students
    ↓
Immediately test queries!
```

Much more convenient for development!

---

## Step 8: Writing INSERT Statements in data.sql

**"So we can have that data in the data SQL file. How do you get the data. So you don't have to mention the JSON file. You basically have to mention your Insert statement."**

### Basic INSERT Syntax

**"So I will say insert into student for three values row number name marks."**

Wait, the instructor misspoke slightly. Let me clarify the correct syntax:

**Correct INSERT Syntax:**

```sql
INSERT INTO student (roll_number, name, marks) VALUES (?, ?, ?);
```

**Breakdown:**

```sql
INSERT INTO student          -- Target table
(roll_number, name, marks)   -- Columns to insert
VALUES (?, ?, ?)             -- Values for those columns
```

### Creating Sample Data

**"And I will say values. And in values I can specify some numbers."**

**"So let's see what I'm sending data in this. So I'm sending 101 Naveen and 78 as one object."**

**First Student:**

```sql
INSERT INTO student (roll_number, name, marks) VALUES (101, 'Naveen', 78);
```

**"Let's say there's 104 because I want to have at least three data before this."**

Wait, the instructor is reconsidering...

**"So I will start with 101. So this is 101 name is let's say Kiran. And then the value is let's say 79."**

**Changed decision:** Instead of Naveen, let's use Kiran for variety!

```sql
INSERT INTO student (roll_number, name, marks) VALUES (101, 'Kiran', 79);
```

**Why?** Because later in main() we're adding a student named Naveen. To differentiate, the pre-loaded data uses different names!

**"So we need this two more times."**

### Adding Three Students

**Student 1: Kiran**

**"And then this is 102."**

```sql
INSERT INTO student (roll_number, name, marks) VALUES (101, 'Kiran', 79);
```

**Student 2: Hersh**

**"I want this to be Hersh, which is let's say 68."**

```sql
INSERT INTO student (roll_number, name, marks) VALUES (102, 'Hersh', 68);
```

**Student 3: Social** (likely "Sushil" but instructor's pronunciation)

**"And then we got social. Let's say we got 82."**

```sql
INSERT INTO student (roll_number, name, marks) VALUES (103, 'Sushil', 82);
```

### Complete data.sql

```sql
INSERT INTO student (roll_number, name, marks) VALUES (101, 'Kiran', 79);
INSERT INTO student (roll_number, name, marks) VALUES (102, 'Hersh', 68);
INSERT INTO student (roll_number, name, marks) VALUES (103, 'Sushil', 82);
```

**"So we got some more objects here. So in total we got three here which is preloaded in the database."**

**Database After Startup:**

```
STUDENT TABLE
+-------------+---------+-------+
| roll_number | name    | marks |
+-------------+---------+-------+
| 101         | Kiran   | 79    | ← Pre-loaded
| 102         | Hersh   | 68    | ← Pre-loaded
| 103         | Sushil  | 82    | ← Pre-loaded
+-------------+---------+-------+
```

**"And then we are adding one more later okay."**

The main() method will add:

```
Roll Number: 104
Name: Naveen
Marks: 78
```

Wait, actually the main() uses roll number 101... Let me check the original code from Document 38:

```java
Student s = context.getBean(Student.class);
s.setRollNumber(101);
s.setName("Naveen");
s.setMarks(78);
```

**There will be a conflict!** Roll number 101 already exists (Kiran). When we try to insert another student with roll number 101, we'll get a primary key violation!

But the instructor doesn't address this yet. Maybe they'll fix it in the next video, or maybe the INSERT will fail demonstrating the primary key constraint. Let's see what happens!

---

## Step 9: Understanding the SQL File Execution Order

When Spring Boot starts:

```
1. Application starts
    ↓
2. DataSource created (H2 in-memory database)
    ↓
3. schema.sql executed
    └─ CREATE TABLE student (...)
    └─ Table "student" now exists
    ↓
4. data.sql executed
    └─ INSERT INTO student VALUES (101, 'Kiran', 79)
    └─ INSERT INTO student VALUES (102, 'Hersh', 68)
    └─ INSERT INTO student VALUES (103, 'Sushil', 82)
    └─ Database now has 3 students
    ↓
5. Application context initialized
    └─ Beans created (@Service, @Repository, etc.)
    ↓
6. main() method continues
    └─ Your code runs (insert student with roll 101)
```

**Key Point:** By the time your code runs, the table exists and contains sample data!

---

## Step 10: Running the Application - First Attempt

**"So let's go back to the file where we were doing this code. And let's see if this works now because now we have a table right."**

**What We Expect:**

From Document 39, our code was:

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

**"So basically your H2 will load the schema and data. And that's what I'm expecting."**

**"Now let's run this okay I hope it will work okay."**

---

## Step 11: The Column Not Found Error

**"We got some more errors. It says column not found okay."**

**Error Output:**

```
Error creating bean with name 'dataSourceScriptDatabaseInitializer' initialization failed.

Caused by: org.springframework.jdbc.datasource.init.ScriptStatementFailedException: 
Failed to execute SQL script statement #1 of URL [file:/data.sql]: 
INSERT INTO student (roll_number, name, marks) VALUES (101, "Kiran", 79)

Caused by: org.h2.jdbc.JdbcSQLSyntaxErrorException: 
Column "Kiran" not found; SQL statement:
INSERT INTO student (roll_number, name, marks) VALUES (101, "Kiran", 79) [42122-200]
```

**"Maybe I made a mistake there."**

**The Error Breakdown:**

```
Column "Kiran" not found
```

Wait, `"Kiran"` is supposed to be a **value**, not a column! Why is H2 interpreting it as a column name?

---

## Step 12: Understanding SQL String Literal Syntax

**"So if I go back to data dot SQL. So where exactly I'm getting this I was not expecting this error somewhere. The mapping issue is there with the current data."**

**The Bug in data.sql:**

```sql
INSERT INTO student (roll_number, name, marks) VALUES (101, "Kiran", 79);
                                                             ↑      ↑
                                                    Double quotes!
```

**The Problem:**

In SQL, **double quotes** have a special meaning!

### SQL Identifier Rules

**Double Quotes (`"`) = Identifiers (column names, table names)**

```sql
-- Double quotes identify columns/tables
SELECT "name" FROM "student"
       ↑             ↑
    Column name   Table name
```

**Single Quotes (`'`) = String Literals (values)**

```sql
-- Single quotes indicate string values
SELECT * FROM student WHERE name = 'Kiran'
                                    ↑    ↑
                                String value
```

**What Happened:**

```sql
INSERT INTO student VALUES (101, "Kiran", 79);
                                  ↑    ↑
                            H2 thinks this is a column name!
```

H2 interpreted `"Kiran"` as a column name, not a string value. It looked for a column called `Kiran` and didn't find it—hence "Column not found"!

**The Fix:**

```sql
-- Wrong
INSERT INTO student VALUES (101, "Kiran", 79);

-- Right
INSERT INTO student VALUES (101, 'Kiran', 79);
                                 ↑     ↑
                               Single quotes!
```

**"Is it the problem with double quotes. Oh yeah. Okay."**

The instructor found it!

---

## Step 13: The Quote Types in SQL

Let's understand this fundamental SQL concept:

### Single Quotes vs Double Quotes

**Single Quotes `'...'` (String Literals):**

```sql
-- For string/text values
INSERT INTO student (name) VALUES ('John');
UPDATE student SET name = 'Jane' WHERE roll_number = 1;
SELECT * FROM student WHERE name = 'Alex';
```

**Double Quotes `"..."` (Identifiers):**

```sql
-- For table/column names with special characters or case-sensitive
SELECT "First Name" FROM "Student Table";
        ↑                 ↑
    Column with space   Table with space

-- Forcing case-sensitivity
CREATE TABLE "Student" (
    "RollNumber" INT  -- Preserves exact case
);
```

**No Quotes (Regular Identifiers):**

```sql
-- Normal table/column names (case-insensitive)
SELECT roll_number FROM student;
-- Equivalent to: SELECT ROLL_NUMBER FROM STUDENT;
```

### Database-Specific Differences

**MySQL:** Allows both single and double quotes for strings (non-standard!)

```sql
-- Both work in MySQL (but don't rely on this!)
INSERT INTO student VALUES (1, "John", 78);  -- Works
INSERT INTO student VALUES (1, 'John', 78);  -- Standard
```

**PostgreSQL, H2, Oracle, SQL Server:** Double quotes = identifiers only

```sql
-- Double quotes for identifiers
SELECT "name" FROM student;  -- ✅ Column reference

-- Single quotes for strings
INSERT INTO student VALUES (1, 'John', 78);  -- ✅ String value
```

**Best Practice:** Always use **single quotes for string literals** to follow SQL standard and avoid issues!

---

## Step 14: Fixing data.sql

**"So the problem with the double quotes let's use single quote because we're using SQL."**

**Updated data.sql:**

```sql
-- Before (WRONG):
INSERT INTO student (roll_number, name, marks) VALUES (101, "Kiran", 79);
INSERT INTO student (roll_number, name, marks) VALUES (102, "Hersh", 68);
INSERT INTO student (roll_number, name, marks) VALUES (103, "Sushil", 82);

-- After (CORRECT):
INSERT INTO student (roll_number, name, marks) VALUES (101, 'Kiran', 79);
INSERT INTO student (roll_number, name, marks) VALUES (102, 'Hersh', 68);
INSERT INTO student (roll_number, name, marks) VALUES (103, 'Sushil', 82);
```

**The Fix:** Changed `"Kiran"` → `'Kiran'` (and same for other names)

**Why Numbers Don't Have Quotes:**

```sql
VALUES (101, 'Kiran', 79)
        ↑             ↑
     Number      Number
     No quotes   No quotes
```

Numbers are numeric literals, not strings, so no quotes needed!

---

## Step 15: Running Successfully

**"And now let's rerun this."**

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

1 affected
[]
```

**"Oh it worked okay."**

Success! Let's break down what happened:

### What Executed During Startup

**1. Schema Creation (schema.sql):**
```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

**Result:** Table "student" created ✅

**2. Data Population (data.sql):**
```sql
INSERT INTO student VALUES (101, 'Kiran', 79);
INSERT INTO student VALUES (102, 'Hersh', 68);
INSERT INTO student VALUES (103, 'Sushil', 82);
```

**Result:** 3 students inserted ✅

**Database State After Initialization:**

```
STUDENT TABLE
+-------------+---------+-------+
| roll_number | name    | marks |
+-------------+---------+-------+
| 101         | Kiran   | 79    |
| 102         | Hersh   | 68    |
| 103         | Sushil  | 82    |
+-------------+---------+-------+
```

**3. Application Code Runs:**

```java
Student s = context.getBean(Student.class);
s.setRollNumber(101);  // WAIT! 101 already exists!
s.setName("Naveen");
s.setMarks(78);

service.addStudent(s);  // Tries to INSERT
```

**What Should Happen?**

Primary key constraint violation! Roll number 101 (Kiran) already exists. We're trying to insert another 101 (Naveen).

**But what actually happened?**

**"So first of all it says one affected."**

It worked! How?

**Possible Explanations:**

1. **H2 Default Behavior**: Maybe H2 didn't enforce primary key constraint immediately?
2. **Code Changed**: Maybe the instructor changed roll number to 104 in main() (shown in video but not mentioned)?
3. **UPDATE Instead**: Maybe H2 did an UPDATE instead of INSERT?

Regardless, we got:

```
1 affected
```

This confirms the JDBC code executed successfully!

---

## Step 16: Verifying the Insert

**"So that's right. So basically that's how you uh add the data. So JDBC template is actually adding data okay. That's good."**

**What "1 affected" Means:**

```java
int rows = jdbc.update(sql, student.getRollNumber(), 
                            student.getName(), 
                            student.getMarks());
System.out.println(rows + " affected");
// Output: 1 affected
```

**Interpretation:**

- `rows = 1`: One row was affected by the INSERT operation
- This means the INSERT succeeded
- Student was added to database

**Database State After Insert (Assuming roll 104 used):**

```
STUDENT TABLE
+-------------+---------+-------+
| roll_number | name    | marks |
+-------------+---------+-------+
| 101         | Kiran   | 79    | ← Pre-loaded
| 102         | Hersh   | 68    | ← Pre-loaded
| 103         | Sushil  | 82    | ← Pre-loaded
| 104         | Naveen  | 78    | ← Just inserted!
+-------------+---------+-------+
```

---

## Step 17: The Question - Is Data Actually Stored?

**"But we only got one affected right. We have not we are not sure exactly. Is it storing data."**

**Valid Concern!**

Yes, `jdbc.update()` returned 1, which means it executed successfully. But:

1. **Did data persist?** Or was it just held in memory?
2. **Can we retrieve it?** Does SELECT work?
3. **Is it in the database?** Or lost after method returns?

**How to Verify?**

**"The way to find that is using find all."**

We need to implement `findAll()` to query the database:

```java
public List<Student> findAll() {
    String sql = "SELECT * FROM student";
    // Use JDBC to query and return list
}
```

Then in main():

```java
service.addStudent(s);  // Insert

List<Student> students = service.getStudents();  // Retrieve
System.out.println(students);  // Print
```

If we see all 4 students (3 pre-loaded + 1 new), then data is definitely stored!

**Current Output:**

```
[]
```

Empty list—because `findAll()` still returns dummy data:

```java
public List<Student> findAll() {
    return new ArrayList<>();  // Empty list, not querying database
}
```

---

## Step 18: Setting Up for Next Video

**"So basically in the find all will try to fetch this data and show it on the screen. Okay let's do that in the next video because we have some more things to discuss before we do find all."**

**What's Coming in Document 41:**

1. **Write SELECT query** to retrieve all students
2. **Use jdbc.query()** method (different from update())
3. **Create RowMapper** to convert ResultSet to Student objects
4. **Handle ResultSet** manually (understanding the mapping)
5. **Print all students** to verify data persistence
6. **See 4 students** (3 pre-loaded + 1 inserted)

**Why More Discussion Needed?**

SELECT queries are more complex than INSERT:

**INSERT (simple):**
```java
jdbc.update("INSERT INTO student VALUES (?, ?, ?)", roll, name, marks);
// Returns: int (rows affected)
```

**SELECT (complex):**
```java
List<Student> students = jdbc.query("SELECT * FROM student", new StudentRowMapper());
// Returns: List<Student> (multiple objects!)
```

**Challenges:**
- **ResultSet handling**: Convert database rows to Java objects
- **RowMapper interface**: Implement result mapping logic
- **Type conversion**: int → Integer, VARCHAR → String
- **Null handling**: What if name is NULL?

**"But at least it says one affected. That means we are assuming the data is stored."**

We have good reason to believe it worked! The INSERT succeeded (`1 affected`). Now we need to prove it with a SELECT query.

**"Is it happening? Let's see in the next video."**

---

## Key Concepts Summary

### 1. schema.sql File
**Purpose**: Define database schema (table structure).

**Location**: `src/main/resources/schema.sql`

**Content**: DDL statements (CREATE TABLE, ALTER TABLE, etc.)

**Example:**
```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

**Execution**: Automatic on Spring Boot startup (before application code runs)

### 2. data.sql File
**Purpose**: Pre-populate database with sample data.

**Location**: `src/main/resources/data.sql`

**Content**: DML statements (INSERT, UPDATE, DELETE)

**Example:**
```sql
INSERT INTO student VALUES (101, 'Kiran', 79);
INSERT INTO student VALUES (102, 'Hersh', 68);
INSERT INTO student VALUES (103, 'Sushil', 82);
```

**Execution**: Automatic after schema.sql (on Spring Boot startup)

### 3. Spring Boot Auto-Initialization
**Mechanism**: `DataSourceInitializer` (auto-configured)

**Execution Order:**
1. Create DataSource (connect to H2)
2. Run schema.sql (create tables)
3. Run data.sql (insert sample data)
4. Initialize application context (create beans)
5. Run main() method (your code)

**Configuration:** Zero config needed! Just create the files.

### 4. SQL String Literals
**Single Quotes `'...'`**: String/text values (USE THIS!)
```sql
INSERT INTO student (name) VALUES ('John');
```

**Double Quotes `"..."`**: Identifiers (column/table names)
```sql
SELECT "special column" FROM "special table";
```

**Common Mistake:**
```sql
-- Wrong (treats "name" as column reference)
INSERT INTO student VALUES (1, "John", 78);

-- Right (treats 'John' as string value)
INSERT INTO student VALUES (1, 'John', 78);
```

### 5. Primary Key Constraint
**Definition**: Column that uniquely identifies each row.

**Rules:**
- Must be unique
- Cannot be NULL
- Should not change
- One per table

**Example:**
```sql
roll_number INT PRIMARY KEY
```

**Violation Error:**
```
Unique index or primary key violation: "PRIMARY KEY ON PUBLIC.STUDENT(ROLL_NUMBER)"
```

### 6. CREATE TABLE Statement
**Syntax:**
```sql
CREATE TABLE table_name (
    column1 datatype constraints,
    column2 datatype constraints,
    ...
);
```

**Example:**
```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

### 7. INSERT Statement
**Syntax:**
```sql
INSERT INTO table_name (column1, column2, ...) 
VALUES (value1, value2, ...);
```

**Example:**
```sql
INSERT INTO student (roll_number, name, marks) 
VALUES (101, 'Kiran', 79);
```

### 8. Data Types
**INT**: Whole numbers (-2147483648 to 2147483647)
```sql
roll_number INT
marks INT
```

**VARCHAR(n)**: Variable-length string (up to n characters)
```sql
name VARCHAR(50)  -- Up to 50 characters
```

**Other Common Types:**
```sql
DECIMAL(p,s)  -- Decimal numbers (p digits, s after decimal)
DATE          -- Date (year-month-day)
TIMESTAMP     -- Date and time
BOOLEAN       -- true/false
TEXT          -- Unlimited length text
```

---

## Complete File Contents

### schema.sql
```sql
CREATE TABLE student (
    roll_number INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

### data.sql
```sql
INSERT INTO student (roll_number, name, marks) VALUES (101, 'Kiran', 79);
INSERT INTO student (roll_number, name, marks) VALUES (102, 'Hersh', 68);
INSERT INTO student (roll_number, name, marks) VALUES (103, 'Sushil', 82);
```

### Project Structure
```
src/
├── main/
│   ├── java/
│   │   └── com/telusko/springjdbcexample/
│   │       ├── SpringJdbcExampleApplication.java
│   │       ├── model/
│   │       │   └── Student.java
│   │       ├── service/
│   │       │   └── StudentService.java
│   │       └── repository/
│   │           └── StudentRepo.java
│   └── resources/
│       ├── application.properties
│       ├── schema.sql ✅
│       └── data.sql ✅
└── test/
```

---

## Troubleshooting Common Issues

### Issue 1: "Table already exists" Error
**Error:**
```
Table "STUDENT" already exists
```

**Cause:** Application restarted and tried to create table again.

**Solution:** For H2 in-memory, this shouldn't happen (database wiped on restart). But if using file-based H2:

```sql
-- Option 1: Drop if exists
DROP TABLE IF EXISTS student;
CREATE TABLE student (...);

-- Option 2: Create only if not exists
CREATE TABLE IF NOT EXISTS student (...);
```

### Issue 2: "Column count mismatch" Error
**Error:**
```
Column count does not match value count
```

**Cause:** Wrong number of values in INSERT.

```sql
-- Wrong (2 values for 3 columns)
INSERT INTO student (roll_number, name, marks) VALUES (101, 'John');

-- Right (3 values for 3 columns)
INSERT INTO student (roll_number, name, marks) VALUES (101, 'John', 78);
```

### Issue 3: "Column not found" with Correct Column Name
**Error:**
```
Column "NAME" not found
```

**Cause:** Case sensitivity with quoted identifiers.

**Solution:**
```sql
-- If table created with lowercase
CREATE TABLE student (name VARCHAR(50));

-- Don't use quotes (case-insensitive)
SELECT name FROM student;  -- ✅ Works

-- Using quotes requires exact case
SELECT "name" FROM student;  -- ✅ Works
SELECT "NAME" FROM student;  -- ❌ Error (looking for uppercase)
```

### Issue 4: schema.sql Not Executing
**Problem:** Tables not created on startup.

**Possible Causes:**

1. **File in wrong location**
   ```
   ❌ src/main/java/schema.sql
   ✅ src/main/resources/schema.sql
   ```

2. **Initialization disabled**
   ```properties
   # Check application.properties
   spring.sql.init.mode=always  # Should be 'always' or 'embedded'
   ```

3. **JPA interfering** (if you have JPA)
   ```properties
   spring.jpa.hibernate.ddl-auto=none  # Don't let Hibernate manage schema
   ```

---

## What's Next

In Document 41, we'll:

1. **Implement findAll()** with SELECT query
2. **Create RowMapper** to convert ResultSet to Student
3. **Use jdbc.query()** method
4. **Print all 4 students** to verify persistence
5. **Understand ResultSet processing** step-by-step
6. **See complete CRUD operations** working

**The Goal:** Prove that data is actually stored in the database by retrieving and displaying all students!

---

## Conclusion: Database Initialized Successfully!

We've accomplished major milestones:

✅ **Created schema.sql** with CREATE TABLE statement
✅ **Created data.sql** with 3 sample students
✅ **Fixed SQL syntax error** (double quotes → single quotes)
✅ **Ran application successfully** ("1 affected")
✅ **Verified INSERT works** (return value = 1)
✅ **Database auto-initialized** by Spring Boot

**Database State:**

```
STUDENT TABLE
+-------------+---------+-------+
| roll_number | name    | marks |
+-------------+---------+-------+
| 101         | Kiran   | 79    | ← Pre-loaded
| 102         | Hersh   | 68    | ← Pre-loaded
| 103         | Sushil  | 82    | ← Pre-loaded
| 104?        | Naveen? | 78?   | ← Inserted? (verify next video)
+-------------+---------+-------+
```

**Key Learning:**

The **schema.sql and data.sql convention** is powerful! Spring Boot automatically:
- Creates your tables
- Populates sample data
- Does it all before your code runs

Zero configuration, maximum convenience! This is perfect for development and learning.

**Next Step:** Implement `findAll()` with SELECT query to retrieve and display all students, proving data persistence! 🎯
