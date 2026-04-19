# Optimizing Microservices with Spring Boot BOM — Part 4: Advanced BOM Features

## Introduction

The BOM is working — versions are centralized, builds pass, Docker images generate correctly. But there are two more powerful features to explore: **overriding versions for individual microservices** and **defining common dependencies** that all microservices share. These complete the BOM picture.

---

## Feature 1: Overriding Versions Per Microservice

What if one microservice needs a **different version** of a library? Maybe loans needs an older Lombok version due to a compatibility issue?

### The Solution: Just Specify the Version Locally

```xml
<!-- In loans/pom.xml -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.32</version>  <!-- Overrides parent's 1.18.34 -->
</dependency>
```

Maven's **nearest definition wins** rule means the local version takes precedence over the parent's property. This gives you flexibility without breaking the BOM pattern.

> The BOM sets the **default**. Individual microservices can override when they have a genuine reason. The key word is "genuine" — don't override casually.

---

## Feature 2: Common Dependencies in the BOM

Look at your microservices — some dependencies appear in **every single one**. For example, `spring-boot-starter-test` exists in accounts, cards, loans, gateway, config server, eureka server, and message service.

Why duplicate it 7 times?

### Understanding `dependencyManagement` vs. `dependencies`

This distinction is crucial:

| Section | Purpose |
|---|---|
| `<dependencyManagement>` | Declares **version management only** — child projects must still explicitly list dependencies they want |
| `<dependencies>` | Declares **actual dependencies** — child projects inherit them automatically |

### Moving Common Dependencies to the BOM

**Step 1**: Remove `spring-boot-starter-test` from all individual microservices.

**Step 2**: Add it under `<dependencies>` (NOT `<dependencyManagement>`) in the BOM:

```xml
<!-- In eazy-bom/pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <version>${spring-boot.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

**Step 3**: Reload Maven.

Now all child microservices automatically inherit `spring-boot-starter-test` without declaring it individually. The duplicate code is eliminated.

### How to Decide What Goes in `dependencies`

Only move a dependency to the BOM's `<dependencies>` section if it's truly used by **all** (or nearly all) microservices. Keep service-specific dependencies in the individual `pom.xml` files.

---

## Validating Docker Image Generation

After all BOM changes, verify Docker images still generate correctly:

```bash
cd configserver
mvn compile jib:dockerBuild
```

Check Docker Desktop:
- Image: `eazybytes/configserver`
- Tag: `S20` (from `${image.tag}` property)
- Size: ~354 MB (no bloat from BOM changes)

Run a container to verify:

```bash
docker run -p 8071:8071 eazybytes/configserver:S20
```

The application should start and show the correct Spring Boot version.

---

## Summary: The Complete BOM Setup

```
eazy-bom/
├── pom.xml
│   ├── <packaging>pom</packaging>
│   ├── <properties>
│   │   ├── spring-boot.version
│   │   ├── spring-cloud.version
│   │   ├── java.version
│   │   ├── Third-party versions (lombok, h2, etc.)
│   │   ├── jib.version
│   │   └── image.tag
│   ├── <dependencyManagement>  ← version management only
│   │   ├── Spring Boot BOM (pom/import)
│   │   ├── Spring Cloud BOM (pom/import)
│   │   └── Third-party BOMs
│   └── <dependencies>  ← inherited by ALL children
│       └── spring-boot-starter-test
│
├── accounts/pom.xml  ← inherits from eazy-bom
├── cards/pom.xml     ← inherits from eazy-bom
├── loans/pom.xml     ← inherits from eazy-bom
└── ...
```

---

## ✅ Key Takeaways

- Individual microservices can **override** BOM versions when needed — the local version wins
- `<dependencyManagement>` = version control only; `<dependencies>` = automatic inheritance
- Move truly **universal** dependencies (used by all services) into the BOM's `<dependencies>` section
- Keep service-specific dependencies in individual `pom.xml` files
- Docker image generation is unaffected by BOM adoption
- Always adopt BOM in real production microservices — it saves enormous time during upgrades

---

## ⚠️ Common Mistakes

- Putting service-specific dependencies in the BOM's `<dependencies>` — this forces every microservice to carry unused JARs
- Confusing `<dependencyManagement>` with `<dependencies>` — version management vs. actual import
- Not running `mvn clean install` on the BOM after changes — child projects might use stale versions
