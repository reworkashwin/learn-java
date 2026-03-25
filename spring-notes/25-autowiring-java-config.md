# 🔗 Autowiring in Java Configuration - Automatic Dependencies

## Introduction

We've been working with simple beans in Java configuration:

```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**But real applications have DEPENDENCIES!**

**Remember our Alien class:**
```java
public class Alien {
    private int age;
    private Computer com;  // Depends on Computer!
    
    public void code() {
        System.out.println("Coding...");
        com.compile();  // Needs Computer to work!
    }
}
```

**Alien needs a Computer to function!**

**Think about the challenges:**
- How do we set the age property?
- How do we inject the Computer dependency?
- How do we avoid tight coupling to Desktop?
- What if we have multiple Computer implementations?

**In XML we wrote:**
```xml
<bean id="alien" class="Alien">
    <property name="age" value="21" />
    <property name="com" ref="desktop" />
</bean>
```

**How do we do this in Java configuration?**

There are multiple approaches, and the instructor shows us the evolution from manual wiring to automatic autowiring!

**In this lesson, you'll learn:**
- Creating Alien bean with @Bean annotation
- Setting primitive properties (age) with setter methods
- Manual dependency injection: calling desktop() method directly
- The tight coupling problem with explicit method calls
- Autowiring by passing dependencies as method parameters
- How Spring automatically resolves dependencies by type
- The @Autowired annotation (optional in modern Spring)
- Preview: handling multiple beans of the same type (ambiguity)
- The parallels with XML autowiring byType

Time to wire up complex dependencies! 🔗

---

## Concept 1: Creating the Alien Bean

### 🧠 Starting with a simple Alien bean

**App.java (what we want to work):**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Alien obj = context.getBean(Alien.class);
    System.out.println(obj.getAge());
    obj.code();
}
```

**Run it...**

**Error:**
```
NoSuchBeanDefinitionException: No qualifying bean of type 'Alien' available
```

**The instructor explains:**

> "You know why? Because in the app config we have not mentioned anything about the alien."

**We need to create an Alien bean!**

### ⚙️ Create basic Alien bean

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
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

**Simple approach: just return new Alien!**

### 🧪 Test basic bean

**Run the app...**

**Output:**
```
Desktop object created
Alien object created
0
Exception in thread "main" java.lang.NullPointerException
    at Alien.code(Alien.java:15)
```

**Progress!** 
- ✅ Alien bean created
- ✅ Desktop bean created
- ❌ NullPointerException in code()

**The instructor explains:**

> "If you see the code, code is dependent on the object of a computer, right? This is null by default."

**The problem:**
```java
public class Alien {
    private int age;        // Default: 0
    private Computer com;   // Default: null ❌
    
    public void code() {
        com.compile();  // NullPointerException!
    }
}
```

**We created the bean, but didn't set its properties!**

---

## Concept 2: Setting Primitive Properties

### 🧠 The age property problem

**Current output:**
```
0  ← Age is 0 (default)
```

**We want:**
```
21  ← Age should be 21 (or 25)
```

**How do we set the age?**

### ⚙️ Setting properties in @Bean method

**We can configure the object BEFORE returning it!**

**AppConfig.java:**
```java
@Bean
public Alien alien() {
    Alien obj = new Alien();  // Create object
    obj.setAge(25);           // Set property
    return obj;               // Return configured object
}
```

**The instructor demonstrates:**

> "Instead of returning the value, the new object, I can say Alien obj = new Alien. And then before sending the value we can say obj.setAge, I can set age 21. Or maybe this time let's say 25. And then let's return obj."

### 🧪 Test property setting

**Run the app...**

**Output:**
```
Desktop object created
Alien object created
25  ← Age is now 25! ✅
Exception in thread "main" java.lang.NullPointerException
```

**Age is set correctly!**

**But Computer is still null!**

### 💡 The pattern

**Bean method structure:**
```java
@Bean
public BeanType beanMethod() {
    // 1. Create object
    BeanType obj = new BeanType();
    
    // 2. Configure object (set properties)
    obj.setProperty1(value1);
    obj.setProperty2(value2);
    
    // 3. Return configured object
    return obj;
}
```

