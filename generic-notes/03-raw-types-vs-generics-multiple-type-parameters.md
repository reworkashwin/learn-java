# Raw Types vs Generics and Multiple Type Parameters

## Introduction

In previous lectures, we learned the basics of generics using a single type parameter. But what if we need more than one type? And what happens if we skip generics altogether and use "raw types"? 

In this section, we'll explore the difference between raw types and generic types, understand why casting is necessary with raw types, and then level up by creating a class with **multiple generic type parameters**. By the end, you'll understand why modern Java code always uses generics and how to work with classes that need more than one type.

---

## Concept 1: Understanding Raw Types

### 🧠 What is a raw type?

A **raw type** is when you use a generic class without specifying its type parameters. Let's say we have a `Store` class that can hold items:

```java
// Generic version (proper way)
Store<Double> store = new Store<>();

// Raw type version (old way)
Store store = new Store();  // No type specified!
```

The second version is a **raw type**—we're using the `Store` class without the `<Double>` part.

### ❓ Why would anyone use raw types?

Raw types exist for **backwards compatibility**. Before Java 5 (2004), generics didn't exist! All code was written without type parameters. When generics were introduced, Java had to support old code, so raw types still work.

But just because they work doesn't mean you should use them.

### ⚙️ What happens with raw types?

When you use a raw type, Java treats it as storing `Object` types. This means:

1. **You can store anything** – No type safety
2. **You must cast when retrieving** – Java doesn't know what type you stored

### 🧪 Example: Raw Type with Store

```java
// Using raw type
Store store = new Store();  // No <Double> specified
store.set(45.7);  // Can store anything

// Getting the value requires casting
double value = (double) store.get();  // Manual cast needed!
```

Compare this to the generic version:

```java
// Using generics
Store<Double> store = new Store<>();
store.set(45.7);  // Only doubles allowed

double value = store.get();  // No cast needed!
```

### 💡 Insight

Raw types are like removing the safety labels from everything in your garage. Sure, you can still use the tools, but you've lost important information about what each tool is for—and you're more likely to use the wrong tool for the job.

---

## Concept 2: Raw Types with Collections

### 🧠 What are collections?

Collections are Java's way of storing groups of objects—things like lists, sets, and maps. We'll cover collections in depth in a future chapter, but for now, let's see how raw types affect them.

### ⚙️ How raw types work with List

**With raw types:**
```java
List list = new ArrayList();  // No type specified
list.add(10);
list.add(20);
list.add(30);

// Getting items requires casting
Integer number = (Integer) list.get(0);  // Must cast!
```

**With generics:**
```java
List<Integer> list = new ArrayList<>();  // Type specified
list.add(10);
list.add(20);
list.add(30);

Integer number = list.get(0);  // No cast needed!
```

### ❓ What's the difference?

- `List` is the **interface** (the contract, the specification)
- `ArrayList` is the **concrete implementation** (the actual class that does the work)

When we write `List<Integer> list = new ArrayList<>();`, we're saying:
- "I want a list that holds integers"
- "Use ArrayList as the implementation"

### 🧪 Example: The Casting Problem

```java
// Raw type - look at all this casting!
List list = new ArrayList();
list.add("Hello");
list.add(123);
list.add(45.7);

String text = (String) list.get(0);     // Cast to String
Integer num = (Integer) list.get(1);    // Cast to Integer
Double value = (Double) list.get(2);    // Cast to Double
```

Every single retrieval requires a cast! And worse—what if you cast wrong?

```java
String text = (String) list.get(1);  // Runtime error! It's an Integer!
```

### 💡 Insight

With raw types, the compiler can't help you. It's like driving without road signs—you might get where you're going, but you're taking unnecessary risks. With generics, the compiler becomes your copilot, warning you before you make a wrong turn.

---

## Concept 3: Moving Beyond Single Type Parameters

### 🧠 What if we need more than one type?

So far, we've seen classes with a single generic type:
- `Store<Double>` – One type for the item stored
- `List<String>` – One type for the list elements

But what if we need to store **pairs** of values, where each value has a different type?

### ❓ Why would we need multiple type parameters?

Consider a **hash table** (also called a hash map)—a data structure that stores **key-value pairs**:

- **Key**: Used to look up the value (like a dictionary word)
- **Value**: The data associated with the key (like the definition)

Example: A phone book
- **Key**: Person's name (String)
- **Value**: Phone number (String)

