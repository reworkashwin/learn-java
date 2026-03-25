# 🏆 @Primary and @Qualifier - Precedence Rules

## Introduction

**Recap from Document 28:**

We learned about dependency injection with @Autowired and handling multiple beans:

```java
@Component
public class Desktop implements Computer { ... }

@Component
public class Laptop implements Computer { ... }

@Component
public class Alien {
    @Autowired
    @Qualifier("laptop")  // Explicit selection
    private Computer com;
}
```

**Two disambiguation strategies:**
1. **@Qualifier** - explicitly specify bean by name
2. **@Primary** - mark default bean

**But what if we use BOTH?** 🤔

**Today's critical question:**

> "What happens when you use @Primary and @Qualifier together?"

**The scenario:**
- Desktop marked with @Primary
- But injection point uses @Qualifier("laptop")
- Which wins?

**In this lesson, you'll learn:**
- Reviewing the ambiguity problem without disambiguation
- Using @Primary to mark default bean
- Testing @Primary alone (resolves ambiguity)
- Combining @Primary with @Qualifier
- The precedence rule: @Qualifier > @Primary
- Why @Qualifier always wins
- When to use @Primary vs @Qualifier
- Best practices for disambiguation
- Real-world scenarios requiring precedence

Get ready to master the priority system! 🏆

---

## Concept 1: The Ambiguity Problem (Recap)

### 🧠 The error without disambiguation

**The instructor starts:**

> "So now let's solve this problem. In the previous video we have solved the problem with the help of @Qualifier. And if you run this again, we have commented the @Qualifier, so it will give the same error."

**Current setup (no disambiguation):**

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

**Alien.java (no @Qualifier):**
```java
@Component
public class Alien {
    @Autowired  // Which Computer? Desktop or Laptop?
    private Computer com;
    
    public void code() {
        System.out.println("Coding...");
        com.compile();
    }
}
```

**Run the app...**

**Error:**
```
NoUniqueBeanDefinitionException: No qualifying bean of type 'Computer' available: 
expected single matching bean but found 2: desktop,laptop
```

**The instructor confirms:**

> "It says available, expected one but we found two."

**Spring's dilemma:**
- Found 2 Computer beans
- Expected exactly 1
- Can't decide which to inject
- **Error!** ❌

**Need a way to resolve ambiguity!**

---

## Concept 2: Using @Primary Annotation

### 🧠 Marking the default bean

**The instructor explains:**

> "To solve this we have done this before as well. We can use something called @Primary. But what exactly are we going to use @Primary? On top of your classes you can mention one of your class as @Primary."

**@Primary annotation:**
- Marks a bean as the default choice
- Used when multiple beans of same type exist
- Resolves ambiguity without explicit naming
- Applied to the class itself

### ⚙️ Adding @Primary to Desktop

**The instructor demonstrates:**

> "Let's say I want to make Desktop primary. So I can say @Primary. It's that simple."

**Desktop.java (with @Primary):**
```java
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary  // Default Computer bean!
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

**Laptop.java (no @Primary):**
```java
@Component  // Available but not default
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

**Alien.java (no @Qualifier needed!):**
```java
@Component
public class Alien {
    @Autowired  // Gets Desktop (marked @Primary)
    private Computer com;
    
    public void code() {
        System.out.println("Coding...");
        com.compile();
    }
}
```

### 🧪 Test with @Primary

**Run the app...**

**Output:**
```
Desktop object created
Laptop object created
Alien object created
Coding...
Compiling using Desktop
```

**Success!** ✅

**The instructor confirms:**

> "Just by mentioning @Primary, it will prefer Desktop whenever you have a confusion."

**What happened:**

1. **Spring finds @Autowired in Alien**
   ```java
   @Autowired
   private Computer com;
   ```

2. **Spring searches for Computer beans**
   - Found: Desktop ✅
   - Found: Laptop ✅
   - Two beans! Confusion!

