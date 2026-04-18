# Dining Philosophers Problem — Running the Simulation

## Introduction

We've built all the pieces: the `Chopstick` class, the `Philosopher` class with its states, the `Constants`, and the `App` class that wires everything together. Now it's time to **run the simulation** and observe how the philosophers behave. We'll see them thinking, eating, and — if we're not careful — deadlocking.

---

## Concept 1: The Complete Application

### ⚙️ Bringing it all together

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class App {
    public static void main(String[] args) throws InterruptedException {

        Philosopher[] philosophers = new Philosopher[Constants.NUMBER_OF_PHILOSOPHERS];
        Chopstick[] chopsticks = new Chopstick[Constants.NUMBER_OF_CHOPSTICKS];

        // Create chopsticks
        for (int i = 0; i < Constants.NUMBER_OF_CHOPSTICKS; i++) {
            chopsticks[i] = new Chopstick(i);
        }

        // Create an executor with enough threads for all philosophers
        ExecutorService executorService = Executors.newFixedThreadPool(
            Constants.NUMBER_OF_PHILOSOPHERS
        );

        // Create and start philosophers
        for (int i = 0; i < Constants.NUMBER_OF_PHILOSOPHERS; i++) {
            philosophers[i] = new Philosopher(i,
                chopsticks[i],                                            // left
                chopsticks[(i + 1) % Constants.NUMBER_OF_PHILOSOPHERS]    // right
            );
            executorService.execute(philosophers[i]);
        }

        // Let the simulation run for some time
        Thread.sleep(Constants.SIMULATION_RUNNING_TIME);

        // Stop all philosophers
        for (Philosopher philosopher : philosophers) {
            philosopher.setFull(true);  // Signal each philosopher to stop
        }

        executorService.shutdown();

        // Print results
        for (Philosopher philosopher : philosophers) {
            System.out.println(philosopher);
        }
    }
}
```

---

## Concept 2: What Happens During Execution

### 🧪 Expected output (sample)

```
Philosopher 0 is THINKING...
Philosopher 1 is THINKING...
Philosopher 2 is THINKING...
Philosopher 3 is THINKING...
Philosopher 4 is THINKING...
Philosopher 0 picked up left chopstick (0)
Philosopher 0 picked up right chopstick (1)
Philosopher 0 is EATING...
Philosopher 2 picked up left chopstick (2)
Philosopher 2 picked up right chopstick (3)
Philosopher 2 is EATING...
Philosopher 0 put down chopsticks. Eating count: 1
Philosopher 4 picked up left chopstick (4)
Philosopher 4 picked up right chopstick (0)
Philosopher 4 is EATING...
...
```

### 🧠 Key observations

1. **At most 2 philosophers** can eat simultaneously (5 chopsticks, 2 per philosopher)
2. Adjacent philosophers **never eat at the same time** (they share a chopstick)
3. The output order is **non-deterministic** — each run produces different results
4. Philosophers alternate between **thinking** and **eating**

---

## Concept 3: The Deadlock Danger

### ❓ What if every philosopher picks up their left chopstick first?

```
P0 picks up C0 ✅
P1 picks up C1 ✅
P2 picks up C2 ✅
P3 picks up C3 ✅
P4 picks up C4 ✅

All philosophers hold one chopstick, all need one more → DEADLOCK
```

The simulation **hangs**. No philosopher can eat. No output is produced after the initial pickup.

### ⚙️ How our solution avoids deadlock

The classic solution (used in our implementation) is to break the circular wait condition. One common approach:

**Make the last philosopher pick up chopsticks in reverse order:**

```java
for (int i = 0; i < Constants.NUMBER_OF_PHILOSOPHERS; i++) {
    if (i == Constants.NUMBER_OF_PHILOSOPHERS - 1) {
        // Last philosopher picks up RIGHT first, then LEFT
        philosophers[i] = new Philosopher(i, chopsticks[0], chopsticks[i]);
    } else {
        // Others pick up LEFT first, then RIGHT
        philosophers[i] = new Philosopher(i, chopsticks[i], chopsticks[i + 1]);
    }
}
```

By reversing the order for one philosopher, the **circular wait** condition is broken. At least one philosopher will always be able to acquire both chopsticks.

---

## Concept 4: Analyzing the Results

### ⚙️ Fair eating distribution

After the simulation runs for `SIMULATION_RUNNING_TIME` milliseconds, we print how many times each philosopher ate:

```
Philosopher 0 ate 15 times
Philosopher 1 ate 14 times
Philosopher 2 ate 16 times
Philosopher 3 ate 14 times
Philosopher 4 ate 15 times
```

### ❓ Is it fair?

With a correct solution, all philosophers should eat roughly the **same number of times**. Large disparities indicate **starvation** — one philosopher consistently losing the competition for chopsticks.

### 💡 Insight

The eating counts help us verify:
- **No deadlock** — all philosophers ate at least once
- **No starvation** — all philosophers ate a similar number of times
- **Correctness** — the solution properly manages shared resources

---

## Concept 5: Lessons from the Simulation

### 🧠 What does this teach us about real-world concurrency?

| Dining Philosophers | Real-World Equivalent |
|---|---|
| Philosophers | Threads / processes |
| Chopsticks | Shared resources (DB connections, file handles, locks) |
| Eating | Critical section (using the resource) |
| Thinking | Non-critical work (computation, waiting) |
| Deadlock | All threads waiting for each other's resources |

### ⚙️ Key strategies demonstrated

1. **Resource ordering** — acquire resources in a consistent order to prevent circular wait
2. **Thread pools** — use `ExecutorService` instead of raw `Thread` creation
3. **Graceful shutdown** — signal threads to stop, then shut down the executor
4. **Monitoring** — collect metrics (eating count) to verify correctness

### 💡 Pro Tip

The Dining Philosophers problem is a **classic interview question**. Understanding it demonstrates knowledge of:
- Deadlock conditions and prevention
- Shared resource management
- Thread-safe design
- Testing concurrent systems

---

## Summary

✅ **Key Takeaways:**

- The simulation creates 5 philosophers and 5 chopsticks, connected in a circle using the modulo trick
- An `ExecutorService` manages the philosopher threads
- The simulation runs for a fixed duration, then signals philosophers to stop
- Deadlock is avoided by breaking the circular wait (e.g., reversing one philosopher's pickup order)
- Results show eating counts — roughly equal counts confirm fairness (no starvation)
- The problem maps directly to real-world resource competition in multi-threaded systems

⚠️ **Common Mistake:** Running the simulation without a deadlock prevention strategy. The naive solution (everyone picks up left first) **will** deadlock eventually — it's just a matter of time and luck.
