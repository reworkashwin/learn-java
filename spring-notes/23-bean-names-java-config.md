# 🏷️ Bean Names in Java Configuration - Naming Your Beans

## Introduction

We just learned Java-based configuration:

```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**We've been retrieving beans by TYPE:**

```java
Desktop dt = context.getBean(Desktop.class);
//                            ^^^^^^^^^^^^^^ By type
```

**But what about retrieving by NAME?**

```java
Desktop dt = context.getBean("com2", Desktop.class);
//                            ^^^^^^ By name?
```

**Think about questions:**
- What IS the bean name?
- How is it determined?
- Can we customize it?
- Can one bean have multiple names?

**In XML, we had:**
```xml
<bean id="com1" class="Laptop" />     <!-- Explicit name -->
<bean id="com2" class="Desktop" />    <!-- We chose the name -->
```

**But in Java config, we didn't specify any name!**

```java
@Bean
public Desktop desktop() {  // Where's the name?
    return new Desktop();
}
```

**So what IS the bean name?**

The instructor reveals: **The method name IS the bean name!** By default, Spring uses the method name as the bean identifier. But you can customize it using the `name` attribute of the `@Bean` annotation.

**In this lesson, you'll learn:**
- Default bean naming: method name becomes bean ID
- How to retrieve beans by name in Java configuration
- Customizing bean names with @Bean(name="...")
- Giving multiple names to a single bean
- Arrays of bean names
- When method names matter and when they don't
- Best practices for naming beans
- Preview: scope and primary attributes coming next

Time to name your beans! 🏷️

---

## Concept 1: The Default Bean Name

### 🧠 What's in a name?

**Our current configuration:**

```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**We retrieve by type:**
```java
Desktop dt = context.getBean(Desktop.class);  // ✅ Works
```

**But what if we retrieve by name?**

### 🧪 Try retrieving by name

**Let's try "com2" (like we used in XML):**

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Desktop dt = context.getBean("com2", Desktop.class);
    //                            ^^^^^^ Name?
    dt.compile();
}
```

**Run it...**

**Error:**
```
NoSuchBeanDefinitionException: No bean named 'com2' available
```

**It failed!** ❌

**The instructor asks:**

> "Of course, right? But we have mentioned the name of a bean because if you remember the XML configuration we were specifying the bean name."

### 🧠 But there IS a default name!

**The instructor reveals:**

> "So the default name of your bean is actually your method name. The method name is desktop."

**Aha!** 💡

**Method name = Bean name!**

### 🧪 Try with method name

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Desktop dt = context.getBean("desktop", Desktop.class);
    //                            ^^^^^^^^^^ Method name!
    dt.compile();
}
```

**Output:**
```
Compiling using Desktop
```

**It works!** ✅

**The instructor confirms:**

> "So basically by default the name of your bean is the method name."

### 💡 The rule

**Default bean naming:**

```java
@Bean
public Desktop desktop() {  // Method name: "desktop"
    return new Desktop();
}
// Bean name in container: "desktop"
```

**Another example:**
```java
@Bean
public Desktop desktop1() {  // Method name: "desktop1"
    return new Desktop();
}
// Bean name in container: "desktop1"
```

**The instructor demonstrates:**

> "Let's say your method name is desktop1. So your bean name is desktop1. So if you want to use it, instead of using com2, we need to use desktop1."

### 🧠 Why this makes sense

**XML approach:**
```xml
<bean id="com2" class="Desktop" />
<!--  ^^^ Explicit ID required -->
```

**Java approach:**
```java
@Bean
public Desktop desktop() {  // Method name becomes ID
    return new Desktop();
}
```

**In Java:**
- Method already has a name
- Spring reuses it as bean name
- Less redundancy
- Convention over configuration

---

## Concept 2: Customizing Bean Names

### 🧠 What if we want a different name?

**Current:**
```java
@Bean
public Desktop desktop() {  // Bean name: "desktop"
    return new Desktop();
}
```

**Desired:**
```java
// Bean name: "com2" (like XML)
// But method name: desktop
```

**Can we change it?**

**The instructor asks:**

> "But can we change it? Let's try."

### ⚙️ The name attribute

**@Bean annotation has attributes!**

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean(name = "com2")  // Custom name!
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**The name attribute overrides default!**

**The instructor explains:**

> "If you want to change the name of a bean, you can just add some attributes here. There is an attribute called name."