**Full control over object creation and configuration!**

---

## Concept 3: Manual Dependency Injection

### 🧠 The Computer dependency problem

**Alien needs a Computer:**
```java
public class Alien {
    private int age;
    private Computer com;  // Still null!
}
```

**Desktop IS a Computer:**
```java
public class Desktop implements Computer { ... }
```

**We have a Desktop bean:**
```java
@Bean
public Desktop desktop() {
    return new Desktop();
}
```

**How do we connect Alien to Desktop?**

### ⚙️ Calling desktop() method

**We can call the desktop() method from alien() method!**

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean
    public Alien alien() {
        Alien obj = new Alien();
        obj.setAge(25);
        obj.setCom(desktop());  // Call desktop() method!
        return obj;
    }
}
```

**The instructor explains:**

> "So we are setting, setCom, and we are passing the object of desktop. Desktop returns the object of desktop, right? And that's what we are doing here."

### 🧪 Test manual injection

**Run the app...**

**Output:**
```
Desktop object created
Alien object created
25
Coding...
Compiling using Desktop
```

**It works!** ✅

**Dependencies are wired!**

### 💡 How it works

**Method call chain:**
```java
@Bean
public Alien alien() {
    Alien obj = new Alien();
    obj.setCom(desktop());  // Calls desktop() method
    //         ^^^^^^^^^^   Returns Desktop instance
    return obj;
}
```

**Spring manages singleton behavior:**
- First time desktop() called → creates Desktop
- Subsequent calls → returns same Desktop instance
- Alien gets the singleton Desktop

---

## Concept 4: The Tight Coupling Problem

### 🧠 What's wrong with this approach?

**Current code:**
```java
@Bean
public Alien alien() {
    Alien obj = new Alien();
    obj.setCom(desktop());  // Hardcoded to desktop()!
    return obj;
}
```

**The instructor identifies the problem:**

> "But there is one little problem here. When you assign desktop here, we are making tightly coupled. What if you have laptop?"

**The issue:**
- Alien is HARDCODED to Desktop
- Can't easily switch to Laptop
- Lost flexibility
- Tight coupling!

### 🧠 What if we add Laptop?

**AppConfig.java:**
```java
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
    Alien obj = new Alien();
    obj.setCom(desktop());  // Still hardcoded to desktop!
    return obj;
}
```

**To use Laptop, we'd need to manually change:**
```java
obj.setCom(laptop());  // Manual change required
```

**Not flexible!**

### 💡 Desired solution

**We want:**
- Alien depends on COMPUTER interface
- Not tied to specific implementation
- Spring chooses which Computer to inject
- Loose coupling!

**How?**

---

## Concept 5: Autowiring with Method Parameters

### 🧠 The elegant solution

**Instead of calling desktop() explicitly:**
```java
@Bean
public Alien alien() {
    obj.setCom(desktop());  // Tight coupling
}
```

**Pass Computer as parameter:**
```java
@Bean
public Alien alien(Computer com) {  // Parameter!
    obj.setCom(com);  // Use parameter
}
```

**Let Spring inject the dependency!**

### ⚙️ Implementing parameter-based injection

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean
    public Alien alien(Computer com) {  // Computer parameter
        Alien obj = new Alien();
        obj.setAge(25);
        obj.setCom(com);  // Use injected parameter
        return obj;
    }
}
```

**The instructor explains:**

> "What you can do is in the constructor you can pass Computer com, and don't mention desktop here, just say com. Your Spring will say, 'Okay, this alien is dependent, so if you want to call alien, it is dependent on a Computer object.' So what it will do is it will look at the container and say, 'Hey container, I want a computer object.' Container will say, 'Hey, you know, I do have a desktop object which is a Computer.'"

### 🧪 Test automatic injection

**Run it...**

**Output:**
```
Desktop object created
Alien object created
25
Coding...
Compiling using Desktop
```

**Still works!** ✅

**But now it's loosely coupled!**

### 💡 How Spring resolves it

**Spring's resolution process:**

1. **Process alien() method**
   - Sees parameter: `Computer com`
   - Realizes Alien needs a Computer

2. **Search container for Computer beans**
   - Finds Desktop bean (implements Computer) ✅
   - No Laptop bean yet

