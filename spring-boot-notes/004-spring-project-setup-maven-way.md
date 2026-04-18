# Spring Project Setup — The Maven Way

## Introduction

Before we dive into Spring Boot magic, we need to build a **solid foundation** with the Spring Framework itself. Think of it this way — Spring Boot is like an automatic car, but if you don't understand how an engine works (Spring Framework), you'll never truly master driving.

In this lecture, we're going to:
- Choose the right IDE for Java backend development
- Create a Maven-based project from scratch
- Convert that plain Maven project into a **Spring project** by adding the right dependencies
- Set up our development environment so it's comfortable for long coding sessions

By the end, you'll have a fully functional Spring project ready for exploring core Spring concepts.

---

## Why Learn Spring Basics Before Spring Boot?

Here's a mistake a lot of beginners make — they jump straight into Spring Boot without understanding the Spring Framework underneath. That's like trying to build a house without knowing what a foundation is.

Spring Boot is built **on top of** the Spring Framework. It automates a lot of configuration for you, but when something breaks (and things *will* break in real projects), you need to understand what's happening under the hood.

So the plan is simple:
1. **First**, learn core Spring concepts (IoC, DI, Beans, Configuration)
2. **Then**, move to Spring Boot where all of that gets simplified

If you're already comfortable with Spring basics, feel free to skip ahead to the Spring Boot sections. But if you're new — stick around. This foundation will save you **hours** of debugging later.

---

## Choosing the Right IDE — IntelliJ IDEA

### 🧠 What is an IDE?

An **IDE (Integrated Development Environment)** is a software application that provides everything a developer needs to write, compile, run, and debug code — all in one place.

If you're new to IDEs, you might wonder: *"Why can't I just use a simple text editor like Notepad?"*

Great question. Here's the reality:

In real-world applications, you're dealing with **thousands of classes and methods**. Using a plain text editor means:
- You have to **manually compile** your code every time
- No auto-complete, no error highlighting
- No built-in debugging tools
- No project structure management

An IDE handles **all of this** for you — compilation, running, debugging, code suggestions, project organization — everything.

> 💡 **Pro Tip:** In the real world, you will **never** see a professional developer building enterprise applications in a text editor. Every developer uses an IDE — whether it's IntelliJ, Eclipse, or VS Code.

### ❓ Why IntelliJ IDEA?

There are several IDEs out there — Eclipse, VS Code, NetBeans. So why IntelliJ?

- **78% of Java developers** choose IntelliJ IDEA (as highlighted by JetBrains)
- It has **deep integration** with Java, Spring, and Spring Boot
- Most **enterprise companies** encourage their developers to use it
- It makes backend development **smoother and more productive**

