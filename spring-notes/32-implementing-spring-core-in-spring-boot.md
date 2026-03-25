# 🔧 Implementing Spring Core Concepts in Spring Boot

## Introduction

**From Document 31, we learned:**
- Spring Boot = Spring Core + Auto-configuration
- @SpringBootApplication does everything automatically
- All Spring Core concepts apply to Spring Boot
- Spring Boot project was simpler than Spring Core

**But it was incomplete!**

**The instructor identified missing pieces:**
- No Computer interface
- No Desktop class
- No @Primary usage
- No @Qualifier usage
- No age variable
- No @Value annotation

**Today's mission:** 🎯

> "Okay, so let's quickly make those changes."

**We're going to:**
1. Add age variable to Alien
2. Make fields private
3. Create Computer interface
4. Make Laptop implement Computer
5. Create Desktop class
6. Handle ambiguity with @Primary
7. Override with @Qualifier
8. Use @Value for configuration
9. Test precedence rules

**Goal: Prove all Spring Core concepts work in Spring Boot!** ✅

**In this lesson, you'll learn:**
- Refactoring Alien class with proper encapsulation
- Creating interfaces in Spring Boot
- Implementing interfaces for loose coupling
- Using IDE tools to generate code quickly
- Handling NoUniqueBeanDefinitionException in Spring Boot
- Applying @Primary annotation in Spring Boot
- Using @Qualifier with @Autowired in Spring Boot
- Setter injection in Spring Boot
- @Value annotation for default values
- Testing @Qualifier precedence over @Primary
- Confirming all Spring Core learning applies to Spring Boot
- Understanding Spring Boot's advantage (less configuration)
- Looking ahead to Spring Boot-specific features

Transform your Spring Boot app with Spring Core wisdom! 🔧

---

## Concept 1: Refactoring Alien Class

### 🧠 Current state

**Alien.java (before):**
```java
package com.telusko.springbootdemo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    
    @Autowired
    Laptop laptop;  // Not private!
    
    public void code() {
        System.out.println("Coding...");
        laptop.compile();
    }
}
```

**Problems:**
- No age variable
- laptop field not private (bad encapsulation)
- Works with concrete Laptop class (tight coupling)
- No getters/setters

### 🧠 What we need to change

**The instructor lists the requirements:**

> "The first thing we need here is let's talk about the Alien class. What we wanted is: I want to have a variable for age. So I will say private int age. And then I want to make this as private as well. So we'll make this private. And also I don't want to work with Laptop. Now I want to work with Computer."

**Changes needed:**
1. Add `private int age` variable
2. Make laptop field private
3. Change from `Laptop` to `Computer` (interface)
4. Add getters and setters

---

## Concept 2: Adding Age Variable

### ⚙️ Add age field

**Alien.java (adding age):**
```java
@Component
public class Alien {
    
    private int age;  // Added!
    
    @Autowired
    Laptop laptop;
    
    public void code() {
        System.out.println("Coding...");
        laptop.compile();
    }
}
```

**The instructor adds:**

> "I want to have a variable for age. So I will say private int age."

**Private field for proper encapsulation!**

---

## Concept 3: Making Fields Private

### ⚙️ Change to private

**Alien.java (making private):**
```java
@Component
public class Alien {
    
    private int age;
    
    @Autowired
    private Laptop laptop;  // Now private!
    
    public void code() {
        System.out.println("Coding...");
        laptop.compile();
    }
}
```

**The instructor explains:**

> "And then I want to make this as private as well. So we'll make this private."

**Good practice: private fields, public methods!**

---

## Concept 4: Creating Computer Interface

### 🧠 Why interface?

**The instructor decides:**

> "And also I don't want to work with Laptop. Now I want to work with Computer. So we'll say Computer com."

**Change from concrete class to interface:**
```java
// Before: tight coupling
private Laptop laptop;

// After: loose coupling
private Computer com;
```

**Benefits:**
- Loose coupling
- Can swap implementations
- Interface-based programming
- Testable code

### ⚙️ Create the interface

**The instructor uses IDE:**

> "And of course this is an interface which we have not created yet. So let's create the interface. So I will just say control space. Click here and say hey I want to create an interface called Computer. In the same package I will say okay."

**Computer.java (new interface):**
```java
package com.telusko.springbootdemo;

public interface Computer {
    void compile();
}
```

