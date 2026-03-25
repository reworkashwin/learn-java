# 🎯 Inner Beans - Private Dependencies in Spring

## Introduction

We've been defining all our beans at the top level in spring.xml:

```xml
<beans>
    <bean id="laptop" class="Laptop" />
    <bean id="desktop" class="Desktop" />
    <bean id="alien" class="Alien">
        <property name="com" ref="laptop" />
    </bean>
</beans>
```

**Every bean is visible to the entire application!**

**Any bean can reference any other bean:**
```xml
<bean id="alien" class="Alien">
    <property name="com" ref="laptop" />  <!-- Can access laptop ✅ -->
</bean>

<bean id="human" class="Human">
    <property name="com" ref="laptop" />  <!-- Can also access laptop ✅ -->
</bean>

<bean id="car" class="Car">
    <property name="com" ref="laptop" />  <!-- Even Car can access laptop ✅ -->
</bean>
```

**Laptop bean is globally accessible!**

**But what if you don't want this?**

**Think about it:**
- This laptop is specifically for Alien
- Human shouldn't use this laptop
- Car definitely shouldn't have a laptop!
- This is Alien's PRIVATE dependency

**Can we make a bean private to another bean?**

**Real-world analogy:**

**Global beans are like shared tools in an office:**
- Coffee machine: everyone uses it ✅
- Printer: shared resource ✅
- Meeting rooms: bookable by anyone ✅

**Inner beans are like personal items:**
- Your laptop: only you use it ✅
- Your phone: private to you ✅
- Your desk supplies: not for others ✅

**Some dependencies should be private!**

**Enter: Inner Beans!**

An inner bean is a bean defined inside another bean's property. It's not accessible to other beans - it's scoped exclusively to its parent bean. Think of it as a "private dependency."

**In this lesson, you'll learn:**
- The global accessibility problem with top-level beans
- What inner beans are and when to use them
- How to define inner beans inside property tags
- Syntax: moving from ref to inline bean definitions
- Inner beans as private, encapsulated dependencies
- When to use inner beans vs normal beans
- Design decisions for bean visibility
- Benefits and tradeoffs of inner beans

Make your dependencies private when they should be! 🎯

---

## Concept 1: The Global Bean Problem

### 🧠 Current setup

**spring.xml:**
```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="laptop" class="com.telusko.app.Laptop" />
    
    <bean id="alien" class="com.telusko.app.Alien">
        <property name="age" value="21" />
        <property name="com" ref="laptop" />
    </bean>
</beans>
```

**How this works:**

1. **Laptop bean is created at top level**
   - Has ID: "laptop"
   - Available in container
   - Can be referenced by any bean

2. **Alien bean references laptop**
   - Uses `ref="laptop"` attribute
   - Gets the laptop bean from container
   - Dependency injected

**Perfectly functional!** ✅

### 🧠 The accessibility reality

**Because laptop is a top-level bean with an ID:**

**Any bean can reference it!**

**Example 1: Human also uses laptop**
```xml
<bean id="laptop" class="Laptop" />

<bean id="alien" class="Alien">
    <property name="com" ref="laptop" />
</bean>

<bean id="human" class="Human">
    <property name="com" ref="laptop" />  <!-- Same laptop! -->
</bean>
```

**Example 2: Multiple beans sharing laptop**
```xml
<bean id="laptop" class="Laptop" />

<bean id="alien" class="Alien">
    <property name="com" ref="laptop" />
</bean>

<bean id="robot" class="Robot">
    <property name="com" ref="laptop" />
</bean>

<bean id="developer" class="Developer">
    <property name="com" ref="laptop" />
</bean>
```

**All sharing the same singleton laptop instance!**

### ❓ Is this what we want?

**Sometimes yes!**

**Shared resource scenario:**
```xml
<!-- Database connection pool - shared by all services -->
<bean id="dataSource" class="DataSource" />

<bean id="userService" class="UserService">
    <property name="dataSource" ref="dataSource" />  <!-- Shares ✅ -->
</bean>

<bean id="orderService" class="OrderService">
    <property name="dataSource" ref="dataSource" />  <!-- Shares ✅ -->
</bean>
```

**Makes sense - one connection pool for everyone!**

**But sometimes NO!**

**Private dependency scenario:**
```xml
<!-- This laptop should ONLY be used by alien! -->
<bean id="laptop" class="Laptop" />

<bean id="alien" class="Alien">
    <property name="com" ref="laptop" />
</bean>

<!-- Problem: Other beans CAN reference it too! -->
```

