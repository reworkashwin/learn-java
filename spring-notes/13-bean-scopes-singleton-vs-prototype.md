# 🔄 Bean Scopes in Spring - Singleton vs Prototype

## Introduction

In the last lesson, we ended with a cliffhanger question:

**If we call `getBean()` TWICE with the SAME bean ID, does Spring create one object or two objects?**

```java
ApplicationContext context = 
    new ClassPathXmlApplicationContext("spring.xml");

Alien obj1 = (Alien) context.getBean("alien1");  // First call
Alien obj2 = (Alien) context.getBean("alien1");  // Second call - same ID!
```

**spring.xml has only ONE bean definition:**
```xml
<bean id="alien1" class="com.telusko.app.Alien" />
```

**Think about it:**
- We have one bean definition
- We're calling getBean twice
- Same ID both times

**Will Spring create one object or two?**

The answer to this question reveals one of Spring Framework's most important concepts: **Bean Scopes**.

Understanding scopes is critical because it determines:
- How many instances Spring creates
- When those instances are created
- How memory is used
- How state is managed across your application
- Thread safety considerations

**In this lesson, we'll discover:**
- The singleton pattern (Spring's default behavior)
- The prototype pattern (creating new instances)
- When each scope creates objects
- How to control bean scope in XML
- Real-world implications of scope choices

Let's solve the mystery! 🔍

---

## Concept 1: Running the Experiment

### 🧠 Our test code

```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj1 = (Alien) context.getBean("alien1");
    Alien obj2 = (Alien) context.getBean("alien1");
}
```

**Alien class with constructor:**
```java
public class Alien {
    public Alien() {
        System.out.println("Object created");
    }
    
    public void code() {
        System.out.println("Coding...");
    }
}
```

### 🧪 The moment of truth

**Run the code.**

**Output:**
```
Object created
```

**"Object created" appears ONLY ONCE!**

### ❓ What does this mean?

**We called getBean() twice, but the constructor ran only once!**

This proves:
- ✅ Only ONE object was created
- ✅ Both obj1 and obj2 refer to the SAME object
- ✅ Multiple getBean() calls return the same instance

### 💡 The initial insight

**Spring is reusing the same object!**

When you call getBean with the same ID multiple times:
- Spring doesn't create new objects each time
- It returns the SAME instance
- This is by design, not a bug!

**But how can we be absolutely sure they're the same object?**

---

## Concept 2: Proving They're the Same Object

### 🧠 A more conclusive test

Constructor evidence suggests one object. But let's **prove beyond doubt** that obj1 and obj2 are the same instance.

**How?** By testing if changes to one affect the other!

### ⚙️ Step 1: Add an instance variable

**Update the Alien class:**

```java
public class Alien {
    
    int age;  // Instance variable (default access for simplicity)
    
    public Alien() {
        System.out.println("Object created");
    }
    
    public void code() {
        System.out.println("Coding...");
    }
}
```

**Note:** The instructor uses default access for simplicity. In production, you'd use private with getters/setters.

### ⚙️ Step 2: Test with default value

```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj1 = (Alien) context.getBean("alien1");
    Alien obj2 = (Alien) context.getBean("alien1");
    
    System.out.println(obj1.age);
    System.out.println(obj2.age);
}
```

**Output:**
```
Object created
0
0
```

**Both print 0** - the default value for int.

**This makes sense.** But it doesn't prove they're the same object yet.

### ⚙️ Step 3: The crucial test - modify through obj1

```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj1 = (Alien) context.getBean("alien1");
    Alien obj2 = (Alien) context.getBean("alien1");
    
    obj1.age = 21;  // Set age through obj1 ONLY!
    
    System.out.println(obj1.age);  // What will this print?
    System.out.println(obj2.age);  // What will this print?
}
```

**Critical observation:**
- We set age ONLY through obj1
- We never touched obj2.age
- If they're different objects, obj2.age should still be 0
- If they're the same object, obj2.age will be 21

### 🧪 Run the test

**Output:**
```
Object created
21
21
```

**BOTH print 21!** 🎉

### ❓ What does this prove?

**Irrefutable evidence that obj1 and obj2 refer to the SAME object!**

**Here's why:**
- ✅ We modified age through obj1
- ✅ The change appeared in obj2
- ✅ This is only possible if they point to the same memory location
- ✅ They are literally the same object instance

### 💡 The Java perspective

```java
// What we thought might be happening:
Alien obj1 = new Alien();  // Object 1 at memory address 100
Alien obj2 = new Alien();  // Object 2 at memory address 200
obj1.age = 21;  // Changes object at 100
// obj2.age remains 0 (different object at 200)

// What's actually happening:
Alien obj1 = /* Spring returns object at memory 100 */;
Alien obj2 = /* Spring returns SAME object at memory 100 */;
obj1.age = 21;  // Changes object at 100
// obj2.age is ALSO 21 (same object!)
```

**Both variables point to the same memory address!**

---

## Concept 3: Understanding the "Why"

### 🧠 Why does Spring do this?

**We have one bean definition in spring.xml:**
```xml
<bean id="alien1" class="com.telusko.app.Alien" />
```

**Spring's logic:**
> "You defined ONE bean with ID 'alien1'. Therefore, I'll create ONE instance of it."

**No matter how many times you call getBean("alien1"), Spring returns that ONE instance.**

### ❓ But why this behavior?

**This is called the Singleton pattern!**

**Singleton = One instance for the entire application**

**Advantages:**
- Memory efficiency (one object serves all needs)
- Shared state (all parts of application see same data)
- Fast retrieval (object already exists)
- Consistency (everyone gets same instance)

### 💡 Real-world analogy

**Think of a company's CEO:**
- There's only ONE CEO
- When different departments need to talk to the CEO
- They all talk to the SAME person
- Not a different CEO for each department!

**Spring's beans work the same way by default.**

---

## Concept 4: Introduction to Bean Scopes

### 🧠 What is a scope?

**The instructor introduces a crucial concept:**

> "When you talk about any bean in Spring, it has different scope."

**Bean scope determines:**
- How many instances Spring creates
- When those instances are created
- How long they live
- How they're shared across the application

### 🧠 Available scopes

**Spring provides multiple scopes:**

**Spring Core Scopes (what we'll focus on):**
1. **Singleton** (default)
2. **Prototype**

**Web Application Scopes (for Spring MVC/Web):**
3. **Request** (one instance per HTTP request)
4. **Session** (one instance per HTTP session)
5. **Application** (one instance per ServletContext)
6. **WebSocket** (one instance per WebSocket session)

### 💡 For this course

**We're learning Spring Core, so we focus on:**
- ✅ Singleton
- ✅ Prototype

**The web scopes come later when learning Spring MVC!**

---

## Concept 5: Singleton Scope - The Default Behavior

### 🧠 What is singleton scope?

**Singleton scope means:**
- **ONE instance per Spring container**
- Created when container loads (eager initialization)
- Shared across entire application
- All getBean() calls return the same instance

**This is Spring's default behavior!**

### ⚙️ Explicit singleton configuration

Even though singleton is default, you can declare it explicitly:

```xml
<bean id="alien1" 
      class="com.telusko.app.Alien" 
      scope="singleton" />
```

**This has the SAME behavior as:**

```xml
<bean id="alien1" class="com.telusko.app.Alien" />
<!-- scope="singleton" is implied -->
```

### 🧪 Test singleton explicitly

**spring.xml:**
```xml
<beans ...>
    <bean id="alien1" 
          class="com.telusko.app.Alien" 
          scope="singleton" />
</beans>
```

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj1 = (Alien) context.getBean("alien1");
    Alien obj2 = (Alien) context.getBean("alien1");
    
    obj1.age = 21;
    
    System.out.println(obj1.age);
    System.out.println(obj2.age);
}
```

**Output:**
```
Object created
21
21
```

**Same behavior! Singleton is the default.**

### 💡 When singleton is created

**Critical timing fact:**

**Singleton beans are created when the container loads!**

```java
ApplicationContext context = 
    new ClassPathXmlApplicationContext("spring.xml");
// ↑ Singleton objects created HERE!
```

**Even if you never call getBean(), the singleton is created at startup.**

### 🧠 Why this matters

**Singleton creation timing:**
- Eager initialization (created immediately)
- Fails-fast (errors appear at startup)
- Memory allocated upfront
- getBean() is just retrieval

**This is what we discovered in the previous lesson!**

---

## Concept 6: Prototype Scope - New Instance Every Time

### 🧠 What if you want different objects?

**Sometimes you DON'T want to share instances:**
- Each user needs their own object
- You need independent state
- Thread safety requires isolation
- Business logic demands separate instances

**For this, use prototype scope!**

### ⚙️ Configuring prototype scope

```xml
<bean id="alien1" 
      class="com.telusko.app.Alien" 
      scope="prototype" />
```

**The scope attribute changes the behavior completely!**

### 🧪 Test prototype scope

**spring.xml:**
```xml
<beans ...>
    <bean id="alien1" 
          class="com.telusko.app.Alien" 
          scope="prototype" />
</beans>
```

**App.java (same code as before):**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj1 = (Alien) context.getBean("alien1");
    Alien obj2 = (Alien) context.getBean("alien1");
    
    obj1.age = 21;
    
    System.out.println(obj1.age);
    System.out.println(obj2.age);
}
```

**Output:**
```
Object created
Object created
21
0
```

### ❓ What changed?

**Observe carefully:**

1. **"Object created" appears TWICE!**
   - Constructor ran twice
   - Two objects were created

2. **Different values printed:**
   - obj1.age = 21 (we set this)
   - obj2.age = 0 (default value, untouched)

3. **They are different instances!**
   - Modifying obj1 didn't affect obj2
   - Separate memory locations
   - Independent state

### 💡 Prototype behavior

**With prototype scope:**
- Each getBean() call creates a NEW instance
- No sharing between callers
- Independent objects with independent state
- Constructor runs for each getBean()

**Call getBean 1000 times? Get 1000 different objects!**

---

## Concept 7: When Objects Are Created - The Critical Difference

### 🧠 Singleton vs Prototype creation timing

**This is the most important distinction!**

### ⚙️ Experiment: Comment out getBean calls

**Let's test when objects are created for each scope.**

**Singleton test:**

**spring.xml:**
```xml
<bean id="alien1" 
      class="com.telusko.app.Alien" 
      scope="singleton" />
```

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    // All getBean calls commented out!
    // Alien obj1 = (Alien) context.getBean("alien1");
    // Alien obj2 = (Alien) context.getBean("alien1");
}
```

**Run it.**

**Output:**
```
Object created
```

**The constructor ran! Even though we NEVER called getBean()!**

### 🧪 Prototype test

**spring.xml:**
```xml
<bean id="alien1" 
      class="com.telusko.app.Alien" 
      scope="prototype" />
