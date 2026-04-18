# Wait and Notify

## Introduction

So far we've seen how `synchronized` prevents multiple threads from running critical sections at the same time. But what if two threads need to **cooperate** — one produces data and the other consumes it? They need a way to **communicate**: "I'm done, your turn." This is exactly what `wait()` and `notify()` provide — a mechanism for inter-thread communication.

---

## Concept 1: The Need for Thread Communication

### 🧠 What is it?

Sometimes threads that are synchronized on the same lock need to coordinate their work. One thread might need to pause and let another thread proceed, then resume when signaled.

### ❓ Why can't we just use synchronization alone?

Synchronization ensures mutual exclusion — only one thread enters the critical section. But it doesn't let threads **signal** each other. Without `wait`/`notify`, a thread would have to keep checking a condition in a busy loop, wasting CPU time.

---

## Concept 2: The `wait()` Method

### 🧠 What is it?

When a thread calls `wait()` inside a synchronized block:

1. It **releases** the intrinsic lock immediately
2. It **goes to sleep** (enters the object's wait set)
3. It stays asleep until another thread calls `notify()` or `notifyAll()` on the same object

### ⚙️ Rules

- Must be called **inside** a synchronized context (block or method)
- Must be called on the **same object** that the thread synchronized on
- Throws `InterruptedException`

```java
synchronized (this) {
    System.out.println("Before wait");
    wait();  // releases lock, thread sleeps
    System.out.println("After wait");  // resumes here when notified
}
```

---

## Concept 3: The `notify()` Method

### 🧠 What is it?

When a thread calls `notify()`:

1. It **signals** one waiting thread that it can wake up
2. It does **NOT** release the lock immediately
3. The current thread finishes the rest of its synchronized block first
4. Only **then** does the awakened thread re-acquire the lock and continue

### ⚙️ Important detail

`notify()` wakes up **one random** waiting thread. If multiple threads are waiting on the same lock, you have no control over which one wakes up.

`notifyAll()` wakes up **all** waiting threads, but only one can acquire the lock — the rest go back to waiting.

---

## Concept 4: Complete Example

### 🧪 Putting it together

```java
class Process {
    
    public void produce() throws InterruptedException {
        synchronized (this) {
            System.out.println("Running the produce method...");
            wait();  // release lock, sleep until notified
            System.out.println("Again in the produce method!");
        }
    }
    
    public void consume() throws InterruptedException {
        Thread.sleep(1000);  // ensure producer enters first
        synchronized (this) {
            System.out.println("Running the consume method...");
            notify();  // wake up the producer
            System.out.println("After notify in consume method");
        }
    }
}
```

```java
Process process = new Process();

Thread t1 = new Thread(() -> process.produce());
Thread t2 = new Thread(() -> process.consume());

t1.start();
t2.start();
```

### ⚙️ Execution flow

| Step | What happens |
|---|---|
| 1 | **t1** enters `produce()`, acquires lock, prints "Running the produce method..." |
| 2 | **t1** calls `wait()` — releases lock, goes to sleep |
| 3 | **t2** wakes from sleep(1000), enters `consume()`, acquires lock |
| 4 | **t2** prints "Running the consume method..." |
| 5 | **t2** calls `notify()` — signals t1, but keeps the lock |
| 6 | **t2** prints "After notify in consume method" |
| 7 | **t2** exits synchronized block — releases lock |
| 8 | **t1** re-acquires lock, prints "Again in the produce method!" |

---

## Concept 5: Advantages and Disadvantages

### ✅ Advantages

- **Direct control** over thread coordination — you decide when threads wait and when they proceed
- **Ideal for producer-consumer** scenarios
- **Flexible** — can implement various concurrency patterns

### ⚠️ The big disadvantage: No fairness guarantee

`notify()` picks a **random** waiting thread. There's no guarantee that the longest-waiting thread gets the lock. In systems with many threads:

- One thread may get notified repeatedly while others starve
- The order is non-deterministic and varies across runs

This lack of fairness is exactly why Java introduced **Locks** and **ReentrantLocks** — which we'll explore in upcoming sections.

---

## Key Takeaways

- ✅ `wait()` releases the lock and puts the thread to sleep until notified
- ✅ `notify()` wakes one random waiting thread, but doesn't release the lock immediately
- ✅ Both must be called **inside** a synchronized context on the **same object**
- ⚠️ `notify()` picks a waiting thread **at random** — no fairness guarantee
- ⚠️ `notify()` finishes the rest of the synchronized block before releasing the lock
- 💡 For deterministic thread coordination with fairness, use `ReentrantLock` with `Condition` objects instead
