# Setting Up a Service Discovery Agent with Eureka Server

## Introduction

Theory's over. Time to build. In this lecture, we create a brand-new Spring Boot application that acts as the **Eureka Server** — the service discovery agent for our microservices network. By the end, you'll have a running Eureka dashboard showing a live registry of registered services.

---

## Setting Up the Project

### Step 1: Generate the Project

Head to **start.spring.io** and configure:

| Field | Value |
|-------|-------|
| Build Tool | Maven |
| Language | Java |
| Spring Boot | Latest stable version |
| Group | `com.eazybytes` |
| Artifact | `eurekaserver` |
| Packaging | JAR |
| Java Version | 17 |

**Dependencies to add:**
- **Eureka Server** — this makes this app a service discovery agent (NOT "Eureka Discovery Client" — that's for microservices)
- **Config Client** — so Eureka Server can fetch its properties from Config Server
- **Spring Boot Actuator** — for health checks and monitoring

⚠️ **Important:** Select "Eureka Server," not "Eureka Discovery Client." The client dependency goes in your microservices; the server dependency goes here.

### Step 2: Enable Eureka Server

In the main class, add the `@EnableEurekaServer` annotation:

```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

This single annotation transforms a regular Spring Boot app into a fully functional service discovery agent.

---

## Configuring the Eureka Server

### Local `application.yml`

Rename `application.properties` to `application.yml` and add:

```yaml
spring:
  application:
    name: "eurekaserver"
  config:
    import: "optional:configserver:http://localhost:8071/"

management:
  endpoints:
    web:
      exposure:
        include: "*"
  health:
    readiness-state:
      enabled: true
    liveness-state:
      enabled: true
  endpoint:
    health:
      probes:
        enabled: true
```

The `spring.application.name` must match the config file name in your Config Server repository.

### Config Server Properties (`eurekaserver.yml`)

Create an `eurekaserver.yml` in your Git config repository:

```yaml
server:
  port: 8070

eureka:
  instance:
    hostname: localhost
  client:
    fetchRegistry: false
    registerWithEureka: false
    serviceUrl:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
```

### ❓ Why `fetchRegistry: false`?

The Eureka Server doesn't need to fetch the registry — it *is* the registry. This property is `true` by default, and we override it because the server will never need to discover other services.

### ❓ Why `registerWithEureka: false`?

We don't want the Eureka Server to register *with itself*. It's the registry, not a service that needs to be discovered.

### ❓ What is `defaultZone`?

This is the URL where Eureka exposes its functionality. Other microservices will connect to this URL to register themselves and discover other services. The path `/eureka/` is the standard endpoint.

---

## Starting and Validating

### Startup Order

1. Start **Config Server** first (port 8071)
2. Verify config is loaded: `http://localhost:8071/eurekaserver/default`
3. Start **Eureka Server** (port 8070)

### Accessing the Dashboard

Navigate to `http://localhost:8070` — you'll see the **Eureka Dashboard**.

The dashboard shows:
- System status
- Currently registered instances (empty for now)
- General info about the Eureka Server

Right now, the "Instances currently registered with Eureka" section is empty because no microservices have connected yet. That's our next step.

---

## ✅ Key Takeaways

- The Eureka Server is created with the `spring-cloud-starter-netflix-eureka-server` dependency
- `@EnableEurekaServer` annotation activates service discovery functionality
- Set `fetchRegistry: false` and `registerWithEureka: false` — the server shouldn't register with or discover itself
- The `defaultZone` URL is where clients connect for registration and discovery
- The Eureka Dashboard at the root URL provides a visual overview of registered services
- Eureka Server should fetch its config from the Config Server, just like other microservices

## ⚠️ Common Mistakes

- Selecting "Eureka Discovery Client" instead of "Eureka Server" in Spring Initializr
- Forgetting to set `registerWithEureka` and `fetchRegistry` to `false` on the server — this causes the server to try to register with itself
- Not starting the Config Server before the Eureka Server

## 💡 Pro Tip

Always expose readiness and liveness probes on your Eureka Server. When using Docker Compose later, you'll need these to ensure microservices don't start until Eureka is fully ready.
