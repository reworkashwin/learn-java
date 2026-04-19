# Refresh Configurations at Runtime Using Spring Cloud Bus

## Introduction

The actuator `/refresh` endpoint works, but invoking it on every single microservice instance is painful and unscalable. What if you could invoke refresh **once** on **any** instance, and have the change propagate to **all** instances automatically? That's exactly what **Spring Cloud Bus** does.

---

## The Core Idea

Spring Cloud Bus links all nodes in a distributed system with a **lightweight message broker** (like RabbitMQ or Kafka). When you invoke `/actuator/busrefresh` on any one instance, the message broker broadcasts the refresh event to **every** connected instance.

Instead of 500 individual refresh calls, you make **one** call. The message broker handles the rest.

> In microservices, the more responsibilities you take on, the more power you get. Setting up a message broker is extra work — but the payoff is enormous.

---

## Setting Up Spring Cloud Bus

### Step 1: Start RabbitMQ

The easiest way is via Docker:

```bash
docker run -it --rm --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3.13-management
```

Two ports are exposed:
- **5672** — core messaging functionality
- **15672** — management UI (accessible at `http://localhost:15672`)

### Step 2: Add the Bus Dependency

Add this to the `pom.xml` of **all** microservices **and** the config server:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

This single dependency sets up both Spring Cloud Bus and the RabbitMQ integration.

### Step 3: Expose the Bus Refresh Endpoint

Ensure all microservices have:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

This exposes `/actuator/busrefresh` (among others).

### Step 4: Configure RabbitMQ Connection

In each microservice's `application.yml`:

```yaml
spring:
  rabbitmq:
    host: "localhost"
    port: 5672
    username: "guest"
    password: "guest"
```

These are the default values. If using defaults, this step is technically optional — Spring Boot auto-detects them. But being explicit is good practice, especially when production uses different credentials.

---

## How Bus Refresh Works

Here's the magic flow:

1. **Push** new config values to the GitHub repo
2. **Invoke** `POST /actuator/busrefresh` on **any one** microservice instance (e.g., accounts on port 8080)
3. That instance sends a **config change event** to the RabbitMQ message broker
4. RabbitMQ **broadcasts** the event to all subscribed microservice instances
5. Each instance connects to the config server, **reloads** the changed properties
6. All instances are updated — **without restart, without individual refresh calls**

### The Demo

Before bus refresh — all microservices show "production APIs" in their message.

Change "production" back to "prod" in GitHub for all three services.

Invoke `POST /actuator/busrefresh` on **accounts only** (port 8080).

Now check:
- **Accounts**: `contact-info` → "prod APIs" ✅
- **Cards**: `contact-info` → "prod APIs" ✅ (no refresh call made to cards!)
- **Loans**: `contact-info` → "prod APIs" ✅ (no refresh call made to loans!)

All three updated from a single bus refresh call on accounts. That's the power of Spring Cloud Bus.

---

## The Architecture

```
GitHub Repo → [Push config change]
                    ↓
         POST /actuator/busrefresh (any instance)
                    ↓
         Config Server → triggers config change event
                    ↓
              RabbitMQ (message broker)
              ↙       ↓          ↘
         Accounts   Loans      Cards
         (reload)   (reload)   (reload)
```

All microservices register as clients with RabbitMQ. When the refresh event arrives, they each independently fetch their latest config from the config server.

---

## The Remaining Drawback

Bus refresh is a huge improvement — one call instead of hundreds. But **someone still has to make that one call**. It's still a manual step (or requires a CI/CD job).

What if even that single call could be automated? That's where **Spring Cloud Config Monitor + GitHub Webhooks** comes in (next lecture).

---

## ✅ Key Takeaways

- Spring Cloud Bus connects all microservices via a message broker (RabbitMQ)
- One `POST /actuator/busrefresh` call on **any** instance refreshes **all** instances
- Add `spring-cloud-starter-bus-amqp` to all microservices **and** the config server
- You take on extra responsibility (running RabbitMQ), but gain much more power
- There's still one manual step — invoking bus refresh at least once

---

## 💡 Pro Tip

If property changes are rare in your project (e.g., monthly), bus refresh with a manual call is perfectly fine. But if you change configs frequently, look into **automating the trigger** with webhooks.
