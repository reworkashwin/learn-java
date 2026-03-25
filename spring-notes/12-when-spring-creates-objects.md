# ⏰ When Does Spring Create Objects? - The Container Loading Mystery

## Introduction

We've successfully created our first Spring Framework application. We can retrieve beans from the container and call their methods. Everything works!

**But here's a fascinating question that reveals how Spring really works:**

**WHEN exactly does Spring create the objects?**

Is it:
- **Line 9:** When we create the ApplicationContext?
- **Line 10:** When we call `getBean()`?

```java
ApplicationContext context = 
    new ClassPathXmlApplicationContext("spring.xml");  // Line 9
    
Alien obj = (Alien) context.getBean("alien");  // Line 10
obj.code();
```

**This might seem like a trivial question.**

**But the answer fundamentally changes how you think about Spring's IoC Container!**

Understanding this will help you:
- Grasp when initialization logic runs
- Optimize application startup
- Debug configuration issues
- Understand Spring's eager vs lazy loading
- Make informed decisions about bean creation strategies

**Let's investigate this like detectives** - using evidence (constructors) to catch Spring in the act of creating objects! 🔍

---

## Concept 1: The Two Possibilities

### 🧠 Setting up the question

Look at this code:

```java
public static void main(String[] args) {
    // Line 9: Creating the container
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    // Line 10: Getting the bean
    Alien obj = (Alien) context.getBean("alien");
    
    // Line 11: Using the bean
    obj.code();
}
```

**The question:** When does `new Alien()` actually execute?

### ❓ Scenario A: Line 9 (Container Creation)

**Theory:** Spring creates all beans when the container is initialized.

**What this would mean:**
- Loading spring.xml triggers object creation
- All beans mentioned in XML are instantiated immediately
- Container is pre-populated with objects
- `getBean()` just retrieves existing objects

**Analogy:** Like a restaurant that prepares all dishes before opening.

### ❓ Scenario B: Line 10 (Bean Request)

**Theory:** Spring creates beans only when you ask for them.

**What this would mean:**
- Container initialization just reads configuration
- Objects are created on-demand
- First `getBean()` call creates the object
- Lazy creation - only create what's needed

**Analogy:** Like a restaurant that cooks dishes only when ordered.

### 🧠 Why does this matter?

**If Scenario A (eager creation):**
- Application startup might be slower (creating all beans)
- But bean retrieval is fast (already created)
- Initialization errors appear immediately at startup

**If Scenario B (lazy creation):**
- Application startup is fast (just reading config)
- But first bean access might be slow
- Initialization errors appear later, during runtime

**Which is it?**

### 💡 Let's find out through experimentation!

Instead of guessing, we'll use **detective work** - leaving a trace that proves when object creation happens.

**Our tool:** The constructor!

---

## Concept 2: The Constructor Detective

### 🧠 Why constructors prove object creation

**In Java, a crucial fact:**

> Every time an object is created, its constructor is called.

**No exceptions. It's guaranteed.**

```java
Alien a = new Alien();  // Constructor WILL be called
```

**So if we add a print statement in the constructor...**

```java
public Alien() {
    System.out.println("Object created");
}
```

**...we'll see WHEN Spring creates the object!**

### ⚙️ Step 1: Add a constructor to Alien

**Modify your Alien class:**

```java
package com.telusko.app;

public class Alien {
    
    // Add this constructor
    public Alien() {
        System.out.println("Object created");
    }
    
    public void code() {
        System.out.println("Coding...");
    }
}
```

### 🧪 Test 1: Full execution

