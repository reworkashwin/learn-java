# 🎯 Specifying Class Type in getBean() - No More Typecasting

## Introduction

We've been retrieving beans from the Spring container for a while now. Every time we write code like this:

```java
Alien obj = (Alien) context.getBean("alien");
```

**Notice something annoying?**

**The typecast: `(Alien)`**

**Why do we need it?**
**Can we avoid it?**

**Think about it:**
- We know we want an Alien object
- Spring knows it has an Alien bean
- We tell Spring which bean we want (by ID)
- Spring returns... an Object? 🤔

**Then we have to typecast it back to Alien!**

**This feels redundant:**
1. Spring creates an Alien
2. Spring wraps it as Object
3. We unwrap it back to Alien

**There must be a better way!**

**And there is!** ✨

The `getBean()` method is **overloaded**. It has multiple versions, and one version accepts a **Class type parameter** that eliminates the need for typecasting entirely!

**In this lesson, you'll learn:**
- Why getBean() returns Object by default
- The overloaded getBean() method with Class parameter
- How to use `.class` to specify types
- Retrieving beans by type only (no name needed!)
- Ambiguity problems with interfaces and multiple implementations
- Solving ambiguity with primary beans
- When to use name vs type for bean retrieval
- Best practices for clean bean retrieval code

Say goodbye to typecasting! 🎯

---

## Concept 1: The Typecasting Problem

### 🧠 Current retrieval pattern

**How we've been getting beans:**

```java
ApplicationContext context = 
    new ClassPathXmlApplicationContext("spring.xml");

Alien obj = (Alien) context.getBean("alien");
//          ^^^^^^^^ This typecast!
```

**Every. Single. Time.**

### ❓ Why do we need typecasting?

**Let's look at the getBean() method signature:**

```java
public Object getBean(String name) throws BeansException;
//     ^^^^^^ Returns Object!
```

**The return type is `Object`!**

**What this means:**

```java
Object result = context.getBean("alien");
// ↑ Spring returns Object type

Alien obj = result;  // ❌ Compilation error!
// Cannot assign Object to Alien

Alien obj = (Alien) result;  // ✅ Works with typecast
```

### 🧠 Why does Spring return Object?

**Think about Spring's perspective:**

**The container holds many beans:**
```xml
<bean id="alien" class="Alien" />
<bean id="laptop" class="Laptop" />
<bean id="desktop" class="Desktop" />
<bean id="service" class="UserService" />
```

**The getBean(String name) method:**
- Takes only the bean ID
- Could return ANY type of bean
- Different calls return different types

**Java requires ONE return type:**

```java
// Can't do this in Java:
public Alien|Laptop|Desktop getBean(String name)  // ❌ Invalid syntax
```

**Solution: Return the common superclass of everything:**

```java
public Object getBean(String name)  // ✅ Everything is an Object!
```

**Every class in Java inherits from Object!**

### 🧠 The consequence

**We write code like this:**

```java
Alien alien = (Alien) context.getBean("alien");
Desktop desktop = (Desktop) context.getBean("desktop");
Laptop laptop = (Laptop) context.getBean("laptop");
UserService service = (UserService) context.getBean("userService");
//            ^^^^^^^^^^^^^^^^ Typecast every time!
```

**Repetitive, verbose, and error-prone!**

### ❓ What if we typecast incorrectly?

**Compilation passes:**
```java
Alien obj = (Alien) context.getBean("desktop");  // ✅ Compiles
```

**Runtime crashes:**
```
Exception in thread "main" java.lang.ClassCastException: 
Desktop cannot be cast to Alien
```

**Not type-safe!**

### 💡 The desire

**We want:**
- Type safety at compile time
- No typecasting required
- Cleaner, more readable code

**Can Spring help us?**

**Yes! The overloaded getBean() method!**

---

## Concept 2: The getBean() Method with Class Parameter

### 🧠 Method overloading in getBean()

**Spring provides multiple versions of getBean():**

```java
// Version 1: By name only (returns Object)
public Object getBean(String name);

// Version 2: By name AND type (returns specific type!)
public <T> T getBean(String name, Class<T> requiredType);

// Version 3: By type only (returns specific type!)
public <T> T getBean(Class<T> requiredType);
```

**We've been using Version 1!**

**Let's explore Version 2!**

### 🧠 Version 2: getBean(String name, Class<T> type)

**The signature:**

