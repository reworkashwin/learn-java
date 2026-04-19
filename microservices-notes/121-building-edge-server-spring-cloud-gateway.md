# Building an Edge Server with Spring Cloud Gateway

## Introduction

Theory is done — let's build. In this lecture, we create a fully functional API Gateway using Spring Cloud Gateway, connect it to Config Server and Eureka, and configure it to automatically discover and route to our microservices.

---

## Creating the Gateway Server Project

### ⚙️ Spring Initializr Setup

Go to [start.spring.io](https://start.spring.io) and configure:

| Setting | Value |
|---------|-------|
| Project | Maven |
| Language | Java |
| Group | com.eazybytes |
| Artifact | gatewayserver |
| Packaging | Jar |
| Java | 17 |

### Dependencies to Add

1. **Gateway** — the core Spring Cloud Gateway starter
2. **Eureka Discovery Client** — so the gateway can fetch service registry details from Eureka
3. **Config Client** — so the gateway loads its configuration from Config Server
4. **Spring Boot Actuator** — for monitoring and management endpoints
5. **Spring Boot DevTools** — for faster development restarts

Generate, download, extract, and place the project alongside your other microservices.

---

## Configuring the Gateway Server

### Step 1: Add Jib Plugin

Copy the Google Jib Maven plugin from any existing microservice's `pom.xml` into the gateway server's `pom.xml` for Docker image generation.

### Step 2: Set Up application.yml

Rename `application.properties` to `application.yml`, then configure:

```yaml
spring:
  application:
    name: "gatewayserver"
  config:
    import: "optional:configserver:http://localhost:8071/"
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true   # Enable automatic route discovery from Eureka

management:
  endpoints:
    web:
      exposure:
        include: "*"
  endpoint:
    gateway:
      enabled: true       # Enable gateway-specific actuator endpoints

info:
  app:
    name: "gatewayserver"
    description: "Eazy Bank Gateway Server Application"
```

### ❓ What Does `discovery.locator.enabled: true` Do?

This is the key property. It tells Spring Cloud Gateway: *"Connect to Eureka, discover all registered services, and automatically create routes for them."*

Without writing a single routing rule, the gateway will know about accounts, loans, and cards microservices and be able to route to them.

### Step 3: Config Server Properties

Create a `gatewayserver.yml` in your Config Server's GitHub repository with:

```yaml
server:
  port: 8072

eureka:
  instance:
    preferIpAddress: true
  client:
    fetchRegistry: true
    registerWithEureka: true
    serviceUrl:
      defaultZone: "http://localhost:8070/eureka/"
```

The gateway starts on port **8072** and registers with Eureka so it's visible in the dashboard.

---

## How Default Routing Works

Once the gateway starts, it fetches service registry details from Eureka and auto-creates routes. You can see them at:

```
http://localhost:8072/actuator/gateway/routes
```

For each registered service, you'll see:
- **Path predicate**: matches the service name (e.g., `ACCOUNTS`)
- **RewritePath filter**: strips the service name prefix before forwarding
- **URI**: `lb://ACCOUNTS` — load-balanced route to the accounts service

### 🧪 Example: Invoking Accounts Through the Gateway

Instead of calling accounts directly at `localhost:8080/api/create`, you now call:

```
POST http://localhost:8072/ACCOUNTS/api/create
```

The gateway:
1. Matches the path prefix `ACCOUNTS`
2. Strips `/ACCOUNTS` from the path
3. Forwards `/api/create` to the accounts microservice
4. Uses load balancing (via Eureka) to pick an instance

Similarly for other services:
```
GET http://localhost:8072/LOANS/api/fetch?mobileNumber=...
GET http://localhost:8072/CARDS/api/fetch?mobileNumber=...
```

---

## Startup Order

The gateway must start **last** because it needs Eureka to have registry data:

1. Config Server
2. Eureka Server
3. Accounts, Loans, Cards (any order)
4. **Gateway Server** (last)

---

## ✅ Key Takeaways

- Creating a gateway server is as simple as creating any Spring Boot application — just different dependencies
- `discovery.locator.enabled: true` enables automatic route creation from Eureka registry
- The gateway actuator at `/actuator/gateway/routes` shows all registered routes
- Default routing uses the uppercase service name as the path prefix
- External clients now send all requests to port `8072` (gateway) instead of directly to microservices
- `lb://SERVICE_NAME` means "use load balancer to route to this service"

## ⚠️ Common Mistakes

- Starting the gateway before other microservices are registered with Eureka — the gateway won't have any routes
- Forgetting to enable the gateway actuator endpoint (`endpoint.gateway.enabled: true`)
- Not adding the Eureka Discovery Client dependency — the gateway can't discover services without it

## 💡 Pro Tip

The gateway actuator endpoint (`/actuator/gateway/routes`) is your debugging best friend. Whenever routing doesn't work as expected, check this endpoint first to see what routes the gateway actually has.