**The instructor specifies:**

> "And this particular Computer interface will have a method which is void compile."

**Simple interface with one method!**

### ⚙️ Updated Alien class

**Alien.java (with Computer interface):**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    
    private int age;
    
    @Autowired
    private Computer com;  // Interface, not concrete class!
    
    public void code() {
        System.out.println("Coding...");
        com.compile();  // Changed from laptop.compile()
    }
}
```

**The instructor fixes the method call:**

> "Yeah okay. So in the Alien instead of saying laptop.compile you have to say com.compile now."

**Now using interface!** ✅

---

## Concept 5: Making Laptop Implement Computer

### ⚙️ Update Laptop class

**Laptop.java (before):**
```java
@Component
public class Laptop {
    public void compile() {
        System.out.println("Compiling...");
    }
}
```

**Laptop.java (after):**
```java
import org.springframework.stereotype.Component;

@Component
public class Laptop implements Computer {  // Implements interface!
    
    @Override
    public void compile() {
        System.out.println("Compiling in Laptop");
    }
}
```

**The instructor implements:**

> "So this Laptop is actually implementing the Computer interface. So Laptop implements Computer and things are looking good."

**Also improved the output message for clarity!**

---

## Concept 6: Adding Getters and Setters

### ⚙️ Generate with IDE

**The instructor uses IDE features:**

> "But since we have these two variables we need getters and setters as well. So I will just ask my IDE to give me setters. I will right click here and say generate. I need getters and setters for both the variables."

**Alien.java (with getters/setters):**
```java
@Component
public class Alien {
    
    private int age;
    private Computer com;
    
    public void code() {
        System.out.println("Coding...");
        com.compile();
    }
    
    // Generated getters and setters
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

**IDE generated all getters/setters!** ⚡

---

## Concept 7: Using Setter Injection

### 🧠 Moving @Autowired to setter

**The instructor explains:**

> "Next thing which I want to do is I don't want to use @Autowired on the field or on the property. I want to use the @Autowired annotation on a setter, which is for com."

**From Document 28:** Setter injection is preferred over field injection!

**Alien.java (setter injection):**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    
    private int age;
    private Computer com;  // No @Autowired here!
    
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
    
    @Autowired  // Moved to setter!
    public void setCom(Computer com) {
        this.com = com;
    }
}
```

**@Autowired on setter method instead of field!**

**From Document 28 learning applied!** ✅

---

## Concept 8: Adding @Value for Age

### ⚙️ Setting default age value

**The instructor adds:**

> "There's one more. I want to assign some default values here so I can use a @Value annotation. And I can mention let's say the age is 25."

**Alien.java (with @Value):**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    
    @Value("25")  // Default age value!
    private int age;
    
    private Computer com;
    
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
    
    @Autowired
    public void setCom(Computer com) {
        this.com = com;
    }
}
```

**Age now defaults to 25!**

**The instructor confirms:**

> "Anything else here looks good to me."

**Alien class refactoring complete!** ✅

---

## Concept 9: Creating Desktop Class

### ⚙️ Adding second implementation

**The instructor continues:**

> "But apart from the Laptop, we want one more class which is Desktop. So what I will do is I will just make some changes here. I will say compiling in Laptop, and then I will just copy the same code because I want to reuse this."

**Laptop.java (updated message):**
```java
@Component
public class Laptop implements Computer {
    
    @Override
    public void compile() {
        System.out.println("Compiling in Laptop");  // More specific!
    }
}
```

**Creating Desktop:**

> "Let me create a new class. So here let me create a class which is Desktop. And this Desktop will be implementing Computer."

**Desktop.java (new class):**
```java
package com.telusko.springbootdemo;

import org.springframework.stereotype.Component;

@Component
public class Desktop implements Computer {
    
    @Override
    public void compile() {
        System.out.println("Compiling in Desktop");
    }
}
```

**The instructor explains:**

> "In fact I have copied the code. I will just paste it here and I will just change this to Desktop. I will say compiling in Desktop."

**Now we have two Computer implementations!**

**The instructor confirms:**

> "So we got Laptop and we got Desktop. So we got two classes implementing Computer. And things are looking good."

**Complete structure now:**
```
Computer (interface)
    ├── Laptop (implementation)
    └── Desktop (implementation)

Alien
    └── Computer com (injected)
```

