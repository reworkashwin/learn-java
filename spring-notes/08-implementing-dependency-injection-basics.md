# 💉 Implementing Dependency Injection with Spring Boot

## Introduction

The moment has arrived! We've learned the theory. We've set up our project. We understand the relationship between Spring and Spring Boot. Now it's time to **actually write code** that implements Dependency Injection.

But before we dive in, let's understand the approach. We're starting with Spring Boot because it's easier and faster. But remember - we'll revisit this with Spring Framework to understand what's happening behind the scenes. **First make it work, then understand the magic.**

In this lesson, we'll:
- Create our first Spring-managed object (a "bean")
- Get that object from the Spring container
- See Dependency Injection in action
- Understand the `@Component` annotation
- Discover how Spring knows what to manage

Let's start coding! 🚀

---

## Concept 1: A Quick Update - Java 21

### 🧠 Version upgrade

Before we start, there's a small update from the previous lesson.

**Previously:** We were using **Java 17**  
**Now:** We've upgraded to **Java 21**

### ❓ Why does this matter?

Java 21 is the latest LTS (Long Term Support) version. It includes:
- Performance improvements
- New language features  
- Better garbage collection
- Security updates

### ⚙️ What changes for us?

**Nothing in our code!**

That's the beauty of backward compatibility. Code that works with Java 17 works with Java 21. We're just getting a newer, better foundation.

### 💡 The takeaway

Both Java 17 and 21 work with Spring Boot 3. If you have 17, that's fine. If you have 21, even better. The code we write remains identical.

Let's move on to the actual implementation!

---

## Concept 2: Understanding the Main Application

### 🧠 What we have so far

Open your main application file (`SpringBootDemoApplication.java`). You should see something like:

```java
@SpringBootApplication
public class SpringBootDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootDemoApplication.class, args);
        System.out.println("Hello World!");
    }
}
```

### ❓ What does this code do?

Let's break down that important line:

```java
SpringApplication.run(SpringBootDemoApplication.class, args);
```

**This line does several critical things:**

1. **Activates the Spring Framework** - Starts up Spring's engine
2. **Creates the IoC Container** - Remember that "box" where Spring stores objects?
3. **Scans for components** - Looks for classes annotated with `@Component`, `@Service`, etc.
4. **Creates beans** - Instantiates objects and stores them in the container
5. **Sets up the context** - Prepares everything for dependency injection

### 🧠 Beans? What are beans?

You'll hear this term constantly in Spring, so let's clarify:

**Bean = An object created and managed by Spring**

That's it. Nothing fancy.

- You create an object with `new`? It's just an object.
- Spring creates an object? It's called a **bean**.

**Same thing, different name based on who created it.**

### 💡 Current state

Right now, our code:
- ✅ Starts Spring Framework
- ✅ Creates the IoC Container
- ❌ Doesn't use the container at all
- ❌ Just prints "Hello World"

**We're not leveraging Spring's power yet.** Let's change that!

---

## Concept 3: Creating Our First Class

### 🧠 The goal

We want to create a class and have Spring manage its objects. Let's start simple.

### ⚙️ Step 1: Create a new class

In your project, in the same package as your main application, create a new class called **`Alien`**.

**File structure:**
```
src/main/java/com/telusko/app/
├── SpringBootDemoApplication.java
└── Alien.java  ← New file
```

### 🧪 The Alien class

```java
package com.telusko.app;

public class Alien {
    
    public void code() {
        System.out.println("Coding...");
    }
}
```

**That's it. A simple class with one method.**

### ❓ Why "Alien"?

The instructor has a fun philosophy: **"Programmers are aliens."**

**Why?** Because programmers don't fully live in the physical world. We live mentally and virtually in the digital world. We're aliens to the "normal" world! 👽

**But more practically:** Whenever you see "Alien" in examples, think "Programmer" or any entity in your application. The concept is universal - the name is just for fun.

### 💡 The method

The `code()` method represents something an Alien/Programmer does. In a real application, this could be:
- A `Customer` with a `purchase()` method
- An `Employee` with a `work()` method
- A `Car` with a `drive()` method