```

**App.java (same - no getBean calls):**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    // All getBean calls commented out!
    // Alien obj1 = (Alien) context.getBean("alien1");
    // Alien obj2 = (Alien) context.getBean("alien1");
}
```

**Run it.**

**Output:**
```
(no output)
```

**Nothing printed! No object was created!**

### ❓ What does this prove?

**Singleton beans:**
- ✅ Created when the container loads
- ✅ Created even if never requested
- ✅ Eager initialization
- ✅ Ready to use immediately

**Prototype beans:**
- ✅ Created ONLY when getBean() is called
- ✅ Lazy initialization
- ✅ No getBean() = no object creation
- ✅ On-demand creation

### 💡 The complete picture

**Singleton lifecycle:**
```java
// Step 1: Container initialization
ApplicationContext context = 
    new ClassPathXmlApplicationContext("spring.xml");
// → Singleton bean CREATED here!
// → Constructor runs
// → Object stored in container

// Step 2: Retrieve bean (multiple times)
Alien obj1 = context.getBean("alien1");  // Returns existing object
Alien obj2 = context.getBean("alien1");  // Returns SAME object
// obj1 == obj2  → true
```

**Prototype lifecycle:**
```java
// Step 1: Container initialization
ApplicationContext context = 
    new ClassPathXmlApplicationContext("spring.xml");
// → Prototype bean NOT created yet!
// → Just configuration loaded

// Step 2: Request bean
Alien obj1 = context.getBean("alien1");
// → NEW object created NOW!
// → Constructor runs
// → Returns this new instance

// Step 3: Request bean again
Alien obj2 = context.getBean("alien1");
// → ANOTHER new object created!
// → Constructor runs again
// → Returns different instance
// obj1 == obj2  → false
```

