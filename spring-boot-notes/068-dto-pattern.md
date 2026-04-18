# Introduction to the DTO Pattern

## Introduction

So far, we've been sending **Entity objects** directly from our REST API to client applications. Our `getAllCompanies()` endpoint returns `List<Company>` — the same Entity class that maps to our database table. Every field, every column, goes straight to the client.

But here's the thing — **this is a bad practice.** And in this lecture, you'll learn why, and what to do instead. Welcome to the **DTO pattern**.

---

## What Is a DTO?

**DTO** stands for **Data Transfer Object**. It's a simple Java class that:
- Contains **only data** (no business logic)
- Is specifically designed for **transferring data** between layers of your application

> **Think of it this way:** The Entity class is your **internal ID card** — it has everything, including sensitive details. The DTO is the **public business card** — it has only what you want to share.

---

## Why Not Just Use Entity Objects Everywhere?

Let's walk through a real scenario to understand the problem.

### Scenario: Customer Entity

Imagine you have a `Customer` entity with these fields:

```java
@Entity
public class Customer {
    private Long id;
    private String name;
    private String email;
    private String mobileNumber;
    private String password;    // 🔒 Sensitive!
    private String ssn;         // 🔒 Extremely sensitive!
}
```

If you return this Entity from your REST API, the client receives:

```json
{
    "id": 1,
    "name": "John Doe",
    "email": "john@email.com",
    "mobileNumber": "9876543210",
    "password": "hashed_password_here",
    "ssn": "123-45-6789"
}
```

**The client now has the password and SSN!** That's a serious security vulnerability. You never want to expose sensitive data unnecessarily.

### Solution: Create a DTO

```java
public class CustomerDto {
    private String name;
    private String email;
    private String mobileNumber;
    // No password, no SSN!
}
```

Now the client receives only what they need:

```json
{
    "name": "John Doe",
    "email": "john@email.com",
    "mobileNumber": "9876543210"
}
```

Sensitive information stays safely on the server side.

---

## Benefit 1: Security — Control What Gets Exposed

The most obvious advantage: **you decide what data leaves your application.** Sensitive fields like passwords, SSNs, internal audit fields — they stay in the Entity, never reaching the DTO.

---

## Benefit 2: Combining Data from Multiple Tables

Here's a powerful use case. Imagine you have two tables:

**Customer Table:** `name, email, mobileNumber, password`
**Accounts Table:** `accountNumber, accountType, branchAddress`

### Without DTO Pattern

The client needs data from both tables. Without DTOs, they'd have to make **two separate API calls** — one for customer info, one for account info. That's unnecessary network traffic.

### With DTO Pattern

Create a single DTO that combines both:

```java
public class CustomerDetailsDto {
    // From Customer entity
    private String name;
    private String email;
    private String mobileNumber;
    
    // From Accounts entity
    private String accountNumber;
    private String accountType;
    private String branchAddress;
}
```

Now the client makes **one API call** and gets everything they need. You load data from both tables, map it into the DTO, and return it.

---

## Benefit 3: Data Transformation

DTOs give you a clean place to **transform data** before sending it out.

**Example:** The database stores gender as `M` or `F`. But the UI wants to display `Male` or `Female`.

In the mapper logic (where you copy data from Entity to DTO), you can transform:

```java
// In mapper logic
dto.setGender(entity.getGender().equals("M") ? "Male" : "Female");
```

The Entity stays true to the database format. The DTO presents data in a client-friendly format.

---

## Benefit 4: Reducing Network Traffic

With DTOs, you send only relevant fields. If your Entity has 20 columns but the client only needs 5, why send all 20?

Less data = faster response = better performance.

---

## Benefit 5: Decoupling Layers

This is an architectural benefit. When you use DTOs:

- **Entity changes don't break the API.** If you add/remove a column in the database, you update the Entity — but the DTO (and therefore the API response) can stay unchanged.
- **Controllers never know about the database structure.** They only see DTOs.
- **Repository layer never knows about the API response format.** It only deals with Entities.

Each layer is **independent**, making the codebase easier to maintain and evolve.

---

## The DTO Flow — How Data Moves

```
Database
   ↓ (SQL query)
Entity Objects (loaded by Repository layer)
   ↓ (mapper logic)
DTO Objects (created in Service layer)
   ↓ (returned by Controller)
JSON Response (sent to client)
```

The **mapper logic** in the Service layer is where the transformation happens — copying relevant fields from Entity to DTO, applying any transformations needed.

---

## Other Names for DTOs

In the industry, you might hear different names for the same concept:

| Name | Full Form |
|---|---|
| **DTO** | Data Transfer Object |
| **VO** | Value Object |
| **TO** | Transfer Object |

Regardless of the name, they all solve the same problems we discussed.

---

## ✅ Key Takeaways

1. **Never expose Entity objects directly** to client applications — use DTOs instead.
2. DTOs contain **only the data you want to share** — sensitive fields stay in the Entity.
3. DTOs can **combine data from multiple tables** into a single response object, reducing API calls.
4. DTOs provide a place for **data transformation** (e.g., `M` → `Male`).
5. DTOs **decouple your layers** — database changes don't affect your API response format.
6. The mapper logic lives in the **Service layer**, between Entity objects and DTO objects.
7. DTO, VO (Value Object), and TO (Transfer Object) are different names for the same concept.

---

## ⚠️ Common Mistakes

- **Returning Entity objects from REST APIs** — this exposes database structure and potentially sensitive data.
- **Putting business logic in DTOs** — DTOs should only hold data, nothing else.
- **Creating DTOs that are identical copies of Entities** — if your DTO has every field from the Entity, you're not gaining any benefit. Remove fields the client doesn't need.
- **Skipping the mapper logic** — without proper mapping, you might accidentally include sensitive fields.

---

## 💡 Pro Tips

- Create DTOs in a dedicated `dto` package for clean organization.
- Think about DTOs from the **client's perspective** — what does the UI actually need to display?
- In our Company example, audit fields like `updatedBy`, `updatedAt` are typically excluded from DTOs since clients don't display them.
- Libraries like **MapStruct** and **ModelMapper** can automate Entity-to-DTO mapping, but many enterprise projects prefer manual mapping for full control.
