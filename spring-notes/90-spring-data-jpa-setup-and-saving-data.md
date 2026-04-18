# Setting Up Spring Data JPA — Saving Data Without Writing SQL

## Introduction

We've understood the theory — ORM maps objects to tables, Hibernate is the tool, JPA is the specification, and Spring Data JPA simplifies everything. Now it's time to see it in action.

In this section, we'll create a new Spring Boot project, set up Spring Data JPA, and **save data to a PostgreSQL database without writing a single SQL query**. Sounds too good to be true? Let's find out.

---

## Concept 1: Project Setup

### ⚙️ Spring Initializr configuration

| Setting       | Value                      |
|---------------|----------------------------|
| Build tool    | Maven                      |
| Language      | Java 21                    |
| Packaging     | JAR                        |
| Dependencies  | **Spring Data JPA**, **PostgreSQL Driver** |

Just two dependencies. Notice we're **not** adding Spring Web — this is a console application to learn Spring Data JPA in isolation. We'll integrate it with the web layer later.

### ⚙️ What we're reusing

From the earlier Spring JDBC project, we reuse:
- The **Student** model class (with `rollNo`, `name`, `marks`)
- The **application.properties** database configuration

We're **skipping** the service layer for now to keep things focused.

### ⚙️ Application properties — Connecting to PostgreSQL

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/telusko
spring.datasource.username=postgres
spring.datasource.password=0000
```

Also make sure you **don't have an existing `student` table** in the database — delete it if it exists from the JDBC project.

---

## Concept 2: Creating the Repository — Just an Interface

### 🧠 This is where the magic happens

In Spring JDBC, our repository was a **class** full of code — `JdbcTemplate`, SQL queries, `RowMapper`. With Spring Data JPA, the repository is just an **interface**:

```java
@Repository
public interface StudentRepo extends JpaRepository<Student, Integer> {
}
```

That's it. No methods. No SQL. No implementation. Just an interface that extends `JpaRepository`.

### ❓ What are the two type parameters?

`JpaRepository<Student, Integer>` needs two things:

1. **Entity type** — which class are you working with? → `Student`
2. **Primary key type** — what's the type of the primary key? → `Integer` (because `rollNo` is an `int`)

### ❓ Where do the methods come from?

If you type `repo.` in your IDE, you'll see dozens of methods: `save()`, `findAll()`, `findById()`, `delete()`, `count()`... But we didn't write any of them!

The inheritance chain reveals the source:

```
JpaRepository
    └── extends ListCrudRepository
          └── extends CrudRepository
                → save(), findAll(), findById(), delete(), count(), etc.
```

Spring Data JPA provides all CRUD operations out of the box. You just extend the interface and get everything for free.

### 💡 Insight

"But it's an interface — there's no implementation! How can it work?"

Spring Data JPA generates the implementation **at runtime**. When the application starts, Spring sees your interface extending `JpaRepository`, creates a proxy class that implements all the methods, and registers it as a bean. You never see the implementation code — it just works.

---

## Concept 3: The Entity Annotation — Learning from Errors

### 🧠 Error-driven learning

Let's try to save data and see what happens. In the main application:

```java
ApplicationContext context = SpringApplication.run(...);

Student s1 = context.getBean(Student.class);
Student s2 = context.getBean(Student.class);
Student s3 = context.getBean(Student.class);

s1.setRollNo(101); s1.setName("Rahul"); s1.setMarks(85);
s2.setRollNo(102); s2.setName("Priya"); s2.setMarks(92);
s3.setRollNo(103); s3.setName("Amit");  s3.setMarks(78);

