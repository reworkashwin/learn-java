# Shared Libraries in Microservices — Part 2: Building a Multi-Module Library

## Introduction

Theory is done. Let's build. We'll create a `common` submodule inside the `eazy-bom` project, move the duplicated `ErrorResponseDto` into it, and wire the microservices to use the shared library. This is the multi-module approach in practice.

---

## Step 1: Create the Submodule

Create a new Maven module under `eazy-bom`:

- **Name**: `common`
- **Group**: `com.eazybytes`
- **Artifact**: `common`
- **Type**: Maven
- **Packaging**: JAR
- **Dependencies**: Spring Web, Lombok (select during creation)

---

## Step 2: Register the Module in the Parent

In `eazy-bom/pom.xml`, add the module declaration:

```xml
<modules>
    <module>common</module>
</modules>
```

This tells Maven that `common` is a submodule of `eazy-bom`.

---

## Step 3: Configure the Submodule's POM

### Replace the Parent

Change from Spring Boot parent to `eazy-bom`:

```xml
<parent>
    <groupId>com.eazybytes</groupId>
    <artifactId>eazy-bom</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</parent>
```

### Use a Property for the Version

Add a version property in the parent BOM:

```xml
<!-- In eazy-bom/pom.xml properties -->
<common-lib.version>1.0.0</common-lib.version>
```

Reference it in the common module's `pom.xml`:

```xml
<version>${common-lib.version}</version>
```

### Reference Parent Properties for Dependencies

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>${lombok.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>${spring-doc.version}</version>
    </dependency>
</dependencies>
```

### Remove Build Configurations

Delete the build section — it's inherited from the parent.

### Delete the Application Class

This is a **library**, not a runnable application. Delete the auto-generated `CommonApplication.java` class.

---

## Step 4: Move Shared Code

1. Create a `dto` package inside the common module: `com.eazybytes.dto`
2. Move `ErrorResponseDto.java` into this package
3. **Delete** `ErrorResponseDto.java` from accounts, cards, and loans microservices

---

## Step 5: Add the Dependency in Microservices

Each microservice that needs the shared code must declare it as a dependency:

```xml
<!-- In accounts/pom.xml, cards/pom.xml, loans/pom.xml -->
<dependency>
    <groupId>com.eazybytes</groupId>
    <artifactId>common</artifactId>
    <version>${common-lib.version}</version>
</dependency>
```

---

## Step 6: Fix Import Statements

After moving the class, the import path changes. Update all classes that reference `ErrorResponseDto`:

**Before**:
```java
import com.eazybytes.accounts.dto.ErrorResponseDto;
```

**After**:
```java
import com.eazybytes.dto.ErrorResponseDto;
```

This affects files like `GlobalExceptionHandler`, controllers, and any class that uses the DTO.

---

## Step 7: Publish the Common Module Locally

Before microservices can use the common module, it must be available in the local Maven repository:

```bash
cd eazy-bom/common
mvn clean install
```

This builds the JAR and publishes it to `~/.m2/repository/com/eazybytes/common/`. The Docker image generation process fetches it from here.

---

## Step 8: Verify Everything

### Build
```bash
mvn clean compile  # from the parent project
```

### Docker Image Generation
```bash
cd accounts
mvn compile jib:dockerBuild
```

If the image generates successfully, the shared library is correctly integrated.

---

## The Final Structure

```
eazy-bom/
├── pom.xml             ← Parent BOM (packaging: pom)
│   ├── <modules>
│   │   └── <module>common</module>
│   ├── <properties>
│   │   └── common-lib.version = 1.0.0
│   └── ...
│
├── common/             ← Shared library submodule
│   ├── pom.xml         ← packaging: jar, parent: eazy-bom
│   └── src/main/java/com/eazybytes/dto/
│       └── ErrorResponseDto.java
│
├── accounts/           ← Depends on common
├── cards/              ← Depends on common
└── loans/              ← Depends on common
```

---

## Scaling This Pattern

Need more shared libraries? Create more submodules:

```xml
<modules>
    <module>common</module>
    <module>common-security</module>
    <module>common-logging</module>
    <module>common-audit</module>
</modules>
```

Each microservice cherry-picks only the modules it needs. No bloated JARs, no version chaos.

---

## ✅ Key Takeaways

- Create submodules under the BOM for shared code — each focused on one concern
- Register submodules in the parent POM using `<modules>`
- Delete the auto-generated `Application` class — shared modules are **libraries**, not apps
- Run `mvn clean install` on the common module to publish it to local Maven repo
- Update import statements in all consuming microservices after moving shared classes
- Microservices declare the common module as a regular `<dependency>`
- This approach scales — add as many submodules as needed

---

## ⚠️ Common Mistakes

- Forgetting to run `mvn clean install` on the common module — Docker image generation will fail because the JAR isn't in the local repo
- Not updating import statements after moving classes — causes compilation errors
- Making the common module too large — keep it focused; create separate modules for different concerns
- Putting business logic in shared modules — only share truly generic, reusable code