### 🧪 Test custom name

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Desktop dt = context.getBean("com2", Desktop.class);
    //                            ^^^^^^ Custom name
    dt.compile();
}
```

**Output:**
```
Compiling using Desktop
```

**It works!** ✅

**The instructor confirms:**

> "And now the same name you can use it here. And now with this, run this, it works."

### 💡 Method name vs bean name

**Important distinction:**

```java
@Bean(name = "com2")
public Desktop desktop() {
//     ^^^^^^^ Method name (for Java)
//             ^^^^^^ Bean name (for Spring)
    return new Desktop();
}
```

**Two separate identifiers:**

1. **Java method name:** `desktop()`
   - Used in Java code
   - Can be called by other @Bean methods
   - Java identifier rules apply

2. **Spring bean name:** `"com2"`
   - Used in Spring container
   - Used in getBean() calls
   - String value, any characters allowed

### 🧠 When each is used

**Method name used:**
```java
@Bean
public Alien alien() {
    Alien a = new Alien();
    a.setCom(desktop());  // Calling method by Java name
    return a;
}
```

**Bean name used:**
```java
Desktop dt = context.getBean("com2", Desktop.class);
//                            ^^^^^^ Spring bean name
```

**Two different contexts!**

---

## Concept 3: Multiple Names for One Bean

### 🧠 Can one bean have multiple names?

**The instructor reveals:**

> "In fact, it's not just one name. You can give multiple names to it."

**Real-world scenario:**
```java
// Same bean, different contexts call it different names:
// - Configuration calls it "dataSource"
// - Legacy code calls it "primaryDB"
// - Tests call it "testDB"
```

**Can one bean respond to all these names?**

**Yes!**

### ⚙️ The name attribute accepts an array

**Single name (what we've done):**
```java
@Bean(name = "com2")
public Desktop desktop() {
    return new Desktop();
}
```

**Multiple names (array):**
```java
@Bean(name = {"com2", "desktop1", "beast"})
public Desktop desktop() {
    return new Desktop();
}
```

**Array of strings!**

### 🧪 Test multiple names

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean(name = {"com2", "desktop1", "beast"})
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**App.java (try ALL the names):**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    // Try name 1
    Desktop dt1 = context.getBean("com2", Desktop.class);
    System.out.println("Got bean with name 'com2'");
    
    // Try name 2
    Desktop dt2 = context.getBean("desktop1", Desktop.class);
    System.out.println("Got bean with name 'desktop1'");
    
    // Try name 3
    Desktop dt3 = context.getBean("beast", Desktop.class);
    System.out.println("Got bean with name 'beast'");
    
    // All same instance?
    System.out.println("Same instance? " + (dt1 == dt2 && dt2 == dt3));
}
```

**Output:**
```
Got bean with name 'com2'
Got bean with name 'desktop1'
Got bean with name 'beast'
Same instance? true
```

**All three names work!** ✅

**And they all return the SAME instance (singleton)!**

### 🧠 The instructor's example

**The instructor shares:**

> "Let's say I also want to call this desktop1. I also want to call this maybe beast, because one of the machines in my office, we call them as beast."

**Real-world naming:**
- Technical name: `desktop1`
- Reference name: `com2`
- Nickname: `beast`

**All valid, all work!**

### 🧪 Try invalid name

**What if we use a name NOT in the array?**

**App.java:**
```java
Desktop dt = context.getBean("invalidName", Desktop.class);
```

**Error:**
```
NoSuchBeanDefinitionException: No bean named 'invalidName' available
```

**The instructor confirms:**

> "What if you use some different name which is not mentioned there? So it will not work."

**Only registered names work!**

### 💡 When to use multiple names

**Common scenarios:**

**1. Migration/Deprecation:**
```java
@Bean(name = {"userService", "legacyUserService"})
public UserService userService() {
    return new UserService();
}
// Old code uses "legacyUserService"
// New code uses "userService"
// Both work during transition!
```

**2. Aliases:**
```java
@Bean(name = {"database", "primaryDB", "prodDB"})
public DataSource dataSource() {
    return new DataSource();
}
```

**3. Compatibility:**
```java
@Bean(name = {"com1", "laptop", "primaryComputer"})
public Laptop laptop() {
    return new Laptop();
}
// Different parts of app use different names
```

### 💡 Best practice

**The instructor says:**

> "So yeah, normally we use one word, but if you want to use multiple words, you can use this."

**Usually:**
- One name is enough
- Multiple names for special cases
- Don't overuse (confusing!)

---

## Concept 4: Returning to Default Naming

### 🧠 Simplicity of defaults

