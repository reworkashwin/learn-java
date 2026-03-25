# Finding Minimum and Maximum with Bounded Types

## Introduction

We know that bounded types let us restrict what types can be used with generics. But how do we actually use this in practice? What's the real-world benefit?

In this section, we'll build a practical utility method that finds the minimum of two values. This sounds simple—just use the `<` operator, right? But as we'll discover, it's not that straightforward with generics. We'll see why we need bounded types, how to properly implement comparison logic, and how to make custom objects work with our generic comparison methods.

This is where theory meets practice, and you'll see the real power of bounded generic types in action.

---

## Concept 1: The Challenge - Finding the Minimum

### 🧠 What are we trying to build?

Let's create a utility class with a method that returns the smaller of two values. It should work with any type—integers, doubles, strings, even custom objects.

### ⚙️ The naive first attempt

```java
public class NumberUtils {
    public static <T> T minimum(T item1, T item2) {
        if (item1 < item2) {  // ❌ Compile error!
            return item1;
        }
        return item2;
    }
}
```

### ❓ What's the problem?

**Compile error**: The operator `<` is undefined for the type `T`.

Why? Because `T` could be **anything**:
- If `T` is `Integer`, the `<` operator makes sense
- If `T` is `String`, there's no `<` operator for strings
- If `T` is a custom `Person` class, how would Java know what "less than" means?

### 💡 Insight

Comparison isn't universal! Different types compare differently:
- Numbers: 5 < 10 (numeric comparison)
- Strings: "apple" < "banana" (alphabetical comparison)
- Dates: date1 < date2 (chronological comparison)
- Custom objects: ?? (you define the rules!)

Java needs a **standard way** to compare objects of any type. Enter the `Comparable` interface.

---

## Concept 2: The Comparable Interface

### 🧠 What is Comparable?

`Comparable<T>` is a Java interface that defines one method:

```java
public interface Comparable<T> {
    int compareTo(T other);
}
```

Any class that implements `Comparable` can be compared using the `compareTo()` method.

### ⚙️ How compareTo works

The `compareTo()` method returns an integer:
- **Negative value** (typically -1): This object is **less than** the other
- **Zero** (0): This object is **equal to** the other
- **Positive value** (typically +1): This object is **greater than** the other

### 🧪 Example: How Integer implements it

```java
Integer a = 10;
Integer b = 20;

int result = a.compareTo(b);
// Returns negative (10 < 20)

result = b.compareTo(a);
// Returns positive (20 > 10)

result = a.compareTo(10);
// Returns 0 (10 == 10)
```

### 💡 Insight

Think of `compareTo()` as the generic version of comparison operators. Instead of using `<`, `>`, and `==`, you call one method that tells you the relationship between two objects.

---

## Concept 3: Using Bounded Types with Comparable

### 🧠 How do we fix our minimum method?

We need to bound `T` to types that implement `Comparable`. But there's a twist—`Comparable` itself is generic!

### ⚙️ The correct syntax

```java
public class NumberUtils {
    public static <T extends Comparable<T>> T minimum(T item1, T item2) {
        if (item1.compareTo(item2) < 0) {
            return item1;
        }
        return item2;
    }
}
```

### 📝 Breaking down the syntax

```java
public static <T extends Comparable<T>> T minimum(T item1, T item2)
```

Let's parse this carefully:

1. **`<T extends Comparable<T>>`** – Type parameter declaration with bound
   - `T` must implement `Comparable<T>`
   - The `<T>` inside `Comparable<T>` means "comparable to itself"

2. **`T minimum`** – The return type is `T`

3. **`T item1, T item2`** – Both parameters are of type `T`

### ❓ Why Comparable<T> and not just Comparable?

Without the `<T>`, you'd have raw types:

```java
<T extends Comparable>  // ❌ Raw type, not recommended
```

With the generic parameter:

```java
<T extends Comparable<T>>  // ✅ Properly typed
```

