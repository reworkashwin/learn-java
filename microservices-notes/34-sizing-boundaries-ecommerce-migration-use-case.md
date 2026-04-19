# Sizing & Identifying Boundaries — E-Commerce Migration Use Case

## Introduction

In the previous lecture, we looked at sizing for a greenfield bank app. Now let's tackle something harder: **migrating an existing monolithic e-commerce application to microservices**.

This is the scenario most real-world teams face — you rarely build microservices from scratch. More often, you're decomposing a growing, painful monolith.

---

## The Starting Point: A Monolithic E-Commerce App

Picture an e-commerce startup in its early days:

```
[Mobile App] → [Monolithic Server] → [Single Database]
[Website (MVC)] → [Monolithic Server] → [Single Database]
```

Inside the monolithic server, everything lives together:
- **Identity** — authentication & authorization
- **Catalog** — product search
- **Orders** — order management
- **Invoices** — billing
- **Sales** — sales operations
- **Marketing** — promotions, campaigns

One server. One database. One deployment.

### Why this worked initially

- Small team
- Low traffic
- Easy to build, test, deploy, and troubleshoot
- Everyone understands the whole codebase

---

## The Growing Pains

Years pass. The startup becomes the next Amazon. Now the problems start:

### 1. Complexity Explosion
No single person understands the entire application anymore. Years of features, patches, and workarounds have created a tangled web.

### 2. Fear of Change
Tight coupling means any change can break something unexpected. Even small changes require months of development + regression testing + performance testing.

### 3. Deployment Nightmares
Changed one line in the Invoice module? **Redeploy the entire application.** A bug in Marketing can crash the entire system — including Orders and Payments.

### 4. Technology Lock-in
Stuck on the original tech stack. Want to use a modern framework for the Catalog module? Too bad — everything is intertwined.

### 5. No Team Autonomy
Can't have independent Scrum teams working on different features because everything is coupled. Agile delivery becomes impossible at scale.

---

## The Migration: Monolith → Microservices

The team gets budget and 6 months to migrate. Here's what they build:

### New Architecture

```
[Mobile App]  ──→ [API Gateway] ──→ [Identity Service]
[React/Angular] ──→ [API Gateway] ──→ [Catalog Service]  → RDBMS
                                  ──→ [Orders Service]   → NoSQL
                                  ──→ [Invoice Service]  → NoSQL
                                  ──→ [Sales Service]    → Redis
                                  ──→ [Marketing Service]→ Redis
```

Key architectural decisions:

### Unified Client Communication
Both mobile and web clients communicate via **REST APIs** through an **API Gateway**. No more separate MVC path for the website — everything goes through the same API layer.

### Each Service Owns Its Data
This is a critical microservice principle — **database per service**:
- **Orders & Invoices** → NoSQL (large volumes of data)
- **Catalog** → RDBMS (structured product data, not massive scale)
- **Sales & Marketing** → Redis cache (fast reads, real-time data)

Each team picks the database that best fits their use case.

### Event Streaming with Kafka/RabbitMQ
Asynchronous communication for things like:
- Authentication triggers → send OTP via SMS
- Order confirmed → send confirmation email
- Payment received → update invoice

These don't need to be synchronous — event streaming decouples them beautifully.

### Containerized Deployment
All microservices (including API Gateway) are deployed as **Docker containers** inside a **Kubernetes cluster**. This handles:
- Automated scaling
- Health checks and self-healing
- Rolling deployments

---

## Benefits After Migration

| Before (Monolith) | After (Microservices) |
|---|---|
| One team, one deployment | Independent Scrum teams per service |
| Single tech stack | Each service picks its own stack |
| Single database | Database per service |
| Full redeploy for any change | Deploy only the changed service |
| One bug crashes everything | Failures are isolated |
| Scaling means duplicating everything | Scale individual services based on demand |

---

## The Sizing Lesson

Even in migration scenarios, the same principle applies:

- If the e-commerce team had identified **too many** microservices (e.g., separating "domestic orders" and "international orders" when the logic is 95% the same), the operational overhead would eat away the benefits.
- If they'd kept too few (e.g., Orders + Invoices + Sales in one service), they'd have the same coupling problems they were trying to escape.

The right sizing came from analyzing:
1. What are the distinct business domains?
2. Where are the natural boundaries?
3. Do the teams and data naturally separate along these lines?

---

## ✅ Key Takeaways

- Most real-world microservice adoption is **migration from monolith**, not greenfield
- Monoliths break down under scale: complexity, deployment friction, technology lock-in, team coupling
- Migration involves: cleaner API design (REST), database-per-service, event streaming, containerization
- Right-sizing during migration is just as critical — don't over-split or under-split
- The new architecture enables **independent teams**, **independent scaling**, and **technology freedom**

💡 **Pro Tip**: When discussing microservice migration in interviews, mention the full picture — API Gateway, database-per-service, event streaming, and containerized deployment. It shows you understand the ecosystem, not just the code.