```java
public <T> T getBean(String name, Class<T> requiredType);
```

**What this means:**

**Parameter 1: `String name`**
- The bean ID (just like before)

**Parameter 2: `Class<T> requiredType`**
- The expected type of the bean
- Provided using `.class` syntax

**Return type: `<T> T`**
- Returns the actual type (not Object!)
- Generic return type matches the Class parameter

### 🧪 Using getBean() with Class parameter

**Old way (with typecast):**
```java
Alien obj = (Alien) context.getBean("alien");
//          ^^^^^^^^ Manual typecast
```

**New way (no typecast):**
```java
Alien obj = context.getBean("alien", Alien.class);
//                           ^                ^^^^^^^^^^^^ Class parameter
//                           └─ Bean name
```

**No typecast needed!** ✨

### ⚙️ How it works

**The method call:**
```java
context.getBean("alien", Alien.class)
```

**Spring's processing:**

1. **Look up bean by name:** "alien"
2. **Verify type matches:** Is it an Alien? ✅
3. **Return as Alien type:** No casting needed!

**Return type is inferred from the Class parameter!**

**Java generics magic:**
```java
public <T> T getBean(String name, Class<T> requiredType)

// When called with Alien.class:
// T becomes Alien
// Return type becomes Alien
// No typecast required!
```

### 🧪 Complete example

**App.java (old way):**
```java
public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new ClassPathXmlApplicationContext("spring.xml");
        
        // Manual typecasting
        Alien obj = (Alien) context.getBean("alien");
        obj.code();
        
        Desktop desktop = (Desktop) context.getBean("desktop");
        desktop.compile();
    }
}
```

**App.java (new way):**
```java
public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new ClassPathXmlApplicationContext("spring.xml");
        
        // No typecasting needed!
        Alien obj = context.getBean("alien", Alien.class);
        obj.code();
        
        Desktop desktop = context.getBean("desktop", Desktop.class);
        desktop.compile();
    }
}
```

**Cleaner! More type-safe! More readable!**

### 💡 Benefits

**Type safety at compile time:**
```java
// This won't even compile if types mismatch!
Alien obj = context.getBean("desktop", Desktop.class);
// ❌ Incompatible types: Desktop cannot be converted to Alien
```

**No ClassCastException at runtime** (if types are correct)

**Better IDE support:**
- Auto-completion works better
- Type inference is accurate
- Refactoring is safer

---

## Concept 3: Multiple Beans and Class Parameters

### 🧪 Test with multiple beans

**spring.xml:**
```xml
<bean id="laptop" class="com.telusko.app.Laptop" primary="true" />
<bean id="desktop" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien">
    <property name="age" value="21" />
    <property name="com" ref="laptop" />
</bean>
```

**App.java:**
```java
public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new ClassPathXmlApplicationContext("spring.xml");
        
        // Get alien with class type
        Alien obj = context.getBean("alien", Alien.class);
        System.out.println(obj.getAge());
        obj.code();
        
        // Get desktop with class type
        Desktop desktop = context.getBean("desktop", Desktop.class);
        desktop.compile();
    }
}
```

**Output:**
```
21
Coding...
Compiling using Laptop
Compiling using Desktop
```

**Works perfectly!**

### 💡 The pattern

**Always specify both name and type:**

```java
TypeName var = context.getBean("beanId", TypeName.class);
//                                ^^^^^^^^  ^^^^^^^^^^^^^^
//                                Bean ID   Class type
```

**Benefits:**
- Clear bean identification (by ID)
- Clear type specification (by Class)
- No typecasting needed
- Type-safe retrieval

---

## Concept 4: Retrieving Beans by Type Only (No Name!)

### 🧠 A new possibility

**The instructor introduces something interesting:**

> "Can we do that? Something like... you can specify getBean, I want the object of Desktop. We are not specifying the name now."

**What if we don't know the bean ID?**

**What if we just want "a Desktop bean"?**

### 🧠 Version 3: getBean(Class<T> type)

**The third overload:**

```java
public <T> T getBean(Class<T> requiredType);
```

**Only takes Class parameter - no name!**

**How it works:**
1. Spring searches ALL beans in container
2. Finds beans matching the specified type
3. Returns the matching bean

**Search by type, not by name!**

### 🧪 Get bean by type only

