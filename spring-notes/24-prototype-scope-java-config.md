# 🔄 Prototype Scope in Java Configuration - Multiple Instances

## Introduction

We've learned Java-based configuration with the @Bean annotation:

```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**And we know the default behavior:**

```java
Desktop dt1 = context.getBean(Desktop.class);
Desktop dt2 = context.getBean(Desktop.class);

System.out.println(dt1 == dt2);  // true - same instance!
```

**By default, beans are SINGLETON!**

**Every getBean() call returns the SAME object.**

**But what if we want DIFFERENT objects?**

**Think back to our XML lessons:**

```xml
<bean id="desktop" class="Desktop" scope="prototype" />
<!-- Multiple instances, one per request -->
```

**Can we do this in Java configuration?**

**Of course!** ✨

The @Scope annotation lets you control bean scope in Java configuration. Just like XML's `scope="prototype"` attribute, you can use `@Scope("prototype")` to create a new instance for each getBean() call.

**In this lesson, you'll learn:**
- Default singleton behavior in Java configuration
- Why we only see Desktop object created (not Alien or Laptop)
- Testing singleton: multiple getBean() calls, same instance
- Using @Scope annotation to change bean scope
- @Scope("prototype") for multiple instances
- Verifying prototype behavior: object created multiple times
- XML scope attribute vs Java @Scope annotation
- When singleton vs prototype makes sense

Time to create multiple instances on demand! 🔄

---

## Concept 1: Understanding Current Singleton Behavior

### 🧠 Our current setup

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**Desktop.java (with constructor logging):**
```java
public class Desktop implements Computer {
    
    public Desktop() {
        System.out.println("Desktop object created");
    }
    
    @Override
    public void compile() {
        System.out.println("Compiling using Desktop");
    }
}
```

### 🧠 What happens at startup

**The instructor explains:**

> "By default every bean will be singleton. That means the moment you load your application, it will create the container, and in that container the object will be available."

**App.java:**
```java
public static void main(String[] args) {
    System.out.println("=== Before container creation ===");
    
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    System.out.println("=== After container creation ===");
    
    Desktop dt = context.getBean(Desktop.class);
    dt.compile();
}
```

**Output:**
```
=== Before container creation ===
Desktop object created
=== After container creation ===
Compiling using Desktop
```

**Desktop created DURING container initialization!**

**That's eager singleton behavior!**

### 🧠 Only Desktop is created

**The instructor clarifies:**

> "At this point we are working with only one particular bean which is desktop. We are not even working for alien. We're not even working for laptop. So those objects are not getting created."

**Current AppConfig:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {  // Only defining Desktop!
        return new Desktop();
    }
    
    // No Alien bean
    // No Laptop bean
}
```

**Why mention this?**

**Avoiding confusion:**
- Only beans defined with @Bean are created
- If no @Bean for Alien → no Alien object
- If no @Bean for Laptop → no Laptop object

**The instructor adds:**

> "In fact, you know, I should mention that alien object created, just for avoiding confusions."

**Good practice: log constructors to see what's created!**

---

## Concept 2: Testing Singleton Behavior

### 🧠 The singleton test

**What happens if we call getBean() TWICE?**

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    // Get bean twice
    Desktop dt1 = context.getBean(Desktop.class);
    Desktop dt2 = context.getBean(Desktop.class);
    
    // Same object?
    System.out.println("Same instance? " + (dt1 == dt2));
    
    dt1.compile();
    dt2.compile();
}
```

**Output:**
```
Desktop object created
Same instance? true
Compiling using Desktop
Compiling using Desktop
```

**Key observations:**

1. **"Desktop object created" appears ONCE**
   - Only one constructor call
   - One instance created at startup

2. **dt1 == dt2 is true**
   - Both variables reference same object
   - Singleton confirmed!

3. **compile() called twice**
   - Method executes twice
   - But on the same object

### 🧠 The instructor explains

**The instructor says:**

> "We know from the XML configuration, in total you will get only one object, right? So it will say desktop object created only once. But yes, 'compiling using desktop' two times is because we are calling this method two times, but both are working with the same object."

**Visual representation:**

```
Container Startup:
├─ Desktop object created ← ONE INSTANCE
└─ Stored in container as "desktop"

GetBean Call 1:
├─ Look up "desktop"
├─ Return existing instance → dt1
└─ No new object created

GetBean Call 2:
├─ Look up "desktop"
├─ Return existing instance → dt2
└─ No new object created