---

## Concept 10: The Ambiguity Problem Appears!

### 🧪 Run the application

**The instructor predicts:**

> "But now if you see Computer has two implementations: Laptop and Desktop. Let's see. Do you get a different error which we used to get in the Spring Boot app?"

**SpringBootDemoApplication.java:**
```java
package com.telusko.springbootdemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class SpringBootDemoApplication {

    public static void main(String[] args) {
        ApplicationContext context = 
            SpringApplication.run(SpringBootDemoApplication.class, args);
        
        Alien obj = context.getBean(Alien.class);
        obj.code();
    }
}
```

**Run it...**

**The instructor waits:**

> "So if I go back here to my Spring Boot application and if I run this, let's see what it says in the output. Interesting to see."

### ❌ Error occurs!

**Error output:**
```
***************************
APPLICATION FAILED TO START
***************************

Description:

Field com in com.telusko.springbootdemo.Alien required a single bean, but 2 were found:
	- desktop: defined in file [Desktop.class]
	- laptop: defined in file [Laptop.class]

Action:

Consider marking one of the beans as @Primary, or using @Qualifier
```

**The instructor confirms:**

> "You can see it says 'Alien required single bean but found two' - again the same problem, right? The problem is there is a confusion which one to go for."

**NoUniqueBeanDefinitionException in Spring Boot!**

**Same error as Spring Core!** ⚠️

---

## Concept 11: Solving with @Primary

### ⚙️ Adding @Primary to Desktop

**The instructor applies the solution:**

> "So we know the solution. We can just write @Primary here."

**Desktop.java (with @Primary):**
```java
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary  // Default Computer implementation!
public class Desktop implements Computer {
    
    @Override
    public void compile() {
        System.out.println("Compiling in Desktop");
    }
}
```

**Desktop is now the default choice!**

**Would work now, but the instructor wants to demonstrate more...**

---

## Concept 12: Using @Qualifier to Override

### ⚙️ Adding @Qualifier to Alien

**The instructor demonstrates precedence:**

> "And also when I'm using @Autowired I can also use @Qualifier. So even if I'm making Desktop as @Primary, I will say in the @Qualifier I want to work with Laptop."

**Alien.java (with @Qualifier):**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    
    @Value("25")
    private int age;
    
    private Computer com;
    
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
    
    @Autowired
    @Qualifier("laptop")  // Explicit choice: Laptop!
    public void setCom(Computer com) {
        this.com = com;
    }
}
```

**The setup:**
- Desktop marked @Primary (default is Desktop)
- Alien uses @Qualifier("laptop") (wants Laptop)
- **Conflict!**

**The instructor predicts:**

> "So I know the Desktop is @Primary, but it will still prefer Laptop because that's the @Qualifier we are using."

**Testing the precedence rule from Document 29!**

---

## Concept 13: Testing the Result

### 🧪 Run with @Primary and @Qualifier

**The instructor reminds us:**

> "And we have learned all these things in the Spring Core, right? I'm just trying to use them here."

**Complete code:**

**Desktop.java:**
```java
@Component
@Primary  // Says: "Desktop is default"
public class Desktop implements Computer {
    @Override
    public void compile() {
        System.out.println("Compiling in Desktop");
    }
}
```

**Laptop.java:**
```java
@Component  // Not primary
public class Laptop implements Computer {
    @Override
    public void compile() {
        System.out.println("Compiling in Laptop");
    }
}
```

**Alien.java:**
```java
@Component
public class Alien {
    @Value("25")
    private int age;
    
    private Computer com;
    
    @Autowired
    @Qualifier("laptop")  // Says: "I want Laptop"
    public void setCom(Computer com) {
        this.com = com;
    }
    
    public void code() {
        System.out.println("Coding...");
        com.compile();
    }
}
```

**Run the application...**

**Output:**
```
Coding...
Compiling in Laptop
```

**The instructor confirms:**

> "Let's run this and let's see if we get the output. Yes. You can see it says compiling in Laptop."

**Laptop injected, not Desktop!** ✅

**@Qualifier wins over @Primary!** 🏆

**Document 29 rule proven in Spring Boot!**

---

## Concept 14: Adding Age Output

### ⚙️ Display the age value

**The instructor adds:**

> "Of course I can also print the age if I want. So I can say obj.getAge()."

**SpringBootDemoApplication.java (with age):**
```java
@SpringBootApplication
public class SpringBootDemoApplication {