**The instructor asks:**

> "What if I just want to limit this particular bean only for the alien? We can do that."

### 💡 The desire

**We want:**
- Laptop bean exists
- Alien uses it
- But NO OTHER bean can access it

**A private, encapsulated dependency!**

**How do we achieve this?**

**Inner beans!**

---

## Concept 2: Introducing Inner Beans

### 🧠 What is an inner bean?

**An inner bean is:**
- A bean defined INSIDE another bean's property
- Not registered in the container with an ID
- Only accessible to the parent bean
- Private to its container

**Think of it as a nested bean definition!**

### 🧠 The syntax change

**Current approach (external bean with ref):**
```xml
<!-- Laptop defined at top level -->
<bean id="laptop" class="Laptop" />

<bean id="alien" class="Alien">
    <!-- Reference external bean -->
    <property name="com" ref="laptop" />
</bean>
```

**New approach (inner bean without ref):**
```xml
<bean id="alien" class="Alien">
    <!-- Define bean inline -->
    <property name="com">
        <bean class="Laptop" />  <!-- Inner bean! -->
    </property>
</bean>
```

**Notice the differences:**

**External bean:**
- ✅ Has an ID (`id="laptop"`)
- ✅ Defined at top level
- ✅ Referenced with `ref` attribute
- ✅ Accessible globally

**Inner bean:**
- ❌ No ID needed
- ✅ Defined inside property tag
- ❌ No `ref` attribute
- ✅ Accessible only by parent

### 💡 The concept

**The instructor explains:**

> "I'm creating this bean inside the property tag. So this bean here is basically an inner bean for the alien. This alien is an outer bean, and then this is the inner bean. That means this can be used only by the alien, not from the outside."

**Visual representation:**

```
┌─────────────────────────────────┐
│ Alien Bean (Outer)              │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Laptop Bean (Inner)       │ │
│  │ - Only accessible here    │ │
│  │ - Not visible outside     │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Laptop is encapsulated inside Alien!**

---

## Concept 3: Creating an Inner Bean - Step by Step

### 🧠 Starting point

**spring.xml (before):**
```xml
<bean id="laptop" class="com.telusko.app.Laptop" />

<bean id="alien" class="com.telusko.app.Alien">
    <property name="age" value="21" />
    <property name="com" ref="laptop" />
</bean>
```

**Goal: Convert laptop to inner bean**

### ⚙️ Step 1: Remove the ref attribute

**Change this:**
```xml
<property name="com" ref="laptop" />
```

**To this:**
```xml
<property name="com">
    <!-- Inner bean will go here -->
</property>
```

**Notice:**
- Self-closing tag `/>` becomes opening and closing tags
- `ref` attribute removed
- Content area created between tags

### ⚙️ Step 2: Move bean definition inside property

**Take this from top level:**
```xml
<bean id="laptop" class="com.telusko.app.Laptop" />
```

**Put it inside property:**
```xml
<property name="com">
    <bean id="laptop" class="com.telusko.app.Laptop" />
</property>
```

### ⚙️ Step 3: Remove the ID (optional for inner beans)

**Inner beans don't need IDs:**
```xml
<property name="com">
    <bean class="com.telusko.app.Laptop" />
    <!--  No id attribute needed! -->
</property>
```

**Why no ID?**
- Not registered in container
- Not referenced by other beans
- ID would be meaningless

**But you CAN include it if you want (for documentation):**
```xml
<property name="com">
    <bean id="laptop" class="com.telusko.app.Laptop" />
    <!-- ID ignored by Spring, but clarifies intent -->
</property>
```

**Spring ignores the ID for inner beans!**

### 🧪 Complete transformation

**Before (external bean):**
```xml
<beans>
    <bean id="laptop" class="com.telusko.app.Laptop" />
    
    <bean id="alien" class="com.telusko.app.Alien">
        <property name="age" value="21" />
        <property name="com" ref="laptop" />
    </bean>
</beans>
```

**After (inner bean):**
```xml
<beans>
    <!-- Laptop bean removed from top level -->
    
    <bean id="alien" class="com.telusko.app.Alien">
        <property name="age" value="21" />
        <property name="com">
            <bean class="com.telusko.app.Laptop" />  <!-- Inner bean! -->
        </property>
    </bean>
</beans>
```

### 🧪 Test it works

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien alien = context.getBean("alien", Alien.class);
    System.out.println(alien.getAge());
    alien.code();
}
```