This ensures that `Integer` compares with `Integer`, `String` compares with `String`, etc. You can't accidentally compare incompatible types.

### 🧪 How compareTo replaces the < operator

```java
// Instead of:
if (item1 < item2)

// We use:
if (item1.compareTo(item2) < 0)
```

**Translation:**
- `compareTo() < 0` means "item1 is less than item2"
- `compareTo() == 0` means "item1 equals item2"
- `compareTo() > 0` means "item1 is greater than item2"

### 💡 Insight

The bound `<T extends Comparable<T>>` is like a contract: "I'll accept any type T, as long as it promises to be comparable to itself." This gives us compile-time safety—Java won't let you pass non-comparable types.

---

## Concept 4: Using the Minimum Method

### 🧪 Example 1: Comparing integers

```java
public static void main(String[] args) {
    Integer result = NumberUtils.minimum(10, 34);
    System.out.println(result);  // Output: 10
}
```

**What happens:**
1. Java infers `T` is `Integer`
2. `Integer` implements `Comparable<Integer>` ✓
3. Calls `10.compareTo(34)`, which returns negative
4. Returns `10` (the smaller value)

### 🧪 Example 2: Comparing doubles

```java
Double result = NumberUtils.minimum(10.4, 20.7);
System.out.println(result);  // Output: 10.4
```

**What happens:**
1. Java infers `T` is `Double`
2. `Double` implements `Comparable<Double>` ✓
3. Calls `10.4.compareTo(20.7)`, which returns negative
4. Returns `10.4`

### 🧪 Example 3: Comparing strings

```java
String result = NumberUtils.minimum("Kevin", "Anna");
System.out.println(result);  // Output: Anna
```

**What happens:**
1. Java infers `T` is `String`
2. `String` implements `Comparable<String>` ✓
3. Calls `"Kevin".compareTo("Anna")`
4. String comparison is **lexicographic** (alphabetical)
5. "Anna" comes before "Kevin" alphabetically
6. Returns "Anna"

### ❓ How does String comparison work?

Strings are compared **character by character** using Unicode values:
- 'A' (65) comes before 'K' (75)
- So "Anna" < "Kevin"
- "apple" < "banana" (because 'a' < 'b')
- "Apple" < "apple" (because 'A' < 'a' in Unicode)

### 💡 Insight

The beauty of generics is that the **same method** handles integers, doubles, and strings—all with type safety. The compiler ensures you're using comparable types, and the runtime behavior adapts to each type's specific comparison logic.

---

## Concept 5: Making Custom Objects Comparable

### 🧠 What if we want to compare custom objects?

Let's say we have a `Person` class:

```java
public class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    @Override
    public String toString() {
        return name + " : " + age;
    }
}
```

### ❓ Can we compare Person objects?

Let's try:

```java
Person p1 = new Person("Kevin", 12);
Person p2 = new Person("Anna", 25);

Person younger = NumberUtils.minimum(p1, p2);  // ❌ Compile error!
```

**Error**: Person is not Comparable

The `minimum()` method requires `T extends Comparable<T>`, but `Person` doesn't implement `Comparable`!

### ⚙️ Solution: Implement Comparable<Person>

```java
public class Person implements Comparable<Person> {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    @Override
    public int compareTo(Person other) {
        // Compare based on age
        return Integer.compare(this.age, other.getAge());
    }
    
    public int getAge() {
        return age;
    }
    
    @Override
    public String toString() {
        return name + " : " + age;
    }
}
```

### 📝 Understanding the implementation

**Step 1: Declare that Person is Comparable**
```java
public class Person implements Comparable<Person>
```
This promises that `Person` objects can be compared to other `Person` objects.

**Step 2: Implement the compareTo method**
```java
@Override
public int compareTo(Person other) {
    return Integer.compare(this.age, other.getAge());
}
```

