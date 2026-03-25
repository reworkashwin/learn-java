# 🎯 @Primary and @Qualifier - Resolving Ambiguity in Java Config

## Introduction

We left off with a cliffhanger in the previous lesson:

```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean
    public Alien alien(Computer com) {  // Which Computer?
        Alien obj = new Alien();
        obj.setAge(25);
        obj.setCom(com);
        return obj;
    }
}
```

**This works because there's only ONE Computer bean (Desktop).**

**But what if we add Laptop?**

**The instructor says:**

> "Till this point we were having only one computer instance here, which is Desktop. Let me do this for the laptop as well."

**Adding a Laptop bean creates AMBIGUITY:**
- Laptop implements Computer ✅
- Desktop implements Computer ✅
- Spring needs to inject ONE Computer
- Which one should Spring choose? 🤔

**The same problem we solved in XML with:**
```xml
<!-- Solution 1: Explicit reference -->
<property name="com" ref="desktop" />

<!-- Solution 2: Primary bean -->
<bean id="laptop" class="Laptop" primary="true" />
```

**In Java configuration, we have equivalent solutions!**

The @Qualifier annotation lets you specify which bean to inject by name (like XML's `ref` attribute), while @Primary marks a bean as the default choice when multiple candidates exist (like XML's `primary="true"` attribute).

**In this lesson, you'll learn:**
- Adding multiple beans of the same type (Laptop + Desktop)
- The NoUniqueBeanDefinitionException error when ambiguity exists
- Using @Qualifier to explicitly specify which bean by name
- How @Qualifier works like XML's ref attribute
- Using @Primary to mark the default bean
- How @Primary works like XML's primary="true"
- Choosing between @Qualifier and @Primary
- When each approach is appropriate
- Preview: More usage of @Qualifier in Spring Boot

No more ambiguity! 🎯

---

## Concept 1: Creating the Ambiguity

### 🧠 Adding the Laptop bean

**Current configuration (works fine):**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean
    public Alien alien(Computer com) {  // Only one Computer available
        Alien obj = new Alien();
        obj.setAge(25);
        obj.setCom(com);
        return obj;
    }
}
```

**Add Laptop bean:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean
    public Laptop laptop() {  // Another Computer!
        return new Laptop();
    }
    
    @Bean
    public Alien alien(Computer com) {  // Now ambiguous!
        Alien obj = new Alien();
        obj.setAge(25);
        obj.setCom(com);
        return obj;
    }
}
```

**The instructor explains:**

> "I will say public Laptop because that's what it returns. And we'll say the method name is laptop itself. Now this will return the new Laptop. That's it."

### 🧪 Test with two Computer beans

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Alien alien = context.getBean(Alien.class);
    alien.code();
}
```

**Run it...**

**Error:**
```
Exception in thread "main" 
org.springframework.beans.factory.UnsatisfiedDependencyException:
Error creating bean with name 'alien': Unsatisfied dependency expressed 
through method 'alien' parameter 0;

Caused by: org.springframework.beans.factory.NoUniqueBeanDefinitionException:
No qualifying bean of type 'Computer' available: 
expected single matching bean but found 2: desktop,laptop
```

**The key error message:**

> **"No qualifying bean of type 'Computer' available: expected single matching bean but found 2: desktop, laptop"**

### 🧠 What went wrong?

**The instructor explains:**

> "The error says 'no qualifying bean of type Computer.' In fact there is two beans, and that's the problem. Expected single matching bean but found two: desktop and laptop."

**Spring's confusion:**

```java
@Bean
public Alien alien(Computer com) {  // Needs Computer
    // ...
}
```

**Spring's search:**
1. Look for beans of type Computer
2. Found: desktop (is Computer) ✅
3. Found: laptop (is Computer) ✅
4. **Two matches! Cannot decide!** ❌
5. Throw NoUniqueBeanDefinitionException

**Ambiguity problem!**

---

## Concept 2: Solution 1 - The @Qualifier Annotation

### 🧠 Explicitly specifying the bean

**The instructor asks:**

> "So how do we solve this problem? When it comes to XML configuration we have two ways. One, you can explicitly mention which comp you want."

**XML approach:**
```xml
<bean id="alien" class="Alien">
    <property name="com" ref="desktop" />  <!-- Explicit! -->
