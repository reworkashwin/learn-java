# Student Library Simulation — Student Implementation

## Introduction

Each student is an **independent thread** that continuously picks a random book and tries to read it. The `Student` class implements `Runnable` and contains the main loop that drives each student's behavior throughout the simulation.

---

## Concept 1: Class Structure

### 🧠 What Does a Student Have?

```java
public class Student implements Runnable {

    private int id;
    private Book[] books;
    private Random random;

    public Student(int id, Book[] books) {
        this.id = id;
        this.books = books;
        this.random = new Random();
    }

    @Override
    public String toString() {
        return "Student #" + id;
    }
}
```

Each student has:
- **`id`** — unique identifier
- **`books`** — reference to the shared array of all books (so the student can pick any book)
- **`random`** — for selecting books randomly

### ❓ Why Does the Student Hold a Reference to All Books?

Each student needs access to the entire book collection to **choose at random**. The books array is shared across all students — they all reference the same `Book` objects, which is exactly how the locking works: all students compete for the same lock inside each book.

---

## Concept 2: The `run()` Method — The Reading Loop

### ⚙️ Implementation

```java
@Override
public void run() {
    while (true) {
        int bookId = random.nextInt(Constants.NUMBER_OF_BOOKS);
        try {
            books[bookId].read(this);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### ⚙️ Step-by-Step

1. **Generate a random book ID** — `random.nextInt(NUMBER_OF_BOOKS)` picks a value from `0` to `NUMBER_OF_BOOKS - 1`
2. **Try to read that book** — calls `books[bookId].read(this)`, which internally uses `tryLock()` to acquire the book
3. **Loop forever** — the student keeps picking books and reading them indefinitely

### 💡 What Happens When the Book Is Unavailable?

If another student is already reading the chosen book, `tryLock()` returns `false` after the timeout period. The `read()` method returns without doing anything, and the loop moves to the next iteration — the student picks a **new random book** and tries again.

This is how starvation is avoided: if a student can't get one book, they immediately try a different one rather than waiting forever.

---

## Concept 3: Comparison with the Philosopher Class

### 🧠 Simpler Than the Dining Philosophers

| Aspect | Philosopher | Student |
|--------|------------|---------|
| Resources needed | **2** (left + right chopstick) | **1** (any book) |
| Resource selection | Fixed (adjacent chopsticks) | Random (any book) |
| Deadlock risk | High (circular wait) | Low (single resource) |
| Stop mechanism | `volatile boolean full` | Infinite loop (stopped by executor shutdown) |

The student simulation is simpler because each student only needs **one** resource at a time. There's no possibility of circular wait because you can't create a dependency chain with single-resource locks.

### ⚠️ However, Starvation Is Still Possible

Even though deadlock is unlikely, a student could theoretically keep picking books that are always taken. The `tryLock()` timeout and random selection make this extremely unlikely in practice, but in a worst-case scenario, the fairness parameter on `ReentrantLock` is the ultimate safety net.

---

## Summary

✅ Each student is a `Runnable` — a thread that runs an infinite loop of reading random books

✅ Students select books randomly using `random.nextInt()`, which distributes load across all books

✅ If a book is unavailable, the student simply picks a different random book — no blocking

✅ The student holds a reference to the shared `Book[]` array so all students compete for the same locks

💡 This is simpler than Dining Philosophers — only one shared resource needed per operation means no circular wait and much lower deadlock risk