**Step 3: Use Integer.compare for the logic**
```java
Integer.compare(this.age, other.getAge())
```
This built-in method compares two integers and returns:
- Negative if `this.age < other.age`
- Zero if `this.age == other.age`
- Positive if `this.age > other.age`

### 💡 Insight

`Integer.compare(a, b)` is a cleaner way to implement comparison than:
```java
// Manual way (error-prone)
if (this.age < other.age) return -1;
if (this.age == other.age) return 0;
return 1;

// Better way
return Integer.compare(this.age, other.age);
```

The `Integer.compare()` method handles the logic for you, making the code cleaner and less error-prone.

---

## Concept 6: Using Comparable Person Objects

### 🧪 Example 1: Comparing by age

```java
Person p1 = new Person("Kevin", 12);
Person p2 = new Person("Anna", 25);

Person younger = NumberUtils.minimum(p1, p2);
System.out.println(younger);  // Output: Kevin : 12
```

**What happens:**
1. `Person` now implements `Comparable<Person>` ✓
2. The method compares `p1.age` (12) with `p2.age` (25)
3. Returns `p1` (Kevin, age 12) because it's smaller

### 🧪 Example 2: Different ages

```java
Person p1 = new Person("Kevin", 98);
Person p2 = new Person("Anna", 25);

Person younger = NumberUtils.minimum(p1, p2);
System.out.println(younger);  // Output: Anna : 25
```

Now Anna is returned because 25 < 98.

### ❓ What if we want to compare by name instead?

Simple—change the `compareTo` implementation:

```java
@Override
public int compareTo(Person other) {
    // Compare by name (alphabetically)
    return this.name.compareTo(other.name);
}
```

Now "Anna" would come before "Kevin" alphabetically.

### 💡 Insight

**You control the comparison logic.** When implementing `Comparable`, you decide what "less than" means for your class:
- Compare by age? Use `Integer.compare(this.age, other.age)`
- Compare by name? Use `this.name.compareTo(other.name)`
- Compare by multiple fields? Combine comparisons:
  ```java
  int result = this.lastName.compareTo(other.lastName);
  if (result == 0) {
      result = this.firstName.compareTo(other.firstName);
  }
  return result;
  ```

---

## Concept 7: Why This Approach is Powerful

### ✅ Benefits of using Comparable with bounded types

**1. Single Generic Method**
- One `minimum()` method works with all comparable types
- No need for separate methods for integers, strings, Person objects, etc.

**2. Compile-Time Safety**
```java
// ✅ Works - Integer is Comparable
Integer result = NumberUtils.minimum(10, 20);

// ✅ Works - String is Comparable
String result = NumberUtils.minimum("A", "B");

// ❌ Compile error - Object is not Comparable
Object o1 = new Object();
Object o2 = new Object();
Object result = NumberUtils.minimum(o1, o2);  // Error!
```

**3. Consistency**
- Every comparable type follows the same contract
- The `compareTo` method always returns -1, 0, or +1
- You know what to expect

**4. Extensibility**
- Create new custom classes
- Implement `Comparable<YourClass>`
- Automatically works with all methods expecting comparable types

### 🧪 Building on this: Maximum method

Once you have minimum, maximum is trivial:

```java
public static <T extends Comparable<T>> T maximum(T item1, T item2) {
    if (item1.compareTo(item2) > 0) {  // Just flip the comparison!
        return item1;
    }
    return item2;
}
```

### 🧪 Even more: Finding min/max in arrays

```java
public static <T extends Comparable<T>> T findMin(T[] array) {
    T min = array[0];
    for (T item : array) {
        if (item.compareTo(min) < 0) {
            min = item;
        }
    }
    return min;
}

// Usage
Integer[] numbers = {5, 2, 8, 1, 9};
Integer min = NumberUtils.findMin(numbers);  // Returns 1

String[] words = {"zebra", "apple", "banana"};
String minWord = NumberUtils.findMin(words);  // Returns "apple"
```

### 💡 Insight