</bean>
```

**Java equivalent: @Qualifier!**

### ⚙️ Using @Qualifier annotation

**Import the annotation:**
```java
import org.springframework.beans.factory.annotation.Qualifier;
```

**Apply to the parameter:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean
    public Laptop laptop() {
        return new Laptop();
    }
    
    @Bean
    public Alien alien(@Qualifier("desktop") Computer com) {
        //                ^^^^^^^^^^^^^^^^^^^^^^^ Specifies "desktop" bean
        Alien obj = new Alien();
        obj.setAge(25);
        obj.setCom(com);
        return obj;
    }
}
```

**The instructor explains:**

> "The way you can do that is by using an annotation called @Qualifier. In this qualifier you can mention the name of the object you want to refer to. So when you say 'desktop' it will always refer to desktop."

### 🧪 Test with @Qualifier

**Run the app...**

**Output:**
```
Desktop object created
Laptop object created
Alien object created
Coding...
Compiling using Desktop
```

**It works!** ✅

**Desktop was injected (as specified)!**

### 💡 How @Qualifier works

**Spring's resolution with @Qualifier:**

```java
@Bean
public Alien alien(@Qualifier("desktop") Computer com) {
    // ...
}
```

**Spring's process:**
1. See that alien() needs a Computer
2. Notice @Qualifier("desktop") annotation
3. **Ignore type-based search**
4. **Look for bean named "desktop"**
5. Find desktop bean ✅
6. Inject desktop as Computer
7. Create Alien successfully

**@Qualifier = explicit bean name specification!**

### 🧠 The XML parallel

**The instructor emphasizes:**

> "This is same as what you do in ref. You mention the name of the ID. In the same way, here you mention the name of a bean which is the desktop."

**Side by side:**

**XML:**
```xml
<property name="com" ref="desktop" />
<!--                   ^^^ Bean name -->
```

**Java:**
```java
@Qualifier("desktop") Computer com
//         ^^^^^^^^^ Bean name
```

**Same concept!**

---

## Concept 3: @Qualifier Validation

### 🧠 What if we use wrong name?

**The instructor tests:**

> "If you make a mistake here, if you say 'desktop1', this will not work."

**Wrong bean name:**
```java
@Bean
public Alien alien(@Qualifier("desktop1") Computer com) {
    //                          ^^^^^^^^^^ No bean named "desktop1"!
    Alien obj = new Alien();
    obj.setCom(com);
    return obj;
}
```

**Error:**
```
NoSuchBeanDefinitionException: No bean named 'desktop1' available
```

**Spring can't find a bean named "desktop1"!**

### 💡 @Qualifier requires exact match

**Bean name must match exactly:**

**Available beans:**
- "desktop" (method name: desktop)
- "laptop" (method name: laptop)

**Valid @Qualifier values:**
```java
@Qualifier("desktop")  // ✅ Works
@Qualifier("laptop")   // ✅ Works
```

**Invalid @Qualifier values:**
```java
@Qualifier("Desktop")   // ❌ Case-sensitive!
@Qualifier("desktop1")  // ❌ Doesn't exist
@Qualifier("desk")      // ❌ Partial match doesn't work
```

**Must match bean name exactly!**

### 🧠 Bean names recap

**The bean name is the method name (by default):**

```java
@Bean
public Desktop desktop() {  // Bean name: "desktop"
    return new Desktop();
}

@Bean
public Laptop laptop() {  // Bean name: "laptop"
    return new Laptop();
}
```

**Or custom name:**
```java
@Bean(name = "myDesktop")
public Desktop desktop() {  // Bean name: "myDesktop"
    return new Desktop();
}
```

**Use the actual bean name in @Qualifier!**

