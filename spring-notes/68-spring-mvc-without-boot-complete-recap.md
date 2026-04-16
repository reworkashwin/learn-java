# 🔁 Spring MVC Without Spring Boot — Complete Recap

## 🎯 Introduction

We've successfully built a Spring MVC application **without Spring Boot** — from scratch, with manual configuration. This recap ties together everything we did across the last several lessons into one clear, connected picture.

The goal here isn't to learn new concepts but to see **the full map** — every file, every configuration, and how they all connect. If you can follow this recap, you understand what Spring Boot automates.

---

## 🧩 Concept 1: The Starting Point — A Maven Project

### 🧠 What We Started With

We didn't use Spring Initializr. We created a plain **Maven webapp project** using the `maven-archetype-webapp` archetype. Out of the box, this gives you:

```
SpringMVCDemo/
├── src/main/java/           ← Empty (no Java code yet)
├── src/main/webapp/
│   └── WEB-INF/
│       └── web.xml          ← Basic deployment descriptor
└── pom.xml                  ← Maven build file
```

No Spring. No controllers. No auto-configuration. Just a blank web project.

### ⚙️ The First Step — Adding the Dependency

To bring Spring into the project, we added **one dependency** to `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>6.1.1</version>
</dependency>
```

This is `spring-webmvc` — **not** `spring-boot-starter-web`. No Spring Boot involved. The version (`6.1.x`) can be updated based on the latest available release.

This single dependency pulls in everything Spring MVC needs: the DispatcherServlet, View Resolvers, annotation support, and more.

---

## 🧩 Concept 2: The Controller — Same Code, Different Setup

### 🧠 The Controller Code

The controller code is **identical** to what we wrote in Spring Boot:

```java
@Controller
public class HomeController {

    @RequestMapping("/")
    public String home() {
        System.out.println("home method called");
        return "index";
    }

    @RequestMapping("/addAlien")
    public String addAlien(@ModelAttribute Alien alien, Model model) {
        return "result";
    }

    @ModelAttribute("course")
    public String courseName() {
        return "Java";
    }
}
```

Same `@Controller`. Same `@RequestMapping`. Same `@ModelAttribute`. The annotations don't change between Spring Boot and raw Spring MVC — the **configuration around them** changes.

---

## 🧩 Concept 3: The Configuration Chain — Who Talks to Whom

### 🧠 The Key Insight

Every configuration file in this project exists to **talk to a specific component**. Understanding who talks to whom is the key to understanding Spring MVC:

```
File                      →  Talks To          →  Says What
─────────────────────────────────────────────────────────────
web.xml                   →  Tomcat             →  "Send all requests to DispatcherServlet"
telusko-servlet.xml       →  DispatcherServlet  →  "Scan com.telusko for controllers, use annotations, here's the View Resolver"
```

That's the entire configuration. Two files, two conversations.

### 🎯 The Communication Map

```
┌──────────┐    reads     ┌──────────────────────┐
│  Tomcat  │ ──────────── │      web.xml         │
│          │              │  "Use DispatcherServlet   │
│          │              │   for all requests"  │
└────┬─────┘              └──────────────────────┘
     │ forwards request
     ▼
┌──────────────────┐  reads  ┌──────────────────────────┐
│ DispatcherServlet│ ─────── │  telusko-servlet.xml     │
│                  │         │  • Scan com.telusko      │
│                  │         │  • Use annotations       │
│                  │         │  • View Resolver config  │
└────────┬─────────┘         └──────────────────────────┘
         │ routes to
         ▼
┌──────────────────┐
│  HomeController  │
│  @Controller     │
│  @RequestMapping │
└────────┬─────────┘
         │ returns view name
         ▼
┌──────────────────────────────┐
│ InternalResourceViewResolver │
│ prefix=/views/ + suffix=.jsp │
└────────┬─────────────────────┘
         │ resolves to
         ▼
┌──────────────┐
│  /views/     │
│  index.jsp   │
│  result.jsp  │
└──────────────┘
```

