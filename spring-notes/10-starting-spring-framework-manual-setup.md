# 🔧 Starting with Spring Framework - The Manual Approach

## Introduction

We've been living in the comfortable world of Spring Boot. `@Component` here, `@Autowired` there, and everything just works! It feels almost magical. But here's the thing: **magic is fine until something breaks, and then you need to understand how the trick works.**

Now it's time to peek behind the curtain. We're going to build a Spring application **without Spring Boot**. No auto-configuration. No convenience annotations (well, not yet). Just **pure Spring Framework**.

**Why go through this?**

Because understanding how Spring Framework works manually will:
- Show you what Spring Boot automates
- Help you debug when things go wrong
- Make you appreciate Spring Boot even more
- Give you the knowledge to work with legacy Spring projects
- Deepen your understanding of IoC and Dependency Injection

Think of it like learning to drive a manual transmission car. Once you understand how the gears work, driving an automatic becomes second nature - and you can handle any car that comes your way.

Let's roll up our sleeves and build Spring Framework from the ground up! 🚀

---

## Concept 1: The Transition - From Boot to Framework

### 🧠 What we've learned with Spring Boot

So far, we've been using Spring Boot and it's been wonderful:

```java
@Component
public class Alien {
    @Autowired
    private Laptop laptop;
    
    public void code() {
        laptop.compile();
    }
}
```

**Spring Boot handles everything:**
- Creates the IoC Container automatically
- Scans for components
- Creates beans
- Injects dependencies
- Wires everything together

**We just add annotations and it works!**

### ❓ But what's happening behind the scenes?

**That's the million-dollar question.**

- How does Spring Boot know to scan for components?
- What creates the container?
- How does wiring actually work?
- What if I need to customize beyond annotations?

### 🧠 Why learn Spring Framework now?

**The instructor's philosophy:**

> "If you want to understand what is happening behind the scene and how things are moving behind the scenes, we have to understand how Spring works."

**And to understand Spring:**

> "We have to write the code in Spring Framework without Spring Boot."

### 💡 What this means

**Spring Boot is:**
- A layer of convenience
- Opinionated defaults
- Auto-configuration
- Built on Spring Framework

**Spring Framework is:**
- The actual engine
- Manual configuration
- Explicit control
- The foundation

**To truly understand Spring, we must go manual.**

---

## Concept 2: Creating a Maven Project (Not Spring Boot!)

### 🧠 The key difference

**Spring Boot Project:** Go to start.spring.io, get a pre-configured project

**Spring Framework Project:** Create a basic Maven project, add Spring manually

### ⚙️ Step-by-step: Creating the project in IntelliJ

**Step 1: New Project**

In IntelliJ:
- Click **File → New → Project**
- Choose **Maven** (NOT Spring Initializr!)
- This is crucial - we're building from scratch

**Step 2: Project Configuration**

**Name:** `SpringOne` (or whatever you prefer)  
**Location:** Choose where to save it  
**JDK:** Select Java 17+ (required for Spring 6)

**Important note:** If you want to use **Spring 6**, you need **at least JDK 17**. Java 18, 19, 20, 21 all work. Even future versions should be fine due to backward compatibility.

**Create Git repository:** Uncheck for now (add later if needed)

**Step 3: Maven Archetype**

This is important! Click to expand **Advanced Settings** or look for **Catalog** option.

Choose **Internal** catalog, then select:
- **maven-archetype-quickstart**
- **Version 1.1**

### ❓ What is maven-archetype-quickstart?

**An archetype is a project template.**

Maven provides several built-in archetypes:
- `maven-archetype-quickstart` - Basic Java project
- `maven-archetype-webapp` - Web application
- And many more

**Quickstart gives you:**
- Basic folder structure
- Sample App.java file
- Basic pom.xml
- A starting point to build anything

**Why quickstart?** Because we're building everything from scratch!

**Step 4: Maven Coordinates**

**GroupId:** `com.telusko`  
**ArtifactId:** `SpringOne`  
**Version:** `1.0`

