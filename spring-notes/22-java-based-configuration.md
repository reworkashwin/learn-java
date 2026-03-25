# ☕ Java-Based Configuration - Goodbye XML!

## Introduction

We've been configuring Spring with XML for a while now:

```xml
<!-- spring.xml -->
<beans>
    <bean id="laptop" class="com.telusko.app.Laptop" />
    <bean id="desktop" class="com.telusko.app.Desktop" />
    <bean id="alien" class="com.telusko.app.Alien">
        <property name="com" ref="laptop" />
    </bean>
</beans>
```

**XML configuration works perfectly!**

**But...**

**Not everyone is a fan of XML:**
- Verbose syntax
- No compile-time checking
- Separate from Java code
- Not type-safe
- IDE support varies

**The instructor says:**

> "A lot of people are not a big fan of XML, so they prefer to go for Java configuration."

**Think about it:**
- We're Java developers
- Writing Java is more natural
- Java is type-safe
- Java has compile-time validation
- IDEs understand Java better

**What if we could configure Spring using Java code?**

**We can!** ✨

Spring supports **Java-based configuration** using annotations and plain Java classes. Instead of XML files, you write configuration in Java classes using `@Configuration` and `@Bean` annotations.

**In this lesson, you'll learn:**
- Why move from XML to Java configuration
- Creating configuration classes with @Configuration
- Using AnnotationConfigApplicationContext instead of ClassPathXmlApplicationContext
- Defining beans with @Bean annotation methods
- How Spring manages objects even though you write "new"
- Getting beans by type with Java configuration
- The relationship between XML tags and Java annotations
- When to use XML vs Java configuration in real projects

Say goodbye to XML (if you want to)! ☕

---

## Concept 1: The XML vs Java Configuration Choice

### 🧠 Three configuration approaches in Spring

**The instructor introduces:**

> "We have one more way, which is the annotation-based configuration which we'll do later. But let's see how do you work with the Java based configuration."

**Spring supports THREE configuration approaches:**

