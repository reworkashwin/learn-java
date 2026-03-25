# 📊 Document 41: Implementing findAll() with RowMapper and SELECT Queries

## Introduction: Time to Retrieve Data

In Document 40, we successfully created our database schema and inserted data. We saw the encouraging message:

```
1 affected
```

This confirmed our INSERT worked. But as the instructor wisely noted: **"We have not we are not sure exactly. Is it storing data."**

We need proof! The only way to verify data persistence is to retrieve it from the database.

**"So now let's fetch the data which you are storing."**

Currently, our `findAll()` method returns an empty list:

```java
public List<Student> findAll() {
    return new ArrayList<>();  // Dummy data - not querying database!
}
```

The instructor announces: **"Now basically to do that we have to add the code in the find all."**

In this video, we're going to:

1. **Remove the dummy implementation** 
2. **Write SELECT query** to fetch all students
3. **Use jdbc.query() method** (not update()!)
4. **Understand RowMapper interface** and its purpose
5. **Implement RowMapper** as anonymous class
6. **Use ResultSet methods** (getInt, getString)
7. **Map database rows to Student objects**
8. **Run and verify** all 4 students appear
9. **Refactor to lambda expression** (functional interface)
10. **Simplify progressively** to inline lambda

By the end, we'll have a fully working SELECT query retrieving all students from the database, proving our data persists! We'll also learn modern Java techniques using lambda expressions to make the code cleaner.

Let's fetch that data!

---

## Step 1: Removing the Dummy Implementation

**"So basically this is not what we want now. So I can just remove this."**

**Current Code (StudentRepo.java):**

```java
public List<Student> findAll() {
    return new ArrayList<>();  // Returns empty list
}
```

**What's Wrong?**

This dummy implementation was fine for testing the service layer in Document 38. It proved the method calls worked:

```
Main → Service → Repository (dummy return)
```

But now we need real database queries!

**Removing It:**

Delete the `return new ArrayList<>();` line. We'll replace it with actual database query code.

```java
public List<Student> findAll() {
    // Empty - ready for implementation
}
```

---

## Step 2: Understanding SELECT Queries

**"But how do you get data. So basically if you can use a query."**

### The SELECT Statement

**"So I will say string SQL. Now how do you fetch all data from database or from the table. You say select star from students."**

**Writing the Query:**

```java
public List<Student> findAll() {
    String sql = "SELECT * FROM student";
}
```

**SQL Breakdown:**

```sql
SELECT * FROM student
  ↓    ↓  ↓     ↓
  |    |  |     Table name
  |    |  FROM keyword
  |    All columns (*)
  SELECT keyword
```

**What Does `SELECT *` Mean?**

The asterisk `*` means "all columns":

```sql
SELECT * FROM student
-- Equivalent to:
SELECT roll_number, name, marks FROM student
```

**Explicit vs Wildcard:**

```sql
-- Wildcard (convenient)
SELECT * FROM student;

-- Explicit (better for production)
SELECT roll_number, name, marks FROM student;
```

**Production Advice:** Use explicit column names! It's clearer and prevents issues if table structure changes.

**For Learning:** `SELECT *` is fine—we know the table structure!

**Expected Result:**

```
+-------------+---------+-------+
| roll_number | name    | marks |
+-------------+---------+-------+
| 101         | Kiran   | 79    |
| 102         | Hersh   | 68    |
| 103         | Sushil  | 82    |
| 104         | Naveen  | 78    |
+-------------+---------+-------+
```

All four students (3 from data.sql + 1 from our INSERT).

---

## Step 3: Executing the Query - jdbc.query() vs jdbc.update()

**"And now I want to execute this query. So whenever you use a Select query in JDBC we have to execute a method called execute query."**

### Plain JDBC Approach (Refresher)

In plain JDBC, you use `executeQuery()`:

```java
// Plain JDBC
Statement stmt = connection.createStatement();
ResultSet rs = stmt.executeQuery("SELECT * FROM student");
// Process rs...
```

**Two Execution Methods in Plain JDBC:**

1. **executeUpdate()**: For DML (INSERT, UPDATE, DELETE)
   ```java
   int rows = stmt.executeUpdate("INSERT INTO student VALUES (...)");
   // Returns: number of rows affected
   ```

2. **executeQuery()**: For DQL (SELECT)
   ```java
   ResultSet rs = stmt.executeQuery("SELECT * FROM student");
   // Returns: ResultSet (table of data)
   ```

### Spring JdbcTemplate Approach

**"But here if you say JDBC dot we don't have execute query but we have a query."**

JdbcTemplate uses different method names:

```java
jdbc.update()   // For INSERT, UPDATE, DELETE (like executeUpdate)
jdbc.query()    // For SELECT (like executeQuery)
jdbc.execute()  // For DDL (CREATE TABLE, ALTER TABLE, etc.)
```

**The Mapping:**

```
Plain JDBC              →  JdbcTemplate
--------------             -------------
executeUpdate()         →  update()
executeQuery()          →  query()
execute()               →  execute()
```

**Why Different Names?**

- `update()` is clearer than `executeUpdate()`
- `query()` is clearer than `executeQuery()`
- Shorter and more intuitive!

---

## Step 4: Understanding jdbc.query() Parameters

**"Now query takes two parameters. First the actual query which is SQL in this case. And the second is the object of row mapper."**