3. **Spring checks for @Primary**
   - Desktop has @Primary ✅
   - Laptop doesn't have @Primary

4. **Spring uses @Primary bean**
   ```java
   alien.com = desktopBean;  // Desktop injected!
   ```

**@Primary resolved the ambiguity!**

---

## Concept 3: Combining @Primary and @Qualifier

### 🧠 The interesting test

**The instructor poses the question:**

> "But what happens when you use @Primary and @Qualifier together? So let's say I want to use @Qualifier..."

**The test setup:**
- Desktop has @Primary (default is Desktop)
- But injection point specifies @Qualifier("laptop")
- **Conflict!** Which wins?

### ⚙️ Adding @Qualifier for Laptop

**Desktop.java (still @Primary):**
```java
@Component
@Primary  // Says: "Desktop is default!"
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

**Laptop.java (no @Primary):**
```java
@Component  // Not primary, but can be explicitly requested
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

**Alien.java (with @Qualifier):**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    
    @Autowired
    @Qualifier("laptop")  // Says: "I want Laptop!"
    private Computer com;
    
    public void code() {
        System.out.println("Coding...");
        com.compile();
    }
}
```

**The conflict:**
- @Primary says: Desktop
- @Qualifier says: Laptop
- **Who wins?** 🏆

### 🧪 Run the test

**The instructor explains:**

> "And the default name for the Desktop is 'desktop' itself and Laptop is 'laptop'. So let me say @Qualifier as 'laptop'. So I'm saying Desktop is @Primary, but your Laptop is something I'm mentioning in the @Qualifier."

**Run the app...**

**Output:**
```
Desktop object created
Laptop object created
Alien object created
Coding...
Compiling using Laptop
```

**Laptop was injected, not Desktop!** 🎯

**The instructor reveals:**

> "If you run this, this is going to prefer the Laptop. So @Qualifier gets ahead of @Primary."

**@Qualifier wins!** 🏆

---

## Concept 4: The Precedence Rule

### 🧠 @Qualifier > @Primary

**The instructor states the rule:**

> "So it doesn't matter what @Primary you say. If you mention @Qualifier, it will follow that particular one. So that's about @Primary and @Qualifier - which will get preference is the @Qualifier."

**The precedence hierarchy:**

```
@Qualifier  >  @Primary  >  Error
  ⭐⭐⭐        ⭐⭐         ❌
 Highest     Default    Ambiguity
 Priority    Choice     Exception
```

**The rules:**

1. **@Qualifier present?** → Use the bean specified by @Qualifier
2. **No @Qualifier, but @Primary exists?** → Use the @Primary bean
3. **No @Qualifier, no @Primary?** → Error (NoUniqueBeanDefinitionException)

### 💡 Why this makes sense

**Think about it logically:**

**@Primary means:** "If nobody says otherwise, use me by default"
**@Qualifier means:** "I'm explicitly asking for this specific bean"

**Explicit request > Default preference!**

**Real-world analogy:**

🏪 **Store inventory:**
- @Primary: "We recommend this product by default"
- @Qualifier: "Customer explicitly asked for that specific product"

**Customer's explicit request always wins over recommendation!**

### ⚙️ All three scenarios

**Scenario 1: No disambiguation (ERROR)**
```java
@Component
public class Desktop { ... }  // No @Primary

@Component
public class Laptop { ... }   // No @Primary

@Component
public class Alien {
    @Autowired  // No @Qualifier
    private Computer com;  // ERROR: Found 2, expected 1
}
```

**Result:** ❌ NoUniqueBeanDefinitionException

---

**Scenario 2: @Primary only (WORKS)**
```java
@Component
@Primary  // Default choice
public class Desktop { ... }

@Component
public class Laptop { ... }

@Component
public class Alien {
    @Autowired  // No @Qualifier
    private Computer com;  // Gets Desktop (@Primary)
}
```

**Result:** ✅ Desktop injected

---

**Scenario 3: @Primary + @Qualifier (QUALIFIER WINS)**
```java
@Component
@Primary  // Default, but overridden
public class Desktop { ... }

