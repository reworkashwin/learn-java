# Callable and Future — Practical Example

## Introduction

In the previous note, we learned the theory behind `Callable` and `Future`. Now let's build a concrete example: a `Processor` class that implements `Callable`, runs in a thread pool, and returns results that we collect via `Future` objects.

---

## Concept 1: Creating a Callable Class

### 🧠 The Processor

Instead of implementing `Runnable` and overriding `run()`, we implement `Callable<String>` and override `call()`:

```java
import java.util.concurrent.Callable;

class Processor implements Callable<String> {
    private int id;

    public Processor(int id) {
        this.id = id;
    }

    @Override
    public String call() throws Exception {
        Thread.sleep(2000); // Simulate work
        return "ID " + id;
    }
}
```

### ❓ What's different from Runnable?

- The `call()` method **returns a value** — in this case, a `String`
- It **throws Exception** — so checked exceptions are allowed
- The generic type `Callable<String>` tells Java what type of result to expect

---

## Concept 2: Submitting Callables to an Executor

### ⚙️ How it works

We create a fixed thread pool, submit multiple `Processor` instances, and collect the `Future` objects:

```java
import java.util.concurrent.*;
import java.util.ArrayList;
import java.util.List;

public class App {
    public static void main(String[] args) {
        ExecutorService service = Executors.newFixedThreadPool(2);
        List<Future<String>> futures = new ArrayList<>();

        for (int i = 0; i < 5; i++) {
            Future<String> future = service.submit(new Processor(i + 1));
            futures.add(future);
        }
    }
}
```

### ⚠️ Common Mistake: Expecting Direct Results

You might expect `submit()` to return a `String` directly. It does **not**. It returns a `Future<String>`. You must call `get()` on each `Future` to retrieve the actual result.

---

## Concept 3: Retrieving Results from Future Objects

### ⚙️ Iterating and Getting Values

```java
for (Future<String> f : futures) {
    try {
        System.out.println(f.get()); // Blocks until result is available
    } catch (InterruptedException | ExecutionException e) {
        e.printStackTrace();
    }
}
```

### 🧪 What happens when you run this?

With **2 threads** and **5 tasks** (each sleeping 2 seconds):

```
ID 1    ← Thread 1 finishes
ID 2    ← Thread 2 finishes (both ran in parallel)
ID 3    ← Thread 1 picks up next task
ID 4    ← Thread 2 picks up next task
ID 5    ← One thread handles the last task
```

The pool has only 2 threads, so tasks run in pairs. Each pair takes ~2 seconds.

### 💡 Insight: How the Thread Pool Manages Work

With `newFixedThreadPool(2)`:
- Tasks 1 and 2 run simultaneously on 2 threads
- When either finishes, the thread picks up task 3
- This continues until all 5 tasks are done
- The 2 threads are **reused** — no new threads are created

---

## Concept 4: The Complete Flow

Here's the full picture of what happens step by step:

```
1. Create ExecutorService with 2 threads
2. Submit 5 Callable tasks → get 5 Future objects
3. Each Callable's call() sleeps 2s, then returns "ID <number>"
4. Iterate through futures, call get() on each
5. get() blocks until that specific task completes
6. Print each result as it becomes available
```

### ⚠️ Exception Handling

`Future.get()` can throw two exceptions:
- **`InterruptedException`** — if the current thread is interrupted while waiting
- **`ExecutionException`** — if the `Callable` threw an exception during execution

Always handle both:

```java
try {
    String result = future.get();
} catch (InterruptedException | ExecutionException e) {
    e.printStackTrace();
}
```

---

## Key Takeaways

✅ Implement `Callable<T>` instead of `Runnable` when you need a return value

✅ Use `submit()` to execute a `Callable` — it returns a `Future<T>`

✅ Collect `Future` objects in a list, then iterate and call `get()` to retrieve results

✅ `get()` blocks the calling thread until the result is ready

⚠️ Always handle both `InterruptedException` and `ExecutionException` when calling `get()`

💡 When to use `Runnable` vs `Callable`: if your task just *does something* → `Runnable`. If your task *computes something and returns it* → `Callable`
