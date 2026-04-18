# Continuations and Coroutines

## Introduction

We've been using virtual threads and seen how they magically handle blocking without wasting OS threads. But how does this actually work **under the hood**? The answer lies in two concepts: **coroutines** and **continuations**. Understanding these reveals the elegant mechanism that powers virtual threads.

---

## Concept 1: Subroutines — The Standard Model

### 🧠 What is a subroutine?

A subroutine is just a regular method or function. When you call it:

1. Execution enters at the **beginning** of the method
2. Every line executes sequentially
3. When the method ends, control **returns to the caller**

```java
void doWork() {
    step1();   // entry point — always starts here
    step2();
    step3();   // exits here, returns to caller
}
```

The critical property: a subroutine has **one entry point** (the beginning) and **one exit point** (the return/end).

---

## Concept 2: Coroutines — Multiple Entry Points

### 🧠 What is a coroutine?

A coroutine is like a subroutine, but with a superpower: it can **pause** (yield) and **resume** from where it left off.

```
First call:   run() → executes step1, step2 → yield() → returns to caller
Second call:  run() → resumes at step3, step4 → yield() → returns to caller
Third call:   run() → resumes at step5 → finishes
```

### ❓ How is this different from a subroutine?

| Feature | Subroutine | Coroutine |
|---------|-----------|-----------|
| Entry points | One (beginning) | Multiple (resume points) |
| `run()` behavior | Always starts from the top | Continues from last `yield()` |
| State between calls | Lost | Preserved |

### 🧪 Pseudocode example

```
coroutine doWork():
    step1()
    step2()
    yield()        ← pauses here, returns to caller
    step3()        ← next run() resumes HERE
    step4()
    yield()        ← pauses again
    step5()        ← next run() resumes HERE
```

Each `yield()` freezes the coroutine and returns to the caller. The next `run()` doesn't restart — it **picks up exactly where it left off**.

---

## Concept 3: Continuations — The State Keeper

### 🧠 What is a continuation?

A **continuation** is the mechanism that makes coroutines possible. It's an object that stores:

- The **code pointer** — where exactly in the coroutine we paused
- The **stack frames** — all local variables and their values
- The **call chain** — any nested method calls that were in progress

When `run()` is called again, the continuation **recreates the stack** from this saved state, and execution resumes seamlessly.

### 💡 Analogy

Think of reading a book:
- **Subroutine** = You must read the book cover to cover every time
- **Coroutine** = You place a bookmark, close the book, do other things, then open it and continue from the bookmark
- **Continuation** = The bookmark itself (it remembers your exact position)

---

## Concept 4: How Continuations Power Virtual Threads

### ❓ Why are we talking about coroutines?

Because **virtual threads are implemented using continuations**. Here's the connection:

```
Virtual Thread = Task + Continuation
```

### ⚙️ Step-by-step: what happens when a virtual thread blocks

1. A virtual thread is **running** on a carrier thread, executing your code line by line

2. The code hits a **blocking point** (e.g., `Thread.sleep()`, I/O operation, `socket.read()`)

3. The continuation calls **`yield()`**:
   - The virtual thread's state (stack, variables, code position) is saved to **heap memory**
   - The carrier thread is **released**

4. The carrier thread picks up **another virtual thread** and starts executing it

5. When the block is **over** (I/O completes, sleep ends):
   - The JVM calls **`run()`** on the continuation
   - The stack is recreated from the saved state
   - A carrier thread (possibly a **different** one) resumes execution from exactly where it left off

### 🧪 Visualizing it

```
Virtual Thread executing:
    doWork()
    fetchFromDB()        ← I/O blocks here
    --- yield() ---      ← continuation saves state, carrier thread freed
    
    [... other virtual threads run on the carrier ...]
    
    --- run() ---        ← continuation restores state
    processResult()      ← execution continues seamlessly
    return result
```

### 💡 Key Insight

The virtual thread doesn't know or care that it was paused and resumed. From its perspective, the code ran straight through. The continuation handles all the save/restore magic transparently.

---

## Concept 5: Why This Is So Efficient

### 🧠 Saving virtual thread state is cheap

A virtual thread's continuation state is tiny — typically just a few hundred bytes on the heap. Compare this to a platform thread that requires a **full OS thread stack** (~1MB).

This is why:
- Creating virtual threads is cheap → small continuation object
- Blocking virtual threads is cheap → just save a small state to heap
- Resuming virtual threads is cheap → recreate a small stack
- You can have **millions** of virtual threads → minimal memory overhead

---

## Summary

```
Subroutines:     run() → execute everything → return
Coroutines:      run() → execute some → yield() → run() → continue → yield() → ...
Continuations:   The saved state that makes coroutines resumable
Virtual Threads: Coroutines implemented via continuations in the JVM
```

✅ **Key Takeaway:** Virtual threads are powered by continuations — objects that save and restore a thread's execution state. When a virtual thread blocks, the continuation yields, the carrier thread is freed, and when the block ends, the continuation resumes on any available carrier.

⚠️ **Common Misconception:** Continuations are not something you use directly in Java code. They are an **internal JVM mechanism** that makes virtual threads work transparently.

💡 **Pro Tip:** Understanding continuations clarifies why virtual threads are lightweight — swapping a virtual thread is just saving/restoring a tiny continuation object on the heap, not an expensive OS context switch.
