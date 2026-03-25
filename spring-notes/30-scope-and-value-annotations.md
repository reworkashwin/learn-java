# ⚙️ @Scope and @Value - Bean Scope and Value Injection

## Introduction

**Recap from Documents 27-29:**

We've mastered component scanning basics:

```java
@Component  // Automatic bean detection
@Primary    // Default when multiple beans exist
@Autowired  // Automatic dependency injection
@Qualifier  // Explicit bean selection
```

**Our current Alien class:**
```java
@Component
public class Alien {
    private int age;  // Always 0!
    
    @Autowired
    @Qualifier("laptop")
    private Computer com;
    
    public void code() {
        System.out.println("Age: " + age);  // Prints: Age: 0
        com.compile();
    }
}
```

**Two new problems:**

**Problem 1: Everything is singleton**
- Can we create multiple instances? (prototype scope)
- How do we control scope with @Component?

**Problem 2: Age is always 0**
- How do we set values without Java config?
- How do we inject primitive values?

**The instructor introduces:**

> "Now in this video we'll talk about two different annotations. One is @Scope and second is @Value."

**Today's solutions:** ⚙️

1. **@Scope** - Control bean scope (singleton vs prototype)
2. **@Value** - Inject values into fields

**In this lesson, you'll learn:**
- Bean scopes review (singleton vs prototype)
- Using @Scope annotation with @Component
- Placing @Scope on the class
- Testing prototype scope (multiple instances)
- The zero value problem (default initialization)
- Comparing Java config value assignment vs component scanning
- Using @Value annotation for value injection
- @Value vs hardcoding (private int age = 21)
- Benefits of external value injection
- Preview: property files integration
- Testing @Value injection

Say hello to configurable components! ⚙️

---

## Concept 1: Bean Scopes Review

### 🧠 What are bean scopes?

**Bean scope controls:**
- How many instances Spring creates
- When instances are created
- Lifecycle of instances

**Two main scopes:**

**Singleton (default):**
- One instance per container
- Shared by all consumers
- Created at startup (unless lazy)

**Prototype:**
- New instance per request
- Not shared
- Created when requested

**From Document 24 (Java config scopes):**

```java
@Bean
@Scope("prototype")
public Desktop desktop() {
    return new Desktop();
}
```

**But what about @Component classes?**

---

## Concept 2: Using @Scope with @Component

### 🧠 Introducing @Scope annotation

**The instructor explains:**

> "Remember when we talked about different scopes. We have singleton. We have prototype. If you want to use singleton or prototype, you can mention that with the help of @Scope annotation when we are getting a bean."

**@Scope annotation:**
- Controls instance creation
- Works with @Component
- Same scopes as Java config
- Applied to the class

### 🧠 Where to place @Scope?

**The instructor asks:**

> "How will you do that here? Now at this point we can actually guess where do we do that? Of course in the class."

**Placement: On the class with @Component!**

### ⚙️ Adding @Scope to Desktop

**Desktop.java (with @Scope):**
```java
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype")  // New instance each time!
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

**The instructor confirms:**

> "Just mention the @Scope annotation. And in the bracket you can mention what scope you want. So maybe you can mention prototype."

**@Scope("prototype") on the class!**

### ⚙️ Testing prototype scope

**Without @Scope (default singleton):**

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Desktop d1 = context.getBean(Desktop.class);
    Desktop d2 = context.getBean(Desktop.class);
    
    System.out.println(d1 == d2);  // Same instance?
}
```

**Output (singleton):**
```
Desktop object created
true
```

**Only one instance created! Same object returned twice!**

---

**With @Scope("prototype"):**

**Desktop.java:**
```java
@Component
@Scope("prototype")  // Multiple instances!
public class Desktop implements Computer {
    public Desktop() {
        System.out.println("Desktop object created");
    }
}
```

**Run same test...**

**Output (prototype):**
```
Desktop object created
Desktop object created
false
```

**Two instances created! Different objects!** ✅

### 💡 Scope applies to all uses

**Important: @Scope affects the entire bean**

**Alien has Desktop injected:**
```java
@Component
public class Alien {
    @Autowired
    @Qualifier("desktop")
    private Computer com;  // Gets Desktop
}
```

**If Desktop is prototype:**
- Each injection gets new Desktop instance
- Each getBean() gets new Desktop instance
- No sharing of Desktop

**If Desktop is singleton (default):**
- All injections share same Desktop instance
- All getBean() calls return same instance
- Shared globally

