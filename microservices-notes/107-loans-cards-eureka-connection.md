# Connecting Loans and Cards Microservices to Eureka Server

## Introduction

You've seen how to connect Accounts to Eureka Server. Now it's time to do the same for Loans and Cards. The process is identical — this is a quick lecture that validates the pattern works consistently across all services and introduces a useful Eureka API endpoint.

---

## Changes for Loans and Cards

The changes for both services mirror what we did for Accounts:

### 1. Add Eureka Client Dependency

In both `pom.xml` files:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

### 2. Add Properties to `application.yml`

```yaml
eureka:
  instance:
    preferIpAddress: true
  client:
    fetchRegistry: true
    registerWithEureka: true
    serviceUrl:
      defaultZone: http://localhost:8070/eureka/

management:
  info:
    env:
      enabled: true
  endpoint:
    shutdown:
      enabled: true

endpoints:
  shutdown:
    enabled: true

info:
  app:
    name: "loans"  # or "cards"
    description: "Eazy Bank Loans Application"  # or Cards
    version: "1.0.0"
```

### 3. Start and Verify

Start both services. The Eureka dashboard at `http://localhost:8070` should now show:

| Application | Status |
|------------|--------|
| ACCOUNTS | UP (1) |
| CARDS | UP (1) |
| LOANS | UP (1) |

---

## The Eureka Apps API

Beyond the dashboard, Eureka provides a REST API to programmatically fetch registry information.

### XML Format (default)

```
GET http://localhost:8070/eureka/apps
```

Returns all registered applications and their instances in XML format. Each entry includes:
- Instance ID, hostname, app name, IP address
- Status and port number
- Renewal interval, registration timestamp, last heartbeat time
- Health check URL, status page URL, home page URL

### JSON Format

Use Postman with the `Accept: application/json` header:

```
GET http://localhost:8070/eureka/apps
Accept: application/json
```

### Filtering by Service

Get only a specific service's details:

```
GET http://localhost:8070/eureka/apps/accounts
GET http://localhost:8070/eureka/apps/loans
GET http://localhost:8070/eureka/apps/cards
```

This is the same API that microservices use internally for service discovery. When Accounts asks "where is Loans?", it's querying this endpoint behind the scenes.

---

## The Bigger Picture

Think about scale: we have 3 microservices. In a real bank, you might have 100+. Without Eureka, someone would have to manually maintain IP addresses for every instance of every service — and update them every time a container scales or restarts.

With Eureka, microservices register themselves automatically during startup. No manual work. No stale configurations. The registry is always up to date.

---

## ✅ Key Takeaways

- The same three changes (dependency, properties, info metadata) apply to **every microservice**
- `http://localhost:8070/eureka/apps` provides the full registry as a REST API
- Add `Accept: application/json` header for JSON responses
- Filter by service name: `/eureka/apps/{serviceName}`
- Registration happens **automatically** during startup — zero manual intervention
- Eureka scales from 3 services to hundreds with the same pattern