**Output:**
```
21
Coding...
Compiling using Laptop
```

**It works!** ✅

**The instructor confirms:**

> "I will just run this and you can see it works. So basically this is how you create an inner bean."

---

## Concept 4: Understanding Inner Bean Scope

### 🧠 Inner beans are NOT in the container

**Let's verify:**

**spring.xml:**
```xml
<bean id="alien" class="com.telusko.app.Alien">
    <property name="com">
        <bean class="com.telusko.app.Laptop" />  <!-- Inner bean -->
    </property>
</bean>
```

**Try to access laptop directly:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    // Try to get laptop bean
    Laptop laptop = context.getBean("laptop", Laptop.class);  // ❌
}
```

**Error:**
```
NoSuchBeanDefinitionException: No bean named 'laptop' available
```

**Even without name, by type:**
```java
Laptop laptop = context.getBean(Laptop.class);  // ❌
```

**Error:**
```
NoSuchBeanDefinitionException: No qualifying bean of type 'Laptop' available
```

**The inner bean is NOT registered in the container!**

### 🧠 Only the parent can access it

**The ONLY way to access the laptop:**

```java
Alien alien = context.getBean("alien", Alien.class);
Laptop laptop = alien.getCom();  // ✅ Through the parent!
```

**Laptop is private to Alien!**

### 💡 Scope characteristics

**Inner beans have unique scope:**

| Characteristic | Normal Bean | Inner Bean |
|----------------|-------------|------------|
| Has ID | Yes, required | No, optional (ignored) |
| In container | Yes | No |
| Accessible globally | Yes | No |
| Can be referenced | Yes (`ref="id"`) | No |
| Accessible by parent | Yes | Yes |
| Accessible by others | Yes | No |
| Lifetime | Container-managed | Parent-managed |

**Inner beans are truly private!**

---

## Concept 5: Inner Beans with Constructor Injection

### 🧠 Inner beans work with constructors too

**Not just property/setter injection!**

**Example with constructor:**

**Alien.java:**
```java
public class Alien {
    private int age;
    private Computer com;
    
    // Constructor
    public Alien(int age, Computer com) {
        this.age = age;
        this.com = com;
    }
    
    public void code() {
        System.out.println("Coding...");
        com.compile();
    }
}
```

**spring.xml (inner bean with constructor):**
```xml
<bean id="alien" class="com.telusko.app.Alien">
    <constructor-arg value="21" />
    <constructor-arg>
        <bean class="com.telusko.app.Laptop" />  <!-- Inner bean! -->
    </constructor-arg>
</bean>
```

**Works perfectly!** ✅

### 🧪 Mixed approach

**You can mix both:**

```xml
<bean id="alien" class="com.telusko.app.Alien">
    <!-- Constructor injection with inner bean -->
    <constructor-arg value="21" />
    <constructor-arg>
        <bean class="com.telusko.app.Laptop" />
    </constructor-arg>
    
    <!-- Setter injection with inner bean -->
    <property name="name" value="John" />
    <property name="backup">
        <bean class="com.telusko.app.Desktop" />  <!-- Another inner bean -->
    </property>
</bean>
```

**Multiple inner beans in one parent!**

---

## Concept 6: Inner Beans with Properties

### 🧠 Inner beans can have their own properties

**Inner beans aren't just empty shells!**

**Example: Laptop with properties**

**Laptop.java:**
```java
public class Laptop implements Computer {
    private String brand;
    private int ram;
    
    // Setters needed for property injection
    public void setBrand(String brand) {
        this.brand = brand;
    }
    
    public void setRam(int ram) {
        this.ram = ram;
    }
    
    @Override
    public void compile() {
        System.out.println("Compiling using " + brand + 
                         " laptop with " + ram + "GB RAM");
    }
}
```

**spring.xml (inner bean with properties):**
```xml
<bean id="alien" class="com.telusko.app.Alien">
    <property name="age" value="21" />
    <property name="com">
        <!-- Inner bean WITH its own properties! -->
        <bean class="com.telusko.app.Laptop">
            <property name="brand" value="Dell" />
            <property name="ram" value="16" />
        </bean>
    </property>
</bean>
```

**Output:**
```
Coding...
Compiling using Dell laptop with 16GB RAM
```

**Inner beans are fully functional beans!**

### 💡 Nested configuration

**The complete structure:**

```xml
<bean id="alien" class="Alien">                    <!-- Outer bean -->
    <property name="age" value="21" />             <!-- Outer property -->
    <property name="com">                          <!-- Outer property -->
        <bean class="Laptop">                      <!-- Inner bean -->
            <property name="brand" value="Dell" /> <!-- Inner property -->
            <property name="ram" value="16" />     <!-- Inner property -->
        </bean>
    </property>
