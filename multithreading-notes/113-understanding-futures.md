# Understanding Futures

## Introduction

Before we can understand `CompletableFuture`, we need to understand its predecessor: the `Future` interface. Introduced in Java 5, `Future` represents a **result that will be available at some point in the future**. You submit a task to an executor, get back a `Future`, and later retrieve the result. It's the foundation of asynchronous programming in Java — and understanding its limitations explains why `CompletableFuture` was created.

---

## Concept 1: What Is a Future?

### 🧠 The concept

A `Future<T>` is a **placeholder** for a result that hasn't been computed yet. You submit a `Callable<T>` to an `ExecutorService`, and it returns a `Future<T>`. The computation happens on another thread while you continue doing other work. When you need the result, you call `future.get()`.

### 💡 Real-World Analogy

Ordering food at a restaurant:
1. You place your order (submit the task)
2. You get a **receipt number** (the `Future`)
3. You sit down and do other things (the main thread continues)
4. When your food is ready, you pick it up with your receipt (call `get()`)

### ⚙️ The interface

```java
public interface Future<V> {
    boolean cancel(boolean mayInterruptIfRunning);
    boolean isCancelled();
    boolean isDone();
    V get() throws InterruptedException, ExecutionException;
    V get(long timeout, TimeUnit unit) throws InterruptedException,
            ExecutionException, TimeoutException;
}
```

---

## Concept 2: Using Futures — Basic Example

### 🧪 Submitting a task and retrieving the result

```java
ExecutorService executor = Executors.newSingleThreadExecutor();

Future<Integer> future = executor.submit(() -> {
    Thread.sleep(2000);  // Simulate long computation
    return 42;
});

System.out.println("Task submitted, doing other work...");

// Do other work while the computation runs...
doSomethingElse();

// Now retrieve the result (blocks if not yet complete)
Integer result = future.get();
System.out.println("Result: " + result);  // Result: 42

executor.shutdown();
```

### ⚙️ Step-by-step

1. `executor.submit(callable)` — starts the computation on a thread pool thread
2. Returns a `Future<Integer>` immediately — the main thread continues
3. `future.get()` — blocks **until the result is ready**, then returns it

---

## Concept 3: Checking Task Status

### ⚙️ isDone() and isCancelled()

```java
Future<String> future = executor.submit(() -> {
    Thread.sleep(3000);
    return "Hello";
});

System.out.println(future.isDone());       // false — still running
System.out.println(future.isCancelled());  // false — not cancelled

Thread.sleep(4000);

System.out.println(future.isDone());       // true — computation finished
```

### ⚙️ Cancelling a task

```java
Future<String> future = executor.submit(() -> {
    Thread.sleep(10000);
    return "Done";
});

// Cancel after 1 second
Thread.sleep(1000);
boolean cancelled = future.cancel(true);  // true = interrupt the thread

System.out.println(cancelled);              // true
System.out.println(future.isCancelled());   // true
System.out.println(future.isDone());        // true (cancelled counts as done)

future.get();  // CancellationException!
```

### ⚠️ Note

`cancel(true)` sends an interrupt to the running thread. The task must check `Thread.interrupted()` or catch `InterruptedException` to actually stop. If the task ignores interrupts, it keeps running.

---

## Concept 4: get() with Timeout

### ⚙️ Avoiding infinite waits

`get()` without a timeout blocks **forever** until the result is available. This is dangerous — the task might hang, deadlock, or take unreasonably long.

Use `get(timeout, unit)` instead:

```java
try {
    String result = future.get(5, TimeUnit.SECONDS);
    System.out.println(result);
} catch (TimeoutException e) {
    System.out.println("Task took too long!");
    future.cancel(true);
}
```

If the result isn't available within 5 seconds, a `TimeoutException` is thrown and you can cancel the task.

---

## Concept 5: Limitations of Future

### ⚠️ Why Future isn't enough

The `Future` interface has significant limitations that make it painful for complex async workflows:

### 1. **Blocking get()**

To retrieve the result, you must call `get()` — which **blocks the calling thread**. This defeats the purpose of async programming:

```java
// This blocks — we're back to synchronous!
Integer result = future.get();
```

### 2. **No chaining**

You can't say "when this future completes, do X":

```java
// IMPOSSIBLE with Future
future.thenApply(result -> result * 2);  // Doesn't exist!
```

### 3. **No combining**

You can't combine two futures:

```java
// IMPOSSIBLE with Future
future1.thenCombine(future2, (a, b) -> a + b);  // Doesn't exist!
```

### 4. **No manual completion**

You can't manually set a future's result:

```java
// IMPOSSIBLE with Future
future.complete(42);  // Doesn't exist!
```

### 5. **No exception handling**

There's no way to handle exceptions in the async pipeline:

```java
// IMPOSSIBLE with Future
future.exceptionally(ex -> defaultValue);  // Doesn't exist!
```

### 💡 Insight

`Future` gives you a way to **fire and forget** a task and **later retrieve** its result. But that's all. For anything more sophisticated — chaining, combining, error handling, callbacks — you need `CompletableFuture`.

---

## Concept 6: Future vs CompletableFuture — Preview

### ⚙️ What CompletableFuture adds

| Feature | Future | CompletableFuture |
|---------|--------|-------------------|
| Get result | `get()` (blocking) | `get()`, `join()`, callbacks |
| Chain operations | ❌ | `thenApply()`, `thenAccept()` |
| Combine results | ❌ | `thenCombine()`, `allOf()` |
| Handle errors | try-catch on `get()` | `exceptionally()`, `handle()` |
| Manual completion | ❌ | `complete()`, `completeExceptionally()` |
| Non-blocking callback | ❌ | `thenAcceptAsync()` |

`CompletableFuture` is everything `Future` should have been — and it's what we'll explore next.

---

## ✅ Key Takeaways

- `Future<T>` represents a result that will be available later
- `executor.submit(callable)` returns a `Future` immediately
- `future.get()` blocks until the result is ready — use `get(timeout, unit)` to avoid infinite waits
- `isDone()` checks completion; `cancel()` attempts to stop the task
- Future's critical limitation: **no chaining, combining, or callbacks**
- `get()` is blocking — making `Future` fundamentally synchronous when you need the result
- `CompletableFuture` was created to solve all of Future's limitations