@Component
public class Laptop { ... }

@Component
public class Alien {
    @Autowired
    @Qualifier("laptop")  // Explicit request
    private Computer com;  // Gets Laptop (@Qualifier)
}
```

**Result:** ✅ Laptop injected (ignores @Primary)

---

## Concept 5: When to Use Each

### 🧠 Use @Primary when...

**Scenario: Most classes want the same bean**

```java
@Component
@Primary
public class MySQLDatabase implements Database {
    // 90% of services use MySQL
}

@Component
public class PostgresDatabase implements Database {
    // 10% of services need Postgres specifically
}

// Most services just use @Autowired (gets MySQL)
@Component
public class UserService {
    @Autowired  // Gets MySQL (default)
    private Database db;
}

@Component
public class OrderService {
    @Autowired  // Gets MySQL (default)
    private Database db;
}

// Special services specify Postgres explicitly
@Component
public class AnalyticsService {
    @Autowired
    @Qualifier("postgresDatabase")  // Override default
    private Database db;
}
```

**Benefits:**
- Common case is simple (just @Autowired)
- No @Qualifier needed for majority
- Special cases can override with @Qualifier

### 🧠 Use @Qualifier when...

**Scenario: Different classes want different beans**

```java
@Component
public class CreditCardPayment implements Payment {
    // Credit card processing
}

@Component
public class PayPalPayment implements Payment {
    // PayPal processing
}

// Each service knows exactly which payment method it needs
@Component
public class CheckoutService {
    @Autowired
    @Qualifier("creditCardPayment")  // Explicit
    private Payment payment;
}

@Component
public class RefundService {
    @Autowired
    @Qualifier("payPalPayment")  // Explicit
    private Payment payment;
}
```

**Benefits:**
- Clear and explicit
- No confusion about which bean is used
- Self-documenting code

### 🧠 Use both when...

**Scenario: Default for most, override for some**

```java
@Component
@Primary  // Production database (default)
public class ProductionDataSource implements DataSource { ... }

@Component
public class TestDataSource implements DataSource { ... }

// Most services use production (default)
@Component
public class UserRepository {
    @Autowired  // Gets ProductionDataSource
    private DataSource ds;
}

// Test service overrides to use test database
@Component
@Profile("test")
public class TestDataRepository {
    @Autowired
    @Qualifier("testDataSource")  // Override for testing
    private DataSource ds;
}
```

**Benefits:**
- Safe default (production)
- Explicit override when needed (testing)
- Clear intent in code

---

## Concept 6: Summary of Resolution Strategies

### 🧠 Complete disambiguation toolbox

**Tool 1: @Primary**
```java
@Component
@Primary
public class Desktop { ... }
```

**When to use:**
- One bean is the "normal" choice
- Most classes should use it
- Override occasionally with @Qualifier

**Think:** "Default recommendation"

---

**Tool 2: @Qualifier**
```java
@Autowired
@Qualifier("laptop")
private Computer com;
```

**When to use:**
- Need explicit control
- Different classes need different beans
- Clear documentation desired

**Think:** "Explicit request"

---

**Tool 3: Both @Primary + @Qualifier**
```java
@Component
@Primary
public class Desktop { ... }

@Autowired
@Qualifier("laptop")  // Override!
private Computer com;
```

**When to use:**
- Default for most cases
- Specific override for special cases
- Precedence: @Qualifier wins

**Think:** "Default with overrides"

---

**Tool 4: Custom bean names**
```java
@Component("primaryDB")
public class Desktop { ... }

