# 🎯 Primary Beans - Resolving Autowiring Ambiguity

## Introduction

In the previous lesson, we hit a critical problem with autowiring by type.

**The ambiguity error:**

```xml
<bean id="laptop" class="com.telusko.app.Laptop" />
<bean id="desktop" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byType" />
```

**Error:**
```
Expected single matching bean but found 2: laptop, desktop
```

**The problem:**
- Both Laptop and Desktop implement Computer
- Alien needs a Computer (autowire byType)
- Spring finds TWO beans of type Computer
- **Can't decide which one to use!**

**This is a common real-world scenario!**

Think about it:
- Multiple database connections (primary, backup)
- Multiple payment processors (credit card, PayPal)
- Multiple notification services (email, SMS)
- Multiple cache implementations (Redis, Memcached)

**How do we tell Spring which one to prefer?**

**Enter: The primary attribute!**

In this lesson, we'll learn:
- What the `primary` attribute does
- How to mark a bean as the default choice
- Real-world use case: primary vs backup database
- How primary interacts with explicit wiring
- The complete priority order in Spring
- When primary is used and when it's ignored

This is a short but crucial lesson for handling ambiguity in autowiring! 🎯

---

## Concept 1: The Problem - Recap

### 🧠 Current situation

**Our beans:**

```xml
<bean id="laptop" class="com.telusko.app.Laptop" />
<bean id="desktop" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byType">
    <property name="age" value="21" />
</bean>
```

**Both classes implement Computer interface:**
```java
public class Laptop implements Computer { ... }
public class Desktop implements Computer { ... }
```

**Alien needs Computer:**
```java
public class Alien {
    private Computer com;  // Which one? Laptop or Desktop?
}
```

### 🧪 The error

**When we run:**

```
Error creating bean with name 'alien':
expected single matching bean but found 2: laptop, desktop
```

**Spring's confusion:**
- "You need a Computer?"
- "I have two Computers: laptop and desktop"
- "Which one do you want??"
- "I can't guess - I'll throw an error!"

### ❓ Previous solutions

**We know these solutions:**

**1. Use byName instead:**
```xml
<bean id="com" class="Laptop" />  <!-- Match property name -->
<bean autowire="byName" />
```

**2. Explicit property:**
```xml
<bean autowire="byType">
    <property name="com" ref="laptop" />  <!-- Manually specify -->
</bean>
```

**But there's a better way for the common case!**

---

## Concept 2: Real-World Scenario - Primary vs Backup

### 🧠 Database connection example

**The instructor introduces a realistic scenario:**

> "Let's say if you have an application where you have a database connection. Sometimes for a backup we use a different connection. So we have two connections which are running. One is a primary one, one is a backup."

**Real-world setup:**

```java
// Primary database - production database
@Component
public class PrimaryDB implements DatabaseConnection {
    public void connect() {
        System.out.println("Connected to PRIMARY database");
    }
}

// Backup database - failover/replica
@Component
public class BackupDB implements DatabaseConnection {
    public void connect() {
        System.out.println("Connected to BACKUP database");
    }
}

// Service needs a database
@Component
public class UserService {
    @Autowired
    private DatabaseConnection db;  // Which one?
}
```

**The question:**
- Two database implementations
- Service autowires by type
- **Which database should it use by default?**

### 💡 The concept of "primary"

**Common pattern:**
- Most of the time, use primary connection
- When primary fails, fallback to backup
- Need to mark which one is "the default choice"