**Note:** If you don't change these, Maven uses defaults like `org.example`. That's fine for learning!

**Step 5: Create**

Click **Create**. Maven will generate your project structure.

### 🧪 What happens next

IntelliJ will:
1. Create the project structure
2. Generate pom.xml
3. Download Maven dependencies (if first time, this takes longer)
4. Build the project
5. Show "BUILD SUCCESS"

**Be patient on first build!**

Depending on:
- Internet speed
- How many times you've built Maven projects before
- Machine speed

**It might take time.** Don't worry!

The instructor notes: "It was quick because maybe I have created the same project before."

### 💡 IDE Independence Reminder

**The instructor emphasizes:** "You can also use Eclipse. That's your choice. Any IDE, everything will remain same."

**Why?**

**Because we're using Maven!**

Maven creates a standard structure:
```
SpringOne/
├── src/
│   ├── main/
│   │   └── java/
│   └── test/
│       └── java/
└── pom.xml
```

**This structure is IDE-agnostic.** Whether you use IntelliJ, Eclipse, VS Code, or even command line - it's the same.

**That's the power of build tools!**

---

## Concept 3: Understanding the Generated Project

### 🧠 What Maven created for you

After project creation, the first file that opens is **pom.xml**.

### 🧪 The pom.xml file

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.telusko</groupId>
    <artifactId>SpringOne</artifactId>
    <version>1.0</version>
    
    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.11</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

**By default, only one dependency:** JUnit (for testing)

**Check External Libraries:**

If you expand "External Libraries" in IntelliJ, you'll see JUnit JARs.

### ❓ Where's Spring?

**It's not there!** And that's intentional.

**We need to add Spring dependencies manually.** That's coming soon!

### 🧠 The App.java file

Navigate to: `src/main/java/com/telusko/app/App.java`

```java
package com.telusko.app;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
```

**Simple. Classic. Just prints "Hello World!"**

### 💡 Testing before changing

**The instructor's advice:** "Even before you make any changes, it's a good practice to run this to check if the basic structure is working."

**Why?**

- Catch setup issues early
- Know your baseline works
- If it breaks later, you know YOU broke it (not Maven!)

**Let's test:**

Run `App.java`.

**Output:**
```
Hello World!
```

✅ **It works! Now we can modify it.**

---

## Concept 4: Creating the Alien Class

### 🧠 What we want to build

Remember our Spring Boot example? Let's recreate it in pure Spring Framework.

**Goal:**
- Create an `Alien` class
- Have Spring create the object (not us!)
- Get the object from Spring's container

### ⚙️ Step 1: Trying to use Alien class

In `App.java`, let's try to use Alien:

```java
public class App {
    public static void main(String[] args) {
        Alien obj = new Alien();  // Two problems here!
    }
}
```

**Two problems, as the instructor notes:**

1. **We don't have the Alien class yet** (compilation error)
2. **We don't want to create the object ourselves** (defeats the purpose of IoC!)

### ⚙️ Step 2: Create the Alien class

**IntelliJ shortcut:** Put your cursor on `Alien`, press **Alt+Enter**, choose "Create class 'Alien'".

Or manually: Right-click on package → New → Java Class → Name it `Alien`

```java
package com.telusko.app;

public class Alien {
    // Empty for now
}
```

**First problem solved!** ✅

### ⚙️ Step 3: Add a method

```java
package com.telusko.app;

public class Alien {
    public void code() {
        System.out.println("Coding...");
    }
}
```

**Simple method that prints something.**

### 💡 Instructor's note on business logic

**"When you're learning Spring, logic is not important."**

**What matters:**
- Understanding the syntax ✅
- Understanding the flow ✅
- Understanding how Spring works ✅

**What doesn't matter (yet):**
- Complex business logic ❌
- Real-world scenarios ❌
- Solving actual problems ❌

**First understand the framework, then apply it to real problems.**

---

