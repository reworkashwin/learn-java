# Eureka Self-Preservation Mode

## Introduction

Ever noticed a scary-looking warning on your Eureka dashboard saying something like *"EMERGENCY! Eureka may be incorrectly claiming instances are up when they are not"*? Before you panic — don't. This is actually a *feature*, not a bug. It's called **self-preservation mode**, and it's one of the smartest design decisions in Eureka Server.

Let's understand why it exists and how it protects your microservice network from catastrophic failures.

---

## The Problem: Network Glitches Cause False Alarms

### 🧠 How Eureka Normally Works

In a healthy microservice network, every registered instance sends a **heartbeat** to the Eureka Server every 30 seconds (by default). This heartbeat says: *"Hey, I'm still alive and healthy!"*

If Eureka doesn't receive a heartbeat from an instance within a certain time frame (default: 90 seconds), it assumes that instance has crashed or become unhealthy. So it **removes** that instance from the service registry — preventing other services from trying to route traffic to a dead instance.

Makes sense, right? But here's where things get interesting...

### ❓ What Happens During a Network Glitch?

Imagine a temporary network issue hits your microservice network for 5 minutes. Maybe the cloud provider has a brief outage, or there's an internet routing problem.

During those 5 minutes, **no instance** can send heartbeats to Eureka — not because they're dead, but because the network path is broken.

Without self-preservation, Eureka would say: *"Nobody is responding? They must all be dead!"* and proceed to **evict every single instance** from the registry. Now your registry is empty. And when the network comes back online 5 minutes later, any service trying to discover other services gets... nothing. Complete chaos.

---

## The Solution: Self-Preservation Mode

### 🧠 What Is It?

Self-preservation mode is Eureka's way of saying: *"Wait a minute — if MOST instances stopped sending heartbeats at the same time, this is probably a network issue, not a mass crash. Let me stay calm and keep the existing registry intact."*

### ⚙️ How It Works — Step by Step

Let's walk through a concrete example with 5 instances of a loans microservice:

**Phase 1: Everything is healthy**
- All 5 instances are sending heartbeats every 30 seconds
- Eureka's registry shows: Instance 1 ✅, Instance 2 ✅, Instance 3 ✅, Instance 4 ✅, Instance 5 ✅

**Phase 2: Network problem hits instances 4 and 5**
- Instances 4 and 5 stop sending heartbeats (not because they crashed, but because the network path is broken)
- Eureka waits 90 seconds (3 missed heartbeat intervals)
- After 90 seconds of silence, Eureka evicts instances 4 and 5
- Registry now: Instance 1 ✅, Instance 2 ✅, Instance 3 ✅

**Phase 3: Self-preservation activates**
- Eureka realizes that 15% or more of total instances have been evicted (the default threshold is 85%)
- It enters **self-preservation mode**
- From this point, even if Instance 3 stops sending heartbeats, **Eureka will NOT remove it**
- It assumes the issue is network-related, not instance-related

**Phase 4: Recovery**
- Once the network issue resolves and instances start sending heartbeats again, self-preservation mode deactivates
- The warning disappears from the dashboard

### 💡 The Analogy

Think of Eureka Server as a teacher taking attendance. If one student is absent, they mark them absent. But if suddenly *80% of the class* stops responding, a smart teacher doesn't assume everyone dropped out — they check if the microphone is broken first. That's self-preservation.

---

## Key Configuration Properties

| Property | Default | Purpose |
|----------|---------|---------|
| `eureka.instance.lease-renewal-interval-in-seconds` | `30` | How often instances send heartbeats |
| `eureka.instance.lease-expiration-duration-in-seconds` | `90` | How long Eureka waits before considering an instance dead |
| `eureka.server.eviction-interval-timer-in-milliseconds` | `60000` | How often the eviction scheduler runs |
| `eureka.server.renewal-percent-threshold` | `0.85` | The threshold (85%) — if heartbeats drop below this, self-preservation activates |
| `eureka.server.renewal-threshold-update-interval-ms` | `900000` (15 min) | How often Eureka recalculates the expected total heartbeats |
| `eureka.server.enable-self-preservation` | `true` | Master switch — set to `false` to disable (not recommended!) |

### ⚙️ How the Threshold Calculation Works

Eureka needs to know: *"How many heartbeats should I expect per minute?"*

The answer changes over time as instances come and go. So every **15 minutes**, a scheduler recalculates the expected heartbeat count. From that total, it applies the 85% threshold to determine the minimum acceptable heartbeat count.

If actual heartbeats fall below this minimum → self-preservation mode activates.

---

## Reading the Dashboard Warning

Now let's re-read that scary message:

> **EMERGENCY! Eureka may be incorrectly claiming instances are up when they are not. Renewals are lesser than threshold and hence the instances are not being expired just to be safe.**

Translation: *"I'm not getting enough heartbeats (renewals), so I've activated self-preservation. I'm keeping all instance records in the registry even though some might be down — just to be safe."*

---

## ✅ Key Takeaways

- Self-preservation prevents Eureka from evicting all instances during temporary network glitches
- It activates when the actual heartbeat count drops below 85% of the expected count
- While active, no further evictions happen — Eureka keeps serving existing registry data
- It automatically deactivates when sufficient heartbeats resume
- The dashboard warning is informational, not a crisis

## ⚠️ Common Mistakes

- **Panicking** when you see the self-preservation warning — it's a protection mechanism, not an error
- **Disabling self-preservation** (`enable-self-preservation=false`) in production — this removes the safety net and can cause cascading failures during network issues
- Trying to "fix" the warning by restarting Eureka — it will resolve itself when instances resume heartbeats

## 💡 Pro Tip

In development/local environments, you might see self-preservation activate frequently because you're stopping and starting instances all the time. This is normal. In production with stable networks, you'll rarely see it — and when you do, it's doing exactly what it should: protecting your service registry from false mass evictions.
