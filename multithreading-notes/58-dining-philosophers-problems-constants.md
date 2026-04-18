# Dining Philosophers Problem — Constants and Project Setup

## Introduction

Before diving into the core logic, we need to set up the project structure for the Dining Philosophers simulation. This involves defining constants, an enum for chopstick state, and stubbing out the main classes. Good structure upfront makes the concurrency logic much clearer.

---

## Concept 1: Project Structure

### 🧠 What Classes Do We Need?

The simulation requires four classes plus an enum:

| Class/Enum | Responsibility |
|-----------|---------------|
| `Constants` | Stores simulation parameters (number of philosophers, chopsticks, runtime) |
| `State` (enum) | Represents whether a chopstick is a LEFT or RIGHT chopstick relative to a philosopher |
| `Chopstick` | The shared resource — uses locks for synchronization |
| `Philosopher` | The thread — thinks, picks up chopsticks, eats, puts them down |
| `App` | Entry point — creates threads, runs the simulation |

---

## Concept 2: The Constants Class

### 🧠 Why a Constants Class?

Centralizing configuration values in one place makes the simulation easy to tweak. Want 10 philosophers instead of 5? Change one number.

### ⚙️ Implementation

```java
public class Constants {

    private Constants() {
        // Private constructor — prevents instantiation
    }

    public static final int NUMBER_OF_PHILOSOPHERS = 5;
    public static final int NUMBER_OF_CHOPSTICKS = 5;
    public static final int SIMULATION_RUNNING_TIME = 5 * 1000; // 5 seconds in milliseconds
}
```

### 💡 Why a Private Constructor?

The `Constants` class only holds `public static final` fields — there's no reason to ever create an instance of it. Making the constructor `private` enforces this:

```java
// This will cause a compile error:
Constants c = new Constants(); // ❌ Constructor not visible
```

This is a common Java pattern for utility/constant classes.

---

## Concept 3: The State Enum

### 🧠 What Does It Represent?

Every philosopher has a **left** chopstick and a **right** chopstick. The `State` enum identifies which side a chopstick is on relative to the philosopher using it:

```java
public enum State {
    LEFT,
    RIGHT
}
```

### ❓ Why Do We Need This?

Remember: **the left chopstick of Philosopher 0 is the right chopstick of Philosopher 1.** The same physical chopstick can be "left" for one philosopher and "right" for another. The `State` enum lets us track this relationship when logging and debugging.

```
P0's LEFT  = Chopstick 0 = P4's RIGHT
P0's RIGHT = Chopstick 1 = P1's LEFT
P1's RIGHT = Chopstick 2 = P2's LEFT
...
```

This overlapping ownership is exactly what creates the competition — and potential deadlock.

---

## Summary

✅ The project needs 4 classes + 1 enum: `Constants`, `State`, `Chopstick`, `Philosopher`, `App`

✅ Use a **private constructor** for constant-only classes to prevent accidental instantiation

✅ The `State` enum (`LEFT`/`RIGHT`) tracks the relationship between philosophers and their shared chopsticks

💡 The simulation runs for 5 seconds with 5 philosophers and 5 chopsticks — these values are easily adjustable through the `Constants` class
