# 🔌 @Autowired - Automatic Dependency Injection

## Introduction

**Recap from last lesson:**

We learned about @Component and @ComponentScan:

```java
@Component
public class Desktop implements Computer { ... }

@Component
public class Laptop implements Computer { ... }

@Component
public class Alien {
    private Computer com;  // Still null!
}

@Configuration
@ComponentScan(basePackages = "com.telusko")
public class AppConfig { }
```

**What we achieved:**
- ✅ Objects created automatically
- ✅ No manual @Bean methods needed

**What we discovered:**
- ❌ Dependencies still null!
- ❌ NullPointerException when calling com.compile()

**The problem:**

```java
Alien object created
Desktop object created
Laptop object created
Exception in thread "main" java.lang.NullPointerException
    at com.telusko.app.Alien.code(Alien.java:15)
```

**Spring created the beans but didn't wire them together!**

**The instructor reminds us:**

> "So let's solve this problem. So basically what is happening is we are not able to find the values for age and com. We are just getting this object. Spring Framework is creating your Alien object with the default values for age and com. The default value for age is zero. And that's why you can see in the output, you got zero here. But what about the com? By default is null."

**Today's solution: @Autowired!** ⚡

**In this lesson, you'll learn:**
- Using @Autowired for automatic dependency injection
- How @Autowired tells Spring to search the container
- Handling multiple beans of the same type (NoUniqueBeanDefinitionException)
- Using @Qualifier to specify exact bean by name
- Bean naming in @Component (class name with lowercase first letter)
- Custom bean names in @Component
- Using @Primary as alternative to @Qualifier
- Three types of dependency injection:
  - Field injection (directly on field)
  - Constructor injection (via constructor)
  - Setter injection (via setter method)
- Best practices: when to use each injection type

Say goodbye to null dependencies! 🔌

---

## Concept 1: The Current Problem

### 🧠 Default values problem

**Current state:**

**Alien.java:**
```java
@Component
public class Alien {
    private int age;         // Default: 0
    private Computer com;    // Default: null
    
    public Alien() {
        System.out.println("Alien object created");
    }
    
    public void code() {
        System.out.println("Coding...");
        com.compile();  // NullPointerException!
    }
    
    // Getters and setters...
}
```

**When Spring creates Alien:**
```java
Alien alien = new Alien();
// age = 0 (primitive default)
// com = null (reference default)
```

**No dependency injection happened!**

### 🧠 What Spring needs to know

**The instructor explains:**

> "We have to say, 'Hey, you know this com object is created inside the container. Just search for it.' And the way you can do that is by using something called an @Autowired annotation."

**Spring's confusion:**
```java
private Computer com;  // "Should I inject something here?"
```

**Spring needs explicit instruction:**
```java
@Autowired  // "Yes! Search container and inject Computer bean!"
private Computer com;
```

**@Autowired tells Spring: "Fill this dependency automatically!"**

---

## Concept 2: Introducing @Autowired

### 🧠 What is @Autowired?

**@Autowired annotation means:**
- "Spring, inject a bean here"
- "Search the container for matching bean"
- "Wire dependency automatically"
- "No manual injection needed"

**The instructor explains:**

> "When you say @Autowired, you're saying, 'Spring, hey Spring, go to your container and you will find the com object there.'"

### ⚙️ Adding @Autowired to Alien