**spring.xml:**
```xml
<bean id="laptop" class="com.telusko.app.Laptop" primary="true" />
<bean id="desktop" class="com.telusko.app.Desktop" />
<bean id="alien" class="com.telusko.app.Alien">
    <property name="age" value="21" />
    <property name="com" ref="laptop" />
</bean>
```

**App.java:**
```java
public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new ClassPathXmlApplicationContext("spring.xml");
        
        // Get desktop by type only (no name!)
        Desktop desktop = context.getBean(Desktop.class);
        //                                 ^^^^^^^^^^^^^^ Only type specified!
        desktop.compile();
    }
}
```

**Output:**
```
Compiling using Desktop
```

**It works!**

### ❓ How does Spring find it?

**Spring's search process:**

1. **Scan all beans in container**
   - laptop (Laptop)
   - desktop (Desktop)
   - alien (Alien)

2. **Filter by type: Desktop**
   - laptop ❌ (is Laptop, not Desktop)
   - desktop ✅ (is Desktop!)
   - alien ❌ (is Alien, not Desktop)

3. **One match found: return it!**

**No bean ID needed!**

### 💡 When is this useful?

**Scenario 1: You don't care about the ID**
```java
// Just give me ANY Desktop bean
Desktop desktop = context.getBean(Desktop.class);
```

**Scenario 2: Only one bean of that type exists**
```java
// There's only one UserService bean
UserService service = context.getBean(UserService.class);
```

**Scenario 3: Type uniquely identifies the bean**
```java
// Only one configuration bean
AppConfig config = context.getBean(AppConfig.class);
```

---

## Concept 5: Retrieving Interface Types

### 🧠 The polymorphism question

**Our class hierarchy:**

```java
public interface Computer {
    void compile();
}

public class Laptop implements Computer {
    @Override
    public void compile() {
        System.out.println("Compiling using Laptop");
    }
}

public class Desktop implements Computer {
    @Override
    public void compile() {
        System.out.println("Compiling using Desktop");
    }
}
```

**Question:** Can we retrieve beans by interface type?

```java
Computer com = context.getBean(Computer.class);
//                              ^^^^^^^^^^^^^^^
//                              Interface type!
```

**Will this work?**

### 🧪 Test interface retrieval with primary

**spring.xml:**
```xml
<bean id="laptop" class="com.telusko.app.Laptop" primary="true" />
<bean id="desktop" class="com.telusko.app.Desktop" />
```

**App.java:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    // Request Computer interface (not specific implementation)
    Computer com = context.getBean(Computer.class);
    com.compile();
}
```

**Output:**
```
Compiling using Laptop
```

**It works!** ✨

**Spring returned the Laptop bean!**

### ❓ Why Laptop and not Desktop?

**Spring's logic:**

1. **Search for beans matching Computer interface**
   - laptop ✅ (implements Computer)
   - desktop ✅ (implements Computer)

2. **Two matches found!** 😱

3. **Ambiguity resolution - check for primary**
   - laptop has `primary="true"` ✅
   - Return laptop!

**Primary bean wins when retrieving by interface type!**

### 🧪 What if no primary?

**spring.xml (remove primary):**
```xml
<bean id="laptop" class="com.telusko.app.Laptop" />
<bean id="desktop" class="com.telusko.app.Desktop" />
```

**App.java:**
```java
Computer com = context.getBean(Computer.class);
```

**Output:**
```
Exception in thread "main" 
org.springframework.beans.factory.NoUniqueBeanDefinitionException:
No qualifying bean of type 'Computer' available: 
expected single matching bean but found 2: laptop,desktop
```

**Error!** ❌

**The instructor explains:**

> "No qualifying bean of type computer available... because actually it is available, but there are two. We are searching for one."

### 💡 The problem

**Ambiguity with interface types:**

**When requesting Computer.class:**
- Laptop implements Computer ✅
- Desktop implements Computer ✅
- Which one should Spring return? 🤔

**Spring can't decide - throws exception!**

**Solution: Add primary="true" to one bean!**

---

## Concept 6: When to Use Name vs Type

### 🧠 Three retrieval strategies

**Strategy 1: By name only (with typecast)**
```java
Alien obj = (Alien) context.getBean("alien");
```

**Strategy 2: By name and type (no typecast)**
```java
Alien obj = context.getBean("alien", Alien.class);
```

**Strategy 3: By type only (no name)**
```java
Alien obj = context.getBean(Alien.class);
```

### 📊 Comparison

| Strategy | Pros | Cons |
|----------|------|------|
| Name only | Simple | Requires typecast, not type-safe |
| Name + Type | Type-safe, no typecast, explicit | Slightly verbose |
| Type only | Concise, no name needed | Fails with multiple beans |

### 🧠 The instructor's advice

**The instructor says:**

> "If you don't want to get into the scenario where you have two beans of the same type, it's good to go for the names, you know, because when you specify name, there's no confusion. You can specifically mention I want com1 or com2."

**Best practice: Use name + type!**

```java
Laptop laptop = context.getBean("laptop", Laptop.class);
Desktop desktop = context.getBean("desktop", Desktop.class);
```

**Why:**
- ✅ Explicit (clear which bean you want)
- ✅ Type-safe (compiler checks)
- ✅ No ambiguity (even with multiple beans of same type)
- ✅ No typecasting needed

### 🧠 When to use type-only retrieval

**Use `getBean(Class)` when:**

**1. Only one bean of that type exists**
```xml
<bean id="userService" class="UserService" />
<!-- Only UserService bean -->
```
```java
UserService service = context.getBean(UserService.class);
// Safe - only one match possible
```

**2. Using primary beans strategically**
```xml
<bean id="prodDatabase" class="Database" primary="true" />
<bean id="testDatabase" class="Database" />
```
```java
Database db = context.getBean(Database.class);
// Always gets prodDatabase (primary)
```

**3. Working with unique types**
```java
AppConfig config = context.getBean(AppConfig.class);
SecurityManager security = context.getBean(SecurityManager.class);
// These are typically unique in the application
```

### 💡 Decision tree

```
Do you have multiple beans of the same type?
│
├─ YES → Use name + type: getBean("beanId", Type.class)
│         Explicitly specifies which bean you want
│
└─ NO → Use type only: getBean(Type.class)
         Simpler, no name needed