---

## Concept 4: Solution 2 - The @Primary Annotation

### 🧠 What if we don't want to use @Qualifier?

**The instructor introduces the alternative:**

> "If you don't want to use qualifier, what's the solution? In this case, remember we have worked with the primary. So there is something called primary which you can mention."

**XML approach:**
```xml
<bean id="laptop" class="Laptop" primary="true" />
<bean id="desktop" class="Desktop" />
```

**Java equivalent: @Primary!**

### ⚙️ Using @Primary annotation

**Import the annotation:**
```java
import org.springframework.context.annotation.Primary;
```

**Mark one bean as primary:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean
    @Primary  // This is the default choice!
    public Laptop laptop() {
        return new Laptop();
    }
    
    @Bean
    public Alien alien(Computer com) {  // No @Qualifier needed!
        Alien obj = new Alien();
        obj.setAge(25);
        obj.setCom(com);
        return obj;
    }
}
```

**The instructor explains:**

> "Here also we can use an annotation which is @Primary. The moment you do this, now Laptop will get the first preference. In case of confusion, if you run this, it will go for Laptop."

### 🧪 Test with @Primary

**Remove @Qualifier from alien():**
```java
@Bean
public Alien alien(Computer com) {  // No @Qualifier
    Alien obj = new Alien();
    obj.setAge(25);
    obj.setCom(com);
    return obj;
}
```

**Run the app...**

**Output:**
```
Desktop object created
Laptop object created
Alien object created
Coding...
Compiling using Laptop
```

**It works!** ✅

**Laptop was injected (marked as @Primary)!**

### 💡 How @Primary works

**Spring's resolution with @Primary:**

```java
@Bean
@Primary
public Laptop laptop() { ... }

@Bean
public Desktop desktop() { ... }

@Bean
public Alien alien(Computer com) { ... }
```

**Spring's process:**
1. alien() needs a Computer
2. Search for beans of type Computer
3. Found: desktop ✅
4. Found: laptop ✅ (marked @Primary)
5. **Choose the @Primary bean**
6. Inject laptop as Computer
7. Create Alien successfully

**@Primary = default choice in ambiguity!**

---

## Concept 5: @Qualifier vs @Primary

### 📊 Complete comparison

**Configuration options:**

**Option 1: No annotation (ambiguity error)**
```java
@Bean
public Laptop laptop() { return new Laptop(); }

@Bean
public Desktop desktop() { return new Desktop(); }

@Bean
public Alien alien(Computer com) { ... }  // ❌ Error!
```

**Option 2: @Qualifier (explicit)**
```java
@Bean
public Laptop laptop() { return new Laptop(); }

@Bean
public Desktop desktop() { return new Desktop(); }

@Bean
public Alien alien(@Qualifier("desktop") Computer com) { ... }  // ✅ Desktop
```

**Option 3: @Primary (default)**
```java
@Bean
@Primary
public Laptop laptop() { return new Laptop(); }

@Bean
public Desktop desktop() { return new Desktop(); }

@Bean
public Alien alien(Computer com) { ... }  // ✅ Laptop
```

### 📊 When to use each

| Scenario | Use @Qualifier | Use @Primary |
|----------|----------------|--------------|
| **Explicit choice needed** | ✅ Always gets specific bean | ❌ Can be overridden |
| **Default with flexibility** | ❌ Must specify everywhere | ✅ One default for all |
| **Multiple injection points** | ❌ Repeat @Qualifier each time | ✅ Apply once |
| **Testing environments** | ✅ Easy to switch | ❌ Need separate config |
| **Clear intent** | ✅ Very explicit | ⚠️ Less obvious |

### 🧠 The instructor's guidance

**The instructor says:**

> "So either you can use @Qualifier or you can use @Primary."

**Both are valid solutions!**

**Choose based on your needs:**
- Need explicit control? → @Qualifier
- Want a sensible default? → @Primary

---

## Concept 6: Combining @Primary and @Qualifier

### 🧠 What if both are used?

**Configuration:**
```java
@Bean
@Primary  // Default choice
public Laptop laptop() {
    return new Laptop();
}

