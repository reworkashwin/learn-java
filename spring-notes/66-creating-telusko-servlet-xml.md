# 📄 Creating the telusko-servlet.xml Configuration File

## 🎯 Introduction

In the previous lesson, we registered the DispatcherServlet in `web.xml` and told Tomcat to route all requests through it. But DispatcherServlet responded with a **500 error** — it couldn't find its configuration file: `telusko-servlet.xml`.

Now it's time to create that file and give DispatcherServlet the information it needs: **where to find controllers** and **that we're using annotations**. This is the file where you "talk" to the DispatcherServlet.

In this lesson, we'll:
- Understand the naming convention for the servlet XML file
- Create `telusko-servlet.xml` in the correct location
- Add XML namespace definitions for Spring tags
- Configure **component scanning** and **annotation-based configuration**
- Watch the error change from 500 to 404 — and understand why we still need a View Resolver

---

## 🧩 Concept 1: The Filename Convention — Why "telusko-servlet.xml"?

### 🧠 Where Does the Name Come From?

The DispatcherServlet automatically looks for a configuration file named:

```
{servlet-name}-servlet.xml
```

The `{servlet-name}` is whatever you put in the `<servlet-name>` tag in `web.xml`:

```xml
<servlet>
    <servlet-name>telusko</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
</servlet>
```

Since we named our servlet `"telusko"`, it expects: **`telusko-servlet.xml`**

### 🔄 Different Names, Different Files

| `<servlet-name>` | Expected File |
|---|---|
| `telusko` | `telusko-servlet.xml` |
| `dispatcher` | `dispatcher-servlet.xml` |
| `myApp` | `myApp-servlet.xml` |
| `t1` | `t1-servlet.xml` |

This is a **Spring convention**, not something you configure — the DispatcherServlet derives the filename automatically from its own servlet name.

### 📁 Where Does It Go?

The file must be placed in:

```
src/main/webapp/WEB-INF/telusko-servlet.xml
```

Spring looks for it inside `WEB-INF/` — the same directory where `web.xml` lives. The project structure now looks like:

```
src/
└── main/
    └── webapp/
        └── WEB-INF/
            ├── web.xml                  ← Tomcat's config (already done)
            └── telusko-servlet.xml      ← DispatcherServlet's config (creating now)
```

---

## 🧩 Concept 2: Two Ways to Configure DispatcherServlet

### 🧠 XML vs Java-Based Configuration

There are two approaches to configure the DispatcherServlet:

