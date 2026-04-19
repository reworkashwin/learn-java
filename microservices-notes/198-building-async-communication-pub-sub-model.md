# Building Asynchronous Communication with the Pub/Sub Model

## Introduction

Theory is great, but let's get concrete. What exactly are we going to build? In this section, we design an asynchronous communication flow between the accounts microservice and a brand new message microservice — using RabbitMQ as the event broker.

---

## The Scenario: Account Creation + Communication

### The Current State

When someone creates an account, the accounts microservice:
1. Creates the account in the database
2. Returns a success response

That's it. No notification to the customer. No email. No SMS.

### The Problem

The accounts microservice shouldn't handle sending emails and SMS. That's a completely different concern. Mixing it in would violate the single responsibility principle and create unnecessary coupling. What if the email service is slow? The customer waits for their account creation response while an email sends in the background?

### The Solution: A Dedicated Message Microservice

Separate the communication logic into its own microservice. The accounts microservice focuses on account operations; the message microservice focuses on notifications.

---

## The Complete Async Flow

### Forward Flow: Account Created → Send Notification

```
Step 1: Client sends POST /accounts/api/create
Step 2: Accounts microservice creates the account in the database
Step 3: Accounts microservice responds "201 Created" to the client
        AND publishes an event to the event broker (RabbitMQ)
Step 4: RabbitMQ places the event in a queue
Step 5: Message microservice reads the event from the queue
Step 6: Message microservice sends SMS/email to the customer
```

The key insight: **Step 3 doesn't wait for Step 6.** The customer gets their "account created" response immediately. The SMS/email arrives later — maybe 1-2 minutes later. That's perfectly fine for notifications.

### Reverse Flow: Communication Sent → Update Database

```
Step 7: Message microservice publishes a confirmation event to RabbitMQ
Step 8: RabbitMQ places the confirmation in a queue
Step 9: Accounts microservice reads the confirmation
Step 10: Accounts microservice updates the database:
         "Communication sent to customer ✅"
```

This reverse flow closes the loop — accounts can track which customers were notified.

---

## Why This Design Works

### Complete Decoupling

The accounts microservice and message microservice **never talk to each other directly**. They don't even know each other exists. They only know about the event broker.

| What accounts knows | What message knows |
|---------------------|-------------------|
| "I push events to RabbitMQ" | "I read events from RabbitMQ" |
| "I read confirmations from RabbitMQ" | "I push confirmations to RabbitMQ" |

### Fault Tolerance

If the message microservice goes down:
- Account creation still works perfectly
- Events pile up in the RabbitMQ queue
- When message comes back up, it processes the backlog

No impact on the accounts microservice at all.

### Independent Scaling

If email volume spikes, scale the message microservice independently. The accounts microservice doesn't need to change.

---

## The Event Broker: The Middleman

RabbitMQ sits between the services as the **event broker** (or message broker). It:
- Receives events from producers
- Stores them in queues
- Delivers them to subscribed consumers
- Guarantees delivery even if the consumer is temporarily down

In the next section, we'll implement the same pattern with Apache Kafka instead of RabbitMQ, showing how the pub/sub model differs from the event streaming model.

---

## What We're Building

| Component | Responsibility |
|-----------|---------------|
| Accounts Microservice | Creates accounts, publishes "account created" events |
| Message Microservice (NEW) | Reads events, sends SMS/email, publishes confirmations |
| RabbitMQ | Routes events between services via queues |

---

## ✅ Key Takeaways

- Separate notification logic from business logic — don't mix email/SMS into your accounts microservice
- The pub/sub model allows true "fire and forget" — publish the event and move on
- Both directions are async: account → message AND message → account
- Services are completely decoupled — they only interact through the event broker
- If the message service goes down, events queue up and process when it recovers
- The synchronous part (steps 1-3) gives the user immediate feedback; the async part (steps 4-10) handles background work
