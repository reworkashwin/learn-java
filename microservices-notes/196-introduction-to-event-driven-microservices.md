# Introduction to Event-Driven Microservices

## Introduction

You've built microservices that are loosely coupled — developed, deployed, and scaled independently. But there's a subtler form of coupling that's been lurking in your architecture all along: **temporal coupling**. Every time one microservice calls another and *waits* for a response, there's a hidden dependency. If the called service is slow, the caller is slow. If it's down, the caller might be stuck. Event-driven microservices break this chain.

---

## Loose Coupling vs. Temporal Coupling

### Loose Coupling — What You Already Have

You separated business logic into dedicated microservices: accounts, cards, loans. Each can be developed, deployed, and scaled independently. That's loose coupling. Well done.

### Temporal Coupling — The Hidden Problem

But consider this: when the accounts microservice calls the cards microservice via a REST API, it **blocks** until it gets a response. If cards takes 5 seconds, accounts waits 5 seconds. If cards is down, accounts might fail too.

This is temporal coupling — a caller expecting an **immediate** response from a called service before it can continue. The caller's performance is chained to the callee's performance.

### ❓ When does temporal coupling happen?

Whenever you use **synchronous communication** between services. And that's exactly what REST APIs do — request-response, block-wait-return.

---

## Synchronous Communication: Two Flavors, Same Problem

### Imperative Approach
A dedicated thread is assigned to the outgoing call. That thread is **blocked** — doing nothing — until the response arrives. This is the classic Spring MVC model.

### Reactive Approach
No thread is blocked. The calling thread fires the request and returns to the thread pool. When the response arrives, a thread picks it up. More efficient thread usage — but the business logic still can't proceed until the response comes back.

Both are synchronous. The difference is thread management, not the communication pattern. The microservice still **waits** for the other to respond.

---

## When Is Synchronous Communication Necessary?

For **critical, real-time interactions** where the end user needs an immediate answer:

- "What's my account balance?" → Synchronous (the user is staring at the screen)
- "Show me my transaction history" → Synchronous
- "Process my payment" → Synchronous (user needs confirmation)

These can't be asynchronous — the user is waiting.

---

## When Should You Go Asynchronous?

For everything else. Specifically, when:
- The caller doesn't need an immediate response
- The operation can happen "eventually"
- You want to decouple service availability

Examples:
- Sending a confirmation email after account creation
- Notifying the delivery microservice after an order is placed
- Logging audit events
- Triggering report generation

---

## What Is an Event?

An event is an **incident inside your system that signifies a state change**. When something noteworthy happens, you announce it — and the interested parties react.

### The Amazon Example

1. A customer places an order → **Event:** "Order confirmed"
2. The order microservice publishes this event
3. The delivery microservice receives the event and starts the shipping process
4. The order microservice doesn't wait for delivery to complete — its job is done

The order microservice doesn't even know *who* listens to its events. It just broadcasts. This is the essence of event-driven architecture.

---

## How to Build Event-Driven Microservices

The ingredients:
1. **Event-driven architecture** — the design pattern
2. **Asynchronous communication** — the communication style
3. **Event brokers** — the middleware (RabbitMQ, Apache Kafka)
4. **Spring Cloud Function** — write business logic as functions
5. **Spring Cloud Stream** — connect functions to event brokers

These tools from the Spring Cloud ecosystem make it remarkably straightforward to build event-driven microservices without getting lost in messaging infrastructure code.

---

## ✅ Key Takeaways

- **Loose coupling** separates business logic; **temporal coupling** chains runtime performance
- Synchronous communication creates temporal coupling — even with reactive approaches
- Use synchronous for real-time user-facing operations; asynchronous for everything else
- Events are state changes that notify interested parties without blocking the producer
- Event-driven microservices eliminate temporal coupling by using asynchronous communication through event brokers

💡 **Pro Tip:** When designing a new microservice interaction, ask: *"Does the caller actually need to wait for this response?"* If not, it's a candidate for asynchronous, event-driven communication.