**The principle is the same regardless of the class name.**

---

## Concept 4: The Traditional Approach - Using `new`

### 🧠 How we normally use this class

In your main method, let's use the Alien class the traditional way:

```java
public static void main(String[] args) {
    SpringApplication.run(SpringBootDemoApplication.class, args);
    
    // Traditional approach
    Alien alien = new Alien();
    alien.code();
}
```

### ⚙️ What's happening here?

**Step 1:** We create an object using `new` keyword
```java
Alien alien = new Alien();
```

**Step 2:** We call the method using that object
```java
alien.code();
```

This is standard Java. Nothing Spring-specific.

### 🧪 Let's test it

Run the application.

**Expected output:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

... startup logs ...
Coding...
```

**It works!** ✅

### ❓ So what's the problem?

**We created the object ourselves.**

We used `new`. That means:
- **We** control object creation
- **We** are responsible for the object's lifecycle
- **We** haven't inverted any control
- **We** aren't using Spring's IoC Container

**Spring is running, but we're not using its Dependency Injection capabilities!**

### 💡 The goal

What we want:
```java
// We don't want this:
Alien alien = new Alien();  ❌ We create it

// We want this:
Alien alien = <Spring gives it to us>;  ✅ Spring creates it
```

**How do we make Spring create the object for us?**

---

## Concept 5: Attempting to Get Object from Spring

### 🧠 The idea

If Spring is supposed to create objects and store them in the IoC Container, then we should be able to **ask the container for an object** instead of creating it ourselves.

### ❓ But where IS the container?

Good question! The container exists, but how do we access it?

**We need a reference to the container.**

### ⚙️ Understanding ApplicationContext

Remember this line?
```java
SpringApplication.run(SpringBootDemoApplication.class, args);
```

This method **returns something**. Let's capture it!

**Look at the method signature:**
```java
public static ConfigurableApplicationContext run(...)
```

It returns a **`ConfigurableApplicationContext`** object!

### 🧠 What is ConfigurableApplicationContext?

**`ConfigurableApplicationContext`** is a type of **`ApplicationContext`**.

**And what is ApplicationContext?**

**ApplicationContext is your gateway to the IoC Container.**

Think of it like:
- The container is a vault full of objects
- ApplicationContext is the key to that vault
- With the key, you can request objects from the vault

### ⚙️ Capturing the context

Let's capture that return value:

```java
public static void main(String[] args) {
    ApplicationContext context = 
        SpringApplication.run(SpringBootDemoApplication.class, args);
    
    // Now we have access to the container!
}
```

### 💡 What we just did

```
SpringApplication.run() 
    ↓
Creates and returns the ApplicationContext
    ↓
We store it in a variable called 'context'
    ↓
Now we can communicate with the IoC Container!
```

**The context is our communication channel to Spring's container.**

---

## Concept 6: Requesting a Bean from the Container

### 🧠 Asking for an object

Now that we have the `context` (our access to the container), we can ask for objects.

In Spring terminology, we **"get a bean"** from the container.

### ⚙️ The getBean() method

The `ApplicationContext` provides a method called `getBean()`:

```java
ApplicationContext context = 
    SpringApplication.run(SpringBootDemoApplication.class, args);