**Run the complete code:**

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
Object created
Coding...
```

**Observation:** The constructor was called! ✅

**But this doesn't answer our question yet** - we still don't know if it happened at line 9 or 10.

### 💡 The insight

We need to **isolate line 9 from line 10** to see which one triggers the constructor.

---

## Concept 3: The Isolation Experiment

### 🧠 The experimental method

**To determine WHEN the constructor is called:**

Eliminate line 10 and 11, leaving only line 9.

**If the constructor still runs**, then line 9 creates the object.  
**If the constructor doesn't run**, then line 10 creates the object.

### ⚙️ Step 2: Comment out lines 10-11

```java
public static void main(String[] args) {
    // Line 9: Container creation
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    // Line 10: Getting bean - COMMENTED OUT
    // Alien obj = (Alien) context.getBean("alien");
    
    // Line 11: Using bean - COMMENTED OUT
    // obj.code();
}
```

**Now we're only creating the container. We're NOT calling `getBean()`.**

### 🧪 Test 2: Run with lines 10-11 commented

**Run the code.**

**Expected outputs:**

**If Scenario A is correct (line 9 creates objects):**
```
Object created
```

**If Scenario B is correct (line 10 creates objects):**
```
(no output)
```

### 🎉 The result:

```
Object created
```

**IT PRINTED! Even without calling getBean()!**

### ❓ What does this prove?

**The constructor was called at line 9!**

This means:
- ✅ Spring creates objects during container initialization
- ✅ Creating the ApplicationContext triggers object creation
- ✅ `getBean()` just retrieves already-created objects
- ✅ Eager initialization is the default behavior

### 💡 The revelation

**Line 9 is doing TWO things:**

1. Creating the ApplicationContext container
2. Reading spring.xml and creating all beans defined there

**This line:**
```java
new ClassPathXmlApplicationContext("spring.xml");
```

**Actually executes:**
1. Parse spring.xml
2. Find all `<bean>` tags
3. For each bean, execute `new ClassName()`
4. Store objects in container

**All of this happens IMMEDIATELY when the container is created!**

---

## Concept 4: What getBean() Actually Does

### 🧠 Redefining our understanding

**Before we thought:**
```java
Alien obj = (Alien) context.getBean("alien");
```
Creates the object ❌

**Now we know:**
```java
Alien obj = (Alien) context.getBean("alien");
```
Retrieves the already-created object ✅

### ❓ So what IS getBean() doing?

**getBean() is like:**
- A retrieval operation
- A lookup in a map
- Getting a book from a shelf
- Accessing a pre-populated cache

**It's NOT creating anything. It's just finding and returning.**

### 🧠 The complete flow

```java
// Line 9: Container creation
ApplicationContext context = 
    new ClassPathXmlApplicationContext("spring.xml");
```
**What happens:**
1. Reads spring.xml
2. Sees: `<bean id="alien" class="com.telusko.app.Alien" />`
3. Executes: `Alien alien = new Alien();` → Constructor prints "Object created"
4. Stores in container: `container.put("alien", alien)`

**At this point, the Alien object EXISTS in the container.**

```java
// Line 10: Bean retrieval
Alien obj = (Alien) context.getBean("alien");
```
**What happens:**
1. Look in container for bean with ID "alien"
2. Find it (already exists)
3. Return reference to it
4. No object creation!

```java
// Line 11: Using the bean
obj.code();
```
**What happens:**
1. Normal method call on existing object
2. Prints "Coding..."

### 💡 The analogy

**Spring's container is like a warehouse:**

**Line 9 (Container creation):**
- Build the warehouse
- Receive all inventory shipments
- Stock all shelves
- Everything is ready

**Line 10 (getBean):**
- Walk to correct shelf
- Pick up item
- Hand it to customer
- Nothing is manufactured at this point!

**The manufacturing happened during Line 9!**

---

## Concept 5: Multiple Classes Experiment

### 🧠 New question

We've proven Spring creates the Alien object at line 9. But:

**Does it create objects for ALL classes in the project?**  
**Or only classes mentioned in spring.xml?**

### ⚙️ Step 3: Create a second class

**Add a Laptop class:**

```java
package com.telusko.app;

public class Laptop {
    
    public Laptop() {
        System.out.println("Laptop object created");
    }
}
```

**Current project structure:**
- ✅ Alien class (with constructor print)
- ✅ Laptop class (with constructor print)

**spring.xml:**
```xml
<beans ...>
    <bean id="alien" class="com.telusko.app.Alien" />
    <!-- Laptop is NOT configured! -->
</beans>
```

### 🧪 Test 3: Run with Laptop class but no bean definition

```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
}
```

**Output:**
```
Object created
```

**Only ONE object created!**

### ❓ Why didn't Laptop object get created?

**Because Laptop is not mentioned in spring.xml!**

**Spring ONLY creates objects for beans you configure.**

### ⚙️ Step 4: Add Laptop to spring.xml

```xml
<beans ...>
    <bean id="alien" class="com.telusko.app.Alien" />
    <bean id="laptop" class="com.telusko.app.Laptop" />
</beans>
```

**Now run again:**

```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
}
```

**Output:**
```
Object created
Laptop object created
```

**TWO objects created!** 🎉

### 💡 The rule

**Spring creates objects based on `<bean>` tags in spring.xml.**

**Not based on:**
- ❌ Classes in your project
- ❌ Classes in the same package
- ❌ All classes that exist

**Only based on:**
- ✅ Explicit `<bean>` configuration

**You have complete control!**

---

## Concept 6: Multiple Beans of Same Class

### 🧠 A curious scenario

What if we define the SAME class multiple times with different IDs?

```xml
<beans ...>
    <bean id="alien1" class="com.telusko.app.Alien" />
    <bean id="alien2" class="com.telusko.app.Alien" />
