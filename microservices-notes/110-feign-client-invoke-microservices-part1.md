# OpenFeign Client: Invoking Other Microservices (Part 1)

## Introduction

We've built the service registry and registered all our microservices. But registration alone doesn't solve the problem — we need microservices to actually **discover and call** each other. Enter **OpenFeign Client**: a declarative way to invoke REST APIs of other microservices, powered by Eureka for service discovery and Spring Cloud Load Balancer for load balancing.

---

## The Use Case

We're building a new REST API in the **Accounts** microservice that returns a **consolidated customer view** — account details, loan details, and card details — all based on a single mobile number.

This means Accounts needs to:
1. Fetch its own account data (it has this)
2. Call the **Loans** microservice for loan data (internal communication)
3. Call the **Cards** microservice for card data (internal communication)

This is a perfect scenario for service discovery and inter-service communication.

---

## What is OpenFeign?

### ❓ How is it different from RestTemplate or WebClient?

With `RestTemplate`, you write **imperative code** — construct the URL, set headers, handle exceptions, parse the response. Lots of boilerplate.

With **OpenFeign**, you write **declarative code** — just define an interface with method signatures, and the framework generates the implementation at runtime.

### 🧠 The Spring Data JPA Analogy

Remember how Spring Data JPA works? You create an interface like:

```java
public interface AccountsRepository extends JpaRepository<Accounts, Long> {
    Optional<Accounts> findByCustomerId(Long customerId);
}
```

No implementation class. The framework generates the query logic at runtime based on the method name.

**OpenFeign works the same way.** You declare *what* you want to call, and Feign generates *how* to call it.

---

## Setting Up OpenFeign

### Step 1: Add the Dependency

In the Accounts microservice's `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

### Step 2: Enable Feign Clients

Add `@EnableFeignClients` to the main application class:

```java
@SpringBootApplication
@EnableFeignClients
public class AccountsApplication {
    public static void main(String[] args) {
        SpringApplication.run(AccountsApplication.class, args);
    }
}
```

---

## Creating Feign Client Interfaces

### The Cards Feign Client

Create a new package `com.eazybytes.accounts.service.client` and add:

```java
@FeignClient("cards")
public interface CardsFeignClient {

    @GetMapping(value = "/api/fetch", consumes = "application/json")
    CardsDto fetchCardDetails(@RequestParam String mobileNumber);
}
```

### Breaking It Down

**`@FeignClient("cards")`** — The value `"cards"` is the **logical service name** that Cards microservice uses to register with Eureka. At runtime, Feign:
1. Connects to the Eureka Server
2. Looks up all instances registered as `"cards"`
3. Caches the details
4. Uses client-side load balancing to pick an instance

**`@GetMapping("/api/fetch")`** — The exact REST API path from the Cards controller. It must match the actual endpoint.

**Method signature** — The return type (`CardsDto`) and parameters (`mobileNumber`) must match the target API's method signature.

### ❓ Why does the path include `/api`?

Because the Cards controller has a class-level `@RequestMapping("/api")` prefix. The Feign client must use the **complete path** — both the class-level and method-level mappings combined.

### The Loans Feign Client

```java
@FeignClient("loans")
public interface LoansFeignClient {

    @GetMapping(value = "/api/fetch", consumes = "application/json")
    LoansDto fetchLoanDetails(@RequestParam String mobileNumber);
}
```

Same pattern, different service name and DTO type.

---

## Copying Required DTOs

Since Accounts doesn't have `CardsDto` or `LoansDto`, copy them from the respective microservices into the Accounts microservice's `dto` package.

This is necessary because the Feign client needs to know the response structure to deserialize it.

---

## The Key Rules for Feign Clients

1. **`@FeignClient` value** must match the Eureka registration name of the target service
2. **HTTP method annotation** (`@GetMapping`, `@PostMapping`, etc.) must match the target API
3. **Path** must include the full path (class-level + method-level mappings)
4. **Method parameters** must match the target API's request parameters
5. **Return type** must match the target API's response structure
6. **No implementation code** — just the interface and abstract methods

---

## What Happens Behind the Scenes

When `CardsFeignClient.fetchCardDetails("1234567890")` is called:

1. Feign checks its **local cache** for Cards service instances
2. If cache is empty or stale → queries **Eureka** for `"cards"` instances
3. Applies **load balancing** (round robin by default) to select an instance
4. Constructs the HTTP request: `GET http://<selected-ip>:<port>/api/fetch?mobileNumber=1234567890`
5. Sends the request and deserializes the response into `CardsDto`

All of this from a single interface method. No RestTemplate. No URL construction. No manual error handling boilerplate.

---

## ✅ Key Takeaways

- **OpenFeign** provides a declarative approach to inter-service HTTP calls — interfaces only, no implementation
- The `@FeignClient("serviceName")` value must match the **Eureka registration name**
- Method signatures in Feign interfaces must mirror the target service's controller methods
- Feign automatically integrates with Eureka for service discovery and Spring Cloud Load Balancer for load balancing
- `@EnableFeignClients` on the main class activates Feign functionality
- Copy required DTOs from target services into the calling service

## ⚠️ Common Mistakes

- Using the wrong service name in `@FeignClient` — it must exactly match `spring.application.name` from the target service
- Forgetting the class-level path prefix (e.g., `/api`) in the Feign method's mapping
- Not copying the required DTO classes into the calling microservice

## 💡 Pro Tip

Think of Feign clients like Spring Data JPA repositories — you declare the *what*, the framework handles the *how*. This mental model makes Feign much easier to understand and use correctly.