### Exploring jdbc.query() Signature

**"So if I go to the query you can see this is the option we want to go for."**

```java
public <T> List<T> query(String sql, RowMapper<T> rowMapper)
```

**Parameter Breakdown:**

1. **String sql**: The SELECT query
   ```java
   "SELECT * FROM student"
   ```

2. **RowMapper<T> rowMapper**: Object that converts ResultSet rows to Java objects
   ```java
   RowMapper<Student>  // Converts ResultSet → Student
   ```

**Generic Type `<T>`:**

The method is generic—it can return any type:

```java
List<Student> students = jdbc.query(sql, studentMapper);
List<Employee> employees = jdbc.query(sql, employeeMapper);
List<Product> products = jdbc.query(sql, productMapper);
```

**Return Type:**

```java
List<T>  // List of objects (T = Student in our case)
```

So `jdbc.query()` returns `List<Student>` when using `RowMapper<Student>`!

**"So for the query the first one is string the SQL. The second is row mapper."**

---

## Step 5: What is RowMapper?

**"Now using row mapper basically you can fetch data from your result set."**

### The Problem RowMapper Solves

**"If you remember in BC, whenever you fire a query a Select query, you get a result set."**

In plain JDBC:

```java
ResultSet rs = stmt.executeQuery("SELECT * FROM student");

// ResultSet is like a cursor over table rows:
// +-------------+---------+-------+
// | roll_number | name    | marks |
// +-------------+---------+-------+
// | 101         | Kiran   | 79    | ← Cursor here initially
// | 102         | Hersh   | 68    |
// | 103         | Sushil  | 82    |
// +-------------+---------+-------+
```

**Plain JDBC Processing:**

```java
List<Student> students = new ArrayList<>();
while (rs.next()) {  // Move to next row
    Student s = new Student();
    s.setRollNumber(rs.getInt("roll_number"));
    s.setName(rs.getString("name"));
    s.setMarks(rs.getInt("marks"));
    students.add(s);
}
```

**Problems:**
1. **Repetitive**: Same mapping code for every query
2. **Error-prone**: Easy to mismatch columns
3. **Resource management**: Must close ResultSet properly
4. **Boilerplate**: 10+ lines just to convert rows to objects

**Spring's Solution: RowMapper**

```java
RowMapper<Student> mapper = (rs, rowNum) -> {
    Student s = new Student();
    s.setRollNumber(rs.getInt("roll_number"));
    s.setName(rs.getString("name"));
    s.setMarks(rs.getInt("marks"));
    return s;
};

List<Student> students = jdbc.query(sql, mapper);
```

**Benefits:**
- ✅ **Reusable**: Define once, use everywhere
- ✅ **Cleaner**: Separation of SQL from mapping
- ✅ **Automatic**: JdbcTemplate handles ResultSet iteration
- ✅ **Safe**: No resource leaks (Spring manages resources)

**"In this result set you have all your data. Now from this result set, you get one by one data and row mapper will help you to fetch that data from the result set."**

RowMapper is your converter: **ResultSet row → Java object**

---

## Step 6: Creating RowMapper - Class or Interface?

**"So let's use the row mapper. And if I go back okay. So it says we have to pass an object of row mapper."**

### Declaring the RowMapper

**"So what exactly is row mapper. So if I say row mapper you can see row mapper."**

```java
RowMapper<Student> mapper
```

**"We have to specify the type as student because that's what you're working with."**

The generic type `<Student>` tells RowMapper:
- I'm converting rows to `Student` objects
- The `mapRow()` method will return `Student`
- The result list will be `List<Student>`

**Instantiating:**

**"And let's say this is mapper is equal to new okay. The thing is is it a class of the interface. Let's check that first if you click here."**

**Checking the Source:**

```java
// Option+Click on "RowMapper" in IntelliJ
// Or Ctrl+Click in Windows/Linux
```

**Reveation:**

**"Oh it's an interface."**

```java
@FunctionalInterface
public interface RowMapper<T> {
    T mapRow(ResultSet rs, int rowNum) throws SQLException;
}
```

**Interface Details:**

1. **@FunctionalInterface**: Has exactly one abstract method
2. **Generic `<T>`**: Can map to any type
3. **One method**: `mapRow(ResultSet, int)` 

**"And the thing is this is a functional interface. That means we can use lambda expression as well."**

**What's a Functional Interface?**

An interface with **exactly one abstract method**. Examples:

```java
@FunctionalInterface
interface Runnable {
    void run();  // One method
}

@FunctionalInterface
interface Comparator<T> {
    int compare(T o1, T o2);  // One method
    // (default and static methods don't count)
}

@FunctionalInterface
interface RowMapper<T> {
    T mapRow(ResultSet rs, int rowNum);  // One method
}
```

**Why Special?**

Functional interfaces can be implemented with **lambda expressions**:

```java
// Old way (anonymous class)
Runnable r = new Runnable() {
    public void run() {
        System.out.println("Running");
    }
};

// New way (lambda)
Runnable r = () -> System.out.println("Running");
```

**"But let's go with lambda later. Let's go for normal anonymous class."**

Good teaching approach! Learn the traditional way first, then modernize.

---

## Step 7: Implementing RowMapper with Anonymous Class

**"It's an interface. So if I want this to make it work I have to say new row mapper."**

### Anonymous Class Syntax