3. **Inject Desktop as Computer**
   - Calls alien(desktop)
   - Desktop injected automatically

4. **Create and return Alien**
   - Alien configured with Desktop
   - Dependency satisfied!

**This is autowiring by type!**

---

## Concept 6: The @Autowired Annotation (Optional)

### 🧠 Do we need @Autowired?

**The instructor mentions:**

> "In the newer versions, you don't have to mention @Autowired there, but in the earlier versions we have to use @Autowired. So even if you use @Autowired or not, it will work."

**Modern Spring (Spring 4.3+):**
```java
@Bean
public Alien alien(Computer com) {  // No @Autowired needed
    Alien obj = new Alien();
    obj.setCom(com);
    return obj;
}
```

**Older Spring (pre-4.3):**
```java
@Bean
public Alien alien(@Autowired Computer com) {  // Explicit @Autowired
    Alien obj = new Alien();
    obj.setCom(com);
    return obj;
}
```

### 🧠 When to use @Autowired

**In @Bean methods: Optional**
```java
@Bean
public Alien alien(Computer com) {  // Works without @Autowired
    // ...
}
```

**In component classes: Required (coming in later lessons)**
```java
@Component
public class Alien {
    @Autowired  // Required here!
    private Computer com;
}
```

### 💡 Best practice

**For @Bean methods:**
- Don't add @Autowired (redundant)
- Spring automatically injects parameters
- Cleaner code

**The instructor confirms:**

> "As I mentioned before, @Autowired is optional. We can remove that as well. And still it works."

---

## Concept 7: Comparing with XML Autowiring

### 🧠 The parallel

**The instructor draws the connection:**

> "And the same thing we have done here if you remember, we were using autowire byType. So that autowiring can be done with the help of this - you just pass that as a parameter to the method."

**XML autowiring:**
```xml
<bean id="desktop" class="Desktop" />

<bean id="alien" class="Alien" autowire="byType">
    <property name="age" value="25" />
</bean>
```

**Java configuration autowiring:**
```java
@Bean
public Desktop desktop() {
    return new Desktop();
}

@Bean
public Alien alien(Computer com) {  // Autowired by type!
    Alien obj = new Alien();
    obj.setAge(25);
    obj.setCom(com);
    return obj;
}
```

**Same concept, different syntax!**

### 💡 Side-by-side

| XML | Java Config |
|-----|-------------|
| `autowire="byType"` | Method parameter |
| Spring searches by type | Spring searches by type |
| Injects matching bean | Injects matching bean |
| External configuration | Programmatic configuration |

**Both perform autowiring by type!**

---

## Concept 8: Complete Working Example

### 🧪 Full configuration

**Computer.java (interface):**
```java
public interface Computer {
    void compile();
}
```

**Desktop.java:**
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

**Alien.java:**
```java
public class Alien {
    private int age;
    private Computer com;
    
    public Alien() {
        System.out.println("Alien object created");
    }
    
    public void code() {
        System.out.println("Coding...");
        com.compile();
    }
    
    // Getters and setters
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public Computer getCom() { return com; }
    public void setCom(Computer com) { this.com = com; }
}
```

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean
    public Alien alien(Computer com) {  // Autowired parameter
        Alien obj = new Alien();
        obj.setAge(25);
        obj.setCom(com);  // Inject dependency
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
        System.out.println("Age: " + alien.getAge());
        alien.code();
    }
}
```

**Output:**
```
Desktop object created
Alien object created
Age: 25
Coding...
Compiling using Desktop
```

**Perfect!** ✅

---

## Concept 9: Preview - Multiple Implementations

### 🧠 The upcoming challenge

**The instructor ends with:**

> "But what if you got one more object there for laptop? Now if you have two beans of Computer, and if you say I want a Computer bean, which one will get the preference? We have seen that in XML. Let's see how it works in Java in the next video."

**The setup:**
```java
@Bean
public Laptop laptop() {  // Computer implementation #1
    return new Laptop();
}

@Bean
public Desktop desktop() {  // Computer implementation #2
    return new Desktop();
}

