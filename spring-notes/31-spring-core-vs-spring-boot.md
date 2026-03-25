# 🔄 Spring Core vs Spring Boot - The Big Picture

## Introduction

**We've come so far!** 🎉

**Documents 1-30 covered:**
- XML configuration (Documents 1-21)
- Java-based configuration (Documents 22-26)
- Component scanning (Documents 27-30)
- @Component, @Autowired, @Primary, @Qualifier
- @Scope, @Value
- Bean management, dependency injection, disambiguation

**We built everything from scratch in Spring Core!**

**But remember where we started?**

**The instructor reminds us:**

> "But we started our journey with Spring Boot. Remember?"

**Wait... Spring Boot?** 🤔

**The revelation:**

> "Let me show you the code, what we have done in Spring Boot. So this was our Spring Boot project and here we have done almost the same thing. We got the Alien class, we got the Laptop class, and in the Alien class, basically we wanted the object for Laptop."

**And it just worked!**

**The mystery:**

> "Now, one thing to remember is in this particular Spring Boot, if you see the project structure, look at the number of configuration. We have done nothing. There is no configuration, no Java based configuration, no XML. And still the things are working out."

**Today's big reveal:** 🎭

Spring Boot has been doing ALL the configuration work behind the scenes! The @SpringBootApplication annotation contains all the magic we've been learning to do manually!

**In this lesson, you'll learn:**
- Comparing Spring Core vs Spring Boot projects
- Why Spring Boot needs no explicit configuration
- The @SpringBootApplication annotation magic
- How component scanning happens automatically in Spring Boot
- Spring Boot's "opinionated" approach
- What SpringApplication.run() does behind the scenes
- What Spring Core features we'll add to Spring Boot project
- Setting up for advanced Spring Boot development
- The journey: manual learning → automatic understanding
- Why learning Spring Core first matters

Get ready to see the full picture! 🔄

---

## Concept 1: The Spring Core Journey Recap

### 🧠 What we've built (Documents 1-30)

**Phase 1: XML Configuration (Docs 1-21)**

**Application.xml:**
```xml
<beans>
    <bean id="laptop" class="com.telusko.app.Laptop" />
    <bean id="alien" class="com.telusko.app.Alien">
        <property name="age" value="25" />
        <property name="com" ref="laptop" />
    </bean>
</beans>
```

**App.java:**
```java
public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new ClassPathXmlApplicationContext("spring.xml");
        
        Alien alien = (Alien) context.getBean("alien");
        alien.code();
    }
}
```

**What we learned:**
- Spring container concept
- Bean definitions
- Dependency injection
- Property injection
- Bean scope
- Lazy initialization
- Inner beans

---

**Phase 2: Java-Based Configuration (Docs 22-26)**

**AppConfig.java:**
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
    @Primary
    public Alien alien(@Qualifier("laptop") Computer com) {
        Alien obj = new Alien();
        obj.setAge(25);
        obj.setCom(com);
        return obj;
    }
}
```

**App.java:**
```java
public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new AnnotationConfigApplicationContext(AppConfig.class);
        
        Alien alien = context.getBean(Alien.class);
        alien.code();
    }
}
```

**What we learned:**
- @Configuration classes
- @Bean methods
- Type-safe configuration
- Method parameters for injection
- @Primary and @Qualifier in Java config
- @Scope annotations

---

**Phase 3: Component Scanning (Docs 27-30)**

**AppConfig.java:**
```java
@Configuration
@ComponentScan(basePackages = "com.telusko")
public class AppConfig {
    // Empty - Spring finds @Component classes!
}
```

**Desktop.java:**
```java
@Component
@Scope("prototype")
public class Desktop implements Computer {
    public void compile() {
        System.out.println("Compiling using Desktop");
    }
}
```

**Laptop.java:**
```java
@Component
@Primary
public class Laptop implements Computer {
    public void compile() {
        System.out.println("Compiling using Laptop");
    }
}
```

**Alien.java:**
```java
@Component
public class Alien {
    