```java
RowMapper<Student> mapper = new RowMapper<Student>() {
    // Implement methods here
};
```

**What's an Anonymous Class?**

A class without a name, defined inline:

```java
// Normal class
class StudentMapper implements RowMapper<Student> {
    public Student mapRow(ResultSet rs, int rowNum) { ... }
}
RowMapper<Student> mapper = new StudentMapper();

// Anonymous class (no name needed)
RowMapper<Student> mapper = new RowMapper<Student>() {
    public Student mapRow(ResultSet rs, int rowNum) { ... }
};
```

**Use When:**
- Need implementation immediately
- Only use it once
- Don't want separate class file

**"And basically we have to implement this method which is map row. If you can see this is the method which we have to implement."**

IntelliJ shows red underline—"must implement mapRow()":

```java
RowMapper<Student> mapper = new RowMapper<Student>() {
    @Override
    public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
        // Implementation goes here
    }
};
```

Press **Alt+Enter** → "Implement method" to auto-generate!

---

## Step 8: Understanding the mapRow() Method

**"Now this interface or this method takes two parameters. First is result set. That's what you get from executing the query and then the row number."**

### Method Signature

```java
T mapRow(ResultSet rs, int rowNum) throws SQLException
```

**Parameters:**

1. **ResultSet rs**: Current row from query results
   ```
   Cursor at row 1:
   +-------------+---------+-------+
   | roll_number | name    | marks |
   +-------------+---------+-------+
   | 101         | Kiran   | 79    | ← rs points here
   +-------------+---------+-------+
   ```

2. **int rowNum**: Row number (0-based index)
   ```
   First row: rowNum = 0
   Second row: rowNum = 1
   Third row: rowNum = 2
   ```

**Return Type:**

```java
T  // Same as generic type (Student in our case)
```

So we must return a `Student` object!

### The Contract Explained

**"So what it simply says is hey you know I have a method called map row. The job of map row is to take one row at a time from the result set and give it to you now what you want to do."**

**"So when I say you, it means programmer. What you want to do with that one row, it's up to you."**

**The Handoff:**

```
JdbcTemplate: "Hey RowMapper, I executed the query and got results."
RowMapper: "Great! Give me one row at a time."
JdbcTemplate: "Here's row 1..." (calls mapRow with ResultSet at row 1)
RowMapper: "Let me convert this to a Student object..."
RowMapper: "Here's the Student!" (returns Student)
JdbcTemplate: "Thanks, I'll add it to the list. Here's row 2..."
(Repeat for each row)
JdbcTemplate: "All done! Here's the complete List<Student>."
```

**"So basically map row will give you one row at a time or one particular data or object at a time."**

### The rowNum Parameter

**"Now this row number is something which your map row uses behind the scene. If you want to use it, you can, but we'll not be using this."**

**When You Might Use rowNum:**

```java
public Student mapRow(ResultSet rs, int rowNum) {
    Student s = new Student();
    s.setId(rowNum + 1);  // Generate sequential IDs
    // ... rest of mapping
    return s;
}
```

Or for debugging:

```java
public Student mapRow(ResultSet rs, int rowNum) {
    System.out.println("Processing row " + rowNum);
    // ... mapping
}
```

**For Simple Mapping:** We don't need it!

**"We'll only be using the result set and we will be getting one row at a time. Right?"**

---

## Step 9: Extracting Data from ResultSet

**"So how do we use it. So I want to fetch data from result set. So if I say artist Dot you can see we have some methods like get int or get string."**

### ResultSet Methods

```java
rs.getInt(columnName)      // Get integer value
rs.getString(columnName)   // Get string value
rs.getDouble(columnName)   // Get double value
rs.getBoolean(columnName)  // Get boolean value
rs.getDate(columnName)     // Get date value
// ... many more
```

**Two Ways to Get Columns:**

1. **By Name** (better):
   ```java
   rs.getInt("roll_number")
   rs.getString("name")
   ```

2. **By Index** (1-based):
   ```java
   rs.getInt(1)      // First column
   rs.getString(2)   // Second column
   rs.getInt(3)      // Third column
   ```

**Best Practice:** Use column names! Clearer and safer if table structure changes.

**"We have used the same thing in JDBC."**

Yes! This is the same ResultSet from plain JDBC:

```java
// Plain JDBC
ResultSet rs = stmt.executeQuery("SELECT * FROM student");
rs.next();
int roll = rs.getInt("roll_number");
String name = rs.getString("name");

// Spring JDBC (inside RowMapper)
// ResultSet rs already positioned at current row
int roll = rs.getInt("roll_number");
String name = rs.getString("name");
```

The difference: **Spring calls mapRow() for each row automatically!** You don't need the `while(rs.next())` loop.

---

## Step 10: Creating and Populating Student Object

**"So if you want to use it and store it somewhere, first of all let me create a student object with a student S is equal to new student."**

### Step-by-Step Mapping

**Create Student Instance:**

```java
public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
    Student s = new Student();
    // Now populate it...
}
```

**"And then I can set the value for student. I can say set row number."**

### Mapping roll_number

**"But this set row number will be coming from the result set. So I can say result set dot get int because it's of type integer."**

```java
s.setRollNumber(rs.getInt("roll_number"));
```

**Why getInt()?**

In schema.sql we defined:
```sql
roll_number INT PRIMARY KEY
```