1. **XML-based configuration** — Using `telusko-servlet.xml` (what we're doing)
2. **Java-based configuration** — Using `@Configuration` classes with annotations

We're using the XML approach here to **understand what happens behind the scenes**. In modern projects, Java-based configuration is more common, but XML helps you see the moving parts clearly.

### 💡 Why XML First?

When you understand the XML configuration, you understand exactly what Spring is doing. Java-based configuration does the same thing — it just uses annotations instead of tags. The knowledge transfers directly.

---

## 🧩 Concept 3: What Does DispatcherServlet Need to Know?

### 🧠 The Two Things

Think about what the DispatcherServlet needs to do its job:

1. **"Where are the controllers?"** — Which Java package contains the `@Controller` classes?
2. **"Are you using annotations?"** — Should I look for `@RequestMapping`, `@Controller`, etc.?

In plain English, we want to say:

```
Hey DispatcherServlet,
1. Find the classes in the package "com.telusko"
2. I'm using annotations

Signed, Developer
```

But this is an XML file, not an essay. We need to express these two things using proper XML tags.

### 🎯 Analogy

Remember the receptionist analogy? We hired the receptionist (registered DispatcherServlet). Now we're handing them the employee directory:

- *"All employees sit on the `com.telusko` floor"* — component scanning
- *"They have name badges (annotations) — use those to identify them"* — annotation config

---

## 🧩 Concept 4: XML Namespace Definitions — The "Header" of the File

### 🧠 Why Do We Need Namespace Definitions?

In XML, before you use custom tags like `<ctx:component-scan>`, you need to **declare** those tags — tell the XML parser where they come from and what they mean.

This is like importing packages in Java. You can't use `ArrayList` without `import java.util.ArrayList`. Similarly, you can't use `<ctx:component-scan>` without declaring the `ctx` namespace.

### 🧪 The Bean Definition Header

The namespace definitions are lengthy and repetitive, so you typically copy them from the Spring documentation or a reference file:

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

    <!-- Configuration goes here -->

</beans>
```

### 🔍 Breaking Down the Namespaces

| Namespace | Prefix | Purpose |
|-----------|--------|---------|
| `beans` | (default) | Core Spring bean definitions |
| `context` | `ctx` | Component scanning, annotation config |

- **`xmlns`** = "XML Namespace" — declares the default namespace for beans
- **`xmlns:ctx`** = Assigns the shorthand `ctx` to the Spring context namespace
- **`xsi:schemaLocation`** = Tells the XML parser where to find the schema definitions for validation

Don't memorize this! You'll copy it once and reuse it across projects.

---

## 🧩 Concept 5: Component Scanning — "Find My Controllers"

### 🧠 What is Component Scanning?

Component scanning tells Spring: *"Go look in this package (and its sub-packages) and find all classes annotated with `@Component`, `@Controller`, `@Service`, `@Repository`, etc."*

Without component scanning, Spring has no idea your `HomeController` exists — even if it has `@Controller` on it. The annotation is just a label. Someone needs to read the label.

### ⚙️ The Tag

```xml
<ctx:component-scan base-package="com.telusko" />
```

- **`ctx:`** — Refers to the context namespace we defined in the header
- **`component-scan`** — The tag that triggers package scanning
- **`base-package="com.telusko"`** — The root package to scan

### 🧠 How Specific Should the Package Be?

You can be broad or specific:

```xml
<!-- Broad: scans everything under com.telusko -->
<ctx:component-scan base-package="com.telusko" />

<!-- Specific: only scans the controller sub-package -->
<ctx:component-scan base-package="com.telusko.controller" />
```

Using `com.telusko` works perfectly — Spring will recursively scan all sub-packages:
- `com.telusko.controller` — finds controllers
- `com.telusko.service` — finds services
- `com.telusko.model` — finds models (if annotated)

### 💡 This Is What Spring Boot Auto-Configures

In Spring Boot, when your main class sits in `com.telusko`, the `@SpringBootApplication` annotation automatically triggers component scanning from that package. Now you're doing manually what Spring Boot did for free.

---

## 🧩 Concept 6: Annotation Configuration — "I'm Using Annotations"

### 🧠 What Does This Do?

```xml
<ctx:annotation-config />
```

This tag tells Spring: *"Enable support for annotation-based configuration."* It activates processors for annotations like:

- `@Controller`
- `@RequestMapping`
- `@Autowired`
- `@ModelAttribute`
- And others

### ❓ Do We Really Need Both?

Technically, `<ctx:component-scan>` already implies `<ctx:annotation-config>` — component scanning automatically enables annotation processing. But it's good practice to include both explicitly so the intent is clear:

```xml
<!-- "Find annotated classes in this package" -->
<ctx:component-scan base-package="com.telusko" />

<!-- "Process the annotations you find" -->
<ctx:annotation-config />
```

Think of it as belt and suspenders — redundant but safe.

---

## 🧩 Concept 7: The Complete telusko-servlet.xml

### 🧪 The Full File

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

</beans>
```

That's it — just two lines of actual configuration (plus the namespace boilerplate). Two lines that tell DispatcherServlet everything it needs... almost.

---

## 🧩 Concept 8: Testing — The Error Changes Again

### 🔄 Running the Application

After creating `telusko-servlet.xml`, restart Tomcat and refresh the browser.

**What happens?**

The 500 error is gone! In the Eclipse console, you can see:

```
home method called
```

This means:
- ✅ Tomcat received the request
- ✅ Tomcat forwarded it to DispatcherServlet
- ✅ DispatcherServlet found `telusko-servlet.xml` and read it
- ✅ DispatcherServlet scanned `com.telusko` and found `HomeController`
- ✅ DispatcherServlet matched the `/` request to the `home()` method
- ✅ The `home()` method executed and returned `"index"`

**But...** we still get an error. This time it's a **404**:

```
No endpoint GET /index
```

### 🧠 What's Going Wrong Now?

The controller returned `"index"`. DispatcherServlet says: *"Okay, you want me to show 'index'. But what is 'index'? Is it a file? Where is it? What extension does it have?"*

In Spring Boot, we configured this in `application.properties`:

```properties
spring.mvc.view.prefix=/views/
spring.mvc.view.suffix=.jsp
```

This told the View Resolver: *"`index` means `/views/index.jsp`."*

We haven't done anything like that in this project. DispatcherServlet looks for `index` literally and can't find it.

---

## 🧩 Concept 9: The Missing Piece — InternalResourceViewResolver

### 🧠 What is a View Resolver?

When a controller returns a string like `"index"`, something needs to **resolve** that string into an actual file path. That something is the **View Resolver**.

The full class name is:

```
org.springframework.web.servlet.view.InternalResourceViewResolver
```

In Spring Boot, this was auto-configured. In raw Spring MVC, we need to manually create and configure this bean in our servlet XML.

### 🔄 What the View Resolver Does

```
Controller returns: "index"
         ↓
View Resolver applies: prefix + "index" + suffix
         ↓
Result: /views/index.jsp
         ↓
DispatcherServlet renders that JSP
```

### 🎯 The Configuration Chain Is Almost Complete

```
✅ web.xml           → Tomcat sends requests to DispatcherServlet
✅ telusko-servlet.xml → DispatcherServlet finds controllers via component scan
❌ View Resolver       → Not configured yet — DispatcherServlet can't resolve view names
```

We'll configure the `InternalResourceViewResolver` as a bean in `telusko-servlet.xml` in the next lesson.

---

## 🧩 Concept 10: Comparing with Spring Boot — What We've Had to Do Manually

### 📊 The Manual Configuration Checklist

| What | Spring Boot | Raw Spring MVC |
|------|-------------|----------------|
| Register DispatcherServlet | Auto (embedded Tomcat) | Manual (`web.xml`) |
| Servlet name and URL mapping | Auto (`/`) | Manual (`<servlet>` + `<servlet-mapping>`) |
| Create config file | Auto (in-memory) | Manual (`telusko-servlet.xml`) |
| Component scanning | Auto (from `@SpringBootApplication` package) | Manual (`<ctx:component-scan>`) |
| Annotation processing | Auto | Manual (`<ctx:annotation-config>`) |
| View Resolver | `application.properties` | Manual (bean definition — next lesson) |

In Spring Boot, **zero XML files** were needed. In raw Spring MVC, we've written two XML files and we're not even done yet. This is exactly what "auto-configuration" means in Spring Boot — it does all of this behind the scenes.

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. The DispatcherServlet config file is named **`{servlet-name}-servlet.xml`** — derived from the servlet name in `web.xml`.
2. The file goes in **`WEB-INF/`**, the same directory as `web.xml`.
3. XML namespace declarations are boilerplate — copy them once, reuse everywhere.
4. **`<ctx:component-scan base-package="com.telusko" />`** tells Spring to scan that package for annotated classes like `@Controller`.
5. **`<ctx:annotation-config />`** enables annotation processing (`@Controller`, `@RequestMapping`, `@Autowired`, etc.).
6. After adding the config file, the controller **does get called** — the console shows "home method called".
7. The remaining 404 error is because **no View Resolver** is configured — DispatcherServlet doesn't know how to map `"index"` to `/views/index.jsp`.
8. The next piece needed is the **`InternalResourceViewResolver`** bean.

### ⚠️ Common Mistakes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| File not in `WEB-INF/` | 500 error — can't find config file | Place it directly inside `webapp/WEB-INF/` |
| Wrong filename (doesn't match servlet-name) | 500 error — same as missing file | Ensure filename is `{servlet-name}-servlet.xml` |
| Missing namespace declarations | XML parsing error — unknown tags | Include full `xmlns` definitions for `beans` and `context` |
| Wrong base-package name | Controllers not found — 404 on all endpoints | Use the actual root package of your project |
| Forgetting `ctx:` prefix on tags | XML error — unrecognized element | Use the prefix defined in `xmlns:ctx` |

### 💡 Pro Tips

1. **The `ctx` prefix is just a convention.** You could name it `context`, `c`, or anything — just match the declaration (`xmlns:ctx`) with usage (`<ctx:component-scan>`).
2. **Component scan is recursive.** Specifying `com.telusko` will also find classes in `com.telusko.controller`, `com.telusko.service`, etc. No need to list sub-packages individually.
3. **Watch the console, not just the browser.** The `System.out.println("home method called")` in the controller confirmed the controller was executing — the error was downstream in view resolution, not in routing.
4. **Every error change is progress.** 500 → 404 with "home method called" in the console means two layers are now working. Debugging is about isolating which layer is failing.
