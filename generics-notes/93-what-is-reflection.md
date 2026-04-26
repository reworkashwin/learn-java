# What is Reflection?

## Introduction

You've been working with classes, methods, and fields throughout your Java journey. But what if you need to **inspect and manipulate code at runtime** — without knowing the exact types at compile time? That's exactly what **reflection** enables. It's the foundational mechanism behind virtually every major Java framework — Spring, Hibernate, JUnit — and understanding it unlocks a deeper understanding of how these frameworks work under the hood.

---

## Concept 1: What is Reflection?

### 🧠 Definition

Reflection is the ability of a Java program to **examine and modify its own structure and behavior at runtime**. It lets you:

- Discover classes, methods, fields, and constructors dynamically
- Invoke methods by name (even private ones)
- Access and modify field values
- Create new instances of classes
- Read annotations

### 🌍 Real-world analogy

Think of reflection as an **X-ray machine** for your code. Normally, you can only interact with objects through their public interface — like seeing someone's clothes. Reflection lets you see the skeleton underneath — every field, every method, every constructor, even the private ones.

---

## Concept 2: Why Do We Need Reflection?

### ❓ The problem: We don't always know types at compile time

Java is an object-oriented language with inheritance and polymorphism. Consider this:

```java
public interface Vehicle { }
public class Car implements Vehicle { }
public class Bus implements Vehicle { }
```

When you program to an interface:

```java
Vehicle v = getVehicleFromSomewhere();
// Is v a Car? A Bus? Something else?
```

You don't know the **concrete type** at compile time. With reflection, you can find out:

```java
Class<?> clazz = v.getClass();
System.out.println(clazz.getName()); // "com.example.Car" or "com.example.Bus"
```

Now you can inspect its methods, fields, and constructors — all at runtime.

### 💡 This matters because...

In large applications, especially those using frameworks, classes are often instantiated dynamically based on configuration files, annotations, or user input. You can't hardcode every possibility.

---

## Concept 3: Where Reflection is Used

### ⚙️ Major frameworks built on reflection

| Framework | How it uses reflection |
|---|---|
| **JUnit** | Scans for methods annotated with `@Test` and invokes them automatically |
| **Spring** | Reads configuration, instantiates beans, injects dependencies — all via reflection |
| **Hibernate** | Maps Java objects to database tables by inspecting fields and annotations |

### 🧪 JUnit example

When you write:

```java
@Test
public void testSomething() { ... }
```

JUnit uses reflection to:
1. Find all methods with the `@Test` annotation
2. Create an instance of the test class
3. Invoke each test method dynamically

You never call `testSomething()` yourself — JUnit discovers and runs it through reflection.

---

## Concept 4: What Can Reflection Do?

Here's a preview of what you can accomplish with the Reflection API:

- **Get a class** → `object.getClass()`, `Class.forName("com.example.MyClass")`
- **Get fields** → `clazz.getFields()`, `clazz.getDeclaredFields()`
- **Get methods** → `clazz.getMethods()`, `clazz.getDeclaredMethods()`
- **Get constructors** → `clazz.getConstructors()`, `clazz.getDeclaredConstructors()`
- **Create instances** → `constructor.newInstance()`
- **Invoke methods** → `method.invoke(object, args)`
- **Read annotations** → `method.isAnnotationPresent(MyAnnotation.class)`
- **Access private members** → `field.setAccessible(true)`

We'll explore each of these in the coming notes: getting the `Class` object (note 94), fields (note 95), methods (note 96), private members (note 97), constructors and singletons (note 98), superclasses and interfaces (note 99), and annotations (note 100).

---

## ✅ Key Takeaways

- Reflection lets you inspect and manipulate classes, methods, and fields **at runtime**
- It exists because of object-oriented design — polymorphism means we don't always know concrete types at compile time
- Every major Java framework (Spring, Hibernate, JUnit) relies heavily on reflection
- Reflection can access **everything** — including private constructors, fields, and methods
- It's the mechanism behind dependency injection, annotation processing, and dynamic class loading

## ⚠️ Common Mistakes

- Thinking reflection is only for "advanced" use — understanding it is essential for understanding any framework
- Using reflection in performance-critical code without considering the overhead — it's slower than direct method calls
- Assuming private members are truly inaccessible — reflection can bypass access modifiers

## 💡 Pro Tips

- You don't need to use reflection directly in most applications — frameworks handle it for you
- Understanding reflection helps you debug framework behavior and write better annotations
- The `java.lang.reflect` package contains all the reflection classes: `Method`, `Field`, `Constructor`, etc.
