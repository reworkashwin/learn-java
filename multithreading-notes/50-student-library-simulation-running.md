# Student Library Simulation — Running the Simulation

## Introduction

With the `Book` and `Student` classes implemented, we now wire everything together in the main application. This follows the same pattern as the Dining Philosophers: create shared resources, create threads, assign resources to threads, and run them on an `ExecutorService`.

---

## Concept 1: Setting Up the Application

### ⚙️ Creating Books and Students

```java
public static void main(String[] args) {

    Student[] students = null;
    Book[] books = null;

    try {
        books = new Book[Constants.NUMBER_OF_BOOKS];
        students = new Student[Constants.NUMBER_OF_STUDENTS];

        // Initialize books with IDs starting at 1
        for (int i = 0; i < Constants.NUMBER_OF_BOOKS; i++) {
            books[i] = new Book(i + 1);
        }
```

We use `i + 1` for the book ID so the output shows "Book 1", "Book 2" instead of "Book 0", "Book 1" — purely for readability.

---

## Concept 2: Creating Threads with ExecutorService

### ⚙️ One Thread Per Student

```java
        ExecutorService executor = Executors.newFixedThreadPool(Constants.NUMBER_OF_STUDENTS);

        for (int i = 0; i < Constants.NUMBER_OF_STUDENTS; i++) {
            students[i] = new Student(i + 1, books);
            executor.execute(students[i]);
        }
```

### ⚙️ Step-by-Step

1. **Create a fixed thread pool** with as many threads as students
2. **For each student:**
   - Create a new `Student` with an ID and the shared `books` array
   - Pass it to `executor.execute()` — this starts the student's `run()` method on a thread

### 💡 Why `newFixedThreadPool(NUMBER_OF_STUDENTS)`?

Each student runs an infinite loop. If we used fewer threads than students, some students would never get to run. A fixed pool with one thread per student ensures all students execute concurrently.

---

## Concept 3: The `finally` Block — Cleanup

### ⚙️ Shutting Down the Executor

```java
    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        executor.shutdown();
    }
}
```

`executor.shutdown()` signals the executor to stop accepting new tasks. However, since our student threads run infinite loops, they'll continue running until the JVM exits or the threads are interrupted.

---

## Concept 4: Sample Output

### 🧪 What the Simulation Looks Like

```
Student #1 starts reading Book 6
Student #4 starts reading Book 1
Student #3 starts reading Book 5
Student #1 has finished reading Book 6
Student #2 starts reading Book 6
Student #3 has finished reading Book 5
Student #3 starts reading Book 5
Student #2 has finished reading Book 6
Student #3 has finished reading Book 5
```

### 🧠 What to Observe

1. **Mutual exclusion works** — Student #2 starts reading Book 6 only **after** Student #1 finishes
2. **Random selection** — Student #3 picks Book 5 twice in a row (random chance)
3. **No deadlock** — the simulation runs continuously without freezing
4. **No starvation** — all students get to read books

---

## Concept 5: The Complete Architecture

### 🧠 How Everything Connects

```
┌─────────────┐     ┌──────────┐     ┌──────────────┐
│ ExecutorService │──→│ Student  │──→│ Book (Lock)  │
│ (Thread Pool)   │   │ (Thread) │    │ (ReentrantLock)│
│                 │   │          │    │               │
│ Thread 1 → Student 1│ ─random─→│ Book 1          │
│ Thread 2 → Student 2│ ─random─→│ Book 2          │
│ Thread 3 → Student 3│ ─random─→│ Book 3          │
│ Thread 4 → Student 4│ ─random─→│ ...             │
└─────────────┘     └──────────┘     └──────────────┘
```

- **`ExecutorService`** manages threads
- **`Student`** (thread) picks random books and tries to read
- **`Book`** (lock) ensures mutual exclusion — only one reader at a time
- **`ReentrantLock.tryLock()`** prevents deadlock and starvation

---

## Concept 6: Key Takeaways from Both Simulations

### 🧠 Comparing the Two Problems

| Feature | Dining Philosophers | Student Library |
|---------|-------------------|-----------------|
| Shared resource | Chopstick | Book |
| Resources per thread | 2 (left + right) | 1 (any book) |
| Selection strategy | Fixed (adjacent) | Random |
| Deadlock risk | High | Low |
| Synchronization | `ReentrantLock.tryLock()` | `ReentrantLock.tryLock()` |
| Thread creation | `ExecutorService.execute()` | `ExecutorService.execute()` |

Both problems use the same core tools:
- `ReentrantLock` for mutual exclusion
- `tryLock()` with timeout for deadlock avoidance
- `ExecutorService` for thread management

---

## Summary

✅ The application follows a clean pattern: create resources → create threads → assign resources → execute → shutdown

✅ Each student gets one thread in a fixed thread pool

✅ `executor.shutdown()` in a `finally` block ensures cleanup

✅ The simulation demonstrates three concurrent programming guarantees: mutual exclusion, deadlock freedom, and starvation avoidance

💡 Both the Dining Philosophers and Student Library simulations use the same concurrency toolkit (`ReentrantLock`, `tryLock()`, `ExecutorService`) — the problems differ in complexity, but the solutions share a common pattern