    public static void main(String[] args) {
        ApplicationContext context = 
            SpringApplication.run(SpringBootDemoApplication.class, args);
        
        Alien obj = context.getBean(Alien.class);
        System.out.println("Age: " + obj.getAge());  // Print age!
        obj.code();
    }
}
```

**Run again...**

**Output:**
```
Age: 25
Coding...
Compiling in Laptop
```

**The instructor confirms:**

> "So you can see we got the age as 25."

**@Value("25") working perfectly!** ✅

**All annotations working in Spring Boot!**

---

## Concept 15: The Big Realization

### 🧠 All Spring Core concepts work!

**The instructor makes the key point:**

> "So all the annotations which we used in a Spring project also applicable in Spring Boot."

**What we proved:**
✅ @Component works
✅ @Autowired works
✅ @Primary works
✅ @Qualifier works
✅ @Value works
✅ @Qualifier > @Primary rule works
✅ Setter injection works
✅ Interface-based programming works

**Everything from Documents 1-30 applies to Spring Boot!**

### 🧠 The advantage of Spring Boot

**The instructor emphasizes:**

> "The only advantage you get, or the biggest advantage you get here is you don't have to do a lot of configuration. And that's the benefit of using Spring Boot."

**Spring Core required:**
```java
@Configuration
@ComponentScan(basePackages = "com.telusko")
public class AppConfig {
    // Configuration class needed
}

public class App {
    public static void main(String[] args) {
        ApplicationContext context = 
            new AnnotationConfigApplicationContext(AppConfig.class);
        // Manual context creation
    }
}
```

**Spring Boot requires:**
```java
@SpringBootApplication  // One annotation!
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);  // One line!
    }
}
```

**Less configuration, same power!** ⚡

---

## Concept 16: Looking Forward

### 🧠 Focus shifting to Spring Boot

**The instructor announces:**

> "In fact in the upcoming videos, so all the topics which are going to focus now will be focused on Spring Boot. So now we understood what Spring Framework is and what is happening behind the scene. But when you talk about using the features of Spring, let's focus on Spring Boot now because it does the same thing which Spring does. But you have to do less configuration."

**The journey so far:**

```
Documents 1-21: Spring Core (XML)
    ↓
Documents 22-26: Spring Core (Java Config)
    ↓
Documents 27-30: Spring Core (Component Scanning)
    ↓
Document 31: Understanding Spring Boot
    ↓
Document 32: Applying Spring Core to Spring Boot
    ↓
