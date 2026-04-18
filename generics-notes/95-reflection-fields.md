# Fields (Reflection)

## Introduction

Java Reflection lets you inspect and manipulate classes at **runtime** — breaking the normal compile-time rules. One of its most practical uses is accessing **fields** — reading their values, modifying them, and even accessing `private` fields that would normally be off-limits. This is powerful but dangerous territory. Let's understand how field reflection works and when it's appropriate to use.

---

## Concept 1: What is Reflection?

### 🧠 What is it?

Reflection is Java's mechanism for examining and modifying the structure and behavior of classes, interfaces, fields, and methods **at runtime** — without knowing them at compile time.

### ❓ Why do we need it?

- **Frameworks** like Spring and Hibernate use reflection to inject dependencies, map database columns to fields, and configure beans — all without knowing your classes at compile time
- **Testing frameworks** like JUnit use reflection to discover and invoke test methods
- **Serialization libraries** like Jackson use reflection to convert objects to JSON and back
- **IDEs** use reflection for code completion and debugging

### 💡 Insight

Think of a class as a **locked box**. Normally, you can only interact with it through its public API (methods and constructors). Reflection gives you a **master key** — you can open the box, look inside, and even change what's in there.

---

## Concept 2: Getting the Class Object

### 🧠 What is it?

Every reflection operation starts with a `Class<?>` object — the runtime representation of a class.

### ⚙️ How it works

```java
// Three ways to get a Class object

// 1. From a class literal
Class<String> clazz1 = String.class;

// 2. From an instance
String s = "hello";
Class<?> clazz2 = s.getClass();

// 3. From a fully qualified class name (can throw ClassNotFoundException)
Class<?> clazz3 = Class.forName("java.lang.String");
```

---

## Concept 3: Accessing Fields

### 🧠 What is it?

The `Class` object provides methods to discover and access the fields declared in a class.

### ⚙️ How it works

```java
public class Person {
    public String name;
    private int age;
    protected String email;
    static int count = 0;
}
```

```java
Class<Person> clazz = Person.class;

// Get ALL declared fields (including private) — only this class, not inherited
Field[] declaredFields = clazz.getDeclaredFields();
for (Field f : declaredFields) {
    System.out.println(f.getName() + " | Type: " + f.getType().getSimpleName()
        + " | Modifiers: " + Modifier.toString(f.getModifiers()));
}
```

Output:
```
name | Type: String | Modifiers: public
age | Type: int | Modifiers: private
email | Type: String | Modifiers: protected
count | Type: int | Modifiers: static
```

### Key Methods

| Method | Description |
|--------|-------------|
| `getFields()` | All **public** fields (including inherited) |
| `getDeclaredFields()` | All fields declared in **this class** (any visibility, not inherited) |
| `getField("name")` | A specific public field by name |
| `getDeclaredField("age")` | A specific declared field by name (any visibility) |

### ⚠️ Common Mistake

`getFields()` only returns public fields. If you're looking for private fields, you must use `getDeclaredFields()`. Confusing these two is a frequent source of "field not found" errors.

---

## Concept 4: Reading and Writing Field Values

### 🧠 What is it?

Once you have a `Field` object, you can read and modify the value of that field on any instance — even private fields.

### ⚙️ How it works

```java
Person person = new Person();
person.name = "Alice";

// Reading a public field
Field nameField = Person.class.getDeclaredField("name");
String nameValue = (String) nameField.get(person);
System.out.println("Name: " + nameValue);  // Alice

// Writing to a public field
nameField.set(person, "Bob");
System.out.println("New name: " + person.name);  // Bob

// Accessing a PRIVATE field
Field ageField = Person.class.getDeclaredField("age");
ageField.setAccessible(true);  // bypass access control
ageField.set(person, 30);
int age = (int) ageField.get(person);
System.out.println("Age: " + age);  // 30
```

### 💡 Insight

`setAccessible(true)` is the magic line that lets you access `private` fields. Without it, you get an `IllegalAccessException`. This is how frameworks like Hibernate set private fields without requiring setters.

### ⚠️ Common Mistake

With Java modules (Java 9+), `setAccessible(true)` may throw `InaccessibleObjectException` if the module doesn't export/open the package. You may need to add `--add-opens` JVM flags.

---

## Concept 5: Inspecting Field Metadata

### 🧠 What is it?

Beyond reading/writing values, you can inspect a field's type, annotations, modifiers, and generic type information.

### ⚙️ How it works

```java
Field ageField = Person.class.getDeclaredField("age");

// Type information
System.out.println("Type: " + ageField.getType());              // int
System.out.println("Generic type: " + ageField.getGenericType()); // int

// Modifiers
int modifiers = ageField.getModifiers();
System.out.println("Is private: " + Modifier.isPrivate(modifiers));  // true
System.out.println("Is static: " + Modifier.isStatic(modifiers));    // false
System.out.println("Is final: " + Modifier.isFinal(modifiers));      // false

// Annotations
if (ageField.isAnnotationPresent(Deprecated.class)) {
    System.out.println("This field is deprecated");
}
```

### 🧪 Practical Example — Simple Object Printer

```java
public static void printAllFields(Object obj) throws Exception {
    Class<?> clazz = obj.getClass();
    System.out.println("=== " + clazz.getSimpleName() + " ===");
    
    for (Field field : clazz.getDeclaredFields()) {
        field.setAccessible(true);
        System.out.printf("  %s (%s) = %s%n",
            field.getName(),
            field.getType().getSimpleName(),
            field.get(obj));
    }
}

// Usage
printAllFields(new Person("Alice", 30));
// === Person ===
//   name (String) = Alice
//   age (int) = 30
//   email (String) = null
//   count (int) = 0
```

This is exactly how debugging tools and `toString()` generators work under the hood.

---

## ✅ Key Takeaways

- Reflection starts with getting a `Class<?>` object via `.class`, `.getClass()`, or `Class.forName()`
- `getDeclaredFields()` returns all fields in the class; `getFields()` returns only public ones (including inherited)
- Use `field.get(instance)` and `field.set(instance, value)` to read/write values
- `setAccessible(true)` bypasses access control — enables access to private fields
- Reflection is used heavily by frameworks (Spring, Hibernate, Jackson, JUnit)
- Use reflection sparingly in application code — it's slow, bypasses type safety, and breaks encapsulation
