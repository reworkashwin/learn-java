# Building a Config Server Using Spring Cloud Config

## Introduction

Time to build the Config Server — the centralized brain that will manage configuration for all our microservices. This is a standalone Spring Boot application with a single special annotation that transforms it into a configuration hub.

---

## Creating the Config Server Project

### Step 1: Generate the Project

Go to [start.spring.io](https://start.spring.io) and configure:

| Field | Value |
|-------|-------|
| Project | Maven |
| Language | Java |
| Group | `com.eazybytes` |
| Artifact | `configserver` |
| Name | `configserver` |
| Packaging | JAR |

### Step 2: Add Dependencies

Two dependencies are needed:

1. **Config Server** — The core dependency that enables the configuration server functionality
2. **Spring Boot Actuator** — For health checks and monitoring

⚠️ Don't confuse **Config Server** with **Config Client**:
- `Config Server` → Used in the config server application itself
- `Config Client` → Used in microservices that *connect to* the config server

### What Gets Added to pom.xml

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

---

## Spring Cloud Version Mapping

Since Spring Cloud is a separate project from Spring Boot, you need the correct version pairing:

```xml
<properties>
    <spring-cloud.version>2022.0.3</spring-cloud.version>
</properties>
```

The version mapping is documented on the [Spring Cloud project page](https://spring.io/projects/spring-cloud). Always check that your Spring Boot and Spring Cloud versions are compatible.

You also need the dependency management block:

```xml
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

---

## Enabling the Config Server

In your main application class, add a single annotation:

```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

That's it. `@EnableConfigServer` transforms this Spring Boot application into a fully functional configuration server with REST endpoints for serving configuration data.

---

## Basic Configuration

Rename `application.properties` to `application.yml` and add:

```yaml
server:
  port: 8071

spring:
  application:
    name: "configserver"
```

The port `8071` keeps it out of the way of your microservices (accounts on 8080, loans on 8090, cards on 9000). The `spring.application.name` gives it a meaningful identity in the microservices ecosystem.

---

## Where to Store Configurations?

The Config Server needs a **backend** — a place to read configuration files from. Spring Cloud Config supports several options:

| Option | Approach | Best For |
|--------|----------|----------|
| Classpath | Store config files inside the Config Server JAR | Quick demos, learning |
| File System | Store config files in a folder on the server | Simple local setups |
| Git Repository | Store config files in a Git repo | **Production** — versioning, auditing, PRs |
| Database | Store config in a database table | Dynamic config via SQL |
| AWS S3 | Store config in an S3 bucket | AWS-native deployments |
| HashiCorp Vault | Store secrets in Vault | Sensitive credentials |

We'll cover three approaches throughout this course:
1. **Classpath** (simplest — starting here)
2. **File system** (next step)
3. **Git repository** (production-ready)

---

## What's Next

The Config Server is created, but it has no configuration data to serve yet. We need to:
1. Move our microservices' properties into the Config Server's storage location
2. Tell the Config Server where to find them
3. Connect our microservices as Config Clients

Let's start by storing configurations in the Config Server's classpath — the simplest approach for getting things working.

---

## ✅ Key Takeaways

- Config Server is a standalone Spring Boot application with `@EnableConfigServer`
- Requires `spring-cloud-config-server` dependency
- Spring Cloud has its own version separate from Spring Boot — check compatibility
- The `dependencyManagement` block is required for Spring Cloud dependency resolution
- Port `8071` is used for the Config Server throughout this course
- Multiple storage backends are supported — classpath for learning, Git for production
