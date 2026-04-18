# ShutdownOnFailure

## Introduction

In the previous lecture, we used the default `StructuredTaskScope` which waits for **all** child threads to finish — even if one of them fails. But what if you need **all** results to proceed? If one task fails, waiting for the others is wasted time. This is exactly what `ShutdownOnFailure` solves.

---

## Concept 1: The Problem with Waiting for Everything

### 🧪 Scenario

Imagine two tasks:
- Task 1: takes 1 second, **fails** with an exception
- Task 2: takes 7 seconds, succeeds

With default `StructuredTaskScope`:

```
t=0s  → Both tasks start
t=1s  → Task 1 FAILS
t=7s  → Task 2 finishes
t=7s  → join() returns — you waited 6 extra seconds for nothing
```

If you need **both** results to do meaningful work (e.g., combining data from two microservices), those 6 extra seconds are completely wasted. You already know at `t=1s` that the final computation is impossible.

---

## Concept 2: Using ShutdownOnFailure

### ⚙️ How it works

Replace `StructuredTaskScope` with `StructuredTaskScope.ShutdownOnFailure`:

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {

    Subtask<String> result1 = scope.fork(new LongProcessFail(1, "Result One", true));  // will fail
    Subtask<String> result2 = scope.fork(new LongProcessFail(7, "Result Two", false)); // would succeed

    scope.join();

    // Throws if ANY child task failed
    scope.throwIfFailed();

    // Only reached if ALL tasks succeeded
    System.out.println(result1.get() + " " + result2.get());
}
```

### ⚙️ What happens when a task fails

```
t=0s  → Both tasks start
t=1s  → Task 1 FAILS → scope immediately cancels Task 2
t=1s  → join() returns (no 6-second wait!)
t=1s  → throwIfFailed() propagates the exception
```

The moment **any** child thread fails, the scope:
1. **Cancels** all remaining child threads
2. **Returns** from `join()` immediately
3. **Propagates** the exception via `throwIfFailed()`

### 💡 Insight

This is a huge improvement. Instead of waiting the full 7 seconds, you know about the failure in 1 second and can handle it immediately.

---

## Concept 3: `throwIfFailed()` — The Error Gate

### 🧠 What does it do?

`scope.throwIfFailed()` checks if any forked task threw an exception:

- If **no failures** → does nothing, execution continues
- If **any failure** → throws an `ExecutionException` wrapping the original exception

### 🧪 Handling the failure

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<String> result1 = scope.fork(task1);
    Subtask<String> result2 = scope.fork(task2);

    scope.join();

    try {
        scope.throwIfFailed();
        System.out.println(result1.get() + " " + result2.get());
    } catch (ExecutionException e) {
        System.out.println("Terminating — a child thread failed");
    }
}
```

---

## Concept 4: When All Tasks Succeed

If no failures occur, `ShutdownOnFailure` behaves exactly like the default scope — it waits for all tasks to finish, then you can safely access all results:

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<String> result1 = scope.fork(new LongProcess(1, "Hello"));
    Subtask<String> result2 = scope.fork(new LongProcess(3, "World"));

    scope.join();
    scope.throwIfFailed();

    // Both succeeded — safe to combine
    System.out.println(result1.get() + " " + result2.get());  // "Hello World"
}
```

---

## Concept 5: Why This Matters — The Microservice Use Case

### 🧪 Real-world scenario

```
Digital Key Service
    ├── GET /users/123  → User Service (takes 2s)
    └── GET /vehicles/456 → Vehicle Service (takes 5s)
```

If the User Service is **down** and responds with an error in 100ms, there's no point waiting 5 seconds for vehicle data. You need **both** pieces of data.

With `ShutdownOnFailure`:
- User Service fails → Vehicle Service call is cancelled immediately
- You can return an error to the client in 100ms instead of 5s

### 💡 Why unstructured concurrency can't do this

With unstructured concurrency:
- You `submit()` both tasks to an executor
- There's **no parent-child relationship**
- A failing task can't tell the parent to cancel siblings
- You have no mechanism to cancel other running tasks automatically

Structured concurrency makes this trivial because relationships are explicitly defined.

---

## Summary

| Scenario | Default Scope | ShutdownOnFailure |
|----------|--------------|-------------------|
| All succeed | Waits for all | Waits for all |
| One fails | Still waits for all | Cancels others immediately |
| Use case | Need partial results | Need ALL results |

✅ **Key Takeaway:** Use `ShutdownOnFailure` when you need **all** subtask results. If any single task fails, there's no point continuing — the scope cancels remaining tasks and fails fast.

⚠️ **Common Mistake:** Forgetting to call `throwIfFailed()` after `join()`. Without it, you won't know about failures and `get()` will throw an unexpected `IllegalStateException`.

💡 **Pro Tip:** `ShutdownOnFailure` is ideal for microservice fan-out patterns where you need to aggregate data from multiple services and missing any one result makes the entire operation invalid.