**Same applies to our example:**
- Two computers available (Laptop, Desktop)
- Most of the time, use one (let's say Laptop)
- Need to mark Laptop as "primary"

**This is what the `primary` attribute does!**

---

## Concept 3: Using the primary Attribute

### 🧠 The syntax

**Mark a bean as primary:**

```xml
<bean id="laptop" class="com.telusko.app.Laptop" primary="true" />
<bean id="desktop" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byType">
    <property name="age" value="21" />
</bean>
```

**The magic attribute:**
```xml
primary="true"
```

### ❓ What does primary="true" do?

**Spring's new logic:**

1. **Autowiring by type**
   - Alien needs Computer
   - Find all beans of type Computer

2. **Multiple matches found**
   - laptop (implements Computer) ✅
   - desktop (implements Computer) ✅
   - Normally: ERROR!

3. **But one is marked primary**
   - laptop has `primary="true"`
   - "In case of confusion, choose laptop first!"

4. **Spring autowires the primary bean**
   - No error!
   - Laptop is automatically chosen

### 🧪 Test with primary

**spring.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="laptop" class="com.telusko.app.Laptop" primary="true" />
    <bean id="desktop" class="com.telusko.app.Desktop" />
    
    <bean id="alien" class="com.telusko.app.Alien" autowire="byType">
        <property name="age" value="21" />
    </bean>

</beans>
```

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj = (Alien) context.getBean("alien");
    obj.code();
}
```

**Output:**
```
Laptop object created
Desktop object created
Alien object created
Coding...
Compiling using Laptop
```

**SUCCESS!** 🎉

**No error!**  
**Laptop was automatically chosen because it's marked primary!**

### 💡 How Spring decided

**The decision tree:**

1. **Need:** Computer type
2. **Found:** 2 candidates (laptop, desktop)
3. **Check:** Any marked primary?
4. **Yes:** laptop has `primary="true"`
5. **Choose:** laptop ✅

**Primary breaks the tie!**

---

## Concept 4: Primary is a Tiebreaker, Not a Rule

### 🧠 The instructor's key point

> "Primary works only when you have a confusion."

**What this means:**

**Primary is used ONLY when:**
- Multiple beans of same type exist ✅
- Autowiring by type is used ✅
- No explicit property specified ✅

**Primary is NOT used when:**
- Only one bean of the type exists (no confusion)
- Explicit property overrides it
- Autowiring by name (name determines choice)

### 💡 Understanding "confusion"

**No confusion = Primary ignored:**

```xml
<!-- Only ONE Computer bean -->
<bean id="laptop" class="Laptop" primary="true" />
<!-- No desktop bean -->

<bean id="alien" autowire="byType" />
<!-- Only one choice - primary doesn't matter -->
```

**Confusion = Primary used:**

```xml
<!-- TWO Computer beans -->
<bean id="laptop" class="Laptop" primary="true" />
<bean id="desktop" class="Desktop" />

<bean id="alien" autowire="byType" />
<!-- Two choices - primary breaks tie! -->
```

**Primary is the tiebreaker when Spring is confused!**

---

## Concept 5: Explicit Property Overrides Primary

### 🧠 What if you explicitly specify a bean?

**Configuration:**

```xml
<bean id="laptop" class="com.telusko.app.Laptop" primary="true" />
<bean id="desktop" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byType">
    <property name="age" value="21" />
    <property name="com" ref="desktop" />  <!-- Explicit choice! -->
</bean>
```

**The conflict:**
- Primary says: use laptop
- Explicit property says: use desktop

**Which wins?**

### 🧪 Test explicit vs primary

**Run it.**

**Output:**
```
Laptop object created
Desktop object created
Alien object created
Coding...
Compiling using Desktop
```

**Desktop is used!** ✅

**Not laptop (the primary)!**

### ❓ Why?

**The instructor explains:**

> "Even if you have byType which says primary is laptop, since you are mentioning explicitly, it will go for desktop."

**Explicit property overrides everything!**

### 💡 The priority order

**Spring's decision hierarchy (highest to lowest):**

1. **Explicit property** (highest priority)
   ```xml
   <property name="com" ref="desktop" />
   ```
   "User explicitly said desktop - use desktop!"

2. **Primary bean** (medium priority)
   ```xml
   <bean id="laptop" primary="true" />
   ```
   "No explicit choice, but laptop is marked primary - use laptop!"

3. **Error if still ambiguous** (lowest priority)
   ```
   Multiple beans, no primary, no explicit choice - ERROR!
   ```

**Think of primary as a "default choice" that explicit config can override.**

---

## Concept 6: Primary with Different Autowiring Modes

### 🧠 Does primary work with byName?

**Configuration:**

```xml
<bean id="com" class="com.telusko.app.Desktop" />
<bean id="laptop" class="com.telusko.app.Laptop" primary="true" />

<bean id="alien" class="com.telusko.app.Alien" autowire="byName" />
```

**Question:** Will primary matter?

### 🧪 Test primary with byName

**Run it.**

**Output:**
```
Desktop object created
Laptop object created
Alien object created
Coding...
Compiling using Desktop
```

**Desktop is used!** Not laptop (the primary)!

### ❓ Why?

**The instructor notes:**

> "Even if you say byName, it will search by the name."

**byName logic:**
- Property name: `com`
- Bean ID: `com` (Desktop)
- **Name matches - use Desktop!**
- Primary doesn't matter!

**Primary is only relevant for byType autowiring!**

### 🧠 Summary: When primary matters

**Primary is used:**
```xml
<bean autowire="byType" />
<!-- AND multiple beans of same type exist -->
<!-- AND no explicit property -->
```

**Primary is ignored:**
```xml
<bean autowire="byName" />  <!-- Name decides, not primary -->

<bean autowire="byType">
    <property name="com" ref="..." />  <!-- Explicit decides -->
</bean>
```

**Primary is specifically for resolving byType ambiguity!**

---

## Concept 7: Complete Example and Scenarios

### 🧠 Full configuration

**spring.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- Laptop marked as primary -->
    <bean id="laptop" class="com.telusko.app.Laptop" primary="true" />
    
    <!-- Desktop exists but not primary -->
    <bean id="desktop" class="com.telusko.app.Desktop" />
    
    <!-- Scenario 1: Autowire byType, no explicit property -->
    <!-- Result: Uses laptop (primary) -->
    <bean id="alien1" class="com.telusko.app.Alien" autowire="byType">
        <property name="age" value="21" />
    </bean>
    
    <!-- Scenario 2: Autowire byType, explicit property -->
    <!-- Result: Uses desktop (explicit overrides primary) -->
    <bean id="alien2" class="com.telusko.app.Alien" autowire="byType">
        <property name="age" value="25" />
        <property name="com" ref="desktop" />
    </bean>
    
    <!-- Scenario 3: Autowire byName -->
    <!-- Result: Uses laptop (by name match, primary irrelevant) -->
    <bean id="alien3" class="com.telusko.app.Alien" autowire="byName">
        <property name="age" value="30" />
    </bean>

</beans>
```

### 🧪 Test all scenarios

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    System.out.println("=== Alien 1 (byType, no explicit) ===");
    Alien alien1 = (Alien) context.getBean("alien1");
    alien1.code();
    
    System.out.println("\n=== Alien 2 (byType, explicit desktop) ===");
    Alien alien2 = (Alien) context.getBean("alien2");
    alien2.code();
    
    System.out.println("\n=== Alien 3 (byName) ===");
    Alien alien3 = (Alien) context.getBean("alien3");
    alien3.code();
}
```

**Output:**
```
Laptop object created
Desktop object created
Alien object created
Alien object created
Alien object created

=== Alien 1 (byType, no explicit) ===
Coding...
Compiling using Laptop

=== Alien 2 (byType, explicit desktop) ===
Coding...
Compiling using Desktop

=== Alien 3 (byName) ===
Coding...
Compiling using Laptop
```

**All scenarios work!** ✅

### 💡 The patterns

**Pattern 1: Default choice (primary)**
- Multiple implementations available
- No preference specified
- Primary provides sensible default

**Pattern 2: Override when needed (explicit)**
- Usually use primary
- Sometimes need alternate
- Explicit property overrides

**Pattern 3: Naming convention (byName)**
- Primary doesn't matter
- Name determines choice
- Clear and explicit

---

## ✅ Key Takeaways

### About Primary Attribute

1. **Purpose: Resolve autowiring ambiguity**
   - Multiple beans of same type
   - Mark one as "default choice"
   - Prevents autowiring errors

2. **Syntax: `primary="true"`**
   ```xml
   <bean id="laptop" class="Laptop" primary="true" />
   ```

3. **Only relevant for byType autowiring**
   - byName uses name matching (ignores primary)
   - Explicit property overrides primary
   - Only used when Spring has multiple type matches

### About Priority Order

**Spring's decision hierarchy:**

```
1. Explicit property (ref="...")        [HIGHEST]
   ↓
2. Primary bean (primary="true")        [MEDIUM]
   ↓
3. Error if still ambiguous             [LOWEST]
```

**Think:** Explicit > Primary > Error

### About Use Cases

1. **Primary database connection**
   ```xml
   <bean id="mainDB" class="MainDB" primary="true" />
   <bean id="backupDB" class="BackupDB" />
   ```

2. **Primary payment processor**
   ```xml
   <bean id="creditCard" class="CreditCard" primary="true" />
   <bean id="paypal" class="PayPal" />
   ```

3. **Primary cache implementation**
   ```xml
   <bean id="redis" class="RedisCache" primary="true" />
   <bean id="memcached" class="MemcachedCache" />
   ```

**Use primary for the "default/most common" choice!**

---

## 💡 Final Insights

### The Power of Primary

**Before primary attribute:**
```xml
<!-- Had to choose one of these strategies -->

<!-- Strategy 1: Different bean IDs for byName -->
<bean id="com" class="Laptop" />

<!-- Strategy 2: Explicit property -->
<bean autowire="byType">
    <property name="com" ref="laptop" />
</bean>

<!-- Strategy 3: Comment out other beans -->
<!-- <bean id="desktop" class="Desktop" /> -->
```

**With primary attribute:**
```xml
<!-- Simple and clean! -->
<bean id="laptop" class="Laptop" primary="true" />
<bean id="desktop" class="Desktop" />

<bean id="alien" autowire="byType" />
<!-- Just works! -->
```

**Primary makes byType autowiring viable with multiple implementations!**

### Real-World Database Example

**Classic scenario:**

```xml
<!-- Production database - primary choice -->
<bean id="prodDB" 
      class="com.company.db.ProductionDatabase" 
      primary="true">
    <property name="url" value="jdbc:mysql://prod-server:3306/myapp" />
</bean>

<!-- Read replica - for reporting -->
<bean id="reportDB" 
      class="com.company.db.ReportingDatabase">
    <property name="url" value="jdbc:mysql://replica-server:3306/myapp" />
</bean>

<!-- Most services use production DB (autowired - primary) -->
<bean id="userService" 
      class="com.company.service.UserService" 
      autowire="byType" />

<!-- Reporting service explicitly uses replica -->
<bean id="reportService" 
      class="com.company.service.ReportService" 
      autowire="byType">
    <property name="database" ref="reportDB" />
</bean>
```

**Perfect use of primary + explicit override pattern!**

### Connection to @Primary Annotation

**XML (what we learned):**
```xml
<bean id="laptop" class="Laptop" primary="true" />
```

**Annotation (Spring Boot):**
```java
@Component
@Primary  // Same concept!
public class Laptop implements Computer {
    @Override
    public void compile() {
        System.out.println("Compiling using Laptop");
    }
}
```

**Same mechanism in modern Spring!**

### Why Not Always Use Primary?

**When primary is great:**
- ✅ Clear default choice exists
- ✅ Most uses need the same implementation
- ✅ Cleaner than explicit everywhere

**When primary might not help:**
- ❌ No clear default (all implementations equally valid)
- ❌ Context-dependent choice (different scenarios need different impls)
- ❌ Need explicit control (make wiring obvious)

**Primary is for "sensible defaults," not "only choice."**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Multiple primaries

**Wrong:**
```xml
<bean id="laptop" class="Laptop" primary="true" />
<bean id="desktop" class="Desktop" primary="true" />
<!-- Both are primary - still ambiguous! ❌ -->
```

**Spring error:**
```
More than one 'primary' bean found among candidates
```

**Only ONE bean can be primary!**

### Mistake 2: Expecting primary with byName

**Wrong expectation:**
```xml
<bean id="desktop" class="Desktop" />
<bean id="laptop" class="Laptop" primary="true" />

<bean id="alien" autowire="byName" />
<!-- Property name is "com", bean "desktop" has id "desktop"... -->
<!-- "But laptop is primary, so it should use laptop?" ❌ -->
```

**Correct: byName uses name matching, ignores primary!**

### Mistake 3: Forgetting explicit overrides primary

**Wrong assumption:**
```xml
<bean id="laptop" primary="true" />
<bean id="desktop" />

<bean autowire="byType">
    <property name="com" ref="desktop" />
</bean>
<!-- "Primary is laptop, so it should use laptop?" ❌ -->
```

**Correct: Explicit property ALWAYS wins!**

### Mistake 4: Using primary without autowiring

**Useless:**
```xml
<bean id="laptop" class="Laptop" primary="true" />

<bean id="alien" class="Alien">
    <property name="com" ref="laptop" />
</bean>
<!-- No autowiring - primary has no effect! -->
```

**Primary only matters with autowiring!**

---

## 🎯 Practice Exercises

### Exercise 1: Database failover

Create:
- Interface `Database`
- Classes `PrimaryDB` and `BackupDB`
- Class `DataService` autowired by type

Mark PrimaryDB as primary. Verify it's used.

### Exercise 2: Override primary

Same as Exercise 1, but explicitly configure one bean to use BackupDB instead.

### Exercise 3: Multiple services

Create three service beans:
- Service1: Uses primary (no explicit property)
- Service2: Uses backup (explicit property)
- Service3: Uses primary (no explicit property)

Verify each gets the right database.

### Exercise 4: Test ambiguity

Remove the primary attribute and run. Observe the error. Add primary back and verify it works.

---

## 🔗 Quick Summary

**The primary attribute solves autowiring ambiguity:**

```xml
<!-- Mark default choice -->
<bean id="laptop" class="Laptop" primary="true" />
<bean id="desktop" class="Desktop" />

<!-- Autowire by type - no error! -->
<bean id="alien" autowire="byType" />
```

**When primary is used:**
- ✅ Autowire byType
- ✅ Multiple beans of same type
- ✅ No explicit property

**Priority order:**
1. Explicit property (highest)
2. Primary bean
3. Error (lowest)

**Use case:** Mark the "default/most common" bean as primary when you have multiple implementations!

**Next topic:** Moving beyond XML to annotation-based configuration! 🎊
