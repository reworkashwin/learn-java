# Virtual Thread Pinning

## Introduction

Virtual threads sound almost too good to be true — millions of lightweight threads with cheap blocking. But there's a catch: **pinning**. In certain situations, a virtual thread gets **stuck on its carrier thread** and can't be unmounted. This defeats the entire purpose of virtual threads and can severely degrade performance. Understanding when and why pinning occurs — and how to avoid it — is essential for using virtual threads effectively.

---

## Concept 1: What Is Pinning?

### 🧠 Normal virtual thread behavior

When a virtual thread encounters a blocking operation (I/O, `Thread.sleep()`, etc.):

1. The JVM **unmounts** the virtual thread from its carrier thread
2. The carrier thread picks up **another virtual thread** to execute
3. When the blocking operation completes, the virtual thread is remounted on any available carrier

This is why virtual threads scale — carrier threads are never idle.

### 🧠 Pinned behavior

When a virtual thread is **pinned**, it **cannot be unmounted** from its carrier thread. The carrier thread blocks along with the virtual thread:

```
Normal:     VT blocks → unmounted → carrier runs another VT ✅
Pinned:     VT blocks → STAYS on carrier → carrier is wasted ❌
```

### 💡 Analogy

Think of a taxi driver (carrier thread) and passengers (virtual threads). Normally, when a passenger goes into a building (blocking), the taxi picks up another passenger. When **pinned**, the taxi **waits outside** for the original passenger — unavailable to anyone else.

---

## Concept 2: When Does Pinning Occur?

### ⚠️ Cause #1: `synchronized` blocks or methods

This is the **primary cause** of pinning. When a virtual thread enters a `synchronized` block, it becomes pinned to its carrier thread for the duration of the block:

```java
public synchronized void criticalSection() {
    // Virtual thread is PINNED here
    Thread.sleep(5000);  // Carrier thread is blocked for 5 seconds!
}
```

### ❓ Why does synchronized cause pinning?

The `synchronized` keyword is implemented at the **JVM level** using **monitor locks** that are tied to the native OS thread. Since the virtual thread's identity is temporarily bound to the carrier's OS thread during synchronization, the JVM cannot safely unmount it.

### ⚠️ Cause #2: Native methods and foreign function calls

When a virtual thread executes native code (via JNI or the Foreign Function API), it's pinned because native code runs directly on the OS thread and the JVM can't intercept it.

```java
// Native method — causes pinning
private native void nativeOperation();
```

---

## Concept 3: The Impact of Pinning

### ⚙️ Scenario: All carriers pinned

Imagine you have 8 carrier threads (matching 8 CPU cores) and 8 virtual threads that all enter `synchronized` blocks:

```
Carrier 1: VT-1 pinned (in synchronized block)
Carrier 2: VT-2 pinned (in synchronized block)
...
Carrier 8: VT-8 pinned (in synchronized block)

→ NO carrier threads available!
→ All other virtual threads are STARVED
```

If you have 10,000 virtual threads but all 8 carriers are pinned, 9,992 virtual threads are stuck waiting. The system grinds to a halt.

### 🧪 Benchmark: With and without pinning

```java
// WITHOUT pinning (using ReentrantLock)
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        exec.submit(() -> {
            lock.lock();
            try {
                Thread.sleep(100);
            } finally {
                lock.unlock();
            }
        });
    }
}
// Completes quickly — virtual threads unmount during sleep

// WITH pinning (using synchronized)
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        exec.submit(() -> {
            synchronized (lockObj) {
                Thread.sleep(100);  // PINNED — carrier blocked
            }
        });
    }
}
// Extremely slow — only N tasks run at a time (N = carrier count)
```

---

## Concept 4: How to Avoid Pinning

### ✅ Solution 1: Replace `synchronized` with `ReentrantLock`

This is the **most important** fix:

```java
// BEFORE — causes pinning
public synchronized void doWork() {
    // blocking I/O here
}

// AFTER — no pinning
private final ReentrantLock lock = new ReentrantLock();

public void doWork() {
    lock.lock();
    try {
        // blocking I/O here — virtual thread can unmount
    } finally {
        lock.unlock();
    }
}
```

`ReentrantLock` is implemented at the Java level (not the JVM monitor level), so the JVM can unmount the virtual thread while it waits for the lock.

### ✅ Solution 2: Minimize synchronized scope

If you can't replace `synchronized`, make the critical section as **short as possible**:

```java
// BAD — long pinning
synchronized (lock) {
    data = fetchFromDatabase();    // I/O — pinned for entire call
    processData(data);
}

// BETTER — short pinning
Data data = fetchFromDatabase();   // I/O outside synchronized
synchronized (lock) {
    processData(data);             // Only CPU work inside
}
```

### ✅ Solution 3: Avoid synchronized in I/O paths

Never put blocking I/O inside `synchronized` when using virtual threads:

```java
// TERRIBLE — combines two anti-patterns
synchronized (lock) {
    HttpResponse response = httpClient.send(request);  // I/O + synchronized = pinned
}
```

---

## Concept 5: Detecting Pinning

### ⚙️ JVM flag for diagnostics

Java provides a flag to detect pinning at runtime:

```bash
-Djdk.tracePinnedThreads=full
```

This prints a stack trace whenever a virtual thread is pinned, showing exactly where the pinning occurs:

```
Thread[#37,VirtualThread[#37]/runnable@ForkJoinPool-1-worker-1,5,main]
    at java.base/java.lang.VirtualThread$VThreadContinuation.onPinned(VirtualThread.java:180)
    at com.example.MyService.criticalSection(MyService.java:25)
    <== monitors:1
```

### 💡 Use this during development

Run your application with `-Djdk.tracePinnedThreads=short` during development to identify all pinning sites. Fix them before going to production.

---

## ✅ Key Takeaways

- **Pinning** = a virtual thread stuck on its carrier thread, unable to unmount
- Primary cause: `synchronized` blocks/methods that contain blocking operations
- Pinning defeats virtual thread scalability — carrier threads become wasted
- **Fix**: Replace `synchronized` with `ReentrantLock`
- **Fix**: Move I/O operations outside `synchronized` blocks
- Use `-Djdk.tracePinnedThreads=full` to detect pinning during development
- Native method calls also cause pinning — less common but be aware