```

---

## Concept 7: Working with Concrete Types vs Interface Types

### 🧠 Concrete type retrieval

**When requesting concrete class:**

```java
Desktop desktop = context.getBean(Desktop.class);
```

**Spring's search:**
- Finds beans of type Desktop
- Exact type match required
- Usually unambiguous

**Safer approach!**

### 🧠 Interface type retrieval

**When requesting interface:**

```java
Computer com = context.getBean(Computer.class);
```

**Spring's search:**
- Finds beans implementing Computer
- Could be Laptop, Desktop, or both
- Often ambiguous!

**Riskier approach - needs primary or name!**

### 🧪 Complete example

**spring.xml:**
```xml
<bean id="laptop" class="com.telusko.app.Laptop" primary="true" />
<bean id="desktop" class="com.telusko.app.Desktop" />

<bean id="alien" class="com.telusko.app.Alien">
    <property name="age" value="21" />
    <property name="com" ref="laptop" />
</bean>
```

**App.java:**
```java
public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new ClassPathXmlApplicationContext("spring.xml");
        
        // Concrete type - no ambiguity
        Laptop laptop = context.getBean(Laptop.class);
        laptop.compile();
        
        Desktop desktop = context.getBean(Desktop.class);
        desktop.compile();
        
        // Interface type - uses primary
        Computer com = context.getBean(Computer.class);
        com.compile();  // Uses Laptop (primary)
        
        // Most explicit - name + type
        Computer com2 = context.getBean("desktop", Computer.class);
        com2.compile();  // Uses Desktop (explicit name)
    }
}
```

**Output:**
```
Compiling using Laptop
Compiling using Desktop
Compiling using Laptop
Compiling using Desktop
```

**All retrieval strategies working!**

### 💡 Best practice pattern

**For interface types, prefer name + type:**

```java
// ❌ Risky - depends on primary
Computer com = context.getBean(Computer.class);

