# Stop Writing SQL Like It's 1999 — Why JDBC Alone Isn't Enough

## Introduction

So far in our Spring Boot journey, we've set up an H2 database and stored company-related data in it. But here's the big question — **how does our Java code actually talk to the database?**

Unless our backend can communicate with the database, we can't fetch data and send it as a response from our REST APIs. That's exactly what this section is all about — exploring the options we have when interacting with a database from Java.

We already added `spring-boot-starter-data-jpa` in our `pom.xml`. But before we dive into Spring Data JPA, let's understand **why the traditional JDBC approach falls short** — and why frameworks like Spring Data JPA exist in the first place.

---

## The Traditional JDBC Way — Step by Step

Whenever a Java developer wanted to communicate with a database using plain JDBC, they had to follow a series of mandatory steps. Let's walk through each one:

### Step 1: Establish a Connection

The very first thing you need to do is create a connection to your database:

```java
Connection conn = DriverManager.getConnection(url, username, password);
```

You use the `DriverManager` class from the JDBC library, call `getConnection()`, and pass in your database URL, username, and password. The library gives you back a `Connection` object.

### Step 2: Create an SQL Statement

Once connected, you manually write the SQL query you want to execute:

```java
PreparedStatement ps = conn.prepareStatement("SELECT * FROM companies");
```

Notice something? **You're writing raw SQL strings.** If there's a typo, you won't know until runtime.

### Step 3: Execute the Query

Now you fire off the query:

```java
ResultSet rs = ps.executeQuery();
```

The `executeQuery()` method returns a `ResultSet` — basically a raw dump of rows and columns from the database.

### Step 4: Process the Results (The Painful Part)

Here's where things get ugly. The `ResultSet` is not a Java object — it's a low-level database structure. You need to **manually iterate** through it and map each column to a Java field:

```java
while (rs.next()) {
    Company company = new Company();
    company.setId(rs.getLong("id"));
    company.setName(rs.getString("name"));
    company.setSize(rs.getInt("size"));
    // ... and so on for every column
}
```

Why do we do this? Because **Java code only understands objects.** Your business logic can't work with raw database rows. You need to transform that data into POJOs (Plain Old Java Objects).

### Step 5: Close Resources

After you're done, you **must** close the connection in a `finally` block:

```java
finally {
    conn.close();
}
```

If you forget this step, you'll leak database connections — a serious problem in production.

### Step 6: Handle Exceptions

All JDBC code throws `SQLException`, which is a **checked exception**. That means you're forced to either catch it or declare it with `throws`:

```java
try {
    // all the JDBC code
} catch (SQLException e) {
    // handle exception
}
```

---

## The Problem — It's All Boilerplate!

Look at those six steps again. How many of them are actually about your **business logic**?

**Only one** — defining what SQL statement to execute.

Everything else — establishing connections, creating statements, executing queries, iterating results, closing connections, handling exceptions — is **boilerplate code.** It's repetitive, error-prone, and time-consuming.

> Think of it this way: you just want to ask the database a simple question ("give me all companies"), but you have to go through an entire bureaucratic process just to ask it.

---

## Enter Spring Data JPA — The Framework That Does the Heavy Lifting

This is exactly the problem Spring Data JPA solves. Instead of writing all that boilerplate, you tell the framework **what** you want (the SQL logic, the where condition), and it handles **everything else**:

- ✅ Creating database connections
- ✅ Generating SQL statements
- ✅ Executing queries
- ✅ Mapping results to Java objects
- ✅ Closing connections
- ✅ Handling exceptions and transactions

You'll see the magic and power of Spring Data JPA throughout this course. The amount of code you'll write to interact with a database will blow your mind.

---

## Spring Data — The Umbrella Project

On the Spring official website, under **Projects**, there's a sub-project called **Spring Data**. Under this umbrella, you'll find many sub-projects:

| Sub-Project | Database Type |
|---|---|
| Spring Data **JPA** | Relational (MySQL, Postgres, Oracle) |
| Spring Data **MongoDB** | NoSQL (MongoDB) |
| Spring Data **Redis** | Caching (Redis) |
| Spring Data **Elasticsearch** | Search Engine |
| Spring Data **Neo4j** | Graph Database |
| Spring Data **Cassandra** | Wide-column Store |

We'll be using **Spring Data JPA** throughout this course for relational database access.

> But wait — what's the difference between Spring Data and Spring Data JPA? And why are there so many sub-projects? We'll answer that in the next lecture.

---

## ✅ Key Takeaways

1. **Traditional JDBC** requires 6 mandatory steps just to run a single query — most of which are boilerplate.
2. The only meaningful step from a developer's perspective is defining the SQL logic.
3. **Spring Data JPA** abstracts away all the boilerplate, letting developers focus on business logic.
4. **Spring Data** is an umbrella project with sub-projects for different database types (JPA, MongoDB, Redis, etc.).
5. We use `spring-boot-starter-data-jpa` in `pom.xml` to bring in Spring Data JPA.

---

## ⚠️ Common Mistakes

- **Forgetting to close connections** in JDBC — leads to connection leaks and crashes in production.
- **Hardcoding SQL strings** — any typo won't be caught until runtime.
- **Not handling `SQLException`** — it's a checked exception; the compiler will force you to deal with it.
- **Confusing Spring Data with Spring Data JPA** — Spring Data is the parent; Spring Data JPA is one specific child project for relational databases.

---

## 💡 Pro Tips

- If you ever see legacy code using raw JDBC (`DriverManager`, `PreparedStatement`, `ResultSet`), that's a strong signal it could benefit from Spring Data JPA migration.
- Spring Data JPA doesn't just eliminate boilerplate — it also provides **type safety**, **transaction management**, and **caching** out of the box.
- The `spring-boot-starter-data-jpa` dependency pulls in everything you need — Hibernate, JDBC drivers, and Spring Data JPA all in one shot.
