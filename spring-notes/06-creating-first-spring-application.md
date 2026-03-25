# 🚀 Creating Your First Spring Application

## Introduction

Theory time is over - it's time to get our hands dirty with actual code!

We understand what Spring is, why it's popular, and what IoC and Dependency Injection mean conceptually. But concepts without practice are just abstract ideas floating in your head. **Let's make them concrete.**

In this section, we're going to create our very first Spring application. But here's an interesting choice we need to make first: **Do we start with Spring Framework or Spring Boot?**

There are two approaches:
1. **Start with Spring Framework** → See all the complexity → Then move to Spring Boot and appreciate how much easier it is
2. **Start with Spring Boot** → See how easy it is → Then peek behind the scenes to understand what's happening

We're going with **approach #2**. Why? Because starting with something that works and feels good keeps you motivated. You'll see results quickly, then we'll dive deeper to understand the magic.

Let's create your first Spring Boot application! 🎯

---

## Concept 1: Spring Framework vs Spring Boot - The Starting Point

### 🧠 The Two Paths

You have a choice when learning Spring:

**Path 1: Traditional Learning**
```
Start with Spring Framework (complex)
    ↓
Learn all the configuration
    ↓
Understand the complexity
    ↓
Move to Spring Boot (easy)
    ↓
Appreciate the simplicity
```

**Path 2: Practical Learning**
```
Start with Spring Boot (easy)
    ↓
Get something working quickly
    ↓
See the results
    ↓
Learn what happens behind the scenes
    ↓
Understand Spring Framework
```

### ❓ Which path are we taking?

We're taking **Path 2** - starting with Spring Boot.

**Why?**

1. **Motivation**: Seeing something work quickly keeps you engaged
2. **Modern reality**: Most companies use Spring Boot, not raw Spring Framework
3. **Progressive learning**: Easy first, complexity later
4. **Appreciation**: You'll understand what Spring Boot does for you when you see the alternative

### 💡 The Philosophy

Think of it like learning to drive:
- **Path 1**: Start with a manual transmission, understand every gear, then try automatic
- **Path 2**: Start with automatic, enjoy driving, then learn what the automatic transmission does for you

Both work, but Path 2 gets you driving faster!

---

## Concept 2: IDE Choice - Eclipse First

### 🧠 Which IDE are we using?

Remember from the setup section - we have multiple IDE options:
- Eclipse (with Spring Tools)
- IntelliJ IDEA
- VS Code

### ❓ So which one?

**We'll start with Eclipse, then move to IntelliJ.**

**Why Eclipse first?**

Because Eclipse with the Spring Tools extension gives us:
- Built-in Spring Boot project creation
- No need to pay for IntelliJ Ultimate
- A direct, straightforward path to creating projects

**Then we'll use IntelliJ** to show you how it works when you don't have the built-in tools.

### 💡 Real-world insight

This mirrors actual development work:
- Different projects use different IDEs
- You might start at a company using Eclipse, then move to one using IntelliJ
- Being comfortable with multiple tools makes you adaptable

Let's start with Eclipse!

---

## Concept 3: Creating a Spring Boot Project in Eclipse

### 🧠 What we're doing

We're going to create a Spring Boot project using Eclipse's Spring Tools extension.

### ⚙️ Step-by-step process

**Step 1: Open Eclipse**

Launch Eclipse. You should see the welcome screen or your workspace.

**Step 2: Create a new project**

You'll see an option to **"Create a project"** - click it.

**Step 3: Choose Spring Boot**

When Eclipse asks "What kind of project?", you'll see multiple options:
- Maven Project
- Gradle Project
- Java Project
- **Spring Starter Project** ← This is what we want!

**Why "Spring Starter Project"?**

Because we installed Spring Tools extension, we get this special option. It's Eclipse's way of creating Spring Boot projects easily.

Click on **Spring Starter Project** and hit **Next**.

### 🧪 The configuration screen

