# 🏗️ Setting Up the Spring MVC Project in Eclipse

## 🎯 Introduction

In the previous lesson, we understood the difference between Spring Boot MVC and raw Spring MVC. Now it's time to actually build it. We're going to:

1. Set up Eclipse IDE
2. Create a Maven web project (not from Spring Initializr — that's for Spring Boot)
3. Copy our existing controller and entity code
4. Add the Spring MVC dependency
5. Prepare for server configuration

This is the **project scaffolding** step. We're laying the foundation before we configure the DispatcherServlet and View Resolver manually.

---

## 🧩 Concept 1: Getting Eclipse IDE

### ⚙️ Which Eclipse Version?

Not just any Eclipse — you need the **Enterprise Edition**:

| Eclipse Edition | For | External Server Support |
|----------------|-----|------------------------|
| Eclipse IDE for Java Developers | Basic Java apps | ❌ No |
| **Eclipse IDE for Enterprise Java and Web Developers** | Web apps, servers | ✅ Yes |

The Enterprise version includes tools for:
- Deploying to external servers (Tomcat, JBoss, etc.)
- Creating web projects (with `webapp/` folder structure)
- Managing server configurations within the IDE

### ⚙️ Download Steps

1. Go to [eclipse.org/downloads](https://eclipse.org/downloads)
2. Choose **"Eclipse IDE for Enterprise Java and Web Developers"**
3. Download and install for your OS
4. When Eclipse opens, it asks for a **workspace** — this is the folder where your projects live. Name it whatever you want (e.g., `spring`)

---

## 🧩 Concept 2: Creating a Maven Web Project

### 🧠 Why Not Spring Initializr?

Spring Initializr (start.spring.io) creates **Spring Boot** projects. Since we're not using Spring Boot, we create a plain **Maven project** and add Spring dependencies manually.

### ⚙️ Step-by-Step Project Creation

1. **File → New → Maven Project**
2. Click **Next** (don't check "Create a simple project")
3. In the **Archetype selection** screen:
   - Catalog: **Internal**
   - Filter or find: **maven-archetype-webapp**
   - Select it — this creates a web application structure

4. Click **Next**
5. Fill in the details:
   - **Group ID**: `com.telusko` (your organization)
   - **Artifact ID**: `SpringMVCDemo` (your project name)
6. Click **Finish**

### ❓ What is an Archetype?

A Maven archetype is a **project template**. Different archetypes create different project structures:

| Archetype | Creates | When to Use |
|-----------|---------|-------------|
| `maven-archetype-quickstart` | Basic Java project | Console apps, libraries |
| **`maven-archetype-webapp`** | Web application project | Web apps with `webapp/` folder |

The webapp archetype gives us the folder structure needed for a web application — including the `webapp/` directory where JSP files go.

### 📂 The Generated Project Structure

```
SpringMVCDemo/
├── src/
│   └── main/
│       └── webapp/
│           ├── WEB-INF/
│           │   └── web.xml
│           └── index.jsp          ← Default placeholder (we'll delete this)
├── pom.xml
└── (no java/ folder yet!)
```

Notice two things:
1. **No `java/` folder** — The webapp archetype doesn't create it. We need to add it manually.
2. **`webapp/` exists** — This is where web resources (JSP files, etc.) go.

---

## 🧩 Concept 3: Setting Up the Folder Structure

### ⚙️ Create the Missing java/ Folder

The archetype didn't create `src/main/java/`, so we add it:

1. Right-click on `src/main/`
2. New → Folder
3. Name it `java`

Now we have:

```
src/
└── main/
    ├── java/              ← Manually created
    └── webapp/
```

### ⚙️ Create the Package

Inside the `java/` folder, create the package:

1. Right-click on `java/`
2. New → Package
3. Name: `com.telusko.SpringMVCDemo`

This mirrors what Spring Boot created automatically. In Spring Boot, the package was set up by Spring Initializr. Here, we do it ourselves.

### ⚙️ Delete the Default index.jsp

The archetype creates a placeholder `index.jsp` in `webapp/`. We don't need it — we have our own files. Delete it.

---

## 🧩 Concept 4: Copying Code from the Spring Boot Project

### 🧠 What to Copy

We need two files from our Spring Boot project:

| File | What It Contains | Changes Needed? |
|------|-----------------|-----------------|
| `Alien.java` | Entity class (aid, aname) | Update package name |
| `HomeController.java` | Controller with `@RequestMapping` | Update package name |

We do **NOT** copy:
- `DemoApplication.java` — That's the Spring Boot main class. No Spring Boot = no main class like that.
- `application.properties` — Spring MVC uses XML configuration, not properties files.
- CSS files — Requires additional configuration; we're focusing on backend.

### ⚙️ Steps

1. Open the Spring Boot project in IntelliJ
2. Copy `Alien.java` and `HomeController.java`
3. Paste them into the `com.telusko.SpringMVCDemo` package in Eclipse
4. **Update the package declaration** in both files:

```java
// Change from:
package com.telusko.SpringBootDemo;

// Change to:
package com.telusko.SpringMVCDemo;
```

### ⚙️ Copy the View Files

1. Copy the entire `views/` folder (containing `index.jsp` and `result.jsp`) from the Spring Boot project
2. Paste it into `src/main/webapp/` in Eclipse

```
src/main/webapp/
└── views/
    ├── index.jsp
    └── result.jsp
```

We're using JSP for this Spring MVC section (not Thymeleaf), because JSP is the traditional view technology used with Spring MVC in the pre-Boot era.

### ⚠️ After Pasting — Errors Everywhere!

When you open `HomeController.java`, Eclipse shows red errors everywhere. Why?

```java
import org.springframework.stereotype.Controller;           // ❌ Not found
import org.springframework.web.bind.annotation.RequestMapping;  // ❌ Not found
import org.springframework.ui.Model;                        // ❌ Not found
```

The Spring Framework classes aren't on the classpath yet. We haven't added any dependencies. That's the next step.

---

## 🧩 Concept 5: Adding the Spring MVC Dependency

### 🧠 What Dependency Do We Need?

In Spring Boot, we added `spring-boot-starter-web` and it pulled in everything. Now we need the specific Spring library: **Spring Web MVC**.

### ⚙️ Finding the Dependency

1. Go to [mvnrepository.com](https://mvnrepository.com)
2. Search for **"Spring Web MVC"**
3. Select **`spring-webmvc`** from `org.springframework`
4. Choose a version (e.g., **6.1.0** — or a recent stable version)
5. Copy the Maven dependency XML

### ⚙️ Adding to pom.xml

Open `pom.xml` in Eclipse and add the dependency:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>6.1.0</version>
    </dependency>
</dependencies>
```

### 🔍 What Does This Pull In?

When you add `spring-webmvc`, Maven automatically downloads its **transitive dependencies**:

- `spring-web` — Core web support
- `spring-context` — Application context, dependency injection
- `spring-core` — Foundation of Spring Framework
- `spring-beans` — Bean management
- `spring-aop` — Aspect-oriented programming support
- `spring-expression` — SpEL (Spring Expression Language)

Check the **Maven Dependencies** section in Eclipse's Project Explorer — you'll see all these JARs appear.

### ✅ Errors Resolved

After adding the dependency and letting Maven download the JARs:

```java
import org.springframework.stereotype.Controller;              // ✅ Found!
import org.springframework.web.bind.annotation.RequestMapping; // ✅ Found!
import org.springframework.ui.Model;                           // ✅ Found!
```

The `HomeController.java` compiles without errors. The Spring classes are now available.

### 💡 One Dependency vs Starters

| Spring Boot | Spring MVC (Manual) |
|------------|---------------------|
| `spring-boot-starter-web` | `spring-webmvc` |
| Pulls in Spring MVC + Embedded Tomcat + Jackson + more | Pulls in Spring MVC core only |
| One starter = everything | You add what you need |

Spring Boot starters are convenience packages that bundle multiple dependencies. Without Boot, you're more selective — but you also have more control.

---

## 🧩 Concept 6: Tomcat Folder Structure

### 📂 What's Inside the Tomcat Installation

The downloaded and extracted Tomcat folder looks like this:

```
apache-tomcat-10.1.16/
├── bin/                    ← Start/stop scripts
│   ├── startup.sh          ← Start Tomcat (Mac/Linux)
│   ├── startup.bat         ← Start Tomcat (Windows)
│   ├── shutdown.sh         ← Stop Tomcat (Mac/Linux)
│   └── shutdown.bat        ← Stop Tomcat (Windows)
├── conf/                   ← Configuration files
│   ├── server.xml          ← Server settings (port, connectors)
│   └── web.xml             ← Default web app config
├── lib/                    ← Tomcat's own libraries
├── logs/                   ← Log files
├── webapps/                ← Where you deploy your .war files
│   ├── ROOT/               ← Default web app
│   └── (your app goes here)
├── work/                   ← Compiled JSPs and temp files
└── temp/                   ← Temporary files
```

The key folders:
- **`bin/`** — Contains `startup.sh` / `startup.bat` to start Tomcat. But we'll configure Eclipse to manage this for us.
- **`webapps/`** — Where deployed applications live. Eclipse will deploy our `.war` file here.
- **`conf/`** — Server configuration. We mostly leave this alone.

---

## 🧩 Concept 7: What We Have vs What We Need

### 📋 Progress Check

| Item | Status | Notes |
|------|--------|-------|
| Eclipse IDE | ✅ Ready | Enterprise edition |
| Maven project | ✅ Created | webapp archetype |
| Java source folder | ✅ Created | `src/main/java/` |
| Package | ✅ Created | `com.telusko.SpringMVCDemo` |
| Controller code | ✅ Copied | `HomeController.java` |
| Entity code | ✅ Copied | `Alien.java` |
| View files | ✅ Copied | JSP files in `webapp/views/` |
| Spring MVC dependency | ✅ Added | `spring-webmvc` in `pom.xml` |
| Tomcat downloaded | ✅ Ready | But not connected to Eclipse yet |
| Tomcat in Eclipse | ❌ Not configured | Next step |
| DispatcherServlet | ❌ Not registered | Coming soon |
| View Resolver | ❌ Not configured | Coming soon |

**Can we run the project now?** Not yet. Two things are missing:
1. **No server connected** — Eclipse doesn't know about our Tomcat installation
2. **No Spring MVC configuration** — DispatcherServlet and View Resolver aren't set up

### ⚠️ If You Try to Run Now

Right-click project → Run As → Run on Server → **No servers available**

Eclipse needs to know where Tomcat is installed before it can deploy and run our application. That's the next step — connecting Tomcat to Eclipse.

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. Use **Eclipse IDE for Enterprise Java** — the regular Java edition doesn't support external servers
2. Create a **Maven webapp project** using the `maven-archetype-webapp` archetype — not Spring Initializr
3. The webapp archetype doesn't create `src/main/java/` — you add it manually
4. **Copy controller and entity code** from the Spring Boot project, update the package names
5. Copy **JSP view files** into `webapp/views/`
6. The key dependency is **`spring-webmvc`** — it pulls in all Spring core libraries transitively
7. Don't copy `application.properties` — Spring MVC uses XML or Java-based configuration
8. Don't copy the Spring Boot main class — there's no embedded server to start
9. Tomcat is downloaded separately and will be connected to Eclipse in the next step

### ⚠️ Common Mistakes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Using Eclipse for Java Developers (not Enterprise) | No server support | Download the Enterprise/EE edition |
| Choosing `quickstart` archetype instead of `webapp` | No `webapp/` folder | Use `maven-archetype-webapp` |
| Forgetting to create `src/main/java/` | Can't create Java packages | Manually create the `java/` folder under `src/main/` |
| Not updating package names after copying | Compilation errors | Change package to match the new project |
| Copying `application.properties` | Properties are ignored | Spring MVC uses XML/Java config, not properties |
| Forgetting to reload Maven after adding dependency | Classes not found | Right-click → Maven → Update Project |

### 💡 Pro Tips

1. **Maven archetypes save time** — They create the boilerplate folder structure for you. Learn the common ones (quickstart, webapp).
2. **Check Maven Dependencies** — After adding a dependency, verify it appears in the Maven Dependencies folder in Eclipse. If it doesn't, Maven didn't download it properly.
3. **Version matching matters** — If you're using Tomcat 10, use Spring 6.x. Tomcat 9 pairs with Spring 5.x. The `javax` ↔ `jakarta` split aligns with this.
4. **Keep the Spring Boot project as reference** — Don't delete it. Comparing code side-by-side helps you understand what Spring Boot auto-configured.

---

## 🔗 What's Next?

The project skeleton is ready — we have code, views, and the Spring dependency. But we can't run it yet because:

1. **Tomcat isn't connected to Eclipse** — We need to add it as a server
2. **No DispatcherServlet** — Spring MVC's front controller isn't registered
3. **No View Resolver** — The mapping from logical names to JSP paths isn't configured

Next lesson: connecting Tomcat to Eclipse so we can deploy and run the application.
