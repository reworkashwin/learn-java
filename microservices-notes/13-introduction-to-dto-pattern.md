# Introduction to DTO (Data Transfer Object) Pattern

## Introduction

We now have entity classes and repositories. You might think: "Let's just send entity objects directly in our API responses!" That's tempting — but it's a trap. In this lecture, we explore why you should **never expose your database entities** to client applications, and how the **DTO (Data Transfer Object) pattern** elegantly solves this problem.

---

## The Problem — Why Not Just Use Entities?

Imagine a client application wants both customer details AND account details in a single response. Here's why returning entities directly is problematic:

1. **Entities carry sensitive data** — Think `customerId` (internal DB identifier), metadata columns like `createdBy`, `updatedAt`. Your clients don't need (and shouldn't see) this internal data.

2. **Entities are tightly coupled to your database** — If you add a new column to your table, the entity changes, and suddenly your API response changes too. Every client breaks.

3. **You can't combine data flexibly** — What if clients want fields from both `Customer` and `Accounts` in one response? You can't return two separate objects in a single HTTP response.

4. **No data filtering** — Maybe one client needs the full mobile number, another needs it masked. With entities, you're stuck sending everything.

Think of it this way: your entity is your **private diary** — it has everything. A DTO is the **curated letter** you send to someone — only the information they need to see.

---

## What Is the DTO Pattern?

The DTO pattern is a **design pattern** that creates separate classes specifically for transferring data between layers of your application (or between your application and external clients).

```
Client  <-->  DTO  <-->  Mapper  <-->  Entity  <-->  Database
```

The **DTO class** holds only the fields your clients need. A **mapper** (or assembler) converts between entity and DTO. The client never sees your database structure.

### Example

```
Customer Entity:          CustomerDetailsDto:
- customerId              - name
- name                    - email  
- email                   - mobileNumber
- mobileNumber            - accountNumber (from Accounts entity)
- createdAt               - accountType (from Accounts entity)
- createdBy               - branchAddress (from Accounts entity)
- updatedAt
- updatedBy

Accounts Entity:
- customerId
- accountNumber
- accountType
- branchAddress
- createdAt/By/updatedAt/By
```

The DTO cherry-picks fields from multiple entities and presents a clean, client-friendly view.

---

## Three Key Advantages of DTOs

### 1. Reduced Network Traffic

Without DTOs, a client needing both customer and account data would have to make **two separate API calls**. With a DTO, you combine everything into one response — one call, one response.

### 2. Encapsulated Serialization

Need to send data as JSON to one client and XML to another? Serialization logic lives in the DTO layer, not scattered across your application. When formats change, you update one place.

### 3. Layer Decoupling

This is the big one. Your presentation layer (APIs) and data access layer (database) are **completely independent**:
- Add a new column to the database? The DTO doesn't change. Clients aren't affected.
- Client wants data formatted differently? Update the DTO. The database doesn't change.
- Need to mask sensitive fields? Do it in the mapper. Neither entity nor client code changes.

---

## The DTO Pattern in Real Projects

This pattern was originally recommended by **Martin Fowler** (a legendary software architect). You'll find it under different names across organizations:
- **DTO** (Data Transfer Object)
- **Value Object** (VO)
- **Transfer Object**

Regardless of the name, the principle is the same: **separate your internal data representation from what you expose externally**.

---

## ✅ Key Takeaways

- **Never expose entity classes** directly in API responses — they carry internal/sensitive data and create tight coupling
- DTOs are **separate POJO classes** designed specifically for data transfer between layers
- The mapper/assembler layer handles conversion between entity ↔ DTO
- DTOs enable **data filtering**, **aggregation from multiple entities**, and **layer decoupling**
- For every entity, create a corresponding DTO class

💡 **Pro Tip**: Name your DTO classes with a `Dto` suffix (e.g., `CustomerDto`, `AccountsDto`) so you can instantly distinguish them from entity classes in your codebase.

⚠️ **Common Mistakes**
- Writing business logic inside DTO classes — they should only hold data and serialization logic
- Skipping DTOs for "simple" APIs — even simple APIs grow, and retrofitting DTOs later is painful
- Creating one giant DTO for everything — keep DTOs focused; create multiple if needed
