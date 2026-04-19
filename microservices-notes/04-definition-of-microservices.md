# Definition of Microservices

## Introduction

After understanding the evolution and comparisons of architectural styles, you need a **crisp, formal definition** of microservices — one you can confidently deliver to a technical or non-technical audience in seconds.

This definition comes from **James Lewis and Martin Fowler**, two of the most influential voices in software architecture.

---

## The Formal Definition

> **Microservices** is an approach to develop a single application as a **suite of small services**, each running in its **own process** and communicating with **lightweight mechanisms** (like REST APIs). These services are built around **business capabilities** and are **independently deployable** by fully automated deployment machinery.

Let's unpack this definition piece by piece:

---

### 🧠 "Suite of Small Services"

Your application is not one giant block — it's a **collection of small, focused services**. For EasyBank, that's separate services for Accounts, Loans, and Cards. Each service does one thing well.

### 🧠 "Each running in its own process"

Each microservice runs independently. If the Loans service crashes, Accounts and Cards keep working. They don't share the same process or runtime.

### 🧠 "Communicating with lightweight mechanisms"

No more heavy SOAP/XML protocols. Microservices talk to each other using **REST APIs** with **JSON** — lightweight, simple, and universal.

### 🧠 "Built around business capabilities"

Services aren't divided by technical layers (UI, backend, database). They're divided by **business domains** — Accounts, Loans, Cards. Each service maps to a real business capability.

### 🧠 "Independently deployable by fully automated deployment machinery"

This is the most powerful part. When a developer pushes code:
1. The build happens automatically
2. The same build deploys to dev, UAT, and production
3. No coordination needed with other teams
4. CI/CD pipelines handle everything

---

## Why This Definition Matters

When a **business user**, **client**, or **non-technical stakeholder** asks you "What are microservices?", you don't need to explain monolithic vs SOA vs microservices. You just use this definition — it's concise, complete, and universally understood.

---

## ✅ Key Takeaways

- The Lewis-Fowler definition is the industry-standard go-to definition
- Four pillars: small services, own process, lightweight communication, business-domain aligned
- **Independent deployability** is the cornerstone advantage
- Memorize this definition — you'll use it in interviews, client meetings, and technical discussions

---

## 💡 Pro Tips

- In interviews, start with this definition, then expand with examples from your experience
- When talking to non-technical people, emphasize the **business benefits**: faster deployments, independent teams, faster time-to-market
- When talking to technical people, emphasize **independent deployability** and **technology freedom**