---

## 🧩 Concept 4: File-by-File Breakdown

### 📄 1. `pom.xml` — The Dependency

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>6.1.1</version>
</dependency>
```

**Purpose:** Bring Spring MVC into the project. Provides DispatcherServlet, annotations, View Resolvers — everything.

---

### 📄 2. `web.xml` — Talking to Tomcat

**Location:** `src/main/webapp/WEB-INF/web.xml`

```xml
<servlet>
    <servlet-name>telusko</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>telusko</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

**Purpose:** Tell Tomcat: *"For all requests (`/`), call the DispatcherServlet."*

**Key details:**
- `<servlet-name>` connects the two tags — must be the same in both
- `<url-pattern>/</url-pattern>` catches all URLs
- The servlet name (`telusko`) determines the config file name: `telusko-servlet.xml`

---

### 📄 3. `telusko-servlet.xml` — Talking to DispatcherServlet

**Location:** `src/main/webapp/WEB-INF/telusko-servlet.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:ctx="http://www.springframework.org/schema/context"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
           http://www.springframework.org/schema/beans
           http://www.springframework.org/schema/beans/spring-beans.xsd
           http://www.springframework.org/schema/context
           http://www.springframework.org/schema/context/spring-context.xsd">

    <ctx:component-scan base-package="com.telusko" />
    <ctx:annotation-config />

    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/views/" />
        <property name="suffix" value=".jsp" />
    </bean>

</beans>
```

**Purpose:** Tell DispatcherServlet three things:
1. **Scan `com.telusko`** — Find all `@Controller`, `@Service`, `@Component` classes
2. **Use annotations** — Process `@RequestMapping`, `@ModelAttribute`, etc.
3. **View Resolver** — When a controller returns `"index"`, resolve to `/views/index.jsp`

---

### 📄 4. `HomeController.java` — The Application Logic

**Location:** `src/main/java/com/telusko/HomeController.java`

```java
@Controller
public class HomeController {

    @RequestMapping("/")
    public String home() {
        return "index";
    }

    @RequestMapping("/addAlien")
    public String addAlien(@ModelAttribute Alien alien, Model model) {
        return "result";
    }

    @ModelAttribute("course")
    public String courseName() {
        return "Java";
    }
}
```

**Purpose:** Handle requests — same annotations as in Spring Boot. No difference.

---

### 📄 5. JSP Views — The Output

**Location:** `src/main/webapp/views/index.jsp` and `result.jsp`

```jsp
<%@ page isELIgnored="false" %>
```

**Key fix:** The `isELIgnored="false"` attribute ensures Expression Language (`${}`) works correctly in standalone Tomcat.

---

## 🧩 Concept 5: The Complete Project Structure

```
SpringMVCDemo/
├── pom.xml                                    ← spring-webmvc dependency
├── src/
│   └── main/
│       ├── java/
│       │   └── com/telusko/
│       │       ├── HomeController.java        ← @Controller
│       │       └── Alien.java                 ← Model POJO
│       └── webapp/
│           ├── views/
│           │   ├── index.jsp                  ← Form page
│           │   └── result.jsp                 ← Result page
│           └── WEB-INF/
│               ├── web.xml                    ← Tomcat config
│               └── telusko-servlet.xml        ← Spring config
```

Six files. That's the entire application.

---

## 🧩 Concept 6: Spring MVC vs Spring Boot — When to Use What

### ❓ Is Raw Spring MVC Worth It?

**Yes — you get more control.** You decide exactly how every component is configured. Nothing is hidden. Nothing is auto-configured that you didn't ask for.

### ❓ Is Spring Boot Worth It?

**Yes — it saves time.** For most projects, the auto-configuration is exactly what you need. You skip the boilerplate and focus on business logic.

### 📊 When to Choose What

