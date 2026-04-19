# Optimizing Microservices with Spring Boot BOM — Part 2: Creating the BOM

## Introduction

Now that we understand the problem, let's build the solution. We'll create a dedicated Maven project called `eazy-bom` that serves as the **parent POM** for all microservices. This BOM will hold every version number, every common property, and every dependency declaration — in one place.

---

## Step 1: Create the BOM Project

Create a new Spring Boot Maven project:

- **Name**: `eazy-bom`
- **Group**: `com.eazybytes`
- **Artifact**: `eazy-bom`
- **Language**: Java
- **Type**: Maven
- **JDK**: 21

Don't add any Spring Boot starter dependencies — this project won't run any application.

---

## Step 2: Delete the Source Folder

A BOM project should contain **only** dependency management information — no source code. Delete the entire `src` folder.

> This is a best practice. A BOM is a configuration artifact, not a runnable application.

---

## Step 3: Configure the POM

### Remove the Spring Boot Parent

Delete the default `<parent>` block that references `spring-boot-starter-parent`. Your BOM is the **top-level parent** — it doesn't inherit from Spring Boot.

### Set Packaging to POM

This is critical:

```xml
<packaging>pom</packaging>
```

Without `<packaging>pom</packaging>`, the BOM concept doesn't work. This tells Maven this project is a parent/aggregator, not a JAR.

### Add Optional Metadata

```xml
<url>https://www.eazybytes.com</url>
<licenses>...</licenses>
<developers>...</developers>
<scm>...</scm>
```

These are optional but professional — they document who maintains the project.

---

## Step 4: Define Properties

This is where the centralization magic lives:

```xml
<properties>
    <java.version>21</java.version>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
    <spring-boot.version>3.3.3</spring-boot.version>
    <spring-cloud.version>2023.0.3</spring-cloud.version>
    <lombok.version>1.18.34</lombok.version>
    <h2.version>2.3.230</h2.version>
    <spring-doc.version>2.6.0</spring-doc.version>
    <opentelemetry.version>1.33.0</opentelemetry.version>
    <micrometer.version>1.13.3</micrometer.version>
    <jib.version>3.4.2</jib.version>
    <image.tag>S20</image.tag>
</properties>
```

**Important**: For third-party libraries (Lombok, H2, Spring Doc, etc.), always declare the exact version. Don't rely on Spring Boot's auto-resolution — having explicit control prevents surprise upgrades.

---

## Step 5: Define Dependency Management

The `<dependencyManagement>` section imports BOMs from other ecosystems:

```xml
<dependencyManagement>
    <dependencies>
        <!-- Spring Boot BOM -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${lombok.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- Spring Cloud BOM -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- Spring Boot Starter Test (regular dependency) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <version>${spring-boot.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### Why `<type>pom</type>` and `<scope>import</scope>`?

This tells Maven: "Don't download this as a JAR. Instead, import the list of dependencies it declares." It's how one BOM references another BOM.

### Why Is `spring-boot-starter-test` Different?

It's added as a regular dependency (not `pom/import`) because it's a small library, not a BOM with sub-dependencies. It doesn't contain nested dependency declarations to import.

---

## The Final BOM Structure

```
eazy-bom/
├── pom.xml          ← The only file that matters
└── (no src folder)
```

Your `pom.xml` contains:
- `<packaging>pom</packaging>`
- All version properties
- Dependency management with imported BOMs

---

## ✅ Key Takeaways

- A BOM project has **no source code** — delete the `src` folder
- Set `<packaging>pom</packaging>` — this is mandatory for BOM projects
- Remove the Spring Boot parent — your BOM is the top-level parent
- Define all versions as **properties** so they're referenced consistently
- Use `<dependencyManagement>` with `<type>pom</type>` and `<scope>import</scope>` to import other BOMs
- Always declare explicit versions for third-party libraries — don't let Spring Boot choose for you

---

## ⚠️ Common Mistakes

- Forgetting `<packaging>pom</packaging>` — without this, Maven treats it as a regular JAR project
- Leaving the `src` folder — it creates confusion and someone might accidentally add code
- Not declaring third-party library versions explicitly — leads to unpredictable version resolution
