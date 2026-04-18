# Lombok — Because Typing Getters & Setters Is Boring

## Introduction

In the previous lecture, our Entity class was **180 lines long** — and most of that was getters, setters, and constructors. None of it was business logic. It was all **boilerplate code** — repetitive, mechanical, and boring to write.

Enter **Project Lombok** — a Java library that eliminates boilerplate code using annotations. With Lombok, that 180-line Entity class shrinks to **60 lines**. Let's see how.

---

## What Is Lombok?

Lombok is a Java annotation library that generates boilerplate code **during compilation**. You write annotations, and Lombok generates the actual code (getters, setters, constructors, `toString()`, etc.) in the compiled bytecode.

Your source code stays clean and minimal. The generated code exists only in the `.class` files.

> **Analogy:** You write the blueprint (annotations). Lombok builds the house (actual Java code) for you during compilation.

---

## Setting Up Lombok

### Step 1: Add the Dependency

In `pom.xml`:

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

You can find this on [start.spring.io](https://start.spring.io) — search for "Lombok" under Developer Tools.

### Step 2: Configure Maven Plugins

Two plugin configurations are needed:

**Maven Compiler Plugin** — enables annotation processing during compilation:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

**Spring Boot Maven Plugin** — excludes Lombok from the final JAR (it's only needed at compile time, not runtime):

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <excludes>
            <exclude>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </exclude>
        </excludes>
    </configuration>
</plugin>
```

### Step 3: IntelliJ Setup

1. **Install the Lombok plugin** (Settings → Plugins → Search "Lombok"). It usually comes pre-installed.
2. **Enable annotation processing** (Settings → Build → Compiler → Annotation Processors → ✅ Enable annotation processing).

---

## Lombok in Action — Getters and Setters

### Before Lombok (180 lines):

```java
@Entity
@Table(name = "COMPANIES")
public class Company {
    private Long id;
    private String name;
    private String logo;
    // ... 10+ more fields ...

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    // ... 20+ more getter/setter methods ...
}
```

### After Lombok (60 lines):

```java
@Getter @Setter
@Entity
@Table(name = "COMPANIES")
public class Company {
    private Long id;
    private String name;
    private String logo;
    // ... fields only, no getters/setters needed ...
}
```

Two annotations — `@Getter` and `@Setter` — replace **120 lines of code**. The getter and setter methods are generated during compilation and exist in the bytecode, but not in your source code.

You can verify this in IntelliJ by checking the class structure — all getter and setter methods show up, even though you didn't write them!

---

## Lombok for Constructors

### Before Lombok:

```java
@Service
public class CompanyServiceImpl {
    private final CompanyRepository companyRepository;

    public CompanyServiceImpl(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }
}
```

### After Lombok:

```java
@Service
@RequiredArgsConstructor
public class CompanyServiceImpl {
    private final CompanyRepository companyRepository;
}
```

`@RequiredArgsConstructor` generates a constructor that takes all **`final` fields** as parameters. Since Spring uses constructor injection, this works perfectly — and you don't even need `@Autowired` (single constructor rule).

---

## All Lombok Annotations at a Glance

| Annotation | What It Generates |
|---|---|
| `@Getter` | Getter methods for all fields |
| `@Setter` | Setter methods for all fields |
| `@ToString` | `toString()` method |
| `@EqualsAndHashCode` | `equals()` and `hashCode()` methods |
| `@NoArgsConstructor` | Default (no-argument) constructor |
| `@RequiredArgsConstructor` | Constructor with only `final` fields |
| `@AllArgsConstructor` | Constructor with ALL fields as parameters |
| `@Data` | Combines: `@Getter` + `@Setter` + `@ToString` + `@EqualsAndHashCode` + `@RequiredArgsConstructor` |

### When to use @Data?

If you want everything in one shot, use `@Data`. But be careful — it generates `@EqualsAndHashCode` which may not behave exactly as you expect for Entity classes (we'll discuss this in advanced topics).

---

## Bonus: Viewing Generated SQL

While working with Lombok and Spring Data JPA, add this to `application.properties`:

```properties
spring.jpa.show-sql=${SHOW_SQL:true}
```

This logs the SQL statements generated by the framework. Extremely useful for learning and debugging.

### Why the `${SHOW_SQL:true}` syntax?

- In development → defaults to `true` (SQL is printed)
- In production → set the `SHOW_SQL` environment variable to `false` (no SQL in production logs)

This avoids hardcoding `true` and accidentally logging SQL in production, which causes **performance issues** and **security concerns**.

---

## How Lombok Works — Under the Hood

Here's what happens during the build process:

1. **You write** source code with Lombok annotations (`@Getter`, `@Setter`)
2. **Maven compiles** the code and invokes annotation processors
3. **Lombok's processor** reads the annotations and **modifies the bytecode** to include the generated methods
4. **The `.class` file** contains getters, setters, constructors — even though your `.java` file doesn't

This is why:
- The Maven Compiler plugin needs annotation processing enabled
- Lombok is excluded from the final JAR (it's only needed during compilation)
- IntelliJ needs the Lombok plugin to show generated methods in the IDE

---

## ✅ Key Takeaways

1. **Lombok** eliminates boilerplate code — getters, setters, constructors, `toString()`, `equals()`, `hashCode()`.
2. `@Getter @Setter` replaced **120 lines** of getter/setter methods in our Entity class.
3. `@RequiredArgsConstructor` generates constructors for `final` fields — perfect for Spring dependency injection.
4. `@Data` is a shortcut for `@Getter` + `@Setter` + `@ToString` + `@EqualsAndHashCode` + `@RequiredArgsConstructor`.
5. Lombok works at **compile time** — it modifies bytecode, not source code.
6. Lombok has **25+ million downloads** in IntelliJ — it's an industry standard.
7. Use `spring.jpa.show-sql` with environment variables to control SQL logging per environment.

---

## ⚠️ Common Mistakes

- **Forgetting to enable annotation processing** in IntelliJ — Lombok annotations won't work without this.
- **Not adding the Maven Compiler plugin configuration** — Lombok needs annotation processing enabled in the build.
- **Using `@Data` on Entity classes without thinking** — `@EqualsAndHashCode` on entities can cause issues with JPA proxies. Prefer explicit `@Getter @Setter` on entities.
- **Expecting Lombok in the runtime JAR** — it's compile-time only. Exclude it from the packaged artifact.

---

## 💡 Pro Tips

- For **Entity classes**, use `@Getter @Setter` explicitly rather than `@Data` — it gives you more control over equals/hashCode behavior.
- For **Service/Controller classes**, `@RequiredArgsConstructor` is your best friend — it replaces constructor boilerplate and enables clean dependency injection.
- You can use `@Getter` and `@Setter` at the **field level** too — if you only want getters for specific fields.
- Check out Lombok's [feature table](https://projectlombok.org/features/) for the complete list of annotations — there are many we haven't covered yet.
