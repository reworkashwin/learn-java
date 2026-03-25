# 💉 Setter Injection - Injecting Values through Spring Configuration

## Introduction

We've learned about bean scopes - how Spring creates and manages object instances. Now it's time to learn about one of Spring's most powerful features: **Dependency Injection**.

**But let's start with a simpler question: What IS injection?**

Look at our Alien class:

```java
public class Alien {
    private int age;
    
    public void code() {
        System.out.println("Coding...");
    }
}
```

**The alien has an `age` variable. How do we set its value?**

**Traditional way:**
```java
Alien obj = new Alien();
obj.setAge(21);  // Set in Java code
```

**Spring way:**
```xml
<bean id="alien" class="Alien">
    <property name="age" value="21" />  <!-- Set in XML config -->
</bean>
```

**Why does Spring provide this alternative?**

In this lesson, we'll discover **setter injection** - a technique where Spring injects values into your objects automatically based on configuration, without you writing explicit assignment code.

**You'll learn:**
- What "injection" means in Spring context
- How to inject primitive values using `<property>` tags
- Why it's called "setter" injection
- The difference between `value` and `ref` attributes
- Benefits of externalized configuration
- How Spring actually calls your setter methods

This is your first real taste of **Inversion of Control** - letting the framework set values instead of doing it yourself! 💉

---

## Concept 1: Setting Up the Class with Encapsulation

### 🧠 Starting with proper Java design

**Currently our Alien class has a public variable:**

```java
public class Alien {
    int age;  // Default access - not good practice!
    
    public Alien() {
        System.out.println("Object created");
    }
    
    public void code() {
        System.out.println("Coding...");
    }
}
```

**This violates encapsulation!** Any code can directly access `age`.

### ⚙️ Step 1: Make it private

```java
public class Alien {
    private int age;  // Now properly encapsulated!
    
    public Alien() {
        System.out.println("Object created");
    }
    
    public void code() {
        System.out.println("Coding...");
    }
}
```

**Now `age` is hidden from external access.**

But this creates a problem: How do we set or get the age?

### ⚙️ Step 2: Add getters and setters

**Using IDE (IntelliJ/Eclipse):**
- Right-click → Generate → Getters and Setters
- Select `age` variable
- Generate both

**Result:**

```java
public class Alien {
    private int age;
    
    public Alien() {
        System.out.println("Object created");
    }
    
    // Getter
    public int getAge() {
        return age;
    }
    
    // Setter
    public void setAge(int age) {
        this.age = age;
    }
    
    public void code() {
        System.out.println("Coding...");
    }
}
```

**Now we have proper encapsulation with controlled access!**

### 💡 Why this matters

**Encapsulation benefits:**
- Control how variables are accessed
- Can add validation in setters
- Hide internal implementation
- Standard Java Bean pattern
- Required for Spring injection to work!

---

## Concept 2: The Traditional Way - Setting Values in Code

### 🧠 Using the setter in our application

**Current App.java:**

```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj1 = (Alien) context.getBean("alien1");
    
    // Old way - directly accessing (now won't compile because age is private)
    // obj1.age = 21;  // ERROR!
    
    // Proper way - using setter
    obj1.setAge(21);
    
    // Using getter to print
    System.out.println(obj1.getAge());
    
    obj1.code();
}
```

**spring.xml:**
```xml
<beans ...>
    <bean id="alien1" class="com.telusko.app.Alien" />
</beans>
```

### 🧪 Run the code

**Output:**
```
Object created
21
Coding...
```

**This works perfectly!**

### ❓ But is this the best approach?

**Think about it:**
- We're setting values in Java code
- Every time we want a different age, we modify code
- Configuration is mixed with logic
- Not flexible!

**What if we comment out the setAge line?**

```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj1 = (Alien) context.getBean("alien1");
    
    // obj1.setAge(21);  // Commented out
    
    System.out.println(obj1.getAge());
    obj1.code();
}
```

**Output:**
```
Object created
0
Coding...
```

**Default value (0) for int.**

### 🧠 Where else could we set the value?

**Option 1: In the constructor**