StudentRepo repo = context.getBean(StudentRepo.class);
repo.save(s1);
```

Run it. **Error!**

### 🔴 Error 1: "Student is not a managed type"

The framework doesn't know that `Student` should map to a database table. Fix: add `@Entity` on top of the class.

```java
@Entity
public class Student {
    int rollNo;
    String name;
    int marks;
}
```

`@Entity` tells JPA: "This class represents a database table. Map it."

### 🔴 Error 2: "Student has no identifier"

Every database table needs a **primary key**. JPA doesn't know which field is the primary key. Fix: add `@Id` on the primary key field.

```java
@Entity
public class Student {
    @Id
    int rollNo;
    String name;
    int marks;
}
```

`@Id` tells JPA: "This field is the primary key of the table."

### 🔴 Error 3: "Table 'student' does not exist"

Now JPA knows it's an entity with a primary key. It tries to save data... but there's no table in the database! JPA found the mapping, generated the INSERT query, but there's no table to insert into.

Wait — it generated a query? We didn't write any SQL! That's Hibernate doing its job behind the scenes. But we need a table first.

### 💡 Insight

Notice how each error taught us something new:
1. First error → we need `@Entity`
2. Second error → we need `@Id`
3. Third error → we need a table

This is the beauty of learning from errors. Each one reveals a missing piece.

---

## Concept 4: Auto-Creating Tables with DDL Auto

### 🧠 Let the framework create the table

Instead of manually creating the table in `pgAdmin` or writing `schema.sql`, we can tell Hibernate to create it automatically:

```properties
spring.jpa.hibernate.ddl-auto=update
```

### ❓ What does `ddl-auto` mean?

**DDL** = Data Definition Language — SQL commands that define table structure (`CREATE TABLE`, `DROP TABLE`, `ALTER TABLE`).

The `ddl-auto` property tells Hibernate what to do with tables at startup:

| Value      | Behavior                                                    |
|------------|-------------------------------------------------------------|
| `create`   | Drop existing table and create a new one **every time**     |
| `update`   | Create the table if it doesn't exist; update if it does     |
| `validate` | Only validate that the table matches the entity — don't change anything |
| `none`     | Do nothing                                                   |

**`update` is the safest for development** — it creates the table on first run and preserves data on subsequent runs. `create` would wipe your data every time you restart the application.

### ⚙️ Bonus: Seeing the SQL queries

Add this property to see what Hibernate generates behind the scenes:

```properties
spring.jpa.show-sql=true
```

Now when you run the application, you'll see the actual SQL in the console.

---

## Concept 5: Running It — The Moment of Truth

### 🧪 What happens when we run?

With all the pieces in place:
- `@Entity` on Student
- `@Id` on rollNo
- `ddl-auto=update` in properties
- `show-sql=true` in properties

Run the application and check the console:

```sql
Hibernate: create table student (roll_no integer not null, marks integer, name varchar(255), primary key (roll_no))
Hibernate: insert into student (marks, name, roll_no) values (?, ?, ?)
Hibernate: insert into student (marks, name, roll_no) values (?, ?, ?)
Hibernate: insert into student (marks, name, roll_no) values (?, ?, ?)
```

Look at that:
1. Hibernate **created the table** automatically — with the right columns and types
2. Hibernate **inserted three rows** — one for each `save()` call
3. We wrote **zero SQL queries**

### 🧪 Verifying in pgAdmin

Open pgAdmin, refresh your database, and view the `student` table rows:

```
┌─────────┬────────┬───────┐
│ roll_no  │ name   │ marks │
├─────────┼────────┼───────┤
│ 101     │ Rahul  │ 85    │
│ 102     │ Priya  │ 92    │
│ 103     │ Amit   │ 78    │
└─────────┴────────┴───────┘
```

Data saved. No SQL written. No `schema.sql`. No `JdbcTemplate`. Just an entity class, an interface, and two lines of configuration.

---

## Concept 6: Comparing Spring JDBC vs Spring Data JPA

### 🧠 The difference is dramatic

| Aspect                  | Spring JDBC                          | Spring Data JPA                    |
|-------------------------|--------------------------------------|------------------------------------|
| Repository              | Full class with methods              | Just an interface                  |
| SQL queries             | Written manually                     | Generated by Hibernate             |
| Table creation          | `schema.sql` file                    | Automatic with `ddl-auto`          |
| RowMapper               | Required for reading data            | Not needed                         |
| JdbcTemplate            | Core of all operations               | Not used at all                    |
| Lines of code           | Many                                 | Almost none                        |
| Annotations on entity   | None required                        | `@Entity`, `@Id`                   |

---

## ✅ Key Takeaways

- Spring Data JPA repository is just an **interface** extending `JpaRepository` — no implementation needed
- `@Entity` marks a class as a database table mapping
- `@Id` marks a field as the primary key
- `spring.jpa.hibernate.ddl-auto=update` auto-creates tables if they don't exist
- `spring.jpa.show-sql=true` shows the SQL that Hibernate generates behind the scenes
- `JpaRepository` provides all CRUD methods out of the box — `save()`, `findAll()`, `findById()`, `delete()`, and more
- Spring generates the repository implementation at runtime — you never write it

## ⚠️ Common Mistakes

- Forgetting `@Entity` on the model class — JPA won't recognize it as a table mapping
- Forgetting `@Id` on the primary key field — every entity must have exactly one
- Using `ddl-auto=create` instead of `update` — `create` drops and recreates the table on every restart, losing all data
- Having an old table from a previous project — delete it or let `ddl-auto=update` handle the schema mismatch

## 💡 Pro Tips

- Always use `ddl-auto=update` during development and `validate` or `none` in production — you don't want your production database schema changed automatically
- Enable `show-sql=true` while learning to understand what Hibernate does behind the scenes — disable it in production to reduce log noise
- Spring Data JPA doesn't replace your SQL knowledge — it generates SQL for you, but understanding SQL helps you debug and optimize
