# Generic Methods

## Introduction

We've learned how to create generic classes—classes that can work with different types. But what if you want a **single method** to be generic, without making the entire class generic? Or what if your generic class needs methods with their own, independent type parameters?

In this section, we'll explore **generic methods**—methods that declare their own type parameters. We'll tackle the somewhat confusing syntax (yes, it looks weird at first!), understand why it's designed that way, and learn how to create generic methods with single or multiple type parameters, with or without return values.

By the end, you'll be comfortable writing flexible, reusable methods that can work with any type.

---

## Concept 1: Your First Generic Method

### 🧠 What are we trying to build?

Let's create a simple method that can display any type of item—integers, strings, objects, anything. We'll call it `show()`.

### ⚙️ The naive first attempt

You might try writing:

```java
public class GenericClass {
    public void show(T item) {  // ❌ Compile error!
        System.out.println("The item is: " + item);
    }
}
```

**Problem**: Java doesn't know what `T` is! Where did this type come from?

### ❓ Why doesn't this work?

When you use a type parameter like `T`, you must **declare it** somewhere. With generic classes, you declare it in the class definition:

```java
public class GenericClass<T> {  // T declared here
    public void show(T item) {   // Now T is recognized
        System.out.println("The item is: " + item);
    }
}
```

But what if you don't want the entire class to be generic—just the method?

### ✅ The correct syntax for a generic method

```java
public class GenericClass {
    public <T> void show(T item) {
        System.out.println("The item is: " + item);
    }
}
```

**The key**: `<T>` before the return type declares that this method uses a generic type parameter.

### 📝 Breaking down the syntax

```java
public <T> void show(T item)
```

Let's understand each part:

1. **`public`** – Access modifier (as usual)
2. **`<T>`** – Declares the type parameter for this method
3. **`void`** – The return type
4. **`show`** – The method name
5. **`(T item)`** – Parameter of type T

### 💡 Insight

Yes, it looks confusing! The `<T>` comes **before** the return type, which makes it look like it might be the return type itself. But it's not—it's a **type parameter declaration**. Think of it like declaring a variable: you need to introduce it before you can use it.

The pattern is always:
```
<type parameters> return-type method-name(parameters)
```

---

## Concept 2: Using the Generic Method

### 🧪 Example: Displaying different types

First, let's complete our method:

```java
public class GenericClass {
    public <T> void show(T item) {
        System.out.println("The item is: " + item.toString());
    }
}
```

Note: We call `.toString()` to convert the item to a string. Every object in Java has this method.

### ⚙️ How to call it

From the main method:

```java
public static void main(String[] args) {
    GenericClass gc = new GenericClass();
    
    gc.show(10);           // T becomes Integer
    gc.show(10.5f);        // T becomes Float
    gc.show("Hello");      // T becomes String
}
```

**Output:**
```
The item is: 10
The item is: 10.5
The item is: Hello
```

### ❓ How does Java know what T is?

Java uses **type inference**—it looks at the argument you pass and figures out what T should be:

- `show(10)` → T is Integer (autoboxing converts int to Integer)
- `show(10.5f)` → T is Float
- `show("Hello")` → T is String

You don't need to explicitly tell Java the type; it's smart enough to figure it out from context.

### 💡 Insight

This is called **type inference**, and it's one of the most convenient features of generics. The compiler does the work for you, making the code cleaner and easier to read.

---

## Concept 3: Multiple Type Parameters

### 🧠 What if we need more than one type?

Just like classes can have multiple type parameters (`<K, V>`), methods can too!

### ⚙️ Method with two type parameters

```java
public class GenericClass {
    public <T, V> void show(T item1, V item2) {
        System.out.println("Item 1: " + item1.toString());
        System.out.println("Item 2: " + item2.toString());
    }
}
```

### 📝 Breaking it down

```java
public <T, V> void show(T item1, V item2)
```

- **`<T, V>`** – Declares TWO type parameters for this method
- **`void`** – The return type (still void)
- **`T item1`** – First parameter of type T
- **`V item2`** – Second parameter of type V

### 🧪 Example: Using multiple types

```java
public static void main(String[] args) {
    GenericClass gc = new GenericClass();
    
    gc.show("Adam", 32);
}
```