</beans>
```

**Two beans, same class, different IDs.**

### ❓ Will Spring create one object or two?

**Two possible answers:**

**Answer A: One object (memory optimization)**
- "Both beans are same class, why waste memory?"
- "Spring is smart, it will reuse one object"

**Answer B: Two objects (explicit configuration)**
- "We defined two beans, so two objects"
- "Different IDs = different instances"

**Which do you think?**

### 🧪 Test 4: Multiple beans of same class

**Update spring.xml:**
```xml
<beans ...>
    <bean id="alien1" class="com.telusko.app.Alien" />
    <bean id="alien2" class="com.telusko.app.Alien" />
    <bean id="laptop" class="com.telusko.app.Laptop" />
</beans>
```

**Update App.java to use alien1:**
```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj = (Alien) context.getBean("alien1");
    obj.code();
}
```

**Run:**

**Output:**
```
Object created
Object created
Laptop object created
Coding...
```

**"Object created" appears TWICE!**

### 💡 The answer

**Answer B is correct: Spring creates TWO separate Alien objects!**

**Why?**
- We defined two `<bean>` tags
- Each bean tag = one object instance
- Different IDs = different objects
- Spring follows your configuration exactly

**Each bean definition results in one object creation.**

### 🧠 Understanding Spring's philosophy

Spring doesn't second-guess you:
- You say create two beans? It creates two.
- You want same class twice? No problem.
- Different IDs make them distinct beans.

**You're the architect. Spring obeys your blueprint.**

### 🧪 Verifying they're different instances

We can prove they're different:

```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    Alien obj1 = (Alien) context.getBean("alien1");
    Alien obj2 = (Alien) context.getBean("alien2");
    
    System.out.println(obj1);  // Different memory address
    System.out.println(obj2);  // Different memory address
    System.out.println(obj1 == obj2);  // false
}
```

**Output:**
```
Object created
Object created
Laptop object created
com.telusko.app.Alien@15db9742
com.telusko.app.Alien@6d06d69c
false
```

**Different memory addresses = different objects!**

---

## Concept 7: The Optional ID Attribute

### 🧠 An interesting discovery

The instructor reveals something curious:

**The `id` attribute is actually OPTIONAL!**

```xml
<beans ...>
    <bean class="com.telusko.app.Alien" />  <!-- No id! -->
</beans>
```

**This is valid XML configuration!**

### ❓ But if there's no ID, how do we retrieve it?

**Excellent question!**

```java
// This won't work - we don't have an ID!
Alien obj = (Alien) context.getBean("???");
```

**The instructor teases:**

> "Let's try to understand that later, but let's have this question in your mind - how it will search when you don't have a name for it?"

### 💡 Sneak peek: The alternative

**You can retrieve beans by class type:**

```java
Alien obj = context.getBean(Alien.class);
```

**Spring finds the bean by its class instead of ID!**

**But there are complications:**
- What if two beans of same class?
- How does Spring choose?
- We'll explore this later!

### 🧠 For now

**Best practice: Always use IDs explicitly.**

It makes your code:
- Clear and readable
- Easy to debug
- Explicit about which bean you want

**We'll revisit the no-id scenario in a future lesson.**

---

## Concept 8: The Cliffhanger Question

### 🧠 Setting up the mystery

**Current state:**
- We have ONE bean in spring.xml: `alien1`
- We know one bean = one object creation

**New experiment:**

```java
public static void main(String[] args) {
    ApplicationContext context = 
        new ClassPathXmlApplicationContext("spring.xml");
    
    // Call getBean TWICE for the SAME ID
    Alien obj1 = (Alien) context.getBean("alien1");
    Alien obj2 = (Alien) context.getBean("alien1");
}
```

**spring.xml:**
```xml
<beans ...>
    <bean id="alien1" class="com.telusko.app.Alien" />