dt1 == dt2 → TRUE (same instance)
```

**This is singleton scope!**

---

## Concept 3: The Need for Prototype Scope

### 🧠 The question

**The instructor asks:**

> "But what if you want two different objects?"

**Real-world scenarios:**

**Scenario 1: User sessions**
```java
@Bean
public UserSession userSession() {
    return new UserSession();  // Each user needs own session!
}
```

**Scenario 2: Request handlers**
```java
@Bean
public RequestHandler requestHandler() {
    return new RequestHandler();  // Each request needs own handler!
}
```

**Scenario 3: Independent configurations**
```java
@Bean
public FileProcessor fileProcessor() {
    return new FileProcessor();  // Each file needs own processor!
}
```

**Singleton won't work for these!**

### 🧠 Desired behavior

**What we want:**

```java
Desktop dt1 = context.getBean(Desktop.class);  // Create new Desktop
Desktop dt2 = context.getBean(Desktop.class);  // Create ANOTHER new Desktop

System.out.println(dt1 == dt2);  // false - different instances!
```

**Expected output:**
```
Desktop object created
Desktop object created
Same instance? false
```

**Each getBean() creates a NEW instance!**

**This is prototype scope!**

---

## Concept 4: Introducing the @Scope Annotation

### 🧠 XML vs Java syntax

**In XML we wrote:**
```xml
<bean id="desktop" class="Desktop" scope="prototype" />
<!--                                ^^^^^^^^^^^^^^^^^^^ Scope attribute -->
```

**In Java we write:**
```java
@Bean
@Scope("prototype")  // Scope annotation!
public Desktop desktop() {
    return new Desktop();
}
```

**Same concept, different syntax!**

### 🧠 The @Scope annotation

**The instructor explains:**

> "In the XML we have used prototype as attribute. Here also we have to use some annotation. The annotation which we are going to use here is called @Scope."

**What @Scope does:**
- Controls bean scope
- Works with @Bean methods
- Takes a string value

**Available scopes:**
- `"singleton"` (default)
- `"prototype"` (create new instance each time)
- `"request"` (web apps only)
- `"session"` (web apps only)
- `"application"` (web apps only)

### 🧠 Default is singleton

**The instructor notes:**

> "By default the scope is singleton."

**These are equivalent:**

**Explicit singleton:**
```java
@Bean
@Scope("singleton")  // Explicitly stating default
public Desktop desktop() {
    return new Desktop();
}
```

**Implicit singleton (no @Scope):**
```java
@Bean  // Singleton by default
public Desktop desktop() {
    return new Desktop();
}
```

**No need to write @Scope("singleton") - it's the default!**

---

## Concept 5: Implementing Prototype Scope

### ⚙️ Add @Scope annotation

**AppConfig.java (before):**
```java
@Configuration
public class AppConfig {
    
    @Bean  // Singleton by default
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**AppConfig.java (after):**
```java
@Configuration
public class AppConfig {
    
    @Bean
    @Scope("prototype")  // Changed to prototype!
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**That's it!** ✨

**The instructor confirms:**

> "The same thing we have done with the help of @Scope annotation and saying 'prototype'."

### 🧪 Test prototype behavior

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    System.out.println("=== First getBean call ===");
    Desktop dt1 = context.getBean(Desktop.class);
    
    System.out.println("=== Second getBean call ===");
    Desktop dt2 = context.getBean(Desktop.class);
    
    System.out.println("=== Comparing instances ===");
    System.out.println("Same instance? " + (dt1 == dt2));
    
    dt1.compile();
    dt2.compile();
}
```

**Output:**
```
=== First getBean call ===
Desktop object created
=== Second getBean call ===
Desktop object created
=== Comparing instances ===
Same instance? false
Compiling using Desktop
Compiling using Desktop
```

**Perfect!** ✅

**The instructor confirms:**

> "And now you can see it says 'desktop object created' two times."

### 💡 What changed?

**Singleton behavior:**
- ✅ Object created at startup
- ✅ One instance in container
- ✅ Same instance returned each time

**Prototype behavior:**
- ❌ No object created at startup (lazy)
- ❌ No instance stored in container
- ✅ New instance created for each getBean()

**Fundamentally different behavior!**

---

## Concept 6: Complete Comparison - Singleton vs Prototype

### 📊 Side-by-side comparison

**Singleton configuration:**
```java
@Bean  // or @Bean @Scope("singleton")
public Desktop desktop() {
    return new Desktop();
}
```

**Prototype configuration:**
```java
@Bean
@Scope("prototype")
public Desktop desktop() {
    return new Desktop();
}
```

### 🧪 Complete test

**TestApp.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    System.out.println("\n=== Getting bean 3 times ===");
    