**After showing customization, the instructor returns to defaults:**

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean  // No name attribute
    public Desktop desktop() {
        return new Desktop();
    }
}
```

**The instructor says:**

> "I still want to go for a default name. So I will say @Bean, that's it. And by default the name will be desktop, right?"

### 🧠 When to use default vs custom names

**Use DEFAULT (method name):**
```java
@Bean
public Desktop desktop() {  // Bean name: "desktop"
    return new Desktop();
}
```

**When:**
- Method name is descriptive
- No legacy name requirements
- Simple, straightforward naming

**Use CUSTOM name:**
```java
@Bean(name = "com2")
public Desktop desktop() {  // Bean name: "com2"
    return new Desktop();
}
```

**When:**
- Need specific name for compatibility
- Migrating from XML (keeping old IDs)
- Multiple names needed
- Special naming requirements

### 💡 XML to Java migration

**When migrating from XML to Java config:**

**Original XML:**
```xml
<bean id="com1" class="Laptop" />
<bean id="com2" class="Desktop" />
```

**Option 1: Keep original names (smooth migration)**
```java
@Bean(name = "com1")
public Laptop laptop() {
    return new Laptop();
}

@Bean(name = "com2")
public Desktop desktop() {
    return new Desktop();
}
```
**Advantage:** Existing getBean("com1") calls still work!

**Option 2: Use new names (cleaner)**
```java
@Bean
public Laptop laptop() {  // Bean name: "laptop"
    return new Laptop();
}

@Bean
public Desktop desktop() {  // Bean name: "desktop"
    return new Desktop();
}
```
**Advantage:** More readable, but requires updating getBean calls.

---

## Concept 5: Complete Examples

### 🧪 Example 1: Default naming

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Laptop laptop() {  // Bean name: "laptop"
        return new Laptop();
    }
    
    @Bean
    public Desktop desktop() {  // Bean name: "desktop"
        return new Desktop();
    }
    
    @Bean
    public Alien alien() {  // Bean name: "alien"
        Alien a = new Alien();
        a.setAge(21);
        a.setCom(laptop());  // Method call
        return a;
    }
}
```

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    // Get by method names
    Laptop laptop = context.getBean("laptop", Laptop.class);
    Desktop desktop = context.getBean("desktop", Desktop.class);
    Alien alien = context.getBean("alien", Alien.class);
    
    alien.code();
}
```

**Clean and simple!**

### 🧪 Example 2: Custom naming (XML compatibility)

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean(name = "com1")
    public Laptop laptop() {  // Bean name: "com1"
        return new Laptop();
    }
    
    @Bean(name = "com2")
    public Desktop desktop() {  // Bean name: "com2"
        return new Desktop();
    }
    
    @Bean
    public Alien alien() {  // Bean name: "alien"
        Alien a = new Alien();
        a.setAge(21);
        a.setCom(laptop());  // Still call by method name!
        return a;
    }
}
```

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    // Get by custom names
    Laptop laptop = context.getBean("com1", Laptop.class);
    Desktop desktop = context.getBean("com2", Desktop.class);
    
    laptop.compile();
    desktop.compile();
}
```

**Maintains XML naming!**

### 🧪 Example 3: Multiple names

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean(name = {"primaryDB", "database", "dataSource"})
    public DataSource dataSource() {
        DataSource ds = new DataSource();
        ds.setUrl("jdbc:mysql://localhost/mydb");
        return ds;
    }
    
    @Bean(name = {"userSvc", "userService"})
    public UserService userService() {
        UserService service = new UserService();
        service.setDataSource(dataSource());  // Method call
        return service;
    }
}
```

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    // All these work!
    DataSource ds1 = context.getBean("primaryDB", DataSource.class);
    DataSource ds2 = context.getBean("database", DataSource.class);
    DataSource ds3 = context.getBean("dataSource", DataSource.class);
    
    System.out.println(ds1 == ds2 && ds2 == ds3);  // true - same bean!
}
```

**Flexible naming for different contexts!**

---

## Concept 6: Bean Names vs Method Calls

### 🧠 Important distinction

**Two ways to reference a bean:**

**1. Spring container reference (by bean name):**
```java
context.getBean("com2", Desktop.class);
//                ^^^^^^ Bean name (String)
```

**2. Java method call (by method name):**
```java
@Bean
public Alien alien() {
    Alien a = new Alien();
    a.setCom(desktop());  // Method name (Java identifier)
    return a;
}
```

### 🧠 These are independent!

**Example:**
```java
@Configuration
public class AppConfig {
    
