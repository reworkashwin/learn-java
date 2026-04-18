# Optimizing Database Reads with @Transactional(readOnly = true)

## Introduction

We've been adding `@Transactional(readOnly = true)` to our service classes, but *why*? What performance gains does this little configuration actually bring? Is it just a formality, or does it make a real difference?

In this lesson, we'll dive deep into the internals of Hibernate and the database layer to understand exactly how `readOnly = true` boosts performance. Spoiler: the gains are significant, especially in read-heavy applications.

---

## What Does readOnly = true Tell the Framework?

When you set `readOnly = true`, you're making a promise:

> "Hey Hibernate and database — I'm **only reading data**. I won't update anything."

With that promise, the framework skips a bunch of background work it normally does. Let's explore each optimization.

---

## Optimization 1: Skip Dirty Checking

### 🧠 What is Dirty Checking?

Normally, when Hibernate loads an entity from the database, it takes a **snapshot** of that entity — a copy of its current state. Later, when the transaction is about to commit, Hibernate compares the current entity with the snapshot to detect changes. This process is called **dirty checking**.

### ⚙️ How It Works (Without readOnly)

```java
@Transactional
public boolean closeContactMessage(int id) {
    Contact contact = contactRepository.findById(id);  // Snapshot taken! (status = "NEW")
    contact.setStatus("CLOSED");                        // Entity modified
    contactRepository.save(contact);                    // Hibernate compares with snapshot
    // Framework detects: status changed from "NEW" to "CLOSED" → fires UPDATE query
}
```

Hibernate needs the snapshot to figure out *which columns changed*. Without it, the framework can't do its magic.

### ✅ With readOnly = true

```java
@Transactional(readOnly = true)
public List<Contact> fetchNewMessages() {
    return contactRepository.findAll();  // NO snapshot taken!
    // Entities loaded in read-only mode → faster, less memory
}
```

No snapshots stored. No dirty checks during flush/commit. **Faster CPU usage**, especially when loading hundreds or thousands of entities.

---

## Optimization 2: Reduced Memory Usage

### 🧠 The Snapshot Memory Problem

Every entity loaded by Hibernate gets a snapshot stored in memory. If you're fetching 10,000 records:

| Mode | Snapshots | Memory Impact |
|------|-----------|---------------|
| Without readOnly | 10,000 snapshots | Heavy heap usage |
| With readOnly = true | 0 snapshots | Minimal footprint |

Snapshots eat a **surprising amount of heap space**, especially with large entity graphs. With `readOnly = true`, Hibernate discards all snapshots completely, resulting in a **lower memory footprint per transaction**.

> 💡 This is a game-changer for **high-concurrency applications** where many users are reading data simultaneously.

---

## Optimization 3: Optimized Flushing

### 🧠 What is Flushing?

Flushing is when Hibernate pushes pending changes from memory to the database. Normally, Hibernate auto-flushes at certain points (before queries, at transaction commit).

### ✅ With readOnly = true

Hibernate sets the **flush mode to MANUAL**. Since there's nothing to update, there's nothing to flush. Skipping automatic flush checks gives you another small performance boost.

---

## Optimization 4: Database-Level Hints

### 🧠 How Does the Database Benefit?

Spring Data JPA passes the `readOnly` flag down to the JDBC driver, which forwards it to the database server itself. Databases like PostgreSQL, MySQL, and Oracle can then:

- **Skip row locking** — No updates means no need to lock rows
- **Avoid transaction overhead** — Lighter transaction processing
- **Reject accidental writes** — Some databases will throw an error if you try to write in a read-only transaction

> ⚠️ Not all databases optimize equally based on readOnly hints. PostgreSQL and MySQL handle it well, but results may vary with other databases.

---

## The Big Picture — 10,000 Entities Example

| Aspect | Without readOnly | With readOnly = true |
|--------|-----------------|---------------------|
| Snapshots | 10,000 created | None |
| Dirty checking | Iterates all 10,000 | Skipped entirely |
| Memory | Heavy heap usage | Minimal |
| Flush | Auto-flush checks | Manual (skipped) |
| DB locking | Rows may be locked | No locking |
| GC pressure | High | Low |

---

## The Best Practice — Applied

```java
@Service
@Transactional(readOnly = true)  // Default for ALL methods
public class ContactServiceImpl implements IContactService {

    // Inherits readOnly = true — optimized read
    public List<Contact> fetchNewMessages() { ... }

    @Transactional  // Override: write operation
    public boolean closeContactMessage(int id) { ... }
}
```

1. **Class level:** `readOnly = true` — safe, optimized default
2. **Write methods:** Override with plain `@Transactional`

---

## When Does readOnly = true Shine?

- **Read-heavy applications** — Most enterprise apps are 80%+ reads
- **Large object graphs** — Loading entities with associations
- **High concurrency** — Many users reading simultaneously
- **Report generation** — Fetching thousands of records

For smaller queries fetching 5-10 records, the gain is minimal and not noticeable. But adding `readOnly = true` **future-proofs your code** — when a new developer adds a method that reads thousands of records, the optimization is already in place even if they forget about it.

---

## ✅ Key Takeaways

- `readOnly = true` tells Hibernate and the database "I'm only reading — skip the overhead"
- **Dirty checking skipped** — No entity snapshots, no comparison logic
- **Memory reduced** — No snapshots stored in heap
- **Flushing optimized** — Flush mode set to MANUAL
- **Database hints** — Row locking and transaction overhead reduced at the DB level
- Always set `readOnly = true` at the class level and override for write methods

## ⚠️ Common Mistakes

- Using `readOnly = true` on methods that modify data — this will cause runtime exceptions or silently fail to persist changes
- Thinking `readOnly = true` is "just documentation" — it provides real, measurable performance gains
- Not setting `readOnly = true` because your queries are small — it's about future-proofing

## 💡 Pro Tips

- Even if a method calls `findAll()` from `JpaRepository` (which already has `readOnly = true` internally), having `readOnly = true` on your service method ensures the entire transaction scope is optimized
- The gains compound: less CPU + less memory + less GC pressure + less DB locking = significantly better performance at scale
- From the next lesson, we'll focus on update operations and the `@Modifying` annotation