    @Value("25")
    private int age;
    
    @Autowired
    @Qualifier("laptop")
    private Computer com;
    
    public void code() {
        com.compile();
    }
}
```

**App.java (still needed!):**
```java
public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new AnnotationConfigApplicationContext(AppConfig.class);
        
        Alien alien = context.getBean(Alien.class);
        System.out.println(alien.getAge());
        alien.code();
    }
}
```

**What we learned:**
- @Component stereotype annotation
- Automatic bean detection
- @ComponentScan configuration
- @Autowired for dependency injection
- @Primary and @Qualifier for disambiguation
- @Scope for bean lifecycle
- @Value for value injection

**We manually configured EVERYTHING!**

---

## Concept 2: The Spring Boot Project

### 🧠 What Spring Boot looks like

**The instructor shows:**

> "So this was our Spring Boot project and here we have done the almost same thing. We got the Alien class, we got the Laptop class, and in the Alien class, basically we wanted the object for Laptop, right? And then we were able to combine them or we were able to wire them with the help of @Autowired."

**Spring Boot project structure:**

```
src/main/java/com/telusko/springbootdemo/
├── SpringBootDemoApplication.java  ← Main entry point
├── Alien.java
└── Laptop.java
```

**SpringBootDemoApplication.java:**
```java
package com.telusko.springbootdemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication  // The magic annotation!
public class SpringBootDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootDemoApplication.class, args);
        
        // Get bean and use it...
    }
}
```

**Alien.java:**
```java
package com.telusko.springbootdemo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    
    @Autowired
    private Laptop laptop;
    
    public void code() {
        System.out.println("Coding...");
        laptop.compile();
    }
}
```

**Laptop.java:**
```java
package com.telusko.springbootdemo;

import org.springframework.stereotype.Component;

@Component
public class Laptop {
    public void compile() {
        System.out.println("Compiling using Laptop");
    }
}
```

**That's it!** ✅

**No AppConfig.java!**
**No @Configuration!**
**No @ComponentScan!**
**No manual context creation!**

### 🧠 The shocking realization

**The instructor emphasizes:**

> "Now, one thing to remember is in this particular Spring Boot, if you see the project structure, look at the number of configuration. We have done nothing. There is no configuration, no Java based configuration, no XML. And still the things are working out."

**Spring Core required:**
```java
@Configuration          // Manual
@ComponentScan(...)     // Manual
new AnnotationConfigApplicationContext(AppConfig.class);  // Manual
```

**Spring Boot requires:**
```java
@SpringBootApplication  // Automatic!
SpringApplication.run(...)  // Automatic!
```

**Everything else happens automatically!** ✨

---

## Concept 3: The @SpringBootApplication Magic

### 🧠 What is @SpringBootApplication?

**The instructor explains:**

> "You know why? Because of this one annotation here. The moment you say this is a Spring Boot application, with that annotation which we use there, it means that we are using a Spring Boot project."

**The single magic annotation:**
```java
@SpringBootApplication
public class SpringBootDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringBootDemoApplication.class, args);
    }
}
```

**What does @SpringBootApplication do?**

### 💡 @SpringBootApplication is actually THREE annotations!

**Under the hood:**
```java
@SpringBootApplication
// Is equivalent to:

@SpringBootConfiguration  // Same as @Configuration
@EnableAutoConfiguration  // Spring Boot magic
@ComponentScan            // Automatic component scanning!
```

**Let's break them down:**

---

**1. @SpringBootConfiguration**

```java
@SpringBootConfiguration
// Marks this class as configuration source
// Same as @Configuration from Spring Core
```

**What we did manually:**
```java
@Configuration  // Had to write this!
public class AppConfig { ... }
```

**Spring Boot does automatically:**
```java
@SpringBootApplication  // Includes @Configuration!
public class SpringBootDemoApplication { ... }
```

---

**2. @EnableAutoConfiguration**

```java
@EnableAutoConfiguration
// Automatically configures Spring based on dependencies
// Sees what's in classpath and configures automatically
```

**Examples:**
- Found spring-web dependency? → Configure web server
- Found H2 database? → Configure in-memory database
- Found Thymeleaf? → Configure template engine
- Found JPA? → Configure entity manager

**This is Spring Boot's "opinionated" approach!**

---

**3. @ComponentScan**

```java
@ComponentScan
// Scans for @Component classes
// Default: package of @SpringBootApplication class
```

**What we did manually:**
```java
@ComponentScan(basePackages = "com.telusko")  // Explicit!
```

**Spring Boot does automatically:**
```java
@SpringBootApplication  // Scans current package automatically!
```

---

### 🧠 Automatic component scanning

**The instructor explains:**

> "So Spring Boot has some opinionated way of working. What it will do is it will see this and it will say, 'Okay, this is Spring Boot Project. I have to basically search the components in the same package' and that's what it's doing."

**How it works:**

**Main class location:**
```
com.telusko.springbootdemo/
└── SpringBootDemoApplication.java  ← @SpringBootApplication here
```

**Automatic scan scope:**
```
com.telusko.springbootdemo/         ← Scanned!
├── SpringBootDemoApplication.java
├── Alien.java                      ← Found @Component!
├── Laptop.java                     ← Found @Component!
└── service/                        ← Scanned!
    └── UserService.java            ← Found @Component!
```

**Rule: Same package AND sub-packages** ✅

**Not scanned:**
```
com.other.package/                  ← Different package
└── OtherComponent.java             ← NOT scanned!
```

**Spring Boot only scans from @SpringBootApplication package downward!**

### 💡 Package structure matters!

**Good structure (scanned):**
```
com.telusko.app/
├── SpringBootDemoApplication.java  ← @SpringBootApplication
├── model/
│   ├── Alien.java                  ← ✅ Scanned
│   └── Laptop.java                 ← ✅ Scanned
├── service/
│   └── AlienService.java           ← ✅ Scanned
└── controller/
    └── AlienController.java        ← ✅ Scanned
```

**Bad structure (not scanned):**
```
com.telusko/
├── SpringBootDemoApplication.java  ← @SpringBootApplication
└── model/
    ├── Alien.java                  ← ✅ Scanned

com.other/                          ← Different root!
└── service/
    └── AlienService.java           ← ❌ NOT scanned!
```

**Keep everything under the main package!**

---

## Concept 4: SpringApplication.run() Magic

### 🧠 What does this method do?

**The instructor explains:**

> "Plus this one method does some extra work for you. It runs the container. It also knows which is the main file for your Spring Boot. And everything is happening behind the scenes."

**The magical line:**
```java
SpringApplication.run(SpringBootDemoApplication.class, args);
```

**What happens behind the scenes:**

**Step 1: Create ApplicationContext**
```java
// Spring Boot does this automatically:
ApplicationContext context = ...;  // Created!
```

**What we did manually in Spring Core:**
```java
ApplicationContext context = 
    new AnnotationConfigApplicationContext(AppConfig.class);
```

**Spring Boot: Automatic!** ✅

---

**Step 2: Scan for components**
```java
// Spring Boot scans automatically:
// - Finds @Component classes
// - Creates beans
// - Wires dependencies
```

**What we configured manually:**
```java
@ComponentScan(basePackages = "com.telusko")
```

**Spring Boot: Automatic!** ✅

---

**Step 3: Perform auto-configuration**
```java
// Spring Boot configures based on classpath:
// - Web server (if spring-web present)
// - Database connection (if database driver present)
// - Template engine (if thymeleaf/freemarker present)
// - Metrics, security, etc.
```

**What we configured manually:**
```java
@Bean
public DataSource dataSource() { ... }