Document 33+: Spring Boot Features!
```

**Phase completed:** Spring fundamentals ✅
**Phase starting:** Spring Boot features 🚀

### 🧠 Can we customize Spring Boot?

**The instructor addresses concerns:**

> "I know, I know, maybe you're thinking about what if I want to configure something? What if I want to change something? Do we have an option?"

**Answer:**

> "Of course we have lot of annotations available, so you can use certain annotations to change it. Also we get property files in your project. So either you can use a YAML file or property files. And you can specify some external values if you want."

**Spring Boot is customizable!**

**Options:**
1. **Annotations** - Override defaults
2. **application.properties** - External configuration
3. **application.yml** - YAML configuration
4. **@Configuration classes** - Custom beans
5. **Profiles** - Environment-specific config

### 🧠 What's next?

**The instructor previews:**

> "But we'll see that later. How do we do all those stuff? So yeah, that's about creating a Spring Boot project here. And we'll focus on Spring Boot, as I mentioned in the upcoming videos."

**Coming topics:**
- application.properties configuration
- YAML configuration
- Property file value injection
- Profile-specific configuration
- Spring Boot starters
- Web applications with Spring Boot
- REST APIs
- Database integration
- JPA and Hibernate
- And much more!

---

## ✅ Key Takeaways

### About Refactoring Alien Class

1. **Private fields for encapsulation**
   ```java
   private int age;
   private Computer com;
   ```

2. **Interface-based programming**
   ```java
   // Not: private Laptop laptop;
   // But: private Computer com;
   ```

3. **Getters and setters for access**
   - IDE can generate quickly
   - Proper JavaBean pattern

### About Dependency Injection in Spring Boot

1. **Setter injection preferred**
   ```java
   @Autowired
   public void setCom(Computer com) {
       this.com = com;
   }
   ```

2. **@Value for default values**
   ```java
   @Value("25")
   private int age;
   ```

3. **No special configuration needed**
   - Just annotations on classes
   - Spring Boot handles rest

### About Multiple Implementations

1. **Same error as Spring Core**
   ```
   required single bean but found 2
   ```

2. **Same solutions work**
   - @Primary for default
   - @Qualifier for explicit choice

3. **Same precedence rules**
   - @Qualifier > @Primary > Error

### About Spring Boot Advantage

1. **All Spring Core concepts apply**
   - @Component
   - @Autowired
   - @Primary
   - @Qualifier
   - @Value
   - @Scope (all from Spring Core)

2. **But with less configuration**
   - No @Configuration needed (for basic setup)
   - No @ComponentScan needed
   - No manual context creation
   - Auto-configuration handles rest

3. **Customization still possible**
   - Annotations
   - Property files
   - Custom configuration classes
   - Override auto-configuration

---

## 💡 Final Insights

### The Complete Alien Class

**Final Alien.java:**
```java
package com.telusko.springbootdemo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class Alien {
    
    @Value("25")  // From Document 30
    private int age;
    
    private Computer com;  // Interface (loose coupling)
    
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
    
    @Autowired               // From Document 28
    @Qualifier("laptop")     // From Document 29
    public void setCom(Computer com) {
        this.com = com;
    }
}
```

**Every annotation has a purpose from our learning!**

---

### The Complete Computer Hierarchy

**Computer.java (interface):**
```java
public interface Computer {
    void compile();
}
```

**Laptop.java (implementation 1):**
```java
@Component
public class Laptop implements Computer {
    @Override
    public void compile() {
        System.out.println("Compiling in Laptop");
    }
}
```

**Desktop.java (implementation 2):**
```java
@Component
@Primary  // From Document 29
public class Desktop implements Computer {
    @Override
    public void compile() {
        System.out.println("Compiling in Desktop");
    }
}
```

**Clean interface-based design!**

---

### Spring Core vs Spring Boot (Complete Comparison)

**What's the same:**

| Feature | Spring Core | Spring Boot |
|---------|-------------|-------------|
| @Component | ✅ | ✅ |
| @Autowired | ✅ | ✅ |
| @Primary | ✅ | ✅ |
| @Qualifier | ✅ | ✅ |
| @Value | ✅ | ✅ |
| @Scope | ✅ | ✅ |
| Dependency Injection | ✅ | ✅ |
| Bean Container | ✅ | ✅ |
| All Spring features | ✅ | ✅ |

**What's different:**

| Aspect | Spring Core | Spring Boot |
|--------|-------------|-------------|
| Configuration | Manual (@Configuration) | Automatic (@SpringBootApplication) |
| Component scan | Explicit (@ComponentScan) | Automatic (from main package) |
| Context creation | Manual (new AnnotationConfig...) | Automatic (SpringApplication.run) |
| Dependencies | Individual JARs | Starters (bundles) |
| Server | External (Tomcat install) | Embedded (included) |
| Setup time | Hours | Minutes |

---

### Why Learn Spring Core First?

**Now we understand why! 🎓**

**Without Spring Core knowledge:**
```java
@SpringBootApplication
public class App { }

// "It just works! But I don't know why..."
// "What's @Primary? What's @Qualifier?"
// "Why am I getting NoUniqueBeanDefinitionException?"
// "How do I fix this?"
```

**With Spring Core knowledge (Documents 1-30):**
```java
@SpringBootApplication  // Ah! @Configuration + @ComponentScan + @EnableAutoConfiguration
public class App { }