`INT` in SQL → `int` in Java → use `getInt()` method!

**"And you can specify the column number or you can specify the column name. I will specify the column name. Here I will say row number."**

**Column Name:** `"roll_number"` (matches schema.sql exactly)

### Mapping name

**"And we have to do the same thing for other methods as well. So I will say set name result, set dot get string. And then you have to specify the column name which is name in this case."**

```java
s.setName(rs.getString("name"));
```

**Why getString()?**

In schema.sql:
```sql
name VARCHAR(50)
```

`VARCHAR` in SQL → `String` in Java → use `getString()` method!

### Mapping marks

**"And then we have to say s dot set marks which is coming from result set. Again I will say get int because the type of marks is int and I can specify marks."**

```java
s.setMarks(rs.getInt("marks"));
```

**Why getInt()** (again)?

In schema.sql:
```sql
marks INT
```

`INT` in SQL → `int` in Java → use `getInt()` method!

### The Complete Mapping

```java
public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
    Student s = new Student();
    s.setRollNumber(rs.getInt("roll_number"));
    s.setName(rs.getString("name"));
    s.setMarks(rs.getInt("marks"));
    // Now return it...
}
```

**"So basically you are fetching data from the result set and saving in the student."**

**The Mapping:**

```
Database Row                  Java Object
+-------------+---------+---+   +------------------+
| roll_number | name    | m |   | Student          |
+-------------+---------+---+   +------------------+
| 101         | Kiran   | 7 | → | rollNumber: 101  |
|             |         | 9 |   | name: "Kiran"    |
|             |         |   |   | marks: 79        |
+-------------+---------+---+   +------------------+
```

Perfect one-to-one mapping!

---

## Step 11: Returning the Student Object

**"And you can see map row return type is student. So I can simply return S here."**

```java
public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
    Student s = new Student();
    s.setRollNumber(rs.getInt("roll_number"));
    s.setName(rs.getString("name"));
    s.setMarks(rs.getInt("marks"));
    return s;  // Return populated Student object
}
```

**What Happens to Returned Student?**

JdbcTemplate collects them:

```java
List<Student> students = new ArrayList<>();

// For each row in ResultSet:
Student s1 = mapper.mapRow(rs, 0);  // Row 1 → Student(101, Kiran, 79)
students.add(s1);

Student s2 = mapper.mapRow(rs, 1);  // Row 2 → Student(102, Hersh, 68)
students.add(s2);

Student s3 = mapper.mapRow(rs, 2);  // Row 3 → Student(103, Sushil, 82)
students.add(s3);

Student s4 = mapper.mapRow(rs, 3);  // Row 4 → Student(104, Naveen, 78)
students.add(s4);

return students;  // jdbc.query() returns this list
```

**"So what map row will do is it will fetch data from result set and say hey what you want to do with this? What we are doing is taking the data, adding it to the student object and returning it."**

Perfect explanation!

---

## Step 12: Using the RowMapper in jdbc.query()

**"So this is the object. Basically we have to pass in the query. So as I mentioned you have to pass two things. And that's what we are doing here."**

### Complete RowMapper

```java
RowMapper<Student> mapper = new RowMapper<Student>() {
    @Override
    public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
        Student s = new Student();
        s.setRollNumber(rs.getInt("roll_number"));
        s.setName(rs.getString("name"));
        s.setMarks(rs.getInt("marks"));
        return s;
    }
};
```

### Calling jdbc.query()

**"But this query returns you the list of values. So if you click on query you can see it returns the list of the type."**

```java
public <T> List<T> query(String sql, RowMapper<T> rowMapper)
```

**"So the type is student. So it returns the list of students."**

With `RowMapper<Student>`, the return type is `List<Student>`!

**"And that's what we are returning right. So I can say return JDBC dot query."**

```java
return jdbc.query(sql, mapper);
```

**"So this will return the list of students. And that's what we are returning."**

---

## Step 13: Complete findAll() Implementation (Version 1)

### The Full Method

```java
public List<Student> findAll() {
    String sql = "SELECT * FROM student";
    
    RowMapper<Student> mapper = new RowMapper<Student>() {
        @Override
        public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
            Student s = new Student();
            s.setRollNumber(rs.getInt("roll_number"));
            s.setName(rs.getString("name"));
            s.setMarks(rs.getInt("marks"));
            return s;
        }
    };
    
    return jdbc.query(sql, mapper);
}
```

**Code Flow:**

```
1. Define SQL: "SELECT * FROM student"
2. Create RowMapper that converts ResultSet rows to Student objects
3. Call jdbc.query(sql, mapper)
   ├─ JdbcTemplate executes query
   ├─ Gets ResultSet with all rows
   ├─ For each row: calls mapper.mapRow(rs, rowNum)
   ├─ Collects returned Student objects into List
   └─ Returns List<Student>
4. Return the list
```

**"Oh, such a lengthy code just for fetching data. But this is better than what we have done with the normal JDBC, right?"**

### Comparing to Plain JDBC

**Plain JDBC (50+ lines):**

