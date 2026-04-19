# Fully Automated Config Refresh with Spring Cloud Bus & Config Monitor

## Introduction

We've eliminated the need to refresh every instance individually (thanks to Spring Cloud Bus). But someone still has to manually trigger the bus refresh. Can we automate even that last step? **Yes** — using GitHub Webhooks combined with **Spring Cloud Config Monitor**.

This is the **fully automated, zero-manual-intervention** approach to runtime configuration refresh.

---

## The Concept

GitHub supports **webhooks** — whenever you push a change to a repo, GitHub sends an HTTP POST request to a URL you specify. We configure this webhook to hit the Config Server's `/monitor` endpoint.

When the Config Server receives the webhook, it automatically triggers a refresh event via Spring Cloud Bus → RabbitMQ → all microservices.

**Result**: Push a config change to GitHub → every microservice picks it up automatically. No manual calls. No scripts. No CI/CD jobs.

---

## Setting It Up

### Step 1: Add Config Monitor Dependency

Add this to the **config server only** (not the other microservices):

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-monitor</artifactId>
</dependency>
```

This exposes a new `/monitor` REST endpoint on the config server (note: this is **not** an actuator endpoint — it's a Spring Cloud Config endpoint).

### Step 2: Enable Bus Refresh on Config Server

The config server also needs actuator endpoints enabled and RabbitMQ connection configured:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"

spring:
  rabbitmq:
    host: "localhost"
    port: 5672
    username: "guest"
    password: "guest"
```

### Step 3: Create a GitHub Webhook

In your GitHub config repository:

1. Go to **Settings → Webhooks → Add webhook**
2. **Payload URL**: Your config server's `/monitor` endpoint
3. **Content type**: `application/json`
4. **Events**: Select "Just the push event"

### The Localhost Challenge

In local development, GitHub can't reach `http://localhost:8071/monitor`. You need a tool like **Hookdeck** (hookdeck.com) to create a tunnel:

```bash
brew install hookdeck/hookdeck/hookdeck
hookdeck login
hookdeck listen 8071
# Path: /monitor
# Hostname: localhost
```

Hookdeck provides a public URL that forwards requests to your local config server. Use this URL as the webhook payload URL.

In production, you'd use the config server's actual public IP or domain name.

---

## The Complete Flow

```
Developer pushes config change to GitHub
         ↓
GitHub webhook fires → POST /monitor (Config Server)
         ↓
Config Server triggers refresh via Spring Cloud Bus
         ↓
RabbitMQ broadcasts to all microservice instances
         ↓
All instances reload from Config Server
         ↓
Properties updated everywhere — ZERO manual steps
```

---

## Seeing It in Action

Change `cards-prod.yml` in GitHub: message from "prod" to "webhook":
- Commit and push → GitHub webhook fires automatically
- Check terminal: the hookdeck tunnel shows a `200` response from the config server
- Hit `cards/contact-info` → "webhook APIs" appears immediately

Revert back to "prod":
- Commit and push → webhook fires again
- Hit `cards/contact-info` → "prod APIs" is back

No actuator calls. No manual intervention. Pure automation.

---

## Summary of All Approaches

| Approach | Manual Work | Scalability |
|----------|-------------|-------------|
| `/actuator/refresh` | Invoke on every instance | ❌ Poor |
| `/actuator/busrefresh` | Invoke on any one instance | ✅ Good |
| Config Monitor + Webhook | Zero manual work | ✅✅ Excellent |

Each approach builds on the previous one, requiring more infrastructure (RabbitMQ, webhooks) but giving more automation.

---

## ✅ Key Takeaways

- Add `spring-cloud-config-monitor` to the config server → exposes `/monitor` endpoint
- Create a GitHub webhook pointing to `/monitor` → triggers on every push
- Behind the scenes, `/monitor` uses Spring Cloud Bus to broadcast the change
- The result: **fully automated** config refresh with zero manual steps
- In production, use the config server's real URL; locally, use tunnel tools like Hookdeck

---

## 💡 Pro Tip

> "In microservices, the more responsibilities you take on, the more power you get." Running RabbitMQ and setting up webhooks is extra work — but you earn a fully automated, production-grade configuration management system.
