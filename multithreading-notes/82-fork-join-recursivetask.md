# Fork-Join Framework Simple Example — RecursiveTask\<T\>

## Introduction

We've seen `RecursiveAction` — a Fork-Join task that **doesn't return a value**. Now we meet its sibling: `RecursiveTask<T>` — a task that **returns a result**. This is what you use when your parallel computation produces a value, like computing a sum, finding a maximum, or counting elements. The pattern is identical to `RecursiveAction`, but with a return type.

---

## Concept 1: RecursiveAction vs RecursiveTask

### 🧠 What's the difference?

| Feature | RecursiveAction | RecursiveTask\<T\> |
|---------|----------------|-------------------|
| Return type | `void` | `T` (generic) |
| Method to implement | `compute()` | `compute()` returns `T` |
| Use case | Side effects (printing, modifying shared data) | Computing a result (sum, max, count) |
| Result retrieval | N/A | `task.join()` returns the result |

### 💡 When to use which

- Need to **transform or aggregate** data → `RecursiveTask<T>`
- Need to **perform actions** without returning a value → `RecursiveAction`

Most real-world Fork-Join problems use `RecursiveTask` because you typically want a result.

---

## Concept 2: Building a RecursiveTask — Sum Example

### ⚙️ The implementation

```java
import java.util.concurrent.RecursiveTask;

public class SimpleRecursiveTask extends RecursiveTask<Integer> {

    private int simulatedWork;

    public SimpleRecursiveTask(int simulatedWork) {
        this.simulatedWork = simulatedWork;
    }

    @Override
    protected Integer compute() {

        // Base case: task is small enough — solve directly
        if (simulatedWork > 100) {
            System.out.println("Splitting task: " + simulatedWork);

            SimpleRecursiveTask task1 =
                new SimpleRecursiveTask(simulatedWork / 2);
            SimpleRecursiveTask task2 =
                new SimpleRecursiveTask(simulatedWork / 2);

            // Fork both subtasks
            task1.fork();
            task2.fork();

            // Join results and combine
            int result = 0;
            result += task1.join();
            result += task2.join();

            return result;
        } else {
            System.out.println("Solving directly: " + simulatedWork);
            return 2 * simulatedWork;
        }
    }
}
```

### 🧠 The key additions over RecursiveAction

1. The class extends `RecursiveTask<Integer>` — note the generic type
2. `compute()` now **returns** `Integer` instead of being `void`
3. We call `task.join()` to get the **result** of each subtask
4. We combine the sub-results and return the final result

---

## Concept 3: fork() and join() in Detail

### ⚙️ The flow

```java
task1.fork();    // Submit task1 to the pool → runs asynchronously
task2.fork();    // Submit task2 to the pool → runs asynchronously

int r1 = task1.join();   // Block until task1 completes, get result
int r2 = task2.join();   // Block until task2 completes, get result
```

### 💡 Optimization: fork one, compute the other

Instead of forking **both** tasks, you can fork one and compute the other on the current thread:

```java
task1.fork();                    // Send task1 to another thread
int r2 = task2.compute();       // Compute task2 on THIS thread
int r1 = task1.join();          // Wait for task1's result

return r1 + r2;
```

Why? Because the current thread would otherwise do nothing while waiting. By computing `task2` directly, we avoid wasting a thread.

### ⚠️ Common Mistake: fork() then compute() order matters

```java
// CORRECT
task1.fork();
int r2 = task2.compute();   // Uses current thread
int r1 = task1.join();

// WRONG — deadlock risk on saturated pool
task1.fork();
int r1 = task1.join();      // Blocks current thread!
int r2 = task2.compute();   // Current thread is blocked above, task2 never executes
```

Always `fork()` first, then compute the other task, then `join()`.

---

## Concept 4: Running with ForkJoinPool

### 🧪 Main method

```java
import java.util.concurrent.ForkJoinPool;

public class App {
    public static void main(String[] args) {
        ForkJoinPool pool = new ForkJoinPool();

        SimpleRecursiveTask task = new SimpleRecursiveTask(500);
        Integer result = pool.invoke(task);

        System.out.println("Final result: " + result);
    }
}
```

### ⚙️ Execution trace (value = 500)

```
Splitting task: 500
  Splitting task: 250
    Splitting task: 125
      Solving directly: 62    → returns 124
      Solving directly: 62    → returns 124
    → returns 248
    Splitting task: 125
      Solving directly: 62    → returns 124
      Solving directly: 62    → returns 124
    → returns 248
  → returns 496
  ...
Final result: 992
```

### 🧠 invoke() vs fork() + join()

- `pool.invoke(task)` — submits the task and **waits for the result** (blocking)
- `task.fork()` + `task.join()` — submit asynchronously and retrieve later

`invoke()` is a convenience method that does both in one call. Use it for the initial task submission.

---

## Concept 5: Real-World Pattern — Parallel Sum

### 🧪 Summing an array with RecursiveTask

```java
public class SumTask extends RecursiveTask<Long> {

    private int[] array;
    private int low, high;
    private static final int THRESHOLD = 10_000;

    public SumTask(int[] array, int low, int high) {
        this.array = array;
        this.low = low;
        this.high = high;
    }

    @Override
    protected Long compute() {
        if (high - low <= THRESHOLD) {
            // Base case: sum directly
            long sum = 0;
            for (int i = low; i < high; i++) {
                sum += array[i];
            }
            return sum;
        }

        int mid = (low + high) / 2;
        SumTask left = new SumTask(array, low, mid);
        SumTask right = new SumTask(array, mid, high);

        left.fork();
        long rightResult = right.compute();
        long leftResult = left.join();

        return leftResult + rightResult;
    }
}
```

### 💡 The Threshold

The `THRESHOLD` constant determines when to stop splitting and solve sequentially. Too small → excessive overhead from creating tasks. Too large → not enough parallelism.

A typical rule of thumb: set the threshold so that each subtask processes roughly `N / (numProcessors * 4)` elements.

---

## ✅ Key Takeaways

- `RecursiveTask<T>` is for Fork-Join tasks that **return a value**
- `fork()` submits a task asynchronously; `join()` retrieves the result
- Optimization: `fork()` one task, `compute()` the other on the current thread to avoid wasting a thread
- `pool.invoke(task)` is a convenience method that submits and waits for the result
- Set a sensible threshold to balance parallelism vs. overhead
- Always `fork()` before calling `compute()` on the other task — not the other way around
