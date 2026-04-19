# Docker Network Concept: A Hands-On Demo

## Introduction

We've been attaching all our containers to the same Docker network — but do you really understand *why*? In this lecture, we break things on purpose. By deliberately removing the network configuration from database containers, we see exactly what happens when containers can't find each other. This is one of the most important Docker concepts to internalize.

---

## The Experiment: Detaching Databases from the Network

### Setup

All microservices extend a shared `network-deploy-service`, which attaches them to the `EazyBank` network. The database containers (`accountsdb`, `loansdb`, `cardsdb`) also extend this service — for now.

### What happens if we remove the network from databases?

In `common-config.yml`, the `microservice-db-config` extends `network-deploy-service`. If we remove that `extends` clause, the database containers will start in Docker's **default network** while the microservices stay in the `EazyBank` network.

Two different networks = **no communication**.

### The Result

After running `docker compose up -d`:
- Database containers: ✅ Started successfully
- Config server: ✅ Started successfully
- Accounts, Loans, Cards microservices: ❌ **Exited** — they cannot connect to their databases

The logs show connection failures — the microservices simply can't reach the databases because they're on different networks.

---

## Understanding Docker Networks

### ❓ How can we see the networks?

```bash
docker network ls
```

This shows all Docker networks. You'll see the `EazyBank` network (for QA profile) alongside a `qa_default` network — Docker Compose auto-creates a default network for containers that don't specify one.

### Inspecting Container Networks

```bash
docker inspect <container_id>
```

This reveals which network a container is attached to. The database containers show `qa_default` while microservices show `EazyBank` — two separate networks with no bridge between them.

### 🧠 The Key Insight

Docker provides **complete network isolation**. Containers on different networks cannot communicate, period. This is a feature, not a bug — it's how Docker ensures security and isolation. You must **explicitly** place containers on the same network for communication to work.

Think of it like separate buildings with no connecting hallways. You can shout all you want, but no one in the other building will hear you.

---

## Fixing It

Restore the `extends: network-deploy-service` under `microservice-db-config` in `common-config.yml`. Now all containers — databases and microservices — join the same `EazyBank` network and can communicate freely.

---

## A Practical Decision: H2 vs MySQL Going Forward

Here's a surprise: from the next section onward, the course switches back to H2 (in-memory) databases. Why?

As you add more components — Eureka server, API gateway, Grafana, monitoring tools — the number of running containers grows fast. With MySQL, you already have 7 containers. Add Eureka, Gateway, and monitoring and you're at 10-12 containers, which can **slow down laptops** significantly (especially with 8GB RAM).

Using H2 eliminates three database containers and reduces resource pressure. If you have a high-end machine, feel free to continue with MySQL — the concepts remain identical.

---

## ✅ Key Takeaways

- Containers on **different Docker networks cannot communicate** — this is by design
- Docker Compose creates a `default` network for containers without an explicit network assignment
- Use `docker network ls` and `docker inspect` to debug networking issues
- Always attach related containers (microservices + their databases) to the **same network**
- Clean up unnecessary environment variables (like RabbitMQ) when they're no longer needed

## ⚠️ Common Mistakes

- Assuming containers can talk to each other just because they're on the same host — they can't, unless they share a network
- Forgetting to extend network configuration for new services added to Docker Compose

## 💡 Pro Tip

When debugging Docker communication issues, `docker inspect` is your best friend. Check the `Networks` section to verify containers are on the expected network.
