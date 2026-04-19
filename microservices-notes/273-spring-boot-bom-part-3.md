# Optimizing Microservices with Spring Boot BOM — Part 3: Adopting the BOM

## Introduction

The BOM is built. Now comes the satisfying part — **wiring every microservice to use it**. We'll update each microservice's `pom.xml` to inherit from `eazy-bom`, remove all hardcoded versions, and witness the magic: change a version once, and it propagates everywhere.

---

## Updating a Microservice to Use the BOM

Let's walk through the changes using the accounts microservice as an example.

### Step 1: Replace the Parent

**Before** (hardcoded Spring Boot parent):
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.3</version>
</parent>
```

**After** (inheriting from eazy-bom):
```xml
<parent>
    <groupId>com.eazybytes</groupId>
    <artifactId>eazy-bom</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <relativePath>../eazy-bom/pom.xml</relativePath>
</parent>
```

### Why `<relativePath>`?

It tells Maven **exactly where** to find the parent POM relative to this project. Your IDE might resolve it automatically, but **CI/CD tools** need this path to build correctly. Always include it.

### Step 2: Delete Properties

Remove the entire `<properties>` block from the microservice — all properties now come from the parent BOM.

### Step 3: Update Third-Party Dependency Versions

For Spring Boot dependencies, **remove version numbers entirely** — the BOM handles them:

```xml
<!-- No version needed — inherited from BOM -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

For third-party libraries, **reference the parent's property**:

```xml
<dependency>
    <groupId>io.opentelemetry.javaagent</groupId>
    <artifactId>opentelemetry-javaagent</artifactId>
    <version>${opentelemetry.version}</version>
</dependency>

<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
    <version>${micrometer.version}</version>
</dependency>

<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <version>${h2.version}</version>
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
```

### Step 4: Remove Duplicated Dependency Management

Delete the `<dependencyManagement>` section from the microservice — it's already in the BOM:

```xml
<!-- DELETE THIS from individual microservices -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            ...
        </dependency>
    </dependencies>
</dependencyManagement>
```

### Step 5: Update Build Plugin Versions

```xml
<plugin>
    <groupId>com.google.cloud.tools</groupId>
    <artifactId>jib-maven-plugin</artifactId>
    <version>${jib.version}</version>
    <configuration>
        <to>
            <image>eazybytes/accounts:${image.tag}</image>
        </to>
    </configuration>
</plugin>
```

No more hardcoded `S14` or `S20` tags — it pulls from the BOM property.

---

## The FAQ: Why Do Microservices Still List Individual Dependencies?

Good question! We imported the entire Spring Boot BOM in the parent — doesn't that mean all Spring Boot dependencies are automatically available?

**No.** The BOM only manages **versions**. Each microservice must still declare **which specific dependencies** it needs. Spring Boot has hundreds of starters — your accounts service doesn't need all of them. It declares only what it uses (Data JPA, Web, Validation, Actuator), and the BOM ensures they all share the same consistent version.

---

## Testing the BOM

### Verify with a Build

After updating, do a Maven reload and build. No compilation errors = success.

### Verify Version Propagation

1. Start a microservice (e.g., config server) → logs show Spring Boot **3.3.3**
2. Change `spring-boot.version` in BOM to **3.3.2**
3. Reload Maven, rebuild, restart → logs show Spring Boot **3.3.2**

One change, every microservice picks it up. That's the magic.

---

## Repeat for All Microservices

Apply the same changes to every microservice:
1. Replace parent with `eazy-bom`
2. Delete properties block
3. Reference parent properties for third-party versions
4. Remove duplicated dependency management
5. Update build plugin references

---

## ✅ Key Takeaways

- Replace the Spring Boot parent with your BOM in every microservice
- Always include `<relativePath>` for CI/CD compatibility
- **Spring Boot dependencies**: don't specify version (inherited automatically)
- **Third-party dependencies**: reference BOM properties like `${lombok.version}`
- The BOM manages **versions only** — each microservice still declares **which** dependencies it needs
- Changing a version in the BOM propagates to all microservices after a Maven reload
- If changes don't reflect, clear Maven cache or restart your IDE

---

## 💡 Pro Tip

If Maven cache issues prevent version changes from taking effect, try `mvn clean install -U` (the `-U` flag forces Maven to check for updated snapshots and releases). In IntelliJ, you can also try "Invalidate Caches and Restart."