## Concept 5: Testing the Traditional Approach

### 🧠 The old way (without Spring)

Let's verify everything works traditionally before adding Spring:

```java
public class App {
    public static void main(String[] args) {
        Alien obj = new Alien();
        obj.code();
    }
}
```

Run it.

**Output:**
```
Coding...
```

✅ **Works perfectly!**

### ❓ So what's the problem?

**We created the object with `new`.**

That means:
- **We** control object creation
- **We** manage the object's lifecycle
- No IoC
- No dependency injection
- Not using Spring at all!

### 💡 The goal

**What we want:**
```java
// Not this:
Alien obj = new Alien();  ❌

// But this:
Alien obj = <Get from Spring Container>;  ✅
```

**How do we do that?**

---

## Concept 6: Understanding IoC Container in Spring Framework

### 🧠 Remembering the theory

From our IoC lessons, we know:
- Spring creates objects
- Stores them in the **IoC Container**
- We retrieve objects from the container

**The container is the heart of Spring.**

### ❓ But where IS the container?

**In Spring Boot:**
```java
ApplicationContext context = 
    SpringApplication.run(SpringBootDemoApplication.class, args);
```

Spring Boot creates the container for us automatically!

**In Spring Framework:**

**We have to create it manually.**

**Nothing is automatic. We configure everything.**

### 🧠 How to create a container?

**We use `ApplicationContext`.**

`ApplicationContext` is your interface to the IoC Container. It's responsible for:
- Creating the container
- Managing beans
- Providing access to beans
- Handling the Spring lifecycle

### 💡 ApplicationContext vs BeanFactory

**The instructor mentions two options:**

**1. BeanFactory** (old)
- The original Spring container interface
- Basic functionality
- Most implementations are deprecated or removed in Spring 6
- Don't use this

**2. ApplicationContext** (new/current)
- Extends BeanFactory
- Provides all BeanFactory features PLUS additional features
- Modern standard
- What we should use

**Think of it like:**
- BeanFactory = Basic phone
- ApplicationContext = Smartphone (does everything the basic phone does, plus more)

**We're using ApplicationContext.**

---

## Concept 7: Adding Spring Dependencies

### 🧠 The problem

Let's try to use `ApplicationContext`:

```java
public static void main(String[] args) {
    ApplicationContext context  // Red underline - can't resolve!
}
```

Press **Ctrl+Space** for auto-complete suggestions.

**Nothing!** No `ApplicationContext` found.

### ❓ Why not?

**Because `ApplicationContext` is not part of Java.**

It's part of the Spring Framework, and we haven't added Spring to our project yet!

**Check External Libraries:** Only JUnit, no Spring.

### ⚙️ Adding Spring Context dependency

**We need to add Spring to pom.xml.**

**But what exactly do we add?**

**Step 1: Go to Maven Repository**

Open your browser and go to: **https://mvnrepository.com/**

**Maven Repository is:** The central place to find Maven dependencies. Almost every Java library is published here.

**Step 2: Search for "Spring Context"**

In the search box, type: **spring context**

You'll see several results. Click on: **Spring Context** (by Spring)

### 🧠 Understanding versions

You'll see many versions:
- 6.1.1
- 6.1.0  
- 6.0.9
- 5.x versions
- Older versions

**Which to choose?**

**The instructor's philosophy:** "I always believe you should go for the **second last version**."

**Why not the latest?**

The absolute latest might have:
- Newly introduced bugs
- Less community testing
- Fewer Stack Overflow answers
- Potential compatibility issues

**Why not older versions?**

Missing bug fixes and features.

**The second last version:**
- Has been tested more
- Known issues are documented
- Still recent and modern
- Usually most stable

**For Spring 6:** Choose **6.1.0** (if 6.1.1 is latest) or **6.1.1** (if 6.1.2 is latest)

**Also check usage statistics:** Higher usage = more people using it = more tested!

### ⚙️ Step 3: Copy the dependency

Click on your chosen version (e.g., 6.1.0).

