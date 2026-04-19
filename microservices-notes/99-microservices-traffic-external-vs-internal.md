# Microservices Traffic: External vs Internal Communication

## Introduction

Before we dive into the next big challenge in microservices, we need to understand a fundamental concept: how does traffic flow in and out of a microservices network? This is the foundation for everything that follows — service discovery, load balancing, API gateways, and more.

---

## The Microservice Network

All your microservices — accounts, loans, cards — live inside a shared **microservices network**. Think of it as a walled city with one gate. Nobody gets in or out except through that gate.

### ❓ Why a single entry point?

If external clients could directly hit any microservice, you'd have a nightmare:
- No centralized security checks
- No consistent logging or auditing
- No way to enforce rate limits or authentication uniformly

That's why we build a **firewall** around our microservices and force all external traffic through a single entry point.

---

## The API Gateway

That single entry point is called the **API Gateway** (or simply "gateway"). It acts as the front door for all external requests from client applications (C1, C2, C3, etc.).

The gateway handles:
- Security validation
- Request routing
- Auditing and logging
- Rate limiting
- Other non-functional requirements

We'll build the API Gateway in a future section. For now, just know it exists and why it matters.

---

## Two Types of Traffic

### 1. External Traffic

Any request from an outside client (browser, mobile app, third-party service) that enters through the API Gateway. This is **external traffic** or **external communication**.

### 2. Internal Traffic

Once a request is inside the network, one microservice may need to talk to another. For example:
- An external request hits the Accounts microservice through the gateway
- Accounts needs loan data → calls Loans microservice
- Accounts needs card data → calls Cards microservice

This microservice-to-microservice communication is **internal traffic** or **internal communication**.

---

## What We'll Focus On

This section is all about **internal communication** — the challenges that arise when microservices need to discover and talk to each other inside the network. External traffic and the API Gateway come later.

The core questions we'll tackle:
- How does one microservice find another?
- What happens when instances scale up or down?
- How does load balancing work between multiple instances?

---

## ✅ Key Takeaways

- Microservices live inside a secured network with a **single entry point** (API Gateway)
- **External traffic** flows through the gateway; **internal traffic** flows directly between microservices
- The API Gateway handles cross-cutting concerns like security, logging, and rate limiting
- Internal communication introduces its own set of challenges — that's our focus next
