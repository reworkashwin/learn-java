# 📘 Vector and Stack in Java

## 📌 Introduction

We've covered `ArrayList` and `LinkedList` — now it's time to look at two more `List` implementations: **Vector** and **Stack**. While these classes aren't commonly used in modern development, they still hold significance when discussing **synchronization**, **thread safety**, and **legacy code**. Understanding them also helps in interviews and when maintaining older Java codebases.

---

## 🧩 Concept 1: Vector Class

### 🧠 What is it?

`Vector` is a **synchronized, thread-safe** implementation of the `List` interface. If you've worked with `ArrayList`, you'll find `Vector` almost identical — both use a dynamic array internally and provide the same set of methods.

### ❓ Why do we need it?

The key difference is **synchronization**. `Vector` is synchronized by default, meaning only **one thread** can manipulate it at a time. This makes it safe for multithreaded environments without any extra work on your part.

### ⚙️ How it works

- Internally uses a **dynamic array** — elements are stored in a contiguous block of memory
- **Every method is synchronized** — thread-safe out of the box
- Grows dynamically as elements are added, just like `ArrayList`

### 🧪 Example

```java
import java.util.Vector;

Vector<String> vector = new Vector<>();
vector.add("Apple");
vector.add("Banana");
vector.add("Cherry");
System.out.println(vector);  // [Apple, Banana, Cherry]

vector.remove("Banana");
System.out.println(vector);  // [Apple, Cherry]
```

As you can see, the API is **identical** to `ArrayList`. The only difference is happening under the hood — every operation acquires a lock before executing.

### 💡 Insight

> The trade-off of synchronization is **performance overhead**. Every method call on a `Vector` has to acquire and release a lock, even if only one thread is using it. This makes `Vector` slower than `ArrayList` in single-threaded scenarios — which is the majority of use cases.

### ❓ When should you use Vector?

- If you're in a **multithreaded environment** and need built-in synchronization
- When working with **legacy codebases** that already use `Vector`
- For most modern applications, `ArrayList` (or `CopyOnWriteArrayList` for thread safety) is preferred

---

## 🧩 Concept 2: Stack Class

### 🧠 What is it?

`Stack` is a class that extends `Vector` and provides the classic **LIFO (Last-In, First-Out)** data structure. Since it extends `Vector`, it inherits all the thread-safe characteristics.

### ❓ Why do we need it?

Stacks are useful in many scenarios:
- **Parsing expressions** (e.g., matching brackets)
- **Undo/Redo features** in text editors
- **Implementing recursive algorithms** iteratively
- **Browser history** — back button navigation

### ⚙️ How it works

`Stack` introduces methods specific to stack behavior on top of what `Vector` provides:

| Method | Description |
|---|---|
| `push(E item)` | Adds an element to the **top** of the stack |
| `pop()` | Removes and returns the **top** element |
| `peek()` | Returns the **top** element without removing it |
| `empty()` | Returns `true` if the stack is empty |
| `search(Object o)` | Returns the 1-based position from the top |

All these methods are **synchronized** (inherited from `Vector`).

### 🧪 Example

```java
import java.util.Stack;

Stack<Integer> stack = new Stack<>();
stack.push(10);
stack.push(20);
stack.push(30);
System.out.println(stack);  // [10, 20, 30]

// Peek — view top without removing
System.out.println("Top element: " + stack.peek());  // 30

// Pop — remove and return top
System.out.println("Popped: " + stack.pop());  // 30
System.out.println("After pop: " + stack);     // [10, 20]
```

### 💡 Insight

The stack follows **LIFO** — the last element added (`30`) is the first one returned by `peek()` and removed by `pop()`. Think of it like a stack of plates — you always take from the top.

---

## 🧩 Concept 3: Legacy Status and Modern Alternatives

### 🧠 What is it?

Both `Vector` and `Stack` are considered **legacy classes**. They've been around since **Java 1.0** — before the Collections Framework was introduced in Java 1.2.

### ❓ Why does this matter?

While they're still fully supported and functional, their use is **discouraged** in favor of more modern, efficient alternatives:

| Legacy Class | Modern Alternative | Why |
|---|---|---|
| `Vector` | `ArrayList` | Faster (no synchronization overhead) |
| `Vector` (thread-safe) | `CopyOnWriteArrayList` | Better concurrency design |
| `Stack` | `Deque` / `ArrayDeque` | More complete and efficient stack operations |
| `Stack` (thread-safe) | `ConcurrentLinkedDeque` | Modern concurrent stack/queue |

### 💡 Insight

> The problem with `Vector` and `Stack` isn't that they don't work — it's that **synchronizing every single method** is a blunt instrument. Modern concurrent collections offer finer-grained locking or lock-free algorithms that perform much better under real-world concurrent workloads.

---

## ✅ Key Takeaways

1. **Vector** is essentially a synchronized `ArrayList` — same dynamic array, same methods, but every operation is thread-safe
2. **Stack** extends `Vector` and adds LIFO behavior with `push()`, `pop()`, and `peek()`
3. Both are **legacy classes** from Java 1.0 — still usable but not recommended for new code
4. **Synchronization adds overhead** — `Vector` is slower than `ArrayList` in single-threaded environments
5. For modern applications, prefer `ArrayList`, `ArrayDeque`, `CopyOnWriteArrayList`, or `ConcurrentLinkedDeque`

## ⚠️ Common Mistakes

- **Using Vector/Stack in new code** — Unless you have a specific reason (legacy compatibility), use modern alternatives
- **Assuming Vector is always safe** — While individual methods are synchronized, compound operations (check-then-act) still need external synchronization
- **Using Stack instead of Deque** — `ArrayDeque` is faster and provides a more complete set of stack/queue operations
- **Forgetting that Stack inherits List methods** — Since `Stack` extends `Vector`, you can call `get(index)`, which breaks the LIFO contract conceptually

## 💡 Pro Tips

- If you need a **thread-safe list**, consider `Collections.synchronizedList(new ArrayList<>())` or `CopyOnWriteArrayList` instead of `Vector`
- If you need **stack behavior**, use `ArrayDeque` and its `push()`/`pop()` methods — it's faster and doesn't carry the overhead of synchronized methods
- In interviews, knowing the **legacy status** of Vector/Stack and being able to suggest modern alternatives shows maturity in Java development
- The `search()` method in `Stack` returns a **1-based position** from the top (not 0-based index) — this can be confusing
