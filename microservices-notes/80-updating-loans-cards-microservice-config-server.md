# Updating Loans & Cards Microservices for Config Server

## Introduction

The accounts microservice is successfully reading configuration from the Config Server. The final step is to integrate the loans and cards microservices in exactly the same way. The process is identical — same dependencies, same configuration pattern, same result.

---

## The Integration Checklist

For **each** microservice (loans and cards), you need four changes:

### 1. Clean Up Local Profile Files

Delete from `src/main/resources`:
- `application-qa.yml`
- `application-prod.yml`

Remove from `application.yml`:
- Profile import entries
- `build.version` property
- Any leftover profile activation config

### 2. Add Identity and Config Server Connection

Update `application.yml`:

```yaml
spring:
  application:
    name: "loans"    # or "cards" for cards microservice
  profiles:
    active: "prod"
  config:
    import: "optional:configserver:http://localhost:8071/"
```

The `name` value is the key — it must match the file names in the Config Server:
- `loans` → Config Server looks for `loans.yml`, `loans-prod.yml`, `loans-qa.yml`
- `cards` → Config Server looks for `cards.yml`, `cards-prod.yml`, `cards-qa.yml`

### 3. Add Dependencies to pom.xml

```xml
<!-- Config Client dependency -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>

<!-- Spring Cloud version in properties -->
<properties>
    <spring-cloud.version>2022.0.3</spring-cloud.version>
</properties>

<!-- Dependency management for Spring Cloud -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 4. Rebuild

Run `mvn clean install` or reload Maven in your IDE after adding the new dependencies.

---

## Validation

### Startup Order

Always start in this sequence:
1. Config Server (port 8071)
2. Accounts (port 8080)
3. Loans (port 8090)
4. Cards (port 9000)

Config Server must be running before any microservice starts (unless you used `optional:`).

### Testing Loans

With default `prod` profile:
- `GET localhost:8090/api/build-info` → `1.0` ✅
- `GET localhost:8090/api/contact-info` → Product owner details from loans-prod config ✅

### Testing Cards

With default `prod` profile:
- `GET localhost:9000/api/build-info` → `1.0` ✅
- `GET localhost:9000/api/contact-info` → Product owner details from cards-prod config ✅

---

## The Complete Architecture Now

With all three microservices connected, here's what the system looks like:

```
Config Server (8071)
    ├── accounts.yml, accounts-prod.yml, accounts-qa.yml
    ├── loans.yml, loans-prod.yml, loans-qa.yml
    └── cards.yml, cards-prod.yml, cards-qa.yml
         │
         ├──→ Accounts (8080)  "name=accounts, profile=prod"
         ├──→ Loans (8090)     "name=loans, profile=prod"
         └──→ Cards (9000)     "name=cards, profile=prod"
```

Each microservice identifies itself by name, requests its profile-specific configuration, and the Config Server serves the right properties. No microservice knows about or has access to another microservice's configuration.

---

## Classpath Approach: When to Use It

We stored configurations in the Config Server's classpath (`src/main/resources/config/`). This works, but has a limitation:

Anyone with access to the Config Server's **source code** can see all the configurations. The properties are literally inside the JAR file.

For learning and simple projects, this is fine. For production environments where you need:
- Separation between the Config Server code and the configuration data
- Version-controlled configuration with audit trails
- Access control on who can read/modify configs

...you need a different storage backend. The next approaches — **file system** and **Git repository** — provide this separation.

---

## ✅ Key Takeaways

- All microservices follow the same integration pattern — identical dependencies, identical `application.yml` structure
- The only thing that differs is `spring.application.name` — this is how each microservice gets its own configuration
- Always start the Config Server before microservices
- The classpath approach stores config inside the Config Server JAR — simple but not ideal for production
- Next step: storing configurations externally (file system or Git) for better separation and security

💡 **Pro Tip:** In a real project, you'd typically have a CI/CD pipeline that starts the Config Server first, waits for its health check to pass, then starts the other microservices. Never assume startup order in containerized environments — use health checks and readiness probes.