Alien alien = context.getBean(Alien.class);
alien.code();
```

### 🧠 Understanding getBean()

**What we're saying:**
```java
context.getBean(Alien.class)
```

**Translation:** "Hey container, give me the object of `Alien` class that you've created."

**Parameters:**
- `Alien.class` - We specify which class's object we want

**Why do we need to specify?**

Because your container might have objects of many different classes:
- Alien objects
- Laptop objects
- Service objects
- Repository objects
- etc.

Spring needs to know **which one** you're asking for.

### 🧪 Let's test this

Remove the `new Alien()` line and use the Spring approach:

```java
public static void main(String[] args) {
    ApplicationContext context = 
        SpringApplication.run(SpringBootDemoApplication.class, args);
    
    // Get object from Spring
    Alien alien = context.getBean(Alien.class);
    alien.code();
}
```

Run the application.

### 💥 What happens?

**ERROR!** 🔴

```
NoSuchBeanDefinitionException: 
No qualifying bean of type 'com.telusko.app.Alien' available
```

### ❓ Why the error?

**Spring says:** "I don't have an Alien bean in my container!"

**But why not?** We have the Alien class!

---

## Concept 7: Understanding the Problem

### 🧠 Why Spring didn't create the bean

Here's the critical insight:

**Spring does NOT automatically create objects for every class in your project.**

Imagine if it did! If you have 100 classes in your project:
- Spring would create 100 objects
- Most of them you might never use
- Memory waste
- Slower startup
- Unnecessary complexity

### ❓ So how does Spring decide?

**Simple: You tell Spring which classes to manage.**

**Spring's philosophy:**
> "I'll only create and manage objects for classes you explicitly mark."

**By default, Spring creates zero objects. You must opt-in.**

### 💡 The opt-in mechanism

You need a way to tell Spring: "Hey, manage this class!"

**That's where annotations come in.**

Specifically, the `@Component` annotation.

---

## Concept 8: The @Component Annotation

### 🧠 What is @Component?

`@Component` is an annotation you put on a class to tell Spring:

> "This class should be managed by you. Create objects of this class and keep them in your IoC Container."

### ⚙️ How to use it

Simply add `@Component` on top of your class:

```java
package com.telusko.app;

import org.springframework.stereotype.Component;

@Component
public class Alien {
    
    public void code() {
        System.out.println("Coding...");
    }
}
```

**That's it!** One annotation.

### 🧠 What happens when Spring sees @Component?

During startup, Spring:

1. **Scans your packages** - Looks through all your classes
2. **Finds @Component** - "Ah, there's a component!"
3. **Creates an instance** - `new Alien()` (Spring does this)
4. **Stores in container** - The bean is now available
5. **Manages lifecycle** - Spring handles the object's lifecycle

### 🧪 Let's test it now

With `@Component` added to Alien class, run the application again.

**Output:**
```
... Spring Boot startup ...
Coding...
```

**It works!** ✅

### 💡 What just happened?

**Without @Component:**
```
Spring starts
    ↓
Scans classes
    ↓
Finds no components
    ↓
Creates no Alien bean
    ↓
You request Alien bean
    ↓
ERROR: No such bean!
```

**With @Component:**
```
Spring starts
    ↓
Scans classes
    ↓
Finds @Component on Alien
    ↓
Creates Alien bean and stores it
    ↓
You request Alien bean
    ↓
SUCCESS: Here's your bean!
```

---

## Concept 9: Understanding What We Achieved

### 🧠 The before and after

**Before (Traditional Java):**
```java
Alien alien = new Alien();  // YOU create it
alien.code();
```

**After (Spring Dependency Injection):**
```java
Alien alien = context.getBean(Alien.class);  // SPRING creates it
alien.code();
```

### ❓ Is this dependency injection?

**Yes!**

**What's being injected?**
The object itself. Spring created it and **injected** (provided) it to your code when you called `getBean()`.

**Who's doing the injection?**
Spring Framework.

**Where did the object come from?**
The IoC Container.

### 💡 The IoC principle in action

Remember Inversion of Control?

**Control of object creation has been inverted:**
- **Before:** You controlled it (with `new`)
- **Now:** Spring controls it (with IoC Container)

**You've successfully implemented IoC and Dependency Injection!** 🎉

---

## Concept 10: Testing Multiple Bean Retrievals

### 🧠 An interesting experiment

What if we get the bean multiple times?

```java
public static void main(String[] args) {
    ApplicationContext context = 
        SpringApplication.run(SpringBootDemoApplication.class, args);
    
    Alien obj1 = context.getBean(Alien.class);
    obj1.code();
    
    Alien obj2 = context.getBean(Alien.class);
    obj2.code();
}
```

### ❓ Questions this raises

1. **Will this work?** Can we call `getBean()` multiple times?
2. **Are we getting the same object or different objects?**

These are excellent questions!

### 🧪 Let's test it

Run the code.

**Output:**
```
... Spring Boot startup ...
Coding...
Coding...
```

**It works!** ✅

Both calls to `code()` execute successfully.

### ❓ But are obj1 and obj2 the same object?

**This is a suspenseful question!** 🤔

The instructor playfully says: **"I don't want to answer that now. Maybe we'll do that once we move towards understanding Spring Framework."**

**Why the suspense?**

Because this involves understanding **bean scopes** - a deeper topic about how Spring manages object lifecycles. 

**Spoiler hint (though the instructor doesn't say it):** By default, Spring creates **singleton** beans, meaning `obj1` and `obj2` would be the **same instance**. But we'll explore this properly later!

### 💡 What matters now

**For now, what's important:**
- ✅ You can get beans from the container
- ✅ Multiple calls to `getBean()` work
- ✅ You're not creating objects with `new`
- ✅ Spring is managing everything

**The deeper details will come when we study Spring Framework internals.**

---

## Concept 11: What About Components Without @Component?

### 🧠 Testing the necessity of @Component

The instructor suggests an experiment:

**"Try creating another class, let's say Laptop, and don't make it a component. Then try to say getBean. It will not work."**

### 🧪 The experiment

Let's try it:

**Create a Laptop class WITHOUT @Component:**
```java
package com.telusko.app;

