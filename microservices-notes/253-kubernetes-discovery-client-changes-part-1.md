# Making Kubernetes Discovery Client Changes in Microservices — Part 1

## Introduction

The Discovery Server is running inside our Kubernetes cluster. Now comes the real work: modifying each microservice to ditch Eureka and use the Kubernetes Discovery Client instead. In this part, we'll tackle the **Accounts**, **Cards**, **Loans**, **Config Server**, and **Message** microservices.

---

## Changes in the Accounts Microservice

The Accounts service is the most involved because it uses Feign Clients to communicate with Cards and Loans. Let's walk through every change.

### Step 1: Update the Maven Dependency

In `pom.xml`, find the Eureka dependency:

```xml
<!-- REMOVE this -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

Replace it with:

```xml
<!-- ADD this -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-kubernetes-discovery-client</artifactId>
</dependency>
```

After this swap, you might get a compilation error in `CustomerController` related to `HttpStatus`. The Eureka client dependency was pulling in an HTTP library transitively. Fix it by removing the broken import and letting your IDE resolve `HttpStatus` from `org.apache.hc.core5.http.HttpStatus` or the appropriate available package.

### Step 2: Enable Discovery Client

In the main application class (`AccountsApplication.java`), add the annotation:

```java
@EnableDiscoveryClient
@SpringBootApplication
public class AccountsApplication {
    // ...
}
```

### Step 3: Update application.yml

**Remove** all Eureka-related properties (search for "eureka" and delete everything related).

**Add** the Kubernetes discovery property under `spring.cloud`:

```yaml
spring:
  cloud:
    kubernetes:
      discovery:
        all-namespaces: true
```

Why `all-namespaces: true`? While we deploy everything in the `default` namespace now, some organizations spread services across multiple namespaces. This setting ensures the discovery client can find services regardless of their namespace.

### Step 4: Update Feign Clients (Critical!)

This is where it gets interesting. With Eureka, our Feign Clients looked like:

```java
@FeignClient(name = "cards")
public interface CardsFeignClient {
    // ...
}
```

This worked because the Feign Client would ask Eureka "where is 'cards'?" and get the instance details. But now there's **no Eureka integration configured** — so how would the Feign Client know where to find the Cards service?

The fix: explicitly provide the URL:

```java
@FeignClient(name = "cards", url = "http://cards:9000")
public interface CardsFeignClient {
    // ...
}
```

And for Loans:

```java
@FeignClient(name = "loans", url = "http://loans:8090")
public interface LoansFeignClient {
    // ...
}
```

How do these URLs work? Inside a Kubernetes cluster, **the service name acts as the hostname/DNS name**. As long as you create a Kubernetes Service named `cards` that routes to your Cards pods, `http://cards:9000` resolves correctly within the cluster.

⚠️ **Important**: These URLs only work **inside** the Kubernetes cluster. For local testing without Kubernetes, you'd need to use `localhost` URLs instead.

Another key point: the Feign Client is **not performing any load balancing** with this approach. It simply forwards the request to the service URL, and Kubernetes handles the load balancing internally.

---

## Changes in the Cards Microservice

### pom.xml
- Replace `spring-cloud-starter-netflix-eureka-client` with `spring-cloud-starter-kubernetes-discovery-client`
- Update image tag to `s17`

### Main Class
```java
@EnableDiscoveryClient
@SpringBootApplication
public class CardsApplication {
    // ...
}
```

### application.yml
- Remove all Eureka properties
- Add under `spring.cloud`:
```yaml
spring:
  cloud:
    kubernetes:
      discovery:
        all-namespaces: true
```

No Feign Client changes needed — Cards doesn't call other services.

---

## Changes in the Loans Microservice

Identical to Cards:
- Swap the Maven dependency
- Add `@EnableDiscoveryClient`
- Remove Eureka properties, add Kubernetes discovery properties
- No Feign Client changes needed

---

## Changes in Config Server and Message Service

These services don't connect to Eureka at all, so the changes are minimal:
- **Only update the image tag** from `s14` to `s17` in `pom.xml`
- No dependency swaps, no annotation changes, no property changes

---

## Summary of All Changes

| Service | Dependency Swap | @EnableDiscoveryClient | Remove Eureka Props | Add K8s Discovery Props | Update Feign URLs | Tag Update |
|---------|:-:|:-:|:-:|:-:|:-:|:-:|
| Accounts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cards | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Loans | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Config Server | — | — | — | — | — | ✅ |
| Message | — | — | — | — | — | ✅ |

---

## ✅ Key Takeaways

- Replace `spring-cloud-starter-netflix-eureka-client` with `spring-cloud-starter-kubernetes-discovery-client`
- Add `@EnableDiscoveryClient` to the main class of services that need discovery
- Remove all Eureka-related properties from `application.yml`
- Add `spring.cloud.kubernetes.discovery.all-namespaces: true`
- Feign Clients need explicit URLs with the Kubernetes service name and port (e.g., `http://loans:8090`)
- These service-name URLs only work **inside** a Kubernetes cluster

## ⚠️ Common Mistake

Forgetting to add the `url` parameter to `@FeignClient`. Without Eureka, the Feign Client has no way to resolve service names on its own — you must provide the URL explicitly.