@Bean
public EntityManager entityManager() { ... }

// Hundreds of lines of configuration!
```

**Spring Boot: Automatic!** ✅

---

**Step 4: Start embedded server (if web app)**
```java
// Spring Boot starts Tomcat/Jetty/Undertow
// Listens on port 8080 (default)
// Deploys application
```

**What we did manually:**
```java
// Install Tomcat
// Configure server.xml
// Deploy WAR file
// Start Tomcat
```

**Spring Boot: Automatic!** ✅

---

**Step 5: Run application**
```java
// Application is now running!
// Container is up
// Beans are ready
// Server is listening (if web)
```

**All with ONE method call!**

```java
SpringApplication.run(SpringBootDemoApplication.class, args);
```

**Spring Boot handles everything!** 🚀

---

## Concept 5: The Hidden Complexity

### 🧠 What Spring Boot hides

**The instructor reveals:**

> "So whatever we have done, or whatever confusion we have done in our Spring Core project is happening here behind the scene."

**What Spring Core taught us explicitly:**

| Concept | Spring Core (Explicit) | Spring Boot (Hidden) |
|---------|------------------------|----------------------|
| Bean creation | `@Bean` methods or `<bean>` tags | Automatic with `@Component` |
| Component scanning | `@ComponentScan(...)` | Automatic from main class |
| Context creation | `new AnnotationConfigApplicationContext(...)` | `SpringApplication.run()` |
| Dependency injection | Manual wiring in config | Automatic with `@Autowired` |
| Auto-configuration | Manual `@Bean` for everything | `@EnableAutoConfiguration` |
| Server setup | Manual Tomcat installation | Embedded server automatic |

**Spring Boot: "Convention over Configuration"** 📐

**The instructor's key point:**

> "So whatever we have done, or whatever confusion we have done in our Spring Core project is happening here behind the scene."

**All the learning from Documents 1-30 is happening automatically in Spring Boot!**

**Why learn Spring Core then?** 🤔

**Understanding!**
- Know what's happening behind the scenes
- Debug issues when things go wrong
- Customize when defaults don't fit
- Appreciate Spring Boot's magic
- Make informed architectural decisions

**Spring Boot is Spring Core with sensible defaults!**

---

## Concept 6: What's Missing in Spring Boot Project

### 🧠 Comparing the projects

**The instructor points out:**

> "But then in your Spring Core project, we have done something more right? We have worked with two classes for the computer. In fact, there is no Computer interface here and we have two classes Laptop and Desktop."

**Spring Core project has:**
```java
public interface Computer {
    void compile();
}

@Component
public class Desktop implements Computer { ... }

@Component
public class Laptop implements Computer { ... }

@Component
public class Alien {
    @Autowired
    @Qualifier("laptop")  // Resolve ambiguity
    private Computer com;
}
```

**Spring Boot project currently has:**
```java
// No Computer interface!

@Component
public class Laptop {
    public void compile() { ... }
}

@Component
public class Alien {
    @Autowired
    private Laptop laptop;  // Concrete class, not interface
}
```

**Missing:**
- Computer interface
- Desktop class
- @Primary annotation usage
- @Qualifier annotation usage
- Interface-based programming

---

### 🧠 Missing variables and configuration

**The instructor continues:**

> "Apart from this we have some variable as well. So apart from Laptop we also need a variable for age. And maybe I want to have a status for that. I want to make this private."

**Spring Core Alien has:**
```java
@Component
public class Alien {
    @Value("25")
    private int age;
    
    @Value("true")
    private boolean status;
    
    @Autowired
    @Qualifier("laptop")
    private Computer com;
    
    // Full implementation with multiple fields
}
```

**Spring Boot Alien currently has:**
```java
@Component
public class Alien {
    @Autowired
    private Laptop laptop;
    
