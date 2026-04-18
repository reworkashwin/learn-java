# Livelock — Example

## Introduction

We've learned the theory: a livelock is when threads are actively running but making no progress. Now let's see it in action with a concrete Java example. We'll create a situation where two threads keep deferring to each other indefinitely, then fix it.

---

## Concept 1: Setting Up the Problem

### 🧠 The scenario

Imagine two workers who need a shared resource (a "spoon" at a dinner table). Both are overly polite — when they see the other person wants the spoon, they put it down and let the other go first. But since **both** do this, neither ever eats.

### ⚙️ The Spoon class

```java
public class Spoon {
    private Diner owner;

    public Spoon(Diner owner) {
        this.owner = owner;
    }

    public Diner getOwner() {
        return owner;
    }

    public void setOwner(Diner owner) {
        this.owner = owner;
    }

    public synchronized void use() {
        System.out.printf("%s is eating!%n", owner.getName());
    }
}
```

### ⚙️ The Diner class

```java
public class Diner {
    private String name;
    private boolean isHungry;

    public Diner(String name) {
        this.name = name;
        this.isHungry = true;
    }

    public String getName() {
        return name;
    }

    public boolean isHungry() {
        return isHungry;
    }

    public void eatWith(Spoon spoon, Diner otherDiner) {
        while (isHungry) {
            // If I don't have the spoon, wait
            if (spoon.getOwner() != this) {
                try { Thread.sleep(1); } catch (InterruptedException e) {}
                continue;
            }

            // If the other diner is hungry too, be polite — give them the spoon
            if (otherDiner.isHungry()) {
                System.out.printf("%s: 'You go first, %s!'%n", name, otherDiner.getName());
                spoon.setOwner(otherDiner);
                continue;   // ← This is where the livelock happens
            }

            // Otherwise, eat
            spoon.use();
            isHungry = false;
            System.out.printf("%s is done eating.%n", name);
            spoon.setOwner(otherDiner);
        }
    }
}
```

---

## Concept 2: Running the Livelock

### 🧪 Main method

```java
public class App {
    public static void main(String[] args) {
        Diner husband = new Diner("Bob");
        Diner wife = new Diner("Alice");

        Spoon spoon = new Spoon(husband);

        new Thread(() -> husband.eatWith(spoon, wife)).start();
        new Thread(() -> wife.eatWith(spoon, husband)).start();
    }
}
```

### 🔥 Output (loops forever)

```
Bob: 'You go first, Alice!'
Alice: 'You go first, Bob!'
Bob: 'You go first, Alice!'
Alice: 'You go first, Bob!'
Bob: 'You go first, Alice!'
Alice: 'You go first, Bob!'
...
```

### 🧠 Why does this happen?

1. Bob has the spoon. He checks — Alice is hungry. He gives her the spoon.
2. Alice has the spoon. She checks — Bob is hungry. She gives him the spoon.
3. Repeat forever.

Both threads are **running** (not blocked!), both are constantly checking and yielding, but **neither ever eats**. This is a classic livelock.

---

## Concept 3: Fixing the Livelock

### ⚙️ Solution: Add randomness

The key insight is to break the **symmetry**. Instead of always yielding, each diner randomly decides whether to yield:

```java
public void eatWith(Spoon spoon, Diner otherDiner) {
    Random random = new Random();

    while (isHungry) {
        if (spoon.getOwner() != this) {
            try { Thread.sleep(1); } catch (InterruptedException e) {}
            continue;
        }

        // Randomly decide whether to be polite
        if (otherDiner.isHungry() && random.nextBoolean()) {
            System.out.printf("%s: 'You go first, %s!'%n", name, otherDiner.getName());
            spoon.setOwner(otherDiner);
            continue;
        }

        // Eat!
        spoon.use();
        isHungry = false;
        System.out.printf("%s is done eating.%n", name);
        spoon.setOwner(otherDiner);
    }
}
```

### 🧪 Output (terminates successfully)

```
Bob: 'You go first, Alice!'
Alice: 'You go first, Bob!'
Bob is eating!
Bob is done eating.
Alice is eating!
Alice is done eating.
```

### 💡 Why does this work?

The `random.nextBoolean()` means each diner only yields **50% of the time**. Eventually, one diner will decide NOT to yield while they have the spoon, and they'll eat. Once one finishes, the other no longer needs to yield.

---

## Concept 4: Alternative Fix — Priority or Ordering

### ⚙️ Deterministic approach

Instead of randomness, you can assign a **priority** to break the tie:

```java
if (otherDiner.isHungry() && this.getName().compareTo(otherDiner.getName()) > 0) {
    // Only yield if your name comes after the other alphabetically
    spoon.setOwner(otherDiner);
    continue;
}
```

This guarantees that one specific diner always eats first — no randomness needed.

⚠️ **Common Mistake:** Thinking that livelocks only happen in textbook examples. Real-world livelocks occur in message-passing systems, retry logic, and distributed transactions where multiple components keep backing off and retrying in sync.

---

## Summary

✅ **Key Takeaways:**

- A livelock happens when threads keep responding to each other without making progress
- Unlike deadlock, threads are **running** and consuming CPU — but doing nothing useful
- The root cause is **symmetry** — both threads execute the same polite "you go first" logic
- Fix with **random backoff** — break the symmetry so one thread eventually proceeds
- Alternative fix: use a **deterministic ordering** (e.g., priority, alphabetical order, thread ID)
- Livelocks are harder to detect than deadlocks because the threads appear active
