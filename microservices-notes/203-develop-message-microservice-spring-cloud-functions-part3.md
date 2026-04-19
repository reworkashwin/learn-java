# Developing a Message Microservice with Spring Cloud Functions — Part 3

## Introduction

"Why are we even writing functions instead of normal REST controllers?"

If that thought crossed your mind — this is the lecture that answers it. We're about to see the **real power** of Spring Cloud Functions: the same functions you wrote can instantly become REST APIs, Lambda functions, or event-driven processors — all with zero code changes.

---

## Instantly Exposing Functions as REST APIs

Here's the magic trick. Go to your `pom.xml` and add **one** dependency:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-function-web</artifactId>
</dependency>
```

That's it. Rebuild and start your application.

When you check the logs, you'll see something like:
```
FunctionalCatalog: email, sms
```

Spring Cloud Functions recognized your function beans and automatically exposed them as REST endpoints.

### Testing the Endpoints

**Email function** — `POST http://localhost:8080/email`
```json
{
    "accountNumber": 1234567890,
    "name": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "1234567890"
}
```

Hit send — the breakpoint stops inside your email function. The log prints. The response returns whatever the function returned (the same DTO object).

**SMS function** — `POST http://localhost:8080/sms`

Same body, same behavior — the SMS function logs the details and returns the account number.

Did you write a single `@RestController`? A single `@GetMapping`? **No.** The function name becomes the endpoint path automatically.

---

## Composing Functions as a Single Endpoint

Now for the next trick. What if a client wants to trigger **both** email and SMS with a single API call?

Add this to `application.yml`:

```yaml
server:
  port: 9010

spring:
  application:
    name: message
  cloud:
    function:
      definition: email|sms
```

The `|` (pipe) symbol **composes** the two functions. They execute sequentially as one logical unit.

### What endpoint does this create?

```
POST http://localhost:9010/emailsms
```

The composed function name is the concatenation of all function names — `email` + `sms` = `emailsms`. No spaces, no special characters.

When you call it:
1. The `email` function runs first — logs "Sending email...", returns the DTO
2. The DTO flows into `sms` — logs "Sending sms...", returns the account number
3. You get the account number in the response

Both individual endpoints (`/email` and `/sms`) still work independently.

---

## The Big Picture: Deployment Flexibility

This is why Spring Cloud Functions matters. The same business logic can be:

| Deployment Model | What You Change |
|-----------------|----------------|
| REST API | Add `spring-cloud-starter-function-web` dependency |
| RabbitMQ consumer | Add RabbitMQ binder dependency + properties |
| Kafka consumer | Add Kafka binder dependency + properties |
| AWS Lambda | Add AWS adapter dependency |
| Standalone app | Nothing — it just works |

**Zero changes to your business logic.** You only swap dependencies and configuration.

---

## Rolling Back for the Next Step

Since we don't actually want our functions exposed as REST APIs (we want them connected to a message broker), comment out the `spring-cloud-starter-function-web` dependency. Keep the `application.yml` properties — we'll need them when integrating with RabbitMQ via Spring Cloud Stream.

---

## ✅ Key Takeaways

- Adding `spring-cloud-starter-function-web` instantly exposes all functions as REST endpoints
- The function name becomes the API path — `email()` → `POST /email`
- The `|` pipe in function definition composes functions: `email|sms` → `POST /emailsms`
- Individual function endpoints remain available even after composition
- This is the core power: write once, deploy anywhere — REST, serverless, event-driven

## 💡 Pro Tip

If you're building event-driven microservices, **always** write your business logic with Spring Cloud Functions. Even if you're connecting to RabbitMQ today, tomorrow you might need a REST fallback or migrate to Kafka. The function-based approach gives you that flexibility without rewriting anything.
