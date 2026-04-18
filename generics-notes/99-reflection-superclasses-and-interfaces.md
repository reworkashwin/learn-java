# Superclasses and Interfaces (Reflection)

## Introduction

In the previous section, we used reflection to inspect and manipulate **fields**. Now let's go up the class hierarchy. Reflection lets you discover a class's **superclass**, walk the entire **inheritance chain**, and find all the **interfaces** a class implements — all at runtime. This is how frameworks determine whether your class is serializable, what behaviors it inherits, and how to wire dependencies.

---

## Concept 1: Getting the Superclass

### 🧠 What is it?

Every class in Java (except `Object`) has exactly one superclass. The `getSuperclass()` method returns the immediate parent class.

### ⚙️ How it works

```java
public class Animal {
    protected String name;
}

public class Dog extends Animal {
    private String breed;
}

public class GoldenRetriever extends Dog {
    private boolean trained;
}
```

```java
Class<?> clazz = GoldenRetriever.class;

// Immediate superclass
Class<?> parent = clazz.getSuperclass();
System.out.println(parent.getSimpleName());  // Dog

// Grandparent
Class<?> grandparent = parent.getSuperclass();
System.out.println(grandparent.getSimpleName());  // Animal

// Great-grandparent — everyone's root
Class<?> root = grandparent.getSuperclass();
System.out.println(root.getSimpleName());  // Object

// Object's superclass is null
System.out.println(root.getSuperclass());  // null
```

### 💡 Insight

`Object.class.getSuperclass()` returns `null` — it's the top of the hierarchy. Interfaces and primitive types also return `null` from `getSuperclass()`.

---

## Concept 2: Walking the Full Inheritance Chain

### 🧠 What is it?

Often you need to traverse the **entire** class hierarchy — from a given class up to `Object`. This is useful for finding inherited fields, methods, or annotations.

### ⚙️ How it works

```java
public static List<Class<?>> getClassHierarchy(Class<?> clazz) {
    List<Class<?>> hierarchy = new ArrayList<>();
    Class<?> current = clazz;
    
    while (current != null) {
        hierarchy.add(current);
        current = current.getSuperclass();
    }
    
    return hierarchy;
}
```

```java
List<Class<?>> chain = getClassHierarchy(GoldenRetriever.class);
chain.forEach(c -> System.out.println(c.getSimpleName()));
// GoldenRetriever
// Dog
// Animal
// Object
```

### 🧪 Practical Example — Finding ALL Fields (Including Inherited)

Remember that `getDeclaredFields()` only returns fields declared in *that specific class*. To get inherited fields, you need to walk up the hierarchy:

```java
public static List<Field> getAllFields(Class<?> clazz) {
    List<Field> fields = new ArrayList<>();
    Class<?> current = clazz;
    
    while (current != null && current != Object.class) {
        fields.addAll(Arrays.asList(current.getDeclaredFields()));
        current = current.getSuperclass();
    }
    
    return fields;
}
```

```java
List<Field> allFields = getAllFields(GoldenRetriever.class);
allFields.forEach(f -> System.out.println(f.getName() + " from " + 
    f.getDeclaringClass().getSimpleName()));
// trained from GoldenRetriever
// breed from Dog
// name from Animal
```

This is exactly how JSON serialization libraries like Jackson discover all fields to serialize.

---

## Concept 3: Getting Interfaces

### 🧠 What is it?

A class can implement multiple interfaces, and `getInterfaces()` returns them all. But it only returns the interfaces **directly** implemented by that class — not those inherited from a superclass.

### ⚙️ How it works

```java
public interface Swimmable {
    void swim();
}

public interface Trainable {
    void train();
}

public class Animal implements Serializable {
    // ...
}

public class Dog extends Animal implements Trainable {
    // ...
}

public class GoldenRetriever extends Dog implements Swimmable {
    // ...
}
```

```java
// Direct interfaces only
Class<?>[] interfaces = GoldenRetriever.class.getInterfaces();
for (Class<?> iface : interfaces) {
    System.out.println(iface.getSimpleName());
}
// Swimmable  (only the directly implemented one)
```

To find `Trainable` and `Serializable`, you need to check `Dog.class.getInterfaces()` and `Animal.class.getInterfaces()`:

