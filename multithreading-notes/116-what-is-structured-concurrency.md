# What Is Structured Concurrency?

## Introduction

Throughout this course, we've been using **unstructured concurrency** — threads that live independently of each other with no formal parent-child relationship. If a parent thread dies, child threads become orphans. If a child throws an exception, the parent might never know. Java 21 introduces **structured concurrency** to solve these problems, bringing the same discipline to concurrent code that structured programming brought to control flow decades ago.

---

## Concept 1: The Problem with Unstructured Concurrency

### 🧠 What is unstructured concurrency?

With traditional `ExecutorService` or `Thread`, threads have **no hierarchy**:

```java
ExecutorService executor = Executors.newFixedThreadPool(3);

Future<String> userFuture = executor.submit(() -> fetchUser());
Future<String> orderFuture = executor.submit(() -> fetchOrders());
Future<String> paymentFuture = executor.submit(() -> fetchPayment());

String user = userFuture.get();
String orders = orderFuture.get();
String payment = paymentFuture.get();
```

### ❓ What can go wrong?

**Problem 1: Wasted work**

If `fetchUser()` throws an exception, we don't need `fetchOrders()` or `fetchPayment()` anymore. But they **keep running** — wasting CPU, memory, and I/O resources.

**Problem 2: Thread leaks**

If the parent thread is interrupted (e.g., client disconnects), the child tasks keep running as orphans. Nobody's waiting for their results. Nobody will cancel them.

**Problem 3: Error propagation**

If `fetchOrders()` fails after `fetchUser()` succeeds, we're stuck at `orderFuture.get()` catching the exception. Meanwhile, `paymentFuture` keeps running.

```
Main Thread
  ├── fetchUser()     → ✅ returns "Alice"
  ├── fetchOrders()   → ❌ throws Exception
  └── fetchPayment()  → 🏃 still running (wasted)
```

### 💡 Real-World Analogy

Unstructured concurrency is like a manager who assigns tasks to employees but never checks in. If the project is cancelled, the employees keep working because nobody told them to stop. If one employee fails, the others don't know and keep going.

---

## Concept 2: What Is Structured Concurrency?

### 🧠 The principle

Structured concurrency enforces a simple rule: **a task's lifetime is bounded by its parent's scope**. When the scope ends, all child tasks are guaranteed to have completed (either successfully, with an error, or by cancellation).

```
[Open Scope]
    ├── fork: Task A
    ├── fork: Task B
    ├── fork: Task C
    │
    [Join — wait for ALL children]
    │
    [Handle results / errors]
[Close Scope — ALL children done, no leaks]
```

### 🧠 Key properties

1. **Lifetime containment**: Child tasks cannot outlive their parent scope
2. **Cancellation propagation**: If the scope is cancelled, all children are cancelled
3. **Error propagation**: If a child fails, the parent is notified immediately
4. **No orphans**: Every child task is accounted for when the scope closes

---

## Concept 3: StructuredTaskScope in Java 21

### ⚙️ The basic pattern

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {

    Subtask<String> userTask = scope.fork(() -> fetchUser());
    Subtask<String> orderTask = scope.fork(() -> fetchOrders());

    scope.join();            // Wait for ALL subtasks
    scope.throwIfFailed();   // Propagate any exception

    // Both tasks succeeded — use results
    String user = userTask.get();
    String orders = orderTask.get();

    return new Response(user, orders);
}
```

### ⚙️ Step-by-step

1. **Create a scope** using `try-with-resources` — guarantees cleanup
2. **Fork subtasks** — each runs on its own virtual thread
3. **Join** — wait for all subtasks to complete
4. **Check for failures** — `throwIfFailed()` rethrows the first exception
5. **Extract results** — `subtask.get()` returns the value
6. **Scope closes** — all child threads are guaranteed done

---

## Concept 4: Shutdown Policies

### ⚙️ ShutdownOnFailure

If **any** subtask fails, cancel all remaining subtasks immediately:

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<String> user = scope.fork(() -> fetchUser());
    Subtask<String> order = scope.fork(() -> fetchOrders());

    scope.join();
    scope.throwIfFailed();  // If fetchUser() failed, fetchOrders() was cancelled

    return combine(user.get(), order.get());
}
```

**Use when**: You need **all** results. If any fails, the others are useless.

### ⚙️ ShutdownOnSuccess

As soon as **any** subtask succeeds, cancel the rest:

```java
try (var scope = new StructuredTaskScope.ShutdownOnSuccess<String>()) {
    scope.fork(() -> fetchFromServerA());
    scope.fork(() -> fetchFromServerB());
    scope.fork(() -> fetchFromServerC());

    scope.join();
    String result = scope.result();  // First successful result

    return result;
}
```

**Use when**: You need **any one** result — whichever server responds first wins.

### 💡 Real-World Use Case

Imagine querying three replicas of a database. You only need **one** response. `ShutdownOnSuccess` returns the fastest response and cancels the slower queries — saving resources.

---

## Concept 5: Why Structured Concurrency Matters for Observability

### 🧠 Thread dumps become meaningful

With unstructured concurrency, a thread dump shows flat, unrelated threads. With structured concurrency, thread dumps show **parent-child relationships**:

```
main
  └── scope-thread-1 (fetchUser)
  └── scope-thread-2 (fetchOrders)
  └── scope-thread-3 (fetchPayment)
```

You can see which parent task spawned which children — making debugging dramatically easier.

### 🧠 Exception stack traces are connected

When a subtask fails, the exception includes the context of the parent scope, giving you a complete picture of what went wrong and why.

---

## Concept 6: Structured vs Unstructured — Comparison

| Feature | Unstructured (ExecutorService) | Structured (StructuredTaskScope) |
|---------|-------------------------------|----------------------------------|
| Thread lifetime | Independent | Bounded by parent scope |
| Cancellation propagation | Manual | Automatic |
| Error handling | `try-catch` on `get()` | `throwIfFailed()` — clean |
| Thread leaks | Possible | Impossible |
| Observability | Flat thread dump | Hierarchical thread dump |
| Resource usage | Wasted work on failure | Cancelled immediately |
| Orphaned threads | Common | Impossible |

---

## Concept 7: Connecting to Java 21's Vision

### 🧠 Virtual threads + Structured concurrency = The future

Java 21's vision is clear:

1. **Virtual threads** — make threads cheap so you can create millions
2. **Structured concurrency** — make millions of threads manageable with clear lifecycles

Together, they enable a programming model where you can write straightforward, blocking code that:
- Scales to massive concurrency
- Has clear parent-child relationships
- Automatically cancels wasted work
- Never leaks threads

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    // These run on virtual threads — cheap to create
    var user = scope.fork(() -> callUserService());        // I/O
    var vehicle = scope.fork(() -> callVehicleService());   // I/O
    var payment = scope.fork(() -> callPaymentService());   // I/O

    scope.join();
    scope.throwIfFailed();

    return new Response(user.get(), vehicle.get(), payment.get());
}
```

This code creates 3 virtual threads, runs them concurrently, waits for all results, handles errors automatically, and guarantees no thread leaks. In just 10 lines.

---

## ✅ Key Takeaways

- Unstructured concurrency leads to orphaned threads, wasted work, and messy error handling
- **Structured concurrency** = child task lifetime is bounded by parent scope
- `StructuredTaskScope` provides automatic cleanup via try-with-resources
- `ShutdownOnFailure` — cancel all if any fails (need all results)
- `ShutdownOnSuccess` — cancel all once one succeeds (need any result)
- No thread leaks are possible — the scope guarantees all children finish
- Combined with virtual threads, structured concurrency is Java's modern approach to concurrent programming