**Output:**
```
Item 1: Adam
Item 2: 32
```

### ❓ What types are T and V here?

- `T` is inferred as `String` (because "Adam" is a String)
- `V` is inferred as `Integer` (because 32 is an int, autoboxed to Integer)

The types can be **completely different**, and Java handles it automatically!

### 💡 Insight

Multiple type parameters give you incredible flexibility. You're not limited to methods that take the same type of parameters—each parameter can be its own type, determined independently.

---

## Concept 4: Understanding the Confusing Syntax

### ❓ Why is the syntax so confusing?

Let's look at this again:

```java
public <T> void show(T item)
```

Many beginners think `<T>` is the return type. But the return type is `void`!

### 🧠 What's really happening?

Think of it in steps:

**Step 1: Declare the type parameter**
```java
public <T>  // "This method uses a generic type called T"
```

**Step 2: Specify the return type**
```java
public <T> void  // "This method returns nothing (void)"
```

**Step 3: Name the method and use T**
```java
public <T> void show(T item)  // "The parameter is of type T"
```

### 📝 Comparison with generic classes

**Generic class:**
```java
public class Store<T> {  // T declared at class level
    private T item;
    
    public void set(T item) {  // T already declared, just use it
        this.item = item;
    }
}
```

**Generic method:**
```java
public class GenericClass {  // No T at class level
    public <T> void show(T item) {  // T declared at method level
        System.out.println(item);
    }
}
```

### 💡 Insight

With generic classes, the type parameter is declared at the **class level**, so all methods can use it. With generic methods, the type parameter is declared at the **method level**, so only that method can use it.

---

## Concept 5: Generic Methods with Return Values

### 🧠 What if we want to return a value?

So far, our methods have been `void`. But generic methods can return values too!

### ⚙️ Method that returns a generic type

```java
public class GenericClass {
    public <T> T show(T item) {
        System.out.println("The item is: " + item.toString());
        return item;
    }
}
```

### 📝 Breaking down the return type

```java
public <T> T show(T item)
```

