# Making Kubernetes Discovery Client Changes in Microservices — Part 2

## Introduction

We've updated Accounts, Cards, Loans, Config Server, and Message. Now it's time for the trickiest one: the **Gateway Server**. As the edge server that handles all incoming traffic, the Gateway Server has additional considerations and a couple of surprises.

---

## Changes in the Gateway Server

### Step 1: Swap the Maven Dependency

Same as the other services — replace Eureka with Kubernetes Discovery Client:

```xml
<!-- REMOVE -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

<!-- ADD -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-kubernetes-discovery-client</artifactId>
</dependency>
```

Update the image tag to `s17`.

### Step 2: Add @EnableDiscoveryClient

```java
@EnableDiscoveryClient
@SpringBootApplication
public class GatewayserverApplication {
    // ...
}
```

### Step 3: Update Route URIs (Critical Change!)

This is where the Gateway Server differs significantly. Previously, our routing configuration used load-balanced URIs:

```java
// BEFORE (with Eureka)
.route(p -> p.path("/easybank/accounts/**")
    .uri("lb://ACCOUNTS"))
.route(p -> p.path("/easybank/loans/**")
    .uri("lb://LOANS"))
.route(p -> p.path("/easybank/cards/**")
    .uri("lb://CARDS"))
```

The `lb://` prefix told the Gateway Server to use **Spring Cloud Load Balancer** for client-side load balancing via Eureka. We don't want that anymore — we want Kubernetes to handle load balancing.

Replace with actual service URLs:

```java
// AFTER (with Kubernetes Discovery)
.route(p -> p.path("/easybank/accounts/**")
    .uri("http://accounts:8080"))
.route(p -> p.path("/easybank/loans/**")
    .uri("http://loans:8090"))
.route(p -> p.path("/easybank/cards/**")
    .uri("http://cards:9000"))
```

The beauty: we're not hardcoding IP addresses. As long as the Kubernetes Service name matches (`accounts`, `loans`, `cards`), these URLs resolve correctly inside the cluster.

### Step 4: Update application.yml

**Remove** Eureka-specific properties like `discovery.locator.enabled` and `lowerCaseServiceId`:

```yaml
# DELETE these
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lowerCaseServiceId: true
```

**Add** Kubernetes Discovery properties:

```yaml
spring:
  cloud:
    kubernetes:
      discovery:
        enabled: true
        all-namespaces: true
    discovery:
      client:
        health-indicator:
          enabled: false
```

### Step 5: The Health Indicator Fix

Wait — what's that `health-indicator.enabled: false` property? This is a workaround for a known issue:

When the Kubernetes Discovery Client library loads, it expects a certain health indicator bean. But there's a conflict that prevents this bean from being created properly, causing the Gateway Server to crash on startup.

The Spring Cloud Kubernetes team has acknowledged this issue on GitHub. The fix is to disable the health indicator:

```yaml
spring:
  cloud:
    discovery:
      client:
        health-indicator:
          enabled: false
```

When this issue gets resolved in a future version, this property can be removed. If you check the course's GitHub repo and don't see this property, that means the fix has been applied upstream.

---

## After All Code Changes: Build Docker Images

With all microservice code changes complete, the next step is to generate Docker images with the `s17` tag for all services. This happens behind the scenes — each service gets a new Docker image reflecting the Kubernetes Discovery Client changes.

Also set up the Kubernetes cluster with supporting components (Kafka, Keycloak, Grafana, Prometheus) since we uninstalled everything previously.

---

## ✅ Key Takeaways

- Gateway Server routes must change from `lb://SERVICE_NAME` (client-side LB) to `http://service-name:port` (direct Kubernetes service URLs)
- Add both `discovery.enabled: true` and `all-namespaces: true` for the Gateway Server
- You **must** set `spring.cloud.discovery.client.health-indicator.enabled: false` to avoid a startup crash — this is a known library issue
- The Gateway Server no longer performs client-side load balancing — Kubernetes handles it at the service level
- Build new Docker images after all code changes are complete

## ⚠️ Common Mistake

Leaving the `lb://` prefix in Gateway routes. With this prefix, the Gateway tries to use Spring Cloud Load Balancer (which relies on Eureka). Since Eureka is gone, requests will fail. Always use direct `http://service-name:port` URLs in the Kubernetes setup.