    Desktop dt1 = context.getBean(Desktop.class);
    System.out.println("Got dt1");
    
    Desktop dt2 = context.getBean(Desktop.class);
    System.out.println("Got dt2");
    
    Desktop dt3 = context.getBean(Desktop.class);
    System.out.println("Got dt3");
    
    System.out.println("\n=== Instance comparison ===");
    System.out.println("dt1 == dt2: " + (dt1 == dt2));
    System.out.println("dt2 == dt3: " + (dt2 == dt3));
    System.out.println("dt1 == dt3: " + (dt1 == dt3));
    
    System.out.println("\n=== Calling methods ===");
    dt1.compile();
    dt2.compile();
    dt3.compile();
}
```

**Output with Singleton:**
```
Desktop object created

=== Getting bean 3 times ===
Got dt1
Got dt2
Got dt3

=== Instance comparison ===
dt1 == dt2: true
dt2 == dt3: true
dt1 == dt3: true

=== Calling methods ===
Compiling using Desktop
Compiling using Desktop
Compiling using Desktop
```

**Output with Prototype:**
```
=== Getting bean 3 times ===
Desktop object created
Got dt1
Desktop object created
Got dt2
Desktop object created
Got dt3

=== Instance comparison ===
dt1 == dt2: false
dt2 == dt3: false
dt1 == dt3: false

=== Calling methods ===
Compiling using Desktop
Compiling using Desktop
Compiling using Desktop
```

**Clear difference!**

### 💡 Behavior table

| Feature | Singleton | Prototype |
|---------|-----------|-----------|
| **Creation time** | Container startup | On getBean() call |
| **Instances created** | One | Many (one per request) |
| **Same instance?** | Yes | No |
| **Constructor calls** | Once | Multiple times |
| **Memory usage** | Low | Higher (multiple objects) |
| **Performance** | Fast (cached) | Slower (creates new) |
| **Use case** | Shared state | Independent state |

---

## Concept 7: XML to Java Translation

### 🧠 Complete translation

**XML approach:**
```xml
<beans>
    <!-- Singleton bean (default) -->
    <bean id="laptop" class="Laptop" />
    
    <!-- Singleton bean (explicit) -->
    <bean id="desktop" class="Desktop" scope="singleton" />
    
    <!-- Prototype bean -->
    <bean id="alien" class="Alien" scope="prototype" />
</beans>
```

**Java approach:**
```java
@Configuration
public class AppConfig {
    
    // Singleton bean (default)
    @Bean
    public Laptop laptop() {
        return new Laptop();
    }
    
    // Singleton bean (explicit)
    @Bean
    @Scope("singleton")
    public Desktop desktop() {
        return new Desktop();
    }
    