</bean>
```

**Three levels of configuration:**
1. Outer bean (alien)
2. Inner bean (laptop)
3. Inner bean properties (brand, ram)

---

## Concept 7: When to Use Inner Beans vs Normal Beans

### 🧠 The decision framework

**The instructor says:**

> "All these things are decisions which you take. If you want to use an inner bean or a normal bean."

**Let's build a decision framework!**

### 📊 Use NORMAL beans when:

**1. Bean is shared across multiple parents**
```xml
<!-- Database connection used by many services -->
<bean id="dataSource" class="DataSource" />

<bean id="userService">
    <property name="dataSource" ref="dataSource" />  <!-- Shared -->
</bean>

<bean id="orderService">
    <property name="dataSource" ref="dataSource" />  <!-- Shared -->
</bean>
```

**2. Bean needs to be accessed independently**
```xml
<!-- Might need to get laptop directly for testing -->
<bean id="laptop" class="Laptop" />
```
```java
// Access directly when needed
Laptop laptop = context.getBean("laptop", Laptop.class);
```

**3. Bean is reusable/configurable**
```xml
<!-- Same type with different configurations -->
<bean id="prodDatabase" class="Database">
    <property name="url" value="prod-url" />
</bean>

<bean id="testDatabase" class="Database">
    <property name="url" value="test-url" />
</bean>
```

**4. Bean has complex lifecycle**
```xml
<!-- Needs init-method, destroy-method -->
<bean id="cacheManager" class="CacheManager" 
      init-method="init" 
      destroy-method="cleanup" />
```

### 📊 Use INNER beans when:

**1. Dependency is private to one bean**
```xml
<bean id="alien" class="Alien">
    <property name="com">
        <!-- Only alien needs this laptop -->
        <bean class="Laptop" />
    </property>
</bean>
```

**2. Dependency is simple and not reused**
```xml
<bean id="user" class="User">
    <property name="address">
        <!-- Simple address, not shared -->
        <bean class="Address">
            <property name="city" value="Mumbai" />
        </bean>
    </property>
</bean>
```

**3. You want to encapsulate implementation details**
```xml
<bean id="emailService" class="EmailService">
    <property name="sender">
        <!-- Hide SMTP implementation from rest of app -->
        <bean class="SMTPSender">
            <property name="host" value="smtp.gmail.com" />
        </bean>
    </property>
</bean>
```

**4. Configuration is tightly coupled**
```xml
<bean id="reportGenerator" class="ReportGenerator">
    <property name="formatter">
        <!-- Formatter specific to this generator -->
        <bean class="PDFFormatter">
            <property name="pageSize" value="A4" />
        </bean>
    </property>
</bean>
```

### 💡 Quick decision tree

```
Is the dependency used by multiple beans?
│
├─ YES → Use NORMAL bean (shared resource)
│
└─ NO → Is it accessed independently of parent?
    │
    ├─ YES → Use NORMAL bean (testability)
    │
    └─ NO → Use INNER bean (encapsulation)
```

---

## Concept 8: Real-World Scenarios

### 🧠 Scenario 1: User with Address

**User.java:**
```java
public class User {
    private String name;
    private Address address;
    
    // Getters and setters
}
```

**Address.java:**
```java
public class Address {
    private String street;
    private String city;
    private String zipCode;
    
    // Getters and setters
}
```

**Configuration (inner bean approach):**
```xml
<bean id="user" class="User">
    <property name="name" value="John Doe" />
    <property name="address">
        <!-- Address is private to this user -->
        <bean class="Address">
            <property name="street" value="123 Main St" />
            <property name="city" value="Mumbai" />
            <property name="zipCode" value="400001" />
        </bean>
    </property>
</bean>
```

**Why inner bean?**
- Address is specific to this user
- Not shared with other users
- Encapsulates user's personal data

### 🧠 Scenario 2: EmailService with SMTP Configuration

**EmailService.java:**
```java
public class EmailService {
    private SMTPConfig config;
    
    public void sendEmail(String to, String message) {
        // Use config to send email
    }
}
```

**Configuration:**
```xml
<bean id="emailService" class="EmailService">
    <property name="config">
        <!-- SMTP config hidden inside service -->
        <bean class="SMTPConfig">
            <property name="host" value="smtp.gmail.com" />
            <property name="port" value="587" />
            <property name="username" value="noreply@example.com" />
            <property name="password" value="secret" />
        </bean>
    </property>
