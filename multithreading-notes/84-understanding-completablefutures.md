# Understanding CompletableFutures II

## Introduction

We've seen how to run tasks in virtual threads, but what if you need to **combine results** from multiple async operations? For example, fetching user data from one service and vehicle data from another, then merging them. This is where `CompletableFuture` shines — especially when paired with virtual threads.

---

## Concept 1: Combining Two CompletableFutures with `thenCombine()`

### 🧠 What is `thenCombine()`?

`thenCombine()` takes two independent `CompletableFuture`s and merges their results using a function you define.

### 🧪 Example: Concatenating two strings

```java
CompletableFuture.supplyAsync(() -> "Hello")
    .thenCombine(
        CompletableFuture.supplyAsync(() -> "World"),
        (s1, s2) -> s1 + " " + s2
    )
    .thenAccept(System.out::println);
```

Output: `Hello World`

### ⚙️ How it works — step by step

1. The first `supplyAsync` runs on a thread and produces `"Hello"`
2. `thenCombine` starts a second `supplyAsync` that produces `"World"`
3. When **both** are done, the combiner function `(s1, s2) -> s1 + " " + s2` runs
4. `thenAccept` consumes the final result

### 💡 Chaining further

You can keep chaining operations:

```java
CompletableFuture.supplyAsync(() -> "Hello")
    .thenCombine(
        CompletableFuture.supplyAsync(() -> "World"),
        (s1, s2) -> s1 + " " + s2
    )
    .thenApply(String::toUpperCase)
    .thenAccept(System.out::println);
```

Output: `HELLO WORLD`

The `thenApply` transforms the combined string to uppercase before it's printed.

---

## Concept 2: Real-World Example — Combining Service Results

### ❓ Why does this matter?

In microservice architectures, you often need to:
1. Call a **database** for user data
2. Call a **REST API** for additional data
3. **Combine** both results

These calls are independent — they can run in parallel.

### 🧪 Example with virtual threads

```java
try (var service = Executors.newVirtualThreadPerTaskExecutor()) {

    CompletableFuture<String> combined = CompletableFuture
        .supplyAsync(() -> dbQuery(), service)
        .thenCombine(
            CompletableFuture.supplyAsync(() -> restQuery(), service),
            (dbResult, restResult) -> dbResult + " " + restResult
        );

    String result = combined.join();
    System.out.println(result);
}
```

### ⚙️ What's happening

1. `supplyAsync(() -> dbQuery(), service)` — runs the DB query on a virtual thread
2. `supplyAsync(() -> restQuery(), service)` — runs the REST call on another virtual thread
3. Both execute **in parallel**
4. Once both complete, the combiner merges the results
5. `join()` blocks until the combined result is ready

If `dbQuery()` returns `"Adam"` and `restQuery()` returns `"23"`, the output is `Adam 23`.

---

## Concept 3: The `join()` Method

### 🧠 What does `join()` do?

`join()` waits for a `CompletableFuture` to finish and returns its result:

```java
String result = combined.join();
```

### ⚠️ Isn't blocking bad?

With **platform threads**, yes — `join()` blocks the underlying OS thread, wasting resources.

With **virtual threads**, blocking is essentially **free**. When a virtual thread calls `join()`, the JVM:
1. Unmounts it from the carrier thread
2. The carrier thread picks up other virtual threads
3. When the result is ready, the virtual thread resumes

This is why `CompletableFuture.join()` is perfectly fine with virtual threads — the question of blocking is no longer relevant.

---

## Concept 4: `thenAccept()` vs `thenApply()` vs `thenCombine()`

Here's a quick reference for the most common `CompletableFuture` methods:

| Method | Input | Output | Use case |
|--------|-------|--------|----------|
| `thenApply(fn)` | Result | Transformed result | Transform the value |
| `thenAccept(fn)` | Result | void | Consume the value (print, log) |
| `thenCombine(cf, fn)` | Two results | Combined result | Merge two futures |
| `supplyAsync(fn)` | — | Result | Start an async computation |

---

## Summary

✅ **Key Takeaway:** `thenCombine()` lets you run two `CompletableFuture`s in parallel and merge their results. When paired with virtual thread executors, blocking operations like `join()` become free — no OS threads are wasted.

⚠️ **Common Mistake:** Calling `join()` on platform threads in production code can cause thread starvation. With virtual threads, this concern disappears.

💡 **Pro Tip:** While `CompletableFuture` is powerful, Java 21 introduces **Structured Concurrency** (`StructuredTaskScope`) which provides a cleaner, more maintainable alternative with well-defined parent-child thread relationships. That's what we'll explore next.