    @Bean(name = "com2")  // Bean name: "com2"
    public Desktop desktop() {  // Method name: "desktop"
        return new Desktop();
    }
    
    @Bean
    public Alien alien() {
        Alien a = new Alien();
        a.setCom(desktop());  // ✅ Calls method desktop()
        // NOT:
        // a.setCom(com2());  // ❌ No method called com2()
        return a;
    }
}
```

**Within config class:**
- Use method names: `desktop()`
- Java method invocation

**From application code:**
- Use bean names: `"com2"` or `"desktop"`
- Spring container lookup

### 💡 Why this separation?

**Java has rules:**
- Method names are identifiers
- Can't contain spaces or special characters
- Must follow naming conventions

**Spring is flexible:**
- Bean names are strings
- Can be anything: "com2", "my-bean", "bean.2"
- No Java identifier restrictions

**Best of both worlds!**

---

## Concept 7: Preview of Next Topics

### 🧠 The instructor's teaser

**The instructor ends with:**

> "But what if I want two different objects for two different requests? Because by default we know all the beans are singleton. Can you use prototype here? Because in XML we did that. Remember when we used prototype? How do I do that in this configuration? Let's see that in the next video. We'll talk about prototype, and we'll also talk about how do you make a bean primary."

**Next topics coming:**

**1. Prototype scope in Java config**
```java
@Bean
@Scope("prototype")  // Multiple instances
public Desktop desktop() {
    return new Desktop();
}
```

**2. Primary beans in Java config**
```java
@Bean
@Primary  // Default choice
public Laptop laptop() {
    return new Laptop();
}
```

**Exciting next lessons!**

---

## ✅ Key Takeaways

### About Default Bean Names

1. **Method name = Bean name (by default)**
   ```java
   @Bean
   public Desktop desktop() {  // Bean name: "desktop"
       return new Desktop();
   }
   ```

2. **Used in getBean() calls**
   ```java
   context.getBean("desktop", Desktop.class);
   ```

3. **Automatic, no configuration needed**
   - Convention over configuration
   - Less boilerplate
   - Readable code

### About Custom Bean Names

1. **Use name attribute to customize**
   ```java
   @Bean(name = "com2")
   public Desktop desktop() {  // Bean name: "com2"
       return new Desktop();
   }
   ```

2. **Method name and bean name can differ**
   - Method name: for Java code
   - Bean name: for Spring container

3. **Useful for compatibility**
   - Migrating from XML
   - Legacy code support
   - Specific naming requirements

### About Multiple Names

1. **Array of names for one bean**
   ```java
   @Bean(name = {"name1", "name2", "name3"})
   public Desktop desktop() {
       return new Desktop();
   }
   ```

2. **All names point to same instance**
   - Still singleton (by default)
   - Same object, multiple aliases

3. **Use sparingly**
   - Normally one name sufficient
   - Multiple names for special cases
   - Can be confusing if overused

### About Method Calls vs Bean Names

1. **Within config: use method names**
   ```java
   a.setCom(desktop());  // Method call
   ```

2. **From application: use bean names**
   ```java
   context.getBean("com2", Desktop.class);
   ```

3. **Two separate namespaces**
   - Java namespace (methods)
   - Spring namespace (beans)

---

## 💡 Final Insights

### XML to Java Naming Comparison

**Complete translation:**

**XML:**
```xml
<bean id="com2" class="Desktop" />
<!--  ^^^^^^ Bean ID
      ^^^^^^^^^^^^^^^^^^^^^^^^^ Class -->
```

**Java:**
```java
@Bean(name = "com2")  // Bean name
//           ^^^^^^
public Desktop desktop() {  // Return type (class)
//     ^^^^^^^
    return new Desktop();
}
```

**Mapping:**
- XML `id` → Java `@Bean(name = "...")`
- XML `class` → Java return type
- Default: XML requires id, Java uses method name

### The @Bean Annotation Attributes

**Full @Bean annotation has many attributes:**

```java
@Bean(
    name = {"bean1", "bean2"},      // Bean names (aliases)
    initMethod = "init",             // Init callback
    destroyMethod = "cleanup"        // Destroy callback
    // More attributes exist!
)
public Desktop desktop() {
    return new Desktop();
}
```

**We've learned:**
- ✅ name attribute

**Coming soon:**
- 🔜 Scope (prototype)
- 🔜 Primary
- 🔜 Lazy initialization
- 🔜 DependsOn

**Each gets its own lesson!**

### Bean Naming Best Practices

**Good naming:**

```java
@Bean
public UserService userService() {  // Clear, matches class
    return new UserService();
}

