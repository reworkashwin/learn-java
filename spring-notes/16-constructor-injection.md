# 🏗️ Constructor Injection - Injecting Through Constructors

## Introduction

We've learned setter injection - injecting values and references through setter methods. This works great!

**But there's another approach: Constructor Injection.**

**Think about how you normally initialize objects in Java:**

```java
// Setters - assign values AFTER object creation
Alien alien = new Alien();
alien.setAge(21);
alien.setLaptop(laptop);

// Constructor - assign values DURING object creation
Alien alien = new Alien(21, laptop);
```

**Most of the time, we prefer constructors for initialization, right?**

**Why?**
- Values assigned immediately when object is created
- Object is fully initialized from the start
- Can make fields final (immutability)
- More explicit about required dependencies

**Setters are good when:**
- Values can be changed later
- Properties are optional
- You want flexibility to set values any time

**Constructors are good when:**
- Values must be set during creation
- Properties are mandatory
- You want immutable objects

**In this lesson, we'll learn:**
- How to inject values through constructors
- The `<constructor-arg>` tag in XML
- Injecting both primitive values and object references
- How Spring matches arguments to constructor parameters
- The sequence problem and how to solve it
- Three approaches: type, index, and name attributes
- When to use constructor vs setter injection

Let's build objects the constructor way! 🏗️

---

## Concept 1: The Motivation for Constructor Injection

### 🧠 Current setup with setter injection

**Our Alien class has two properties:**

```java
public class Alien {
    private int age;
    private Laptop lap;
    
    public Alien() {
        System.out.println("Object created");
    }
    
    // Setters
    public void setAge(int age) {
        this.age = age;
    }
    
    public void setLap(Laptop lap) {
        this.lap = lap;
    }
    
    public void code() {
        System.out.println("Coding...");
        lap.compile();
    }
}
```

**spring.xml (setter injection):**
```xml
<bean id="lap1" class="com.telusko.app.Laptop" />

<bean id="alien1" class="com.telusko.app.Alien">
    <property name="age" value="21" />
    <property name="lap" ref="lap1" />
</bean>
```

**This uses setters (`<property>` tag).**

### ❓ What if we want to use constructor?

**Think about Java best practices:**

```java
// For mandatory, immutable properties - use constructor
public Alien(int age, Laptop lap) {
    this.age = age;
    this.lap = lap;
}

// For optional, changeable properties - use setters
public void setAge(int age) {
    this.age = age;
}
```

**Constructor ensures:**
- Object fully initialized from creation
- No intermediate invalid state
- Clear about required dependencies

### 💡 The question

**How do we tell Spring to use constructor instead of setters?**

**Enter: Constructor Injection with `<constructor-arg>` tag!**

---

## Concept 2: Basic Constructor Injection - Single Parameter

### 🧠 Creating a parameterized constructor

**Add to Alien class:**

```java
public class Alien {
    private int age;
    private Laptop lap;
    
    // Parameterized constructor
    public Alien(int age) {
        System.out.println("Parameterized constructor called");
        this.age = age;
    }
    
    // Default constructor (still exists)
    public Alien() {
        System.out.println("Object created");
    }
    
    // ... rest of the code
}
```

**Now we have TWO constructors:**
- Default: `Alien()`
- Parameterized: `Alien(int age)`

### ⚙️ The constructor-arg tag

**spring.xml:**

```xml
<bean id="lap1" class="com.telusko.app.Laptop" />

<bean id="alien1" class="com.telusko.app.Alien">
    <constructor-arg value="21" />
</bean>
```

**Key change:**
- `<property>` → `<constructor-arg>`
- Still use `value` for primitives

### 🧪 Test it

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj = (Alien) context.getBean("alien1");
    System.out.println("Age: " + obj.getAge());
}
```

**Output:**
```
Parameterized constructor called
Age: 21
```

**Success!** 🎉

**Notice:**
- "Parameterized constructor called" (not "Object created")
- Spring used our parameterized constructor!
- Age was injected through constructor

### 💡 How Spring chose the constructor

**Spring looks at:**
- Number of `<constructor-arg>` tags: 1
- Finds constructor matching: `Alien(int age)`
- Calls that constructor with value 21

**If you have multiple constructors, Spring matches by parameter count!**

---

## Concept 3: XML Syntax Tip - Self-Closing Tags

### 🧠 The instructor's observation

**Look at this:**
```xml
<constructor-arg value="21"></constructor-arg>
```

**IDE shows:** "XML tag has an empty body"

**There's nothing between opening and closing tags!**

### ⚙️ Use self-closing syntax

**Better:**
```xml
<constructor-arg value="21" />
```

**Same for properties:**
```xml
<!-- Verbose -->
<property name="age" value="21"></property>