@Qualifier("primaryDB")
```

**When to use:**
- Semantic naming needed
- Multiple beans of same class
- Clarity in configuration

**Think:** "Named instances"

---

## ✅ Key Takeaways

### About @Primary Annotation

1. **Marks default bean for a type**
   ```java
   @Component
   @Primary
   public class Desktop { ... }
   ```

2. **Resolves ambiguity without explicit naming**
   - No @Qualifier needed at injection point
   - Spring automatically chooses @Primary bean

3. **One @Primary per type allowed**
   - Can't mark multiple beans as @Primary
   - Results in error if multiple @Primary exist

### About @Qualifier Annotation

1. **Explicitly specifies bean by name**
   ```java
   @Qualifier("laptop")
   ```

2. **Works with any injection type**
   - Field injection
   - Constructor injection
   - Setter injection

3. **Always wins over @Primary**
   - Explicit beats default
   - Can override @Primary choice

### About Precedence Rules

1. **Priority hierarchy: @Qualifier > @Primary > Error**
   - @Qualifier: Highest priority (explicit)
   - @Primary: Medium priority (default)
   - Neither: Error (ambiguous)

2. **@Qualifier overrides @Primary**
   ```java
   // Desktop is @Primary but...
   @Qualifier("laptop")  // Laptop wins!
   ```

3. **Explicit always beats implicit**
   - Developer's explicit choice respected
   - Default used only when no explicit choice

### About Best Practices

1. **Use @Primary for common default**
   - Production database
   - Primary implementation
   - Normal operating mode

2. **Use @Qualifier for special cases**
   - Test environments
   - Alternative implementations
   - Specific requirements

3. **Document the choice**
   - Why this bean is @Primary?
   - When to use @Qualifier?
   - Clear naming conventions

---

## 💡 Final Insights

### Real-World Use Cases

**Use Case 1: Multiple databases**

```java
@Component
@Primary
public class ProductionDB implements Database {
    // Primary production database
}

@Component
public class AnalyticsDB implements Database {
    // Read-only analytics database
}

@Component
public class CacheDB implements Database {
    // Fast cache database
}

// Most services use production (default)
@Component
public class UserService {
    @Autowired  // Gets ProductionDB
    private Database db;
}

// Analytics service needs specific DB
@Component
public class AnalyticsService {
    @Autowired
    @Qualifier("analyticsDB")
    private Database db;
}

// Cache service needs cache DB
@Component
public class CacheManager {
    @Autowired
    @Qualifier("cacheDB")
    private Database db;
}
```

**Pattern:**
- @Primary for main database
- @Qualifier for specialized databases
- Clear separation of concerns

---

**Use Case 2: Different environments**

```java
@Component
@Primary
@Profile("prod")
public class ProdEmailService implements EmailService {
    // Sends real emails
}

@Component
@Profile("dev")
public class MockEmailService implements EmailService {
    // Logs emails, doesn't send
}

@Component
public class UserRegistration {
    @Autowired  // Gets correct bean based on profile
    private EmailService emailService;
}
```

**Pattern:**
- @Primary with @Profile
- Automatic switching based on environment
- No code changes needed

---

**Use Case 3: Multiple implementations**

```java
@Component
@Primary
public class FastCompression implements Compression {
    // Fast but less compression
}

@Component
public class MaxCompression implements Compression {
    // Slow but maximum compression
}

// Normal files use fast (default)
@Component
public class FileUploader {
    @Autowired
    private Compression compression;
}

// Archives need max compression
@Component
public class ArchiveService {
    @Autowired
    @Qualifier("maxCompression")
    private Compression compression;
}
```

**Pattern:**
- @Primary for performance
- @Qualifier for quality
- Trade-offs explicit in code

---

### The Decision Tree

**When choosing disambiguation strategy:**

```
Multiple beans of same type?
│
├─ Most classes need same bean?
│  │
│  ├─ YES → Use @Primary on common bean
│  │         - Simple @Autowired everywhere
│  │         - Override with @Qualifier if needed
│  │
│  └─ NO → Use @Qualifier everywhere
│            - Explicit bean selection
│            - Self-documenting code
│
└─ Only one bean needed ever?
   └─ Use @Component without @Primary
      - No disambiguation needed
      - Keep it simple