    // Prototype bean
    @Bean
    @Scope("prototype")
    public Alien alien() {
        return new Alien();
    }
}
```

**Perfect mapping!**

### 💡 The instructor's summary

**The instructor wraps up:**

> "Basically that's how you define, you change the scope using Java based configuration, using your annotation called @Scope. And the value is 'prototype'."

**Simple formula:**
- Want singleton? Don't add @Scope (it's default)
- Want prototype? Add @Scope("prototype")

---

## Concept 8: Practical Examples

### 🧪 Example 1: Mixed scopes

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    // Singleton - shared database connection
    @Bean
    public DataSource dataSource() {
        DataSource ds = new DataSource();
        System.out.println("DataSource created");
        return ds;
    }
    
    // Prototype - independent request handlers
    @Bean
    @Scope("prototype")
    public RequestHandler requestHandler() {
        RequestHandler handler = new RequestHandler();
        System.out.println("RequestHandler created");
        return handler;
    }
}
```

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    // Get DataSource twice - same instance
    DataSource ds1 = context.getBean(DataSource.class);
    DataSource ds2 = context.getBean(DataSource.class);
    System.out.println("DataSource same? " + (ds1 == ds2));
    
    // Get RequestHandler twice - different instances
    RequestHandler rh1 = context.getBean(RequestHandler.class);
    RequestHandler rh2 = context.getBean(RequestHandler.class);
    System.out.println("RequestHandler same? " + (rh1 == rh2));
}
```

**Output:**
```
DataSource created
RequestHandler created
RequestHandler created
DataSource same? true
RequestHandler same? false
```

**Mix and match as needed!**

### 🧪 Example 2: Prototype with dependencies

**What if a prototype bean has dependencies?**

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean  // Singleton
    public Laptop laptop() {
        return new Laptop();
    }
    
    @Bean
    @Scope("prototype")  // Prototype
    public Alien alien() {
        Alien a = new Alien();
        a.setAge(21);
        a.setCom(laptop());  // Depends on singleton laptop
        return a;
    }
}
```

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Alien a1 = context.getBean(Alien.class);
    Alien a2 = context.getBean(Alien.class);
    
    System.out.println("Different aliens? " + (a1 != a2));
    System.out.println("Same laptop? " + (a1.getCom() == a2.getCom()));
}
```

**Output:**
```
Different aliens? true
Same laptop? true
```

**Each Alien is unique, but they share the same Laptop!**

**Why?**
- Alien is prototype → new instance each time
- Laptop is singleton → same instance always
- Each new Alien gets injected with the same Laptop

---

## ✅ Key Takeaways

### About Default Scope

1. **Singleton is the default**
   ```java
   @Bean  // Singleton by default
   public Desktop desktop() {
       return new Desktop();
   }
   ```

2. **Singleton = one instance**
   - Created at container startup
   - Cached in container
   - Same instance returned always

3. **All beans singleton unless specified otherwise**
   - Must explicitly use @Scope for other scopes
   - Default is optimal for most beans

### About @Scope Annotation

1. **@Scope controls bean scope**
   ```java
   @Bean
   @Scope("prototype")  // Changes scope
   public Desktop desktop() {
       return new Desktop();
   }
   ```

2. **Takes string value**
   - "singleton" (default)
   - "prototype"
   - "request" (web)
   - "session" (web)
   - "application" (web)

3. **Works with @Bean methods**
   - Applied to method
   - Affects that bean only
   - Different beans can have different scopes

### About Prototype Scope

1. **New instance for each getBean() call**
   ```java
   @Bean
   @Scope("prototype")
   public Desktop desktop() {
       return new Desktop();
   }
   ```

2. **Created on-demand (lazy)**
   - Not created at startup
   - Created when requested
   - Constructor called multiple times

3. **Independent instances**
   - Each instance is unique
   - No sharing between calls
   - Different memory addresses

### About XML to Java Translation

1. **XML scope attribute → Java @Scope annotation**
   ```xml
   <!-- XML -->
   <bean id="desktop" scope="prototype" />
   ```
   ```java
   // Java
   @Bean
   @Scope("prototype")
   public Desktop desktop() { ... }
   ```

2. **Same behavior, different syntax**
   - Both create new instances
   - Both work identically
   - Choose based on config approach

3. **Can mix scopes freely**
   - Some beans singleton
   - Some beans prototype
   - Based on requirements

---

## 💡 Final Insights

### When to Use Each Scope

**Use Singleton when:**
- ✅ Bean is stateless
- ✅ Bean is thread-safe
- ✅ Shared resource (database connection pool)
- ✅ Configuration/settings objects
- ✅ Services/repositories

**Examples:**
```java
@Bean  // Singleton
public UserService userService() { ... }

@Bean  // Singleton
public DataSource dataSource() { ... }
```

**Use Prototype when:**
- ✅ Bean maintains state
- ✅ Each use needs independent instance
- ✅ Not thread-safe
- ✅ Request/session-specific data
- ✅ Temporary/disposable objects

**Examples:**
```java
@Bean
@Scope("prototype")
public ShoppingCart shoppingCart() { ... }

@Bean
@Scope("prototype")
public UserSession userSession() { ... }
```

### Singleton vs Prototype Performance

**Performance comparison:**

**Singleton:**
```
Container startup: 100ms (create all beans)
First getBean():   1ms (return cached)
Second getBean():  1ms (return cached)
Third getBean():   1ms (return cached)
```

**Prototype:**
```
Container startup: 50ms (no prototype beans created)
First getBean():   10ms (create new instance)
Second getBean():  10ms (create new instance)
Third getBean():   10ms (create new instance)
```

**Singleton = faster after startup (caching)**
**Prototype = faster startup, slower per-request**

**Choose based on usage pattern!**

### The Scope Annotation Constants

**Better practice: Use constants!**

**Instead of strings:**
```java
@Bean
@Scope("prototype")  // String - typo possible!
public Desktop desktop() {
    return new Desktop();
}
```

**Use ConfigurableBeanFactory constants:**
```java
import org.springframework.beans.factory.config.ConfigurableBeanFactory;