### ⚙️ Complete example with multiple beans

**Desktop.java (prototype):**
```java
@Component
@Scope("prototype")
public class Desktop implements Computer {
    public Desktop() {
        System.out.println("Desktop " + this.hashCode() + " created");
    }
}
```

**Laptop.java (singleton - default):**
```java
@Component  // No @Scope = singleton
public class Laptop implements Computer {
    public Laptop() {
        System.out.println("Laptop " + this.hashCode() + " created");
    }
}
```

**Test:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Desktop d1 = context.getBean(Desktop.class);
    Desktop d2 = context.getBean(Desktop.class);
    
    Laptop l1 = context.getBean(Laptop.class);
    Laptop l2 = context.getBean(Laptop.class);
}
```

**Output:**
```
Laptop 12345 created
Desktop 67890 created
Desktop 11111 created
```

**Laptop: One instance (singleton)**
**Desktop: Two instances (prototype)**

### 💡 Scope values

**Common scopes:**

```java
@Scope("singleton")   // Default - one instance
@Scope("prototype")   // New instance per request
```

**Web application scopes (with Spring MVC/Boot):**

```java
@Scope("request")     // New instance per HTTP request
@Scope("session")     // New instance per HTTP session
@Scope("application") // One instance per ServletContext
```

**Using constants (type-safe):**
```java
import org.springframework.beans.factory.config.ConfigurableBeanFactory;

@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
```

**The instructor mentions:**

> "And this can be done with all these annotations here."

**Works with:**
- @Component
- @Service
- @Repository
- @Controller
- Any stereotype annotation

---

## Concept 3: The Zero Value Problem

### 🧠 Default values issue

**The instructor points out:**

> "Let's solve the next problem. If you run this code again, look at the value which is zero. We don't want zero. We want a value right."

**Current Alien class:**
```java
@Component
public class Alien {
    private int age;  // Primitive default: 0
    
    @Autowired
    @Qualifier("laptop")
    private Computer com;
    
    public void code() {
        System.out.println("Age: " + age);  // Age: 0
        com.compile();
    }
    
    public int getAge() {
        return age;
    }
}
```

**Run the app:**
```java
Alien alien = context.getBean(Alien.class);
System.out.println("Age: " + alien.getAge());
```

**Output:**
```
Age: 0
```

**Why zero?**

**Java primitive defaults:**
- int → 0
- boolean → false
- double → 0.0
- long → 0L

**Spring creates:** `new Alien()`
**Result:** All fields have default values

**We never set age!**

### 🧠 What we had before

**The instructor recalls:**

> "Remember when we talked about app.config we were assigning some value to the age. We are not doing it now. And that's why default value is zero."

**In Java config (Document 22-26):**

```java
@Configuration
public class AppConfig {
    
    @Bean
    public Alien alien(Computer com) {
        Alien obj = new Alien();
        obj.setAge(25);  // Explicitly set age!
        obj.setCom(com);
        return obj;
    }
}
```

**We manually called setAge(25)!**

**But now with @Component:**
```java
@Component
public class Alien {
    private int age;  // Who sets this?
}
```

**No config method to set age!**

**Spring just calls `new Alien()` and that's it!**

---

## Concept 4: Hardcoding Values

### 🧠 Simple solution - initialize field

**The instructor suggests:**

> "But what if you want to change it? One thing you can do, you can assign the value here. Let's say 21."

**Alien.java (hardcoded):**
```java
@Component
public class Alien {
    private int age = 21;  // Hardcoded value
    
    @Autowired
    @Qualifier("laptop")
    private Computer com;
    
