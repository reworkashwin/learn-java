# Callable Interface and Future Object

## Introduction

So far, we've used the `Runnable` interface for our threads — but there's a fundamental limitation: **Runnable cannot return a value**. What if your thread computes something and you need the result? This is where the `Callable` interface and `Future` object come in.

---

## Concept 1: The Problem with Runnable

### 🧠 What is Runnable?

The `Runnable` interface represents a task with **no return value** and **no checked exceptions**:

```java
public interface Runnable {
    void run(); // void — returns nothing
}
```

### ❓ Why is this limiting?

Imagine you want a thread to compute a result — maybe fetch data from a database, process a file, or perform a calculation. With `Runnable`, you'd need workarounds like shared variables or callbacks. There's no clean way to say: "run this task and give me the result."

---

## Concept 2: The Callable Interface

### 🧠 What is it?

`Callable<V>` is a functional interface (just like `Runnable`) that represents a task, but with two key differences:

1. **It returns a value** of generic type `V`
2. **It can throw checked exceptions**

```java
public interface Callable<V> {
    V call() throws Exception;
}
```

### 🧪 Example

```java
Callable<String> task = () -> {
    // Do some work...
    return "Hello from a Callable!";
};
```

### 💡 Key Difference: `execute()` vs `submit()`

| | Runnable | Callable |
|---|---------|----------|
| Return value | None (`void`) | Generic type `V` |
| Checked exceptions | Cannot throw | Can throw |
| Start with `execute()` | ✅ Yes | ❌ No |
| Start with `submit()` | ✅ Yes | ✅ Yes |

> If you have a `Callable`, you **must** use `submit()` — the `execute()` method only accepts `Runnable`.

---

## Concept 3: The Future Object

### 🧠 What is it?

When you `submit()` a `Callable` to an executor, it returns a `Future<V>` object. Think of a `Future` as a **promise** — it represents a result that will be available **at some point in the future**.

```java
ExecutorService service = Executors.newSingleThreadExecutor();
Future<String> future = service.submit(() -> "Hello!");
```

### ⚙️ Getting the result with `get()`

The `Future.get()` method retrieves the result of the `Callable`:

```java
String result = future.get(); // Blocks until result is available
```

### ⚠️ Critical: `get()` is a Blocking Call

When you call `future.get()`, the calling thread **blocks** (waits) until the callable finishes its computation. The thread has no choice but to wait.

> 💡 **Pro Tip:** With the advent of **virtual threads** in modern Java, blocking calls like `get()` are no longer a performance concern. The JVM treats blocking operations in virtual threads as non-blocking at the OS level, so they scale massively even when blocking.

---

## Concept 4: Runnable vs Callable — Comparison

| Feature | Runnable | Callable |
|---------|----------|----------|
| Method to override | `run()` | `call()` |
| Return value | ❌ None | ✅ Generic type `V` |
| Checked exceptions | ❌ Cannot throw | ✅ Can throw |
| Executor method | `execute()` or `submit()` | `submit()` only |
| Result wrapper | N/A | `Future<V>` |
| Functional interface | ✅ Yes | ✅ Yes |

---

## Key Takeaways

✅ Use `Runnable` when you just need to execute a task without caring about the result

✅ Use `Callable` when you need a **return value** from your thread

✅ `Callable` tasks must be started with `submit()`, not `execute()`

✅ The result of a `Callable` is wrapped in a `Future` object — call `get()` to retrieve it

⚠️ `Future.get()` **blocks** the calling thread until the result is available — be mindful of this in performance-sensitive code

💡 Both `Runnable` and `Callable` are functional interfaces, so you can use lambda expressions with both
