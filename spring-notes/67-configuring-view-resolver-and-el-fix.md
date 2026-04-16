# ⚙️ Configuring InternalResourceViewResolver and Getting the App Working

## 🎯 Introduction

We're at the final stretch. The DispatcherServlet is registered, it can find our controllers, and the controller method executes successfully — we can see "home method called" in the console. But we still get a **404** because DispatcherServlet doesn't know how to turn the string `"index"` into the file `/views/index.jsp`.

The missing piece is the **InternalResourceViewResolver** — the same View Resolver that Spring Boot configured automatically from `application.properties`. Now we configure it manually as a bean in `telusko-servlet.xml`.

In this lesson, we'll:
- Configure `InternalResourceViewResolver` as a bean with prefix and suffix
- Fix a common XML syntax mistake with `<property>` tags
- Get the application fully working — homepage, form submission, and result page
- Fix the **EL (Expression Language) ignored** issue in JSP
- See the complete working Spring MVC application without Spring Boot

---

## 🧩 Concept 1: Configuring InternalResourceViewResolver as a Bean

### 🧠 What Are We Solving?

When the controller returns `"index"`, the DispatcherServlet needs to know:
- **Where** to find the file → prefix: `/views/`
- **What extension** the file has → suffix: `.jsp`

So `"index"` becomes `/views/index.jsp`.

This is exactly what we did in Spring Boot with:
```properties
spring.mvc.view.prefix=/views/
spring.mvc.view.suffix=.jsp
```

Now we do it with an XML bean definition.

### ⚙️ Finding the Class

The View Resolver class lives in the `spring-webmvc` JAR:

```
Maven Dependencies
  └── spring-webmvc
       └── org.springframework.web.servlet
            └── view
                 └── InternalResourceViewResolver
```

The fully qualified class name:
```
org.springframework.web.servlet.view.InternalResourceViewResolver
```

### 🧪 The Bean Configuration

Add this inside the `<beans>` tag in `telusko-servlet.xml`:

```xml
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="prefix" value="/views/" />
    <property name="suffix" value=".jsp" />
</bean>
```

### 🔍 Breaking It Down

**The `<bean>` tag:**
```xml
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
```
- `class` — The fully qualified class name (without `.class` extension)
- No `id` needed here — Spring will auto-detect it as the View Resolver

**The `<property>` tags:**
```xml
<property name="prefix" value="/views/" />
<property name="suffix" value=".jsp" />
```
- `name` — The property name on the Java class (corresponds to a setter method)
- `value` — The value to set

Behind the scenes, Spring calls:
```java
InternalResourceViewResolver resolver = new InternalResourceViewResolver();
resolver.setPrefix("/views/");
resolver.setSuffix(".jsp");
```

The XML is just a declarative way of doing the same thing.

### 🎯 How View Resolution Works Now

```
Controller returns: "index"
         ↓
View Resolver: prefix + name + suffix
         ↓
"/views/" + "index" + ".jsp"
         ↓
/views/index.jsp  →  DispatcherServlet renders this JSP
```

```
Controller returns: "result"
         ↓
"/views/" + "result" + ".jsp"
         ↓
/views/result.jsp
```

---

## 🧩 Concept 2: Common Mistake — Wrong Property Syntax

### ⚠️ The Incorrect Way

When writing the property tags, it's tempting to use this syntax:

```xml
<!-- ❌ WRONG — This won't work -->
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="prefix">/views/</property>
    <property name="suffix">.jsp</property>
</bean>
```

While putting the value as text content inside the tag might seem logical, the `<property>` tag in Spring's bean XML expects the value as an **attribute**, not as element content.

### ✅ The Correct Way

```xml
<!-- ✅ CORRECT — Use the value attribute -->
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="prefix" value="/views/" />
    <property name="suffix" value=".jsp" />
</bean>
```

The key: **use the `value` attribute** on the `<property>` tag. Self-closing tags (`/>`) keep it clean.

### 💡 Lesson

When something doesn't work, **read the error carefully**. The error pointed to the exact line number and indicated a problem with the property tag. Check the syntax — XML is unforgiving about structure.

---

## 🧩 Concept 3: The Complete telusko-servlet.xml