// ✅ Better - explicit choice
Computer com = context.getBean("laptop", Computer.class);
```

**For concrete types, type-only is fine if unique:**

```java
// ✅ Safe - only one UserService
UserService service = context.getBean(UserService.class);
```

---

## Concept 8: The .class Syntax Explained

### 🧠 What is .class?

**The `.class` syntax in Java:**

```java
Alien.class
Computer.class
Desktop.class
```

**This is a Class literal!**

### 🧠 Class objects in Java

**Every type in Java has a Class object:**

```java
Class<Alien> alienClass = Alien.class;
Class<Computer> computerClass = Computer.class;
Class<Desktop> desktopClass = Desktop.class;
```

**The instructor mentions:**

> "Of course that's an interface. But then every interface gets compiled to .class file, right?"

**Yes!**
- Classes compile to .class files ✅
- Interfaces compile to .class files ✅
- Enums compile to .class files ✅
- Annotations compile to .class files ✅

**All have Class objects accessible via `.class`!**

### 🧠 How Spring uses Class objects

**When you call:**
```java
context.getBean("alien", Alien.class)
```

**Spring uses the Class object to:**
1. **Verify type compatibility**
   ```java
   if (!Alien.class.isInstance(bean)) {
       throw new BeanNotOfRequiredTypeException(...);
   }
   ```

2. **Cast safely**
   ```java
   return Alien.class.cast(bean);
   ```

3. **Provide type information**
   ```java
   // Generics use this for type safety
   public <T> T getBean(String name, Class<T> type)
   ```

### 💡 The magic of generics

**Look at the method signature again:**

```java
public <T> T getBean(String name, Class<T> requiredType)
```

**When you call:**
```java
Alien obj = context.getBean("alien", Alien.class);
```

**Java's type inference:**
1. `Alien.class` is of type `Class<Alien>`
2. Generic `T` becomes `Alien`
3. Return type becomes `Alien`
4. No casting needed!

**This is why no typecast is required!**

---

## ✅ Key Takeaways

### About getBean() Overloads

1. **Three versions of getBean()**
   ```java
   Object getBean(String name)                    // Returns Object, needs typecast
   <T> T getBean(String name, Class<T> type)      // Returns specific type, no typecast
   <T> T getBean(Class<T> type)                   // By type only, no name
   ```

2. **Name + Type is most powerful**
   - Explicit bean identification
   - Type-safe retrieval
   - No typecasting
   - Works with multiple beans of same type

3. **Type-only has limitations**
   - Fails with multiple beans of same type
   - Needs primary beans for interfaces
   - Best for unique types

### About Bean Retrieval Strategies

1. **By name only: Legacy, avoid**
   ```java
   Alien obj = (Alien) context.getBean("alien");  // ❌ Requires typecast
   ```

2. **By name and type: Recommended**
   ```java
   Alien obj = context.getBean("alien", Alien.class);  // ✅ Best practice
   ```

3. **By type only: Use carefully**
   ```java
   Alien obj = context.getBean(Alien.class);  // ✅ Only if unique
   ```

### About Interface Types

1. **Interface retrieval is ambiguous**
   - Multiple implementations possible
   - Requires primary or explicit name
   - Concrete types are safer

2. **Primary resolves ambiguity**
   ```xml
   <bean id="laptop" primary="true" />
   ```
   ```java
   Computer com = context.getBean(Computer.class);  // Gets laptop (primary)
   ```

3. **Name overrides primary**
   ```java
   Computer com = context.getBean("desktop", Computer.class);  // Gets desktop
   ```

### About Type Safety

1. **Name + Type provides compile-time safety**
   ```java
   Alien obj = context.getBean("desktop", Desktop.class);
   // ❌ Won't compile - type mismatch!
   ```

2. **Name only provides runtime errors**
   ```java
   Alien obj = (Alien) context.getBean("desktop");
   // ✅ Compiles, ❌ ClassCastException at runtime!
   ```

3. **Type-only provides runtime errors for ambiguity**
   ```java
   Computer com = context.getBean(Computer.class);
   // ❌ NoUniqueBeanDefinitionException if multiple beans!
   ```

---

## 💡 Final Insights

### The Evolution of Bean Retrieval

**The progression we've learned:**

**Phase 1: Basic retrieval (with typecast)**
```java
Alien obj = (Alien) context.getBean("alien");
```

**Phase 2: Type-safe retrieval (no typecast)**
```java
Alien obj = context.getBean("alien", Alien.class);
```

**Phase 3: Type-based retrieval (no name)**
```java
Alien obj = context.getBean(Alien.class);
```

**Each phase adds capability and type safety!**

### Real-World Pattern

**In production applications:**

```java
@Repository
public class UserRepository {
    private final DataSource dataSource;
    