<!-- Clean -->
<property name="age" value="21" />
```

**More concise and removes warnings!**

### 💡 Best practice

**Use self-closing tags when:**
- No nested content
- Just attributes

**Result: Cleaner XML configuration!**

---

## Concept 4: Constructor Injection with Multiple Parameters

### 🧠 Realistic scenario - multiple dependencies

**Update Alien constructor:**

```java
public class Alien {
    private int age;
    private Laptop lap;
    
    // Constructor with TWO parameters
    public Alien(int age, Laptop lap) {
        System.out.println("Parameterized constructor called");
        this.age = age;
        this.lap = lap;
    }
    
    public void code() {
        System.out.println("Coding...");
        lap.compile();
    }
    
    // ... getters
}
```

**Now constructor requires BOTH age and laptop!**

### ⚙️ Configuration with one argument

**What if we only provide one argument?**

```xml
<bean id="lap1" class="com.telusko.app.Laptop" />

<bean id="alien1" class="com.telusko.app.Alien">
    <constructor-arg value="21" />
    <!-- Missing laptop argument! -->
</bean>
```

### 💥 The error

**Run it:**

```
Error creating bean with name 'alien1': 
Unsatisfied dependency expressed through constructor parameter 1.
Ambiguous argument values for parameter of type Laptop - did not specify the correct bean.
```

**Translation:**
- Constructor needs 2 parameters
- You provided only 1
- Second parameter (Laptop) is missing!

### ⚙️ Add the second constructor-arg

```xml
<bean id="lap1" class="com.telusko.app.Laptop" />

<bean id="alien1" class="com.telusko.app.Alien">
    <constructor-arg value="21" />
    <constructor-arg ref="lap1" />
</bean>
```

**Notice:**
- First argument: `value="21"` (primitive)
- Second argument: `ref="lap1"` (object reference)
- Same rules as `<property>`: value vs ref!

### 🧪 Test it

**Output:**
```
Laptop object created
Parameterized constructor called
Coding...
Compiling...
```

**Perfect!** ✅

- Laptop created first (dependency)
- Alien created with constructor
- Both arguments injected successfully

### 💡 Constructor injection pattern

**For each constructor parameter:**
- Add one `<constructor-arg>` tag
- Use `value` for primitives
- Use `ref` for objects

**Spring calls the matching constructor!**

---

## Concept 5: The Sequence Problem

### 🧠 A critical question

**Look at our configuration:**

```xml
<constructor-arg value="21" />
<constructor-arg ref="lap1" />
```

**How does Spring know:**
- 21 goes to `age` parameter
- lap1 goes to `lap` parameter

**We're not specifying names anywhere!**

### ❓ The instructor's experiment

**What if we swap the order?**

```xml
<constructor-arg ref="lap1" />   <!-- First -->
<constructor-arg value="21" />   <!-- Second -->
```

**Constructor signature:**
```java
public Alien(int age, Laptop lap) {
    //          ^first  ^second
}
```

**Will Spring still figure it out?**

### 🧪 Test with swapped order

**Run it.**

**Error:**
```
Cannot convert argument value of type Laptop to required type int
```

**Spring tried to:**
- Pass lap1 (Laptop) to first parameter (int age) ❌
- Doesn't work! Type mismatch!

### ❓ What does this prove?

**Spring matches constructor arguments by SEQUENCE (position)!**

**Not by type inference (at least by default).**

**The order matters:**
- First `<constructor-arg>` → first constructor parameter
- Second `<constructor-arg>` → second constructor parameter
- And so on...

### 💡 The default behavior

**By default:**
- Spring uses POSITION/SEQUENCE matching
- First XML arg → First constructor param
- Second XML arg → Second constructor param

**This can be problematic!** What if you want different order?

---

## Concept 6: Solution 1 - Using the type Attribute

### 🧠 Specifying parameter types explicitly

**To avoid sequence dependency, specify types:**

```xml
<bean id="alien1" class="com.telusko.app.Alien">
    <constructor-arg value="21" type="int" />
    <constructor-arg ref="lap1" type="com.telusko.app.Laptop" />