```java
public List<Student> findAll() {
    List<Student> students = new ArrayList<>();
    Connection conn = null;
    PreparedStatement pstmt = null;
    ResultSet rs = null;
    
    try {
        // Get connection
        conn = DriverManager.getConnection(url, user, password);
        
        // Create statement
        String sql = "SELECT * FROM student";
        pstmt = conn.prepareStatement(sql);
        
        // Execute query
        rs = pstmt.executeQuery();
        
        // Process results
        while (rs.next()) {
            Student s = new Student();
            s.setRollNumber(rs.getInt("roll_number"));
            s.setName(rs.getString("name"));
            s.setMarks(rs.getInt("marks"));
            students.add(s);
        }
    } catch (SQLException e) {
        e.printStackTrace();
    } finally {
        // Close resources (critical!)
        try {
            if (rs != null) rs.close();
            if (pstmt != null) pstmt.close();
            if (conn != null) conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    
    return students;
}
```

**Spring JDBC (15 lines):**

```java
public List<Student> findAll() {
    String sql = "SELECT * FROM student";
    
    RowMapper<Student> mapper = new RowMapper<Student>() {
        @Override
        public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
            Student s = new Student();
            s.setRollNumber(rs.getInt("roll_number"));
            s.setName(rs.getString("name"));
            s.setMarks(rs.getInt("marks"));
            return s;
        }
    };
    
    return jdbc.query(sql, mapper);
}
```

**70% reduction!** And no resource management needed—Spring handles it!

---

## Step 14: Running and Verifying the Results

**"And I hope this will work. Let's try. So run this and I'm hoping it will work okay."**

### Expected Output

From main():

```java
Student s = context.getBean(Student.class);
s.setRollNumber(104);  // Assuming changed from 101
s.setName("Naveen");
s.setMarks(78);

service.addStudent(s);  // INSERT

List<Student> students = service.getStudents();  // SELECT
System.out.println(students);  // Print
```

### Console Output

**"So you can see one row affected. That's good."**

```
1 affected
```

This confirms the INSERT succeeded!

**"But if you see the data we got student first object second object which we can see 102103 we have."**

```
[Student{rollNumber=101, name='Kiran', marks=79}, 
 Student{rollNumber=102, name='Hersh', marks=68}, 
 Student{rollNumber=103, name='Sushil', marks=82}, 
 Student{rollNumber=104, name='Naveen', marks=78}]
```

Four Student objects! Let's verify:

**"This is the data which we have added data to SQL."**

From data.sql:
```sql
INSERT INTO student VALUES (101, 'Kiran', 79);   ✅ Present
INSERT INTO student VALUES (102, 'Hersh', 68);   ✅ Present
INSERT INTO student VALUES (103, 'Sushil', 82);  ✅ Present
```

**"And the data which we have added is this."**

From main() method:
```java
s.setRollNumber(104);  // Or corrected value
s.setName("Naveen");
s.setMarks(78);
service.addStudent(s);  ✅ Present in output!
```

**"So things are working out so that that's how basically you use a string or a template and spring JDBC. Okay."**

### What This Proves

✅ **schema.sql executed**: Table created successfully
✅ **data.sql executed**: 3 students pre-loaded
✅ **INSERT works**: Added 4th student (Naveen)
✅ **SELECT works**: Retrieved all 4 students
✅ **RowMapper works**: Converted ResultSet rows to Student objects
✅ **Data persists**: Database stores and retrieves data correctly!

**Complete CRUD cycle demonstrated!**

---

## Step 15: Understanding Functional Interfaces

**"But we can also use this as a lambda expression right. Can we do that."**

Before refactoring, let's understand why we can use lambda expressions.

### What Makes an Interface "Functional"?

```java
@FunctionalInterface
public interface RowMapper<T> {
    T mapRow(ResultSet rs, int rowNum) throws SQLException;
    // Only ONE abstract method!
}
```