    public UserRepository(ApplicationContext context) {
        // Specific bean by name and type
        this.dataSource = context.getBean("primaryDataSource", DataSource.class);
    }
}
```

**Why name + type:**
- Multiple DataSource beans (primary, backup, cache)
- Explicit about which one we want
- Type-safe assignment
- Clear intent

### Connection to Modern Spring

**XML (what we learned):**
```java
Alien obj = context.getBean("alien", Alien.class);
```

**Annotation/Spring Boot (modern):**
```java
@Autowired
@Qualifier("alien")
private Alien obj;
```

**Same concept:**
- Qualifier = name
- Field type = type
- Spring matches both!

### The .class Literal Deep Dive

**Every type has a Class object:**

```java
Class<Alien> c1 = Alien.class;
System.out.println(c1.getName());          // com.telusko.app.Alien
System.out.println(c1.getSimpleName());    // Alien
System.out.println(c1.isInterface());      // false

Class<Computer> c2 = Computer.class;
System.out.println(c2.isInterface());      // true
```

**This is reflection - used heavily by Spring!**

### Smart Bean Retrieval Decision Tree

```
Getting a bean?
│
├─ Multiple beans of same type?
│  │
│  ├─ YES → Use name + type
│  │        getBean("beanId", Type.class)
│  │
│  └─ NO → Continue...
│
├─ Retrieving an interface?
│  │
│  ├─ YES → Use name + type
│  │        (safer than relying on primary)
│  │
│  └─ NO → Continue...
│
└─ Unique concrete type?
   │
   └─ YES → OK to use type only
            getBean(Type.class)
```

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Forgetting typecast with name-only

**Wrong:**
```java
Alien obj = context.getBean("alien");  // ❌ Won't compile!
```

**Correct:**
```java
Alien obj = (Alien) context.getBean("alien");  // ✅ But verbose
// Or better:
Alien obj = context.getBean("alien", Alien.class);  // ✅ Clean!
```

### Mistake 2: Using type-only with multiple beans

**Wrong:**
```xml
<bean id="laptop" class="Laptop" />
<bean id="desktop" class="Desktop" />
```
```java
Computer com = context.getBean(Computer.class);  // ❌ Ambiguous!
```

**Correct:**
```java
Computer com = context.getBean("laptop", Computer.class);  // ✅ Explicit
```

### Mistake 3: Relying on primary for important choices

**Risky:**
```java
// Depends on XML configuration having primary set correctly
Computer com = context.getBean(Computer.class);
```

**Better:**
```java
// Explicit, no surprises
Computer com = context.getBean("laptop", Computer.class);
```

### Mistake 4: Wrong typecast

**Wrong:**
```java
Alien obj = (Alien) context.getBean("desktop");  
// ✅ Compiles, ❌ ClassCastException at runtime!
```

**Correct:**
```java
Desktop desktop = context.getBean("desktop", Desktop.class);
// ✅ Compiles, ✅ Works, ✅ Type-safe!
```

---

## 🎯 Practice Exercises

### Exercise 1: Rewrite with no typecasting

Given this code, rewrite using class parameters:

```java
Alien alien = (Alien) context.getBean("alien");
Laptop laptop = (Laptop) context.getBean("laptop");
Desktop desktop = (Desktop) context.getBean("desktop");
```

### Exercise 2: Retrieve by type only

Create a configuration with unique beans (one of each type). Retrieve them using only type, no names.

### Exercise 3: Resolve ambiguity

Given:
```xml
<bean id="mysql" class="MySQLDatabase" />
<bean id="postgres" class="PostgreSQLDatabase" />
```

Both implement `Database` interface. Retrieve each using:
a) Name + type
b) Type only with primary
c) What happens without primary?

### Exercise 4: Design bean retrieval strategy

You have:
- 1 UserService
- 2 PaymentServices (creditCard, paypal)
- 3 Databases (primary, backup, cache)

Design retrieval strategy for each. When to use name? When type-only is safe?

---

## 🔗 Quick Summary

**Three ways to get beans:**

```java
// 1. Name only (needs typecast)
Alien obj = (Alien) context.getBean("alien");

// 2. Name + Type (recommended!)
Alien obj = context.getBean("alien", Alien.class);

// 3. Type only (use carefully)
Alien obj = context.getBean(Alien.class);
```

**Best practice:**
- Use name + type for clarity and type safety
- Use type-only only for unique types
- Avoid name-only (typecasting is error-prone)

**Key rule:**
> "When you specify name, there's no confusion." - Instructor

**Next topic:** Moving beyond XML configuration to annotations! 🎊
