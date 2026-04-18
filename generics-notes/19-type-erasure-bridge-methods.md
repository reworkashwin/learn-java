# Type Erasure and Bridge Methods — Maintaining Polymorphism

## Introduction

Type erasure removes generic types from bytecode. But what happens when a subclass overrides a method from a generic parent class? The erased signatures won't match. Java solves this with **bridge methods** — compiler-generated methods that preserve polymorphism after type erasure.

---

## Concept 1: The Problem Setup

### ⚙️ A generic parent class

```java
public class Node<T> {
    private T data;

    public Node(T data) {
        this.data = data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
```

### ⚙️ A specific child class

```java
public class MyNode extends Node<Integer> {

    public MyNode(Integer data) {
        super(data);
    }

    @Override
    public void setData(Integer data) {
        super.setData(data);
    }
}
```

`MyNode` extends `Node<Integer>` and overrides `setData()` to accept specifically `Integer`.

---

## Concept 2: What Type Erasure Does

### After erasure — Parent class

```java
public class Node {
    private Object data;        // T → Object (unbounded)

    public Node(Object data) {
        this.data = data;
    }

    public void setData(Object data) {   // T → Object
        this.data = data;
    }
}
```

### After erasure — Child class

```java
public class MyNode extends Node {

    public MyNode(Integer data) {
        super(data);
    }

    public void setData(Integer data) {   // Still Integer!
        super.setData(data);
    }
}
```

### ❓ See the problem?

| Class | Method Signature |
|-------|-----------------|
| `Node` (parent) | `setData(Object data)` |
| `MyNode` (child) | `setData(Integer data)` |

These are **different methods** — `setData(Object)` and `setData(Integer)` are not the same signature. The child's method doesn't actually override the parent's method anymore. Polymorphism is broken!

---

## Concept 3: Bridge Methods to the Rescue

### 🧠 What is it?

The Java compiler automatically generates a **bridge method** in `MyNode` to fix the signature mismatch:

```java
// Compiler-generated bridge method
public void setData(Object data) {
    setData((Integer) data);   // Cast and delegate to the real method
}
```

### ⚙️ The complete picture after type erasure

```java
public class MyNode extends Node {

    public MyNode(Integer data) {
        super(data);
    }

    // The actual method you wrote
    public void setData(Integer data) {
        super.setData(data);
    }

    // Bridge method (compiler-generated)
    public void setData(Object data) {
        setData((Integer) data);  // Cast + delegate
    }
}
```

### 💡 How it works

1. When `setData(Object)` is called on a `MyNode` instance (polymorphically), the **bridge method** catches the call
2. The bridge method **casts** the `Object` to `Integer`
3. It delegates to the real `setData(Integer)` method
4. Polymorphism is preserved!

---

## Concept 4: Why You Should Care

### Do you ever write bridge methods?

**No.** The compiler generates them automatically. You'll never see them in your source code.

### When do they matter?

- **Interviews** — Understanding bridge methods demonstrates deep knowledge of Java internals
- **Debugging** — If you see unexpected methods in stack traces, they might be bridge methods
- **Reflection** — If you inspect methods via reflection, bridge methods appear alongside real methods (use `Method.isBridge()` to filter them)

---

## Concept 5: Visualizing the Flow

```
Polymorphic call: node.setData(someObject)
         │
         ▼
┌─────────────────────────┐
│ Bridge method            │
│ setData(Object data)     │
│   → cast to Integer      │
│   → call setData(Integer)│
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Your actual method       │
│ setData(Integer data)    │
│   → super.setData(data)  │
└─────────────────────────┘
```

---

## ✅ Key Takeaways

- Type erasure can break method overriding when parent and child have different erased signatures
- The Java compiler generates **bridge methods** to maintain polymorphism
- Bridge methods cast `Object` to the specific type and delegate to the real method
- You never write bridge methods — the compiler handles it transparently

## ⚠️ Common Mistakes

- Thinking bridge methods are something you need to write manually — they're automatic
- Confusing bridge methods with regular method overloading — bridge methods exist solely due to type erasure
- Being surprised by extra methods in reflection results — use `Method.isBridge()` to identify them

## 💡 Pro Tip

Bridge methods are a great example of how Java's generics are a **compile-time illusion**. The compiler does significant work (type checking, inserting casts, generating bridge methods) so that your runtime bytecode works correctly with plain `Object` types. Understanding this gives you a complete mental model of how generics actually function.
