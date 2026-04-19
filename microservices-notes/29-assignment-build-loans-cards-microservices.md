# Assignment: Build Loans & Cards Microservices

## Introduction

You've built the entire Accounts Microservice from scratch — database, entities, DTOs, CRUD APIs, exception handling, validation, auditing, and documentation. Now it's time to prove you understand it by building two more microservices: **Loans** and **Cards**.

The beauty of microservices architecture is that each service follows the same patterns. If you understood Accounts, building Loans and Cards is repetition with different business data. This assignment is your chance to solidify everything through practice.

---

## Concept 1: The Assignment

### 🧠 What you need to build

Build **Loans Microservice** and **Cards Microservice** following the same standards as Accounts:

1. **Create Spring Boot project** from `start.spring.io` with the same dependencies
2. **H2 Database** — schema and application config
3. **Entity classes** — with BaseEntity for audit columns
4. **JPA Repositories** — with custom query methods
5. **DTO pattern** — separate DTOs from entities
6. **CRUD REST APIs** — Create, Read, Update, Delete
7. **Exception handling** — Global exception handler with custom exceptions
8. **JPA Auditing** — Automatic audit column population
9. **Input validation** — Jakarta validation annotations on DTOs
10. **API Documentation** — OpenAPI/Swagger with all annotations

---

## Concept 2: Port Assignments

### ⚠️ Critical — Follow these exactly

| Microservice | Port |
|---|---|
| Accounts | 8080 |
| Loans | **8090** |
| Cards | **9000** |

Do NOT use different ports. In later sections, these ports are referenced in Docker files, Kubernetes configs, and service discovery. Changing them means changing dozens of configuration files.

---

## Concept 3: Database Schema — Loans

The Loans Microservice has a single table:

```sql
CREATE TABLE IF NOT EXISTS loans (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL,
    loan_number VARCHAR(100) NOT NULL,
    loan_type VARCHAR(100) NOT NULL,
    total_loan INT NOT NULL,
    amount_paid INT NOT NULL,
    outstanding_amount INT NOT NULL,
    created_at DATE NOT NULL,
    created_by VARCHAR(20) NOT NULL,
    updated_at DATE DEFAULT NULL,
    updated_by VARCHAR(20) DEFAULT NULL
);
```

**No Customer table** — Why? The customer already exists in Accounts Microservice. In Loans and Cards, we use the same `mobile_number` to link records. Later, we'll use this mobile number to fetch combined data from all three microservices.

---

## Concept 4: The Approach

### 💡 How to tackle this

**Option 1 — Build from scratch:** Start with `start.spring.io`, create packages, write everything yourself. Use Accounts as a reference.

**Option 2 — Reference GitHub:** If you get stuck on naming conventions, column names, or field names, refer to the code in the GitHub repo:
```
github.com/eazybytes/microservices → Section 2 → Loans / Cards
```

**Option 3 — Copy and understand:** Even if you copy the code from GitHub, make sure you understand every line. The goal is *comprehension*, not just having working code.

### 💡 Insight

The reason for using the **same naming conventions, field names, and method names** across all three microservices is practical — in later sections, when we integrate these services together, your code and the instructor's code need to match for things like Docker Compose, Kubernetes deployments, and API Gateway configurations.

---

## Concept 5: Resources Available

- **GitHub repo** — Complete code for Loans and Cards microservices
- **Postman collection** — Import the JSON from GitHub for testing all APIs
- **Important links** — Spring Boot docs, start.spring.io, DTO pattern, springdoc website

---

## ✅ Key Takeaways

- Build Loans on port 8090 and Cards on port 9000
- Follow the exact same standards as Accounts — this is intentional repetition for learning
- Use the same mobile number across all microservices for cross-service linking
- No Customer table in Loans/Cards — the customer lives in Accounts
- Refer to GitHub if stuck, but try to build as much as you can yourself
- Import the Postman collection from GitHub for easy testing

## 💡 Pro Tips

- Building the same patterns three times makes them second nature — that's the goal
- Don't skip this assignment even if it feels repetitive — muscle memory matters in coding
- The cross-service mobile_number link is foreshadowing Spring Cloud concepts coming later
- Use the Postman collection to verify all your APIs work correctly