- **`<T>`** – Type parameter declaration (as always)
- **`T`** – The return type (now it's T, not void!)
- **`show`** – Method name
- **`(T item)`** – Parameter of type T
- **`return item;`** – Returns a value of type T

### ❓ Why does T appear twice?

```java
public <T>  T  show(T item)
       ^^^^   ^
       |      |
       |      return type
       |
       type declaration
```

1. **First `<T>`**: "I'm declaring a type parameter called T"
2. **Second `T`**: "The return type of this method is T"

They serve different purposes, even though they look the same!

### 🧪 Example: Using the return value

```java
public static void main(String[] args) {
    GenericClass gc = new GenericClass();
    
    String result = gc.show("Apple");
    System.out.println(result);
}
```

**Output:**
```
The item is: Apple
Apple
```

What happened:
1. We call `show("Apple")`
2. Inside `show()`, it prints "The item is: Apple"
3. It returns "Apple"
4. We store the return value in `result`
5. We print `result`, which outputs "Apple" again

### 💡 Insight

The return type must match the type parameter. If you pass in a String, you get back a String. If you pass in an Integer, you get back an Integer. Java enforces this at compile time, giving you type safety.

---

## Concept 6: Practical Examples

### 🧪 Example 1: Identity method

The simplest generic method just returns what you give it:

```java
public <T> T identity(T item) {
    return item;
}

// Usage
String s = identity("Hello");  // Returns "Hello"
Integer n = identity(42);      // Returns 42
```

### 🧪 Example 2: Print and return

```java
public <T> T printAndReturn(T item) {
    System.out.println("Processing: " + item);
    return item;
}

// Usage
Integer result = printAndReturn(100);
// Prints: Processing: 100
// Returns: 100
```

### 🧪 Example 3: Swap values (multiple parameters)

```java
public <T, V> void displayPair(T first, V second) {
    System.out.println("First: " + first);
    System.out.println("Second: " + second);
}

// Usage
displayPair("Age", 25);
// First: Age
// Second: 25

displayPair(3.14, "Pi");
// First: 3.14
// Second: Pi
```

### 💡 Insight

Generic methods shine when you need flexibility without committing to specific types. They're perfect for utility methods that work with any data.

---

## Concept 7: Generic Classes vs Generic Methods

### 🧠 What's the difference?

**Generic Class:**
- Type parameter declared at class level
- All non-static methods can use the type
- Each instance has its own specific type

```java
public class Box<T> {
    private T item;
    
    public void set(T item) { this.item = item; }
    public T get() { return item; }
}

// Usage
Box<String> stringBox = new Box<>();  // This box holds Strings
stringBox.set("Hello");
```

**Generic Method:**
- Type parameter declared at method level
- Only that method uses the type
- Type determined each time you call the method

```java
public class Utility {
    public <T> void print(T item) {
        System.out.println(item);
    }
}

// Usage
Utility util = new Utility();
util.print("Hello");  // T is String this call
util.print(42);       // T is Integer this call
util.print(3.14);     // T is Double this call
```

### ❓ When to use which?

**Use a generic class when:**
- The entire class is designed around working with one or more types
- Multiple methods need to work with the same type
- Example: `List<T>`, `Box<T>`, `Store<T>`

**Use a generic method when:**
- Only one method needs to be generic
- Different calls need different types
- You want flexibility without making the whole class generic
- Example: utility methods, converters, printers

### 💡 Insight

You can even have generic methods **inside** generic classes! The method can declare its own type parameters that are independent of the class's type parameters.

```java
public class Box<T> {
    private T item;
    
    // Uses the class's type parameter T
    public void set(T item) {
        this.item = item;
    }
    
    // Declares its own type parameter U
    public <U> void printWithLabel(U label) {
        System.out.println(label + ": " + item);
    }
}
```

---

## ✅ Key Takeaways

1. **Generic methods declare their type parameters** – Use `<T>` before the return type

2. **The syntax is `<T> ReturnType methodName`** – Don't confuse the type declaration with the return type

3. **Type inference works automatically** – Java figures out T from the arguments you pass

4. **Multiple type parameters are supported** – Use `<T, V>` for methods with multiple generic types

5. **Generic methods can return generic types** – The return type can be one of the type parameters

6. **Independent from class generics** – Generic methods work in any class, generic or not

---

## ⚠️ Common Mistakes

- **Forgetting the `<T>` declaration** – You must declare type parameters before using them

- **Confusing `<T>` with the return type** – `<T>` declares the type; the return type comes after it

- **Using wrong type parameter names** – If you declare `<V>`, use `V`, not `T` in the method

- **Thinking you must specify types when calling** – Java infers them automatically (though you can specify explicitly if needed)

---

## 💡 Pro Tips

- **Use standard conventions**: `T` for type, `E` for element, `K` for key, `V` for value

- **Keep it simple**: If you're declaring more than 2-3 type parameters, reconsider your design

- **Explicit type arguments**: Though rare, you can specify types explicitly:
  ```java
  gc.<String>show("Hello");  // Explicitly tell Java T is String
  ```

- **Static generic methods**: You can make static methods generic too:
  ```java
  public static <T> void print(T item) {
      System.out.println(item);
  }
  ```

---

## 🎯 Real-World Examples

### Where you'll see generic methods:

**1. Collections utility methods**
```java
Collections.sort(list);  // Generic method that works with any list
```

**2. Array utilities**
```java
Arrays.asList(1, 2, 3);  // Generic method returning a generic list
```

**3. Stream operations**
```java
stream.map(item -> item.toString());  // map is a generic method
```

**4. Your own utility classes**
```java
public class Utils {
    public static <T> T requireNonNull(T obj) {
        if (obj == null) throw new NullPointerException();
        return obj;
    }
}
```

---

## 🎯 What's Next?

We've now covered:
- ✅ Generic classes with single and multiple type parameters
- ✅ Raw types vs proper generic types
- ✅ Generic methods with single and multiple type parameters
- ✅ Generic methods with different return types

In upcoming lectures, we'll explore:
- **Bounded type parameters** (`<T extends Number>`) – Restricting what types can be used
- **Wildcards** (`?`, `? extends`, `? super`) – More flexible type parameters
- **Type erasure** – How generics actually work under the hood
- **Best practices** – When and how to use generics effectively

Generic methods are a powerful tool in your Java toolkit. They give you the flexibility to write once and use with any type, all while maintaining compile-time type safety!