</bean>
```

**Now you can swap the order:**

```xml
<bean id="alien1" class="com.telusko.app.Alien">
    <constructor-arg ref="lap1" type="com.telusko.app.Laptop" />
    <constructor-arg value="21" type="int" />
</bean>
```

**Spring will match by TYPE, not position!**

### 🧪 Test with type attribute

**Run it.**

**Output:**
```
Laptop object created
Parameterized constructor called
Coding...
Compiling...
```

**It works!** Order doesn't matter now! ✅

### ❓ But there's a problem...

**The instructor identifies a critical issue:**

**What if you have TWO parameters of the SAME type?**

```java
public Alien(int age, int salary) {
    //          ^int   ^int  - Both are int!
    this.age = age;
    this.salary = salary;
}
```

**Configuration:**
```xml
<constructor-arg value="21" type="int" />
<constructor-arg value="50000" type="int" />
```

**Which value goes to age? Which to salary?**

**Spring can't tell! Both are type int!**

### 💡 Limitation of type attribute

**Type attribute works ONLY when:**
- ✅ All parameters have different types
- ✅ No two parameters share the same type
- ❌ Fails with multiple parameters of same type

**The instructor notes:**
> "This works only when they are different type of data."

**We need a better solution!**

---

## Concept 7: Solution 2 - Using the index Attribute (Preferred!)

### 🧠 Explicit position specification

**Instead of relying on order or type, specify index:**

```xml
<constructor-arg value="21" index="0" />
<constructor-arg ref="lap1" index="1" />
```

**Where:**
- `index="0"` → First parameter (age)
- `index="1"` → Second parameter (lap)

**Zero-based indexing! (Like arrays)**

### ⚙️ The power of index

**Now order in XML doesn't matter!**

```xml
<!-- Order 1 -->
<constructor-arg value="21" index="0" />
<constructor-arg ref="lap1" index="1" />

<!-- Order 2 - SAME RESULT! -->
<constructor-arg ref="lap1" index="1" />
<constructor-arg value="21" index="0" />
```

**Both work identically!**

### 🧠 Solving the duplicate type problem

**Remember the problem:**
```java
public Alien(int age, int salary) {
    this.age = age;
    this.salary = salary;
}
```

**Solution with index:**
```xml
<constructor-arg value="21" index="0" />      <!-- age -->
<constructor-arg value="50000" index="1" />   <!-- salary -->
```

**Crystal clear! No ambiguity!**

### 🧪 Test with index

**spring.xml:**
```xml
<bean id="lap1" class="com.telusko.app.Laptop" />

<bean id="alien1" class="com.telusko.app.Alien">
    <constructor-arg index="1" ref="lap1" />   <!-- Second param -->
    <constructor-arg index="0" value="21" />   <!-- First param -->
</bean>
```

**Run it.**

**Output:**
```
Laptop object created
Parameterized constructor called
Coding...
Compiling...
```

**Perfect!** Order in XML doesn't matter! ✅

### 💡 The instructor's recommendation

**The instructor states:**

> "Personally, in my projects, I go for the index numbers because that always works."

**Why index is preferred:**
- ✅ Works with any type combination
- ✅ Works with duplicate types
- ✅ Order-independent in XML
- ✅ Explicit and clear
- ✅ No ambiguity

**Index is the most robust solution!**

---

## Concept 8: Solution 3 - Using the name Attribute

### 🧠 Using parameter names

**Most intuitive approach - use actual parameter names:**

```xml
<constructor-arg name="age" value="21" />
<constructor-arg name="lap" ref="lap1" />
```

**Where:**
- `name="age"` matches constructor parameter name `int age`
- `name="lap"` matches constructor parameter name `Laptop lap`

**Most readable! Self-documenting!**

### 🧪 Test with name attribute

**spring.xml:**
```xml
<bean id="alien1" class="com.telusko.app.Alien">
    <constructor-arg name="age" value="21" />
    <constructor-arg name="lap" ref="lap1" />