@Bean
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)  // Constant - type-safe!
public Desktop desktop() {
    return new Desktop();
}
```

**Or WebApplicationContext for web scopes:**
```java
import org.springframework.web.context.WebApplicationContext;

@Bean
@Scope(WebApplicationContext.SCOPE_REQUEST)
public RequestData requestData() {
    return new RequestData();
}
```

**Type-safe and refactor-friendly!**

### Memory Management

**Singleton lifecycle:**
```
Container startup → Bean created
                  ↓
              Cached in container
                  ↓
           Used by application
                  ↓
       Container shutdown → Bean destroyed
```
**Spring manages full lifecycle!**

**Prototype lifecycle:**
```
getBean() call → Bean created
              ↓
         Returned to caller
              ↓
         Used by application
              ↓
       (Spring stops managing here!)
              ↓
         Garbage collected when no references
```
**Spring creates but caller manages cleanup!**

**Important:** Prototype beans are NOT managed after creation!
- No destroy callbacks by default
- You're responsible for cleanup
- Can cause memory leaks if not careful

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Forgetting quotes in @Scope

**Wrong:**
```java
@Bean
@Scope(prototype)  // ❌ Syntax error! prototype is not a variable
public Desktop desktop() {
    return new Desktop();
}
```

**Correct:**
```java
@Bean
@Scope("prototype")  // ✅ String value
public Desktop desktop() {
    return new Desktop();
}
```

### Mistake 2: Expecting prototype at startup

**Wrong expectation:**
```java
@Bean
@Scope("prototype")
public Desktop desktop() {
    return new Desktop();
}

// At startup:
// "Desktop object created" should print, right? ❌ NO!
```

**Correct understanding:**
```java
// Prototype beans NOT created at startup
// Only created when getBean() is called
```

### Mistake 3: Using prototype for stateless beans

**Inefficient:**
```java
@Bean
@Scope("prototype")  // ❌ Unnecessary!
public MathService mathService() {  // Stateless service
    return new MathService();
}
```

**Better:**
```java
@Bean  // ✅ Singleton is fine for stateless
public MathService mathService() {
    return new MathService();
}
```

**Don't use prototype unless you need independent state!**

### Mistake 4: Injecting prototype into singleton

**Problematic:**
```java
@Bean  // Singleton
public UserService userService() {
    UserService service = new UserService();
    service.setSessionManager(sessionManager());  // Prototype dependency
    return service;
}

@Bean
@Scope("prototype")
public SessionManager sessionManager() {
    return new SessionManager();
}
```

**Problem:**
- UserService is singleton (created once)
- Gets ONE SessionManager at creation
- Same SessionManager used forever!
- Defeats purpose of prototype!

**Solution:** Use Provider or lookup methods (advanced topic).

---

## 🎯 Practice Exercises

### Exercise 1: Verify scope behavior

Create two beans:
- One singleton
- One prototype

Get each bean 3 times and verify instance counts.

### Exercise 2: Performance test

Create a prototype bean with expensive initialization (sleep 100ms). Get it 10 times. Measure total time. Compare with singleton.

### Exercise 3: Mixed scope application

Create:
- DataSource bean (singleton)
- UserSession bean (prototype)
- UserService bean (singleton, depends on DataSource)

Verify correct behavior for each.

### Exercise 4: Scope decision

For each scenario, decide singleton or prototype:

a) Logging service
b) Shopping cart
c) Database connection pool
d) HTTP request handler
e) Configuration properties

---

## 🔗 Quick Summary

**Scope in Java configuration:**

**Default (Singleton):**
```java
@Bean  // Singleton by default
public Desktop desktop() {
    return new Desktop();
}
```

**Prototype:**
```java
@Bean
@Scope("prototype")  // New instance each getBean()
public Desktop desktop() {
    return new Desktop();
}
```

**Behavior:**

| Scope | Creation Time | Instances | Use Case |
|-------|---------------|-----------|----------|
| Singleton | Startup | One | Shared, stateless |
| Prototype | On-demand | Many | Independent, stateful |

**XML equivalent:**
```xml
<bean id="desktop" scope="prototype" />
```

**Next topic:** @Primary annotation in Java configuration! 🎊
