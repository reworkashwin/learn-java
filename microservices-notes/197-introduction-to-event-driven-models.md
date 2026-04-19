# Introduction to Event-Driven Models

## Introduction

You've decided to go event-driven. Great. But "event-driven" isn't a single thing — there are two fundamentally different models to choose from. Each has different characteristics around message retention, replay capability, and use cases. Picking the wrong one can lead to architectural headaches down the road.

---

## Model 1: Publisher/Subscriber (Pub/Sub)

### 🧠 What is it?

Producers generate events that are distributed to all **subscribed** consumers. Think of it like a radio broadcast — if you're tuned in, you hear the message. If you're not listening when it airs, it's gone.

### Key Characteristics

- Producers publish events
- Consumers subscribe to receive events
- Once consumed, events **cannot be replayed**
- New subscribers joining later **do not** receive past events
- Events are transient — consumed and then gone

### When to Use It

- When you only care about events as they happen
- When past events are irrelevant to new consumers
- Real-time notifications, alerts, and triggers
- Simple decoupling scenarios

### Primary Technology: **RabbitMQ**

---

## Model 2: Event Streaming

### 🧠 What is it?

Events are written into a **log** in sequential order. Think of it like a DVR recording — even if you weren't watching live, you can rewind and watch from any point.

### Key Characteristics

- Events are stored in an **ordered, persistent log**
- Consumers can read from **any point** in the stream
- Events can be **replayed** — consumers can re-process historical events
- New consumers can join and read **all past events**
- Events persist (based on retention policy)

### When to Use It

- When new consumers need access to historical events
- When events need to be replayed (e.g., rebuilding state after a crash)
- When event ordering matters critically
- High-throughput data pipelines and stream processing

### Primary Technology: **Apache Kafka**

---

## Side-by-Side Comparison

| Feature | Pub/Sub (RabbitMQ) | Event Streaming (Kafka) |
|---------|-------------------|------------------------|
| Event replay | ❌ Not possible (traditional) | ✅ Full replay |
| New subscribers get past events | ❌ No | ✅ Yes |
| Storage model | Transient (consumed = deleted) | Persistent log |
| Ordering guarantees | Per-queue ordering | Per-partition ordering |
| Typical throughput | Moderate | Very high |
| Best for | Task distribution, notifications | Data pipelines, event sourcing |

### A Side Note on RabbitMQ

Recent versions of RabbitMQ have added event streaming capabilities. But by the time those features were implemented, Kafka had already captured the majority of the event streaming market. Most organizations still choose RabbitMQ for pub/sub and Kafka for streaming.

---

## How to Choose

Ask yourself one question: **Do consumers need to replay past events?**

- **No** → Pub/Sub with RabbitMQ
- **Yes** → Event Streaming with Apache Kafka

Neither model is inherently better. They solve different problems.

---

## Course Roadmap

| Section | Model | Technology |
|---------|-------|-----------|
| Current section | Pub/Sub | RabbitMQ |
| Next section | Event Streaming | Apache Kafka |

Both will be covered in full — starting with RabbitMQ and the pub/sub model.

---

## ✅ Key Takeaways

- Two event-driven models: Pub/Sub (transient events) and Event Streaming (persistent, replayable events)
- RabbitMQ is the go-to for Pub/Sub; Kafka dominates event streaming
- Choose based on whether consumers need historical event access
- RabbitMQ now has streaming capabilities, but Kafka owns that market
- Both models produce asynchronous, decoupled communication between services