This pattern—using `<T extends Comparable<T>>`—is fundamental in Java. It appears in:
- `Collections.sort(List<T> list)`
- `Collections.min(Collection<T> coll)`
- `Collections.max(Collection<T> coll)`
- Stream operations like `sorted()`, `min()`, `max()`

Understanding this pattern unlocks a huge portion of the Java standard library!

---

## ✅ Key Takeaways

1. **The `<` operator doesn't work with generic types** – Use `compareTo()` from the `Comparable` interface instead

2. **Bounded types enable comparison** – `<T extends Comparable<T>>` restricts types to comparable ones

3. **compareTo returns -1, 0, or +1** – Negative means less than, zero means equal, positive means greater than

4. **Integer.compare() is your friend** – Use it when implementing `compareTo` for numeric fields

5. **Custom classes can be comparable** – Implement `Comparable<YourClass>` to define comparison logic

6. **You control the comparison** – Decide what field(s) determine ordering for your objects

7. **One method, many types** – The same generic method works with integers, strings, and custom objects

---

## ⚠️ Common Mistakes

- **Forgetting the generic parameter**: Use `Comparable<T>`, not just `Comparable` (raw type)

- **Inconsistent compareTo logic**: If `a.compareTo(b) < 0`, then `b.compareTo(a)` must be `> 0`

- **Not handling null**: `compareTo` typically assumes non-null; add null checks if needed

- **Mixing comparison criteria**: Be consistent—don't compare by age sometimes and name other times

- **Reverse logic errors**: `< 0` means "less than," not "greater than"

---

## 💡 Pro Tips

- **Use existing utility methods**: `Integer.compare()`, `Double.compare()`, `String.compareTo()` instead of manual logic

- **Natural ordering**: Implementing `Comparable` defines the "natural ordering" of your class

- **Alternative orderings**: For other comparison criteria, use `Comparator` (a separate interface we'll cover later)

- **Consistency with equals**: If `a.compareTo(b) == 0`, typically `a.equals(b)` should be `true`

- **Document your comparison logic**: Add comments explaining what field(s) determine ordering

---

## 🎯 Complete Working Example

Here's everything together:

```java
// Utility class
public class NumberUtils {
    public static <T extends Comparable<T>> T minimum(T item1, T item2) {
        if (item1.compareTo(item2) < 0) {
            return item1;
        }
        return item2;
    }
    
    public static <T extends Comparable<T>> T maximum(T item1, T item2) {
        if (item1.compareTo(item2) > 0) {
            return item1;
        }
        return item2;
    }
}

// Custom comparable class
public class Person implements Comparable<Person> {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    @Override
    public int compareTo(Person other) {
        return Integer.compare(this.age, other.getAge());
    }
    
    public int getAge() {
        return age;
    }
    
    @Override
    public String toString() {
        return name + " : " + age;
    }
}

// Usage
public class Main {
    public static void main(String[] args) {
        // With integers
        System.out.println(NumberUtils.minimum(10, 34));  // 10
        
        // With doubles
        System.out.println(NumberUtils.minimum(10.4, 20.7));  // 10.4
        
        // With strings
        System.out.println(NumberUtils.minimum("Kevin", "Anna"));  // Anna
        
        // With custom objects
        Person p1 = new Person("Kevin", 98);
        Person p2 = new Person("Anna", 25);
        System.out.println(NumberUtils.minimum(p1, p2));  // Anna : 25
    }
}
```

---

## 🎯 What's Next?

We've seen bounded types in action with a practical comparison example. Coming up:
- **Multiple bounds** – Combining multiple constraints
- **Wildcards** – More flexible bounds with `?`
- **Lower bounds** – Using `super` instead of `extends`
- **Comparator interface** – Alternative way to define comparisons

Bounded types with `Comparable` are one of the most common patterns in Java. Master this, and you'll understand how sorting, searching, and comparison work throughout the Java ecosystem!