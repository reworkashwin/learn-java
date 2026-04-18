# Student Library Simulation — The Problem

## Introduction

After mastering the Dining Philosophers problem, we're tackling another classic concurrency simulation: **students competing for books in a library**. This problem reinforces the same concepts — shared resources, locks, deadlock avoidance — but in a more realistic, relatable scenario.

---

## Concept 1: The Setup

### 🧠 What's the Scenario?

We have:
- **Several books** (e.g., Book 1, Book 2, Book 3)
- **Several students** (e.g., Student 1, Student 2, Student 3, Student 4)

Each student picks a book at random and reads it. When they finish, they pick another random book and read that one.

```
  Student 1 ──→ Book 2 (reading)
  Student 2 ──→ Book 1 (reading)
  Student 3 ──→ Book 2 (waiting...)  ← Can't read, Student 1 has it
  Student 4 ──→ Book 3 (reading)
```

---

## Concept 2: The Constraints

### ⚙️ Rule 1: No Two Students Can Read the Same Book Simultaneously

If Student 1 is reading Book 2, Student 3 must **wait** until Student 1 finishes before they can read it. This is a classic mutual exclusion problem — the book is the shared resource.

This means: **every book is a lock**. When a student "picks up" a book, they acquire the lock. When they finish reading, they release it.

### ⚙️ Rule 2: Avoid Thread Starvation

We need to handle the case where a student waits **indefinitely** for a book. Imagine Student 3 wants Book 2, but Students 1, 2, and 4 keep reading it in rotation — Student 3 never gets a turn.

This is the same starvation problem we solved in the Dining Philosophers simulation.

---

## Concept 3: Solution Approach

### 🧠 How Will We Solve It?

The tools are familiar:

| Concept | Implementation |
|---------|---------------|
| Books (shared resources) | Each book wraps a `ReentrantLock` |
| Students (threads) | Each student implements `Runnable` |
| Preventing deadlock | Use `tryLock()` with a timeout instead of `lock()` |
| Running the simulation | `ExecutorService` with a fixed thread pool |

### 💡 Connecting to Dining Philosophers

The structure is very similar:

| Dining Philosophers | Student Library |
|--------------------|----------------|
| Chopstick (shared resource) | Book (shared resource) |
| Philosopher (thread) | Student (thread) |
| `tryLock()` on chopstick | `tryLock()` on book |
| Pick up 2 chopsticks to eat | Acquire 1 book to read |

The library problem is actually **simpler** — each student only needs **one** resource (book) at a time, whereas philosophers needed **two** (both chopsticks). This makes deadlock less likely but starvation is still possible.

---

## Summary

✅ The student library simulation models concurrent access to shared resources (books)

✅ Two constraints: mutual exclusion (one reader per book) and no starvation

✅ Each book is a lock, each student is a thread — solved with `ReentrantLock` and `tryLock()`

💡 This is simpler than Dining Philosophers because each thread only needs **one** shared resource, not two
