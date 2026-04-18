# Reflection: Getting Methods

## Introduction

Now that we know how to obtain a `Class<?>` object, let's put it to use. One of the most common reflection tasks is **discovering the methods** a class has. This is exactly what testing frameworks like JUnit do — they scan classes for methods annotated with `@Test`. In this note, we'll learn how to list all methods of a class, including their names and return types.

---

## Concept 1: Getting Methods from a Class

### 🧠 What is getMethods()?

The `getMethods()` method returns an array of `Method` objects representing all **public methods** of the class — including methods inherited from parent classes (like `Object`).

### 🧪 Example

Given a `Person` class with some getters, setters, and a custom method:

```java
public class Person {
    private String name;
    private int age;

    // getters, setters...

    public String returnName() {
        return this.name + " is the name";
    }
}
```

We can inspect it:

```java
Class<Person> personClass = Person.class;

Method[] methods = personClass.getMethods();

for (Method m : methods) {
    System.out.println(m.getName() + " → " + m.getReturnType());
}
```

### 📊 Output

```
getName → class java.lang.String
setName → void
getAge → int
setAge → void
returnName → class java.lang.String
hashCode → int
equals → boolean
toString → class java.lang.String
getClass → class java.lang.Class
wait → void
notify → void
notifyAll → void
```

### 💡 Why are there extra methods?

Every Java class extends `Object`. So `getMethods()` also returns methods from `Object`:
- `hashCode()`, `equals()` — for comparing objects
- `toString()` — for string representation
- `getClass()` — the reflection method we already know
- `wait()`, `notify()`, `notifyAll()` — multithreading methods

---

## Concept 2: Method Object — What Can You Learn?

The `Method` class from `java.lang.reflect` provides rich metadata:

```java
for (Method m : methods) {
    m.getName();           // Method name: "getName"
    m.getReturnType();     // Return type: String.class
    m.getParameterTypes(); // Parameter types: [String.class] for setName
    m.getModifiers();      // Access modifiers: public, private, etc.
}
```

You can discover everything about a method — its name, what it returns, what parameters it takes, and whether it's public, private, static, etc.

---

## Concept 3: getMethods() vs getDeclaredMethods()

| Method | Returns | Includes inherited? | Includes private? |
|---|---|---|---|
| `getMethods()` | All **public** methods | Yes (from `Object`, interfaces, superclasses) | No |
| `getDeclaredMethods()` | Methods **declared in this class** | No | Yes |

If you only care about methods defined in the `Person` class (not inherited ones), use `getDeclaredMethods()`:

```java
Method[] declaredMethods = personClass.getDeclaredMethods();
```

This gives you `getName`, `setName`, `getAge`, `setAge`, `returnName` — but **not** `hashCode`, `equals`, `wait`, etc.

---

## ✅ Key Takeaways

- `getMethods()` returns all **public** methods, including those inherited from `Object`
- `getDeclaredMethods()` returns only methods **declared in the class itself**, including private ones
- Each `Method` object exposes name, return type, parameters, and modifiers
- The `Method` class lives in `java.lang.reflect`
- This is how frameworks discover annotated methods like `@Test`, `@GetMapping`, etc.

## ⚠️ Common Mistakes

- Using `getMethods()` and being surprised by `wait()`, `notify()`, `hashCode()` — those come from `Object`
- Assuming `getMethods()` returns private methods — it doesn't; use `getDeclaredMethods()` for that
- Forgetting to import `java.lang.reflect.Method`

## 💡 Pro Tips

- Use `getDeclaredMethods()` when you want to analyze only the class's own methods
- Combine with `isAnnotationPresent()` to find annotated methods — the foundation of annotation-driven frameworks
- `Method.invoke(object, args)` lets you call a method dynamically — even one discovered at runtime
