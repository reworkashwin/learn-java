# Dining Philosophers Problem — Philosopher Implementation

## Introduction

The `Philosopher` class is the **thread** in our simulation. Each philosopher is an independent thread that repeatedly thinks and eats. The interesting part is the eating procedure — the philosopher must acquire **two shared resources** (chopsticks) in sequence, and this is where deadlock prevention logic lives.

---

## Concept 1: Class Structure

### 🧠 What Does a Philosopher Have?

Each philosopher needs:

```java
public class Philosopher implements Runnable {

    private int id;
    private volatile boolean full;     // Controls when the thread stops
    private Chopstick leftChopstick;
    private Chopstick rightChopstick;
    private Random random;
    private int eatingCounter;         // Tracks how many times this philosopher ate

    public Philosopher(int id, Chopstick leftChopstick, Chopstick rightChopstick) {
        this.id = id;
        this.leftChopstick = leftChopstick;
        this.rightChopstick = rightChopstick;
        this.random = new Random();
    }
}
```

### ❓ Why `volatile boolean full`?

The `full` flag is written by the main thread and read by the philosopher's thread. Without `volatile`, the philosopher thread might cache the value and never see the update — running forever even after we tell it to stop.

### ❓ Why `implements Runnable`?

Each philosopher will be assigned to a thread in an `ExecutorService`. The `Runnable` interface gives us the `run()` method that the executor calls.

---

## Concept 2: Thinking and Eating — The Two Operations

### ⚙️ Thinking

```java
private void think() throws InterruptedException {
    System.out.println(this + " is thinking...");
    Thread.sleep(random.nextInt(1000)); // Think for 0-1000ms
}
```

### ⚙️ Eating

```java
private void eat() throws InterruptedException {
    System.out.println(this + " is eating...");
    eatingCounter++;
    Thread.sleep(random.nextInt(1000)); // Eat for 0-1000ms
}
```

Both operations are simulated with `Thread.sleep()` for random durations. The `eatingCounter` lets us verify at the end that all philosophers got a fair share of eating time (no starvation).

---

## Concept 3: The `run()` Method — The Core Logic

### ⚙️ The Algorithm

This is where everything comes together. The philosopher repeatedly:

1. **Thinks** for a random time
2. **Tries to pick up the left chopstick**
3. If successful, **tries to pick up the right chopstick**
4. If both acquired → **eats**, then puts down both chopsticks
5. If the right chopstick isn't available → **puts down the left chopstick** (prevents deadlock!)

```java
@Override
public void run() {
    try {
        while (!full) {
            think();

            // Try to pick up left chopstick
            if (leftChopstick.pickUp(this, State.LEFT)) {

                // Try to pick up right chopstick
                if (rightChopstick.pickUp(this, State.RIGHT)) {
                    eat();
                    rightChopstick.putDown(this, State.RIGHT);
                } 
                // If right chopstick failed, release the left one!
                leftChopstick.putDown(this, State.LEFT);
            }
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

### 💡 The Critical Detail: Releasing the Left Chopstick

Notice this part:

```java
if (rightChopstick.pickUp(this, State.RIGHT)) {
    eat();
    rightChopstick.putDown(this, State.RIGHT);
}
// Whether eat succeeded or not, release left chopstick
leftChopstick.putDown(this, State.LEFT);
```

If the philosopher picks up the left chopstick but **fails** to get the right one, it **puts down the left chopstick**. This is crucial:

- Without this → a philosopher could hold the left chopstick forever while waiting for the right one → **deadlock**
- With this → the philosopher releases its held resource and tries again → **no deadlock**

### ⚠️ Common Mistake

Only releasing the left chopstick inside a final `else` block but forgetting to release it after eating too. The left chopstick must be released in **all** paths — both after successful eating and after failing to get the right chopstick.

---

## Concept 4: Stopping the Philosopher

### ⚙️ Graceful Shutdown

```java
public void setFull(boolean full) {
    this.full = full;
}
```

When the main thread calls `philosopher.setFull(true)`, the `while (!full)` loop exits on the next iteration. This is a clean way to stop threads without using `Thread.stop()` (which is deprecated and dangerous).

### ⚙️ Tracking Results

```java
public int getEatingCounter() {
    return eatingCounter;
}

@Override
public String toString() {
    return "Philosopher " + id;
}
```

After the simulation ends, we print each philosopher's eating count to verify nobody starved.

---

## Summary

✅ Each philosopher is a `Runnable` — an independent thread in the executor's thread pool

✅ The think/eat cycle uses `Thread.sleep()` with random durations to simulate real work

✅ The `run()` method implements the chopstick acquisition protocol: left first, then right

✅ If the right chopstick isn't available, the philosopher **releases the left one** — this prevents deadlock

⚠️ The `full` flag must be `volatile` so the main thread's write is visible to the philosopher's thread

💡 The eating counter lets us verify fairness — if one philosopher has 0 eats while others have 50, we have a starvation problem