You'll see the Maven dependency XML:

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>6.1.0</version>
</dependency>
```

**Click the "Copy" icon** or manually select and copy.

**Note:** If you click the XML block itself, it copies with comments. The instructor prefers copying manually to avoid comments.

### ⚙️ Step 4: Add to pom.xml

Open your project's `pom.xml` and paste inside `<dependencies>`:

```xml
<dependencies>
    <!-- Existing JUnit dependency -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.11</version>
        <scope>test</scope>
    </dependency>
    
    <!-- New Spring Context dependency -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>6.1.0</version>
    </dependency>
</dependencies>
```

**Save the file.**

### ⚙️ Step 5: Reload Maven

**In IntelliJ:**

You'll see a notification: **"Maven projects need to be imported"**

Click **"Load Maven Changes"** (the icon that appears).

**Or:**

Click the **Maven** icon in the right sidebar → Click **Reload** (circular arrow icon)

**In Eclipse:**

It usually reloads automatically. If not, right-click project → Maven → Update Project

### 🧪 Verify the dependencies

**Check External Libraries again.**

Now you should see:
- spring-context-6.1.0.jar
- spring-beans-6.1.0.jar
- spring-core-6.1.0.jar
- spring-aop-6.1.0.jar
- And more Spring-related JARs

**Why multiple JARs?**

Because `spring-context` has **transitive dependencies**. It depends on other Spring modules, and Maven downloads them all automatically!

### 💡 Building Spring Core project

**The instructor notes:** "Since we are building a Spring Core project, only for dependency, we only add this dependency."

**Later, when we work with:**
- Spring MVC → Add `spring-webmvc` dependency
- Spring Data JPA → Add `spring-data-jpa` dependency

**For now, `spring-context` is all we need!**

---

## Concept 8: Creating the ApplicationContext

### 🧠 Now we can use Spring!

Back in `App.java`, try typing `ApplicationContext` again:

```java
import org.springframework.context.ApplicationContext;

public class App {
    public static void main(String[] args) {
        ApplicationContext context
    }
}
```

**It works!** Auto-import suggests it now. ✅

### ❓ What is ApplicationContext?

Press **Ctrl+Click** on `ApplicationContext` to see its definition.

**It's an interface!**

```java
public interface ApplicationContext extends /* many interfaces */ {
    // Methods to access beans
}
```

**Key observation:** It extends `ListableBeanFactory`, which extends `BeanFactory`.

**So ApplicationContext truly is a superset of BeanFactory!**

### 🧠 Which implementation to use?

**The problem:** `ApplicationContext` is an interface. We can't instantiate it directly.

We need a **class that implements it**.

**Press Ctrl+H on ApplicationContext** (or View → Type Hierarchy)

You'll see many implementations:
- `AnnotationConfigApplicationContext`
- `ClassPathXmlApplicationContext`
- `FileSystemXmlApplicationContext`
- `GenericWebApplicationContext`
- And more...

### ❓ Which one should we use?

**We're using `ClassPathXmlApplicationContext`.**

**Why?**

Because there are **different ways to configure Spring:**

1. **XML Configuration** (traditional) ← We're learning this first
2. **Java-based Configuration** (modern)
3. **Annotation-based Configuration** (modernest)

**Our learning path:**
```
XML Configuration
    ↓
Java-based Configuration
    ↓
Annotation-based Configuration
```

**Understanding XML first helps you appreciate modern approaches!**

### ⚙️ Creating the context

```java
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new ClassPathXmlApplicationContext();
    }
}
```

**But wait - the constructor needs a parameter!**

**What parameter?**

The path to an XML configuration file!

**We'll get to that soon. For now, just know:**

**This line creates the IoC Container.**

---

## Concept 9: Getting a Bean from the Container

### 🧠 Now we have the container

```java
ApplicationContext context = 
    new ClassPathXmlApplicationContext(/* config file path */);