@Bean
public Desktop desktop() {
    return new Desktop();
}
```

**Injection scenarios:**

**Scenario 1: No @Qualifier (uses @Primary)**
```java
@Bean
public Alien alien(Computer com) {
    // Gets Laptop (primary)
}
```

**Scenario 2: With @Qualifier (overrides @Primary)**
```java
@Bean
public Human human(@Qualifier("desktop") Computer com) {
    // Gets Desktop (explicit qualifier wins!)
}
```

**Priority hierarchy:**
1. **@Qualifier (highest priority)** - explicit wins
2. **@Primary** - default fallback
3. **Error** - if neither

### 🧪 Complete example

**AppConfig.java:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    @Primary  // Default Computer
    public Laptop laptop() {
        return new Laptop();
    }
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean
    public Alien alien(Computer com) {
        // Uses Laptop (primary)
        Alien obj = new Alien();
        obj.setAge(25);
        obj.setCom(com);
        return obj;
    }
    
    @Bean
    public Human human(@Qualifier("desktop") Computer com) {
        // Uses Desktop (qualifier overrides primary)
        Human obj = new Human();
        obj.setCom(com);
        return obj;
    }
}
```

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new AnnotationConfigApplicationContext(AppConfig.class);
    
    Alien alien = context.getBean(Alien.class);
    alien.code();  // Uses Laptop
    
    Human human = context.getBean(Human.class);
    human.work();  // Uses Desktop
}
```

**Output:**
```
Laptop object created
Desktop object created
Alien object created
Human object created
Coding...
Compiling using Laptop
Working...
Compiling using Desktop
```

**Both strategies working together!**

---

## Concept 7: XML to Java Translation

### 🧠 Complete mapping

**XML configuration:**
```xml
<beans>
    <bean id="laptop" class="Laptop" primary="true" />
    <bean id="desktop" class="Desktop" />
    
    <!-- Alien uses primary -->
    <bean id="alien" class="Alien" autowire="byType">
        <property name="age" value="25" />
    </bean>
    
    <!-- Human uses explicit ref -->
    <bean id="human" class="Human">
        <property name="com" ref="desktop" />
    </bean>
</beans>
```

**Java configuration:**
```java
@Configuration
public class AppConfig {
    
    @Bean
    @Primary  // primary="true"
    public Laptop laptop() {
        return new Laptop();
    }
    
    @Bean
    public Desktop desktop() {
        return new Desktop();
    }
    
    @Bean  // autowire="byType"
    public Alien alien(Computer com) {  // Uses primary
        Alien obj = new Alien();
        obj.setAge(25);
        obj.setCom(com);
        return obj;
    }
    
    @Bean
    public Human human(@Qualifier("desktop") Computer com) {  // ref="desktop"
        Human obj = new Human();
        obj.setCom(com);
        return obj;
    }
}
```

**Perfect translation:**
- XML `primary="true"` → Java `@Primary`
- XML `ref="desktop"` → Java `@Qualifier("desktop")`
- XML `autowire="byType"` → Java method parameters

---

## Concept 8: Preview - More @Qualifier in Spring Boot

### 🧠 The instructor's note

**The instructor mentions:**

> "In fact, we'll see @Qualifier more once we move to the Spring Boot. But at this point, this is how @Qualifier works."

**Coming in Spring Boot lessons:**

**@Qualifier with @Autowired fields:**
```java
@Component
public class Alien {
    
    @Autowired
    @Qualifier("desktop")  // Used with field injection
    private Computer com;
}
```

**@Qualifier with constructor injection:**
```java
@Component
public class Alien {
    private Computer com;
    