    public void code() {
        System.out.println("Age: " + age);
        com.compile();
    }
}
```

**Run the app:**
```
Age: 21
```

**Works!** ✅

### 💡 Problem with hardcoding

**This works but has limitations:**

**Limitation 1: Recompile required**
- Want age 25? → Change code → Recompile → Redeploy
- Want age 30? → Change code → Recompile → Redeploy

**Limitation 2: Same for all environments**
- Development: age = 21
- Testing: age = 21
- Production: age = 21
- Can't vary by environment!

**Limitation 3: Mixed with code**
- Configuration buried in class
- Hard to find all configured values
- No central configuration

**Real-world example:**

```java
@Component
public class EmailService {
    private String smtpHost = "smtp.gmail.com";  // Hardcoded
    private int smtpPort = 587;                  // Hardcoded
    private String username = "user@gmail.com";  // Hardcoded!
    private String password = "secret123";       // HARDCODED PASSWORD! 😱
}
```

**This is BAD:**
- Password in source code!
- Can't change without recompile
- Same credentials everywhere
- Security risk!

**Need better solution!**

---

## Concept 5: Using @Value Annotation

### 🧠 Introducing @Value

**The instructor introduces the solution:**

> "Sometimes you want to inject this value from some other property files. How will you inject a value? Not the object but the value. In that case we have to use another annotation which is called @Value."

**@Value annotation:**
- Injects primitive values (not objects)
- Alternative to object injection (@Autowired)
- Enables external configuration
- Applied to fields (like @Autowired)

### ⚙️ Adding @Value to age

**Alien.java (with @Value):**
```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    
    @Value("21")  // Inject value 21
    private int age;
    
    @Autowired
    @Qualifier("laptop")
    private Computer com;
    
    public void code() {
        System.out.println("Age: " + age);
        com.compile();
    }
    
    public int getAge() {
        return age;
    }
}
```

**The instructor shows:**

> "And in this you can mention 21."

**@Value("21") injects the value 21!**

### 🧪 Test @Value

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Alien alien = context.getBean(Alien.class);
    System.out.println("Age: " + alien.getAge());
    alien.code();
}
```

**Output:**
```
Alien object created
Desktop object created
Laptop object created
Age: 21
Coding...
Compiling using Laptop
```

**The instructor confirms:**

> "And if you run this now you can see the value we got is 21."

**Works perfectly!** ✅

---

## Concept 6: @Value vs Hardcoding

### 🧠 What's the difference?

**The instructor addresses the question:**

> "Now you will be saying, what's the difference between assigning a value like this? Or directly assign value 21 to the variable?"

**Two approaches look similar:**

**Approach 1: Hardcoded**
```java
private int age = 21;
```

**Approach 2: @Value**
```java
@Value("21")
private int age;
```

**Both result in age = 21, so what's the difference?**

### 🧠 The key difference

**The instructor explains:**

> "When you assign the value 21 to the variable, you are hardcoding it. But when you use the annotation like @Value, basically you can inject this value from outside the code."

**Hardcoding:** Value fixed in code
```java
private int age = 21;  // Locked in code
```

**@Value:** Value can come from outside
```java
@Value("21")  // Currently hardcoded, but...
private int age;
```

**Current use:** Still hardcoded "21"

**Future capability:** Value from external source!

### 💡 External value sources

**@Value can read from:**

**Property files:**
```java
@Value("${alien.age}")  // Reads from application.properties
private int age;
```

**application.properties:**
```properties
alien.age=21
```

**Environment variables:**
```java
@Value("${USER_AGE}")  // From environment
private int age;
```

**System properties:**
```java
@Value("${age}")  // From -Dage=21
private int age;
```

**Default values:**
```java
@Value("${alien.age:25}")  // Default 25 if not found
private int age;
```

**SpEL (Spring Expression Language):**
```java
@Value("#{systemProperties['user.country']}")
private String country;

@Value("#{20 + 5}")  // Expressions!
private int age;
```

### 💡 Benefits of @Value

**Benefit 1: Externalized configuration**
```java
@Value("${alien.age}")
private int age;
```

**Change value without recompile:**
- Edit application.properties
- Restart app
- New value used!

---

**Benefit 2: Environment-specific values**

**application-dev.properties:**
```properties
alien.age=10  # Young for testing
```

**application-prod.properties:**
```properties
alien.age=50  # Mature for production
```

**Same code, different values!**

---

**Benefit 3: Centralized configuration**

**application.properties:**
```properties
# All configuration in one place
alien.age=21
alien.laptop=laptop
email.host=smtp.gmail.com
email.port=587
database.url=jdbc:mysql://localhost:3306/mydb
```

**Easy to review all settings!**

---

**Benefit 4: Security**
```java
@Value("${db.password}")  // From secure vault
private String password;
```

**Password not in code:**
- Stored securely elsewhere
- Different per environment
- Can be encrypted
- Externally managed

---

### 🧠 The instructor's preview

**The instructor hints:**

> "Maybe you have a property file in which you have all the values. You can specify the values. You can specify those property names here. Again, how to do that will be a different thing. But there is an option that you can inject the value."

**Coming in future lessons:**
- Creating property files
- Reading from property files
- ${property.name} syntax
- Multiple property files
- Profile-specific properties

**For now: @Value concept established!**

---

## Concept 7: Different Value Types

### ⚙️ Injecting different types