**Criteria:**
1. **Exactly one abstract method** (SAM = Single Abstract Method)
2. Can have `default` methods (don't count)
3. Can have `static` methods (don't count)
4. Can extend other interfaces if still only one abstract method

**Other Examples:**

```java
@FunctionalInterface
interface Runnable {
    void run();  // One method
}

@FunctionalInterface
interface Comparator<T> {
    int compare(T o1, T o2);  // One method
    // Plus default methods: reversed(), thenComparing(), etc.
}

@FunctionalInterface
interface Predicate<T> {
    boolean test(T t);  // One method
}
```

### Lambda Expression Syntax

For functional interfaces, instead of:

```java
Runnable r = new Runnable() {
    @Override
    public void run() {
        System.out.println("Running");
    }
};
```

You can write:

```java
Runnable r = () -> System.out.println("Running");
```

**The Mapping:**

```
Anonymous Class                    Lambda Expression
---------------                    -----------------
new Interface() {           →      (parameters) -> { body }
    public ReturnType method(params) {
        // body
    }
}
```

---

## Step 16: Converting to Lambda Expression

**"Let's convert this into lambda."**

### Starting Point (Anonymous Class)

```java
RowMapper<Student> mapper = new RowMapper<Student>() {
    @Override
    public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
        Student s = new Student();
        s.setRollNumber(rs.getInt("roll_number"));
        s.setName(rs.getString("name"));
        s.setMarks(rs.getInt("marks"));
        return s;
    }
};
```

### Step 1: Remove Boilerplate

**"So when you when you have a functional interface from here to here this is something we can remove."**

Remove:
- `new RowMapper<Student>()`
- `@Override`
- Method signature `public Student mapRow`

**"You can even remove the exception."**

Remove:
- `throws SQLException`

### Step 2: Add Arrow Syntax

**"Let's put an arrow there."**

```java
RowMapper<Student> mapper = (ResultSet rs, int rowNum) -> {
    Student s = new Student();
    s.setRollNumber(rs.getInt("roll_number"));
    s.setName(rs.getString("name"));
    s.setMarks(rs.getInt("marks"));
    return s;
};
```

**Lambda Syntax:**

```
(parameters) -> { body }
     ↓            ↓
  Input        Output
```

**"And we can remove this arrow okay."**

I think the instructor meant remove extra braces or adjust formatting.

**"This works. So we have converted that into resultset into the arrow function."**

### Step 3: Remove Parameter Types

**"I think we can remove the type as well okay. Type remove."**

Java can infer parameter types from the RowMapper interface:

```java
// With types (verbose)
RowMapper<Student> mapper = (ResultSet rs, int rowNum) -> {
    // ...
};

// Without types (inferred)
RowMapper<Student> mapper = (rs, rowNum) -> {
    Student s = new Student();
    s.setRollNumber(rs.getInt("roll_number"));
    s.setName(rs.getString("name"));
    s.setMarks(rs.getInt("marks"));
    return s;
};
```

**Type Inference:**

Java knows from `RowMapper<Student>` that `mapRow` takes:
- `ResultSet rs`
- `int rowNum`

So we don't need to specify types!

**"So we have using the lambda expression here and we can remove the number of lines."**

We've reduced from ~8 lines to ~7 lines (not huge reduction yet).

---

## Step 17: Inline Lambda Expression

**"Now in this mapper basically you might see this code somewhere. So just I will just do that here I can actually paste this part."**

### The Ultimate Simplification

Instead of creating a separate mapper variable, pass the lambda directly!

**Before (two statements):**

```java
RowMapper<Student> mapper = (rs, rowNum) -> {
    Student s = new Student();
    s.setRollNumber(rs.getInt("roll_number"));
    s.setName(rs.getString("name"));
    s.setMarks(rs.getInt("marks"));
    return s;
};

return jdbc.query(sql, mapper);
```

**After (inline lambda):**

```java
return jdbc.query(sql, (rs, rowNum) -> {
    Student s = new Student();
    s.setRollNumber(rs.getInt("roll_number"));
    s.setName(rs.getString("name"));
    s.setMarks(rs.getInt("marks"));
    return s;
});
```

**"So you don't even need to create that."**

No `mapper` variable needed—lambda is anonymous!

**"So basically it says for this query it will return two things the result set and row row number. Just use result set and fetch your data and return."**

Perfect summary!

---

## Step 18: Final Simplified findAll() Implementation

### Complete Method (Lambda Version)

```java
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
```

**"So this is how you basically make your code shorter."**

### Comparison: Before and After

**Version 1 (Anonymous Class): 15 lines**

```java
public List<Student> findAll() {
    String sql = "SELECT * FROM student";
    
    RowMapper<Student> mapper = new RowMapper<Student>() {
        @Override
        public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
            Student s = new Student();
            s.setRollNumber(rs.getInt("roll_number"));
            s.setName(rs.getString("name"));
            s.setMarks(rs.getInt("marks"));
            return s;
        }
    };
    
    return jdbc.query(sql, mapper);
}
```

**Version 2 (Lambda): 10 lines**

```java
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
```

**33% fewer lines!** And much more readable.

---

## Step 19: Understanding Lambda Expressions Deeper

**"Now if you're not sure about how lambda expression works, you can check out the section of Java where we have the videos for lambda expression."**

### Lambda Expression Fundamentals

**Syntax:**

```java
(parameters) -> expression
// Or
(parameters) -> { statements; }
```

**Examples:**

```java
// No parameters
() -> System.out.println("Hello")

// One parameter (parentheses optional)
x -> x * x
(x) -> x * x  // Same thing

// Multiple parameters (parentheses required)
(x, y) -> x + y

// Multiple statements (braces required)
(x, y) -> {
    int sum = x + y;
    return sum;
}
```

### RowMapper Lambda Breakdown

```java
(rs, rowNum) -> {
    Student s = new Student();
    s.setRollNumber(rs.getInt("roll_number"));
    s.setName(rs.getString("name"));
    s.setMarks(rs.getInt("marks"));
    return s;
}
```

**Translated to English:**

"Given a ResultSet `rs` and row number `rowNum`, create a Student, populate it from the ResultSet, and return it."

**Equivalent Anonymous Class:**

```java
new RowMapper<Student>() {
    public Student mapRow(ResultSet rs, int rowNum) throws SQLException {
        Student s = new Student();
        s.setRollNumber(rs.getInt("roll_number"));
        s.setName(rs.getString("name"));
        s.setMarks(rs.getInt("marks"));
        return s;
    }
}
```

Same functionality, just cleaner syntax!

---

## Key Concepts Summary

### 1. SELECT Query
**Purpose**: Retrieve data from database tables.

**Syntax:**
```sql
SELECT * FROM table_name;
SELECT column1, column2 FROM table_name;
SELECT * FROM table_name WHERE condition;
```

**Example:**
```sql
SELECT * FROM student;
SELECT roll_number, name FROM student WHERE marks > 75;
```

### 2. jdbc.query() Method
**Purpose**: Execute SELECT queries and return List of objects.

**Signature:**
```java
<T> List<T> query(String sql, RowMapper<T> rowMapper)
```

**Parameters:**
- `String sql`: SELECT query
- `RowMapper<T> rowMapper`: Converts ResultSet rows to objects

**Returns:** `List<T>` (list of mapped objects)

**Example:**
```java
List<Student> students = jdbc.query("SELECT * FROM student", rowMapper);
```

### 3. RowMapper Interface
**Purpose**: Convert ResultSet rows to Java objects.

**Definition:**
```java
@FunctionalInterface
interface RowMapper<T> {
    T mapRow(ResultSet rs, int rowNum) throws SQLException;
}
```

**Parameters:**
- `ResultSet rs`: Current row (already positioned)
- `int rowNum`: Row index (0-based)

**Returns:** Mapped object (T)

**Implementation:**
```java
RowMapper<Student> mapper = (rs, rowNum) -> {
    Student s = new Student();
    s.setRollNumber(rs.getInt("roll_number"));
    s.setName(rs.getString("name"));
    s.setMarks(rs.getInt("marks"));
    return s;
};
```

### 4. ResultSet Methods
**Purpose**: Extract column values from database rows.

**Common Methods:**
```java
rs.getInt("column_name")      // Get integer
rs.getString("column_name")   // Get string
rs.getDouble("column_name")   // Get double
rs.getBoolean("column_name")  // Get boolean
rs.getDate("column_name")     // Get date
```

**Alternative (by index):**
```java
rs.getInt(1)      // First column
rs.getString(2)   // Second column
```

**Best Practice:** Use column names for clarity!

### 5. Anonymous Classes
**Purpose**: Create one-time implementations without separate class files.

**Syntax:**
```java
Interface var = new Interface() {
    // Implement methods
};
```

**Example:**
```java
RowMapper<Student> mapper = new RowMapper<Student>() {
    public Student mapRow(ResultSet rs, int rowNum) {
        // Implementation
    }
};
```

### 6. Lambda Expressions
**Purpose**: Concise syntax for functional interfaces (Java 8+).

**Syntax:**
```java
(parameters) -> expression
(parameters) -> { statements; }
```

**Example:**
```java
// Anonymous class
RowMapper<Student> mapper = new RowMapper<Student>() {
    public Student mapRow(ResultSet rs, int rowNum) {
        return new Student(rs.getInt(1), rs.getString(2), rs.getInt(3));
    }
};

// Lambda
RowMapper<Student> mapper = (rs, rowNum) -> 
    new Student(rs.getInt(1), rs.getString(2), rs.getInt(3));
```

### 7. Functional Interface
**Definition**: Interface with exactly one abstract method.

**Annotation:** `@FunctionalInterface` (optional but recommended)

**Examples:**
```java
@FunctionalInterface
interface RowMapper<T> {
    T mapRow(ResultSet rs, int rowNum);
}

@FunctionalInterface
interface Comparator<T> {
    int compare(T o1, T o2);
}
```

**Enables:** Lambda expressions and method references

### 8. Type Inference
**Purpose**: Java deduces types automatically.

**Example:**
```java
// Explicit types
RowMapper<Student> mapper = (ResultSet rs, int rowNum) -> { ... };

// Inferred types
RowMapper<Student> mapper = (rs, rowNum) -> { ... };
```

Java knows from `RowMapper<Student>` interface that parameters are `ResultSet` and `int`.

---

## Complete Code: StudentRepo.java

```java
package com.telusko.springjdbcexample.repository;

import com.telusko.springjdbcexample.model.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

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

---

## Execution Flow Visualization

```
1. main() calls service.getStudents()
        ↓
2. StudentService.getStudents() calls repo.findAll()
        ↓
3. StudentRepo.findAll() executes:
        ↓
4. jdbc.query("SELECT * FROM student", rowMapper)
        ↓
5. JdbcTemplate:
   ├─ Gets DataSource connection
   ├─ Creates PreparedStatement
   ├─ Executes query
   └─ Gets ResultSet with 4 rows
        ↓
6. For each row in ResultSet:
   ├─ Row 1: rs at {101, Kiran, 79}
   │   ├─ Calls rowMapper.mapRow(rs, 0)
   │   ├─ Lambda creates Student(101, "Kiran", 79)
   │   └─ Adds to list
   ├─ Row 2: rs at {102, Hersh, 68}
   │   ├─ Calls rowMapper.mapRow(rs, 1)
   │   ├─ Lambda creates Student(102, "Hersh", 68)
   │   └─ Adds to list
   ├─ Row 3: rs at {103, Sushil, 82}
   │   ├─ Calls rowMapper.mapRow(rs, 2)
   │   ├─ Lambda creates Student(103, "Sushil", 82)
   │   └─ Adds to list
   └─ Row 4: rs at {104, Naveen, 78}
       ├─ Calls rowMapper.mapRow(rs, 3)
       ├─ Lambda creates Student(104, "Naveen", 78)
       └─ Adds to list
        ↓
7. JdbcTemplate closes resources (auto)
        ↓
8. Returns List<Student> (4 students)
        ↓
9. Service returns to main()
        ↓
10. main() prints list
        ↓
Output: [Student{101, Kiran, 79}, Student{102, Hersh, 68}, 
         Student{103, Sushil, 82}, Student{104, Naveen, 78}]
```

---

## Troubleshooting Common Issues

### Issue 1: Empty List Returned
**Problem:** `findAll()` returns `[]` (empty list)

**Possible Causes:**

1. **Table empty:**
   ```sql
   -- Check in H2 console or logs
   SELECT COUNT(*) FROM student;  -- Should be > 0
   ```

2. **Wrong table name:**
   ```java
   // Wrong
   String sql = "SELECT * FROM students";  // Table is "student" not "students"
   
   // Right
   String sql = "SELECT * FROM student";
   ```

3. **data.sql not executed:**
   - Check file location: `src/main/resources/data.sql`
   - Check for SQL syntax errors in logs

### Issue 2: NullPointerException in mapRow
**Problem:** NPE when accessing ResultSet

**Cause:** Trying to get non-existent column

```java
// Wrong column name
s.setRollNumber(rs.getInt("rollNumber"));  // Column is "roll_number"

// Right
s.setRollNumber(rs.getInt("roll_number"));
```

### Issue 3: Type Mismatch Error
**Problem:** `SQLException: Data conversion error`

**Cause:** Using wrong ResultSet method for column type

```java
// Wrong (name is VARCHAR, not INT)
s.setName(rs.getInt("name"));  // Error!

// Right
s.setName(rs.getString("name"));
```

**Type Matching:**

| SQL Type | Java Type | ResultSet Method |
|----------|-----------|------------------|
| INT | int | getInt() |
| VARCHAR | String | getString() |
| DECIMAL | double | getDouble() |
| BOOLEAN | boolean | getBoolean() |
| DATE | java.sql.Date | getDate() |
| TIMESTAMP | java.sql.Timestamp | getTimestamp() |

### Issue 4: Lambda Compilation Error
**Problem:** "Target type of lambda expression must be functional interface"

**Cause:** Java can't infer the type

```java
// Won't compile (no type context)
var mapper = (rs, rowNum) -> { ... };

// Compiles (explicit type)
RowMapper<Student> mapper = (rs, rowNum) -> { ... };

// Also compiles (inline, type inferred from jdbc.query())
jdbc.query(sql, (rs, rowNum) -> { ... });
```

---

## Best Practices

### 1. Use Column Names, Not Indices
```java
// Fragile (breaks if column order changes)
s.setRollNumber(rs.getInt(1));
s.setName(rs.getString(2));

// Robust (works even if column order changes)
s.setRollNumber(rs.getInt("roll_number"));
s.setName(rs.getString("name"));
```

### 2. Prefer Lambda Over Anonymous Class
```java
// Verbose
RowMapper<Student> mapper = new RowMapper<Student>() {
    public Student mapRow(ResultSet rs, int rowNum) { ... }
};

// Concise
RowMapper<Student> mapper = (rs, rowNum) -> { ... };
```

### 3. Inline Simple RowMappers
```java
// Separate variable (use if mapper reused)
RowMapper<Student> mapper = (rs, rowNum) -> { ... };
return jdbc.query(sql, mapper);

// Inline (better for single use)
return jdbc.query(sql, (rs, rowNum) -> { ... });
```

### 4. Handle Null Values
```java
public Student mapRow(ResultSet rs, int rowNum) {
    Student s = new Student();
    s.setRollNumber(rs.getInt("roll_number"));
    
    // Handle potential NULL values
    String name = rs.getString("name");
    s.setName(name != null ? name : "Unknown");
    
    s.setMarks(rs.getInt("marks"));
    return s;
}
```

### 5. Use Explicit Column Lists in SELECT
```java
// Works but fragile
String sql = "SELECT * FROM student";

// Better (explicit, self-documenting)
String sql = "SELECT roll_number, name, marks FROM student";
```

---

## What's Next

We've completed the basic CRUD operations with Spring JDBC:

✅ **CREATE**: `save()` with INSERT and jdbc.update()
✅ **READ**: `findAll()` with SELECT and jdbc.query()

**Still To Cover:**

🔲 **UPDATE**: Modify existing student records
🔲 **DELETE**: Remove student records
🔲 **Query By ID**: Find specific student
🔲 **Parameterized Queries**: WHERE clauses with placeholders
🔲 **Batch Operations**: Insert multiple records efficiently
🔲 **H2 Console**: Visual database management
🔲 **Spring Data JPA**: Even simpler data access!

In upcoming videos, we'll explore more JdbcTemplate features and eventually transition to Spring Data JPA, which reduces code even further!

---

## Conclusion: SELECT Queries Mastered!

We've accomplished major milestones:

✅ **Implemented findAll()** with SELECT query
✅ **Used jdbc.query()** method correctly  
✅ **Created RowMapper** to convert ResultSet → Student
✅ **Understood ResultSet** and extraction methods
✅ **Verified data persistence** (saw all 4 students!)
✅ **Refactored to lambda** for cleaner code
✅ **Mastered functional interfaces** and modern Java syntax

**Key Achievement:**

```java
// From this (dummy):
public List<Student> findAll() {
    return new ArrayList<>();
}

// To this (real database query):
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
```

We now have a complete working application that:
- Stores data in H2 database (INSERT)
- Retrieves data from H2 database (SELECT)
- Uses Spring JDBC with minimal boilerplate
- Demonstrates modern Java 8+ features (lambdas)

**"So that's it from here. See you in the next video."**

The foundation is solid—ready for more advanced database operations! 🎯