```java
public Alien() {
    System.out.println("Object created");
    this.age = 21;  // Hardcoded here
}
```

**Problems:**
- Every Alien object gets age 21
- Not flexible
- Hardcoded in class definition

**Option 2: Initialize when declaring**

```java
private int age = 21;  // Default value
```

**Same problems:**
- Hardcoded in class
- Not configurable externally

### 💡 The Spring solution

**What if we could configure the value OUTSIDE the Java code?**

**Enter: Spring's Injection mechanism!**

---

## Concept 3: Introduction to Dependency Injection

### 🧠 What is injection?

The instructor reminds us:

> "We have talked about dependency injection, right?"

**Dependency Injection is a pattern where:**
- Objects don't create their dependencies
- Dependencies are "injected" from outside
- Framework handles the injection

**But injection isn't just for dependencies (objects)!**

**You can also inject:**
- Primitive values (int, String, boolean, etc.)
- Collections (List, Set, Map)
- References to other beans

### ❓ Why inject values?

**Benefits of injection:**

1. **Externalized configuration**
   - Values defined in XML, not code
   - Change configuration without changing code
   - Recompile not needed!

2. **Separation of concerns**
   - Business logic separate from configuration
   - Clean code

3. **Flexibility**
   - Different environments can have different configs
   - Dev vs Production configurations

4. **Testability**
   - Easy to inject mock values for testing
   - No hardcoded dependencies

### 💡 The philosophy

**Traditional approach:**
```java
// Code decides the values
Alien alien = new Alien();
alien.setAge(21);  // Hardcoded in code
```

**Spring approach:**
```xml
<!-- Configuration decides the values -->
<bean id="alien" class="Alien">
    <property name="age" value="21" />
</bean>
```

**Spring Framework believes in moving configuration OUT of code!**

---

## Concept 4: Injecting Values with Property Tag

### 🧠 The property tag

**How to inject values in XML configuration:**

```xml
<bean id="alien1" class="com.telusko.app.Alien">
    <property name="age" value="21" />
</bean>
```

**Let's break this down:**

### 🧠 The name attribute

```xml
<property name="age" value="21" />
          ^^^^^^^^
```

**`name="age"` - What goes here?**

**The name of your property!**

**But what exactly is a "property"?**

**In Java Beans convention:**
- A property has a getter and/or setter
- Property name = variable name (usually)
- For variable `age`, property name is `age`

**Important:** Use the **variable name**, not:
- ❌ Method name: `setAge` (wrong!)
- ❌ Getter name: `getAge` (wrong!)
- ✅ Variable name: `age` (correct!)

### 🧠 The value attribute

```xml
<property name="age" value="21" />
                    ^^^^^^^^^^^
```

**`value="21"` - For primitive values**

**Use `value` attribute when injecting:**
- int, long, short, byte
- float, double
- boolean
- String
- Primitive wrappers (Integer, Long, etc.)

**Think of `value` as "simple, literal values"**

### ⚙️ Complete configuration

**spring.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="alien1" class="com.telusko.app.Alien">
        <property name="age" value="21" />
    </bean>

</beans>
```

**App.java (simplified - no setAge call!):**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj1 = (Alien) context.getBean("alien1");
    
    // No setAge() call! Spring will inject the value.
    
    System.out.println(obj1.getAge());
    obj1.code();
}
```

### 🧪 Run the application

**Output:**
```
Object created
21
Coding...
```

**It works!** 🎉

**Age is 21, even though we didn't call `setAge()` in our code!**

### 💡 What just happened?

**Spring did this for you:**

1. Created the Alien object: `new Alien()`
2. Read the `<property>` tag
3. Found property name "age" with value "21"
4. Called: `obj.setAge(21)`
5. Put the object in container

**All automatically based on XML configuration!**

---

## Concept 5: Proving Spring Uses Setter Methods

### 🧠 A critical question

**How does Spring inject the value?**

**Two possibilities:**

**Option A: Direct field assignment**
```java
// Spring might do this (reflection):
alien.age = 21;  // Directly set private field
```

**Option B: Using setter method**
```java
// Spring might do this:
alien.setAge(21);  // Call the setter
```

### ❓ Which one does Spring use?