    @Autowired
    public Alien(@Qualifier("laptop") Computer com) {
        this.com = com;
    }
}
```

**More use cases in annotation-based configuration!**

---

## ✅ Key Takeaways

### About Ambiguity Problem

1. **Multiple beans of same type cause ambiguity**
   ```java
   @Bean
   public Desktop desktop() { return new Desktop(); }
   
   @Bean
   public Laptop laptop() { return new Laptop(); }
   
   // Which Computer to inject? Error!
   ```

2. **NoUniqueBeanDefinitionException thrown**
   - Spring can't decide
   - Needs help from developer
   - Must resolve explicitly

3. **Two solutions available**
   - @Qualifier (explicit choice)
   - @Primary (default choice)

### About @Qualifier Annotation

1. **Explicitly specify bean by name**
   ```java
   @Bean
   public Alien alien(@Qualifier("desktop") Computer com) {
       // Always gets "desktop" bean
   }
   ```

2. **Like XML ref attribute**
   ```xml
   <property name="com" ref="desktop" />
   ```

3. **Must match bean name exactly**
   - Case-sensitive
   - No partial matches
   - Error if name not found

### About @Primary Annotation

1. **Mark one bean as default**
   ```java
   @Bean
   @Primary  // Default choice
   public Laptop laptop() {
       return new Laptop();
   }
   ```

2. **Like XML primary="true"**
   ```xml
   <bean id="laptop" primary="true" />
   ```

3. **Used when no @Qualifier present**
   - Automatic fallback
   - Applies to all injection points
   - Can be overridden with @Qualifier

### About Priority

1. **Resolution order**
   - @Qualifier wins (explicit)
   - @Primary used if no qualifier
   - Error if neither

2. **@Qualifier overrides @Primary**
   ```java
   @Bean
   @Primary
   public Laptop laptop() { ... }
   
   @Bean
   public Alien alien(@Qualifier("desktop") Computer com) {
       // Gets desktop, not laptop (qualifier wins)
   }
   ```

3. **Choose based on needs**
   - Explicit control → @Qualifier
   - Sensible default → @Primary

---

## 💡 Final Insights

### Design Patterns

**Strategy pattern with dependency injection:**

```java
@Configuration
public class AppConfig {
    
    // Production strategy
    @Bean
    @Primary
    @Profile("prod")
    public Computer productionComputer() {
        return new Laptop();
    }
    
    // Test strategy
    @Bean
    @Primary
    @Profile("test")
    public Computer testComputer() {
        return new Desktop();
    }
    
    @Bean
    public Alien alien(Computer com) {
        // Gets different Computer based on active profile
        Alien obj = new Alien();
        obj.setCom(com);
        return obj;
    }
}
```

**Environment-specific beans with @Primary!**

### Real-World Use Cases

**Database configuration:**

```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    @Primary  // Default: production database
    public DataSource productionDataSource() {
        DataSource ds = new DataSource();
        ds.setUrl("jdbc:mysql://prod-server/db");
        return ds;
    }
    
    @Bean
    public DataSource backupDataSource() {
        DataSource ds = new DataSource();
        ds.setUrl("jdbc:mysql://backup-server/db");
        return ds;
    }
    
    @Bean
    public UserRepository userRepository(DataSource dataSource) {
        // Uses production (primary) by default
        return new UserRepository(dataSource);
    }
    
    @Bean
    public BackupService backupService(@Qualifier("backupDataSource") DataSource ds) {
        // Explicitly uses backup database
        return new BackupService(ds);
    }
}
```

**@Primary for common case, @Qualifier for special cases!**

### The Evolution of Spring Configuration

**Phase 1: XML (verbose but clear)**
```xml
<bean id="alien" class="Alien">
    <property name="com" ref="desktop" />