**Alien.java (with @Autowired):**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    private int age;
    
    @Autowired  // Automatic dependency injection!
    private Computer com;
    
    public Alien() {
        System.out.println("Alien object created");
    }
    
    public void code() {
        System.out.println("Coding...");
        com.compile();  // Will work now!
    }
    
    public int getAge() {
        return age;
    }
    
    public void setAge(int age) {
        this.age = age;
    }
    
    public Computer getCom() {
        return com;
    }
    
    public void setCom(Computer com) {
        this.com = com;
    }
}
```

**What happens now:**

1. **Spring creates Alien instance**
   ```java
   Alien alien = new Alien();
   ```

2. **Spring sees @Autowired on com field**
   ```java
   @Autowired
   private Computer com;  // "I need to inject something here!"
   ```

3. **Spring searches container for Computer beans**
   - Finds Desktop (implements Computer)
   - Finds Laptop (implements Computer)

4. **Wait... two beans found!** ⚠️

---

## Concept 3: The Multiple Beans Problem

### 🧪 Test with @Autowired

**Current classes:**

**Desktop.java:**
```java
@Component
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

**Laptop.java:**
```java
@Component
public class Laptop implements Computer {
    public Laptop() {
        System.out.println("Laptop object created");
    }
    
    @Override
    public void compile() {
        System.out.println("Compiling using Laptop");
    }
}
```

**Both implement Computer!**

**Run the app...**

**Error:**
```
NoUniqueBeanDefinitionException: No qualifying bean of type 'Computer' available: 
expected single matching bean but found 2: desktop,laptop
```

**The instructor says:**

> "Now, even the moment you do that, you can see we got different error. It says 'no qualifying bean available.' Actually there are, but there are two. We just want one."

### 🧠 Why this error?

**Spring's dilemma:**

```java
@Autowired
private Computer com;  // "Which Computer bean should I inject?"
```

**Container has:**
- Desktop bean (implements Computer) ✅
- Laptop bean (implements Computer) ✅

**Spring can't decide:**
- Inject Desktop? Maybe...
- Inject Laptop? Maybe...
- Both are valid Computer beans!
- **Error: Ambiguous!** ❌

**Spring requires unique match for @Autowired!**

### 🧪 Temporary workaround - comment one bean

**The instructor says:**

> "We know how to solve this. We have done this before. So the problem is we have two classes Desktop and Laptop. Both are doing the same thing. Just for time being, I will comment this. Let's say we don't want to work with Laptop, we just have one which is Desktop."

**Laptop.java (commented):**
```java
// @Component  ← Commented out!
public class Laptop implements Computer {
    // Now Spring won't create Laptop bean
}
```

**Only Desktop remains:**
```java
@Component  ← Active
public class Desktop implements Computer { ... }
```

**Run again...**

**Output:**
```
Alien object created
Desktop object created
Coding...
Compiling using Desktop
```

**Success!** ✅

**Works because only one Computer bean exists now!**

### 🧠 But we want both beans!

**The instructor acknowledges:**

> "But then we do have Laptop, right? What if we have two components which are same, basically they are implementing the same interface?"

**Real-world scenario:**
- Multiple implementations of same interface
- Different environments (dev/prod)
- Different strategies (fast/slow)
- Different vendors (AWS/Azure)

**Need solution for multiple beans!**

---

## Concept 4: Using @Qualifier

### 🧠 Explicit bean selection

**The instructor solves it:**

> "So the way you can solve this problem is very simple. And in fact we have used this before. One thing you can do is you can use something called @Qualifier. You can specify the name of your bean."

**@Qualifier annotation:**
- Specifies exact bean by name
- Resolves ambiguity
- Works with @Autowired
- Same concept from Java config (Document 26)

### ⚙️ Adding @Qualifier

**Alien.java:**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    private int age;
    
    @Autowired
    @Qualifier("laptop")  // Inject bean named "laptop"
    private Computer com;
    
    public void code() {
        System.out.println("Coding...");
        com.compile();
    }
    
    // Rest of class...
}
```

**Now Spring knows:**
- Search for Computer bean ✅
- Specifically named "laptop" ✅
- Inject that one ✅

**But wait... what is the bean name?**

---

## Concept 5: Bean Naming in @Component

### 🧠 How @Component names beans

**The instructor asks:**

> "Now this is tricky. What do you mean by name of a bean? What is the name of a bean here? Because when we are using AppConfig, we knew that the method name is your bean name."

**Recall Java config naming:**
```java
@Bean
public Desktop desktop() { ... }
    //    ^^^^^^^ Method name = bean name
