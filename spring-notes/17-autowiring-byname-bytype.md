# 🔄 Autowiring - Automatic Dependency Resolution

## Introduction

We've learned two injection techniques:
- **Setter injection** - using `<property>` tags
- **Constructor injection** - using `<constructor-arg>` tags

**Both require explicit configuration:**

```xml
<bean id="laptop" class="com.telusko.app.Laptop" />

<bean id="alien" class="com.telusko.app.Alien">
    <property name="computer" ref="laptop" />  <!-- Explicit wiring -->
</bean>
```

**You must explicitly tell Spring:** "Wire the laptop bean to the computer property."

**But think about it...**

What if your bean needs the `computer` property, and you have a bean named `computer` in your configuration?

**Shouldn't Spring be smart enough to connect them automatically?**

**After all:**
- Property name: `computer`
- Bean ID: `computer`
- They match!

**Why make you type it out?**

**Enter: Autowiring!**

Autowiring is Spring's way of automatically resolving dependencies without explicit `<property>` or `<constructor-arg>` configuration. Spring looks at your bean definitions and automatically wires compatible beans together.

**In this lesson, you'll discover:**
- What autowiring is and why it exists
- `autowire="byName"` - matching by bean ID
- `autowire="byType"` - matching by class/interface type
- How explicit properties override autowiring
- The ambiguity problem with multiple matching beans
- Connection to `@Autowired` annotation in Spring Boot
- When to use autowiring vs explicit wiring

This is where Spring starts feeling truly "magical"! 🔄

---

## Concept 1: Setting Up the Interface-Based Design

### 🧠 Recap from previous lesson

**We created an interface-based design:**

**Computer.java (interface):**
```java
package com.telusko.app;

public interface Computer {
    void compile();
}
```

**Laptop.java (implementation):**
```java
package com.telusko.app;

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

**Desktop.java (implementation):**
```java
package com.telusko.app;

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

**Alien.java (depends on Computer interface):**
```java
package com.telusko.app;

public class Alien {
    private int age;
    private Computer com;  // Changed from Laptop to Computer!
    
    public Alien() {
        System.out.println("Alien object created");
    }
    
    // Getters and Setters
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
    
    public void code() {
        System.out.println("Coding...");
        com.compile();
    }
}
```

**This is good design** - Alien depends on interface, not concrete class!

---

## Concept 2: The Constructor Injection Error

### 🧠 Starting point

**From previous video, we might still have constructor injection:**

```xml
<bean id="laptop" class="com.telusko.app.Laptop" />

<bean id="alien" class="com.telusko.app.Alien">
    <constructor-arg index="0" value="21" />
    <constructor-arg index="1" ref="laptop" />
</bean>
```

### 🧪 Try to run

**Error:**
```
Error creating bean with name 'alien':
Could not resolve matching constructor
```

### ❓ What happened?

**The Alien class doesn't have that constructor anymore!**

**Maybe we removed it or changed it.**

**The instructor decides:**

> "Let me go back to the property one. Let's work with the property."

**Translation: Switch to setter injection!**

---

## Concept 3: Switching to Setter Injection

### ⚙️ Update configuration

**spring.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="laptop" class="com.telusko.app.Laptop" />
    
    <bean id="alien" class="com.telusko.app.Alien">
        <property name="age" value="21" />
        <property name="com" ref="laptop" />
    </bean>

</beans>
```

**Changes:**
- Using `<property>` instead of `<constructor-arg>`
- Property name changed from `lap` to `com` (matches new variable name)
- Still explicitly referencing `laptop` bean

### 🧪 Test it

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj = (Alien) context.getBean("alien");
    System.out.println("Age: " + obj.getAge());
    obj.code();
}
```

**Output:**
```
Laptop object created
Alien object created
Age: 21
Coding...
Compiling using Laptop
```

**It works!** ✅

### 💡 The setup

Now we have:
- Interface: `Computer`
- Implementation: `Laptop`
- Dependency: `Alien` → `Computer`
- Wiring: Explicit `ref="laptop"`

**Ready to explore autowiring!**

---

## Concept 4: Matching Names - The Setup for byName

### 🧠 A thought experiment

**Current configuration:**
```xml
<bean id="laptop" class="com.telusko.app.Laptop" />

<bean id="alien" class="com.telusko.app.Alien">
    <property name="com" ref="laptop" />
</bean>
```