@Bean
public DataSource primaryDataSource() {  // Descriptive, indicates role
    return new DataSource();
}
```

**Avoid:**

```java
@Bean
public UserService a() {  // ❌ Not descriptive
    return new UserService();
}

@Bean(name = "xyz123")
public DataSource dataSource() {  // ❌ Cryptic name
    return new DataSource();
}
```

**Guidelines:**
- Use descriptive names
- Follow Java naming conventions
- Match class name (usually)
- Indicate role if multiple beans of same type

### Real-World Migration Example

**Converting XML project to Java config:**

**Step 1: Keep all XML names**
```java
// Maintain exact XML IDs
@Bean(name = "com1")
public Laptop laptop() { return new Laptop(); }

@Bean(name = "com2")
public Desktop desktop() { return new Desktop(); }
```

**Step 2: Test everything still works**

**Step 3: Gradually rename**
```java
@Bean(name = {"laptop", "com1"})  // New name + old name
public Laptop laptop() { return new Laptop(); }
```

**Step 4: Update codebase to use new names**

**Step 5: Remove old names**
```java
@Bean  // Just "laptop" now
public Laptop laptop() { return new Laptop(); }
```

**Gradual, testable migration!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Confusing method name with bean name

**Wrong assumption:**
```java
@Bean(name = "com2")
public Desktop desktop() {
    return new Desktop();
}

// Later...
@Bean
public Alien alien() {
    a.setCom(com2());  // ❌ com2() method doesn't exist!
    return a;
}
```

**Correct:**
```java
@Bean
public Alien alien() {
    a.setCom(desktop());  // ✅ Call method name, not bean name
    return a;
}
```

### Mistake 2: Expecting default name with custom name

**Wrong:**
```java
@Bean(name = "com2")
public Desktop desktop() {
    return new Desktop();
}

// Later...
context.getBean("desktop", Desktop.class);  // ❌ Name is "com2", not "desktop"!
```

**Correct:**
```java
context.getBean("com2", Desktop.class);  // ✅ Use custom name
```

### Mistake 3: Forgetting quotes in array

**Wrong:**
```java
@Bean(name = {com1, com2})  // ❌ Syntax error!
public Laptop laptop() {
    return new Laptop();
}
```

**Correct:**
```java
@Bean(name = {"com1", "com2"})  // ✅ Strings in quotes
public Laptop laptop() {
    return new Laptop();
}
```

### Mistake 4: Using method name after setting custom name

**Confusing:**
```java
@Bean(name = "customName")
public Desktop desktop() {
    return new Desktop();
}

// This fails:
context.getBean("desktop", Desktop.class);  // ❌ Name is "customName"

// This works:
context.getBean("customName", Desktop.class);  // ✅
```

**If you set custom name, default (method name) is NOT available!**

---

## 🎯 Practice Exercises

### Exercise 1: Bean naming experiment

Create a @Bean method and test:
- Getting by method name (default)
- Setting custom name, getting by custom name
- Trying to get by method name when custom name is set (observe error)

### Exercise 2: Multiple names

Create a bean with 3 different names. Retrieve it using each name. Verify all return the same instance.

### Exercise 3: XML to Java migration

Given this XML:
```xml
<bean id="prodDB" class="Database" />
<bean id="testDB" class="Database" />
<bean id="service" class="UserService">
    <property name="database" ref="prodDB" />
</bean>
```

Convert to Java config maintaining the same bean names.

### Exercise 4: Bean name refactoring

Create configuration with non-descriptive names ("bean1", "bean2"). Refactor to use descriptive names while maintaining backward compatibility using multiple names.

---

## 🔗 Quick Summary

**Bean names in Java configuration:**

**Default naming:**
```java
@Bean
public Desktop desktop() {  // Bean name: "desktop" (method name)
    return new Desktop();
}
```

**Custom naming:**
```java
@Bean(name = "com2")
public Desktop desktop() {  // Bean name: "com2"
    return new Desktop();
}
```

**Multiple names:**
```java
@Bean(name = {"name1", "name2", "name3"})
public Desktop desktop() {  // Responds to all three names
    return new Desktop();
}
```

**Key rule:**
- Method name for Java calls: `desktop()`
- Bean name for getBean(): `"desktop"` or `"com2"`

**Next topics:**
- Prototype scope in Java config
- Primary beans in Java config

Get ready for more @Bean attributes! 🎊