    // No age!
    // No status!
    // No other configuration!
}
```

**Missing:**
- Age variable
- Status variable
- @Value annotations
- Additional configuration

---

### 🧠 What we'll add next

**The instructor sets up the plan:**

> "So all these things are not done in this project. So we'll do that in the upcoming videos. We want Desktop class as well. So let's do that in the next video."

**Upcoming enhancements:**
1. Create Computer interface
2. Add Desktop class (alongside Laptop)
3. Use @Primary for default implementation
4. Use @Qualifier for explicit selection
5. Add age and status variables
6. Use @Value for configuration
7. Demonstrate all Spring Core concepts in Spring Boot

**Goal: Make Spring Boot project as complete as Spring Core project!** 🎯

---

## Concept 7: The Learning Journey

### 🧠 Why we learned Spring Core first

**The journey:**

```
Spring Boot (Beginning)
    ↓
    "This is magic! But how does it work?"
    ↓
Spring Core (Documents 1-30)
    ↓
    "Now I understand every detail!"
    ↓
Back to Spring Boot
    ↓
    "Now I understand what's happening behind the scenes!"
```

**Phase 1: Spring Boot (mysterious magic)** 🎩
```java
@SpringBootApplication
public class App { ... }

// It just works! But why?
```

**Phase 2: Spring Core (explicit learning)** 📚
```java
@Configuration
@ComponentScan(basePackages = "com.telusko")
public class AppConfig { ... }

ApplicationContext context = 
    new AnnotationConfigApplicationContext(AppConfig.class);

// Now I understand EVERYTHING!
```

**Phase 3: Spring Boot (informed understanding)** 🎓
```java
@SpringBootApplication  // Ah! This is @Configuration + @ComponentScan + @EnableAutoConfiguration!
public class App { ... }

SpringApplication.run(...)  // Ah! This creates the ApplicationContext!

