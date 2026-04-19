# Strangler Fig Pattern

## Introduction

So you've decided to migrate your monolith to microservices. Great. But how do you actually **do** it without blowing up your production system?

Do you rewrite everything from scratch in one massive effort (a "Big Bang" migration)? Or is there a safer, smarter path?

Enter the **Strangler Fig Pattern** — the industry-standard approach for gradually migrating legacy systems to modern architectures.

---

## The Origin: A Plant That Replaces Trees

The name comes from nature. A **strangler fig** is a tropical plant that:
1. Starts as a small vine growing on the side of a host tree
2. Gradually wraps around and grows alongside the tree
3. Eventually replaces the original tree entirely — the host tree dies, and only the strangler fig remains

The stages look like this:
1. **Original tree** stands alone
2. **Small vine** starts growing alongside it
3. **Vine grows**, covering more of the tree
4. **Only the new plant remains** — the original tree is gone

This is exactly the strategy: **grow the new system alongside the old one, piece by piece, until the old system is no longer needed.**

---

## How It Works for Software Migration

### The Idea

Instead of rewriting your entire monolithic application at once, you:
1. Identify one component to extract
2. Build it as a microservice
3. Route traffic to the new microservice (while keeping the monolith running)
4. Validate everything works
5. Move to the next component
6. Repeat until the monolith is empty

### Visual Example: Bank Application Migration

**Stage 1: Full Monolith**
```
[Monolithic App: Accounts + Cards + Loans]
```

**Stage 2: Extract Accounts**
```
[Accounts Microservice] ← new
[Monolithic App: Cards + Loans] ← still running
```

**Stage 3: Extract Cards**
```
[Accounts Microservice]
[Cards Microservice] ← new
[Monolithic App: Loans] ← shrinking
```

**Stage 4: Extract Loans — Monolith Gone**
```
[Accounts Microservice]
[Cards Microservice]
[Loans Microservice]
[Monolithic App] ← eliminated ✅
```

---

## When to Use This Pattern

Use Strangler Fig when:
- ✅ You're migrating a **large or complex** legacy system
- ✅ You want to **avoid the risk** of a Big Bang rewrite
- ✅ The legacy system must **remain operational** during the transition (you can't just shut it down for 6 months)

Don't bother if:
- Your legacy system is small and simple — just rewrite it
- There's no production traffic to worry about

---

## Why NOT Big Bang Migration?

| Big Bang | Strangler Fig |
|----------|--------------|
| Rewrite everything at once | Migrate piece by piece |
| Ship on a single day | Ship incrementally over weeks/months |
| If something breaks, everything breaks | If something breaks, only one service is affected |
| Can't roll back easily | Can redirect traffic back to monolith |
| Lessons learned too late | Learn from each migration step |

Big Bang migrations are **high-risk gambling**. The Strangler Fig pattern is **engineering discipline**.

---

## The Four Phases

### 1. Identification
Right-size your microservices using Domain-Driven Design or Event Storming. Decide what components exist in the monolith and how they map to future microservices.

### 2. Transformation
Rewrite the first component as a microservice using modern technologies. Deploy it alongside the monolith.

### 3. Coexistence
Both the monolith and the new microservice run simultaneously. A **Strangler Facade** (typically an API Gateway) routes traffic between them.

This is where the magic happens:
- Route **50%** of traffic to the microservice, **50%** to the monolith
- Validate results are identical
- If the microservice has issues → route **100%** back to the monolith
- If everything's good → route **100%** to the microservice

The old code stays in the monolith (dead code) as a safety net. It's not receiving traffic, but it's there if you need to roll back.

### 4. Elimination
Once all components are migrated and you're confident in the microservices, **decommission the monolith entirely**.

---

## Key Benefits

### Minimal Risk
You're only changing one piece at a time. If it breaks, the blast radius is small and you can roll back instantly.

### Incremental Learning
Every migration teaches you something:
- "The database schema needs to be split this way"
- "We need an event bus for this cross-service communication"
- "Our testing strategy needs to include contract tests"

These lessons improve every subsequent migration step.

### Testing & Validation
During coexistence, you can:
- Compare results between microservice and monolith
- Run both in parallel with real production traffic
- Catch discrepancies before fully cutting over

---

## ✅ Key Takeaways

- The Strangler Fig pattern enables **safe, gradual migration** from monolith to microservices
- Named after a plant that grows around and eventually replaces its host tree
- Four phases: **Identify → Transform → Coexist → Eliminate**
- During coexistence, an API Gateway (Strangler Facade) manages traffic routing between old and new
- Always preferred over Big Bang migration for complex systems

💡 **Pro Tip (Interview Must-Know)**: "How do you migrate a legacy application to microservices?" → Explain the Strangler Fig pattern. Mention the four phases, the traffic routing during coexistence, and the ability to roll back. This is one of the most commonly asked microservices interview questions.

⚠️ **Common Mistake**: Not keeping the monolith code alive during coexistence. Even though traffic is routed to the new microservice, the old code should remain as a rollback option until you're fully confident.