---

## Concept 8: Scope Comparison Table

### 📊 Side-by-side comparison

| Aspect | Singleton | Prototype |
|--------|-----------|-----------|
| **Instances created** | One per container | Many (one per getBean) |
| **When created** | Container startup | On getBean() call |
| **Constructor runs** | Once | Every getBean() call |
| **Memory usage** | Low (one instance) | High (many instances) |
| **State sharing** | Shared across application | Independent per instance |
| **Speed** | Fast (already created) | Slower (creates on demand) |
| **Use case** | Stateless services, utilities | Stateful objects, per-request data |
| **Thread safety** | Must be thread-safe | Naturally isolated |
| **Default scope?** | Yes ✅ | No |

### 💡 Choosing the right scope

**Use Singleton when:**
- Object is stateless (no instance variables that change)
- Shared resource (database connection pool, cache)
- Service classes (business logic)
- Utility classes
- Most common use case!

**Use Prototype when:**
- Object has state that varies per use
- Per-user or per-request data
- Thread isolation required
- Independent processing needed
- Less common, but important when needed

---

## Concept 9: Complete Code Demonstration

### 🧠 Putting it all together

**Let's see both scopes in action in one example:**

**spring.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="singleton1" 
          class="com.telusko.app.Alien" 
          scope="singleton" />
    
    <bean id="prototype1" 
          class="com.telusko.app.Laptop" 
          scope="prototype" />