**The instructor poses the investigation:**

> "Is it directly assigning to age, or through a setter?"

**Let's find out experimentally!**

### ⚙️ Step: Add print statement in setter

**Modify the setter method:**

```java
public void setAge(int age) {
    System.out.println("Setter called");
    this.age = age;
}
```

**If Spring calls the setter, we'll see "Setter called" in output!**

### 🧪 Run the application

**Same configuration, same App.java, just modified setter.**

**Output:**
```
Object created
Setter called
21
Coding...
```

**"Setter called" appears!** 🎊

### ❓ What does this prove?

**Spring uses the SETTER METHOD to inject values!**

**Not direct field access.**

**Complete flow:**

1. **Container initialization**
   ```java
   new ClassPathXmlApplicationContext("spring.xml");
   ```

2. **Spring creates object**
   ```java
   Alien obj = new Alien();  // "Object created" prints
   ```

3. **Spring reads `<property>` tags**
   ```xml
   <property name="age" value="21" />
   ```

4. **Spring calls setter**
   ```java
   obj.setAge(21);  // "Setter called" prints
   ```

5. **Object stored in container with injected value**

6. **When you request bean**
   ```java
   Alien obj1 = context.getBean("alien1");
   ```
   You get a fully-configured object!

### 💡 Why this matters

**Because Spring uses setters:**

1. **You MUST have a setter method**
   - If no setter exists, injection fails!
   - Property name must match variable name

2. **You can add logic in setter**
   ```java
   public void setAge(int age) {
       if (age < 0) {
           throw new IllegalArgumentException("Age cannot be negative");
       }
       this.age = age;
   }
   ```
   Spring respects your validation!

3. **Standard Java Beans pattern**
   - Follows conventions
   - Works with other frameworks too

---

## Concept 6: Understanding "Setter Injection"

### 🧠 Why it's called "Setter Injection"

**The name tells you the mechanism:**

**"Setter Injection" = Injection through setter methods**

**The process:**
- You define `<property>` in XML
- Spring calls the **setter method**
- Value is **injected** into the object

### 🧠 Comparing injection types (preview)

**There are multiple injection techniques:**

1. **Setter Injection** (what we're learning now)
   - Uses setter methods
   - Property tag in XML
   - Most common

2. **Constructor Injection** (coming next)
   - Uses constructor parameters
   - Constructor-arg tag in XML
   - For mandatory dependencies

3. **Field Injection** (in annotation-based config)
   - Direct field injection
   - Using @Autowired on fields
   - Less common in XML config

**We're mastering Setter Injection first!**

### 💡 The terminology

**When someone says "Use setter injection to inject the age":**

They mean:
1. Add `<property name="age" value="21" />` to XML
2. Spring will call `setAge(21)`
3. Value gets injected through the setter

---

## Concept 7: Injecting Multiple Properties

### 🧠 What if you have multiple variables?

**Let's expand our Alien class:**

```java
public class Alien {
    private int age;
    private String name;
    private String planet;
    
    public Alien() {
        System.out.println("Object created");
    }
    
    // Getters and Setters for all variables
    public int getAge() {
        return age;
    }
    
    public void setAge(int age) {
        System.out.println("setAge called");
        this.age = age;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        System.out.println("setName called");
        this.name = name;
    }
    
    public String getPlanet() {
        return planet;
    }
    
    public void setPlanet(String planet) {
        System.out.println("setPlanet called");
        this.planet = planet;
    }
    
    public void code() {
        System.out.println(name + " from " + planet + " (age " + age + ") is coding...");
    }
}
```

### ⚙️ Inject multiple properties

**spring.xml:**
```xml
<bean id="alien1" class="com.telusko.app.Alien">
    <property name="age" value="21" />
    <property name="name" value="Zorg" />
    <property name="planet" value="Mars" />
</bean>
```

**Just add more `<property>` tags!**

### 🧪 Test it

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj1 = (Alien) context.getBean("alien1");
    
    System.out.println("Age: " + obj1.getAge());
    System.out.println("Name: " + obj1.getName());
    System.out.println("Planet: " + obj1.getPlanet());
    obj1.code();
}
```

**Output:**
```
Object created
setAge called
setName called
setPlanet called
Age: 21
Name: Zorg
Planet: Mars
Zorg from Mars (age 21) is coding...
```

**All setters were called!** ✅  
**All values injected!** ✅

### 💡 The pattern

**For each property:**
1. Add private variable
2. Create getter and setter
3. Add `<property>` tag in XML

**Spring handles the rest!**

---

## Concept 8: Value vs Ref - A Preview

### 🧠 The instructor's hint

> "What if you want to work with some objects? Let's say Alien is dependent upon some other class, let's say laptop object. In that case, you have to use something else."

**The `value` attribute is for primitives.**

**But what if you want to inject another bean?**

### 🧠 Introducing ref (preview)

**Imagine this scenario:**

```java
public class Alien {
    private int age;
    private Laptop laptop;  // Another object!
    