**@Value works with many types:**

**Integers:**
```java
@Value("21")
private int age;

@Value("1000000")
private long population;
```

**Strings:**
```java
@Value("John Doe")
private String name;

@Value("john@example.com")
private String email;
```

**Booleans:**
```java
@Value("true")
private boolean active;

@Value("false")
private boolean premium;
```

**Doubles:**
```java
@Value("99.99")
private double price;

@Value("3.14159")
private double pi;
```

**Lists (with SpEL):**
```java
@Value("#{'${allowed.ips}'.split(',')}")
private List<String> allowedIps;
```

**Spring converts string to appropriate type automatically!**

### ⚙️ Multiple @Value annotations

**Alien.java (multiple values):**
```java
@Component
public class Alien {
    
    @Value("21")
    private int age;
    
    @Value("Navin")
    private String name;
    
    @Value("true")
    private boolean active;
    
    @Autowired
    @Qualifier("laptop")
    private Computer com;
    
    public void code() {
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Active: " + active);
        com.compile();
    }
}
```

**Output:**
```
Name: Navin
Age: 21
Active: true
Coding...
Compiling using Laptop
```

**Can inject multiple values!** ✅

---

## ✅ Key Takeaways

### About @Scope Annotation

1. **Controls bean instance creation**
   ```java
   @Component
   @Scope("prototype")
   public class Desktop { ... }
   ```

2. **Placed on the class with @Component**
   - Not on individual methods
   - Applies to entire bean
   - Affects all injection points

3. **Common scope values**
   - `"singleton"` - One instance (default)
   - `"prototype"` - New instance per request
   - `"request"` - One per HTTP request (web)
   - `"session"` - One per HTTP session (web)

### About @Value Annotation

1. **Injects values, not objects**
   ```java
   @Value("21")
   private int age;
   ```

2. **Alternative to hardcoding**
   - Can come from external sources
   - Property files (future lesson)
   - Environment variables
   - System properties

3. **Works with multiple types**
   - Primitives: int, boolean, double, etc.
   - Strings
   - Collections (with SpEL)
   - Automatic type conversion

### About External Configuration

1. **@Value enables externalization**
   ```java
   @Value("${property.name}")
   ```

2. **Benefits over hardcoding**
   - Change without recompile
   - Environment-specific values
   - Centralized configuration
   - Better security

3. **Integration with property files**
   - application.properties (coming soon)
   - Profile-specific properties
   - SpEL expressions
   - Default values

---

## 💡 Final Insights

### The Configuration Evolution

**Phase 1: XML (everything external)**
```xml
<bean id="alien" class="Alien">
    <property name="age" value="21" />
</bean>
```
- All configuration in XML
- Completely external
- Very verbose

---

**Phase 2: Java Config (programmatic)**
```java
@Bean
public Alien alien() {
    Alien obj = new Alien();
    obj.setAge(21);  // Hardcoded in config
    return obj;
}
```
- Configuration in Java
- More type-safe
- Still explicit value setting

---

**Phase 3: Component Scanning + @Value (hybrid)**
```java
@Component
public class Alien {
    @Value("21")  // Or from property file
    private int age;
}
```
- Classes self-configure
- Values can be external
- Best of both worlds

---

**Phase 4: Property Files (fully external - coming)**
```java
@Component
public class Alien {
    @Value("${alien.age}")  // Reads from file
    private int age;
}
```
```properties
alien.age=21
```
- Complete separation
- Easy to change
- Modern best practice

---

### Real-World Configuration Example

**Before (hardcoded nightmare):**

```java
@Component
public class EmailService {
    private String host = "smtp.gmail.com";
    private int port = 587;
    private String username = "user@example.com";
    private String password = "secretpass123";  // 😱
    
    // Hardcoded everywhere!
}
```

**Problems:**
- Password in source code
- Can't change without recompile
- Same for all environments
- Security disaster

---

**After (with @Value):**

```java
@Component
public class EmailService {
    @Value("${email.host}")
    private String host;
    
    @Value("${email.port}")
    private int port;
    
    @Value("${email.username}")
    private String username;
    
    @Value("${email.password}")
    private String password;
    
    // Values from external properties!
}
```

**application-dev.properties:**
```properties
email.host=localhost
email.port=1025
email.username=dev@test.com
email.password=devpass
```

**application-prod.properties:**
```properties
email.host=smtp.gmail.com
email.port=587
email.username=prod@company.com
email.password=${EMAIL_PASSWORD}  # From environment!
```