</beans>
```

**Alien.java (singleton example):**
```java
package com.telusko.app;

public class Alien {
    int age;
    
    public Alien() {
        System.out.println("Alien object created");
    }
    
    public void code() {
        System.out.println("Coding...");
    }
}
```

**Laptop.java (prototype example):**
```java
package com.telusko.app;

public class Laptop {
    String brand;
    
    public Laptop() {
        System.out.println("Laptop object created");
    }
    
    public void compile() {
        System.out.println("Compiling...");
    }
}
```

**App.java:**
```java
package com.telusko.app;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class App {
    public static void main(String[] args) {
        System.out.println("=== Container Loading ===");
        ApplicationContext context = 
            new ClassPathXmlApplicationContext("spring.xml");
        
        System.out.println("\n=== Testing Singleton ===");
        Alien a1 = (Alien) context.getBean("singleton1");
        Alien a2 = (Alien) context.getBean("singleton1");
        
        a1.age = 25;
        System.out.println("a1.age: " + a1.age);
        System.out.println("a2.age: " + a2.age);
        System.out.println("Same object? " + (a1 == a2));
        
        System.out.println("\n=== Testing Prototype ===");
        Laptop l1 = (Laptop) context.getBean("prototype1");
        Laptop l2 = (Laptop) context.getBean("prototype1");
        
        l1.brand = "Dell";
        System.out.println("l1.brand: " + l1.brand);
        System.out.println("l2.brand: " + l2.brand);
        System.out.println("Same object? " + (l1 == l2));
    }
}
```

**Output:**
```
=== Container Loading ===
Alien object created

=== Testing Singleton ===
a1.age: 25
a2.age: 25
Same object? true

=== Testing Prototype ===
Laptop object created
Laptop object created
l1.brand: Dell
l2.brand: null
Same object? false
```

### 💡 Observations

**During container loading:**
- Only "Alien object created" prints (singleton)
- "Laptop object created" does NOT print (prototype)

**Singleton behavior:**
- One object creation
- Both variables have same age (25)
- a1 == a2 is true

**Prototype behavior:**
- Two objects created (when getBean called)
- Different brand values (Dell vs null)
- l1 == l2 is false

---

## ✅ Key Takeaways

### About Calling getBean Multiple Times

1. **With singleton scope (default):**
   - Multiple getBean() calls return the SAME instance
   - Modifying one reference affects all others
   - Object created once at container startup

2. **With prototype scope:**
   - Multiple getBean() calls return DIFFERENT instances
   - Each instance is independent
   - Objects created on-demand when requested

### About Bean Scopes

1. **Singleton is the default**
   - Don't need to specify scope="singleton"
   - One instance per Spring container
   - Most common use case

2. **Prototype for independent instances**
   - Must explicitly specify scope="prototype"
   - New instance per getBean() call
   - Use when isolation is needed

3. **Creation timing differs**
   - Singleton: Eager (at container startup)
   - Prototype: Lazy (on getBean() call)

### About Practical Implications

1. **Memory considerations**
   - Singleton: Low memory footprint
   - Prototype: Higher memory (many instances)

2. **Performance considerations**
   - Singleton: Fast retrieval (already created)
   - Prototype: Slower (creates on demand)

3. **Thread safety considerations**
   - Singleton: Must be thread-safe (shared)
   - Prototype: Naturally isolated (per caller)

---

## 💡 Final Insights

### The Singleton Pattern in Spring

**Why singleton is the default:**

Spring Framework follows best practices:
- Most beans are stateless services
- Stateless objects can be safely shared
- Memory efficient for large applications
- Aligns with enterprise application design

**Think of Spring's container as a registry:**
- Singleton: Registry of unique services (one CEO, one HR department)
- Prototype: Factory that produces items on demand (one order = one pizza)

### Real-World Scenarios

**Singleton examples:**
```java
// Services (stateless business logic)
<bean id="userService" class="UserService" scope="singleton" />

