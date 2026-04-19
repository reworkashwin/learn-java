# Kafka Event Streaming with Docker Compose

## Introduction

We've tested Kafka locally. Now let's containerize the entire setup — including Kafka — and run everything through Docker Compose. The Docker Compose changes follow a similar pattern to what we did with RabbitMQ, but Kafka's configuration is more involved.

---

## Kafka Docker Compose Configuration

Unlike RabbitMQ which has a simple Docker setup, Kafka requires more environment variables. The reference configuration comes from [developer.confluent.io](https://developer.confluent.io) — Confluent is the company behind Kafka's commercial offerings and their guides are reliable.

### The Kafka Service

```yaml
kafka:
  image: apache/kafka:latest
  hostname: kafka
  container_name: kafka
  ports:
    - "9092:9092"
  environment:
    KAFKA_NODE_ID: 1
    KAFKA_PROCESS_ROLES: broker,controller
    KAFKA_LISTENERS: PLAINTEXT://kafka:29092,CONTROLLER://kafka:29093,PLAINTEXT_HOST://0.0.0.0:9092
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://kafka:9092
    KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
    KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:29093
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
    KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
    KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
    CLUSTER_ID: "MkU3OEVBNTcwNTJENDM2Qk"
  healthcheck:
    test: ["CMD", "nc", "-z", "kafka", "9092"]
    interval: 10s
    timeout: 5s
    retries: 10
  networks:
    - eazybank
```

### Key points about this configuration:

**Service naming**: Use `kafka` as the service name, hostname, and container name. Wherever the original template says `broker` (as hostname), replace with `kafka` — **except** for `KAFKA_PROCESS_ROLES: broker,controller`. That's a Kafka process role, not a hostname.

**Health check**: Uses `nc` (netcat) to verify Kafka is accepting connections on port 9092.

**Listeners**: The `PLAINTEXT_HOST://0.0.0.0:9092` allows external connections (from other containers), while `PLAINTEXT://kafka:29092` is for internal Kafka communication.

---

## Updating Dependent Services

### Accounts Service

```yaml
accounts:
  depends_on:
    kafka:
      condition: service_healthy
  environment:
    SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS: kafka:9092
```

### Message Service

```yaml
message:
  depends_on:
    kafka:
      condition: service_healthy
  environment:
    SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS: kafka:9092
```

The environment variable `SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS` overrides the `spring.cloud.stream.kafka.binder.brokers` property — replacing `localhost:9092` with `kafka:9092` (the Docker service name).

---

## Running the Full Stack

### Before starting:

1. Stop all local running services (IntelliJ)
2. Stop the local Kafka Docker container
3. Stop any running Keycloak container

### Start everything:

```bash
docker compose up -d
```

This starts all containers: Kafka, Config Server, Eureka, Accounts, Message, Gateway, Keycloak, Cards, Loans.

### Set up Keycloak:

Fresh container → create client, roles, and assign roles (same process as before).

### Test the flow:

1. Get access token
2. Create an account
3. Check **message service** container logs: email + SMS sent
4. Check **accounts service** container logs: communication request triggered + status updated

---

## Verifying in Container Logs

Since H2 console isn't exposed outside the Docker network, validate through logs:

**Message service:**
```
Sending email with the details: AccountsMessageDto[...]
Sending sms with the details: AccountsMessageDto[...]
```

**Accounts service:**
```
Is the communication request successfully triggered? : true
Updating communication status for account number: ...
```

---

## Summary: RabbitMQ → Kafka Migration

The complete migration from RabbitMQ to Kafka involved:

| Change | Details |
|--------|---------|
| Maven dependency | `binder-rabbit` → `binder-kafka` |
| Application properties | RabbitMQ connection → Kafka broker endpoint |
| Docker Compose | RabbitMQ service → Kafka service |
| Docker Compose env vars | `SPRING_RABBITMQ_HOST` → `SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS` |
| **Business logic** | **ZERO changes** |

All code is in the GitHub repo under `section_14`.

---

## ✅ Key Takeaways

- Kafka's Docker Compose config is more complex than RabbitMQ's — many environment variables needed
- Use the Confluent developer guides as a reference for Kafka Docker setup
- Service name `kafka` must be consistent across hostname, container name, and listener configurations
- Override broker connection with `SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS` environment variable
- The complete RabbitMQ-to-Kafka migration required zero business logic changes — only infrastructure configuration
- Spring Cloud Functions + Spring Cloud Stream = true broker-agnostic microservices

## 💡 Pro Tip

Keep your Docker Compose files versioned per section. When you need to test against RabbitMQ vs Kafka, you can switch between compose files instantly. This is also useful for demonstrating broker portability in technical discussions or interviews.