```

**Bean name:** "desktop"

**But with @Component?**

```java
@Component
public class Desktop { ... }
    //      ^^^^^^^ Class name... but what's the bean name?
```

### 🧠 Default naming convention

**The instructor reveals:**

> "Let's try with small characters of that class name. So if I say laptop, let's see if that works."

**Rule: Class name with lowercase first letter!**

**Examples:**

| Class Name | Bean Name |
|------------|-----------|
| `Desktop` | `desktop` |
| `Laptop` | `laptop` |
| `Alien` | `alien` |
| `UserService` | `userService` |
| `OrderRepository` | `orderRepository` |

**Standard Java convention: camelCase starting with lowercase!**

### ⚙️ Testing with bean names

**Desktop.java:**
```java
@Component
public class Desktop implements Computer {
    // Bean name: "desktop"
}
```

**Laptop.java:**
```java
@Component
public class Laptop implements Computer {
    // Bean name: "laptop"
}
```

**Alien.java (inject laptop):**
```java
@Component
public class Alien {
    @Autowired
    @Qualifier("laptop")  // Bean name: "laptop"
    private Computer com;
}
```

**Run it...**

**Output:**
```
Alien object created
Desktop object created
Laptop object created
Coding...
Compiling using Laptop
```

**The instructor confirms:**

> "And it worked. So your bean name is basically your class name. But you have to make sure that your first letter is small."

**Works perfectly!** ✅

### ⚙️ Testing with desktop

**Change to desktop:**
```java
@Autowired
@Qualifier("desktop")  // Bean name: "desktop"
private Computer com;
```

**Run it...**

**Output:**
```
Alien object created
Desktop object created
Laptop object created
Coding...
Compiling using Desktop
```

**The instructor confirms:**

> "In fact, you can do it for desktop as well. You have to make sure they are small and even desktop works."

**Both work!** ✅

---

## Concept 6: Custom Bean Names

### 🧠 Overriding default names

**The instructor asks:**

> "But what if you want to have a different name? You can do that. You can just go back here and you can specify the name of your bean."

**Custom name syntax:**
```java
@Component("customName")
public class Desktop { ... }
```

### ⚙️ Creating custom name

**Desktop.java (with custom name):**
```java
@Component("com2")  // Custom bean name!
public class Desktop implements Computer {
    // Bean name: "com2" (NOT "desktop")
    
    public Desktop() {
        System.out.println("Desktop object created");
    }
    
    @Override
    public void compile() {
        System.out.println("Compiling using Desktop");
    }
}
```

**Bean name changed: "desktop" → "com2"**

### 🧪 Test with old name (fails)

**Alien.java (still using "desktop"):**
```java
@Autowired
@Qualifier("desktop")  // Looking for "desktop" bean
private Computer com;
```

**Run it...**

**Error:**
```
NoSuchBeanDefinitionException: No bean named 'desktop' available
```

**The instructor demonstrates:**

> "Let's say if you want this to be com2. Now it will search for com2, not the desktop. So if you come back here, run and you can see we got error."

**Bean name no longer "desktop"!**

### ⚙️ Fix with custom name

**Alien.java (updated):**
```java
@Autowired
@Qualifier("com2")  // Match custom name!
private Computer com;
```

**Run it...**

**Output:**
```
Alien object created
Desktop object created
Laptop object created
Coding...
Compiling using Desktop
```

**The instructor confirms:**

> "So you have to make sure this is com2. Run. So that's how basically you can play with it. Yes, we can change the name of your bean just by specifying the name of your bean just next to your component."

**Works!** ✅

### 💡 When to use custom names

**Use default names (recommended):**
```java
@Component  // Bean name: "userService"
public class UserService { ... }
```

**Use custom names when:**
- Need shorter names
- Multiple beans of same class (different configs)
- Specific naming convention required

**Example: Multiple data sources**
```java
@Component("primaryDB")
public class DataSource { ... }