Or product inventory:
- **Key**: Product name (String)
- **Value**: Quantity in stock (Integer)

The key and value can be **different types**! This is where multiple type parameters shine.

### 💡 Insight

Think of single type parameters as a box that holds one type of thing. Multiple type parameters are like a filing cabinet with different drawers—each drawer can hold a different type of thing.

---

## Concept 4: Creating a Class with Multiple Type Parameters

### 🧠 What are we building?

Let's create a simple `HashTable` class that stores key-value pairs. We'll need **two generic types**:
- One for the key
- One for the value

### ⚙️ How to define multiple type parameters

```java
public class HashTable<K, V> {
    private K key;
    private V value;
    
    // Constructor
    public HashTable(K key, V value) {
        this.key = key;
        this.value = value;
    }
    
    // Override toString for easy printing
    @Override
    public String toString() {
        return this.key + " : " + this.value;
    }
}
```

### 📝 Breaking it down

**Step 1: Define the type parameters**
```java
public class HashTable<K, V> {
```
- `<K, V>` means this class uses TWO generic types
- `K` is conventionally used for "Key"
- `V` is conventionally used for "Value"
- You can use any capital letters, but conventions help readability

**Step 2: Use the type parameters as field types**
```java
private K key;
private V value;
```
- `K` is now a type we can use, just like `String` or `Integer`
- `V` is another type we can use
- They can be the same or different actual types when we create an instance

**Step 3: Use them in the constructor**
```java
public HashTable(K key, V value) {
    this.key = key;
    this.value = value;
}
```
- The constructor accepts parameters of type `K` and `V`
- When we create a `HashTable`, we'll specify what `K` and `V` actually are

**Step 4: Override toString**
```java
@Override
public String toString() {
    return this.key + " : " + this.value;
}
```
- This method is called automatically when we print the object
- It concatenates the key and value with a colon separator

### 💡 Insight

**Important naming note**: Be careful with class names! Java already has a `Hashtable` class (with lowercase 't'), so we use `HashTable` with capital 'T' to avoid conflicts. Always check that your class names don't collide with existing Java classes.

---

## Concept 5: Using the Multiple Type Parameters

### 🧪 Example 1: String Key, Integer Value

```java
// Create a hash table with String keys and Integer values
HashTable<String, Integer> table1 = new HashTable<>("Apple", 23);
System.out.println(table1);  // Output: Apple : 23
```

**What's happening:**
- `HashTable<String, Integer>` – We specify `K` is String, `V` is Integer
- `new HashTable<>()` – The diamond operator `<>` infers the types
- `"Apple"` – A String for the key
- `23` – An Integer for the value

### 🧪 Example 2: Integer Key, Double Value

```java
// Create a hash table with Integer keys and Double values
HashTable<Integer, Double> table2 = new HashTable<>(20, 23.4);
System.out.println(table2);  // Output: 20 : 23.4
```

**What's happening:**
- `K` is now Integer
- `V` is now Double
- The same class works with completely different types!

### 🧪 Example 3: Compile-Time Type Safety

What happens if we try to use the wrong types?

```java
HashTable<String, Integer> table = new HashTable<>("Apple", 23);

// Later, trying to change it...
table = new HashTable<>(100, 45.7);  // ❌ Compile error!
```

**Error**: Type mismatch! We declared it as `<String, Integer>`, but we're trying to pass `<Integer, Double>`.

The compiler catches this mistake **before we run the code**. This is the power of generics!

### ⚙️ How the diamond operator works

Notice we can write:
```java
HashTable<String, Integer> table = new HashTable<>("Apple", 23);
```

Instead of:
```java
HashTable<String, Integer> table = new HashTable<String, Integer>("Apple", 23);
```

The `<>` diamond operator on the right side lets Java **infer** the types from the left side. It knows you mean `<String, Integer>` because that's what you declared.

### 💡 Insight

The diamond operator `<>` was added in Java 7 to reduce redundancy. Before that, you had to write the types twice. The compiler is smart enough to figure it out from context.

---

## Concept 6: Comparing Raw Types vs Generics

### 🔍 Raw Type Version (Don't do this!)

```java
// No type parameters specified
HashTable table = new HashTable("Apple", 23);

// Problems:
// 1. No compile-time type checking
// 2. Would need casting if we had getters
// 3. Could accidentally mix incompatible types
```