// Notice: NO @Component annotation
public class Laptop {
    
    public void compile() {
        System.out.println("Compiling...");
    }
}
```

**Try to get it from the container:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        SpringApplication.run(SpringBootDemoApplication.class, args);
    
    Laptop laptop = context.getBean(Laptop.class);  // Will this work?
    laptop.compile();
}
```

**Run it.**

### 💥 Result

**ERROR!**
```
NoSuchBeanDefinitionException: 
No qualifying bean of type 'com.telusko.app.Laptop' available
```

**Why?**

Because `Laptop` does NOT have `@Component` annotation. Spring didn't know to manage it, so it never created a bean.

### ❓ How to fix it?

**Add @Component:**
```java
import org.springframework.stereotype.Component;

@Component
public class Laptop {
    
    public void compile() {
        System.out.println("Compiling...");
    }
}
```

Now it works!

### 💡 The rule

**Only classes marked with @Component (or related annotations like @Service, @Repository, @Controller) become Spring beans.**

**No annotation = No bean = Error when you try to get it**

---

## Concept 12: Review - How Spring Manages Objects

### 🧠 The complete picture

Let's consolidate our understanding of what happens:

**Step 1: Startup**
```java
SpringApplication.run(SpringBootDemoApplication.class, args);
```
- Spring Boot starts
- IoC Container is created
- Component scanning begins

**Step 2: Component Scanning**
```
Spring looks through packages
    ↓
Finds classes with @Component
    ↓
Creates instances of those classes
    ↓
Stores them as beans in the container
```

**Step 3: Bean Creation**
```java
@Component
public class Alien { ... }
```
Spring internally does:
```java
Alien alienBean = new Alien();
// Stores in container
```

**Step 4: Your Code**
```java
ApplicationContext context = SpringApplication.run(...);
Alien alien = context.getBean(Alien.class);
```

You get the bean that Spring created!

### 💡 The three main pieces

1. **@Component**: "Spring, manage this class"
2. **IoC Container**: Where Spring stores beans
3. **context.getBean()**: How you retrieve beans

---

## Concept 13: What's Next - Dependencies Between Objects

### 🧠 The current limitation

Right now, we have:
- Spring creating objects
- Us getting those objects from the container
- Objects working independently

**But what if objects depend on each other?**

### ❓ The upcoming scenario

The instructor teases: **"What if Alien is dependent on some other objects?"**

**Real-world example:**
```java
@Component
public class Alien {
    // Alien needs a Computer to code
    // How does Spring provide the Computer?
}

@Component
public class Computer {
    // Computer needs a CPU
    // How does Spring wire everything together?
}
```

**This is true Dependency Injection** - not just getting objects from the container, but having Spring **inject dependencies into objects**.

### ⚙️ What we'll learn

In the next lesson:
- How to make Alien dependent on Computer
- How to tell Spring about this dependency
- How Spring automatically wires dependencies
- The `@Autowired` annotation

### 💡 Building up complexity