1. **XML-based configuration** (what we've been doing)
2. **Java-based configuration** (this lesson!)
3. **Annotation-based configuration** (coming soon!)

**All three achieve the same goal - just different syntax!**

### 🧠 Current XML approach

**spring.xml:**
```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="...">

    <bean id="desktop" class="com.telusko.app.Desktop" />
    
    <bean id="laptop" class="com.telusko.app.Laptop" />
    
    <bean id="alien" class="com.telusko.app.Alien">
        <property name="age" value="21" />
        <property name="com" ref="laptop" />
    </bean>
</beans>
```

**App.java:**
```java
ApplicationContext context = 
    new ClassPathXmlApplicationContext("spring.xml");

Alien alien = context.getBean("alien", Alien.class);
alien.code();
```

**This works perfectly!**

### ❓ Why consider alternatives?

**Reasons developers prefer Java configuration:**

**1. Type safety**
```xml
<!-- XML - typos only caught at runtime -->
<bean id="desktop" class="com.telusko.app.Desktopp" />  <!-- ❌ Typo! -->
```
```java
// Java - typos caught at compile time
public Desktop desktop() {
    return new Desktopp();  // ❌ Won't compile!
}
```

**2. IDE support**
- Auto-completion works better
- Refactoring is safer
- Navigation is easier
- Syntax highlighting for Java

**3. Familiarity**
```java
// Java developers feel at home
public Desktop desktop() {
    return new Desktop();  // Looks like normal Java!
}
```

**4. Compile-time validation**
- Errors caught early
- No runtime surprises
- Type checking automatic

### 🧠 Real-world advice

**The instructor's important note:**

> "If you were happy with XML, continue with that. If you are not happy with XML, you can try out the Java based configuration. Sometimes you don't have a choice when you join a project. If they are using XML, you have to use XML. If they are using Java based configuration, you have to use Java based."

**Reality of project work:**
- Join existing projects → use their approach
- Start new projects → choose what fits
- Both approaches are valid
- Learn both for flexibility

**This lesson teaches Java configuration, but XML is still perfectly fine!**

---

## Concept 2: Creating a Configuration Class

### 🧠 Java configuration needs a Java class

**Instead of spring.xml, we'll create AppConfig.java!**

### ⚙️ Step 1: Create config package

**Project structure:**
```
src/main/java/
└── com/telusko/app/
    ├── Alien.java
    ├── Computer.java
    ├── Laptop.java
    ├── Desktop.java
    ├── App.java
    └── config/           ← New package!
        └── AppConfig.java ← New class!
```

**Why a separate package?**
- Organizes configuration separately from business logic
- Standard practice in Spring projects
- Makes configuration easy to find

### ⚙️ Step 2: Create AppConfig class

**Right-click on config package → New → Class**

**Name:** AppConfig

**AppConfig.java (initial):**
```java
package com.telusko.app.config;

public class AppConfig {
    // Configuration code will go here
}
```

**Just a plain Java class (for now)!**

### 🧠 What is this class for?

**The instructor explains:**

> "This is going to replace your XML configuration."

**Comparison:**

| XML Approach | Java Approach |
|--------------|---------------|
| spring.xml | AppConfig.java |
| XML tags | Java annotations |
| `<bean>` tags | `@Bean` methods |
| External file | Java code |

**AppConfig will do everything spring.xml did!**

### 💡 Naming conventions

**Common names for config classes:**
- AppConfig (we're using this)
- ApplicationConfiguration
- SpringConfig
- BeanConfiguration

**The instructor says:**

> "Again, name doesn't matter, you can give any name."

**Choose any name that makes sense for your project!**

---

## Concept 3: Switching to AnnotationConfigApplicationContext

### 🧠 Different context for Java configuration

**XML configuration uses:**
```java
ApplicationContext context = 
    new ClassPathXmlApplicationContext("spring.xml");
//      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ For XML files
```

**Java configuration uses:**
```java
ApplicationContext context = 
    new AnnotationConfigApplicationContext(AppConfig.class);
//      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ For Java classes
```

**Different container implementation, same interface!**

### ⚙️ Update App.java

**App.java (before - XML):**
```java
package com.telusko.app;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new ClassPathXmlApplicationContext("spring.xml");
        
        Alien alien = context.getBean("alien", Alien.class);
        alien.code();
    }
}
```

**App.java (after - Java config):**
```java
package com.telusko.app;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import com.telusko.app.config.AppConfig;

public class App {
    public static void main(String[] args) {
        // Using Java configuration!
        ApplicationContext context = 
            new AnnotationConfigApplicationContext(AppConfig.class);
        
        Desktop dt = context.getBean(Desktop.class);
        dt.compile();
    }
}
```

**Key changes:**

1. **Import changed:**
   ```java
   // Before
   import org.springframework.context.support.ClassPathXmlApplicationContext;
   
   // After
   import org.springframework.context.annotation.AnnotationConfigApplicationContext;
   ```

2. **Context creation changed:**
   ```java
   // Before
   new ClassPathXmlApplicationContext("spring.xml")
   
   // After
   new AnnotationConfigApplicationContext(AppConfig.class)
   ```

3. **Pass config class instead of XML filename:**
   ```java
   new AnnotationConfigApplicationContext(AppConfig.class);
   //                                      ^^^^^^^^^^^^^^^^^ Java class!
   ```

### 🧠 Same interface, different implementation

**The instructor emphasizes:**

> "In both the cases, even if you're using XML, even if you're using a Java based configuration, you are basically using the same container. But the way you talk to a container changes."

**Visual representation:**

```
┌─────────────────────────────────────┐
│    ApplicationContext (Interface)   │
│  - getBean()                        │
│  - Bean management                  │
│  - Dependency injection             │
└─────────────────────────────────────┘
         ▲                    ▲
         │                    │
         │                    │
┌────────┴─────────┐  ┌──────┴────────────────┐
│ ClassPathXml     │  │ AnnotationConfig      │
│ ApplicationContext│  │ ApplicationContext    │
│                  │  │                       │
│ - Reads XML      │  │ - Reads Java classes  │
│ - Parses tags    │  │ - Processes annotations│
└──────────────────┘  └───────────────────────┘
```

**Same functionality, different configuration source!**

---

## Concept 4: The @Configuration Annotation

### 🧠 Making a class a configuration class

**Try running the app now:**

**App.java:**
```java
ApplicationContext context = 
    new AnnotationConfigApplicationContext(AppConfig.class);

Desktop dt = context.getBean(Desktop.class);
dt.compile();
```

**AppConfig.java (still empty):**
```java
package com.telusko.app.config;

public class AppConfig {
    // Empty!
}
```

**Error:**
```
NoSuchBeanDefinitionException: No qualifying bean of type 'Desktop' available
```

**Why?**
- AppConfig is just a regular Java class
- Spring doesn't know it's a configuration class
- No beans are defined yet

### ⚙️ Add @Configuration annotation

**AppConfig.java:**
```java
package com.telusko.app.config;

import org.springframework.context.annotation.Configuration;

@Configuration  // This marks it as a configuration class!
public class AppConfig {
    // Configuration methods will go here
}
```

**The @Configuration annotation tells Spring:**
- "This class contains configuration"
- "Look for bean definitions here"
- "Process annotations in this class"

### 🧠 What @Configuration does

**Without @Configuration:**
```java
public class AppConfig {
    // Just a regular Java class
    // Spring ignores it
}
```

**With @Configuration:**
```java
@Configuration  // Spring processes this class!
public class AppConfig {
    // Spring looks for @Bean methods here
    // Spring manages beans defined here
}
```

**The instructor says:**

> "If you want to configure your application or if you want to configure with the help of Java based configuration, we have to mark your config class with annotation called @Configuration."

### 💡 XML equivalent

**XML approach:**
```xml
<beans>  <!-- This tag says "configuration starts here" -->
    <!-- Bean definitions -->
</beans>
```

**Java approach:**
```java
@Configuration  // This annotation says "configuration starts here"
public class AppConfig {
    // Bean definitions
}
```

**@Configuration is like the `<beans>` tag!**

---

## Concept 5: Defining Beans with @Bean Methods

### 🧠 Creating beans in Java

**In XML we wrote:**
```xml
<bean id="desktop" class="com.telusko.app.Desktop" />
```

**In Java we write:**
```java
@Bean
public Desktop desktop() {
    return new Desktop();
}
```

**A method that returns an object!**

### ⚙️ Complete configuration

**AppConfig.java:**
```java
package com.telusko.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import com.telusko.app.Desktop;

@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**Breaking this down:**

**1. @Bean annotation:**
```java
@Bean  // Tells Spring: "This method creates a bean"
```

**2. Return type:**
```java
public Desktop desktop()  // Bean type is Desktop
```

**3. Method name:**
```java
public Desktop desktop()  // Method name becomes bean name (by default)
```

**4. Method body:**
```java
return new Desktop();  // Create and return instance
```

### 🧪 Test it works

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Desktop dt = context.getBean(Desktop.class);
    dt.compile();
}
```

**Output:**
```
Compiling using Desktop
```

**It works!** ✅

**The instructor confirms:**

> "Let's go back here. Let's rerun and it works. You can see it says compiling using Desktop."

### 💡 XML to Java translation

**The conversion:**

**XML:**
```xml
<bean id="desktop" class="com.telusko.app.Desktop" />
```

**Becomes Java:**
```java
@Bean
public Desktop desktop() {
    return new Desktop();
}
```

**Side by side:**

| XML Attribute | Java Equivalent |
|---------------|-----------------|
| `<bean>` tag | `@Bean` annotation |
| `id="desktop"` | Method name: `desktop()` |
| `class="..."` | Return type: `Desktop` |
| Object creation | `return new Desktop()` |

---

## Concept 6: Understanding "Who Creates the Object?"

### 🧠 The confusion

**Looking at the code:**
```java
@Bean
public Desktop desktop() {
    return new Desktop();  // We're writing "new"!
}
```

**You might think:**
> "We're creating the object with 'new' keyword. Isn't that manual object creation?"

**The instructor addresses this:**

> "You will be saying, hey, you know, by using new keyword, we are getting the object. Now think about this. Yes, we are writing this code here, but then we are not injecting the object. Spring is injecting it."

**This is a crucial distinction!**

### 🧠 Who does what?

**What YOU do:**
```java
@Bean
public Desktop desktop() {
    return new Desktop();  // You write this code
}
```

**What SPRING does:**
1. **Calls your method** (you don't call it)
2. **Gets the returned object**
3. **Stores it in the container**
4. **Manages its lifecycle**
5. **Injects it where needed**
6. **Returns it from getBean() calls**

### 🧠 You write it, Spring executes it

**The instructor emphasizes:**

> "We are just writing this code. But all this thing will be created, injected and managed by Spring Framework. Who will call this particular method? Spring. Who will manage the object? Spring. We are not doing it."

**Comparison:**

**Manual object creation:**
```java
public static void main(String[] args) {
    Desktop dt = new Desktop();  // YOU create
    //           ^^^^^^^^^^^^^^ YOU manage
    dt.compile();  // YOU call
}
```

**Spring-managed object creation:**
```java
@Bean
public Desktop desktop() {
    return new Desktop();  // YOU write this
}

// But...
public static void main(String[] args) {
    Desktop dt = context.getBean(Desktop.class);  // SPRING creates
    //           ^^^^^^^^^^^^^^^^^^^^^^^^^^ SPRING manages
    dt.compile();  // YOU call
}
```

**You provide the recipe, Spring does the cooking!**

### 💡 The factory pattern

**This is essentially the factory pattern:**

```java
@Configuration
public class AppConfig {
    
    @Bean  // Factory method!
    public Desktop desktop() {
        return new Desktop();  // Factory creates object
    }
}
```

**Spring calls your factory methods when needed!**

### 🧠 Why this matters

**Benefits of Spring managing the object:**

1. **Singleton management**
   ```java
   Desktop d1 = context.getBean(Desktop.class);
   Desktop d2 = context.getBean(Desktop.class);
   // Spring ensures d1 == d2 (same instance)
   ```

2. **Dependency injection**
   ```java
   @Bean
   public Alien alien() {
       Alien a = new Alien();
       a.setCom(desktop());  // Spring handles the wiring
       return a;
   }
   ```

3. **Lifecycle management**
   - Spring calls init methods
   - Spring calls destroy methods
   - Spring manages scope

**You write instantiation logic, Spring handles everything else!**

---

## Concept 7: Getting Beans by Type

### 🧠 Current retrieval approach

**App.java:**
```java
Desktop dt = context.getBean(Desktop.class);
//                            ^^^^^^^^^^^^^^ By type only!
```

**No bean name specified!**

**The instructor explains:**

> "The approach which we have used here is we are looking for the desktop class. We are not specifying the name of a bean. We are looking for the type of the bean which is desktop."

### 🧠 Why by type works here

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {  // Only one Desktop bean
        return new Desktop();
    }
}
```

**There's only ONE bean of type Desktop!**

**Spring's search:**
1. Look for beans of type Desktop
2. Found one: desktop()
3. Return it!

**No ambiguity!**

### 🧠 What about bean names?

**The instructor mentions:**

> "What if you want to use a bean name? As of now you can see nowhere we have mentioned the bean name. So what is a bean name and how do we change it? Let's say that in the next video."

**Teaser for next lesson!**

**But by default:**
- Method name = bean name
- `desktop()` method → bean name is "desktop"

**You can verify:**
```java
Desktop dt = context.getBean("desktop", Desktop.class);
//                            ^^^^^^^^^^ Method name
```

**Also works!**

---

## Concept 8: Multiple Bean Definitions

### 🧠 Defining multiple beans

**Just like XML had multiple `<bean>` tags:**
```xml
<bean id="laptop" class="Laptop" />
<bean id="desktop" class="Desktop" />
<bean id="alien" class="Alien" />
```

**Java config has multiple @Bean methods:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Laptop laptop() {
        return new Laptop();
    }
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean
    public Alien alien() {
        return new Alien();
    }
}
```

**Each method creates one bean!**

### 🧪 Complete example

**AppConfig.java:**
```java
package com.telusko.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import com.telusko.app.Laptop;
import com.telusko.app.Desktop;
import com.telusko.app.Alien;

@Configuration
public class AppConfig {
    
    @Bean
    public Laptop laptop() {
        return new Laptop();
    }
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean
    public Alien alien() {
        Alien alien = new Alien();
        alien.setAge(21);
        alien.setCom(laptop());  // Dependency injection!
        return alien;
    }
}
```

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Laptop laptop = context.getBean(Laptop.class);
    laptop.compile();
    
    Desktop desktop = context.getBean(Desktop.class);
    desktop.compile();
    
    Alien alien = context.getBean(Alien.class);
    alien.code();
}
```

**Output:**
```
Compiling using Laptop
Compiling using Desktop
Coding...
Compiling using Laptop
```

**All beans working!**

---

## ✅ Key Takeaways

### About Java Configuration

1. **Three configuration approaches exist**
   - XML-based (what we learned before)
   - Java-based (this lesson)
   - Annotation-based (coming later)

2. **Java configuration uses regular Java classes**
   - Marked with @Configuration
   - Contains @Bean methods
   - Type-safe and compile-time checked

3. **Choose based on project and preference**
   - XML still valid
   - Java more type-safe
   - Often dictated by existing project

### About Configuration Classes

1. **@Configuration marks a class as configuration source**
   ```java
   @Configuration  // Required!
   public class AppConfig {
       // Bean definitions
   }
   ```

2. **Create in separate config package**
   ```
   com.telusko.app.config.AppConfig
   ```

3. **Name is flexible**
   - AppConfig (common)
   - ApplicationConfiguration
   - SpringConfig
   - BeanConfiguration

### About @Bean Methods

1. **@Bean annotation creates a bean**
   ```java
   @Bean
   public Desktop desktop() {
       return new Desktop();
   }
   ```

2. **Method name becomes bean name (by default)**
   ```java
   public Desktop desktop()  // Bean name: "desktop"
   ```

3. **Return type is bean type**
   ```java
   public Desktop desktop()  // Bean type: Desktop
   ```

### About Object Creation

1. **You write the instantiation code**
   ```java
   return new Desktop();  // You write this
   ```

2. **Spring manages the object**
   - Calls your method
   - Stores the object
   - Manages lifecycle
   - Handles injection

3. **Not manual object creation**
   - Spring controls when to create
   - Spring controls scope
   - Spring handles dependencies

### About Context Classes

1. **AnnotationConfigApplicationContext for Java config**
   ```java
   new AnnotationConfigApplicationContext(AppConfig.class);
   ```

2. **ClassPathXmlApplicationContext for XML config**
   ```java
   new ClassPathXmlApplicationContext("spring.xml");
   ```

3. **Both implement ApplicationContext**
   - Same interface
   - Same getBean() methods
   - Same functionality

---

## 💡 Final Insights

### XML vs Java Configuration Comparison

**Complete comparison:**

| Feature | XML Configuration | Java Configuration |
|---------|-------------------|-------------------|
| **Syntax** | XML tags | Java code |
| **Type safety** | Runtime only | Compile-time |
| **IDE support** | Varies | Excellent |
| **Refactoring** | Manual | Automatic |
| **Validation** | Runtime | Compile-time |
| **Learning curve** | XML syntax | Java knowledge sufficient |
| **Readability** | Verbose | Concise |
| **External** | Yes (separate file) | No (Java code) |

**Neither is "better" - choose what fits your project!**

### The Recipe Analogy

**Think of @Bean methods as recipes:**

**You write the recipe:**
```java
@Bean
public Desktop desktop() {
    Desktop d = new Desktop();
    d.setBrand("Dell");
    // Setup code
    return d;
}
```

**Spring is the chef:**
- Reads your recipe
- Follows it to create the object
- Stores the result
- Serves it when requested (getBean)
- Makes sure there's only one (singleton)

**You're the recipe author, Spring is the chef!**

### Evolution of Spring Configuration

**Historical progression:**

**2004-2008: XML era**
```xml
<bean id="desktop" class="Desktop" />
```
- Only option
- Verbose but powerful

**2009-2014: Java config emerges**
```java
@Configuration
@Bean
public Desktop desktop() { return new Desktop(); }
```
- Type-safe alternative
- Better tooling support

**2014-present: Annotation dominance**
```java
@Component
public class Desktop { }
```
- Minimal configuration
- Convention over configuration
- Spring Boot popularized this

**We're learning the progression!**

### Connection to Modern Spring Boot

**What we learned (Java config):**
```java
@Configuration
public class AppConfig {
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**Spring Boot (auto-configuration):**
```java
@SpringBootApplication  // Includes @Configuration!
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
        // Most beans auto-configured!
    }
}
```

**Spring Boot uses Java configuration under the hood!**

### When You'd Use Each Approach

**XML configuration:**
- ✅ Legacy projects
- ✅ External configuration needs
- ✅ Non-developers editing config
- ✅ Build-time bean switching

**Java configuration:**
- ✅ New projects
- ✅ Type safety required
- ✅ Complex bean creation logic
- ✅ Programmatic configuration

**Annotation configuration:**
- ✅ Spring Boot projects
- ✅ Rapid development
- ✅ Convention over configuration
- ✅ Minimal boilerplate

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Forgetting @Configuration

**Wrong:**
```java
public class AppConfig {  // ❌ No @Configuration!
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**Error:** Bean methods not processed, beans not created

**Correct:**
```java
@Configuration  // ✅ Required!
public class AppConfig {
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
}
```

### Mistake 2: Forgetting @Bean

**Wrong:**
```java
@Configuration
public class AppConfig {
    public Desktop desktop() {  // ❌ No @Bean!
        return new Desktop();
    }
}
```

**Result:** Method ignored, no bean created

**Correct:**
```java
@Configuration
public class AppConfig {
    @Bean  // ✅ Required!
    public Desktop desktop() {
        return new Desktop();
    }
}
```

### Mistake 3: Using wrong context class

**Wrong:**
```java
// Using XML context with Java config
ApplicationContext context = 
    new ClassPathXmlApplicationContext("AppConfig.class");  // ❌
```

**Error:** Trying to load Java class as XML file

**Correct:**
```java
ApplicationContext context = 
    new AnnotationConfigApplicationContext(AppConfig.class);  // ✅
```

### Mistake 4: Thinking you're creating objects manually

**Wrong thinking:**
```java
@Bean
public Desktop desktop() {
    return new Desktop();  // "I'm creating this manually"
}
```

**Correct understanding:**
```java
@Bean  // "I'm telling Spring HOW to create this"
public Desktop desktop() {
    return new Desktop();  // "Spring will call this and manage it"
}
```

---

## 🎯 Practice Exercises

### Exercise 1: Convert XML to Java config

Given this XML configuration:
```xml
<bean id="laptop" class="Laptop">
    <property name="brand" value="Dell" />
</bean>

<bean id="alien" class="Alien">
    <property name="age" value="25" />
    <property name="com" ref="laptop" />
</bean>
```

Convert to Java configuration.

### Exercise 2: Multiple beans

Create Java configuration for:
- 3 beans: UserService, OrderService, PaymentService
- Each should print a message in constructor
- Get all three and call their methods

### Exercise 3: Bean dependencies

Create:
- Car bean (depends on Engine)
- Engine bean
- Configure in Java config with proper dependency injection

### Exercise 4: Compare approaches

Create the SAME configuration in:
a) XML
b) Java config

Compare readability, type-safety, and ease of refactoring.

---

## 🔗 Quick Summary

**Java-based configuration: Spring configured with Java classes**

**Key annotations:**
```java
@Configuration  // Marks class as config source
@Bean          // Marks method as bean factory
```

**Basic pattern:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();  // Spring calls this
    }
}
```

**Using the configuration:**
```java
ApplicationContext context = 
    new AnnotationConfigApplicationContext(AppConfig.class);

Desktop dt = context.getBean(Desktop.class);
```

**XML equivalent:**
```xml
<!-- XML: -->
<bean id="desktop" class="Desktop" />

<!-- Java: -->
@Bean
public Desktop desktop() { return new Desktop(); }
```

**Next topic:** Bean names and customizing bean identifiers! 🎊