</bean>
```

**Why inner bean?**
- Configuration details hidden
- Not needed by other services
- Encapsulates sensitive credentials

### 🧠 Scenario 3: DataSource (NOT inner bean)

**UserService.java:**
```java
public class UserService {
    private DataSource dataSource;
    // ...
}
```

**OrderService.java:**
```java
public class OrderService {
    private DataSource dataSource;
    // ...
}
```

**Configuration (normal bean):**
```xml
<!-- Shared resource - NOT inner bean -->
<bean id="dataSource" class="DataSource">
    <property name="url" value="jdbc:mysql://localhost/db" />
    <property name="username" value="root" />
    <property name="password" value="password" />
</bean>

<bean id="userService" class="UserService">
    <property name="dataSource" ref="dataSource" />  <!-- Ref, not inner -->
</bean>

<bean id="orderService" class="OrderService">
    <property name="dataSource" ref="dataSource" />  <!-- Shared -->
</bean>
```

**Why NOT inner bean?**
- Shared by multiple services
- Connection pooling (one pool for all)
- Common configuration

---

## ✅ Key Takeaways

### About Inner Beans

1. **Inner beans are defined inside property or constructor-arg tags**
   ```xml
   <property name="com">
       <bean class="Laptop" />  <!-- Inner bean -->
   </property>
   ```

2. **Inner beans don't need IDs**
   - Not registered in container
   - Not accessible globally
   - ID attribute is optional and ignored

3. **Inner beans are private to their parent**
   - Only accessible through parent bean
   - Cannot be retrieved with getBean()
   - Encapsulated dependency

### About When to Use Inner Beans

1. **Use inner beans for private dependencies**
   - Not shared with other beans
   - Specific to one parent
   - Implementation details

2. **Use normal beans for shared resources**
   - Multiple beans need it
   - Accessed independently
   - Reusable across application

3. **Decision is architectural**
   - Consider reusability
   - Consider encapsulation
   - Consider testability

### About Inner Bean Syntax

1. **Replace ref with inline bean definition**
   ```xml
   <!-- Before -->
   <property name="com" ref="laptop" />
   
   <!-- After -->
   <property name="com">
       <bean class="Laptop" />
   </property>
   ```

2. **Works with both injection types**
   - Setter injection (property tag)
   - Constructor injection (constructor-arg tag)

3. **Inner beans can have properties**
   ```xml
   <property name="com">
       <bean class="Laptop">
           <property name="brand" value="Dell" />
       </bean>
   </property>
   ```

---

## 💡 Final Insights

### The Encapsulation Principle

**Inner beans enforce encapsulation:**

**Object-Oriented Programming teaches:**
- Hide implementation details
- Expose only what's necessary
- Encapsulate private data

**Inner beans apply this to Spring configuration:**

**Normal bean (exposed):**
```xml
<bean id="laptop" class="Laptop" />  <!-- Public, everyone can see -->
```

**Inner bean (hidden):**
```xml
<bean id="alien" class="Alien">
    <property name="com">
        <bean class="Laptop" />  <!-- Private, only alien can see -->
    </property>
</bean>
```

**Just like Java access modifiers:**
- Normal bean = `public`
- Inner bean = `private`

### Configuration as Code

**Compare with Java:**

**Java (composition):**
```java
public class Alien {
    private Computer com = new Laptop();  // Private instance
}
```

**Spring XML (inner bean):**
```xml
<bean id="alien" class="Alien">
    <property name="com">
        <bean class="Laptop" />  <!-- Same concept! -->
    </property>
</bean>
```

**Both create private dependencies!**

### Modern Spring Alternative

**XML (what we learned):**
```xml
<bean id="alien" class="Alien">
    <property name="com">
        <bean class="Laptop" />
    </property>
</bean>
```

**Annotation (modern Spring):**
```java
@Component
public class Alien {
    @Autowired
    private Computer com;  // Spring finds and injects
}