@Bean
public Alien alien(Computer com) {  // Which Computer?
    Alien obj = new Alien();
    obj.setCom(com);  // Laptop or Desktop?
    return obj;
}
```

**Ambiguity problem!**

**Spring doesn't know which to inject:**
- Laptop? ✅ Is a Computer
- Desktop? ✅ Is a Computer

**Which one should Spring inject?**

### 💡 Coming next

**Solutions we'll learn:**
1. **@Primary annotation**
   - Mark one as default choice
   - Like XML `primary="true"`

2. **@Qualifier annotation**
   - Specify by name
   - Like XML `ref="specificBean"`

3. **Bean naming**
   - Match parameter name to bean name

**Stay tuned for the resolution!**

---

## ✅ Key Takeaways

### About Creating Beans with Properties

1. **Configure objects before returning**
   ```java
   @Bean
   public Alien alien() {
       Alien obj = new Alien();
       obj.setAge(25);  // Set properties
       return obj;      // Return configured object
   }
   ```

2. **Full control over initialization**
   - Create with new
   - Set all properties
   - Perform any setup
   - Return ready-to-use object

3. **Like XML property injection**
   ```xml
   <bean id="alien" class="Alien">
       <property name="age" value="25" />
   </bean>
   ```

### About Manual Dependency Injection

1. **Can call other @Bean methods**
   ```java
   @Bean
   public Alien alien() {
       obj.setCom(desktop());  // Call desktop() method
       return obj;
   }
   ```

2. **Spring manages singletons**
   - Multiple calls return same instance
   - Singleton behavior preserved

3. **Creates tight coupling**
   - Hardcoded to specific implementation
   - Less flexible
   - Not recommended

### About Autowiring with Parameters

1. **Pass dependencies as method parameters**
   ```java
   @Bean
   public Alien alien(Computer com) {  // Autowired!
       obj.setCom(com);
       return obj;
   }
   ```

2. **Spring automatically injects by type**
   - Searches container for matching type
   - Injects appropriate bean
   - Loose coupling

3. **@Autowired is optional on parameters**
   - Modern Spring (4.3+) doesn't need it
   - Automatically detected
   - Cleaner code

### About Comparison with XML

1. **XML autowire="byType" equivalent**
   ```xml
   <bean id="alien" autowire="byType" />
   ```
   ```java
   public Alien alien(Computer com) { ... }
   ```

2. **Same autowiring mechanism**
   - Both search by type
   - Both inject matching beans
   - Same ambiguity issues

3. **Different syntax, same concept**
   - XML: attribute-based
   - Java: parameter-based
   - Choose based on preference

---

## 💡 Final Insights

### The Evolution of Dependency Injection

**Phase 1: Manual (tight coupling)**
```java
@Bean
public Alien alien() {
    Alien obj = new Alien();
    obj.setCom(desktop());  // Hardcoded Desktop
    return obj;
}
```
**Problem:** Can't easily switch implementations

**Phase 2: Autowired (loose coupling)**
```java
@Bean
public Alien alien(Computer com) {  // Any Computer
    Alien obj = new Alien();
    obj.setCom(com);  // Injected by Spring
    return obj;
}
```
**Solution:** Flexible, decoupled, Spring-managed

### Spring's Dependency Resolution Magic

**What Spring does behind the scenes:**

```java
// You write:
@Bean
public Alien alien(Computer com) { ... }

// Spring does:
1. Scan container for bean definitions
2. Find @Bean methods
3. Detect alien() has parameter: Computer com
4. Search for beans of type Computer
5. Find Desktop (implements Computer)
6. Call: alien(desktopInstance)
7. Store returned Alien in container
```

**You declare, Spring resolves!**

### Manual Injection vs Autowiring

**When to use manual (calling methods):**
```java
@Bean
public DataSource dataSource() { ... }

@Bean
public UserService userService() {
    UserService service = new UserService();
    service.setDataSource(dataSource());  // Explicit control
    // Complex setup logic here
    return service;
}
```

**Use when:**
- Need specific implementation
- Complex initialization logic
- Conditional wiring

**When to use autowiring (parameters):**
```java
@Bean
public UserService userService(DataSource dataSource) {
    UserService service = new UserService();
    service.setDataSource(dataSource);  // Flexible
    return service;
}
```

**Use when:**
- Want loose coupling
- Multiple implementations possible
- Standard dependency injection

### Real-World Pattern

**Typical service layer configuration:**

```java
@Configuration
public class AppConfig {
    
