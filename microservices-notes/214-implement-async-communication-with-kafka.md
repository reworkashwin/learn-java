# Implementing Async Communication with Apache Kafka

## Introduction

Here's where the magic of Spring Cloud Stream truly shines. We're switching from RabbitMQ to Apache Kafka — and the number of code changes is almost embarrassingly small. This section proves that the abstraction layer we've been building on wasn't just theoretical.

---

## The Changes — That's It?

### Step 1: Swap the Maven Dependency

In **both** `accounts` and `message` microservice `pom.xml` files, replace:

```xml
<!-- BEFORE: RabbitMQ -->
<artifactId>spring-cloud-stream-binder-rabbit</artifactId>

<!-- AFTER: Kafka -->
<artifactId>spring-cloud-stream-binder-kafka</artifactId>
```

One word changed. `rabbit` → `kafka`.

### Step 2: Update Connection Properties

In **both** `application.yml` files, remove:

```yaml
# DELETE THIS
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    connection-timeout: 10s
```

Replace with:

```yaml
# ADD THIS
spring:
  cloud:
    stream:
      kafka:
        binder:
          brokers:
            - localhost:9092
```

If you have multiple Kafka brokers in a cluster, list them all under `brokers`.

### What Stays the Same?

Everything else:
- ✅ All function code (`email()`, `sms()`, `updateCommunication()`)
- ✅ Stream binding definitions (`send-communication`, `communication-sent`)
- ✅ DTOs, service classes, `StreamBridge` usage
- ✅ Function composition with `email|sms`

**Zero business logic changes.** This is the Spring Cloud Stream promise delivered.

---

## Verifying with Kafkalytic

IntelliJ has a plugin called **Kafkalytic** that lets you inspect your Kafka cluster. After connecting to `localhost:9092`:

- **Brokers**: 1 broker (local development)
- **Consumer Groups**: 2 groups — accounts and message services
- **Topics**:
  - `send-communication` — accounts → message flow
  - `communication-sent` — message → accounts flow
  - `__consumer_offsets` — internal Kafka topic for offset tracking

Spring Cloud Stream automatically created the topics based on the `destination` values in your `application.yml`. No manual topic creation needed.

---

## Testing the Flow

### Start all services:
1. Config Server → Eureka Server → Accounts → Message → Gateway → Keycloak

### Create an account:
- Get an access token from Keycloak
- POST to the create account endpoint

### Verify:
1. **Breakpoint in message service** — hit after account creation
2. **H2 console** — `communication_switch` is `null`
3. **Release breakpoint** — logs show email + SMS sent
4. **H2 console again** — `communication_switch` is now `true`

The entire two-way async flow works identically to RabbitMQ — different broker, same behavior.

---

## The Power Demonstrated

Think about what just happened:

| What Changed | Effort |
|-------------|--------|
| Maven dependency | 1 word (`rabbit` → `kafka`) |
| Connection properties | 5 lines (remove rabbit, add kafka broker) |
| Business logic | Nothing |
| Function code | Nothing |
| Stream bindings | Nothing |
| DTOs | Nothing |

If you weren't using Spring Cloud Stream, switching from RabbitMQ to Kafka would mean:
- Deleting all RabbitMQ-specific classes and interfaces
- Learning Kafka's producer/consumer APIs
- Rewriting all messaging code
- Reconfiguring serialization, acknowledgments, error handling
- Testing everything from scratch

That's weeks of work reduced to a 5-minute config change.

---

## ✅ Key Takeaways

- Switching from RabbitMQ to Kafka requires changing exactly **one dependency** and **connection properties**
- Spring Cloud Stream auto-creates Kafka topics from your binding `destination` values
- Kafka connection is configured under `spring.cloud.stream.kafka.binder.brokers`
- The `__consumer_offsets` topic is Kafka's internal mechanism for tracking consumer progress
- Spring Cloud Stream + Spring Cloud Functions = broker-agnostic microservices

## 💡 Pro Tip

Always build event-driven microservices with Spring Cloud Functions + Spring Cloud Stream. The abstraction isn't just nice-to-have — it's a strategic advantage. When your organization decides to switch brokers (and they will), you'll be ready in minutes, not months.