</bean>
```

**Run it.**

### 💥 Wait... there's a catch!

**It might not work as expected!**

**Why?**

**Java doesn't preserve parameter names by default in compiled bytecode!**

**At runtime:**
```java
// Source code
public Alien(int age, Laptop lap) { ... }

// Compiled bytecode (parameter names lost!)
public Alien(int arg0, Laptop arg1) { ... }
```

**Spring can't see "age" and "lap" at runtime!**

### 🧠 The solution: @ConstructorProperties annotation

**Add annotation to constructor:**

```java
import java.beans.ConstructorProperties;

public class Alien {
    private int age;
    private Laptop lap;
    
    @ConstructorProperties({"age", "lap"})
    public Alien(int age, Laptop lap) {
        System.out.println("Parameterized constructor called");
        this.age = age;
        this.lap = lap;
    }
    
    // ... rest of code
}
```

**The annotation explicitly declares parameter names!**

**Now Spring can match them at runtime!**

### 🧪 Test with @ConstructorProperties

**With the annotation, this works:**

```xml
<bean id="alien1" class="com.telusko.app.Alien">
    <constructor-arg name="lap" ref="lap1" />   <!-- Any order! -->
    <constructor-arg name="age" value="21" />
</bean>
```

**Output:**
```
Laptop object created
Parameterized constructor called
Coding...
Compiling...
```

**Success!** ✅

### ❓ Why not always use name?

**Pros:**
- Most readable
- Self-documenting
- Clear intent

**Cons:**
- Requires extra annotation
- Extra code to maintain
- Annotation tied to Spring/Java Beans

**The instructor notes:**
> "The famous one is indexing. So we'll be using indexing in future."

### 💡 Comparison of three approaches

| Attribute | Works With | Order Independent | Requires Annotation | Recommended |
|-----------|-----------|-------------------|---------------------|-------------|
| (none) | Different types only | ❌ | ❌ | No |
| `type` | Different types only | ✅ | ❌ | Limited |
| `index` | Any combination | ✅ | ❌ | **Yes** ⭐ |
| `name` | Any combination | ✅ | ✅ | Optional |

**Winner: index attribute!**

---

## Concept 9: Complete Example with All Approaches

### 🧠 Full Alien class

```java
package com.telusko.app;

import java.beans.ConstructorProperties;

public class Alien {
    private int age;
    private Laptop lap;
    
    // Constructor with @ConstructorProperties for name-based injection
    @ConstructorProperties({"age", "lap"})
    public Alien(int age, Laptop lap) {
        System.out.println("Parameterized constructor called");
        this.age = age;
        this.lap = lap;
    }
    
    public int getAge() {
        return age;
    }
    
    public Laptop getLap() {
        return lap;
    }
    
    public void code() {
        System.out.println("Coding...");
        lap.compile();
    }
}
```

### 🧠 spring.xml with all approaches (commented)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="lap1" class="com.telusko.app.Laptop" />
    
    <!-- Approach 1: Sequence-based (no attributes) -->
    <!-- Must match parameter order exactly -->
    <!--
    <bean id="alien1" class="com.telusko.app.Alien">
        <constructor-arg value="21" />
        <constructor-arg ref="lap1" />
    </bean>
    -->
    
    <!-- Approach 2: Type-based -->
    <!-- Works when all types are different -->
    <!--
    <bean id="alien1" class="com.telusko.app.Alien">
        <constructor-arg value="21" type="int" />
        <constructor-arg ref="lap1" type="com.telusko.app.Laptop" />
    </bean>
    -->
    
    <!-- Approach 3: Index-based (RECOMMENDED) -->
    <!-- Always works, order-independent -->
    <bean id="alien1" class="com.telusko.app.Alien">
        <constructor-arg index="0" value="21" />
        <constructor-arg index="1" ref="lap1" />
    </bean>
    
    <!-- Approach 4: Name-based (requires @ConstructorProperties) -->
    <!-- Most readable but needs annotation -->
    <!--
    <bean id="alien1" class="com.telusko.app.Alien">
        <constructor-arg name="age" value="21" />
        <constructor-arg name="lap" ref="lap1" />
    </bean>
    -->

</beans>
```

### 💡 Choose your approach