@Component("backupDB")
public class DataSource { ... }
```

---

## Concept 7: Using @Primary as Alternative

### 🧠 Avoiding @Qualifier

**The instructor asks:**

> "What if I don't want to use @Qualifier? Do we have other options? Because @Qualifier will search for the name just to solve the confusion. But if you don't want to use @Qualifier, we have one more choice which is @Primary."

**@Primary annotation:**
- Marks default bean
- Used when multiple beans exist
- No need to specify name
- Same concept from Document 26

### ⚙️ Using @Primary

**Desktop.java (marked as primary):**
```java
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary  // Default choice!
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

**Laptop.java (not primary):**
```java
@Component
public class Laptop implements Computer {
    // Available but not default
}
```

**Alien.java (no @Qualifier needed!):**
```java
@Component
public class Alien {
    
    @Autowired  // No @Qualifier - uses @Primary bean
    private Computer com;
    
    public void code() {
        System.out.println("Coding...");
        com.compile();
    }
}
```

**Result: Desktop injected automatically!**

### 💡 @Primary vs @Qualifier

**@Primary approach:**
```java
// Desktop.java
@Component
@Primary
public class Desktop { ... }

// Alien.java
@Autowired  // Gets Desktop (primary)
private Computer com;
```

**Advantages:**
- No need to specify name
- Works everywhere by default
- One place to mark preference

**@Qualifier approach:**
```java
// Desktop.java
@Component
public class Desktop { ... }

// Alien.java
@Autowired
@Qualifier("desktop")  // Explicit choice
private Computer com;
```

**Advantages:**
- More explicit
- Different choices in different classes
- Override @Primary if needed

**Priority: @Qualifier > @Primary**

---

## Concept 8: Three Types of Dependency Injection

### 🧠 Introduction to injection types

**The instructor introduces:**

> "If you talk about @Autowired, this is basically injecting the object. Right? So the injection can be done on three levels here. One is field injection. Second is constructor injection and third one is setter injection."

**Three types:**
1. **Field injection** - directly on field
2. **Constructor injection** - via constructor
3. **Setter injection** - via setter method

**All achieve same goal: inject dependency!**

---

## Concept 9: Field Injection

### 🧠 What is field injection?

**The instructor explains:**

> "When we use @Autowired here, this is basically a field injection because we are injecting the object directly to a field."

**Field injection: Annotate field directly**

### ⚙️ Field injection example

**Alien.java (field injection):**
```java
@Component
public class Alien {
    private int age;
    
    @Autowired  // Field injection!
    private Computer com;
    
    public void code() {
        com.compile();  // Works!
    }
}
```

**How it works:**

1. **Spring creates Alien instance**
   ```java
   Alien alien = new Alien();
   ```

2. **Spring sees @Autowired on field**
   ```java
   @Autowired
   private Computer com;
   ```

3. **Spring uses reflection to set field**
   ```java
   // Behind the scenes (simplified)
   field.setAccessible(true);
   field.set(alien, desktopBean);
   ```

4. **Field populated!**
   ```java
   alien.com // Now points to Desktop bean
   ```

**Injection happens after construction!**

### 💡 Field injection characteristics

**Advantages:**
- Clean and concise
- Less boilerplate code
- Easy to read

