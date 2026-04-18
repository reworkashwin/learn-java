# Fork-Join Framework Simple Example — RecursiveAction

## Introduction

Time to see the Fork-Join framework in action. This section builds a simple example using `RecursiveAction` that demonstrates the core pattern: if a task is too large, **split it**; if it's small enough, **execute it directly**. This is the foundation for every Fork-Join application.

---

## Concept 1: The Three Key Methods

Before diving into code, understand the three methods that drive Fork-Join:

| Method | What it does | Blocking? |
|--------|-------------|-----------|
| `fork()` | Submits the task to the thread pool for async execution | No — returns immediately |
| `join()` | Waits for the task to complete and returns the result | Yes — blocks until done |
| `invokeAll()` | Forks all given tasks and waits for all to complete | Yes — blocks until all done |

The difference matters:
- `fork()` + `join()` = fine-grained control (you decide when to wait)
- `invokeAll()` = convenience method (fork everything, wait for everything)

---

## Concept 2: Building a RecursiveAction

### ⚙️ The Class Structure

```java
import java.util.concurrent.RecursiveAction;

public class SimpleRecursiveAction extends RecursiveAction {
    
    private int simulatedWork;
    
    public SimpleRecursiveAction(int simulatedWork) {
        this.simulatedWork = simulatedWork;
    }
    
    @Override
    protected void compute() {
        if (simulatedWork > 100) {
            // Task is too large — split it
            System.out.println("Parallel execution — splitting task...");
            
            SimpleRecursiveAction action1 = 
                new SimpleRecursiveAction(simulatedWork / 2);
            SimpleRecursiveAction action2 = 
                new SimpleRecursiveAction(simulatedWork / 2);
            
            invokeAll(action1, action2);
        } else {
            // Task is small enough — execute sequentially
            System.out.println("Sequential execution — task size: " + simulatedWork);
        }
    }
}
```

### 🧠 The Pattern

This `compute()` method follows the universal Fork-Join pattern:

1. **Check**: Is the task small enough to solve directly?
2. **If NO**: Split into subtasks and invoke them in parallel
3. **If YES**: Solve it sequentially

This is the same pattern we used in manual parallelization, but cleaner and more robust.

---

## Concept 3: Executing with ForkJoinPool

### ⚙️ The Main Method

```java
import java.util.concurrent.ForkJoinPool;

public class App {
    public static void main(String[] args) {
        ForkJoinPool pool = new ForkJoinPool();
        
        // Check available parallelism
        System.out.println(Runtime.getRuntime().availableProcessors());
        // Output: 16
        
        SimpleRecursiveAction action = new SimpleRecursiveAction(800);
        action.invoke();
    }
}
```

### ⚙️ What happens with value 800?

```
800 > 100 → split into 400 and 400
  400 > 100 → split into 200 and 200
    200 > 100 → split into 100 and 100
      100 ≤ 100 → sequential execution (size: 100)
      100 ≤ 100 → sequential execution (size: 100)
    200 > 100 → split into 100 and 100
      100 ≤ 100 → sequential execution (size: 100)
      100 ≤ 100 → sequential execution (size: 100)
  400 > 100 → split into 200 and 200
    (mirrors the left side)
```

Result: **8 sequential tasks** of size 100 each. 8 × 100 = 800 ✓

### 💡 Insight

The framework automatically creates a tree of tasks. Each split doubles the number of tasks. With a threshold of 100 and starting value of 800, we get $800/100 = 8$ leaf tasks — all executed in parallel across available threads.

---

## Concept 4: invokeAll vs. fork/join

### Option 1: Using invokeAll (simpler)

```java
invokeAll(action1, action2);
```

This single method call:
1. Forks both actions (submits them to the pool)
2. Waits for **both** to complete
3. Returns when all are done

### Option 2: Using fork/join (more control)

```java
action1.fork();  // submit to pool — non-blocking
action2.fork();  // submit to pool — non-blocking

action1.join();  // wait for action1 to finish
action2.join();  // wait for action2 to finish
```

Both approaches produce the **same result**. Use `invokeAll` for simplicity when you don't need intermediate results. Use `fork`/`join` when you need to do work between forking and joining, or when you need to handle results from `RecursiveTask`.

---

## Concept 5: The ForkJoinPool Details

### 🧠 Default Thread Count

```java
ForkJoinPool pool = new ForkJoinPool();
// Parallelism = Runtime.getRuntime().availableProcessors()
```

The no-argument constructor automatically uses as many threads as CPU cores. You can also specify a custom parallelism level:

```java
ForkJoinPool pool = new ForkJoinPool(4);  // use only 4 threads
```

### ⚙️ How Tasks Are Distributed

The pool maintains a fixed number of threads. When you call `invoke()` or `invokeAll()`:

1. Tasks are placed in thread queues
2. Threads pick up tasks from their own queues
3. Idle threads **steal** tasks from busy threads' queues
4. This continues until all tasks are complete

### 💡 Pro Tip

`RecursiveAction` is for tasks that **don't return values** (like printing, modifying shared state, or side-effect operations). For tasks that **compute and return values** (like summing, finding max/min), use `RecursiveTask<T>` instead.

---

## Concept 6: Choosing the Right Threshold

### ❓ How do you decide when to stop splitting?

The threshold (100 in our example) is a tuning parameter:

- **Too high**: not enough parallelism, threads sit idle
- **Too low**: too many tasks, overhead from task management dominates
- **Just right**: enough tasks to keep all threads busy without excessive overhead

### 💡 Rules of Thumb

- For computation-heavy tasks: threshold ≈ N / (number of processors × 2–4)
- For simple tasks: threshold can be larger
- When in doubt, benchmark with different values

⚠️ **Common Mistake**: Setting the threshold to 1 (splitting until single elements). This creates massive overhead from millions of tiny tasks. The sequential fallback exists for a reason — let it handle small chunks efficiently.

---

## Summary

✅ `RecursiveAction` is for parallel tasks that **don't return a value**

✅ The `compute()` method follows the pattern: check size → split if large → execute if small

✅ `invokeAll(action1, action2)` forks both tasks and waits for completion

✅ `fork()` + `join()` gives more fine-grained control over async execution

✅ `ForkJoinPool` defaults to using as many threads as available processor cores

⚠️ Choose the splitting threshold carefully — too low creates excessive overhead, too high limits parallelism

💡 For tasks that need to return a value, use `RecursiveTask<T>` instead of `RecursiveAction`