// Now I know what's happening behind the scenes!
```

**From mystery → understanding → mastery!** 🚀

---

### 💡 The Spring Boot advantage

**What Spring Boot gives us:**

**1. Rapid development** ⚡
```java
// One annotation, and you're done!
@SpringBootApplication
```

**2. Sensible defaults** 🎯
```java
// No configuration needed for common cases
// Just works out of the box
```

**3. Production-ready features** 🏭
```java
// Metrics, health checks, externalized config
// All built-in!
```

**4. Embedded server** 🖥️
```java
// No Tomcat installation needed
// Just run: java -jar app.jar
```

**5. Dependency management** 📦
```java
// spring-boot-starter-web brings everything
// All compatible versions
```

**But we can still customize everything we learned in Spring Core!**

---

## ✅ Key Takeaways

### About Spring Core Learning

1. **We learned everything explicitly**
   - XML configuration
   - Java configuration
   - Component scanning
   - Dependency injection
   - Bean scopes
   - Value injection

2. **Manual configuration gave us understanding**
   - How beans are created
   - How dependencies are wired
   - How container works
   - How to solve problems

3. **This knowledge is essential**
   - Debugging Spring Boot issues
   - Customizing auto-configuration
   - Understanding error messages
   - Making architectural decisions

### About Spring Boot Magic

1. **@SpringBootApplication combines three annotations**
   ```java
   @SpringBootConfiguration    // @Configuration
   @EnableAutoConfiguration    // Auto-config
   @ComponentScan             // Component scanning
   ```

2. **SpringApplication.run() does everything**
   - Creates ApplicationContext
   - Scans for components
   - Performs auto-configuration
   - Starts embedded server
   - Runs application

3. **Convention over configuration**
   - Sensible defaults for everything
   - Works out of the box
   - Customize only when needed

### About Component Scanning in Spring Boot

1. **Automatic from main class package**
   ```java
   @SpringBootApplication
   public class App { }  // Scans from here down
   ```

2. **Same package and sub-packages only**
   - Keep all code under main package
   - Or explicitly configure @ComponentScan

3. **No manual @ComponentScan needed**
   - Unless customizing scan packages
   - Rare in practice

### About The Journey

1. **Spring Core → Spring Boot makes sense**
   - Learn fundamentals first
   - Understand magic later
   - Appreciate convenience

2. **Spring Boot hides complexity**
   - But complexity still exists
   - Understanding helps debugging
   - Knowledge is power

3. **Both approaches are Spring**
   - Same concepts
   - Same annotations (mostly)
   - Just different defaults

---

## 💡 Final Insights

### The Complete Picture

**Spring Framework (Core):**
```
+--------------------------------------------------+
|  Spring Core Framework                           |
|  - Bean container                                |
|  - Dependency injection                          |
|  - Configuration (XML/Java/Annotations)          |
|  - AOP, Data Access, Web, etc.                  |
+--------------------------------------------------+
```

**Spring Boot = Spring Core + Conveniences:**
```
+--------------------------------------------------+
|  Spring Boot                                     |
|  +--------------------------------------------+  |
|  |  Spring Core Framework                    |  |
|  |  - All Spring Core features               |  |
|  +--------------------------------------------+  |
|  + Auto-configuration                            |
|  + Embedded servers                              |
|  + Opinionated defaults                          |
|  + Production-ready features                     |
|  + Starter dependencies                          |
+--------------------------------------------------+
```

**Spring Boot doesn't replace Spring - it enhances it!**

---

### Why Spring Boot is "Opinionated"

**Opinionated means: strong default opinions**

**Example opinions:**

**Opinion 1: Embedded server**
```java
// Spring Boot's opinion: "Use embedded Tomcat"
// You CAN use Jetty or Undertow if you prefer
```

**Opinion 2: Port 8080**
```java
// Spring Boot's opinion: "Use port 8080"
// You CAN change it: server.port=9090
```

**Opinion 3: Component scanning from main package**
```java
// Spring Boot's opinion: "Scan from @SpringBootApplication package"
// You CAN customize with @ComponentScan
```

**Opinion 4: Auto-configuration**
```java
// Spring Boot's opinion: "Configure based on classpath"
// You CAN disable: @EnableAutoConfiguration(exclude = {...})
```

**Key: Opinions are defaults, not restrictions!**

**You can override everything!**

---

### Real-World Project Structure

**Spring Boot project (typical):**
```
myapp/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/company/myapp/
│       │       ├── MyAppApplication.java  ← @SpringBootApplication
│       │       ├── controller/
│       │       │   └── UserController.java
│       │       ├── service/
│       │       │   └── UserService.java
│       │       ├── repository/
│       │       │   └── UserRepository.java
│       │       └── model/
│       │           └── User.java
│       └── resources/
│           ├── application.properties
│           └── static/
│               └── index.html
└── pom.xml
```

**Everything under `com.company.myapp` is scanned automatically!**

**No configuration needed!**

---

### Configuration Comparison

**What you write in Spring Core:**
```java
@Configuration
@ComponentScan(basePackages = "com.telusko")
@EnableTransactionManagement
@EnableWebMvc
@PropertySource("classpath:application.properties")
public class AppConfig {
    
    @Bean
    public DataSource dataSource() {
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("com.mysql.jdbc.Driver");
        ds.setUrl("jdbc:mysql://localhost:3306/mydb");
        ds.setUsername("root");
        ds.setPassword("password");
        return ds;
    }
    
    @Bean
    public EntityManagerFactory entityManagerFactory() {
        LocalContainerEntityManagerFactoryBean factory = 
            new LocalContainerEntityManagerFactoryBean();
        factory.setDataSource(dataSource());
        factory.setPackagesToScan("com.telusko.model");
        // ... many more lines of configuration
        return factory.getObject();
    }
    
    // Many more @Bean methods...
}