**Disadvantages:**
- Uses reflection (bypasses private)
- Hard to test (can't inject mocks easily)
- Dependencies not obvious in constructor
- No immutability (field not final)
- Most controversial injection type

**Common in:**
- Simple applications
- Quick prototypes
- Legacy code

---

## Concept 10: Constructor Injection

### 🧠 What is constructor injection?

**The instructor explains:**

> "Next, we can do it for the constructor. So maybe you can have a constructor here which takes a parameter as com or Computer object. And then you can write @Autowired on top of it. That becomes a constructor injection."

**Constructor injection: Annotate constructor**

### ⚙️ Constructor injection example

**Alien.java (constructor injection):**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    private int age;
    private Computer com;
    
    // No-arg constructor
    public Alien() {
        System.out.println("Alien object created");
    }
    
    // Constructor for injection
    @Autowired  // Constructor injection!
    public Alien(Computer com) {
        this.com = com;
        System.out.println("Alien object created with Computer");
    }
    
    public void code() {
        System.out.println("Coding...");
        com.compile();
    }
    
    // Getters and setters...
}
```

**How it works:**

1. **Spring sees @Autowired on constructor**
   ```java
   @Autowired
   public Alien(Computer com) { ... }
   ```

2. **Spring resolves Computer bean**
   - Finds Desktop or Laptop bean
   - Resolves using @Primary or @Qualifier

3. **Spring calls constructor with bean**
   ```java
   Computer desktopBean = container.getBean(Desktop.class);
   Alien alien = new Alien(desktopBean);
   ```

4. **Dependency injected during construction!**

**Injection at construction time!**

### ⚙️ With @Qualifier

**Constructor injection with @Qualifier:**
```java
@Component
public class Alien {
    private Computer com;
    
    @Autowired
    public Alien(@Qualifier("laptop") Computer com) {
        this.com = com;
        System.out.println("Alien created with " + com.getClass().getSimpleName());
    }
    
    public void code() {
        com.compile();
    }
}
```

**@Qualifier on parameter!**

### 💡 Constructor injection characteristics

**Advantages:**
- Dependencies explicit in constructor
- Easy to test (just call constructor with mocks)
- Immutability (can make field final)
- No reflection needed
- Dependencies required (can't create without them)
- **Best practice in modern Spring!** ⭐

**Example with final field:**
```java
@Component
public class Alien {
    private final Computer com;  // Immutable!
    
    @Autowired
    public Alien(Computer com) {
        this.com = com;  // Set once, never changes
    }
}
```

**Disadvantages:**
- More verbose
- Many dependencies = long constructor

**Recommended for:**
- Production code
- Required dependencies
- Testing-friendly code
- Modern Spring applications

---

## Concept 11: Setter Injection

### 🧠 What is setter injection?

**The instructor explains:**

> "Or you can write @Autowired instead of here to your setter. So wherever you have the setter for com, just write @Autowired here. So this will do the work."

**Setter injection: Annotate setter method**

### ⚙️ Setter injection example

**Alien.java (setter injection):**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
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
    
    public int getAge() {
        return age;
    }
    
    public void setAge(int age) {
        this.age = age;
    }
    
    public Computer getCom() {
        return com;
    }
    
    @Autowired  // Setter injection!
    public void setCom(Computer com) {
        this.com = com;
        System.out.println("Computer injected via setter");
    }
}
```

**How it works:**

1. **Spring creates Alien instance**
   ```java
   Alien alien = new Alien();
   ```

2. **Spring sees @Autowired on setter**
   ```java
   @Autowired
   public void setCom(Computer com) { ... }
   ```

3. **Spring resolves Computer bean**
   - Finds Desktop or Laptop
   - Resolves using @Primary or @Qualifier

4. **Spring calls setter with bean**
   ```java
   Computer desktopBean = container.getBean(Desktop.class);
   alien.setCom(desktopBean);
   ```

5. **Dependency injected after construction!**

**Injection happens after construction via setter!**

### ⚙️ With @Qualifier

**Setter injection with @Qualifier:**
```java
@Component
public class Alien {
    private Computer com;
    
    @Autowired
    @Qualifier("desktop")  // On setter
    public void setCom(Computer com) {
        this.com = com;
    }
    
    public void code() {
        com.compile();
    }
}
```

### 💡 Setter injection characteristics

