# Choosing the Right Isolation Level in Real Applications

## Introduction

In a real enterprise application, hundreds of users are reading and writing data simultaneously. If their transactions interfere with each other, data can get messy — you might read data that was never actually committed, or see different values every time you query the same row.

That's what **isolation levels** control. They define the "walls" between concurrent transactions. Higher walls mean better data accuracy but slower performance. Lower walls mean blazing speed but riskier data.

---

## Three Data Anomalies You Must Understand

Before diving into isolation levels, you need to understand the three problems they protect against:

### 1. Dirty Read — Reading Uncommitted Data

Imagine reading data that another user changed **but hasn't saved yet**. If they undo their change, the data you read becomes fake.

> It's like reading someone's unsent draft email — they might delete it, and then what you read never existed.

### 2. Non-Repeatable Read — Data Changes Between Reads

You read a row, someone else updates it and commits. When you read the same row again, you get **different data**.

> It's like a book changing its text while you're still reading it.

### 3. Phantom Read — New Rows Appear

You query 10 records. Someone inserts a new record. When you count again, there are suddenly 11.

> A "phantom" (ghost) row appeared out of nowhere.

---

## The Four Isolation Levels

### 1. READ_UNCOMMITTED — See Everything (Even Uncommitted)

```java
@Transactional(isolation = Isolation.READ_UNCOMMITTED)
```

**Behavior:** Your transaction can see changes from other transactions **even before they commit**.

| Dirty Read | Non-Repeatable Read | Phantom Read |
|:---:|:---:|:---:|
| ⚠️ Yes | ⚠️ Yes | ⚠️ Yes |

**When to use:** Extremely rare. Only when **speed is everything** and accuracy doesn't matter.

**Example:** Displaying a "likes" counter on social media — being off by one isn't a disaster.

---

### 2. READ_COMMITTED — See Only Saved Data

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
```

**Behavior:** Your transaction can only see data that has been **officially committed** by other transactions.

| Dirty Read | Non-Repeatable Read | Phantom Read |
|:---:|:---:|:---:|
| ✅ Prevented | ⚠️ Yes | ⚠️ Yes |

**The catch:** If another transaction commits between your reads, you'll see different values for the same row.

**Default for:** PostgreSQL, Oracle, SQL Server.

---

### 3. REPEATABLE_READ — Frozen Data for Your Transaction

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
```

**Behavior:** When your transaction reads a row, the database **freezes that row's data** for your transaction's lifetime. Even if someone else updates and commits, you still see the original version.

| Dirty Read | Non-Repeatable Read | Phantom Read |
|:---:|:---:|:---:|
| ✅ Prevented | ✅ Prevented | ⚠️ Yes |

**How it works — Snapshots and Versioning:**

```
1. Transaction A starts → reads balance = $100
2. Transaction B updates balance to $200 and commits
3. Database now has TWO versions:
   - Old version: $100 (for Transaction A)
   - Current version: $200 (for all other transactions)
4. Transaction A reads again → still sees $100
```

The database uses **versioning** — it doesn't actually freeze the row, but maintains older versions for active transactions.

**When to use:** Financial reports, calculations where numbers must stay consistent throughout processing.

**Default for:** MySQL.

---

### 4. SERIALIZABLE — Perfect Accuracy, Maximum Locks

```java
@Transactional(isolation = Isolation.SERIALIZABLE)
```

**Behavior:** Full isolation. No other transaction can modify OR insert data that your transaction is reading. Transactions effectively run one at a time.

| Dirty Read | Non-Repeatable Read | Phantom Read |
|:---:|:---:|:---:|
| ✅ Prevented | ✅ Prevented | ✅ Prevented |

**How it works — Range Locks:**

If your query reads users between age 20 and 30, the database **locks the entire range**. No other transaction can insert, update, or delete users in that age range until your transaction completes.

**When to use:** Extremely critical operations where 100% accuracy is non-negotiable.

**Example:** Checking balances across 5 accounts, verifying the total is exactly $1,000,000, then distributing a 1% bonus. If another transaction moves money between these accounts during your calculation, your math would be wrong.

> ⚠️ **The cost:** Other transactions must **wait** until yours completes. This is the slowest isolation level.

---

## The DEFAULT Isolation — Let the Database Decide

```java
@Transactional(isolation = Isolation.DEFAULT)
```

This tells Spring: "Use whatever the database's default isolation level is."

| Database | Default Isolation |
|----------|------------------|
| **MySQL** | REPEATABLE_READ |
| **PostgreSQL** | READ_COMMITTED |
| **Oracle** | READ_COMMITTED |
| **SQL Server** | READ_COMMITTED |

> 💡 In most applications, `DEFAULT` is the right choice. The database vendor has already chosen the best trade-off for their engine.

---

## Comparison Chart

| Isolation Level | Dirty Read | Non-Repeatable | Phantom | Speed |
|----------------|:---:|:---:|:---:|:---:|
| READ_UNCOMMITTED | ⚠️ | ⚠️ | ⚠️ | Fastest |
| READ_COMMITTED | ✅ | ⚠️ | ⚠️ | Fast |
| REPEATABLE_READ | ✅ | ✅ | ⚠️ | Moderate |
| SERIALIZABLE | ✅ | ✅ | ✅ | Slowest |

---

## READ_COMMITTED vs REPEATABLE_READ — The Core Difference

- **READ_COMMITTED:** Database gives you the **latest committed version** at the moment you ask. If data changes between your reads, you see the new value.
- **REPEATABLE_READ:** Database gives you the **version that existed when your transaction began**. All mid-transaction updates are ignored.

---

## ✅ Key Takeaways

- Isolation levels define how much transactions can "see" each other's changes
- `DEFAULT` (let the database decide) is the right choice for most applications
- MySQL defaults to `REPEATABLE_READ`, PostgreSQL/Oracle default to `READ_COMMITTED`
- Higher isolation = better accuracy but slower performance (more locking)
- Lower isolation = faster performance but risk of dirty/non-repeatable/phantom reads
- `SERIALIZABLE` gives perfect accuracy but at the cost of significant performance

## ⚠️ Common Mistakes

- Setting `SERIALIZABLE` for every transaction — destroys performance under load
- Not understanding your database's default isolation level
- Using `READ_UNCOMMITTED` for anything involving financial data

## 💡 Pro Tips

- In practice, `READ_COMMITTED` or `REPEATABLE_READ` (the defaults) handle 99% of real-world scenarios
- Only reach for `SERIALIZABLE` in extremely critical financial calculations
- Throughout this course, we'll use the `DEFAULT` isolation — MySQL's `REPEATABLE_READ` handles our needs perfectly