</bean>
```

**Phase 2: Java Config (type-safe, programmatic)**
```java
@Bean
public Alien alien(@Qualifier("desktop") Computer com) {
    Alien obj = new Alien();
    obj.setCom(com);
    return obj;
}
```

**Phase 3: Annotations (minimal, convention-based)**
```java
@Component
public class Alien {
    @Autowired
    @Qualifier("desktop")
    private Computer com;
}
```

**All three work, choose what fits your project!**

### Type Safety Advantage

**Java configuration catches errors early:**

```java
@Bean
public Alien alien(@Qualifier("desktopp") Computer com) {
    //                          ^^^^^^^^^ Typo!
    // ...
}
```

**Compile time:** ✅ Compiles fine
**Runtime:** ❌ NoSuchBeanDefinitionException

**But still better than XML:**
```xml
<property name="com" ref="desktopp" />
<!-- Typo only caught at runtime, no IDE help -->
```

**Java config has better IDE support:**
- Autocomplete for bean names
- Refactoring support
- Type checking

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Typo in @Qualifier value

**Wrong:**
```java
@Bean
public Alien alien(@Qualifier("Desktop") Computer com) {
    //                          ^^^^^^^^ Capital D - wrong!
    // Bean name is "desktop" not "Desktop"
}
```

**Error:** NoSuchBeanDefinitionException

**Correct:**
```java
@Bean
public Alien alien(@Qualifier("desktop") Computer com) {
    //                          ^^^^^^^^ Lowercase - correct!
}
```

### Mistake 2: Multiple @Primary annotations

**Wrong:**
```java
@Bean
@Primary  // Can't have multiple primaries!
public Desktop desktop() { return new Desktop(); }

@Bean
@Primary  // Which is really primary?
public Laptop laptop() { return new Laptop(); }
```

**Error:** Multiple @Primary beans found

**Correct:** Only ONE @Primary per type!

### Mistake 3: Forgetting to resolve ambiguity

**Wrong:**
```java
@Bean
public Desktop desktop() { return new Desktop(); }

@Bean
public Laptop laptop() { return new Laptop(); }

@Bean
public Alien alien(Computer com) {  // ❌ Ambiguous!
    // Neither @Qualifier nor @Primary used
}
```

**Must use @Qualifier OR mark one @Primary!**

### Mistake 4: Using @Primary on wrong bean

**Confusing:**
```java
@Bean
@Primary
public Desktop desktop() { return new Desktop(); }

@Bean
public Alien alien(@Qualifier("laptop") Computer com) {
    // @Qualifier overrides @Primary anyway
    // @Primary on desktop is useless here
}
```

**Put @Primary where it's actually used as default!**

---

## 🎯 Practice Exercises

### Exercise 1: Resolve ambiguity

Create:
- Two PaymentService implementations (CreditCard, PayPal)
- OrderService depends on PaymentService

Resolve using:
a) @Qualifier
b) @Primary

### Exercise 2: Multiple injection points

Create:
- Three Database beans (Primary, Backup, Cache)
- UserService uses Primary
- BackupService uses Backup
- ReportService uses Cache

Use @Primary and @Qualifier appropriately.

### Exercise 3: Switching strategies

Create configuration with two MessageSender implementations (Email, SMS). Make it easy to switch the default by changing @Primary.

### Exercise 4: Override primary

Create:
- @Primary Logger for console
- File Logger
- Most services use console (primary)
- One service explicitly uses file (@Qualifier)

---

## 🔗 Quick Summary

**Resolving ambiguity in Java configuration:**

**Problem:**
```java
@Bean
public Desktop desktop() { ... }

@Bean
public Laptop laptop() { ... }

@Bean
public Alien alien(Computer com) { ... }  // ❌ Ambiguous!
```

**Solution 1: @Qualifier (explicit name)**
```java
@Bean
public Alien alien(@Qualifier("desktop") Computer com) {
    // Always uses "desktop" bean
}
```

**Solution 2: @Primary (default choice)**
```java
@Bean
@Primary
public Laptop laptop() { ... }

@Bean
public Alien alien(Computer com) {
    // Uses laptop (primary)
}
```

**Priority:**
1. @Qualifier (explicit - wins)
2. @Primary (default)
3. Error (if neither)

**XML equivalents:**
- @Qualifier ↔ ref="beanName"
- @Primary ↔ primary="true"

**Next step:** Moving to annotation-based configuration! 🎊