Now Eclipse shows you a configuration screen. Let's understand each field:

#### Project Settings

**Name**: `SpringBootFirst`
- Whatever you want to call your project
- No spaces, use CamelCase or dashes

**Type**: `Maven`
- Choose between Maven or Gradle
- We're using Maven (more common, easier to start with)

**Packaging**: `Jar`
- Leave this as default (JAR)
- This is how your application will be packaged

**Java Version**: `17`
- Must match your installed JDK
- Spring Boot 3.x requires Java 17+

**Language**: `Java`
- You could also choose Kotlin or Groovy
- We're sticking with Java

#### Maven Coordinates

**Group ID**: `com.telusko`
- Your organization/company identifier
- Reverse domain name convention (com.yourcompany)

**Artifact ID**: `SpringBootFirst`
- Your project identifier
- Usually same as project name

**Version**: `0.0.1-SNAPSHOT`
- Leave as default
- SNAPSHOT means it's in development

**Package**: `com.telusko.app`
- Base package for your Java classes
- Usually GroupID + app/project name

### 🧠 Important observation - The URL

Notice the URL shown: **start.spring.io**

Remember this! We'll come back to this in a moment. This URL is key to understanding what's happening.

**Step 4: Click Next**

You'll see another screen asking about dependencies.

---

## Concept 4: Understanding Dependencies and Modules

### 🧠 What are Spring dependencies?

When the configuration asks "Do you want to add dependencies?", what does that mean?

**Spring is modular.** It doesn't give you everything at once. Instead, you choose what features you need:

- Want to build a web application? Add **Spring Web** dependency
- Need database access? Add **Spring Data JPA** dependency
- Want security? Add **Spring Security** dependency
- Need WebSocket support? Add **WebSocket** dependency

### ❓ Why this modular approach?

Imagine if every Spring project came with every possible feature:
- ❌ Huge project size
- ❌ Slow startup times
- ❌ Unnecessary complexity
- ❌ You're loading features you don't use

**The modular approach:**
- ✅ Only add what you need
- ✅ Keeps project lean
- ✅ Faster compilation and startup
- ✅ Clearer purpose

### 💡 A fun analogy

The instructor makes a great point:

**"I hope one day you get this option in smartphones where you can choose what type of camera you want, what type of display you want."**

Imagine buying a phone and customizing:
- Choose your camera quality
- Pick your display type
- Select battery size
- Add only the features you want

That's exactly what Spring does! You build your application with only the modules you need.

### ⚙️ For our first project

**We're not adding any dependencies yet.**

Why? Because we just want to:
- Create a simple project
- See it run
- Understand the basic structure

We'll add dependencies later when we need specific features.

**Step 5: Click Finish**

Eclipse creates your project!

---

## Concept 5: What Just Happened? The Spring Initializr

### 🧠 Understanding the magic

When Eclipse created your project, what actually happened?

**Eclipse went to the internet** and downloaded a project template from **start.spring.io**.

### ❓ What is start.spring.io?

**Spring Initializr** (at start.spring.io) is a web service that:
- Generates Spring Boot project structures
- Adds the dependencies you specify
- Creates all the necessary configuration files
- Packages it all up for you to download

### ⚙️ How it works

```
Your choices in Eclipse
        ↓
Eclipse sends request to start.spring.io
        ↓
Spring Initializr generates project structure
        ↓
Eclipse downloads the generated project
        ↓
Eclipse opens it in your workspace
```

### 💡 Key insight

**Eclipse's Spring Starter Project is just a nice UI for Spring Initializr.**

Under the hood, it's talking to start.spring.io. This is important because...

---

## Concept 6: The IntelliJ Challenge

### 🧠 The problem with IntelliJ Community Edition

Let's say we want to use IntelliJ now. You open IntelliJ and click **New Project**.

**What do you see?**

You see options for:
- Java Project
- Maven Project
- Gradle Project

But **no Spring Boot option!** 😕

