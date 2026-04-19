# Sizing & Identifying Boundaries — Bank App Use Case

## Introduction

Theory is great, but how does right-sizing actually play out in a real decision? Let's put ourselves in the shoes of a **CTO** making the call on microservice boundaries for a bank application.

Three different teams have been asked to propose their sizing. We'll evaluate each one and pick a winner.

---

## The Business Context

Our bank application supports:
- **Saving Accounts** — store money digitally
- **Trading Accounts** — buy/sell stocks, mutual funds
- **Cards** — both Debit and Credit cards
- **Loans** — Home loans, Vehicle loans, Personal loans

---

## Team 1: Two Microservices

| Microservice 1 | Microservice 2 |
|----------------|----------------|
| Saving Account + Trading Account | Cards + Loans |

**Verdict: ❌ Too coarse**

The problem is **tight coupling**. Cards and Loans are fundamentally different domains:
- Cards team wants to release a feature? They have to coordinate with the Loans team.
- Different release cycles, different business rules, different teams — all forced into one service.

Same issue with Saving Account and Trading Account. A stock trading feature request shouldn't be blocked by savings account work.

This is essentially a **mini-monolith** disguised as microservices.

---

## Team 2: Four Microservices

| Microservice 1 | Microservice 2 | Microservice 3 | Microservice 4 |
|----------------|----------------|----------------|----------------|
| Saving Account | Trading Account | Cards | Loans |

**Verdict: ✅ Just right (for now)**

Each business domain gets its own microservice:
- **Loose coupling** — each team can develop, test, and deploy independently
- **Technology freedom** — each service can choose its own language, database, framework
- **Clear boundaries** — aligned with how the business actually thinks about these product lines

---

## Team 3: Seven+ Microservices

| Services |
|----------|
| Saving Account |
| Trading Account |
| Debit Card |
| Credit Card |
| Home Loan |
| Vehicle Loan |
| Personal Loan |

**Verdict: ⚠️ Too granular (probably)**

This *could* make sense — but only if there's **significant** functionality difference between:
- Debit cards vs. Credit cards
- Home loans vs. Vehicle loans vs. Personal loans

If the differences are minor (handled by a column in the database or a config flag), splitting them into separate microservices creates:
- Unnecessary operational overhead (7 deployments instead of 4)
- More inter-service communication
- More infrastructure to manage
- More things that can go wrong

For minor differences, use database columns or conditional logic — don't create a whole new microservice.

---

## The Decision: Team 2 Wins 🏆

As the CTO, Team 2 provides the best balance:
- It's not so coarse that we lose microservice benefits
- It's not so granular that we drown in operational overhead
- Each service maps to a clear business domain

### But here's the important nuance...

If in the future, the Cards domain grows so complex that debit and credit card logic genuinely needs to be separated, we can **split** the Cards microservice into two. That's a normal, expected evolution.

---

## The Big Lesson

> **No sizing is the "right" sizing on day one.**

Organizations learn from experience:
1. Start with a reasonable sizing based on current understanding
2. Deploy, observe, and learn
3. If a service is too bloated → split it
4. If services have too much operational overhead → merge them
5. Repeat

This is a **continuous process**, not a one-time decision.

---

## ✅ Key Takeaways

- Evaluate sizing proposals by asking: "Does this create tight coupling?" and "Does this create unnecessary overhead?"
- **Too few, too big** = disguised monolith
- **Too many, too small** = operational nightmare
- **Start with domain-aligned boundaries** and iterate from there
- Minor business logic differences don't justify separate microservices — use database columns or configuration instead
- Right-sizing is an **ongoing process**, not a one-time architecture decision

💡 **Pro Tip**: In interviews, when discussing microservice sizing, always mention that it's iterative. No one expects you to get it perfect on day one — what matters is having a strategy for continuous refinement.