**Benefits:**
- No password in code ✅
- Different per environment ✅
- Change without recompile ✅
- Centralized configuration ✅

---

### Scope Use Cases

**Use singleton (default) when:**
- Stateless services
- Shared resources (database connections)
- Expensive to create objects
- **Most common case** ⭐

```java
@Component  // Singleton by default
public class UserService {
    // No state, safe to share
}
```

---

**Use prototype when:**
- Stateful objects
- User-specific data
- Thread-safety concerns
- Different configuration per use

```java
@Component
@Scope("prototype")
public class UserSession {
    private String username;
    private List<String> cart;
    // State! Need separate instance per user
}
```

---

**Use request/session (web) when:**
- Web application
- HTTP request/session specific data
- Spring MVC/Boot

```java
@Component
@Scope("request")
public class RequestContext {
    // New instance per HTTP request
}
```

---

### @Value Advanced Preview

**Current usage (literal values):**
```java
@Value("21")
private int age;
```

**Property references (coming soon):**
```java
@Value("${alien.age}")
private int age;
```

**With defaults:**
```java
@Value("${alien.age:25}")  // 25 if property not found
private int age;
```

**SpEL expressions:**
```java
@Value("#{systemProperties['user.home']}")
private String homeDir;

@Value("#{T(java.lang.Math).random() * 100}")
private double randomValue;
```

**Combining property and SpEL:**
```java
@Value("#{'${project.name}'.toUpperCase()}")
private String projectName;
```

**Stay tuned for property files lesson!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Wrong scope syntax

**Wrong:**
```java
@Scope(prototype)  // Not a string!
```

**Correct:**
```java
@Scope("prototype")  // Must be string
```

### Mistake 2: Forgetting quotes in @Value

**Wrong:**
```java
@Value(21)  // Compile error!
```

**Correct:**
```java
@Value("21")  // Must be string
```

### Mistake 3: Using @Scope with @Bean

**Mixing approaches (confusing):**
```java
@Configuration
public class AppConfig {
    @Bean
    @Scope("prototype")  // On @Bean method
    public Desktop desktop() {
        return new Desktop();
    }
}

@Component
@Scope("prototype")  // On @Component class
public class Laptop { ... }
```

**Pick one approach:**
- Java config (@Bean) or
- Component scanning (@Component)

### Mistake 4: Hardcoding when @Value is better

**Not ideal:**
```java
@Component
public class Config {
    private String apiKey = "secret123";  // Hardcoded
}
```

**Better:**
```java
@Component
public class Config {
    @Value("${api.key}")  // External
    private String apiKey;
}
```

### Mistake 5: @Value without quotes

**Wrong:**
```java
@Value(${alien.age})  // Missing quotes!
```

**Correct:**
```java
@Value("${alien.age}")  // Quotes required
```

---

## 🎯 Practice Exercises

### Exercise 1: Prototype scope testing

Create a ShoppingCart component with prototype scope. Get bean twice and verify they're different instances with different hashCodes.

### Exercise 2: Multiple @Value fields

Create a Product component with @Value fields for name, price, quantity. Inject different types (String, double, int). Test all values injected correctly.

### Exercise 3: Singleton vs Prototype

Create two components: CacheManager (singleton) and UserSession (prototype). Create multiple instances. Verify CacheManager is same, UserSession is different.

### Exercise 4: @Value type conversion

Use @Value to inject: integer, boolean, double, long. Verify automatic type conversion works.

### Exercise 5: Mixed @Autowired and @Value

Create a OrderService with @Autowired dependency (Repository) and @Value fields (maxOrders, defaultDiscount). Test both injection types work together.

### Exercise 6: Request scope (if web app)

Create RequestLogger component with request scope in Spring Boot app. Verify new instance per HTTP request.

---

## 🔗 Quick Summary

**@Scope: Control bean instances**

**Singleton (default):**
```java
@Component  // One instance
public class UserService { ... }
```

**Prototype:**
```java
@Component
@Scope("prototype")  // New instance each time
public class UserSession { ... }
```

---

**@Value: Inject values**

**Hardcoded (not ideal):**
```java
private int age = 21;
```

**With @Value (better):**
```java
@Value("21")
private int age;
```

**From property file (best - coming soon):**
```java
@Value("${alien.age}")
private int age;
```

**Benefits:**
- ✅ External configuration
- ✅ Environment-specific values
- ✅ Change without recompile
- ✅ Centralized management

**Next topic:** Property files and ${...} syntax! 📄
