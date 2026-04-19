# Demo: Asynchronous Communication with RabbitMQ — Part 1

## Introduction

We've wired up the code. Now let's see it in action. This demo proves the core promise of event-driven microservices: **the producer doesn't wait for the consumer**. The accounts service fires off a message and immediately responds to the client, while the message service processes the communication in its own time.

---

## Setting Up RabbitMQ

Start RabbitMQ using Docker:

```bash
docker run -d --hostname my-rabbit --name some-rabbit \
  -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

The `-d` flag runs it in detached mode. Port `5672` is for messaging; port `15672` is for the management console.

Access the RabbitMQ console at `http://localhost:15672` with credentials `guest/guest`.

---

## What RabbitMQ Creates Automatically

Once your microservices start and connect, check the RabbitMQ console:

**Exchanges:**
- `send-communication` — created by the accounts service's output binding

**Queues:**
- `send-communication.message` — created by the message service's input binding (destination `.` group)

If you click on the `send-communication` exchange → Bindings, you'll see it routes messages to `send-communication.message`. This binding was established automatically by Spring Cloud Stream.

> You might also see an orphan exchange like `emailsms-out-0`. This is because Spring Cloud Stream auto-creates both input and output bindings for your function definition. Since we didn't configure a destination for the output binding yet, it sits empty. It's harmless.

---

## The Demo: Proving Async Behavior

### Start these services (in order):
1. Config Server
2. Eureka Server
3. Accounts Microservice
4. Message Microservice
5. Gateway Server
6. Keycloak (Docker container)

### Invoke the Create Account API

Use Postman to create an account via the gateway (secured with OAuth2 client credentials).

**Result**: You get an immediate `201 Created` response — in about **51 milliseconds**.

### But wait — what about the message service?

Put a breakpoint inside the `email` function in the message service. When you create the account:

1. ✅ Accounts service responds immediately to the client
2. 🔴 The breakpoint in message service is hit — but the client already has its response

This is the **essence of asynchronous communication**. The accounts service:
- Creates the customer and account records
- Pushes a message to RabbitMQ
- Returns `201` to the client
- Has **no idea** what happens next with the message

### Checking the logs

**Accounts service console:**
```
Sending communication request for the details: AccountsMessageDto[...]
Is the communication request successfully triggered? : true
```

**Message service console** (after releasing breakpoint):
```
Sending email with the details: AccountsMessageDto[...]
Sending sms with the details: AccountsMessageDto[...]
```

The accounts service logged its part instantly. The message service processed the communication at its own pace.

---

## Why This Matters

In a synchronous world, the accounts service would call the message service directly. If the message service is slow, overloaded, or down — the account creation fails or hangs.

With async communication:
- The accounts service is **decoupled** from the message service
- Neither service knows about the other — they only know about the broker
- If the message service goes down, messages queue up and get processed when it comes back
- Response times stay fast regardless of downstream processing time

---

## What's Missing?

Right now, communication is one-way: accounts → message service. But we also need the message service to tell accounts "I'm done — update the record." That's the two-way async flow we'll build next.

---

## ✅ Key Takeaways

- RabbitMQ runs easily as a Docker container with management console on port 15672
- Spring Cloud Stream automatically creates exchanges, queues, and bindings based on your configuration
- The producer (accounts) gets an immediate response — it doesn't wait for the consumer
- `StreamBridge.send()` returns `true` when the message is successfully pushed to the broker
- Asynchronous communication eliminates temporal coupling between microservices
