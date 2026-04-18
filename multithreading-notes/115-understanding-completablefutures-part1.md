# Understanding CompletableFutures I

## Introduction

We've seen that `Future` has a fundamental problem: to get the result, you must **block**. `CompletableFuture`, introduced in Java 8, solves this by allowing you to **chain operations**, **handle errors**, and **compose async tasks** — all without blocking. It's the tool that makes truly asynchronous programming possible in Java, and it pairs beautifully with virtual threads in Java 21.

---

## Concept 1: What Is CompletableFuture?

### 🧠 The big idea

`CompletableFuture<T>` is a `Future` that you can:
- **Complete manually** — set its value programmatically
- **Chain** — attach follow-up operations that run when the future completes
- **Compose** — combine multiple futures
- **Handle errors** — without try-catch blocks

It implements both `Future<T>` and `CompletionStage<T>` — giving it all of `Future`'s functionality plus a fluent API for async composition.

### 💡 Real-World Analogy

`Future` is like ordering food and standing at the counter waiting. `CompletableFuture` is like ordering food and saying: "When it's ready, bring it to my table, and also bring a drink."

You describe the **entire workflow upfront** — the system handles execution and timing.

---

## Concept 2: Creating CompletableFutures

### ⚙️ Method 1: supplyAsync() — with a return value

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    // Runs on a thread from ForkJoinPool.commonPool()
    Thread.sleep(2000);
    return "Hello from async!";
});
```

`supplyAsync()` takes a `Supplier<T>` — a function that **returns a value** — and runs it asynchronously.

### ⚙️ Method 2: runAsync() — without a return value

```java
CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
    // Runs on a thread from ForkJoinPool.commonPool()
    System.out.println("Side effect task");
});
```

`runAsync()` takes a `Runnable` — for fire-and-forget tasks.

### ⚙️ Method 3: Using a custom executor

```java
ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor();

CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    return fetchDataFromAPI();
}, exec);  // Runs on virtual threads instead of ForkJoinPool
```

---

## Concept 3: Chaining Operations

### 🧠 Why chaining matters

With `Future`, you'd write:

```java
Future<String> future = executor.submit(() -> fetchData());
String data = future.get();           // BLOCKS
String processed = process(data);     // Sequential
save(processed);                      // Sequential
```

With `CompletableFuture`:

```java
CompletableFuture.supplyAsync(() -> fetchData())
    .thenApply(data -> process(data))     // Runs when fetchData() completes
    .thenAccept(result -> save(result));   // Runs when process() completes
```

No blocking. Each step runs **automatically** when the previous one finishes.

### ⚙️ The three core chaining methods

| Method | Input | Output | Use case |
|--------|-------|--------|----------|
| `thenApply(fn)` | `T → U` | `CompletableFuture<U>` | Transform the result |
| `thenAccept(fn)` | `T → void` | `CompletableFuture<Void>` | Consume the result |
| `thenRun(fn)` | `() → void` | `CompletableFuture<Void>` | Run an action (ignores result) |

### 🧪 Example: Transform a result

```java
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> "hello")
    .thenApply(s -> s + " world")
    .thenApply(String::toUpperCase);

System.out.println(future.join());  // HELLO WORLD
```

### 🧪 Example: Consume the result

```java
CompletableFuture.supplyAsync(() -> "hello world")
    .thenAccept(System.out::println);  // Prints: hello world
```

### 🧪 Example: Run an action after completion

```java
CompletableFuture.supplyAsync(() -> doExpensiveWork())
    .thenRun(() -> System.out.println("Work complete!"));
```

---

## Concept 4: Async Variants

### 🧠 thenApply() vs thenApplyAsync()

By default, the chained operation runs on the **same thread** that completed the previous stage:

```java
// thenApply — runs on the same thread as supplyAsync
.thenApply(data -> process(data))

// thenApplyAsync — runs on a DIFFERENT thread
.thenApplyAsync(data -> process(data))

// thenApplyAsync with custom executor
.thenApplyAsync(data -> process(data), myExecutor)
```

### ❓ When to use the async variant?

- `thenApply()` — when the transformation is **fast** (parsing, formatting)
- `thenApplyAsync()` — when the transformation is **slow or blocking** (another I/O call)

---

## Concept 5: Error Handling

### ⚙️ exceptionally() — handle errors with a fallback

```java
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> {
        if (true) throw new RuntimeException("Service down!");
        return "data";
    })
    .exceptionally(ex -> {
        System.out.println("Error: " + ex.getMessage());
        return "default value";
    });

System.out.println(future.join());  // "default value"
```

### ⚙️ handle() — handle both success and failure

```java
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> fetchData())
    .handle((result, exception) -> {
        if (exception != null) {
            return "fallback";
        }
        return result.toUpperCase();
    });
```

`handle()` receives **both** the result and the exception — exactly one will be null.

### ⚙️ whenComplete() — observe without transforming

```java
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> fetchData())
    .whenComplete((result, exception) -> {
        if (exception != null) {
            log.error("Failed", exception);
        } else {
            log.info("Got: " + result);
        }
    });
// The future still contains the original result (or exception)
```

---

## Concept 6: get() vs join()

### ⚙️ Both block, but handle exceptions differently

| Method | Checked exceptions? | Use case |
|--------|---------------------|----------|
| `get()` | Yes — throws `ExecutionException`, `InterruptedException` | When you need checked exception handling |
| `join()` | No — throws `CompletionException` (unchecked) | Cleaner code, especially in streams/lambdas |

```java
// get() — must handle checked exceptions
try {
    String result = future.get();
} catch (InterruptedException | ExecutionException e) {
    // handle
}

// join() — cleaner
String result = future.join();  // Throws unchecked CompletionException
```

### 💡 Prefer `join()` in most cases — it's more concise and works better with lambda chains.

---

## ✅ Key Takeaways

- `CompletableFuture` lets you chain async operations without blocking: `supplyAsync → thenApply → thenAccept`
- `supplyAsync()` runs a task that returns a value; `runAsync()` runs a void task
- `thenApply()` transforms; `thenAccept()` consumes; `thenRun()` fires and forgets
- Use `thenApplyAsync()` when the chained operation is itself expensive or blocking
- Error handling: `exceptionally()` for fallbacks, `handle()` for both success/failure
- Prefer `join()` over `get()` — avoids checked exceptions
- `CompletableFuture` is the foundation for modern async Java programming