**Notice:**
- Property name in Alien: `com`
- Bean ID: `laptop`
- They DON'T match!

### ⚙️ Make them match

**Change bean ID to match property name:**

```xml
<bean id="com" class="com.telusko.app.Laptop" />

<bean id="alien" class="com.telusko.app.Alien">
    <property name="age" value="21" />
    <property name="com" ref="com" />  <!-- Same name! -->
</bean>
```

**Now:**
- Property name: `com`
- Bean ID: `com`
- Reference: `com`
- **They all match!**

### 🧪 Test with matching names

**Run it.**

**Output:**
```
Laptop object created
Alien object created
Age: 21
Coding...
Compiling using Laptop
```

**Still works!** ✅

### 🧠 The critical test

**Now comment out the property:**

```xml
<bean id="com" class="com.telusko.app.Laptop" />

<bean id="alien" class="com.telusko.app.Alien">
    <property name="age" value="21" />
    <!-- <property name="com" ref="com" /> -->  <!-- Commented! -->
</bean>
```

**What will happen?**

### 🧪 Run without explicit property

**Output:**
```
Laptop object created
Alien object created
Age: 21
Coding...
Exception in thread "main" java.lang.NullPointerException
    at com.telusko.app.Alien.code(Alien.java:25)
```

**NullPointerException!** 💥

### ❓ Why?

**Without the `<property>` tag:**
- Spring creates both beans
- But doesn't wire them together
- `com` variable in Alien remains null
- Calling `com.compile()` crashes!

**Expected behavior - we've seen this before.**

### 🧠 But wait...

**The instructor asks:**

> "Don't you think when you have the same name, Spring should be smart enough to automatically connect them?"

**Think about it:**
- Bean ID: `com`
- Property name: `com`
- They match perfectly!
- **Why not connect automatically?**

**This is the motivation for autowiring!**

---

## Concept 5: Introducing Autowiring by Name

### 🧠 The autowire attribute

**Spring provides automatic wiring:**

```xml
<bean id="com" class="com.telusko.app.Laptop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byName">
    <property name="age" value="21" />
    <!-- NO property for com - Spring will autowire it! -->
</bean>
```

**Key addition:**
```xml
autowire="byName"
```

### ❓ What does autowire="byName" do?

**Spring's logic:**

1. **Look at the bean's properties**
   - Alien has property named `com`
   
2. **Search for beans with matching ID**
   - Find bean with id="com"
   
3. **Automatically wire them**
   - Call `setComMethod(comBean)`

**No explicit `<property>` tag needed!**

### 🧪 Test autowiring by name

**spring.xml:**
```xml
<bean id="com" class="com.telusko.app.Laptop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byName">
    <property name="age" value="21" />
</bean>
```

**Run it.**

**Output:**
```
Laptop object created
Alien object created
Age: 21
Coding...
Compiling using Laptop
```

**SUCCESS!** 🎉

**No NullPointerException!**  
**Spring automatically wired the `com` bean!**

### 💡 How it works

**Spring's autowiring process:**

1. **Container loads beans**
   - Creates `com` bean (Laptop instance)
   - Creates `alien` bean (Alien instance)

2. **Spring sees `autowire="byName"`**
   - Looks at all setter methods in Alien
   - Finds `setCom(Computer com)`
   - Extracts property name: `com`

3. **Spring searches for matching bean**
   - Looks for bean with id="com"
   - Finds it!

4. **Spring automatically wires**
   ```java
   alien.setCom(comBean);  // Automatic!
   ```

**You don't write the wiring - Spring does it!**

---

## Concept 6: Multiple Implementations - Choosing by Name

### 🧠 Adding Desktop bean

**We have two implementations:**

```xml
<bean id="laptop" class="com.telusko.app.Laptop" />
<bean id="desktop" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byName">
    <property name="age" value="21" />
</bean>
```

**Question:** Which one will be autowired?

### 🧪 Test with laptop and desktop

**Run it.**

**Output:**
```
Laptop object created
Desktop object created
Alien object created
Age: 21
Coding...
Exception: NullPointerException
```

**Failed!** ❌

### ❓ Why?

**Spring's logic:**
- Property name: `com`
- Bean IDs: `laptop`, `desktop`
- No bean with id="com"!
- Can't autowire!

**Names don't match!**

### ⚙️ Fix: Make one match

**Option 1: Rename laptop to com**
```xml
<bean id="com" class="com.telusko.app.Laptop" />
<bean id="desktop" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byName" />
```