### ✅ Generic Version (The right way!)

```java
// Type parameters specified
HashTable<String, Integer> table = new HashTable<>("Apple", 23);

// Benefits:
// 1. Compile-time type checking
// 2. No casting needed
// 3. Can't accidentally use wrong types
```

### 💡 Insight

Raw types are like writing in invisible ink—everything looks fine until you try to read it and realize you can't see what you wrote. Generics are like writing in normal ink with clear labels—you know exactly what you have at all times.

---

## Concept 7: How Many Type Parameters Can You Have?

### ❓ Is there a limit?

You can use as many type parameters as you need!

```java
// Two type parameters
public class HashTable<K, V> { }

// Three type parameters
public class Triple<A, B, C> { }

// Four type parameters
public class Quad<T, U, V, W> { }

// And so on...
```

### ⚙️ Example with three types

```java
public class HashTable<K, V, M> {
    private K key;
    private V value;
    private M metadata;
    
    public HashTable(K key, V value, M metadata) {
        this.key = key;
        this.value = value;
        this.metadata = metadata;
    }
}

// Usage
HashTable<String, Integer, Boolean> table = 
    new HashTable<>("Apple", 23, true);
```

### 💡 Insight

**But just because you CAN use many type parameters doesn't mean you SHOULD**. If you find yourself using more than 2-3 type parameters, consider whether your class is trying to do too much. Sometimes it's better to break it into smaller, simpler classes.

---

## ✅ Key Takeaways

1. **Raw types are obsolete** – They exist for backwards compatibility, but modern code should always use generics

2. **Casting is a red flag** – If you're casting when retrieving from collections, you're probably using raw types

3. **Multiple type parameters are powerful** – Use them when you need to store different types together (like key-value pairs)

4. **Naming conventions matter** – Use `K` for keys, `V` for values, `T` for generic types, `E` for elements

5. **The diamond operator simplifies code** – `<>` lets the compiler infer types, reducing redundancy

6. **Compile-time safety is the goal** – Generics move errors from runtime to compile time

---

## ⚠️ Common Mistakes

- **Using raw types in new code** – Always specify type parameters: `List<String>`, not `List`

- **Assuming K and V are special** – They're just conventions. You could use `<A, B>`, but `<K, V>` is clearer for key-value pairs

- **Forgetting to specify types on both sides** – Before Java 7, you had to write types twice. Now the diamond operator `<>` does it for you

- **Mixing raw and generic types** – Pick one approach and stick with it (always choose generics!)

---

## 💡 Pro Tips

- **Learn the conventions**:
  - `T` – Type (generic type)
  - `E` – Element (used in collections)
  - `K` – Key (in maps)
  - `V` – Value (in maps)
  - `N` – Number
  - `S`, `U`, `V` – Additional types when you need more than one

- **Use the diamond operator** – Write `new HashTable<>()` instead of repeating types

- **Always specify types in declarations** – Help your IDE and the compiler help you

- **Think of type parameters as variables** – Just like method parameters are values that vary, type parameters are types that vary

---

## 🎯 Real-World Connection

### Where will you see multiple type parameters?

**1. Maps and Hash Tables**
```java
Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);
scores.put("Bob", 87);
```

**2. Pairs and Tuples**
```java
Pair<String, Date> event = new Pair<>("Birthday", new Date());
```

**3. Generic Methods**
```java
public <K, V> V getValueByKey(K key, Map<K, V> map) {
    return map.get(key);
}
```

**4. Complex Data Structures**
```java
Map<String, List<Integer>> nameToScores = new HashMap<>();
```

### 💡 Insight

As you advance in Java, you'll see generics everywhere—in collections, streams, Spring Framework, and most modern libraries. Understanding multiple type parameters is essential for reading and writing professional Java code.

---

## 🎯 What's Next?

We've covered:
- ✅ Raw types vs generic types
- ✅ Why casting is necessary with raw types
- ✅ Creating classes with multiple type parameters
- ✅ Using `<K, V>` for key-value pairs

In upcoming lectures, we'll explore:
- Bounded type parameters (`<T extends Number>`)
- Wildcards (`? extends` and `? super`)
- Generic methods in detail
- Type erasure and how generics work under the hood
- Best practices for using generics in real applications

The more you understand generics, the more you'll appreciate how they make Java code safer, cleaner, and more maintainable!