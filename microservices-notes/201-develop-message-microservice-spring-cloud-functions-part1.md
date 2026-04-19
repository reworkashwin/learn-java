# Developing a Message Microservice with Spring Cloud Functions — Part 1

## Introduction

So we've talked about *why* Spring Cloud Functions are great for event-driven microservices, but now it's time to actually build one. In this section, we're setting up the **message microservice** — the service responsible for sending communications (email, SMS) to customers whenever something happens in the accounts service.

Why a separate microservice just for messaging? Because sending emails and SMMs is a cross-cutting concern. You don't want your accounts service waiting around for an email to send before responding to the user. That's exactly the kind of work you hand off asynchronously.

Let's walk through the setup step by step.

---

## Generating the Project Skeleton

Head over to [start.spring.io](https://start.spring.io) and configure the project:

- **Project**: Maven
- **Language**: Java
- **Spring Boot**: Latest stable version
- **Group**: `com.easybytes`
- **Artifact/Name**: `message`
- **Packaging**: JAR
- **Java Version**: 17

For dependencies, search for **Function** and add it. What does this dependency do? The brief description says it all:

> *Promotes the implementation of business logic via functions and supports a uniform programming model across serverless providers, as well as the ability to run standalone.*

That "uniform programming model" is the key insight — you write your business logic as functions, and the **same code** can be deployed as a REST API, a serverless function on AWS Lambda, or wired up to an event broker like RabbitMQ or Kafka. No code changes needed.

When you explore the generated project, you'll see two core dependencies:
- `spring-boot-starter`
- `spring-cloud-function-context` — this is the critical one for Spring Cloud Functions

---

## Creating the DTO — Using Java Records

First, create a package `com.eazybytes.message.dto` and inside it, create a **record** class called `AccountsMessageDto`.

### Why a record instead of a class?

Java records are perfect for DTOs because:
- Fields are automatically `final` (immutable once created)
- Getters are auto-generated (but named after the field, not `getXyz()`)
- `toString()`, `equals()`, and `hashCode()` come for free

```java
/**
 * DTO to hold the account message details
 */
public record AccountsMessageDto(
    Long accountNumber,
    String name,
    String email,
    String mobileNumber
) {}
```

This DTO represents the data that flows from the accounts microservice → message broker → message microservice. To send an email, we need the `email` field. To send an SMS, we need `mobileNumber`. Simple.

---

## Creating the Functions Class

Create another package `com.eazybytes.message.functions` and in it a class called `MessageFunctions`:

```java
@Configuration
public class MessageFunctions {

    private static final Logger log = LoggerFactory.getLogger(MessageFunctions.class);

    // Functions will go here...
}
```

Why `@Configuration`? Because we're going to define our business logic as `@Bean` methods that return functional interfaces. Spring Cloud Functions picks up these beans and manages them.

---

## What's Next?

At this point, we have:
1. A generated Spring Boot project with the Spring Cloud Function dependency
2. A clean DTO using Java records to carry message data
3. A configuration class ready to hold our function beans

In the next part, we'll actually write the business logic — the email and SMS functions — using Java's `Function` and `Consumer` functional interfaces.

---

## ✅ Key Takeaways

- Spring Cloud Functions lets you write business logic as plain Java functions — no controllers, no endpoint mappings
- Java records are ideal for DTOs: immutable, concise, auto-generated getters
- The `spring-cloud-function-context` dependency is what enables function-based programming
- `@Configuration` + `@Bean` is how you register functions with Spring Cloud Functions