**Now:**
- Property name: `com`
- Bean ID: `com` (Laptop)
- Match! ✅

**Output:**
```
Laptop object created
Desktop object created
Alien object created
Age: 21
Coding...
Compiling using Laptop
```

**Works!** Laptop is used!

**Option 2: Rename desktop to com**
```xml
<bean id="laptop" class="com.telusko.app.Laptop" />
<bean id="com" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byName" />
```

**Output:**
```
Laptop object created
Desktop object created
Alien object created
Age: 21
Coding...
Compiling using Desktop
```

**Works!** Desktop is used instead!

### 💡 byName matches bean IDs

**Autowiring by name:**
- Looks at property name
- Searches for bean with matching ID
- Autowires the matching bean
- **Name determines which implementation!**

---

## Concept 7: Explicit Property Overrides Autowiring

### 🧠 What if you specify both?

**Configuration:**
```xml
<bean id="com" class="com.telusko.app.Desktop" />  <!-- com = Desktop -->
<bean id="laptop" class="com.telusko.app.Laptop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byName">
    <property name="age" value="21" />
    <property name="com" ref="laptop" />  <!-- Explicit: use laptop! -->
</bean>
```

**Conflict:**
- Autowire byName would choose: `com` bean (Desktop)
- Explicit property says: use `laptop` bean

**Which wins?**

### 🧪 Test priority

**Run it.**

**Output:**
```
Desktop object created
Laptop object created
Alien object created
Age: 21
Coding...
Compiling using Laptop
```

**Explicit property wins!** ✅

### 💡 The rule

> "Even if you do autowire, if you're explicitly mentioning the property, it will prefer your property instead of going for autowire."

**Priority order:**
1. **Explicit property** (highest priority)
2. **Autowiring** (fallback)

**Autowiring only works when property is NOT explicitly specified!**

---

## Concept 8: Introducing Autowiring by Type

### 🧠 The byName limitation

**Current situation:**
```xml
<bean id="laptop1" class="com.telusko.app.Laptop" />
<bean id="desktop1" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byName" />
```

**Problem:**
- Property name: `com`
- Bean IDs: `laptop1`, `desktop1`
- No match! Can't autowire!

**You'd have to rename beans to `com`.**

**But there's a better way!**

### 🧠 Autowire by type

**Change from byName to byType:**

```xml
<bean id="laptop1" class="com.telusko.app.Laptop" />
<bean id="desktop1" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byType">
    <property name="age" value="21" />
</bean>
```

**Key change:**
```xml
autowire="byType"
```

### ❓ What does autowire="byType" do?

**Spring's logic:**

1. **Look at property types**
   - Alien has property of type `Computer`
   
2. **Search for beans of that type**
   - Find beans that are `Computer` (or implement Computer)
   
3. **Automatically wire compatible bean**
   - Ignore bean IDs!
   - Match by class/interface type!

### 🧪 Test autowire by type

**spring.xml:**
```xml
<bean id="laptop1" class="com.telusko.app.Laptop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byType">
    <property name="age" value="21" />
</bean>
```

**Run it.**

**Output:**
```
Laptop object created
Alien object created
Age: 21
Coding...
Compiling using Laptop
```

**SUCCESS!** ✅

**Bean ID doesn't matter!**
- ID is `laptop1` (not `com`)
- Still autowired because Laptop implements Computer!

### 🧪 Test with Desktop

**Change to Desktop:**
```xml
<bean id="desktop1" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byType">
    <property name="age" value="21" />
</bean>
```

**Output:**
```
Desktop object created
Alien object created
Age: 21
Coding...
Compiling using Desktop
```

**Works with Desktop too!** ✅

### 💡 byType matches by class/interface

**Autowiring by type:**
- Looks at property type (Computer)
- Searches for beans of compatible type
- **Name/ID doesn't matter!**
- Type determines which implementation!

---

## Concept 9: The Ambiguity Problem

### 🧠 Multiple beans of same type

**What if we have BOTH?**

```xml
<bean id="laptop1" class="com.telusko.app.Laptop" />
<bean id="desktop1" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byType">
    <property name="age" value="21" />
</bean>
```

**Both beans are type Computer!**

**Which one should Spring choose?**

### 🧪 Test with multiple matches

**Run it.**

**Error:**
```
Error creating bean with name 'alien':
expected single matching bean but found 2: laptop1, desktop1
```

### ❓ What's the problem?

