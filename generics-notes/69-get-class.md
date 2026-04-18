# Getting a Class with Reflection

## Introduction

Before you can inspect methods, fields, or constructors of a class using reflection, you first need to **get a reference to the class itself**. Java provides three different ways to obtain a `Class<?>` object, each suited to different scenarios. This is the starting point for all reflection operations.

---

## Concept 1: The Class\<T\> Object

### 🧠 What is it?

Every class in Java has an associated `Class` object that contains metadata about that class — its name, methods, fields, constructors, annotations, and more. The `Class` class itself is generic: `Class<T>`.

Key facts:
- `Class` objects are created automatically by the JVM when classes are loaded
- `Class` has **no public constructor** — you can't do `new Class<>()`
- Every object in Java can produce its `Class` via the `getClass()` method (inherited from `Object`)

---

## Concept 2: Three Ways to Get a Class

### Method 1: Using `.class` syntax (when you know the type at compile time)

```java
Class<Person> c = Person.class;
System.out.println(c.getName());
// Output: com.example.Person
```

This is the simplest approach — you directly reference the class. Use this when you **know the exact class** you want to inspect.

### Method 2: Using `Class.forName()` (when you have the class name as a String)

```java
Class<?> personClass = Class.forName("com.example.Person");
System.out.println(personClass.getName());
// Output: com.example.Person
```

You provide the **fully qualified class name** (package + class name) as a string. This is the approach **most heavily used by frameworks** like Spring, because the class name often comes from a configuration file rather than being hardcoded.

Note: This can throw a `ClassNotFoundException`, so it must be wrapped in a try-catch:

```java
try {
    Class<?> personClass = Class.forName("com.example.Person");
} catch (ClassNotFoundException e) {
    e.printStackTrace();
}
```

Also note: the type parameter must be `<?>` (wildcard) because you can't know the type at compile time.

### Method 3: Using `getClass()` (when you have an object but don't know its exact type)

```java
public static void checkClass(Vehicle vehicle) {
    Class<?> c = vehicle.getClass();
    System.out.println(c.getName());
}

checkClass(new Car());  // Output: com.example.Car
checkClass(new Bus());  // Output: com.example.Bus
```

This is the most powerful approach for **polymorphic situations**. You have a reference typed as `Vehicle`, but at runtime you discover the actual class is `Car` or `Bus`.

---

## Concept 3: Comparing the Three Approaches

| Approach | When to use | Type safety | Needs try-catch? |
|---|---|---|---|
| `MyClass.class` | You know the exact class at compile time | `Class<MyClass>` | No |
| `Class.forName("...")` | Class name comes from config/string | `Class<?>` | Yes (`ClassNotFoundException`) |
| `object.getClass()` | You have an object, don't know its runtime type | `Class<?>` | No |

---

## Concept 4: What Can You Do with a Class Object?

Once you have a `Class<?>` reference, you can:

```java
Class<?> c = Person.class;

c.getName();              // Full name: "com.example.Person"
c.getSimpleName();        // Short name: "Person"
c.getMethods();           // All public methods (including inherited)
c.getDeclaredMethods();   // All methods declared in this class (including private)
c.getFields();            // All public fields
c.getDeclaredFields();    // All fields (including private)
c.getConstructors();      // All public constructors
c.getDeclaredConstructors(); // All constructors (including private)
```

---

## ✅ Key Takeaways

- You need a `Class<?>` object before you can use any reflection operations
- Three ways: `MyClass.class`, `Class.forName("full.path")`, `object.getClass()`
- `Class.forName()` is the framework favorite — it loads classes dynamically from string names
- `getClass()` reveals the runtime type in polymorphic scenarios
- `Class` objects are created by the JVM automatically — you never instantiate them yourself

## ⚠️ Common Mistakes

- Forgetting the full package path in `Class.forName()` — `"Person"` won't work, you need `"com.example.Person"`
- Not handling `ClassNotFoundException` when using `Class.forName()`
- Confusing `getClass()` with `instanceof` — `getClass()` gives the exact runtime type, `instanceof` checks type hierarchy

## 💡 Pro Tips

- `Class.forName()` also triggers class loading and static initialization — this is how JDBC drivers used to be loaded
- In Spring's XML config, `<bean class="com.example.MyClass">` uses `Class.forName()` under the hood
- `getSimpleName()` is useful for logging — it returns just the class name without the package