### ❓ Why not?

**IntelliJ Community Edition doesn't have Spring support.**

**Different versions, different features:**

| Feature | Community (Free) | Ultimate (Paid) |
|---------|------------------|-----------------|
| Java support | ✅ Yes | ✅ Yes |
| Maven/Gradle | ✅ Yes | ✅ Yes |
| Spring Boot tools | ❌ No | ✅ Yes |
| Spring project creation | ❌ No | ✅ Yes |

In the **Ultimate version**, you'd see Spring Boot as a project type. But not in Community.

### 💡 So what do we do?

**We go directly to the source: start.spring.io!**

Since Eclipse was just using Spring Initializr anyway, we can use it directly through our web browser. The result is exactly the same.

---

## Concept 7: Creating a Project with Spring Initializr

### 🧠 The direct approach

Let's create a Spring Boot project the way that works for **any IDE**, including IntelliJ Community Edition.

### ⚙️ Step-by-step: Using Spring Initializr

**Step 1: Open your browser**

Navigate to: **https://start.spring.io**

You'll see the Spring Initializr website - a clean interface with configuration options.

**Step 2: Configure your project**

Fill in the same information we used in Eclipse:

**Project**: Maven Project
- Click the radio button for Maven

**Language**: Java
- Choose Java (not Kotlin or Groovy)