**For production code:**
- Use **index** for reliability
- Use **name** if readability is priority (and you don't mind the annotation)
- Avoid sequence-based (error-prone)
- Avoid type-based (limited use case)

---

## Concept 10: Constructor vs Setter Injection - When to Use Which?

### 🧠 The instructor's guidance

**The final question: When should you use constructor injection vs setter injection?**

**The instructor provides clear guidance:**

> "If you want to have values which are compulsory, you have to use constructor. But if you have optional values, optional properties, you can use setter injections."

### 🧠 Use Constructor Injection when:

**1. Dependencies are mandatory**
```java
public class UserService {
    private final UserRepository repository;  // Can't work without this!
    
    public UserService(UserRepository repository) {
        this.repository = repository;
    }
}
```

**2. Want immutable objects**
```java
public class User {
    private final String name;
    private final int id;
    
    public User(String name, int id) {
        this.name = name;
        this.id = id;
    }
    // No setters - immutable!
}
```

**3. Need fully initialized objects**
```java
public class DatabaseConnection {
    private final String url;
    private final String username;
    
    // Must be provided during construction
    public DatabaseConnection(String url, String username) {
        this.url = url;
        this.username = username;
    }
}
```

### 🧠 Use Setter Injection when:

**1. Dependencies are optional**
```java
public class EmailService {
    private Logger logger;  // Optional - can work without it
    
    public void setLogger(Logger logger) {
        this.logger = logger;
    }
}
```

**2. Values can change after creation**
```java
public class Configuration {
    private int timeout = 30;  // Default value
    
    public void setTimeout(int timeout) {
        this.timeout = timeout;  // Can be changed later
    }
}
```

**3. Circular dependencies**
```java
public class A {
    private B b;
    public void setB(B b) { this.b = b; }
}

public class B {
    private A a;
    public void setA(A a) { this.a = a; }
}
// Constructor injection would cause circular dependency issue!
```

### 💡 General guidelines

**Constructor Injection (Modern Best Practice):**
- ✅ Required dependencies
- ✅ Immutable objects
- ✅ Clear about requirements
- ✅ Compile-time safety
- ✅ Easier to test (explicit dependencies)

**Setter Injection (Legacy/Special Cases):**
- ✅ Optional dependencies
- ✅ Mutable objects
- ✅ Circular dependencies
- ✅ Flexible configuration

**Modern Spring recommends constructor injection as default!**

---

## ✅ Key Takeaways

### About Constructor Injection

1. **Uses `<constructor-arg>` tag**
   - Not `<property>` (that's setter injection)
   - One tag per constructor parameter
   - Must match constructor signature

2. **Same value vs ref rules**
   - `value` for primitives/Strings
   - `ref` for object references
   - Exactly like setter injection

3. **Spring calls matching constructor**
   - Matches by parameter count and types
   - Creates object with injected values
   - Object fully initialized immediately

### About Parameter Matching

1. **Default: Sequence-based**
   - First arg → first param
   - Second arg → second param
   - Order matters!

2. **Type attribute: Type-based**
   - Matches by parameter type
   - Order doesn't matter
   - Fails with duplicate types

3. **Index attribute: Position-based (BEST)**
   - Explicit position (0, 1, 2...)
   - Always works
   - Order-independent
   - Most robust solution ⭐

4. **Name attribute: Name-based**
   - Uses parameter names
   - Most readable
   - Requires @ConstructorProperties

### About Usage Guidelines

1. **Constructor for mandatory dependencies**
   - Required for object to function
   - Immutable objects
   - Clear requirements

2. **Setter for optional dependencies**
   - Can be set later
   - Flexible configuration
   - Circular dependencies

3. **Modern practice: Prefer constructor**
   - More explicit
   - Better testability
   - Compile-time safety

---

## 💡 Final Insights

### The Evolution of Injection

**XML Constructor (what we learned):**
```xml
<bean id="alien1" class="Alien">
    <constructor-arg index="0" value="21" />
    <constructor-arg index="1" ref="lap1" />
</bean>
```

**Annotation Constructor (modern Spring):**
```java
@Component
public class Alien {
    private final int age;
    private final Laptop lap;
    
    @Autowired
    public Alien(@Value("21") int age, Laptop lap) {
        this.age = age;
        this.lap = lap;
    }
}
```

**Spring Boot (simplest):**
```java
@Component
public class Alien {
    private final Laptop lap;
    
    // Single constructor - no annotation needed!
    public Alien(Laptop lap) {
        this.lap = lap;
    }
}
```

**Understanding XML helps you understand all versions!**

### Index Numbers - The Practical Choice

**Why instructors and professionals prefer index:**

1. **Works in all scenarios**
   - Multiple same-type parameters ✅
   - Different types ✅
   - Any combination ✅

2. **No extra annotations needed**
   - Just XML configuration
   - No code changes

3. **Clear and explicit**
   - No ambiguity
   - Easy to debug
   - Self-explanatory

4. **Order-independent**
   - Can arrange XML for readability
   - Still unambiguous

**That's why it's the industry standard!**

### Immutability Benefits

**Constructor injection enables final fields:**

```java
public class Alien {
    private final int age;        // Can't change after construction
    private final Laptop lap;     // Can't change after construction
    
    public Alien(int age, Laptop lap) {
        this.age = age;
        this.lap = lap;
    }
    
    // No setters = immutable object!
}
```

**Benefits:**
- Thread-safe
- Predictable behavior
- No unexpected mutations
- Better for concurrent applications

**This is a major advantage of constructor injection!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Wrong order without index

**Wrong:**
```xml
<constructor-arg ref="lap1" />   <!-- Second param type -->
<constructor-arg value="21" />   <!-- First param type -->
<!-- No index specified - uses sequence! -->
```

**Java:**
```java
public Alien(int age, Laptop lap) { ... }
```

**Result:** Type mismatch error!

**Fix: Use index!**
```xml
<constructor-arg index="1" ref="lap1" />
<constructor-arg index="0" value="21" />
```

### Mistake 2: Type attribute with duplicate types

**Wrong:**
```xml
<constructor-arg value="21" type="int" />
<constructor-arg value="50000" type="int" />
```

**Java:**
```java
public Alien(int age, int salary) { ... }
```

**Result:** Ambiguous! Which int goes where?

**Fix: Use index!**
```xml
<constructor-arg index="0" value="21" />
<constructor-arg index="1" value="50000" />
```

### Mistake 3: Missing @ConstructorProperties with name

**Wrong:**
```java
public Alien(int age, Laptop lap) { ... }  // No annotation!
```

**XML:**
```xml
<constructor-arg name="age" value="21" />  <!-- Won't work! -->
```

**Fix:**
```java
@ConstructorProperties({"age", "lap"})
public Alien(int age, Laptop lap) { ... }
```

### Mistake 4: Mismatched parameter count

**Wrong:**
```xml
<constructor-arg value="21" />
<!-- Missing second argument! -->
```

**Java:**
```java
public Alien(int age, Laptop lap) { ... }  // Expects 2 params!
```

**Result:** Unsatisfied dependency error

**Fix: Provide all arguments!**

---

## 🎯 Practice Exercises

### Exercise 1: Constructor with three parameters

Create a `Car` class with constructor:
```java
public Car(String brand, int year, Engine engine)
```

Inject all three using constructor injection with index.

### Exercise 2: Compare approaches

Create the same bean configuration using:
- Sequence-based
- Type-based
- Index-based
- Name-based

Compare which is most robust.

### Exercise 3: Immutable object

Create an immutable `Person` class using:
- final fields
- Constructor injection only
- No setters

Verify fields can't be changed after creation.

### Exercise 4: Mixed injection

Create a class with:
- Mandatory dependency (constructor)
- Optional dependency (setter)

Configure in XML using both techniques.

---

## 🔗 Quick Summary

**Constructor Injection:**

```xml
<!-- Using index (RECOMMENDED) -->
<bean id="alien1" class="com.telusko.app.Alien">
    <constructor-arg index="0" value="21" />
    <constructor-arg index="1" ref="lap1" />
</bean>

<!-- Using name (requires @ConstructorProperties) -->
<bean id="alien1" class="com.telusko.app.Alien">
    <constructor-arg name="age" value="21" />
    <constructor-arg name="lap" ref="lap1" />
</bean>
```

**When to use:**
- ✅ Mandatory dependencies
- ✅ Immutable objects
- ✅ Full initialization at creation

**When NOT to use:**
- ❌ Optional dependencies → Use setter injection
- ❌ Circular dependencies → Use setter injection

**Next topic:** Autowiring - automatic dependency resolution! 🔄