// "I know exactly what's happening!"
// "@Primary marks default bean (Document 29)"
// "@Qualifier overrides @Primary (Document 29)"
// "NoUniqueBeanDefinitionException = multiple beans (Document 28)"
// "I can fix this easily!"
```

**Understanding enables mastery!** 💡

---

### Real-World Application Structure

**Typical Spring Boot project after refactoring:**

```
springbootdemo/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/telusko/springbootdemo/
│       │       ├── SpringBootDemoApplication.java  ← Main
│       │       ├── model/
│       │       │   └── Alien.java                  ← Entity
│       │       ├── service/
│       │       │   └── AlienService.java           ← Business logic
│       │       ├── repository/
│       │       │   └── AlienRepository.java        ← Data access
│       │       └── computer/
│       │           ├── Computer.java               ← Interface
│       │           ├── Laptop.java                 ← Impl 1
│       │           └── Desktop.java                ← Impl 2
│       └── resources/
│           ├── application.properties              ← Config
│           └── application.yml                     ← Alt config
└── pom.xml
```

**Clean, organized, professional!**

---

### Configuration Flexibility

**You CAN still customize:**

**Option 1: Override with custom @Bean**
```java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}

@Configuration
public class CustomConfig {
    @Bean
    @Primary
    public Computer customComputer() {
        return new HighPerformanceComputer();
    }
}
```

**Option 2: Use application.properties**
```properties
alien.age=30
alien.computer=desktop
```

```java
@Component
public class Alien {
    @Value("${alien.age}")  // From properties!
    private int age;
}
```

**Option 3: Profile-specific config**
```properties
# application-dev.properties
alien.age=20

# application-prod.properties
alien.age=50
```

**Spring Boot = Flexibility + Convenience!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Not making fields private

**Wrong:**
```java
@Component
public class Alien {
    Computer com;  // Not private!
}
```

**Correct:**
```java
@Component
public class Alien {
    private Computer com;  // Encapsulated!
}
```

### Mistake 2: Using concrete class instead of interface

**Not ideal:**
```java
@Autowired
private Laptop laptop;  // Tight coupling
```

**Better:**
```java
@Autowired
private Computer com;  // Loose coupling
```

### Mistake 3: Forgetting to implement interface

**Wrong:**
```java
public interface Computer { void compile(); }

@Component
public class Desktop {  // Doesn't implement Computer!
    public void compile() { ... }
}
```

**Spring can't inject Desktop as Computer!**

**Correct:**
```java
@Component
public class Desktop implements Computer {
    @Override
    public void compile() { ... }
}
```

### Mistake 4: Not handling multiple implementations

**Wrong:**
```java
// Computer has Laptop and Desktop implementations
@Autowired
private Computer com;  // ERROR: Found 2 beans!
```

**Correct (option 1 - @Primary):**
```java
@Component
@Primary
public class Laptop implements Computer { ... }
```

**Correct (option 2 - @Qualifier):**
```java
@Autowired
@Qualifier("laptop")
private Computer com;
```

---

## 🎯 Practice Exercises

### Exercise 1: Complete refactoring

Start with basic Spring Boot app. Add interface, multiple implementations, @Primary, @Qualifier. Verify all work.

### Exercise 2: Test precedence

Create Payment interface with CreditCard and PayPal implementations. Mark one @Primary. Use @Qualifier to inject the other. Verify @Qualifier wins.

### Exercise 3: Setter vs field injection

Create same dependency injection using field injection, then refactor to setter injection. Compare code quality.

### Exercise 4: Multiple @Value fields

Add multiple fields with @Value: name (String), salary (double), active (boolean). Test all values injected correctly.

### Exercise 5: Interface-based design

Create Service interface with EmailService and SMSService implementations. Inject into NotificationManager. Test with both implementations.

### Exercise 6: IDE code generation

Practice using IDE to generate interfaces, implementations, getters/setters. Build complete class structure in under 2 minutes.

---

## 🔗 Quick Summary

**Mission accomplished!** ✅

**What we did:**
1. ✅ Added age variable with @Value
2. ✅ Made fields private (encapsulation)
3. ✅ Created Computer interface
4. ✅ Made Laptop implement Computer
5. ✅ Created Desktop class
6. ✅ Used @Primary for default
7. ✅ Used @Qualifier to override
8. ✅ Applied setter injection
9. ✅ Tested @Qualifier > @Primary
10. ✅ Proved all Spring Core concepts work in Spring Boot!

**Key lesson:**

> "All the annotations which we used in a Spring project also applicable in Spring Boot. The only advantage you get here is you don't have to do a lot of configuration."

**The formula:**

```
Spring Boot = Spring Core + Less Configuration
```

**Going forward:**
- Focus on Spring Boot features
- Property files and YAML
- External configuration
- Spring Boot starters
- Web applications
- And much more!

**Next: Spring Boot-specific features and configuration!** 🚀