**Advantages:**
- Optional dependencies (can create without calling setter)
- Reconfigurable (can change dependency later)
- Familiar JavaBean pattern
- No reflection on private fields

**Disadvantages:**
- Dependencies not obvious
- Can't use final fields
- Partial initialization possible

**Recommended for:**
- Optional dependencies
- When reconfiguration needed
- JavaBean-style applications

---

## Concept 12: Best Practices

### 🧠 The instructor's recommendation

**The instructor advises:**

> "It is always preferred to write @Autowired where you have your setter. So if you don't use field injection, use setter here."

**Ranking (instructor's view):**
1. **Setter injection** ✅ (preferred over field)
2. **Field injection** (okay but not ideal)
3. **Constructor injection** (not mentioned as preference)

**Modern Spring community ranking:**
1. **Constructor injection** ⭐⭐⭐ (best practice)
2. **Setter injection** ⭐⭐ (optional dependencies)
3. **Field injection** ⭐ (quick prototypes only)

### 💡 When to use each type

**Use constructor injection when:**
- Dependencies are required
- Want immutability (final fields)
- Writing testable code
- Following modern best practices
- **Most common choice!** ⭐

```java
@Component
public class UserService {
    private final UserRepository repo;  // Required, immutable
    
    @Autowired
    public UserService(UserRepository repo) {
        this.repo = repo;
    }
}
```

**Use setter injection when:**
- Dependencies are optional
- Need to change dependency at runtime
- Working with JavaBeans
- Following older patterns

```java
@Component
public class EmailService {
    private Logger logger;  // Optional
    
    @Autowired(required = false)  // Optional!
    public void setLogger(Logger logger) {
        this.logger = logger;
    }
}
```

**Use field injection when:**
- Prototyping quickly
- Simple applications
- Not worried about testing
- **Avoid in production code!**

```java
@Component
public class SimpleController {
    @Autowired  // Quick but not ideal
    private SimpleService service;
}
```

### 💡 Multiple dependencies example

**Constructor with many dependencies:**
```java
@Component
public class OrderService {
    private final OrderRepository orderRepo;
    private final CustomerRepository customerRepo;
    private final EmailService emailService;
    private final PaymentService paymentService;
    
    @Autowired
    public OrderService(
        OrderRepository orderRepo,
        CustomerRepository customerRepo,
        EmailService emailService,
        PaymentService paymentService
    ) {
        this.orderRepo = orderRepo;
        this.customerRepo = customerRepo;
        this.emailService = emailService;
        this.paymentService = paymentService;
    }
}
```

**All dependencies clear from constructor signature!**

---

## ✅ Key Takeaways

### About @Autowired Annotation

1. **Tells Spring to inject dependency automatically**
   ```java
   @Autowired
   private Computer com;  // Spring injects bean
   ```

2. **Searches container by type**
   - Looks for beans matching the field/parameter type
   - Injects matching bean

3. **Requires unique bean or disambiguation**
   - One bean of type → inject it
   - Multiple beans → use @Qualifier or @Primary
   - No beans → error

### About @Qualifier Annotation

1. **Specifies bean by name**
   ```java
   @Autowired
   @Qualifier("laptop")  // Inject bean named "laptop"
   private Computer com;
   ```

2. **Resolves ambiguity**
   - Multiple beans of same type
   - Explicitly choose which one
   - Works with all injection types

3. **Case-sensitive bean names**
   - Must match exact bean name
   - "laptop" ≠ "Laptop"

### About Bean Naming in @Component

1. **Default: class name with lowercase first letter**
   ```java
   @Component
   public class Desktop { ... }
   // Bean name: "desktop"
   ```

2. **Custom names possible**
   ```java
   @Component("com2")
   public class Desktop { ... }
   // Bean name: "com2"
   ```

3. **Convention: camelCase**
   - UserService → userService
   - OrderRepository → orderRepository

### About @Primary Annotation

1. **Marks default bean**
   ```java
   @Component
   @Primary
   public class Desktop { ... }
   ```

2. **No need for @Qualifier**
   - Automatically chosen when multiple beans exist
   - Still can override with @Qualifier

3. **Priority: @Qualifier > @Primary**

### About Injection Types

1. **Field injection: annotate field**
   ```java
   @Autowired
   private Computer com;
   ```

2. **Constructor injection: annotate constructor**
   ```java
   @Autowired
   public Alien(Computer com) { ... }
   ```

3. **Setter injection: annotate setter**
   ```java
   @Autowired
   public void setCom(Computer com) { ... }
   ```

### About Best Practices

1. **Constructor injection = modern best practice**
   - Required dependencies
   - Immutability with final
   - Easy testing

2. **Setter injection = optional dependencies**
   - Can create object without dependency
   - Reconfigurable

3. **Field injection = avoid in production**
   - Hard to test
   - Not recommended
   - Okay for quick prototypes

---

## 💡 Final Insights

### The Complete Picture

**From XML to annotations:**

**Phase 1: XML (Document 1-21)**
```xml
<bean id="desktop" class="Desktop" />
<bean id="alien" class="Alien">
    <property name="com" ref="desktop" />
</bean>
```

**Phase 2: Java Config (Document 22-26)**
```java
@Bean
public Alien alien(@Qualifier("desktop") Computer com) {
    Alien obj = new Alien();
    obj.setCom(com);
    return obj;
}
```

**Phase 3: Component Scanning (Document 27-28)**
```java
@Component
public class Alien {
    @Autowired
    @Qualifier("desktop")
    private Computer com;
}
```

**Each phase reduces configuration!**

### Disambiguation Techniques Summary

**When multiple beans of same type exist:**

**Option 1: @Qualifier (explicit)**
```java
@Component
public class Desktop { ... }  // Bean: "desktop"

@Component
public class Laptop { ... }   // Bean: "laptop"

@Component
public class Alien {
    @Autowired
    @Qualifier("desktop")  // Explicit choice
    private Computer com;
}
```

**Option 2: @Primary (default)**
```java
@Component
@Primary  // Default choice
public class Desktop { ... }

@Component
public class Laptop { ... }

@Component
public class Alien {
    @Autowired  // Gets Desktop (primary)
    private Computer com;
}
```

**Option 3: Custom bean names**
```java
@Component("primaryComp")
public class Desktop { ... }

@Component("backupComp")
public class Laptop { ... }

@Component
public class Alien {
    @Autowired
    @Qualifier("primaryComp")
    private Computer com;
}
```

**Choose based on use case!**

### Real-World Injection Example

**Service layer with constructor injection:**

```java
@Component
public class UserService {
    private final UserRepository userRepo;
    private final EmailService emailService;
    private final AuditService auditService;
    
    @Autowired
    public UserService(
        UserRepository userRepo,
        EmailService emailService,
        AuditService auditService
    ) {
        this.userRepo = userRepo;
        this.emailService = emailService;
        this.auditService = auditService;
    }
    
    public void registerUser(User user) {
        userRepo.save(user);
        emailService.sendWelcomeEmail(user);
        auditService.log("User registered: " + user.getId());
    }
}
```

**All dependencies:**
- Injected via constructor ✅
- Required (can't create service without them) ✅
- Immutable (final fields) ✅
- Testable (just pass mocks to constructor) ✅

**Best practice in action!**

### @Autowired Optional

**Constructor injection in Spring 4.3+:**

```java
// @Autowired optional if only one constructor!
public class Alien {
    private final Computer com;
    
    // No @Autowired needed!
    public Alien(Computer com) {
        this.com = com;
    }
}
```

**Spring automatically uses the only constructor!**

**With multiple constructors, @Autowired required:**
```java
public class Alien {
    private Computer com;
    
    public Alien() { }
    
    @Autowired  // Tell Spring which one to use
    public Alien(Computer com) {
        this.com = com;
    }
}
```

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Forgetting @Autowired

**Wrong:**
```java
@Component
public class Alien {
    private Computer com;  // No @Autowired - stays null!
}
```

**Result:** NullPointerException

**Correct:**
```java
@Component
public class Alien {
    @Autowired  // Required!
    private Computer com;
}
```

### Mistake 2: Wrong bean name in @Qualifier

**Wrong:**
```java
@Component
public class Desktop { ... }  // Bean: "desktop"

@Autowired
@Qualifier("Desktop")  // Wrong case!
private Computer com;
```

**Error:** NoSuchBeanDefinitionException

**Correct:**
```java
@Autowired
@Qualifier("desktop")  // Lowercase first letter!
private Computer com;
```

### Mistake 3: Multiple beans without disambiguation

**Wrong:**
```java
@Component
public class Desktop { ... }

@Component
public class Laptop { ... }

@Autowired  // Which one?!
private Computer com;
```

**Error:** NoUniqueBeanDefinitionException

**Correct (option 1 - @Qualifier):**
```java
@Autowired
@Qualifier("desktop")
private Computer com;
```

**Correct (option 2 - @Primary):**
```java
@Component
@Primary
public class Desktop { ... }
```

### Mistake 4: @Qualifier without @Autowired

**Wrong:**
```java
@Qualifier("desktop")  // Alone doesn't work!
private Computer com;
```

**Correct:**
```java
@Autowired  // Both needed!
@Qualifier("desktop")
private Computer com;
```

### Mistake 5: Mixing injection types

**Confusing:**
```java
@Component
public class Alien {
    @Autowired  // Field injection
    private Computer com;
    
    @Autowired  // Also setter injection?!
    public void setCom(Computer com) {
        this.com = com;
    }
}
```

**Result:** Computer injected twice (field then setter)

**Better: Choose one injection type per dependency**

---

## 🎯 Practice Exercises

### Exercise 1: Field injection

Create Employee and Department classes. Use @Component and field injection to wire Department into Employee. Test with multiple departments using @Qualifier.

### Exercise 2: Constructor injection

Convert Exercise 1 to use constructor injection. Make Department field final. Test dependency injection works.

### Exercise 3: Setter injection

Create CacheService with optional Logger dependency. Use setter injection with required=false so CacheService works with or without logger.

### Exercise 4: @Primary vs @Qualifier

Create PaymentService interface with CreditCard and PayPal implementations. First use @Primary to set default. Then override with @Qualifier in specific classes.

### Exercise 5: Custom bean names

Create multiple DataSource beans (primary, backup, readonly). Use custom names with @Component("primaryDB"). Inject specific ones using @Qualifier.

### Exercise 6: All three injection types

Create OrderService with:
- Required dependencies via constructor
- Optional dependencies via setter
- Configuration values via field injection

Test all work together.

---

## 🔗 Quick Summary

**@Autowired: automatic dependency injection!**

**Problem:**
```java
@Component
public class Alien {
    private Computer com;  // null
}
```

**Solution:**
```java
@Component
public class Alien {
    @Autowired  // Spring injects bean!
    private Computer com;
}
```

**Multiple beans = ambiguity:**
```java
@Autowired
@Qualifier("desktop")  // Specify exact bean
private Computer com;
```

**Or use @Primary:**
```java
@Component
@Primary  // Default choice
public class Desktop { ... }
```

**Bean naming:**
- Default: `Desktop` → bean name `"desktop"`
- Custom: `@Component("com2")` → bean name `"com2"`

**Three injection types:**
1. Field: `@Autowired private Computer com;`
2. Constructor: `@Autowired public Alien(Computer com) { ... }`
3. Setter: `@Autowired public void setCom(Computer com) { ... }`

**Best practice: Constructor injection for required dependencies!** ⭐

**Next topic:** Prototype scope with component scanning! 🔄