// DAOs (data access objects)
<bean id="userDao" class="UserDao" scope="singleton" />

// Utilities (helper classes)
<bean id="emailSender" class="EmailService" scope="singleton" />
```

**Prototype examples:**
```java
// User shopping carts (per-user state)
<bean id="shoppingCart" class="ShoppingCart" scope="prototype" />

// File processors (independent operations)
<bean id="fileProcessor" class="FileProcessor" scope="prototype" />

// Command objects (per-request actions)
<bean id="orderCommand" class="OrderCommand" scope="prototype" />
```

### Evolution with Annotations

**What we learned (XML):**
```xml
<bean id="alien" class="Alien" scope="prototype" />
```

**Modern Spring (Annotations):**
```java
@Component
@Scope("prototype")
public class Alien { ... }
```

**Same concept, different syntax!**

Understanding XML scopes helps you understand annotation-based scopes later.

### The "Age" Variable Choice

**The instructor used `int age` to demonstrate shared state.**

**Why age?**
- Simple to understand
- Clear when modified (21 vs 0)
- Demonstrates state mutation effectively
- Easy to verify same vs different objects

**In production:**
- Use private fields with getters/setters
- Follow encapsulation principles
- But the demonstration technique is valuable for learning!

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Expecting prototype at container load

**Wrong assumption:**
```java
ApplicationContext context = 
    new ClassPathXmlApplicationContext("spring.xml");
// "Prototype bean is created now" ❌
```

**Correct understanding:**
```java
// Prototype NOT created yet at container load
// Created only when:
Object obj = context.getBean("prototypeBean");
```

### Mistake 2: Assuming getBean creates new objects

**Wrong with singleton:**
```java
Alien a1 = context.getBean("alien");
Alien a2 = context.getBean("alien");
// "a1 and a2 are different objects" ❌
```

**Correct:**
```java
// By default (singleton), they're the SAME object ✅
```

### Mistake 3: Forgetting to set scope for prototype

**Wrong:**
```xml
<bean id="cart" class="ShoppingCart" />
<!-- Missing scope="prototype" -->
```
```java
// Each user gets SAME cart instance - bug! ❌
```

**Correct:**
```xml
<bean id="cart" class="ShoppingCart" scope="prototype" />
<!-- Now each user gets unique cart ✅ -->
```

### Mistake 4: Using singleton for stateful beans

**Wrong:**
```xml
<bean id="userSession" class="UserSession" scope="singleton" />
<!-- Stateful object as singleton = shared state between all users! ❌ -->
```

**Correct:**
```xml
<bean id="userSession" class="UserSession" scope="prototype" />
<!-- Each user gets their own session ✅ -->
```

---

## 🎯 Practice Exercises

### Exercise 1: Verify object identity

Create a bean and retrieve it twice. Use `==` operator and `hashCode()` to verify:
- With singleton: same identity
- With prototype: different identity

### Exercise 2: Count instances

Add a static counter in your class constructor:
```java
static int instanceCount = 0;

public Alien() {
    instanceCount++;
    System.out.println("Total instances: " + instanceCount);
}
```

Test with both scopes. What do you observe?

### Exercise 3: Mix scopes

Configure two beans of the same class with different scopes:
```xml
<bean id="single" class="Alien" scope="singleton" />
<bean id="proto" class="Alien" scope="prototype" />
```

Retrieve each multiple times. Observe the behavior difference.

### Exercise 4: Real-world scenario

Design a simple shopping application:
- `ProductCatalog` (singleton - shared across app)
- `ShoppingCart` (prototype - unique per user)

Implement and test their behaviors.

---

## 🔗 Quick Summary

**The answer to our cliffhanger:**

Calling getBean() twice with the same ID returns:
- **Singleton (default):** Same object ✅
- **Prototype:** Different objects ✅

**Configuration:**
```xml
<!-- Singleton (default) -->
<bean id="x" class="Foo" />
<!-- or explicitly: -->
<bean id="x" class="Foo" scope="singleton" />

<!-- Prototype -->
<bean id="y" class="Bar" scope="prototype" />
```

**Creation timing:**
- **Singleton:** Container startup (eager)
- **Prototype:** getBean() call (lazy)

**Next topic:** How to inject dependencies between beans (wiring)! 🔗