### 🧪 Full File After All Configuration

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

    <!-- Component scanning: find @Controller classes in this package -->
    <ctx:component-scan base-package="com.telusko" />

    <!-- Enable annotation-based configuration -->
    <ctx:annotation-config />

    <!-- View Resolver: map view names to JSP files -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/views/" />
        <property name="suffix" value=".jsp" />
    </bean>

</beans>
```

Three pieces of configuration:
1. **Component scan** — Find controllers
2. **Annotation config** — Process annotations
3. **View Resolver bean** — Resolve view names to JSP paths

---

## 🧩 Concept 4: It Works! — The Application Is Running

### 🔄 Testing the Application

After fixing the property syntax and restarting Tomcat:

**1. Homepage loads:**
- Visit `http://localhost:8080/SpringMVCDemo/`
- The form appears — `index.jsp` is rendering!
- The full chain works: Tomcat → DispatcherServlet → HomeController → View Resolver → JSP

**2. Form submission works:**
- Enter ID: `121`
- Enter Name: `Navin`
- Click Submit
- The `result.jsp` page loads

The entire application is running without Spring Boot!

---

## 🧩 Concept 5: The EL Ignored Problem

### 🧠 What Happened?

The result page loaded, but the **values were blank**. The form data was submitted, the controller received it (via `@ModelAttribute`), and the data was passed to the view. But `${alien}` and `${course}` showed nothing — they weren't being evaluated.

### ❓ Why?

In some JSP configurations, **Expression Language (EL)** — the `${}` syntax — is **ignored by default**. The JSP engine treats `${alien}` as literal text instead of evaluating it as a variable.

### ⚙️ The Fix

Add the `isELIgnored` attribute to your JSP page directive:

```jsp
<%@ page isELIgnored="false" %>
```

**Before (not working):**
```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" %>
<html>
<body>
    <p>Alien: ${alien}</p>
    <p>Course: ${course}</p>
</body>
</html>
```

**After (working):**
```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" isELIgnored="false" %>
<html>
<body>
    <p>Alien: ${alien}</p>
    <p>Course: ${course}</p>
</body>
</html>
```

### 🧠 What is Expression Language (EL)?

Expression Language is the `${}` syntax in JSP that lets you access:
- Model attributes: `${alien}` — the Alien object from the Model
- Properties: `${alien.aname}` — calls `getAname()`
- Other scope variables

When `isELIgnored="true"` (or defaults to true in older servlet specs), the `${}` text is printed literally. Setting it to `"false"` forces the JSP engine to evaluate the expressions.

### 💡 Why This Didn't Happen in Spring Boot

Spring Boot's embedded Tomcat uses a modern servlet specification where EL is **enabled by default**. In standalone Tomcat with a manual `web.xml`, the behavior can default to ignoring EL depending on the servlet version declared in the deployment descriptor.

---

## 🧩 Concept 6: The Complete Request Flow — Everything Connected

### 🔄 Full Lifecycle of a Request

Now that everything works, let's trace a complete request from browser to response:

```
1. Browser sends GET /SpringMVCDemo/
                    ↓
2. Tomcat reads web.xml
   → Sees: all requests (/) go to DispatcherServlet
                    ↓
3. DispatcherServlet starts up
   → Reads telusko-servlet.xml
   → Component scan finds HomeController in com.telusko
   → View Resolver configured: prefix=/views/, suffix=.jsp
                    ↓
4. DispatcherServlet matches GET / to HomeController.home()
                    ↓
5. home() executes, returns "index"
                    ↓
6. View Resolver resolves: /views/index.jsp
                    ↓
7. JSP renders the form HTML
                    ↓
8. Browser displays the homepage
```

**Form submission flow:**
```
9.  User fills form, clicks Submit → POST /addAlien
                    ↓
10. DispatcherServlet matches to HomeController.addAlien()
                    ↓
11. @ModelAttribute binds form data to Alien object
    @ModelAttribute method adds "course" = "Java" to model
                    ↓
12. Controller returns "result"
                    ↓
13. View Resolver resolves: /views/result.jsp
                    ↓
14. JSP renders with ${alien} and ${course} (EL enabled)
                    ↓
15. Browser displays the result page with data
```

---

## 🧩 Concept 7: Spring Boot vs Raw Spring MVC — The Full Picture

### 📊 Everything We Configured Manually