```java
System.out.println(Arrays.toString(Dog.class.getInterfaces()));
// [Trainable]

System.out.println(Arrays.toString(Animal.class.getInterfaces()));
// [Serializable]
```

---

## Concept 4: Finding ALL Interfaces (Including Inherited)

### 🧠 What is it?

To get every interface a class supports — directly or through inheritance — you need to walk both the class hierarchy and each class's interfaces recursively.

### ⚙️ How it works

```java
public static Set<Class<?>> getAllInterfaces(Class<?> clazz) {
    Set<Class<?>> interfaces = new LinkedHashSet<>();
    Class<?> current = clazz;
    
    while (current != null) {
        for (Class<?> iface : current.getInterfaces()) {
            interfaces.add(iface);
            // Interfaces can extend other interfaces
            collectSuperInterfaces(iface, interfaces);
        }
        current = current.getSuperclass();
    }
    
    return interfaces;
}

private static void collectSuperInterfaces(Class<?> iface, Set<Class<?>> result) {
    for (Class<?> superIface : iface.getInterfaces()) {
        if (result.add(superIface)) {
            collectSuperInterfaces(superIface, result);
        }
    }
}
```

```java
Set<Class<?>> allInterfaces = getAllInterfaces(GoldenRetriever.class);
allInterfaces.forEach(i -> System.out.println(i.getSimpleName()));
// Swimmable
// Trainable
// Serializable
```

### 💡 Insight

Java's `instanceof` operator checks the entire hierarchy. Reflection lets you do the same thing programmatically:

```java
// Runtime equivalent of "obj instanceof Serializable"
boolean isSerializable = Serializable.class.isAssignableFrom(GoldenRetriever.class);
System.out.println(isSerializable);  // true
```

`isAssignableFrom()` checks the complete chain — it returns `true` if the class is a subclass or implements the interface anywhere in its hierarchy.

---

## Concept 5: Practical Use Cases

### 🧠 What is it?

Here are real-world scenarios where superclass and interface reflection is essential.

### ⚙️ Checking if a class implements a specific interface

```java
public static boolean implementsInterface(Class<?> clazz, Class<?> target) {
    return target.isAssignableFrom(clazz);
}

System.out.println(implementsInterface(ArrayList.class, List.class));       // true
System.out.println(implementsInterface(ArrayList.class, Serializable.class)); // true
System.out.println(implementsInterface(ArrayList.class, Map.class));         // false
```

### ⚙️ Finding all concrete classes of an interface (plugin discovery)

Frameworks scan classpath to find all implementations of an interface:

```java
// Pseudocode — frameworks like Spring do this
for (Class<?> clazz : allClassesInPackage) {
    if (MyPlugin.class.isAssignableFrom(clazz) && !clazz.isInterface()) {
        MyPlugin plugin = (MyPlugin) clazz.getDeclaredConstructor().newInstance();
        plugins.add(plugin);
    }
}
```

### ⚙️ Inspecting generic superclass type parameters

When a class extends a generic type, you can discover the actual type arguments:

```java
public abstract class Repository<T> { }
public class UserRepository extends Repository<User> { }

Type superclass = UserRepository.class.getGenericSuperclass();
if (superclass instanceof ParameterizedType) {
    ParameterizedType pt = (ParameterizedType) superclass;
    Type[] typeArgs = pt.getActualTypeArguments();
    System.out.println(typeArgs[0]);  // class User
}
```

This is how Hibernate determines the entity type of a generic DAO without you explicitly specifying it.

---

## ✅ Key Takeaways

- `getSuperclass()` returns the immediate parent class; returns `null` for `Object`, interfaces, and primitives
- `getInterfaces()` returns only **directly** implemented interfaces — not inherited ones
- Walk the full hierarchy to find all fields, methods, and interfaces
- `isAssignableFrom()` is the reflective equivalent of `instanceof` — checks the entire hierarchy
- `getGenericSuperclass()` reveals actual type arguments of generic parent classes
- Frameworks rely heavily on hierarchy reflection for dependency injection, plugin discovery, and ORM mapping
- Use `LinkedHashSet` when collecting interfaces to maintain discovery order and avoid duplicates
