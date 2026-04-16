# 🔧 Introduction to Spring MVC Without Spring Boot

## 🎯 Introduction

Everything we've built so far — controllers, forms, `@ModelAttribute`, View Resolver, Thymeleaf — was done with **Spring Boot**. Spring Boot handled the heavy lifting: embedded Tomcat, auto-configuration, dependency management, property defaults. We just wrote our code and it worked.

But Spring Boot is built **on top of** the Spring Framework. It's a convenience layer. What happens if you strip it away and work with the **raw Spring MVC framework** directly?

That's what this section is about. We're going to build the same web application — same controllers, same pages, same flow — but **without Spring Boot**. This means we handle all the configuration ourselves.

**Why bother?** Because understanding what Spring Boot does for you makes you a better developer. When something breaks, you'll know what's happening behind the scenes. And many older enterprise applications use Spring MVC without Spring Boot — you might encounter them in the real world.

**Important**: Nothing conceptually new here. The controllers, models, and views work the same way. The **only thing that changes is the configuration**. Focus on the setup, not the application logic.

---

## 🧩 Concept 1: Spring Boot MVC vs Spring MVC — What's the Difference?

### 🧠 What Spring Boot Did for Us

Let's recap everything Spring Boot handled automatically:

| What | Spring Boot (Automatic) | Spring MVC (Manual) |
|------|------------------------|---------------------|
| **Tomcat server** | Embedded — runs inside the app | External — you download and configure it separately |
| **Dependencies** | Starter POMs bundle everything | You pick individual JARs |
| **DispatcherServlet** | Auto-registered | You register it manually in config |
| **View Resolver** | Auto-configured from properties | You create and configure the bean yourself |
| **Component scanning** | Auto-detects `@Controller` classes | You configure the scan packages |
| **application.properties** | Just works | Not available (different config approach) |

### 🎯 An Analogy

**Spring Boot** is like buying a pre-built computer — plug it in, turn it on, it works. All the components are already assembled and configured.

**Spring MVC (without Boot)** is like building a computer from parts — you buy the CPU, RAM, motherboard, power supply separately, and you assemble everything yourself. The end result is the same computer, but you understand every component and connection.

### ❓ Why Learn the Manual Way?

1. **Legacy projects** — Many enterprise applications were built before Spring Boot existed (pre-2014). They use raw Spring MVC. You need to understand them.
2. **Debugging** — When auto-configuration fails, knowing the manual setup helps you figure out what went wrong.
3. **Deeper understanding** — You appreciate Spring Boot more when you see what it automates.
4. **Interviews** — "What does Spring Boot do differently from Spring Framework?" is a classic interview question. Now you'll have a real answer.

---

## 🧩 Concept 2: External Tomcat vs Embedded Tomcat

### 🧠 What Changes

In Spring Boot, Tomcat is **embedded** — it's a dependency in your `pom.xml`. When you run the `main()` method, Tomcat starts automatically as part of your application.

In raw Spring MVC, Tomcat is **external** — it's a separate software you download, install, and run independently. Your application is a `.war` file that you **deploy** into Tomcat.

### 🔄 The Difference

**Spring Boot (Embedded Tomcat):**
```
You run your app → Tomcat starts inside your app → App serves requests
```

**Spring MVC (External Tomcat):**
```
You start Tomcat separately → You deploy your .war file into Tomcat → Tomcat runs your app
```

### ⚙️ Getting External Tomcat

1. Search for **"Apache Tomcat download"**
2. Download **Tomcat 10** (the current version)
3. Choose the right format for your OS:
   - **Windows**: `.zip` file
   - **macOS/Linux**: `.tar.gz` file
4. Extract/unzip the downloaded file
5. You now have a Tomcat installation with folders like `bin/`, `conf/`, `webapps/`, etc.

### ⚠️ Tomcat 10 vs Tomcat 9 — The Jakarta Change

This is important to know:

| Tomcat Version | Package Namespace | Example |
|---------------|-------------------|---------|
| Tomcat 9 and earlier | `javax.*` | `javax.servlet.http.HttpServlet` |
| Tomcat 10 and later | `jakarta.*` | `jakarta.servlet.http.HttpServlet` |

Java EE (Enterprise Edition) was transferred from Oracle to the Eclipse Foundation, and the package names changed from `javax` to `jakarta`. This is purely a renaming — the classes work the same way.

**If you use Tomcat 10**: Your code must use `jakarta.*` imports.

**If you use Tomcat 9**: Your code uses the older `javax.*` imports.

For this section, we'll use **Tomcat 10** with `jakarta.*`. If you prefer the older naming, Tomcat 9 works fine too — just use `javax.*` instead.

---

## 🧩 Concept 3: IDE Change — Eclipse Instead of IntelliJ Community

### 🧠 Why Switch?

