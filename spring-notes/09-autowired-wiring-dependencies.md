# 🔗 Dependency Injection with @Autowired - Wiring Beans Together

## Introduction

We've successfully created Spring beans and retrieved them from the IoC Container. That's great! But real applications aren't that simple. **Objects depend on other objects.**

Think about it:
- A `Car` depends on an `Engine`
- A `Service` depends on a `Repository`
- A `Controller` depends on a `Service`
- An `Alien` (programmer) depends on a `Laptop` to code!

This is where **true Dependency Injection** shines. It's not just about Spring creating objects - it's about Spring **wiring objects together**, automatically injecting dependencies where needed.

In this lesson, we'll:
- Create a dependency relationship between Alien and Laptop
- See what goes wrong without proper wiring
- Use `@Autowired` to inject dependencies
- Understand how Spring wires beans together
- Build multi-layered dependencies

Let's add another layer of complexity! 🚀

---

## Concept 1: The Real-World Scenario

### 🧠 Understanding the need

Currently, our `Alien` class has a `code()` method:

```java
@Component
public class Alien {
    public void code() {
        System.out.println("Coding...");
    }
}
```

But wait - **how does an alien (programmer) code?**

### ❓ What's missing?

**You need a machine to write code!**

Sure, you could write code on paper (theoretically). But to **compile** and run it? You need:
- A laptop
- A desktop
- A computer
- Some machine!

**Alien depends on Laptop.**

### 💡 The dependency relationship

In programming terms:

```
Alien class needs Laptop object to function properly
         ↓
    This is a dependency
         ↓
Alien depends on Laptop
```

**Real-world examples:**
- Chef depends on Kitchen
- Driver depends on Car
- Teacher depends on Classroom
- **Programmer depends on Computer**

This is universal in software. Let's implement it!

---

## Concept 2: Creating the Laptop Class

### 🧠 What we need

We need a `Laptop` class that can compile code.

### ⚙️ Step 1: Create the Laptop class

In the same package as `Alien`, create a new class:

```java
package com.telusko.app;

public class Laptop {
    
    public void compile() {
        System.out.println("Compiling...");
    }
}
```

**Simple!** A laptop can compile code.

### 🧠 Making it a Spring bean

Remember the rule: **Spring only manages classes marked with @Component**.

Let's add the annotation:

```java
package com.telusko.app;

import org.springframework.stereotype.Component;

@Component
public class Laptop {
    
    public void compile() {
        System.out.println("Compiling...");
    }
}
```

Now Spring will create a `Laptop` bean in the container.

### 💡 Package structure note

The instructor mentions: **"All this alien laptop should be in a different package."**

**In real projects:**
```
com.telusko.app/
├── model/
│   └── Alien.java
├── hardware/
│   └── Laptop.java
└── SpringBootDemoApplication.java
```

**For learning:**
```
com.telusko.app/
├── Alien.java
├── Laptop.java
└── SpringBootDemoApplication.java
```

Having them in the same package is fine for learning. Focus on the concepts first!

---

## Concept 3: Adding the Dependency to Alien

### 🧠 Alien needs Laptop

Let's update the `Alien` class to use a `Laptop`:

```java
@Component
public class Alien {
    
    private Laptop laptop;  // Alien has a Laptop
    
    public void code() {
        laptop.compile();  // Use the laptop to compile
    }
}
```

**What changed?**

1. **We added a field:** `private Laptop laptop;`
2. **We use it in the method:** `laptop.compile();`

### ❓ How will this laptop object be created?

**Traditional approach would be:**
```java
private Laptop laptop = new Laptop();  // We create it
```

**But we want Spring to provide it!**

So we just declare the field without initializing it:
```java
private Laptop laptop;  // Spring will inject it (we hope!)
```

### 💡 The intention

We're saying: "Alien needs a Laptop. Spring, please provide one!"

But will Spring know to do this? Let's find out...

---

## Concept 4: Testing Without Wiring - The Null Pointer

### 🧠 Let's test our current code

In the main method, simplify to just one alien:

```java
public static void main(String[] args) {
    ApplicationContext context = 
        SpringApplication.run(SpringBootDemoApplication.class, args);
    
    Alien alien = context.getBean(Alien.class);
    alien.code();  // This calls laptop.compile() internally
}
```

**What we're expecting:**
- Spring creates Alien bean
- Spring creates Laptop bean
- When we call `alien.code()`, it uses the laptop to compile
- Output: "Compiling..."