**Spring Boot Version**: 3.2.x (latest stable)
- Avoid versions with "SNAPSHOT" (they're unstable, in-development versions)
- Choose the latest number version (like 3.2.0, 3.2.1, etc.)

**Project Metadata:**
- **Group**: `com.telusko`
- **Artifact**: `SpringBootDemo`
- **Name**: `SpringBootDemo`
- **Description**: (Default is fine, or customize it)
- **Package name**: `com.telusko.app`
- **Packaging**: Jar
- **Java**: 17

### 🧪 Understanding the form

Let's clarify what each field means:

**Group**: Your organization identifier
- Like `com.google`, `com.amazon`, or in our case `com.telusko`
- Ensures unique package names worldwide

**Artifact**: Your project identifier
- The name of your application
- Will be the name of the generated JAR file

**Package name**: The base Java package
- Where your Java classes will live
- Usually `group.artifact` or `group.app`

**Packaging**: How to bundle your application
- **JAR**: For standalone applications (what we want)
- **WAR**: For deploying to external servers (older approach)

**Java version**: Must match your installed JDK
- We have Java 17 installed
- Spring Boot 3.x requires 17+

### ⚙️ Dependencies section

On the right side, you'll see an **"ADD DEPENDENCIES"** button.

**For now, don't add anything.**

We're creating a minimal project just to understand the structure.

(Later, you'd search for and add things like "Spring Web", "Spring Data JPA", etc.)

**Step 3: Generate the project**

Click the big **GENERATE** button at the bottom.

**What happens:**
- Spring Initializr creates your project structure
- Packages it as a ZIP file
- Downloads it to your computer

You'll see a file like **SpringBootDemo.zip** in your Downloads folder.

**Step 4: Unzip the file**

Navigate to where it downloaded and **unzip** the project.

You'll get a folder called **SpringBootDemo** with your project files inside.

### 💡 Important realization

**This is exactly what Eclipse did for you automatically!**

Eclipse just provided a nice UI for this process. The result is identical:
- Same project structure
- Same configuration files
- Same dependencies

---

## Concept 8: Opening the Project in IntelliJ

### 🧠 From downloaded project to IDE

Now we have a Spring Boot project folder on our computer. Let's open it in IntelliJ.

### ⚙️ Step-by-step: Opening in IntelliJ

**Step 1: Open IntelliJ IDEA**

Launch IntelliJ (Community or Ultimate, doesn't matter now).

**Step 2: Open the project**

On the welcome screen, click **Open** (not "New Project").

**Step 3: Navigate to your unzipped project**

Browse to where you unzipped the SpringBootDemo folder.

**Important**: Select the **folder itself**, not a file inside it.

**Step 4: Click Open**

IntelliJ will:
- Recognize it as a Maven project
- Read the `pom.xml` file
- Download all dependencies (takes a moment)
- Index your project
- Set up the structure

### 🧪 What you should see

After IntelliJ finishes loading, you'll see:

**Project Structure (left sidebar):**
```
SpringBootDemo/
├── .mvn/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/telusko/app/
│   │   │       └── SpringBootDemoApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/
├── pom.xml
└── mvnw
```

**External Libraries (if you expand it):**
- You'll see dozens of JAR files
- These are Spring Boot's dependencies
- Automatically downloaded by Maven

### 💡 Understanding what you're seeing

**Those JAR files** in External Libraries are all the Spring components needed to make your application work. 

You didn't manually download any of them. Maven did it for you based on your `pom.xml` file.

**This is the power of dependency management!**

---

## Concept 9: Exploring the pom.xml File

### 🧠 What is pom.xml?

**POM** = Project Object Model

This file is the heart of your Maven project. It defines:
- What your project is
- What dependencies it needs
- How to build it

### ⚙️ Let's open it

In IntelliJ, double-click **pom.xml** in the project root.

### 🧪 What's inside?

You'll see XML that looks something like this (simplified):

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <groupId>com.telusko</groupId>
    <artifactId>SpringBootDemo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

### 🧠 Breaking it down

**The Parent:**
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>
```

This says your project **inherits** from Spring Boot's parent configuration. You get sensible defaults and dependency management.

**Your Project Info:**
```xml
<groupId>com.telusko</groupId>
<artifactId>SpringBootDemo</artifactId>
<version>0.0.1-SNAPSHOT</version>
```

This identifies your project uniquely.

**The Dependencies:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>
```

**This is the only dependency you need for basic Spring Boot!**

### ❓ Wait, but we saw dozens of JARs?

Great observation!

**`spring-boot-starter` is a special dependency.**

It's not just one JAR - it's a **bundle** that pulls in:
- Spring Core
- Spring Context (the IoC Container!)
- Spring Beans
- Logging libraries
- And more...

**It's like ordering a combo meal:**
- You order "Combo #1"
- You get burger + fries + drink
- You didn't list each item separately

`spring-boot-starter` is Spring's combo meal for basic functionality.

### 💡 Key insight

**This one dependency gives you everything for basic IoC and Dependency Injection.**

That's all we need to start!

---

## Concept 10: Spring Boot 3 and Spring Framework 6

### 🧠 An important relationship

Let's explore the dependencies more carefully.

In IntelliJ, expand **External Libraries**.

Scroll through the list and look for entries that say **"spring-framework-..."**

### 🧪 What you'll find

You'll see JARs like:
- `spring-core-6.x.x.jar`
- `spring-context-6.x.x.jar`
- `spring-beans-6.x.x.jar`

Notice the version number: **6.x.x**

### ❓ What does this mean?

**Spring Boot 3.x uses Spring Framework 6.x underneath.**

This is crucial to understand:
- **Spring Boot** is a wrapper that makes Spring easier
- **Spring Framework** is the actual core technology
- Spring Boot 3 is built on top of Spring Framework 6

### ⚙️ The relationship

```
Your Application Code
        ↓
   Spring Boot 3.x (convenience layer)
        ↓
 Spring Framework 6.x (core engine)
        ↓
      Java 17+
```

### 💡 Why this matters

When you use Spring Boot 3:
- You must use Java 17+ (Spring Framework 6 requirement)
- You get the latest Spring features
- Documentation and examples for Spring Framework 6 apply to you

**Remember this relationship** - it helps when searching for solutions or documentation.

---

## Concept 11: The Main Application File

### 🧠 Where's the code?

In your project, navigate to:
```
src/main/java/com/telusko/app/SpringBootDemoApplication.java
```

This is your **main application class** - the entry point of your Spring Boot application.

### 🧪 What's inside?

Open the file. You'll see something like:

```java
package com.telusko.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringBootDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootDemoApplication.class, args);
    }
}
```

### 🧠 Understanding the code

Let's break this down:

**The `@SpringBootApplication` annotation:**
```java
@SpringBootApplication
public class SpringBootDemoApplication {
```

This single annotation is doing **a lot** behind the scenes:
- Enables auto-configuration
- Enables component scanning
- Marks this as a Spring Boot application

We'll understand what these mean later. For now, know that **this annotation makes it a Spring Boot app.**

**The main method:**
```java
public static void main(String[] args) {
    SpringApplication.run(SpringBootDemoApplication.class, args);
}
```

This is a standard Java entry point. But instead of directly running your code, it:
1. Starts the Spring Boot application
2. Sets up the IoC Container
3. Configures everything automatically
4. Then your application is ready

### ❓ What should we do with this file?

**For now, let's just verify it works.**

Let's add a simple print statement to prove our application runs.

### ⚙️ Add a print statement

Modify the main method:

```java
public static void main(String[] args) {
    SpringApplication.run(SpringBootDemoApplication.class, args);
    System.out.println("Hello World!");
}
```

### 💡 A note about teaching approach

The instructor explicitly says: **"I'm not going to tell you anything about what is happening here."**

Why? Because the goal right now isn't to understand every detail. The goal is:
1. Create a Spring Boot project ✓
2. Open it in an IDE ✓
3. Run it successfully ✓
4. See that it works ✓

**Understanding comes step by step.** First make it work, then understand how.

---

## Concept 12: Running Your First Spring Boot Application

### 🧠 The moment of truth

Let's run the application and see what happens!

### ⚙️ How to run it

**In IntelliJ:**
1. Right-click on `SpringBootDemoApplication.java`
2. Select **Run 'SpringBootDemoApplication'**

Or:
1. Click the green play button next to the main method
2. Select **Run**

**What happens:**
- Maven compiles your code
- Spring Boot starts up
- The IoC Container initializes
- Your main method runs
- The print statement executes

### 🧪 What you'll see

In the console output, you'll see:

**First, the Spring banner:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)
```

**The instructor mentions:** "This beautiful pattern which they create..."

Spring's ASCII art banner! It's Spring's signature.

**Then, startup logs:**
```
2024-xx-xx INFO  Starting SpringBootDemoApplication using Java 17
2024-xx-xx INFO  No active profile set, falling back to default
2024-xx-xx INFO  Started SpringBootDemoApplication in 2.5 seconds
```

**Finally, your output:**
```
Hello World!
```

### 🎉 Success!

**Your Spring Boot application works!**

You've successfully:
- ✅ Created a Spring Boot project
- ✅ Opened it in IntelliJ
- ✅ Run a Spring Boot application
- ✅ Verified it's working with Java 17

---

## Concept 13: What's Missing? - Dependency Injection

### 🧠 A critical observation

The instructor points out: **"But where is dependency injection?"**

**Great question!**

We've created a Spring Boot application, but we haven't actually **used** any Spring features yet. Specifically:
- We haven't created any beans
- We haven't injected any dependencies
- We're just running a print statement

### ❓ Why didn't we do dependency injection yet?

The instructor explains: **"It's this video is already lengthy."**

**This is realistic teaching!**

Breaking complex topics into digestible chunks is how you learn effectively. In this lesson, you:
1. Learned how to create Spring Boot projects two different ways
2. Understood the relationship between the tools (Eclipse, IntelliJ, Spring Initializr)
3. Explored the project structure and dependencies
4. Got a working application running

That's plenty for one lesson!

### 💡 What's coming next

In the next lesson, we'll:
- Create some beans
- Inject dependencies between them
- Actually **use** IoC and Dependency Injection
- See Spring in action!

---

## ✅ Key Takeaways

Let's consolidate what we learned:

### About Project Creation

1. **Two ways to create Spring Boot projects:**
   - Through IDE (Eclipse with Spring Tools)
   - Through Spring Initializr website (works for any IDE)

2. **Spring Initializr (start.spring.io):**
   - Web service that generates Spring Boot projects
   - Used by IDEs behind the scenes
   - Can be used directly in a browser

3. **IDE doesn't matter:**
   - Same project structure regardless of IDE
   - Maven ensures consistency
   - You can switch between IDEs freely

### About Dependencies

1. **Spring is modular:**
   - Only add dependencies you need
   - Keeps projects lean
   - Add features as needed

2. **`spring-boot-starter`:**
   - The base dependency for Spring Boot
   - Bundles multiple dependencies together
   - All you need for basic IoC/DI

3. **Spring Boot 3 uses Spring Framework 6:**
   - Requires Java 17+
   - Latest features and improvements

### About Project Structure

1. **Maven manages everything:**
   - `pom.xml` defines your project
   - Dependencies downloaded automatically
   - Build process standardized

2. **Main application class:**
   - Entry point for Spring Boot
   - `@SpringBootApplication` annotation is key
   - Runs Spring's initialization

3. **Successful startup:**
   - Shows Spring banner
   - Displays startup logs
   - Confirms application is working

---

## 💡 Final Insights

### The Learning Approach

Notice the teaching method:
1. **Get something working first** (motivation!)
2. **Don't explain everything yet** (not overwhelming)
3. **Build understanding gradually** (step by step)

This is how you should learn any technology. Don't try to understand everything at once.

### IDE Flexibility

The instructor shows both Eclipse and IntelliJ because:
- **In real work**, you'll use different tools
- **Understanding the underlying process** (Spring Initializr) makes you IDE-independent
- **The tool doesn't matter** - the concepts do

### What Really Happened

When you ran that application:
- Spring Boot started
- The **IoC Container** was created
- Spring scanned for beans (found none yet, but the container exists!)
- Your main method ran

**The foundation is there.** Now we're ready to build on it!

---

## ⚠️ Common Issues and Solutions

### "Maven dependencies won't download"

**Problem**: IntelliJ shows errors, can't find dependencies

**Solution**:
1. Check internet connection
2. Right-click project → Maven → Reload Project
3. Wait patiently - first download takes time

### "Wrong Java version error"

**Problem**: Error about Java version

**Solution**:
1. Verify `java -version` shows 17+
2. In IntelliJ: File → Project Structure → SDK → Choose Java 17
3. Make sure `pom.xml` specifies Java 17

### "Can't find main class"

**Problem**: Won't run, can't find `SpringBootDemoApplication`

**Solution**:
1. Make sure you opened the correct folder (with `pom.xml`)
2. Let IntelliJ finish indexing
3. Try File → Invalidate Caches / Restart

---

## 🎯 What's Next?

You've laid the groundwork. Your Spring Boot application runs. Now it's time to make it actually **do something with Spring.**

In the next lesson, we'll:
- Create actual Spring beans
- Inject dependencies between objects
- See IoC and Dependency Injection in action
- Make Laptop and CPU work together (the example from our theory lesson!)

Get ready - this is where Spring starts to feel like magic! ✨

---

## 📝 Practice Challenge

Before the next lesson, try this:

1. **Create a second Spring Boot project**
   - Use a different name
   - Try adding one dependency (like "Spring Web")
   - See how `pom.xml` changes

2. **Experiment with the print statement**
   - Print multiple lines
   - Print system properties (`System.getProperty("java.version")`)
   - Get comfortable running the application

3. **Explore the project structure**
   - Look at all the folders
   - Check out the test folder
   - Browse the resources folder

**The goal**: Get completely comfortable with creating and running Spring Boot projects. This becomes second nature, so the focus can shift to learning Spring features.

See you in the next lesson where we bring IoC and Dependency Injection to life! 🚀