**Spring's dilemma:**
- Property type: `Computer`
- Found 2 beans of type Computer:
  1. laptop1 (Laptop implements Computer)
  2. desktop1 (Desktop implements Computer)
- **Ambiguous! Can't decide!**

**Spring throws error rather than guess!**

### 💡 The ambiguity problem

**Autowire byType works only when:**
- ✅ Single bean of required type exists
- ❌ Multiple beans of same type → error!

**This is a MAJOR limitation of byType!**

---

## Concept 10: Solutions to Ambiguity (Preview)

### 🧠 Possible solutions

**The instructor teases:**

> "Can we solve this? Of course we can solve this... I will tell you about the solution in the next video."

**Hints at solutions:**

**1. Switch to byName**
```xml
<bean id="com" class="com.telusko.app.Laptop" />
<bean id="desktop1" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byName" />
```
Explicitly choosing by matching name.

**2. Mark one as primary (spoiler for next lesson!)**

**3. Use explicit property**
```xml
<bean id="alien" class="com.telusko.app.Alien" autowire="byType">
    <property name="com" ref="laptop1" />  <!-- Override autowire -->
</bean>
```

**We'll learn the best solution in the next lesson!**

---

## Concept 11: Connection to @Autowired Annotation

### 🧠 The instructor's revelation

> "In fact, we have done this in Spring Boot as well. Remember the @Autowired annotation? The implementation behind that is this."

**What we learned in XML:**
```xml
<bean id="alien" class="Alien" autowire="byType" />
```

**In Spring Boot with annotations:**
```java
@Component
public class Alien {
    
    @Autowired  // This is autowire="byType"!
    private Computer com;
    
    public void code() {
        com.compile();
    }
}
```

**Same concept!**

### 💡 Annotation vs XML