**Notice the progression:**
1. ✅ Create a Spring Boot project (Done)
2. ✅ Create a bean and get it from container (Done)
3. 🔜 Create beans with dependencies (Next!)
4. 🔜 Understand Spring Framework internals (Coming soon)

**Step by step, we're building understanding!**

---

## ✅ Key Takeaways

Let's cement what we learned:

### About Spring Beans

1. **Bean = Object managed by Spring**
   - Regular object + Spring management = Bean

2. **Spring doesn't create beans automatically**
   - You must explicitly mark classes

3. **@Component tells Spring to manage a class**
   - Without it, no bean is created

### About the IoC Container

1. **ApplicationContext is your access to the container**
   - Returned by `SpringApplication.run()`
   - Your communication channel with Spring

2. **getBean() retrieves beans from container**
   - You specify which type you want
   - Spring gives you the instance it created

3. **Container is created at startup**
   - Beans are created during initialization
   - Ready for use in your application

### About Dependency Injection

1. **We achieved IoC**
   - Control of object creation moved to Spring
   - No more `new` keyword for managed objects

2. **We achieved basic DI**
   - Spring creates objects
   - Spring injects them when we call getBean()

3. **More advanced DI coming**
   - Dependencies between objects
   - Automatic wiring
   - Constructor/setter injection

---

## 💡 Final Insights

### The Power You've Unlocked

You might think: "We just avoided typing `new`. What's the big deal?"

**But consider:**
- Spring now controls when objects are created
- Spring decides if objects are singletons or new instances
- Spring can inject additional dependencies automatically
- Spring can apply aspects/proxies transparently
- Spring manages the entire lifecycle

**You've given Spring control, and Spring can do powerful things with that control!**

### The Teaching Approach

Notice how the instructor builds understanding:
1. **Show the working code** (Spring Boot)
2. **Explain just enough** (not everything)
3. **Leave some mystery** (bean scopes, singletons)
4. **Promise deeper understanding** (Spring Framework internals later)

**This is realistic learning.** You don't need to understand everything immediately. First get it working, then gradually understand deeper.

### What Makes This "Boot" not "Framework"

What we did today was easy because of Spring Boot:
- Auto-configuration set up the container
- Component scanning enabled automatically
- No XML files needed
- Just add @Component and go!

**With traditional Spring Framework:**
- Manual XML configuration required
- Explicit bean definitions
- More complex setup

**We'll see the difference soon, and you'll appreciate Spring Boot even more!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Forgetting @Component
```java
public class Alien { ... }  // No annotation!
context.getBean(Alien.class);  // ERROR!
```
**Fix:** Add `@Component` annotation

### Mistake 2: Wrong package structure
If your class is outside the component scan path, Spring won't find it even with `@Component`.

**Solution:** Keep classes in the same package (or sub-packages) as your main application class.

### Mistake 3: Using new after marking as @Component
```java
@Component
public class Alien { ... }

// In main:
Alien alien = new Alien();  // Bypasses Spring!
```
**Why it's wrong:** You're creating your own instance, not using Spring's managed bean. Any Spring features (like dependency injection into Alien) won't work.

---

## 🎯 What's Next?

We've taken our first real steps with Spring Dependency Injection!

**In the next lesson:**
- Create dependencies between objects (Alien needs Computer)
- Use `@Autowired` annotation
- Let Spring automatically inject dependencies
- See true DI in action with object relationships

**Then later:**
- Understand bean scopes (singleton vs prototype)
- Learn Spring Framework approach (XML configuration)
- Compare Spring Boot vs Spring Framework
- Master advanced DI techniques

---

## 🧠 Practice Exercise

Before the next lesson, solidify your understanding:

**Task:** Create a `Developer` class:
1. Add `@Component` annotation
2. Create a `writeCode()` method
3. Get the bean from the container in your main method
4. Call the method

**Bonus:** Create a `Manager` class WITH `@Component` and a `TeamLead` class WITHOUT `@Component`. Try to get both from the container and observe the results.

**Goal:** Make this process second nature, so when we add dependencies between objects, you can focus on the new concepts.

Get ready for the next level - dependencies between beans! 🚀
