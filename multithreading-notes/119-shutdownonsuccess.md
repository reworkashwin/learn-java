# ShutdownOnSuccess

## Introduction

In the previous lecture, we saw `ShutdownOnFailure` — cancel everything if any task fails. But what about the opposite pattern? Sometimes you have multiple services that can provide the **same value**, and you just want whichever responds **first**. This is `ShutdownOnSuccess` — take the first successful result and cancel the rest.

---

## Concept 1: The Use Case — Racing for the First Result

### 🧪 Scenario

Imagine you need the current temperature. Multiple weather services can provide it:

- Service A: responds in 1 second
- Service B: responds in 3 seconds
- Service C: responds in 5 seconds

You don't care **which** service responds — you just want the temperature. Once you get it from Service A, there's no reason to keep waiting for B and C.

This is the classic **racing pattern**: run multiple tasks in parallel, take the first winner, cancel the losers.

---

## Concept 2: Using ShutdownOnSuccess

### ⚙️ How to use it

```java
try (var scope = new StructuredTaskScope.ShutdownOnSuccess<String>()) {

    scope.fork(new LongProcess(1, "Result from Service A"));
    scope.fork(new LongProcess(5, "Result from Service B"));

    scope.join();

    // Get the first successful result
    String result = scope.result();
    System.out.println(result);
}
```

### ⚙️ What happens

```
t=0s → Both tasks start
t=1s → Service A returns "Result from Service A"
t=1s → scope cancels Service B immediately
t=1s → join() returns
t=1s → scope.result() returns "Result from Service A"
```

The moment **any** task succeeds, the scope:
1. Captures that result
2. **Cancels** all remaining tasks
3. Returns from `join()`

---

## Concept 3: `scope.result()` — Getting the Winner

### 🧠 What does it return?

`scope.result()` returns the value from the **first subtask that completed successfully**.

### ❓ Why can't we use `subtask.get()`?

Because we don't know in advance **which** subtask will finish first. Instead of checking individual subtasks, we ask the scope: "Give me whatever came back first."

### ⚠️ Handling exceptions

`scope.result()` throws `ExecutionException` if **no** task succeeded:

```java
try {
    String result = scope.result();
    System.out.println(result);
} catch (ExecutionException e) {
    System.out.println("No service returned a valid result");
}
```

---

## Concept 4: What If the First Task Fails?

### 🧪 Scenario: First fails, second succeeds

```java
scope.fork(new LongProcess(1, "Service A", true));   // fails after 1s
scope.fork(new LongProcess(5, "Service B", false));   // succeeds after 5s
```

The scope doesn't shut down on the **failure** of Service A — it only shuts down on **success**. So:

```
t=0s → Both tasks start
t=1s → Service A FAILS — scope keeps waiting
t=5s → Service B succeeds with "Service B"
t=5s → scope cancels remaining tasks (none left)
t=5s → result() returns "Service B"
```

The scope tolerates failures and keeps waiting for a success.

### 🧪 Scenario: All tasks fail

```java
scope.fork(new LongProcess(1, "Service A", true));   // fails
scope.fork(new LongProcess(5, "Service B", true));    // fails
```

```
t=0s → Both tasks start
t=1s → Service A fails
t=5s → Service B fails
t=5s → join() returns — no successes
       → result() throws ExecutionException
```

If no task produces a valid result, `result()` throws an exception.

---

## Concept 5: ShutdownOnFailure vs ShutdownOnSuccess

| Feature | ShutdownOnFailure | ShutdownOnSuccess |
|---------|------------------|-------------------|
| **Goal** | Need ALL results | Need ANY result |
| **Cancels on** | First failure | First success |
| **Use case** | Data aggregation | Service racing / fallback |
| **Result access** | Individual `subtask.get()` | `scope.result()` |
| **Error check** | `throwIfFailed()` | `result()` throws if none succeeded |

### 💡 Choosing the right strategy

- Need data from **every** service → `ShutdownOnFailure`
- Need data from **any** service → `ShutdownOnSuccess`
- Need all tasks to run regardless → Default `StructuredTaskScope`

---

## Summary

✅ **Key Takeaway:** Use `ShutdownOnSuccess` when multiple services can provide the same result and you want whichever responds first. The scope cancels all remaining tasks as soon as one succeeds.

⚠️ **Common Mistake:** Trying to access individual `Subtask` results with `ShutdownOnSuccess` — use `scope.result()` instead, since you don't know which task won.

💡 **Pro Tip:** `ShutdownOnSuccess` is powerful for implementing **fallback patterns** and **redundant service calls** — common requirements in distributed systems where reliability matters more than efficiency.