@Component
public class Laptop implements Computer {
    // Injected into Alien
}
```

**With explicit instantiation:**
```java
@Configuration
public class AppConfig {
    @Bean
    public Alien alien() {
        Alien alien = new Alien();
        alien.setCom(new Laptop());  // Inner bean equivalent
        return alien;
    }
}
```

**Same concept of private dependencies!**

### Performance Consideration

**Inner beans vs normal beans:**

**No performance difference!**
- Both are created once (if singleton)
- Both are dependency-injected
- Same memory footprint

**The difference is architectural:**
- Visibility (global vs private)
- Reusability (shared vs exclusive)
- Design intent (exposed vs hidden)

**Choose based on design, not performance!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Trying to reference inner bean by ID

**Wrong:**
```xml
<bean id="alien" class="Alien">
    <property name="com">
        <bean id="laptop" class="Laptop" />  <!-- ID is ignored! -->
    </property>
</bean>

<bean id="human" class="Human">
    <property name="com" ref="laptop" />  <!-- ❌ Won't find it! -->
</bean>
```

**Error:** NoSuchBeanDefinitionException

**Correct:** Inner beans can't be referenced externally!

### Mistake 2: Using inner bean for shared resources

**Wrong:**
```xml
<bean id="userService" class="UserService">
    <property name="dataSource">
        <bean class="DataSource" />  <!-- Creates new DataSource -->
    </property>
</bean>

<bean id="orderService" class="OrderService">
    <property name="dataSource">
        <bean class="DataSource" />  <!-- Creates ANOTHER DataSource -->
    </property>
</bean>
```

**Problem:** Each service gets separate DataSource (bad for connection pooling!)

**Correct:** Use normal bean with ref for shared resources!

### Mistake 3: Over-using inner beans

**Wrong (everything inner):**
```xml
<bean id="application" class="Application">
    <property name="service">
        <bean class="UserService">
            <property name="repository">
                <bean class="UserRepository">
                    <property name="dataSource">
                        <bean class="DataSource" />
                    </property>
                </bean>
            </property>
        </bean>
    </property>
</bean>
```

**Problems:**
- Hard to read
- Can't test individual components
- Can't reuse beans
- Tight coupling

**Better:** Mix normal and inner beans appropriately!

### Mistake 4: Expecting inner bean singleton behavior across parents

**Wrong expectation:**
```xml
<bean id="alien" class="Alien">
    <property name="com">
        <bean class="Laptop" />  <!-- Laptop instance 1 -->
    </property>
</bean>

<bean id="human" class="Human">
    <property name="com">
        <bean class="Laptop" />  <!-- Laptop instance 2 - DIFFERENT INSTANCE! -->
    </property>
</bean>
```

**Each parent gets its OWN inner bean instance!**

**Not shared - each is independent!**

---

## 🎯 Practice Exercises

### Exercise 1: Convert to inner bean

Given:
```xml
<bean id="engine" class="Engine" />

<bean id="car" class="Car">
    <property name="engine" ref="engine" />
</bean>
```

Convert to inner bean.

### Exercise 2: Decide inner vs normal

For each scenario, decide inner bean or normal bean:

a) Database connection used by 5 services
b) Email configuration for EmailService only
c) Cache manager accessed by multiple controllers
d) Address object for a User

### Exercise 3: Nested inner beans

Create configuration where:
- Car has inner bean Engine
- Engine has inner bean FuelInjector
- FuelInjector has properties (pressure, type)

### Exercise 4: Refactor for proper encapsulation

Given this configuration with everything as normal beans:
```xml
<bean id="smtpConfig" class="SMTPConfig" />
<bean id="emailFormatter" class="EmailFormatter" />
<bean id="emailService" class="EmailService">
    <property name="config" ref="smtpConfig" />
    <property name="formatter" ref="emailFormatter" />
</bean>
```

Decide what should be inner beans and refactor.

---

## 🔗 Quick Summary

**Inner beans: private dependencies defined inline**

```xml
<!-- Normal bean (global) -->
<bean id="laptop" class="Laptop" />
<bean id="alien" class="Alien">
    <property name="com" ref="laptop" />  <!-- References global bean -->
</bean>

<!-- Inner bean (private) -->
<bean id="alien" class="Alien">
    <property name="com">
        <bean class="Laptop" />  <!-- Private to alien -->
    </property>
</bean>
```

**Key differences:**

| Feature | Normal Bean | Inner Bean |
|---------|-------------|------------|
| Location | Top-level | Inside property/constructor-arg |
| ID | Required | Optional (ignored) |
| Visibility | Global | Private to parent |
| Reusability | Can be referenced | Cannot be referenced |

**Decision guide:**
- Shared resource → Normal bean
- Private dependency → Inner bean

**Next topic:** Moving from XML to annotation-based configuration! 🎊