</beans>
```

### ❓ The critical question

**Will Spring create one object or two objects?**

**Think about this carefully:**

**Case A: One object**
- We defined ONE bean
- Both getBean calls refer to same ID
- Constructor should run once
- Both variables point to same instance

**Case B: Two objects**
- getBean is called twice
- Maybe Spring creates new object each time
- Constructor should run twice
- Each variable gets different instance

### 🧠 What do YOU think?

**The instructor asks you to consider:**

1. We learned that objects are created at line 9 (container initialization)
2. getBean just retrieves objects
3. But we're calling getBean twice...

**Does calling getBean multiple times create multiple objects?**

**Or does it return the same object?**

### 💡 The hint

Remember what we learned:
- Objects are created when container loads (line 9)
- getBean is a retrieval operation
- But the question remains...

**"Let me know your thoughts... in the next video, let's try to understand what is happening here."**

---

## ✅ Key Takeaways

### About Object Creation Timing

1. **Objects are created at container initialization (line 9)**
   - Not when getBean is called
   - Eager initialization is default
   - All beans in XML are instantiated immediately

2. **getBean() is a retrieval operation**
   - Doesn't create objects
   - Looks up existing beans
   - Returns references to pre-created instances

3. **You can prove this with constructors**
   - Constructor prints reveal when objects are created
   - Commenting out getBean still shows object creation
   - Evidence-based understanding!

### About Bean Configuration

1. **Only configured beans are created**
   - Spring doesn't create all classes
   - Only classes mentioned in `<bean>` tags
   - Complete control over what gets instantiated

2. **Multiple bean definitions = multiple objects**
   - Same class, different IDs = separate instances
   - Spring doesn't optimize by reusing
   - Each `<bean>` tag creates one object

3. **Number of beans determines number of objects**
   - 1 bean tag = 1 object
   - 2 bean tags = 2 objects (even if same class)
   - Direct correlation

### About the Cliffhanger

1. **New question: getBean called multiple times**
   - Same ID, two variables
   - How many objects created?
   - To be answered in next lesson!

---

## 💡 Final Insights

### The Eager Initialization Pattern

**What we discovered:**

Spring Framework uses **eager initialization** by default:
- All beans created at startup
- No lazy loading
- Container is fully prepared before use

**Advantages:**
- Errors appear immediately at startup
- Bean retrieval is fast (already created)
- Predictable behavior

**Disadvantages:**
- Slower application startup
- Uses memory for all beans immediately
- Even unused beans are created

### Spring's Design Philosophy

**Spring doesn't try to be clever with optimization.**

When you say:
```xml
<bean id="x" class="Foo" />
<bean id="y" class="Foo" />
```

**Spring thinks:** "You asked for two beans, you get two beans."

**It doesn't decide:** "Oh, same class, let me optimize and share one instance."

**This is by design:**
- Predictable behavior
- You control bean creation strategy
- Explicit configuration = explicit behavior

### Constructor Patterns for Debugging

**The technique we used (constructor print) is valuable for:**
- Understanding bean lifecycle
- Debugging initialization order
- Verifying configuration
- Learning Spring internals

**In real applications, you might use:**
- `@PostConstruct` annotations
- InitializingBean interface
- Custom init methods
- Logging frameworks

**But the principle is the same: track constructor calls!**

### What's Coming

**In the next video, we'll answer:**

1. **Does calling getBean twice create two objects?**
2. **What's the difference between bean scope and instances?**
3. **How to control whether Spring creates singletons or prototypes?**

**This leads to the concept of Bean Scopes - a fundamental Spring topic!**

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Assuming getBean creates objects

**Wrong thinking:**
```java
// First call creates object?
Alien obj1 = context.getBean("alien");

// Second call creates another object?
Alien obj2 = context.getBean("alien");
```

**Correct thinking:**
```java
// Container already created objects at initialization
// getBean just retrieves them
```

### Mistake 2: Thinking Spring manages all classes

**Wrong:**
"I created a class, Spring will automatically handle it."

**Right:**
"I must configure beans in spring.xml for Spring to manage them."

### Mistake 3: Forgetting classes need bean definitions

**Wrong:**
```java
// Laptop class exists but isn't configured in XML
Laptop lap = context.getBean("laptop");  // ERROR!
```

**Right:**
```xml
<!-- Configure first -->
<bean id="laptop" class="com.telusko.app.Laptop" />
```
```java
// Then retrieve
Laptop lap = context.getBean("laptop");  // Works!
```

### Mistake 4: Assuming same class = same instance

**Wrong thinking:**
```xml
<bean id="alien1" class="Alien" />
<bean id="alien2" class="Alien" />
<!-- "Spring will share one Alien instance" ❌ -->
```

**Right understanding:**
```xml
<!-- Spring creates TWO separate Alien instances ✅ -->
```

---

## 🎯 Practice Exercise

### Exercise 1: Verify the concepts

1. Create a class `Computer` with a constructor that prints
2. Add it to spring.xml with id "comp1"
3. Don't call getBean for it
4. Run and observe - constructor should still print!

### Exercise 2: Multiple instances

1. Configure three beans of Computer class (comp1, comp2, comp3)
2. How many times will constructor run?
3. Verify your prediction

### Exercise 3: The big question

Before the next lesson, predict:

**This code:**
```java
ApplicationContext context = 
    new ClassPathXmlApplicationContext("spring.xml");

Alien a1 = context.getBean("alien");
Alien a2 = context.getBean("alien");

System.out.println(a1 == a2);
```

**Will print: true or false?**

Write down your prediction and reasoning!

---

## 🔗 Quick Recap

**What we learned:**
1. ✅ Objects created at container initialization (line 9)
2. ✅ getBean is retrieval, not creation
3. ✅ Only configured beans are created
4. ✅ Multiple bean tags = multiple objects
5. ❓ Multiple getBean calls? To be continued...

**The experimental method:**
- Add constructor prints
- Comment out code sections
- Observe when prints occur
- Draw conclusions from evidence

**Next lesson:** Bean scopes and singleton behavior! 🔄