    // Setter for laptop
    public void setLaptop(Laptop laptop) {
        this.laptop = laptop;
    }
}
```

**How to inject the laptop?**

**You can't use `value` for objects!**

```xml
<!-- This won't work! -->
<property name="laptop" value="???" />
```

**You use `ref` to reference another bean:**

```xml
<bean id="laptop1" class="com.telusko.app.Laptop" />

<bean id="alien1" class="com.telusko.app.Alien">
    <property name="age" value="21" />
    <property name="laptop" ref="laptop1" />  <!-- ref, not value! -->
</bean>
```

### 💡 The rule

**Use `value` for:**
- Primitives: int, double, boolean, etc.
- Strings
- Simple literal values

**Use `ref` for:**
- Other beans (objects)
- Dependencies between beans
- References to bean IDs

**We'll explore `ref` in depth in the next lesson!**

---

## Concept 9: Benefits of Setter Injection

### 🧠 Why use setter injection?

**Compared to hardcoding values in Java code:**

**1. Externalized configuration**
```java
// Before: Value in code
public Alien() {
    this.age = 21;  // Hardcoded - bad!
}

// After: Value in config
<property name="age" value="21" />  <!-- Configurable - good! -->
```

**2. Change without recompilation**
- Modify XML file
- Restart application
- No Java code changes needed
- No recompilation required

**3. Environment-specific configs**
```xml
<!-- dev-config.xml -->
<property name="age" value="21" />

<!-- prod-config.xml -->
<property name="age" value="50" />
```
Load different configs for different environments!

**4. Centralized configuration**
- All configurations in one place (XML)
- Easy to see all settings
- Easy to manage

**5. Testability**
```xml
<!-- test-config.xml -->
<property name="age" value="1" />  <!-- Test data -->
```
Easy to inject test values!

### 💡 The Spring philosophy

**Spring encourages:**
- Configuration separate from code
- Declarative programming
- Inversion of Control (you declare, Spring executes)

**This is preparation for bigger concepts:**
- Dependency injection between beans
- AOP (Aspect-Oriented Programming)
- Transaction management

**Setter injection is the foundation!**

---

## ✅ Key Takeaways

### About Setter Injection

1. **Definition: Injection through setter methods**
   - Spring calls your setter methods
   - Values come from XML configuration
   - Not hardcoded in Java code

2. **The `<property>` tag syntax**
   ```xml
   <property name="propertyName" value="literalValue" />
   ```
   - `name` = variable name (not method name)
   - `value` = the value to inject (for primitives)

3. **Spring uses your setter methods**
   - Not direct field access
   - You can add validation in setters
   - Must have setter for injection to work

### About Configuration

1. **Requires getter and setter**
   - Private variables
   - Public getter/setter methods
   - Follow Java Beans convention

2. **Multiple properties supported**
   - Add multiple `<property>` tags
   - Each property gets its own tag
   - Spring calls all setters

3. **Value vs Ref**
   - `value` for primitives and Strings
   - `ref` for other beans (objects)
   - We'll learn `ref` next!

### About Benefits

1. **Externalized configuration**
   - No hardcoded values in code
   - Easy to change
   - No recompilation needed

2. **Clean separation**
   - Configuration in XML
   - Logic in Java
   - Each has its place

---

## 💡 Final Insights

### The Injection Execution Order

**Complete sequence when container loads:**

1. **Container reads XML**
   ```java
   new ClassPathXmlApplicationContext("spring.xml");
   ```

2. **For each bean with singleton scope:**
   
   a. **Create object (constructor)**
   ```java
   Alien obj = new Alien();  // "Object created" prints
   ```
   
   b. **Inject properties (setters)**
   ```java
   obj.setAge(21);  // "setAge called" prints
   obj.setName("Zorg");  // "setName called" prints
   ```
   
   c. **Store in container**

3. **Bean ready to use**
   ```java
   Alien obj = context.getBean("alien1");  // Fully configured!
   ```

**This is why setter prints appear during container initialization!**

### The Naming Convention

**Why `<property>` not `<setter>`?**

**"Property" is Java Beans terminology:**
- A property is accessible through getters/setters
- More abstract than "setter"
- Emphasizes what you're configuring (the property)
- Not how it's configured (the method)

**Spring uses Java Beans conventions throughout!**

### Real-World Applications

**Where setter injection is used:**

**Database configurations:**
```xml
<bean id="dataSource" class="DataSource">
    <property name="url" value="jdbc:mysql://localhost:3306/mydb" />
    <property name="username" value="root" />
    <property name="password" value="admin" />