public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new AnnotationConfigApplicationContext(AppConfig.class);
        // Use context...
    }
}
```

**What you write in Spring Boot:**
```java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}
```

**application.properties:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=password
```

**From 50+ lines → 5 lines!** ✨

---

### When Spring Boot Auto-Configuration Isn't Enough

**Sometimes you need custom configuration:**

```java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}

@Configuration  // Custom configuration class
public class CustomConfig {
    
    @Bean
    public MySpecialService specialService() {
        // Custom bean that Spring Boot doesn't auto-configure
        return new MySpecialService();
    }
    
    @Bean
    @Primary  // Override auto-configured bean
    public DataSource customDataSource() {
        // Your custom data source instead of auto-configured
        return new HikariDataSource();
    }
}
```

**You CAN mix auto-configuration with manual config!**

**Spring Boot suggestions, you decide!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Components outside scan package

**Wrong:**
```
com.telusko/
└── app/
    └── SpringBootApp.java  ← @SpringBootApplication

com.other/                  ← Different package!
└── MyService.java         ← @Component NOT FOUND!
```

**Fix: Move to same package**
```
com.telusko/
└── app/
    ├── SpringBootApp.java  ← @SpringBootApplication
    └── service/
        └── MyService.java  ← @Component FOUND!
```

### Mistake 2: Multiple @SpringBootApplication

**Wrong:**
```java
@SpringBootApplication
public class App1 { ... }

@SpringBootApplication  // Don't do this!
public class App2 { ... }
```

**Only ONE @SpringBootApplication per application!**

### Mistake 3: Expecting Spring Core config to work

**Wrong:**
```java
@SpringBootApplication
public class App { ... }

@Configuration  // Redundant! Already in @SpringBootApplication
public class AppConfig { ... }
```

**You don't need @Configuration for basic setup!**
**@SpringBootApplication already includes it!**

### Mistake 4: Manual context creation

**Wrong:**
```java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        // Don't create context manually!
        ApplicationContext context = 
            new AnnotationConfigApplicationContext(App.class);
    }
}
```

**Correct:**
```java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);  // Let Spring Boot handle it!
    }
}
```

---

## 🎯 Practice Exercises

### Exercise 1: Compare configurations

Create same application in Spring Core and Spring Boot. Compare line counts. Understand what Spring Boot auto-configured.

### Exercise 2: Package scanning

Create components in different packages. Test which ones are found. Move main class and observe behavior.

### Exercise 3: Override auto-configuration

Let Spring Boot auto-configure DataSource. Then override with custom @Bean. Verify your custom one is used.

### Exercise 4: Disable auto-configuration

Use @EnableAutoConfiguration(exclude={...}) to disable specific auto-config. Observe behavior.

### Exercise 5: Custom @ComponentScan

Override default component scan to include multiple different packages. Test components from all packages loaded.

---

## 🔗 Quick Summary

**Spring Core: Explicit learning foundation**
- XML configuration
- Java configuration  
- Component scanning
- Manual setup
- **Understanding of fundamentals** ✅

**Spring Boot: Auto-magic convenience**
```java
@SpringBootApplication  // = @Configuration + @ComponentScan + @EnableAutoConfiguration
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);  // Does everything!
    }
}
```

**Key differences:**

| Aspect | Spring Core | Spring Boot |
|--------|-------------|-------------|
| Configuration | Manual | Automatic |
| Context creation | Explicit | Hidden |
| Component scan | @ComponentScan(...) | Automatic |
| Dependencies | Individual | Starters |
| Server | External | Embedded |
| Default behavior | Minimal | Opinionated |

**The relationship:**
- Spring Boot = Spring Core + Conveniences
- Same concepts, different defaults
- Learning Core helps understand Boot
- Boot makes production easier

**Next: Enhance Spring Boot project with all Spring Core concepts!** 🚀

**Adding:** Computer interface, Desktop class, @Primary, @Qualifier, @Value, complete configuration!