You can download IntelliJ from [jetbrains.com](https://www.jetbrains.com/) → Developer Tools → IntelliJ IDEA.

### Free vs Premium

IntelliJ comes in two flavors:

| Feature | Community (Free) | Ultimate (Premium) |
|---|---|---|
| Core Java development | ✅ | ✅ |
| Spring/Spring Boot support | Basic | Full |
| Database tools | ❌ | ✅ |
| Advanced refactoring | Limited | Full |

You can **absolutely complete this course** with the free Community Edition. The premium version just adds extra productivity features. In real companies, your organization will typically provide a premium license.

---

## Setting Up IntelliJ — Theme & Font

Before we write any code, let's make our IDE comfortable. You're going to spend **hours** staring at this screen — your eyes will thank you for a dark theme.

### Step 1: Install a Dark Theme

1. Open **Settings** (Mac: `IntelliJ IDEA → Settings` | Windows: `File → Settings`)
2. Go to **Plugins → Marketplace**
3. Search for **"Dark Purple Theme"** and install it
4. Also install **"Atom Material Icons"** — gives you beautiful file/folder icons

### Step 2: Apply the Theme

1. Go to **Settings → Appearance**
2. Under Theme, select **Dark Purple**
3. Go to **Editor → Color Scheme** and also select **Dark Purple**

### Step 3: Set Up Fonts

1. In Settings, search for **"Font"**
2. Check **"Use custom font"**
3. Select your preferred font (e.g., Comic Sans MS, JetBrains Mono, or Fira Code)
4. Adjust font size and line height to your comfort

### Step 4: Adjust Zoom (Optional)

- Under Appearance, you can increase zoom to **150%** if you want larger text
- Default is 100%, which works fine for most screens

Click **Apply → OK**, and your IDE should look clean and easy on the eyes.

> ⚠️ **Common Mistake:** Using the default light theme for extended coding sessions. It causes unnecessary eye strain. Always switch to a dark theme.

---

## Creating a Maven Project in IntelliJ

Now let's create our first project. Here's the step-by-step process:

### Step 1: Start a New Project

- Click the **"+"** icon (or **File → New → Project** if you've used IntelliJ before)
- This opens the **New Project** dialog

### Step 2: Configure Project Details

| Field | Value | Notes |
|---|---|---|
| **Name** | `demo` | Name of your project |
| **Location** | Choose your preferred folder | Organize by section for easy access |
| **Build System** | **Maven** | We'll use Maven throughout |
| **JDK** | Latest LTS version (e.g., JDK 21/25) | Use whatever latest LTS is available |
| **Add Sample Code** | ❌ Unchecked | We'll write our own |

### Step 3: Configure Advanced Settings

| Field | Value |
|---|---|
| **Group ID** | `com.eazybytes` |
| **Artifact ID** | `demo` |

> 💡 **Pro Tip:** Use the **exact same** Group ID, Artifact ID, class names, and package names as shown. When you run into issues later, matching your code with the reference code becomes much easier if everything is named identically.

### Step 4: Create the Project

Click **Create** — and IntelliJ generates a plain Maven project for you.

At this point, it's just a Java project managed by Maven. It's **not** a Spring project yet. We'll convert it in the next step.

---

## What is Maven? (Quick Overview)

Before we go further, let's briefly understand what Maven is:

Maven is a **build automation tool** for Java projects. It handles:
- **Dependency management** — automatically downloads libraries your project needs
- **Compilation** — compiles your Java code
- **Packaging** — packages your code into JAR/WAR files
- **Project structure** — enforces a standard folder layout

The heart of a Maven project is the **`pom.xml`** file (Project Object Model). This is where you declare:
- Your project's identity (Group ID, Artifact ID, Version)
- All the dependencies (libraries) your project needs
- Build plugins and configurations

> Think of `pom.xml` as a **shopping list** for your project. You write down what libraries you need, and Maven goes and downloads them for you.

Another popular build tool is **Gradle**. Both work fine — the Spring concepts remain the same regardless of which tool you use.

---

## Converting a Maven Project into a Spring Project

Here's where it gets interesting. Right now we have a plain Java Maven project. To make it a **Spring project**, we need to add Spring's core library as a dependency.

### Step 1: Open `pom.xml`

This file is at the root of your project. It should look something like this:

```xml
<project>
    <groupId>com.eazybytes</groupId>
    <artifactId>demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <!-- Java version config -->
    </properties>
</project>
```

### Step 2: Add the Spring Dependency

Inside `pom.xml`, add a `<dependencies>` block after `<properties>`:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>6.x.x</version>  <!-- Use the latest stable version -->
    </dependency>
</dependencies>
```

### Step 3: Find the Latest Version

1. Go to [spring.io](https://spring.io)
2. Navigate to **Projects → Spring Framework**
3. Note the **latest stable version** displayed on the page
4. Copy that version number and paste it in the `<version>` tag

### Step 4: Sync Maven Changes

After adding the dependency, IntelliJ shows a small **"Sync Maven Changes"** icon (usually a floating button or a notification). **Click it.**

This tells Maven: *"Hey, I've added new dependencies — go download them."*

Maven then downloads the `spring-context` library and all its transitive dependencies from the Maven Central Repository.

> 🧠 **What is `spring-context`?**
> It's the core module of the Spring Framework that provides the IoC (Inversion of Control) container, dependency injection, and bean management. It's the **minimum** you need to start working with Spring.

✅ **That's it!** Your plain Maven project is now a **Spring project**, ready for exploring core Spring concepts.

---

## Creating and Running a Main Class

Let's verify everything works by creating a simple Java class.

### Step 1: Create a Package

1. Navigate to `src/main/java`
2. Right-click → **New → Package**
3. Name it: `com.eazybytes.demo`

### Step 2: Create the Main Class

1. Right-click on the package → **New → Java Class**
2. Name it: `DemoMainClass`
3. Write a simple main method:

```java
package com.eazybytes.demo;

public class DemoMainClass {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```

### Step 3: Build the Project

- **Mac:** `Cmd + F9`
- **Windows:** `Ctrl + F9`
- Or go to **Build → Build Project**

### Step 4: Run

- Click the **green play button** next to the `main` method
- You should see `Hello World` in the console

This is still plain Java — no Spring code yet. We'll start using Spring in the upcoming lectures. But the project setup is complete and ready.

---

## Bonus: Java's Compact Source File Feature

If you're using **JDK 21+** (with preview features) or **JDK 25+**, there's a neat feature called **Compact Source Files** that lets you write Java code without all the ceremony.

### Traditional Way (Before)

```java
package com.eazybytes.demo;

public class DemoMainClass {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```

You need a class definition, a `public static void main` method — a lot of boilerplate just to print something.

### Compact Source File Way (After)

```java
void main() {
    System.out.println("Hello World");
}
```

That's it. No class. No `static`. No `String[] args`. Just an **instance `main()` method** and your logic.

### How to Create One in IntelliJ

1. Right-click on a package → **New → Java Class**
2. Instead of selecting **Class**, select **Compact Source File**
3. Write your code directly

### Things to Know

- Compact source files are always placed in the **default package** (even if you right-click inside a named package)
- You can also use Java 25's new `IO.println()` method for output
- This is great for **quick testing and experimentation**

> 💡 **Pro Tip:** Compact source files are perfect for quickly testing a code snippet without setting up an entire class structure. Think of it as Java's version of a "scratch pad."

⚠️ **Note:** This feature is for quick prototyping. In real Spring/Spring Boot projects, you'll use the traditional class-based approach.

---

## ✅ Key Takeaways

1. **Learn Spring before Spring Boot** — Spring Boot builds on top of Spring. Understanding the foundation makes you a stronger developer.

2. **Use IntelliJ IDEA** for Java backend development — it has the best integration with Spring ecosystem projects.

3. **Maven** is a build tool that manages dependencies, compilation, and packaging. The `pom.xml` file is where you declare everything.

4. **To convert a Maven project to a Spring project**, add the `spring-context` dependency in `pom.xml` and sync Maven.

5. **`spring-context`** is the core Spring module — it provides IoC container and dependency injection capabilities.

6. **Always sync Maven** after adding or modifying dependencies in `pom.xml`.

7. **Set up your IDE properly** — dark theme, comfortable fonts, and proper zoom. Your productivity (and your eyes) will thank you.

8. Java's **Compact Source File** feature lets you write quick test code without full class boilerplate — useful for experimentation.

---

## ⚠️ Common Mistakes

- **Skipping Spring basics** and jumping directly to Spring Boot — leads to confusion when debugging real-world issues
- **Forgetting to sync Maven** after adding dependencies — your code won't compile if libraries aren't downloaded
- **Using different names** for Group ID, Artifact ID, and class names than the course — makes it harder to compare and debug your code
- **Using the wrong Spring version** — always check [spring.io](https://spring.io) for the latest stable version

---

## 💡 Pro Tips

- Keep your project structure **organized by sections** — it makes revisiting code much easier
- The **shortcut for building** (`Cmd/Ctrl + F9`) will become your best friend — get used to it early
- When something doesn't compile after adding a dependency, the **first thing to try** is re-syncing Maven
- The Spring Boot project setup process is **completely different** from this manual Maven approach — we'll cover that in later sections
