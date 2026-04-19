# Installing Apache Kafka

## Introduction

Before we can integrate Kafka with our microservices, we need a running Kafka instance. The easiest way? Docker — just like we did with RabbitMQ.

---

## Starting Kafka with Docker

Head to [kafka.apache.org](https://kafka.apache.org), click **Get Started** → **Quickstart**, and find the Docker command.

> ⚠️ Make sure you copy the command under the **JVM-based** section, NOT the GraalVM section.

Run the Docker command:

```bash
docker run -d --name kafka-broker \
  -p 9092:9092 \
  apache/kafka:latest
```

Kafka starts at port **9092** by default. You'll see logs indicating:

```
Kafka Server started, waiting for connections at port 9092
```

This single command gives you a Kafka broker ready for development. In production, you'd have a multi-broker cluster, but for local development, one broker is sufficient.

### Prerequisites

- Docker must be running on your machine
- Port 9092 should be available

---

## What's Next?

With Kafka running locally, we can now:
1. Update our microservices to use Kafka instead of RabbitMQ
2. Test the async communication locally
3. Update Docker Compose for containerized deployment

The best part? The code changes are minimal because we're using Spring Cloud Stream.

---

## ✅ Key Takeaways

- Kafka runs easily as a Docker container on port 9092
- Use the **JVM-based** Docker command from the official Kafka quickstart
- A single broker is fine for development; production needs at least 3
- Configure this endpoint (`localhost:9092`) in your microservices