| Scenario | Recommendation |
|----------|---------------|
| Learning Spring internals | Raw Spring MVC — you see every moving part |
| New project with standard requirements | Spring Boot — fast setup, less config |
| Legacy project already using XML config | Raw Spring MVC — match the existing approach |
| Need fine-grained control over every bean | Raw Spring MVC — nothing hidden |
| Rapid prototyping | Spring Boot — up and running in minutes |
| Enterprise project with many developers | Spring Boot — conventions reduce confusion |

### 💡 The Reality

Most modern projects use **Spring Boot**. But understanding raw Spring MVC means you can:
- Debug Spring Boot issues by understanding what's happening underneath
- Customize auto-configuration when defaults don't work
- Work on legacy projects that don't use Boot
- Appreciate what Spring Boot actually does for you

---

## 🧩 Concept 7: Configuration Is One-Time

### 🧠 An Important Perspective

All the configuration we did — `web.xml`, `telusko-servlet.xml`, Tomcat setup, Build Path — it happens **once per project**. After the initial setup:

- Adding a new controller? Just create a class with `@Controller`. Component scan picks it up automatically.
- Adding a new view? Just create a `.jsp` file in `/views/`. The View Resolver handles it.
- Adding a new endpoint? Just add a `@RequestMapping` method. DispatcherServlet routes to it.

The configuration is the scaffolding. Once it's up, you build freely.

---

## 🧩 Concept 8: What's Next

After this deep dive into raw Spring MVC, we're going back to **Spring Boot** to add more features. Now you have the context to appreciate what's happening behind every Spring Boot auto-configuration.

When you see `spring-boot-starter-web` in a `pom.xml`, you now know it:
- Adds `spring-webmvc` dependency ✅
- Creates a DispatcherServlet ✅
- Registers it for all URLs ✅
- Enables component scanning from the main class package ✅
- Enables annotation processing ✅
- Configures View Resolver from `application.properties` ✅
- Embeds Tomcat so you don't need an external server ✅

All of this — automated.

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. A Spring MVC app without Boot needs **two config files**: `web.xml` (talks to Tomcat) and `{servlet-name}-servlet.xml` (talks to DispatcherServlet).
2. `web.xml` registers the DispatcherServlet using `<servlet>` + `<servlet-mapping>` tags.
3. `telusko-servlet.xml` configures component scanning, annotation support, and the View Resolver.
4. The **controller code is identical** in Spring Boot and raw Spring MVC — only the surrounding configuration changes.
5. All configuration is **one-time setup** — once done, adding controllers and views requires no additional config.
6. **Spring Boot automates everything** we did manually — DispatcherServlet registration, component scanning, View Resolver, embedded Tomcat.
7. Understanding raw Spring MVC makes you a better Spring Boot developer — you know what's under the hood.

### ⚠️ Common Mistakes

| Mistake | Impact | Prevention |
|---------|--------|-----------|
| Mismatched `<servlet-name>` | Config file not found (500 error) | Same name in `<servlet>`, `<servlet-mapping>`, and filename |
| Wrong `<property>` syntax in XML | Parse error | Use `value` attribute: `<property name="..." value="..." />` |
| Forgetting `isELIgnored="false"` | `${}` shows as literal text | Add to JSP page directive |
| Missing Tomcat library in Build Path | Compile/deploy errors | Add Server Runtime via Build Path → Libraries |
| Wrong base-package in component scan | Controllers not found | Verify package name matches your Java source tree |

### 💡 Pro Tips

1. **Think of each file as a conversation.** `web.xml` talks to Tomcat. `telusko-servlet.xml` talks to DispatcherServlet. Knowing who you're talking to makes the configuration logical.
2. **Save your config files as templates.** The `web.xml` and `telusko-servlet.xml` structure is reusable across projects — just change the package name and view paths.
3. **Raw Spring MVC gives you control; Spring Boot gives you speed.** Neither is wrong — choose based on your project's needs.
4. **You will almost always use Spring Boot** in real-world projects. But this knowledge of raw Spring MVC is what separates a developer who *uses* Spring from one who *understands* Spring.