IntelliJ IDEA has two editions:
- **Community Edition** (free) — What we've been using. Great for Spring Boot because the embedded server runs from the IDE.
- **Ultimate Edition** (paid) — Supports external servers like Tomcat, JBoss, etc.

Since we're using an **external Tomcat** now and want to keep things free, we switch to **Eclipse IDE** which:
- Is completely free
- Has built-in support for external servers
- Can deploy `.war` files to Tomcat directly

### 💡 Don't Worry About the IDE

The IDE doesn't change your code. Whether you write Java in IntelliJ, Eclipse, VS Code, or Notepad — the Java code is the same. Eclipse is just a tool that happens to support external Tomcat deployment out of the box for free.

If you have IntelliJ Ultimate, you can stick with it. The concepts and code remain identical.

---

## 🧩 Concept 4: What Will Change and What Won't

### ✅ What Stays the Same

These concepts carry over directly — you already know them:

- `@Controller` annotation
- `@RequestMapping` for URL mapping
- `@RequestParam` for parameter binding
- `@ModelAttribute` for object binding
- `Model` and `ModelAndView` for passing data
- View Resolver concept (prefix + name + suffix)
- The MVC pattern itself (Controller → Model → View)

### 🔧 What Changes (Configuration Only)

These are the new things we'll need to handle:

1. **Project setup** — No Spring Initializr. We create a Maven web project manually.
2. **Dependencies** — No starter POMs. We add individual Spring MVC JARs.
3. **DispatcherServlet registration** — No auto-config. We register it in `web.xml` or a Java config class.
4. **View Resolver** — No auto-config. We create a bean definition.
5. **Component scanning** — No auto-config. We specify which packages to scan.
6. **Deployment** — No embedded server. We build a `.war` file and deploy to external Tomcat.

### 🎯 The Key Mindset

Think of this section as **pulling back the curtain**. Every time Spring Boot magically did something, we'll now do it manually. Same show, but now you see how the magic trick works.

---

## 🧩 Concept 5: The Tools We Need — Checklist

Before we start building, here's everything we need:

### 📋 Software Checklist

| Tool | Purpose | Where to Get It |
|------|---------|-----------------|
| **JDK** | Java Development Kit | Already installed from earlier lessons |
| **Apache Tomcat 10** | External web server | tomcat.apache.org/download |
| **Eclipse IDE** | Development environment | eclipse.org/downloads (Eclipse IDE for Enterprise Java) |
| **Maven** | Dependency management | Bundled with Eclipse |

### 🔄 Comparison with Spring Boot Setup

| What | Spring Boot | Spring MVC (Manual) |
|------|------------|---------------------|
| Server | Embedded (automatic) | External Tomcat (download separately) |
| IDE | Any (IntelliJ Community works) | Eclipse or IntelliJ Ultimate |
| Project creation | Spring Initializr | Maven web project from scratch |
| Run the app | Click Run in IDE | Deploy `.war` to Tomcat |

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. **Spring MVC without Spring Boot** requires manual configuration of everything Spring Boot auto-configures
2. The application logic (controllers, models, views) remains **exactly the same** — only configuration changes
3. **External Tomcat** replaces the embedded Tomcat — you download, install, and deploy to it separately
4. **Tomcat 10** uses `jakarta.*` packages; **Tomcat 9** uses `javax.*` — same classes, different package names
5. **Eclipse IDE** is used because IntelliJ Community doesn't support external server deployment (IntelliJ Ultimate does)
6. Focus on **configuration** in this section, not on controllers or views — you already know those
7. This section reveals what Spring Boot does behind the scenes — understanding this makes you a stronger Spring developer

### ⚠️ Common Mistakes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Mixing `javax.*` and `jakarta.*` imports | Compilation errors | Match imports to your Tomcat version (10 = jakarta, 9 = javax) |
| Trying to run Spring MVC like Spring Boot | App doesn't start | Deploy as `.war` to external Tomcat, don't look for `main()` |
| Using IntelliJ Community for external Tomcat | No server configuration option | Switch to Eclipse or IntelliJ Ultimate |
| Expecting `application.properties` to work | Properties are ignored | Configuration is done differently (XML or Java config) |

### 💡 Pro Tips

1. **Don't panic about the configuration code** — It looks verbose, but it's the same few settings every time. You'll learn the pattern quickly.
2. **Keep your Spring Boot project open** — Compare it side by side with the Spring MVC project to see what's different.
3. **This is a one-time learning curve** — Once you understand manual Spring MVC config, you'll appreciate Spring Boot and rarely go back.
4. **Real-world relevance** — Many companies have legacy Spring MVC projects. Being comfortable with both approaches makes you more valuable.

---

## 🔗 What's Next?

We have our tools ready:
- ✅ External Tomcat downloaded
- ✅ Eclipse IDE ready
- ✅ Understanding of what changes and what stays the same

Next, we'll create the Spring MVC project from scratch in Eclipse — setting up the Maven project, adding dependencies, and configuring the DispatcherServlet manually. The coding begins!
