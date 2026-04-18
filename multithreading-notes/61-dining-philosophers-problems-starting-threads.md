# Dining Philosophers Problem — Starting the Threads

## Introduction

Now that we have the `Philosopher`, `Chopstick`, `Constants`, and `State` classes, it's time to wire everything together in the `App` class. This is where we create the thread pool, assign chopsticks to philosophers using modular arithmetic, and run the simulation.

---

## Concept 1: Setting Up the Arrays

### ⚙️ Creating Chopsticks and Philosophers

```java
public static void main(String[] args) throws InterruptedException {

    ExecutorService executorService = null;
    Philosopher[] philosophers = null;

    try {
        philosophers = new Philosopher[Constants.NUMBER_OF_PHILOSOPHERS];
        Chopstick[] chopsticks = new Chopstick[Constants.NUMBER_OF_CHOPSTICKS];

        // Initialize chopsticks with IDs 0-4
        for (int i = 0; i < Constants.NUMBER_OF_CHOPSTICKS; i++) {
            chopsticks[i] = new Chopstick(i);
        }
```

We create arrays for both — 5 chopsticks (indexed 0–4) and 5 philosophers (indexed 0–4).

---

## Concept 2: The Modulo Trick — Assigning Chopsticks

### 🧠 The Circular Table Problem

Here's the crucial part — how do we assign left and right chopsticks to each philosopher?

```java
for (int i = 0; i < Constants.NUMBER_OF_PHILOSOPHERS; i++) {
    philosophers[i] = new Philosopher(i, 
        chopsticks[i],                                        // left chopstick
        chopsticks[(i + 1) % Constants.NUMBER_OF_PHILOSOPHERS] // right chopstick
    );
    executorService.execute(philosophers[i]);
}
```

### ❓ Why the Modulo Operator `%`?

The philosophers sit in a **circle**. Each philosopher's left chopstick has the same index as the philosopher, and the right chopstick has index `i + 1`. But what happens at the end?

| Philosopher | Left Chopstick | Right Chopstick | `(i+1) % 5` |
|:-----------:|:--------------:|:---------------:|:------------:|
| P0 | C0 | C1 | `(0+1) % 5 = 1` |
| P1 | C1 | C2 | `(1+1) % 5 = 2` |
| P2 | C2 | C3 | `(2+1) % 5 = 3` |
| P3 | C3 | C4 | `(3+1) % 5 = 4` |
| P4 | C4 | **C0** | `(4+1) % 5 = 0` ← wraps around! |

Without the modulo, P4 would try to access `chopsticks[5]` — an `ArrayIndexOutOfBoundsException`. The modulo wraps it back to `0`, correctly modeling the circular table.

### 💡 Real-World Analogy

This is the same math used in circular buffers, ring buffers, and round-robin schedulers. Any time you need to "wrap around" an array, modulo is the answer.

---

## Concept 3: Creating the Thread Pool

### ⚙️ Fixed Thread Pool

```java
executorService = Executors.newFixedThreadPool(Constants.NUMBER_OF_PHILOSOPHERS);
```

We create exactly as many threads as we have philosophers — each philosopher runs on its own thread. The `ExecutorService` manages the thread lifecycle for us.

### ⚙️ Starting Each Philosopher

```java
executorService.execute(philosophers[i]);
```

Because `Philosopher` implements `Runnable`, we can pass it directly to `execute()`. This starts the philosopher's `run()` method on a thread from the pool.

---

## Concept 4: Running and Shutting Down the Simulation

### ⚙️ The Simulation Lifecycle

```java
        // Let the simulation run for the defined time
        Thread.sleep(Constants.SIMULATION_RUNNING_TIME);

        // Tell all philosophers to stop
        for (Philosopher philosopher : philosophers) {
            philosopher.setFull(true);
        }

    } finally {
        // Shut down the executor
        executorService.shutdown();

        // Wait for all threads to finish
        while (!executorService.isTerminated()) {
            Thread.sleep(1000);
        }

        // Print results
        for (Philosopher philosopher : philosophers) {
            System.out.println(philosopher + " ate " + philosopher.getEatingCounter() + " times");
        }
    }
}
```

### ⚙️ Step-by-Step Shutdown

1. **`Thread.sleep(SIMULATION_RUNNING_TIME)`** — Let the simulation run for 5 seconds
2. **`setFull(true)`** — Signal each philosopher to stop (the `while (!full)` loop exits)
3. **`executorService.shutdown()`** — Stop accepting new tasks
4. **Wait for termination** — Poll every second until all threads have finished
5. **Print eating counters** — Verify no philosopher starved

### 💡 Why `finally`?

The `finally` block ensures the `ExecutorService` is shut down even if an exception occurs during the simulation. Failing to shut down an executor can leave threads running indefinitely.

---

## Concept 5: Expected Output

Running the simulation produces output like:

```
Philosopher 0 is thinking...
Philosopher 2 is thinking...
Philosopher 1 picked up LEFT Chopstick 1
Philosopher 1 picked up RIGHT Chopstick 2
Philosopher 1 is eating...
Philosopher 3 picked up LEFT Chopstick 3
...
Philosopher 0 ate 4 times
Philosopher 1 ate 5 times
Philosopher 2 ate 3 times
Philosopher 3 ate 4 times
Philosopher 4 ate 5 times
```

If the eating counts are roughly balanced, the simulation is fair — no philosopher is starving.

⚠️ If you replace `tryLock()` with `lock()` in the `Chopstick` class, the program will likely **deadlock** — philosophers block forever, no output, and the process hangs.

---

## Summary

✅ Use `(i + 1) % N` to model circular resource assignment — this prevents `ArrayIndexOutOfBoundsException` and correctly wraps the last philosopher back to chopstick 0

✅ A fixed thread pool with one thread per philosopher ensures each philosopher runs concurrently

✅ Graceful shutdown: set `full = true` → `shutdown()` → wait for termination → print results

⚠️ Always shut down `ExecutorService` in a `finally` block to prevent thread leaks

💡 The eating counter at the end is your **starvation detector** — if any philosopher's count is 0 or significantly lower, the system has a fairness problem