| Configuration | Spring Boot | Raw Spring MVC |
|--------------|-------------|----------------|
| Project type | Spring Initializr | Maven webapp archetype |
| Server | Embedded Tomcat (auto) | External Tomcat (manual install + connect) |
| DispatcherServlet registration | Auto | `web.xml` — `<servlet>` + `<servlet-mapping>` |
| DispatcherServlet config file | Not needed | `telusko-servlet.xml` in `WEB-INF/` |
| Component scanning | `@SpringBootApplication` (auto) | `<ctx:component-scan>` in XML |
| Annotation processing | Auto | `<ctx:annotation-config>` in XML |
| View Resolver | 2 lines in `application.properties` | `<bean>` with `<property>` tags in XML |
| EL support | Enabled by default | May need `isELIgnored="false"` |
| Deployment | `java -jar app.jar` | Deploy `.war` to external Tomcat |
| Config files needed | 1 (`application.properties`) | 2 (`web.xml` + `telusko-servlet.xml`) |

### 💡 The Takeaway

Spring Boot isn't magic — it's automation. Everything Spring Boot does, we just did manually:
- Register DispatcherServlet ✅
- Configure component scanning ✅
- Set up View Resolver ✅

Now when someone says "Spring Boot auto-configures everything," you know exactly **what** it auto-configures and **how** it would look if done by hand.

---

## 🧩 Concept 8: The Files We Created/Modified

### 📁 Project Structure

```
SpringMVCDemo/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/telusko/
│       │       ├── HomeController.java       ← @Controller with mappings
│       │       └── Alien.java                ← Model class
│       └── webapp/
│           ├── views/
│           │   ├── index.jsp                 ← Form page
│           │   └── result.jsp                ← Result page (isELIgnored="false")
│           └── WEB-INF/
│               ├── web.xml                   ← DispatcherServlet registration
│               └── telusko-servlet.xml       ← Component scan + View Resolver
└── pom.xml                                   ← spring-webmvc dependency
```

### 📄 Configuration Files Summary

**web.xml** — Tells Tomcat about DispatcherServlet:
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

**telusko-servlet.xml** — Tells DispatcherServlet about controllers and views:
```xml
<ctx:component-scan base-package="com.telusko" />
<ctx:annotation-config />
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="prefix" value="/views/" />
    <property name="suffix" value=".jsp" />
</bean>
```

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. **InternalResourceViewResolver** is configured as a `<bean>` in `telusko-servlet.xml` with `prefix` and `suffix` properties.
2. The `<property>` tag uses the **`value` attribute** — don't put the value as element content.
3. The fully qualified class is `org.springframework.web.servlet.view.InternalResourceViewResolver` — find it in `spring-webmvc` → `view` package.
4. **`isELIgnored="false"`** must be added to JSP pages if Expression Language (`${}`) isn't evaluating — this forces the JSP engine to process EL expressions.
5. The complete Spring MVC configuration requires just **two XML files**: `web.xml` (for Tomcat) and `{servlet-name}-servlet.xml` (for DispatcherServlet).
6. Spring Boot automates **all** of this — DispatcherServlet registration, component scanning, annotation config, view resolver setup, and EL support.

### ⚠️ Common Mistakes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Wrong `<property>` syntax (value as text content) | XML parse error at that line | Use `<property name="..." value="..." />` |
| Missing `/` in prefix (`views/` instead of `/views/`) | 404 — wrong path resolution | Always include leading slash: `/views/` |
| Forgetting the dot in suffix (`jsp` instead of `.jsp`) | 404 — file not found | Include the dot: `.jsp` |
| EL expressions showing as literal text | `${alien}` prints on the page as text | Add `isELIgnored="false"` to the JSP page directive |
| Forgetting to restart Tomcat after XML changes | Old configuration still active | Always restart the server after modifying XML config files |

### 💡 Pro Tips

1. **Bean tags don't always need an `id`.** When Spring expects only one View Resolver, it auto-detects the bean by type. No `id` attribute needed.
2. **EL issues are specific to standalone Tomcat.** In Spring Boot's embedded Tomcat, EL is always enabled. If you ever move back to Spring Boot, you won't need `isELIgnored`.
3. **The `<property>` tag calls setter methods.** `name="prefix"` calls `setPrefix()`. `name="suffix"` calls `setSuffix()`. The XML is just a declarative way to call Java methods.
4. **This configuration is the foundation.** Every Spring MVC app (without Boot) starts with these same two XML files. Once you've done it once, you can reuse the template for any project.