```

**The container is created. Now let's get a bean from it!**

### ⚙️ Using getBean()

```java
ApplicationContext context = 
    new ClassPathXmlApplicationContext(/* ... */);

// Get the bean
context.getBean("alien");
```

**What is "alien"?**

It's the **bean name/ID**. We'll configure this in the XML file (coming soon).

**For now, just know:** We're asking the container for a bean with the ID "alien".

### ❓ What does getBean() return?

Check the return type:

```java
Object obj = context.getBean("alien");
```

**It returns `Object`!**

**Why?** Because Spring's container can hold beans of any type. It returns the most generic type.

### ⚙️ Type casting

Since we want an `Alien` object, not just `Object`:

```java
Alien obj = (Alien) context.getBean("alien");
```

**Now we have proper typing!**

### 🧪 Using the object

```java
Alien obj = (Alien) context.getBean("alien");
obj.code();
```

**In theory, this should:**
1. Get the Alien bean from Spring's container
2. Call the `code()` method on it
3. Print "Coding..."

**Let's test it!**

---

## Concept 10: The First Error - Understanding What's Missing

### 🧠 The complete code so far

```java
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new ClassPathXmlApplicationContext();
        
        Alien obj = (Alien) context.getBean("alien");
        obj.code();
    }
}
```

**Notice:** We still haven't provided a configuration file path to `ClassPathXmlApplicationContext`.

**We need that. But let's see what happens without it.**

### 🧪 Run the application

Right-click → Run

### 💥 ERROR!

```
Exception in thread "main" java.lang.IllegalStateException: 
BeanFactory not initialized or already closed - 
call 'refresh' before accessing beans via the ApplicationContext
```

### ❓ What does this error mean?

**"BeanFactory not initialized"**

The container wasn't properly set up!

**Why not?**

Because we didn't provide a configuration!

**Think of it like:**
- You asked for a library container to hold books
- But you didn't tell them WHICH books to store
- Or even HOW to organize them
- The container is empty because there's no configuration!

### 🧠 What's missing?

**We need an XML configuration file that tells Spring:**
- Which classes to create beans for
- How to wire dependencies
- What IDs/names to use
- Any special configuration

### 💡 The cliffhanger

**The instructor ends with suspense:**

> "It's not working. Why? Let's understand that in the next video."

**What we need:**
- Create an XML configuration file
- Define our beans in XML
- Tell Spring about our Alien class
- Provide the XML file path to ClassPathXmlApplicationContext

**That's coming in the next lesson!**

---

## ✅ Key Takeaways

Let's consolidate what we learned:

### About Spring Framework vs Spring Boot

1. **Spring Boot automates configuration**
   - Component scanning
   - Container creation
   - Bean management

2. **Spring Framework requires manual configuration**
   - We create the container
   - We configure beans explicitly
   - We manage more details

3. **Learning Spring Framework first gives deep understanding**
   - Helps debug issues
   - Explains what Boot does automatically
   - Makes you appreciate Boot more

### About Maven Projects

1. **Maven provides IDE independence**
   - Same structure in IntelliJ, Eclipse, VS Code
   - Build tool handles consistency

2. **Maven archetypes are project templates**
   - `maven-archetype-quickstart` for basic projects
   - Starting point for custom development

3. **Dependencies added via pom.xml**
   - Maven Repository is the source
   - Transitive dependencies downloaded automatically

### About ApplicationContext

1. **ApplicationContext manages the IoC Container**
   - Interface to Spring's container
   - Controls bean lifecycle

2. **ApplicationContext is better than BeanFactory**
   - More features
   - Modern standard
   - BeanFactory is deprecated/removed in Spring 6

3. **Different implementations for different configs**
   - ClassPathXmlApplicationContext for XML
   - AnnotationConfigApplicationContext for Java config
   - We're starting with XML

### About Configuration

1. **Spring needs configuration**
   - Tells Spring what beans to create
   - How to wire them
   - What names/IDs to use

2. **Multiple configuration approaches**
   - XML (traditional) - Learning first
   - Java-based (modern)
   - Annotation-based (modernest)

3. **Without configuration, the container is empty**
   - No beans created
   - Errors when you try to get beans

---

## 💡 Final Insights

### The Manual Journey

**What we're doing is like:**
- Learning to build a car engine manually
- Instead of just driving a pre-built car
- More work, but deeper understanding

**Spring Boot = Pre-built car (drive immediately)**  
**Spring Framework = Build the engine (understand how it works)**

### Why XML First?

You might wonder: "Why learn XML configuration? Isn't it outdated?"

**The instructor's reasoning:**
1. **Historical understanding** - See how Spring evolved
2. **Legacy code** - Many projects still use XML
3. **Appreciation** - Makes you appreciate annotations more
4. **Complete knowledge** - Understand all approaches

**XML → Java Config → Annotations** teaches the full spectrum.

### The Error Was Expected

That error at the end wasn't a mistake - it's pedagogical!

**It teaches you:**
- Configuration is REQUIRED
- Spring needs instructions
- The container doesn't magically know what to do

**Next lesson will solve it by creating the XML config.**

### Comparison to Spring Boot

**In Spring Boot, we never saw:**
- Creating ApplicationContext manually
- Adding spring-context dependency explicitly
- Calling getBean() directly (usually)

**Why?**

Because `SpringApplication.run()` does it all for us!

**Now you're seeing the manual steps Spring Boot hides.**

---

## ⚠️ Common Issues and Solutions

### Issue 1: "ApplicationContext not found"

**Symptom:** Can't import ApplicationContext

**Cause:** Spring dependency not added or Maven not reloaded

**Solution:**
1. Check pom.xml has spring-context dependency
2. Click "Load Maven Changes" in IntelliJ
3. Or reload Maven (right sidebar → Maven → Reload)

### Issue 2: "JDK version error"

**Symptom:** Compilation errors about language level

**Cause:** Using JDK < 17 with Spring 6

**Solution:**
- Install JDK 17 or higher
- Set project SDK to Java 17+
- File → Project Structure → SDK → Choose Java 17+

### Issue 3: "BUILD FAILED" on Maven project creation

**Symptom:** Project won't build initially

**Cause:** Internet issues, Maven repository not accessible, or corrupted local repository

**Solution:**
1. Check internet connection
2. Wait and try again (repository might be temporarily down)
3. Delete `~/.m2/repository` folder and rebuild (rebuilds local Maven cache)

### Issue 4: Maven dependencies not downloading

**Symptom:** External Libraries empty after adding dependency

**Cause:** Maven not triggered to download

**Solution:**
1. Save pom.xml
2. Click reload Maven changes
3. Right-click pom.xml → Maven → Reimport
4. In worst case: File → Invalidate Caches / Restart

---

## 🎯 Understanding Check

Before moving to the next lesson, make sure you understand:

1. **Why are we learning Spring Framework manually?**
   - To understand what Spring Boot automates

2. **What is ApplicationContext?**
   - Interface to the IoC Container

3. **Why did we get an error?**
   - No configuration provided to Spring

4. **What's the difference between Spring Boot and Spring Framework?**
   - Boot automates setup; Framework requires manual config

5. **What dependency did we add?**
   - spring-context (brings in other Spring dependencies)

---

## 🔗 Quick Summary

**The Journey:**
```
Create Maven Project (not Spring Boot)
    ↓
Add Spring dependencies manually (spring-context)
    ↓
Create ApplicationContext (IoC Container)
    ↓
Try to get bean from container
    ↓
ERROR: No configuration!
```

**What we learned:**
- How to create a pure Maven project
- How to add Spring dependencies
- What ApplicationContext is and does
- That Spring needs configuration to work

**What's next:**
- Create XML configuration file
- Define beans in XML
- Provide configuration to ApplicationContext
- Successfully get beans from container!

**The adventure continues!** 🚀

Get ready to write your first Spring XML configuration file in the next lesson!