```

### Common Patterns Summary

**Pattern 1: Primary with rare overrides**
```java
@Primary → 90% of uses (default)
@Qualifier → 10% of uses (special cases)
```

**Pattern 2: Equal alternatives**
```java
No @Primary → Forces explicit choice
@Qualifier → Required everywhere
```

**Pattern 3: Profile-based primaries**
```java
@Primary + @Profile("prod") → Production
@Primary + @Profile("dev") → Development
```

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Multiple @Primary

**Wrong:**
```java
@Component
@Primary
public class Desktop { ... }

@Component
@Primary  // ERROR: Two @Primary!
public class Laptop { ... }
```

**Error:** Multiple beans marked as primary

**Correct:**
```java
@Component
@Primary  // Only one!
public class Desktop { ... }

@Component
public class Laptop { ... }
```

### Mistake 2: Expecting @Primary to override @Qualifier

**Wrong assumption:**
```java
@Component
@Primary
public class Desktop { ... }

@Autowired
@Qualifier("laptop")
private Computer com;

// Developer thinks: "But Desktop is @Primary, so Desktop will be injected"
// Reality: Laptop injected (@Qualifier wins!)
```

**Remember:** @Qualifier > @Primary

### Mistake 3: Not using either

**Wrong:**
```java
@Component
public class Desktop { ... }  // No @Primary

@Component
public class Laptop { ... }   // No @Primary

@Autowired  // No @Qualifier
private Computer com;
```

**Error:** Ambiguous beans

**Correct (pick one):**
```java
// Option 1: Add @Primary
@Component
@Primary
public class Desktop { ... }

// Option 2: Add @Qualifier
@Qualifier("desktop")
```

### Mistake 4: @Primary without multiple beans

**Unnecessary:**
```java
@Component
@Primary  // Unnecessary - only one Computer bean!
public class Desktop { ... }

// No other Computer implementations
```

**Better:**
```java
@Component  // Simple, no @Primary needed
public class Desktop { ... }
```

**Only use @Primary when multiple beans exist!**

---

## 🎯 Practice Exercises

### Exercise 1: Test precedence

Create three Computer implementations. Mark one @Primary. Use @Qualifier to inject a different one. Verify @Qualifier wins.

### Exercise 2: No @Primary scenario

Create multiple Payment implementations. Don't use @Primary. Try injecting without @Qualifier. Observe the error. Then fix with @Qualifier.

### Exercise 3: Switch @Primary

Create DatabaseConnection beans (MySQL @Primary, Postgres). Run app. Then change @Primary to Postgres. Run again. Observe all services automatically switch.

### Exercise 4: @Qualifier override

Create Logger implementations (FileLogger @Primary, ConsoleLogger). Most services use @Autowired (gets FileLogger). One service uses @Qualifier("consoleLogger"). Verify behavior.

### Exercise 5: Multiple @Primary error

Try marking two beans as @Primary. Observe error. Fix by keeping only one @Primary.

### Exercise 6: Real-world scenario

Create email service with RealEmailService @Primary and MockEmailService. Create multiple services that send emails. Make test service use @Qualifier to get mock version.

---

## 🔗 Quick Summary

**The precedence rule: @Qualifier > @Primary > Error**

**@Primary: default choice**
```java
@Component
@Primary  // "Use me by default"
public class Desktop { ... }

@Autowired  // Gets Desktop
private Computer com;
```

**@Qualifier: explicit choice**
```java
@Component
public class Laptop { ... }

@Autowired
@Qualifier("laptop")  // "I specifically want this"
private Computer com;
```

**Both together: @Qualifier wins!**
```java
@Component
@Primary  // Default says Desktop
public class Desktop { ... }

@Autowired
@Qualifier("laptop")  // But I want Laptop!
private Computer com;  // Gets Laptop (Qualifier wins)
```

**The rule:**
- Explicit request (@Qualifier) > Default preference (@Primary)
- Use @Primary for common default
- Use @Qualifier to override when needed

**Next topic:** Bean scopes with component scanning! 🔄