    // Infrastructure beans (explicit)
    @Bean
    public DataSource dataSource() {
        DataSource ds = new DataSource();
        ds.setUrl("jdbc:mysql://localhost/mydb");
        ds.setUsername("user");
        ds.setPassword("pass");
        return ds;
    }
    
    // Service beans (autowired dependencies)
    @Bean
    public UserRepository userRepository(DataSource dataSource) {
        return new UserRepository(dataSource);
    }
    
    @Bean
    public UserService userService(UserRepository repository) {
        return new UserService(repository);
    }
    
    @Bean
    public OrderService orderService(UserService userService,
                                     PaymentService paymentService) {
        return new OrderService(userService, paymentService);
    }
}
```

**Clean, flexible, maintainable!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Forgetting to set dependencies

**Wrong:**
```java
@Bean
public Alien alien() {
    Alien obj = new Alien();
    obj.setAge(25);
    // Forgot to set Computer!
    return obj;
}
```

**Result:** NullPointerException when code() is called

**Correct:**
```java
@Bean
public Alien alien(Computer com) {
    Alien obj = new Alien();
    obj.setAge(25);
    obj.setCom(com);  // Set dependency
    return obj;
}
```

### Mistake 2: Manual injection without @Bean

**Wrong:**
```java
@Bean
public Alien alien() {
    Alien obj = new Alien();
    obj.setCom(desktop());  // desktop() not a @Bean method!
    return obj;
}

public Desktop desktop() {  // ❌ No @Bean annotation
    return new Desktop();
}
```

**Problem:** Creates new Desktop each time (not singleton)

**Correct:**
```java
@Bean  // ✅ Mark as @Bean
public Desktop desktop() {
    return new Desktop();
}
```

### Mistake 3: Using implementation type in parameter

**Less flexible:**
```java
@Bean
public Alien alien(Desktop desktop) {  // Tied to Desktop
    obj.setCom(desktop);
    return obj;
}
```

**More flexible:**
```java
@Bean
public Alien alien(Computer com) {  // Interface type
    obj.setCom(com);
    return obj;
}
```

**Use interface types for maximum flexibility!**

### Mistake 4: Mixing manual and autowired

**Confusing:**
```java
@Bean
public Alien alien(Computer com) {
    Alien obj = new Alien();
    obj.setCom(desktop());  // ❌ Ignoring parameter!
    return obj;
}
```

**Pick one approach - autowired is better!**

---

## 🎯 Practice Exercises

### Exercise 1: Multiple properties

Create a Car bean with:
- brand (primitive)
- engine (dependency on Engine bean)
- price (primitive)

Configure all properties in @Bean method.

### Exercise 2: Chain of dependencies

Create:
- Database bean (no dependencies)
- Repository bean (depends on Database)
- Service bean (depends on Repository)
- Controller bean (depends on Service)

Use parameter-based autowiring.

### Exercise 3: Manual vs autowired

Create the same configuration twice:
a) Using manual method calls (desktop())
b) Using autowired parameters (Computer com)

Compare flexibility and coupling.

### Exercise 4: Complex initialization

Create a bean with:
- Multiple dependencies (autowired)
- Complex setup logic
- Conditional configuration based on properties

---

## 🔗 Quick Summary

**Autowiring in Java configuration:**

**Manual dependency injection (tight coupling):**
```java
@Bean
public Alien alien() {
    Alien obj = new Alien();
    obj.setCom(desktop());  // Explicit method call
    return obj;
}
```

**Automatic dependency injection (loose coupling):**
```java
@Bean
public Alien alien(Computer com) {  // Parameter autowiring
    Alien obj = new Alien();
    obj.setCom(com);  // Use injected parameter
    return obj;
}
```

**Key points:**
- Spring injects parameters automatically
- Searches by type (autowire byType)
- @Autowired is optional on parameters
- Loose coupling with interface types

**Next topic:** Handling multiple implementations with @Primary! 🎊