**XML (what we're learning):**
```xml
<bean id="alien" class="Alien" autowire="byType">
    <property name="com" ref="..." />
</bean>
```

**Annotations (Spring Boot):**
```java
@Component
public class Alien {
    @Autowired
    private Computer com;
}
```

**Understanding XML autowiring helps you understand @Autowired!**

**@Autowired uses byType by default!**

---

## ✅ Key Takeaways

### About Autowiring Concept

1. **Autowiring = automatic dependency resolution**
   - Spring wires dependencies automatically
   - No explicit `<property>` or `<constructor-arg>` needed
   - Reduces XML configuration

2. **Two main autowiring modes**
   - `autowire="byName"` - matches by bean ID
   - `autowire="byType"` - matches by class/interface type

3. **Explicit properties override autowiring**
   - Manual configuration takes priority
   - Autowiring is fallback mechanism

### About byName Autowiring

1. **Matches bean ID to property name**
   ```xml
   <bean id="com" class="Laptop" />
   <bean id="alien" autowire="byName" />
   ```
   - Property name: `com`
   - Bean ID: `com`
   - Match! Autowires automatically

2. **ID must match exactly**
   - Case-sensitive
   - Exact string match required

3. **Use case: Naming convention enforcement**
   - Forces consistent naming
   - Clear about which bean is wired

### About byType Autowiring

1. **Matches by class/interface type**
   ```xml
   <bean id="laptop1" class="Laptop" />
   <bean id="alien" autowire="byType" />
   ```
   - Property type: `Computer`
   - Bean type: `Laptop` (implements Computer)
   - Match! Autowires automatically

2. **ID doesn't matter**
   - Only type matters
   - More flexible than byName

3. **Problem: Ambiguity with multiple beans**
   - Two beans of same type → error
   - Must resolve explicitly

### About Connection to Modern Spring

1. **@Autowired is autowire="byType"**
   - Same underlying mechanism
   - Annotation-based syntax
   - Default in Spring Boot

2. **Understanding XML helps understand annotations**
   - Know what @Autowired does behind scenes
   - Better debugging
   - Deeper Spring knowledge

---

## 💡 Final Insights

### The Evolution of Dependency Injection

**Manual Wiring (explicit):**
```xml
<bean id="alien" class="Alien">
    <property name="com" ref="laptop" />
</bean>
```
✅ Explicit and clear  
❌ Verbose

**XML Autowiring (automatic):**
```xml
<bean id="alien" class="Alien" autowire="byType" />
```
✅ Less configuration  
❌ Some ambiguity

**Annotation Autowiring (modern):**
```java
@Component
public class Alien {
    @Autowired
    private Computer com;
}
```
✅ Minimal configuration  
✅ Convention over configuration  
❌ Less explicit (but modern tools help)

**Each step reduces boilerplate!**

### byName vs byType Decision Matrix

| Scenario | Use byName | Use byType |
|----------|------------|------------|
| Single bean of type | ✅ Works | ✅ Works (better!) |
| Multiple beans, different IDs | ✅ Works (choose by ID) | ❌ Ambiguity error |
| Don't want to manage IDs | ❌ Need matching names | ✅ Flexible IDs |
| Interface-based design | ❌ Tied to ID | ✅ Natural fit |
| Clear intent | ❌ Less clear | ✅ Type-safe |

**Modern recommendation: byType (like @Autowired)**

### The Ambiguity Problem is Real

**Real-world scenario:**

```java
// You have multiple implementations
@Component("emailNotifier")
public class EmailNotifier implements Notifier { ... }

@Component("smsNotifier")
public class SMSNotifier implements Notifier { ... }

@Component
public class UserService {
    @Autowired  // ERROR! Which Notifier?
    private Notifier notifier;
}
```

**Same problem we saw!**

**Solutions (next lesson will cover):**
- Primary beans
- Qualifiers
- Specific bean selection

**This is a common Spring challenge!**

### Why Learn XML When Annotations Exist?

**Student question:** "Why learn XML autowiring if I'll use @Autowired?"

**Answer:**

1. **Legacy code** - Many projects still use XML
2. **Understanding** - Know what annotations do internally
3. **Debugging** - Troubleshoot autowiring issues
4. **Foundation** - Build complete Spring knowledge
5. **Flexibility** - XML still valid for certain scenarios

**Knowing both makes you a better Spring developer!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Expecting byName to match anything

**Wrong assumption:**
```xml
<bean id="laptop" class="Laptop" />
<bean id="alien" autowire="byName" />
<!-- Property name is "com", bean ID is "laptop" -->
<!-- Won't autowire! ❌ -->
```

**Correct:**
```xml
<bean id="com" class="Laptop" />
<bean id="alien" autowire="byName" />
<!-- Now names match! ✅ -->
```

### Mistake 2: Using byType with multiple beans

**Wrong:**
```xml
<bean id="laptop" class="Laptop" />
<bean id="desktop" class="Desktop" />
<bean id="alien" autowire="byType" />
<!-- Both implement Computer - ambiguity! ❌ -->
```

**Fix: Choose one or use explicit property**

### Mistake 3: Forgetting setter method

**Wrong:**
```java
public class Alien {
    private Computer com;
    // No setCom() method! ❌
}
```

```xml
<bean id="alien" autowire="byName" />
<!-- Can't autowire without setter! -->
```

**Correct:**
```java
public void setCom(Computer com) {
    this.com = com;
}
```

### Mistake 4: Mixing autowire modes

**Confusing:**
```xml
<bean id="alien" autowire="byName">
    <property name="com" ref="laptop" />
</bean>
<!-- Why autowire if you're explicit? -->
```

**Better: Pick one approach**

---

## 🎯 Practice Exercises

### Exercise 1: byName practice

Create three beans:
- `engine` of class `Engine`
- `wheels` of class `Wheels`
- `car` of class `Car` with autowire byName

Car should have properties named `engine` and `wheels`.

### Exercise 2: byType practice

Same as Exercise 1, but use any IDs you want and autowire byType.

### Exercise 3: Multiple implementations

Create:
- Interface `Payment`
- Classes `CreditCard`, `PayPal` both implementing Payment
- Class `Checkout` needing Payment

Try byType - observe the error. Then fix with byName.

### Exercise 4: Priority test

Create a bean with autowire byType, but also add an explicit property. Verify explicit wins.

---

## 🔗 Quick Summary

**Autowiring modes:**

```xml
<!-- byName: Match bean ID to property name -->
<bean id="com" class="Laptop" />
<bean id="alien" class="Alien" autowire="byName" />

<!-- byType: Match bean type to property type -->
<bean id="anyId" class="Laptop" />
<bean id="alien" class="Alien" autowire="byType" />
```

**byName:**
- ✅ Matches by ID
- ✅ Works with multiple types
- ❌ ID must match property name

**byType:**
- ✅ Matches by type
- ✅ Flexible IDs
- ❌ Fails with multiple beans of same type

**Next topic:** Solving the ambiguity problem with primary beans! 🎯
