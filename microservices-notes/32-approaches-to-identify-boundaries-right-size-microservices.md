# Approaches to Identify Boundaries & Right-Size Microservices

## Introduction

You've built three microservices. Great — but how did we decide that Accounts, Loans, and Cards should each be a **separate** microservice? Why not combine them? Why not split them further?

This is arguably the **most challenging aspect** of building a successful microservice system: **right-sizing** your microservices and identifying **service boundaries**.

Get it wrong, and you either end up with a disguised monolith (too few, too big) or an operational nightmare (too many, too small).

---

## What is "Right Sizing"?

Think of buying a T-shirt. If you normally wear Medium, a Double XL will look ridiculous — loose, floppy, embarrassing. Force yourself into a Small, and you can't walk, breathe, or function.

**Sizing matters.**

The same principle applies to microservices:

- **Too big** → You lose the advantages of microservices (independent deployment, scaling, team autonomy). It's just a monolith wearing a microservice costume.
- **Too small** → You end up with dozens of tiny services that barely do anything, but each one needs deployment, monitoring, networking, and operational overhead.

The sweet spot is somewhere in between — and finding it takes **deliberate analysis**, not guesswork.

---

## Approach 1: Domain-Driven Sizing

### What is it?

You align your microservice boundaries with **business domains** (also called departments, verticals, or business capabilities).

In our EasyBank example:
- **Accounts** domain → Accounts microservice
- **Cards** domain → Cards microservice
- **Loans** domain → Loans microservice

Each domain maps to one microservice. Clean, intuitive, and closely aligned with how the business thinks.

### How does it work in practice?

This is NOT a quick process. You need to:

1. **Talk to domain experts** — people who've been in the organization for years or decades
2. **Gather input** from business analysts, product owners, architects, clients, and developers
3. **Map out operations** — what does each domain handle day-to-day?
4. **Brainstorm** with cross-functional teams to decide boundaries

This typically takes **3 to 6 months** of analysis.

### When does it fall short?

When a single domain is **enormous**. If one department has hundreds of developers and dozens of products, blindly making that one microservice will just recreate a monolith within a domain.

### The iterative nature

No one gets the sizing right on day one. You start with your best assumption, ship it, and then:
- If there's too much operational overhead → **merge** some services
- If a service is getting too bloated → **split** it

It's a continuous refinement process.

⚠️ **Common Mistake**: Treating the initial sizing as final. Microservice boundaries should evolve with your understanding of the domain and operational reality.

---

## Approach 2: Event Storming

### What is it?

An **interactive, collaborative workshop** where stakeholders (developers, testers, product owners, clients, managers) use sticky notes to identify all possible **events** in the system.

### How does it work?

**Step 1: Identify Events**
Everyone writes down events that can happen in the business:
- "Payment completed"
- "Product searched"
- "Card issued"
- "Loan approved"

**Step 2: Identify Commands**
What triggers each event?
- "Customer clicks Pay button" → triggers "Payment completed"

**Step 3: Identify Reactions**
What happens after the event?
- After "Payment completed" → "Amount deducted from account"

**Step 4: Group by Domain**
Move all cards-related events/commands/reactions to one group, loans to another, accounts to another.

Each group becomes a candidate microservice boundary.

### Why is this better in some cases?

| Aspect | Domain-Driven | Event Storming |
|--------|--------------|----------------|
| Time required | 3-6 months | A few weeks |
| Needs domain experts? | Yes, deeply | No — anyone using the product can contribute |
| Interactive? | Meetings & analysis | Fun, engaging workshops |
| Risk of missing events | Higher | Lower (many perspectives) |

### The key advantage

You don't need people who've worked at the company for 20 years. Anyone who uses the product — a tester, a new developer, a business analyst — can identify events. The workshop format naturally surfaces duplicate events, edge cases, and cross-domain interactions.

---

## ✅ Key Takeaways

- **Right-sizing** is critical — too big loses microservice benefits, too small creates operational overhead
- **Domain-Driven Sizing** aligns boundaries with business domains but is time-consuming and needs deep domain knowledge
- **Event Storming** is faster, more inclusive, and often more effective — especially for large or complex systems
- **No sizing is permanent** — treat it as an iterative process that evolves with the business
- Both approaches can be combined: use Event Storming to quickly identify candidates, then refine with Domain-Driven analysis

💡 **Pro Tip (Interview)**: If asked "How do you identify microservice boundaries?", explain both approaches and emphasize the iterative nature. Showing awareness of Event Storming signals maturity — it's a modern, well-regarded technique.