### 🧪 Run the application

Click Run.

### 💥 What happens?

**ERROR!** 🔴

```
java.lang.NullPointerException:
Cannot invoke "com.telusko.app.Laptop.compile()" 
because "this.laptop" is null
```

### ❓ Why is laptop null?

**Great question!** Let's analyze:

1. ✅ Spring created the Alien bean (it's in the container)
2. ✅ Spring created the Laptop bean (it's in the container - we have @Component)
3. ❌ Spring did NOT inject the Laptop into the Alien

**Why not?**

**Because we didn't tell Spring to do so!**

---

## Concept 5: Proving the Laptop Bean Exists

### 🧠 Doubting ourselves

You might think: "Maybe the Laptop bean wasn't created?"

**Let's prove it exists.**

### 🧪 Direct test

Comment out the alien code and get the laptop directly:

```java
public static void main(String[] args) {
    ApplicationContext context = 
        SpringApplication.run(SpringBootDemoApplication.class, args);
    
    // Comment out alien for now
    // Alien alien = context.getBean(Alien.class);
    // alien.code();
    
    // Test laptop directly
    Laptop laptop = context.getBean(Laptop.class);
    laptop.compile();
}
```

Run it.

**Output:**
```
... Spring Boot startup ...
Compiling...
```

**It works!** ✅

### ❓ So what's the problem?

**The laptop bean EXISTS in the container.**

The problem is in the `Alien` class:
- The `laptop` field is not initialized
- Spring didn't inject the laptop bean into it
- When `alien.code()` runs, `laptop` is still null

### 💡 The insight

**Having beans in the container is not enough.**

**You need to tell Spring to inject dependencies where they're needed.**

---

## Concept 6: Understanding the Wiring Problem

### 🧠 Why we can get beans in main but not in Alien

In the main method, this works:
```java
Laptop laptop = context.getBean(Laptop.class);  // ✅ Works!
```

But in the Alien class, this doesn't work automatically:
```java
private Laptop laptop;  // ❌ Stays null!
```

### ❓ Why the difference?

**In the main method:**
- We have direct access to `ApplicationContext`
- We can explicitly call `getBean()`
- We're manually retrieving beans

**In other Spring beans (like Alien):**
- No direct access to ApplicationContext (usually)
- Can't call `getBean()` ourselves
- Need Spring to inject dependencies automatically

### ⚙️ The need for wiring

Think of it like electricity:
- The power plant (IoC Container) has electricity (beans)
- Your house (Alien class) needs electricity (Laptop bean)
- **You need wires to connect them!**

That's what "wiring" means in Spring - **connecting dependencies**.

### 💡 Spring's philosophy

**Spring's rule:** "I won't inject dependencies unless you explicitly tell me to."

**Why?**

Imagine if Spring tried to inject every field of every type:
- What if you want to create your own instance?
- What if the field should stay null?
- What if there are multiple beans of the same type?

**Spring needs you to be explicit about what should be injected.**

---

## Concept 7: The @Autowired Annotation

### 🧠 How to tell Spring to inject dependencies

**The answer:** Use the `@Autowired` annotation!

`@Autowired` tells Spring:
> "This field/parameter needs a bean from the container. Please inject it automatically."

### ⚙️ Applying @Autowired to Alien

Update the Alien class:

```java
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class Alien {
    
    @Autowired  // ← This is the magic!
    private Laptop laptop;
    
    public void code() {
        laptop.compile();
    }
}
```

**That's it!** One annotation.

### 🧠 What @Autowired does

When Spring creates the Alien bean:

**Without @Autowired:**
```
1. Spring creates new Alien()
2. laptop field stays null (default)
3. Alien bean stored in container
```

**With @Autowired:**
```
1. Spring creates new Alien()
2. Spring sees @Autowired on laptop field
3. Spring looks in container for a Laptop bean
4. Spring finds the Laptop bean
5. Spring injects it: alien.laptop = laptopBean
6. Alien bean stored in container (now with laptop injected!)
```

### 🧪 Let's test it!

Uncomment the alien code in main:

```java
public static void main(String[] args) {
    ApplicationContext context = 
        SpringApplication.run(SpringBootDemoApplication.class, args);
    
    Alien alien = context.getBean(Alien.class);
    alien.code();  // Should work now!
}
```

Run the application.

**Output:**
```
... Spring Boot startup ...
Compiling...
```

**Success!** 🎉

### 💡 What just happened?

**The full chain:**

1. Spring Boot starts
2. Component scanning finds `@Component` on Alien and Laptop
3. Spring creates both beans
4. Spring sees `@Autowired` on Alien's laptop field
5. Spring injects the Laptop bean into Alien
6. When you call `alien.code()`, laptop is not null - it's the injected bean!
7. `laptop.compile()` executes successfully

**This is Dependency Injection in action!** 💉

---

## Concept 8: Understanding Dependency Layers

### 🧠 The dependency chain

Let's visualize what we've built:

```
┌──────────────────────────┐
│   main() method          │
│                          │
│  - Has ApplicationContext│
│  - Calls getBean()       │
└─────────────┬────────────┘
              │ gets bean
              ↓
┌──────────────────────────┐
│   Alien Bean             │
│   @Component             │
│                          │
│  - Has @Autowired Laptop │
└─────────────┬────────────┘
              │ autowired
              ↓
┌──────────────────────────┐
│   Laptop Bean            │
│   @Component             │
│                          │
│  - compile() method      │
└──────────────────────────┘
```

### ❓ Why different approaches at each level?

**In main():**
```java
Alien alien = context.getBean(Alien.class);
```
- We have `ApplicationContext`
- We use it directly
- Explicit retrieval

**In Alien class:**
```java
@Autowired
private Laptop laptop;
```
- No ApplicationContext access
- Use `@Autowired` instead
- Spring handles injection automatically

### 💡 The pattern

**At the application entry point (main):**
- You have the context
- You manually get beans

**Inside Spring beans:**
- You don't have the context
- You use `@Autowired` for dependencies
- Spring wires everything automatically

**This is the power of Dependency Injection!**

---

## Concept 9: Adding More Layers - CPU Example

### 🧠 Going deeper

The instructor suggests: **"You can create one more layer where laptop is dependent on CPU."**

**The chain would be:**
```
main → Alien → Laptop → CPU
```

### 🧪 Assignment: Create the CPU dependency

Let's think through how you'd implement this:

**Step 1: Create CPU class**
```java
@Component
public class CPU {
    public void process() {
        System.out.println("Processing...");
    }
}
```

**Step 2: Update Laptop to depend on CPU**
```java
@Component
public class Laptop {
    
    @Autowired
    private CPU cpu;
    
    public void compile() {
        cpu.process();  // CPU processes during compilation
        System.out.println("Compiling...");
    }
}
```

**Step 3: Run the application**

The full chain executes:
```
alien.code()
    ↓
laptop.compile()
    ↓
cpu.process()
```

**Output:**
```
Processing...
Compiling...
```

### ❓ How does Spring handle this?

**Spring's dependency resolution:**

1. Main requests Alien bean
2. Spring sees Alien needs Laptop
3. Spring checks: Does Laptop bean exist? If not, create it
4. Before creating Laptop, Spring sees it needs CPU
5. Spring checks: Does CPU bean exist? If not, create it
6. Spring creates CPU bean (no dependencies)
7. Spring creates Laptop bean (injects CPU)
8. Spring creates Alien bean (injects Laptop)
9. Spring returns fully-wired Alien to your code

**Spring resolves dependencies in the correct order automatically!**

This is called **dependency resolution** or **bean initialization order**.

### 💡 No matter how deep, Spring handles it

```
You → Bean A → Bean B → Bean C → Bean D
```

As long as:
- All classes have `@Component`
- All dependencies have `@Autowired`
- No circular dependencies (A depends on B, B depends on A)

**Spring wires the entire chain automatically!**

---

## Concept 10: What's Happening Behind the Scenes?

### 🧠 The suspense

Throughout this lesson, the instructor mentions: **"It will make much more sense once we start with Spring Framework to understand what is happening behind the scenes."**

**Why the suspense?**

Because right now, we're using Spring Boot's convenience:
- Annotations (`@Component`, `@Autowired`)
- Auto-configuration
- Component scanning

**But what's Spring Boot doing for us?**

1. Setting up component scanning
2. Creating the ApplicationContext
3. Scanning for annotations
4. Creating beans
5. Resolving dependencies
6. Injecting dependencies

### ❓ How did Spring handle @Autowired?

**The magic Spring Boot hides:**

**Field Injection (what we're using):**
- Spring uses reflection
- Directly sets the field value
- Even though it's private!

**Behind the scenes:**
```java
// Spring internally does something like:
Alien alienBean = new Alien();
Laptop laptopBean = container.getBean(Laptop.class);
// Using reflection:
Field laptopField = Alien.class.getDeclaredField("laptop");
laptopField.setAccessible(true);
laptopField.set(alienBean, laptopBean);
```

**We'll understand this deeply when we explore Spring Framework.**

### 💡 The teaching approach

**Why Spring Boot first?**
- Get it working quickly
- See results
- Stay motivated
- Understand the abstractions

**Then Spring Framework:**
- Understand the internals
- See what Spring Boot automates
- Configure manually
- Appreciate the convenience

**"Suspense is fun!"** - letting concepts unfold gradually helps learning.

---

## Concept 11: Different Configuration Approaches

### 🧠 The historical context

The instructor shares personal experience: **"This is not how I started doing Spring because I started Spring before Spring Boot."**

**There are multiple ways to configure Spring:**

### ⚙️ Configuration methods

**1. XML Configuration** (Old school)
```xml
<!-- beans.xml -->
<beans>
    <bean id="laptop" class="com.telusko.app.Laptop"/>
    <bean id="alien" class="com.telusko.app.Alien">
        <property name="laptop" ref="laptop"/>
    </bean>
</beans>
```

**2. Java-based Configuration**
```java
@Configuration
public class AppConfig {
    @Bean
    public Laptop laptop() {
        return new Laptop();
    }
    
    @Bean
    public Alien alien() {
        Alien alien = new Alien();
        alien.setLaptop(laptop());
        return alien;
    }
}
```

**3. Annotation-based Configuration** (What we're using)
```java
@Component
public class Alien {
    @Autowired
    private Laptop laptop;
}
```

### ❓ Which is best?

**Modern development:** Annotations (what we're learning)
- Concise
- Close to the code
- Easy to understand
- Spring Boot's approach

**Legacy projects:** XML or Java-config
- More explicit
- Centralized configuration
- Easier to change without recompiling (XML)

### 💡 Evolution of Spring

```
XML Configuration (2000s)
    ↓
Java-based Configuration (2010s)
    ↓
Annotation-based Configuration (2010s-present)
    ↓
Spring Boot auto-configuration (2014-present)
```

**We're learning the modern way, but we'll understand the traditional way to appreciate the evolution.**

---

## Concept 12: Comparing Our Code - Before and After

### 🧠 The transformation

Let's see how far we've come:

**Lesson 1 (Basic Bean):**
```java
@Component
public class Alien {
    public void code() {
        System.out.println("Coding...");
    }
}

// Main:
Alien alien = context.getBean(Alien.class);
alien.code();  // Prints: Coding...
```

**Lesson 2 (Dependency Injection):**
```java
@Component
public class Laptop {
    public void compile() {
        System.out.println("Compiling...");
    }
}

@Component
public class Alien {
    @Autowired
    private Laptop laptop;
    
    public void code() {
        laptop.compile();  // Uses injected dependency!
    }
}

// Main:
Alien alien = context.getBean(Alien.class);
alien.code();  // Prints: Compiling...
```

### ❓ What's the difference?

**Lesson 1:**
- Single independent bean
- No dependencies between objects
- Basic IoC

**Lesson 2:**
- Multiple related beans
- Dependencies between objects
- True Dependency Injection
- Automatic wiring

### 💡 The progress

We've moved from:
- "Spring creates objects for me"

To:
- "Spring creates objects AND wires them together for me"

**That's the power of Dependency Injection!**

---

## ✅ Key Takeaways

Let's consolidate everything we learned:

### About Dependencies

1. **Real applications have dependencies between objects**
   - Alien depends on Laptop
   - Laptop depends on CPU
   - Service depends on Repository

2. **Dependencies form chains**
   - Multi-layered: A → B → C → D
   - Spring handles the entire chain

### About @Autowired

1. **@Autowired tells Spring to inject dependencies**
   - Without it, fields stay null
   - With it, Spring injects beans from container

2. **Spring uses reflection to inject**
   - Can inject into private fields
   - Happens during bean creation
   - Automatic and transparent

3. **Only works inside Spring beans**
   - Must be on `@Component` classes
   - Not regular POJOs created with `new`

### About Wiring

1. **Main method is special**
   - Has ApplicationContext
   - Manually gets beans with getBean()

2. **Inside Spring beans**
   - Use @Autowired for dependencies
   - No direct container access needed
   - Spring handles wiring automatically

3. **Both beans must be in container**
   - Both need @Component (or similar)
   - Spring can only inject beans it manages

### About Configuration

1. **Multiple approaches exist**
   - XML (old)
   - Java-config (traditional)
   - Annotations (modern)

2. **We're using annotation-based**
   - Simplest and most modern
   - Spring Boot's default approach

3. **Spring Framework details coming**
   - Will understand internals
   - See manual configuration
   - Appreciate Boot's abstractions

---

## 💡 Final Insights

### The Power of Dependency Injection

Without DI:
```java
public class Alien {
    private Laptop laptop = new Laptop();  // Tightly coupled!
    
    public void code() {
        laptop.compile();
    }
}
```

**Problems:**
- Hard to test (can't mock Laptop)
- Tightly coupled to Laptop implementation
- Can't change Laptop at runtime
- Alien controls Laptop creation

With DI:
```java
@Component
public class Alien {
    @Autowired  // Loosely coupled!
    private Laptop laptop;
    
    public void code() {
        laptop.compile();
    }
}
```

**Benefits:**
- Easy to test (inject mock Laptop)
- Loosely coupled
- Can change Laptop implementation
- Spring controls creation and wiring

### The Learning Journey

**Where we've been:**
1. ✅ Understanding IoC and DI concepts
2. ✅ Creating Spring Boot project
3. ✅ Creating and retrieving beans
4. ✅ Injecting dependencies with @Autowired

**Where we're going:**
1. 🔜 Spring Framework internals
2. 🔜 XML configuration
3. 🔜 Bean scopes
4. 🔜 Advanced DI techniques

### Why Start Easy?

The instructor's approach is pedagogically sound:
- Start with Spring Boot (easy, working code)
- Build confidence and understanding
- Then dive into Spring Framework (complexity)
- Appreciate what Spring Boot does for you

**It's time to get our hands dirty with Spring Framework!** 🎯

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Forgetting @Autowired
```java
@Component
public class Alien {
    private Laptop laptop;  // No @Autowired!
    
    public void code() {
        laptop.compile();  // NullPointerException!
    }
}
```
**Fix:** Add `@Autowired` annotation

### Mistake 2: Forgetting @Component on dependency
```java
// NO @Component!
public class Laptop {
    public void compile() { ... }
}

@Component
public class Alien {
    @Autowired
    private Laptop laptop;  // No bean to inject!
}
```
**Fix:** Add `@Component` to Laptop

### Mistake 3: Creating own instance
```java
@Component
public class Alien {
    @Autowired
    private Laptop laptop;
    
    public void code() {
        Laptop myLaptop = new Laptop();  // Bypasses Spring!
        myLaptop.compile();
    }
}
```
**Why wrong:** You create a new instance instead of using the injected bean. Any dependencies Laptop has won't be wired.

### Mistake 4: Circular dependencies
```java
@Component
public class Alien {
    @Autowired
    private Laptop laptop;
}

@Component
public class Laptop {
    @Autowired
    private Alien alien;  // Circular!
}
```
**Problem:** Spring can't resolve - which to create first?  
**Fix:** Redesign to avoid circular dependencies

---

## 🎯 Practice Assignments

Before moving to Spring Framework, solidify these concepts:

### Assignment 1: Three-layer dependency
Create:
- `Developer` (uses Computer)
- `Computer` (uses Processor)
- `Processor` (does processing)

Wire them with @Autowired and test the chain.

### Assignment 2: Multiple dependencies
Create `Programmer` that depends on BOTH `Laptop` and `Internet`:
```java
@Component
public class Programmer {
    @Autowired
    private Laptop laptop;
    
    @Autowired
    private Internet internet;
    
    public void develop() {
        laptop.compile();
        internet.search("Stack Overflow");
    }
}
```

### Assignment 3: Test without @Component
Remove @Component from a dependency and observe the error. Understand why it fails.

### Assignment 4: The CPU example
Complete the instructor's challenge:
- Add CPU class
- Make Laptop depend on CPU
- Test the three-layer chain

---

## 🔗 Quick Summary

**The Pattern:**
1. Create classes with `@Component`
2. Add dependencies as fields
3. Mark dependencies with `@Autowired`
4. Spring creates and wires automatically

**The Result:**
- Loose coupling between classes
- Easy testing
- Flexible configuration
- Spring manages everything

**The Magic:**
- `@Component`: "Spring, manage this class"
- `@Autowired`: "Spring, inject dependencies here"
- Spring handles the rest!

**Next:** Time to understand what Spring Boot has been hiding from us. Spring Framework, here we come! 🚀