</bean>
```

**Email settings:**
```xml
<bean id="emailService" class="EmailService">
    <property name="smtpHost" value="smtp.gmail.com" />
    <property name="port" value="587" />
</bean>
```

**Application settings:**
```xml
<bean id="config" class="AppConfig">
    <property name="maxConnections" value="100" />
    <property name="timeout" value="30" />
</bean>
```

**Setter injection is EVERYWHERE in Spring applications!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Wrong property name

**Wrong:**
```xml
<property name="setAge" value="21" />  <!-- Using method name ❌ -->
```

**Correct:**
```xml
<property name="age" value="21" />  <!-- Using variable name ✅ -->
```

### Mistake 2: Missing setter method

**Java class:**
```java
private int age;
// No setter method!
```

**XML:**
```xml
<property name="age" value="21" />  <!-- Will fail! ❌ -->
```

**Fix: Always create setter!**

### Mistake 3: Using value for objects

**Wrong:**
```xml
<property name="laptop" value="laptop1" />  <!-- Object needs ref ❌ -->
```

**Correct:**
```xml
<property name="laptop" ref="laptop1" />  <!-- Use ref for beans ✅ -->
```

### Mistake 4: Typo in property name

**Java:**
```java
private int age;
public void setAge(int age) { ... }
```

**XML:**
```xml
<property name="ages" value="21" />  <!-- Typo: ages vs age ❌ -->
```

**Spring will throw error: No setter found for property 'ages'**

---

## 🎯 Practice Exercises

### Exercise 1: Multiple properties

Create a `Computer` class with properties:
- `brand` (String)
- `ram` (int)
- `price` (double)

Inject all three using setter injection.

### Exercise 2: Verify setter calls

Add print statements in all your setters. Run the application and observe when each setter is called.

### Exercise 3: Different beans, different values

Create two Alien beans with different ages:
```xml
<bean id="alien1" class="Alien">
    <property name="age" value="21" />
</bean>

<bean id="alien2" class="Alien">
    <property name="age" value="35" />
</bean>
```

Retrieve both and verify they have different ages.

### Exercise 4: Comment out setter

Remove the `setAge()` method temporarily. Try to run with property injection. What error do you get? Understand the error message!

---

## 🔗 Quick Summary

**Setter Injection = Injecting values through setter methods**

**Configuration:**
```xml
<bean id="alien1" class="com.telusko.app.Alien">
    <property name="age" value="21" />
    <property name="name" value="Zorg" />
</bean>
```

**Requirements:**
- Private variables ✅
- Public setter methods ✅
- Getters for reading values ✅

**How it works:**
1. Spring creates object (constructor)
2. Spring reads `<property>` tags
3. Spring calls corresponding setters
4. Object fully configured and stored

**Next topic:** Constructor injection and injecting object references (ref attribute)! 🔗
