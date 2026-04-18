# Concurrent Maps — Slipping Conditions

## Introduction

We've seen that `ConcurrentHashMap` uses fine-grained locking to make individual operations like `put()` thread-safe. But here's the catch — **individual operations being atomic doesn't mean compound operations are atomic**. When you combine a read and a write (like "check if key exists, then insert"), you open the door to a subtle bug called a **slipping condition**.

---

## Concept 1: The Slipping Condition Problem

### 🧠 What is a Slipping Condition?

A slipping condition occurs when multiple threads **read a value, make a decision based on that value, and then write back** — but between the read and the write, another thread has already changed the state.

Think of it like two people checking if a parking spot is empty and both driving into it at the same time.

### ⚙️ How It Happens

Consider this common pattern:

```java
ConcurrentMap<String, String> map = new ConcurrentHashMap<>();

// Thread 1 and Thread 2 both execute this:
if (!map.containsKey("key")) {
    map.put("key", "value");
}
```

Here's the timeline of the bug:

1. **Thread 1** calls `containsKey("key")` → returns `false` ✅
2. **Thread 2** calls `containsKey("key")` → also returns `false` ✅ (Thread 1 hasn't inserted yet)
3. **Thread 1** calls `put("key", "valueA")`
4. **Thread 2** calls `put("key", "valueB")` — **overwrites Thread 1's value!**

One of the updates is silently lost.

### ❓ Why Does This Happen?

The `put()` method **is** atomic — no two threads can corrupt the internal structure. But the **combination** of `containsKey()` + `put()` is **not** atomic. There's a gap between the check and the insert where another thread can slip in.

> ✅ `put()` alone = atomic  
> ⚠️ `containsKey()` + `put()` together = **NOT atomic**

---

## Concept 2: The Naive Fix — Synchronizing on the Map

### ⚙️ Brute-Force Approach

You might think: "Let's just synchronize on the map itself!"

```java
synchronized (map) {
    if (!map.containsKey("key")) {
        map.put("key", "value");
    }
}
```

This **does** fix the slipping condition — only one thread can execute the check-then-insert at a time.

### ⚠️ Why This Is a Bad Solution

By synchronizing on the entire map object, you've essentially turned your `ConcurrentHashMap` back into a regular `synchronizedMap`. You lose all the fine-grained locking benefits:

- All other threads are blocked from **any** operation on the map while one thread holds the lock
- You're paying the overhead of `ConcurrentHashMap` without getting its concurrent advantages
- It defeats the entire purpose of using a concurrent collection

---

## Concept 3: The Correct Fix — `putIfAbsent()`

### 🧠 What is `putIfAbsent()`?

`ConcurrentHashMap` provides a built-in method that does the check-and-insert **atomically** in a single operation:

```java
map.putIfAbsent("key", "value");
```

This is equivalent to:

```java
if (!map.containsKey("key")) {
    map.put("key", "value");
}
```

But **thread-safe**, because the entire check-then-insert is performed as a single atomic operation internally.

### ⚙️ How It Works

Internally, `putIfAbsent()` acquires the lock on the relevant bucket, checks if the key exists, inserts if it doesn't, and releases the lock — all within one synchronized block. No other thread can slip in between the check and the insert.

### 💡 Key Insight

The lesson here is broader than just `putIfAbsent()`. The `ConcurrentHashMap` API provides several **compound atomic operations** for exactly this reason:

| Method | What It Does Atomically |
|--------|------------------------|
| `putIfAbsent(key, value)` | Insert only if key is missing |
| `replace(key, oldValue, newValue)` | Replace only if current value matches |
| `remove(key, value)` | Remove only if current value matches |
| `compute(key, function)` | Atomically compute a new value |
| `merge(key, value, function)` | Atomically merge values |

---

## Summary

✅ Individual `ConcurrentHashMap` operations (`put`, `get`, `remove`) are atomic

⚠️ **Compound operations** (check-then-act) are NOT atomic — this creates slipping conditions

⚠️ Don't synchronize on the map object — it kills concurrency

✅ Use built-in atomic methods like `putIfAbsent()`, `compute()`, and `merge()` to avoid slipping conditions

💡 Whenever you find yourself writing `if (!map.containsKey(...)) { map.put(...); }`, stop — there's almost certainly a built-in atomic method that does what you need
