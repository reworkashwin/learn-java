# Naming Your Beans — Creating Custom Bean Names

## Introduction

In the previous lecture, you learned that when you create a bean using `@Bean`, Spring automatically uses the **method name** as the bean's name. So if your method is called `vehicle1()`, the bean is stored in the Spring context with the name `"vehicle1"`.

But what if you don't like that name? What if you want something more descriptive — like `"audiVehicle"` instead of `"vehicle1"`? Or what if you want a single bean to be accessible by **multiple names**?

Spring gives you full control over bean naming. And in this lesson, we'll explore every approach — one by one — so you can name your beans exactly the way you want.

---

## Concept 1: Why Would You Want Custom Bean Names?

### 🧠 What's the Problem with Default Names?

By default, Spring uses the method name as the bean name. So if you write:

```java
@Bean
Vehicle vehicle1() {
    var vehicle = new Vehicle();
    vehicle.setName("Audi");
    return vehicle;
}
```

The bean is registered with the name `"vehicle1"`. That's fine — but it's not very descriptive, is it? In a real project with dozens (or hundreds) of beans, generic names like `vehicle1`, `vehicle2` make your code harder to understand and maintain.

### ❓ When Do Custom Names Help?

Custom bean names are useful when:

- You want **meaningful, self-documenting** names (e.g., `"audiVehicle"` instead of `"vehicle1"`)
- Multiple teams work on the same project and need **clear naming conventions**
- You want to access the same bean by **different names** in different parts of the application
- You need to avoid **naming collisions** between beans from different configurations

Think of it like naming your files. You *could* name your reports `file1.pdf`, `file2.pdf`, `file3.pdf`... but `quarterly-sales-report-Q1.pdf` is far more useful, right? Bean naming works the same way.

---

## Concept 2: Three Ways to Give a Bean a Custom Name

Spring gives you **three different approaches** to name your beans. All three achieve the same result — they just use slightly different syntax.

---

### Approach 1: Using the `name` Parameter

The `@Bean` annotation supports a `name` parameter. You can pass your custom name as a string:

```java
@Bean(name = "audiVehicle")
Vehicle vehicle1() {
    var vehicle = new Vehicle();
    vehicle.setName("Audi");
    return vehicle;
}
```

Now, this bean is **no longer** registered as `"vehicle1"`. It's registered as `"audiVehicle"` in the Spring context.

To retrieve it:

```java
Vehicle audi = context.getBean("audiVehicle", Vehicle.class);
System.out.println(audi.getName()); // Output: Audi
```

This is the most explicit and readable approach — you're clearly saying "the name of this bean is `audiVehicle`".

---

### Approach 2: Using the `value` Parameter

Instead of `name`, you can also use the `value` parameter:

```java
@Bean(value = "hondaVehicle")
Vehicle vehicle2() {
    var vehicle = new Vehicle();
    vehicle.setName("Honda");
    return vehicle;
}
```

This does **exactly the same thing** as `name`. The bean is registered as `"hondaVehicle"`.

### ❓ So Why Do Both `name` and `value` Exist?

In Java annotations, `value` is the **default parameter**. If an annotation has a `value` parameter, you can skip writing `value =` and just pass the value directly. Spring provides both `name` and `value` for flexibility — they're interchangeable.

---

### Approach 3: Passing the Name Directly (Without Any Parameter)

This is the shortest and most common approach. You just pass the bean name directly to `@Bean` — no parameter name needed:

```java
@Bean("ferrariVehicle")
Vehicle vehicle3() {
    var vehicle = new Vehicle();
    vehicle.setName("Ferrari");
    return vehicle;
}
```

This works because the `value` parameter is the default parameter of `@Bean`. So `@Bean("ferrariVehicle")` is shorthand for `@Bean(value = "ferrariVehicle")`.

### 💡 Which Approach Should You Use?

All three approaches are functionally identical. In practice, **Approach 3** (passing the name directly) is the most popular because it's the cleanest and most concise:

```java
// ✅ Preferred — clean and concise
@Bean("ferrariVehicle")

// ✅ Also fine — explicit but slightly verbose
@Bean(name = "audiVehicle")

// ✅ Works too — but rarely used over the other two
@Bean(value = "hondaVehicle")
```

---

## Concept 3: Summary of the Spring Context After Custom Naming

Let's visualize what happens in the Spring context after applying all three approaches:

| Method Name | Custom Bean Name | Stored in Context As |
|---|---|---|
| `vehicle1()` | `audiVehicle` | `"audiVehicle"` |
| `vehicle2()` | `hondaVehicle` | `"hondaVehicle"` |
| `vehicle3()` | `ferrariVehicle` | `"ferrariVehicle"` |

Notice the key point: **the method name no longer matters** for accessing the bean. Once you assign a custom name, only the custom name can be used to retrieve the bean. Trying to access it by the old method name will throw a `NoSuchBeanDefinitionException`.

### ⚠️ Watch Out!

If you provide a custom bean name and then try to retrieve the bean using the **method name**, it will fail:

```java
// ❌ This will throw NoSuchBeanDefinitionException
Vehicle v = context.getBean("vehicle1", Vehicle.class);

// ✅ This works — use the custom name
Vehicle v = context.getBean("audiVehicle", Vehicle.class);
```

The original method name is completely replaced by the custom name. Spring doesn't keep both.

---

## Concept 4: Bean Aliasing — Giving Multiple Names to One Bean

### 🧠 What Is It?

Sometimes, you want a single bean to be accessible by **more than one name**. This is called **bean aliasing**.

Think of it like a person who goes by multiple names — their legal name, a nickname, and maybe a username. All names refer to the **same person**. Similarly, all aliases refer to the **same bean**.

### ⚙️ How Does It Work?

Instead of passing a single string to `@Bean`, you pass a **String array** using curly braces `{}`:

```java
@Bean({"ferrariVehicle", "myFavoriteVehicle"})
Vehicle vehicle3() {
    var vehicle = new Vehicle();
    vehicle.setName("Ferrari");
    return vehicle;
}
```

Now, this single bean can be accessed using **either name**:

```java
// Both return the same Ferrari bean
Vehicle v1 = context.getBean("ferrariVehicle", Vehicle.class);
Vehicle v2 = context.getBean("myFavoriteVehicle", Vehicle.class);

System.out.println(v1.getName()); // Ferrari
System.out.println(v2.getName()); // Ferrari
```

### ❓ When Would You Use This?

Bean aliasing is useful when:

- Different parts of your application refer to the same bean by **different names**
- You're **refactoring** bean names and want to maintain backward compatibility
- Different teams or modules use different **naming conventions** but need the same bean

### 💡 Insight

Under the hood, there's still only **one bean instance** in the context. The aliases are just different keys in a lookup table that all point to the same object. It's not creating multiple copies.

---

## Concept 5: Adding a Description to Your Bean

### 🧠 What Is It?

Spring provides a `@Description` annotation that lets you attach a **human-readable description** to your bean. This description is metadata — it doesn't change the bean's behavior but makes it easier to understand during debugging.

### ⚙️ How to Use It

```java
@Bean("audiVehicle")
@Description("This is a Vehicle class bean representing an Audi car")
Vehicle vehicle1() {
    var vehicle = new Vehicle();
    vehicle.setName("Audi");
    return vehicle;
}
```

### ❓ Why Bother?

In small projects, this might seem unnecessary. But in large enterprise applications with hundreds of beans, these descriptions become invaluable during debugging. When you're investigating the Spring context or looking at bean definitions in monitoring tools, a clear description helps you quickly understand what each bean represents — without digging into the source code.

### 💡 Pro Tip

Think of `@Description` as a Javadoc for your bean. You wouldn't skip documenting important methods — so don't skip describing important beans either, especially in production-grade applications.

---

## Concept 6: Demo Walkthrough — Putting It All Together

Let's see how all of this looks in a working example.

### Step 1: The Configuration Class

```java
@Configuration
public class ProjectConfig {

    @Bean(name = "audiVehicle")
    @Description("This is a Vehicle class bean representing an Audi car")
    Vehicle vehicle1() {
        var vehicle = new Vehicle();
        vehicle.setName("Audi");
        return vehicle;
    }

    @Bean(value = "hondaVehicle")
    Vehicle vehicle2() {
        var vehicle = new Vehicle();
        vehicle.setName("Honda");
        return vehicle;
    }

    @Bean({"ferrariVehicle", "myFavoriteVehicle"})
    Vehicle vehicle3() {
        var vehicle = new Vehicle();
        vehicle.setName("Ferrari");
        return vehicle;
    }
}
```

### Step 2: Retrieving Beans by Custom Names

```java
var context = new AnnotationConfigApplicationContext(ProjectConfig.class);

Vehicle audi = context.getBean("audiVehicle", Vehicle.class);
System.out.println(audi.getName()); // Output: Audi

Vehicle ferrari = context.getBean("ferrariVehicle", Vehicle.class);
System.out.println(ferrari.getName()); // Output: Ferrari

// Using the alias — same bean!
Vehicle favorite = context.getBean("myFavoriteVehicle", Vehicle.class);
System.out.println(favorite.getName()); // Output: Ferrari
```

### Step 3: What Happens If You Use the Old Method Name?

```java
// ❌ This will throw NoSuchBeanDefinitionException
Vehicle v = context.getBean("vehicle1", Vehicle.class);
```

Since we gave `vehicle1()` the custom name `"audiVehicle"`, the method name `"vehicle1"` is no longer recognized. Spring only knows the custom name.

---

## ✅ Key Takeaways

1. **Default bean name** = method name. Custom names **override** the default completely
2. Three ways to set a custom name: `@Bean(name = "...")`, `@Bean(value = "...")`, or simply `@Bean("...")`  — all are equivalent
3. **`@Bean("name")`** (direct approach) is the most commonly used and cleanest syntax
4. Use **bean aliasing** with `@Bean({"name1", "name2"})` to give a single bean multiple names
5. All aliases point to the **same bean instance** — no duplicates are created
6. Use **`@Description`** to add human-readable metadata to beans for easier debugging
7. Once you assign a custom name, the **method name can no longer be used** to retrieve the bean

---

## ⚠️ Common Mistakes

1. **Trying to access a bean by its method name after giving it a custom name** — This throws `NoSuchBeanDefinitionException`. Once you set a custom name, the method name is gone.
2. **Confusing `name` and `value` parameters** — They're the same thing. Don't overthink it.
3. **Forgetting curly braces for aliases** — `@Bean("name1", "name2")` won't compile. You need `@Bean({"name1", "name2"})` with curly braces to pass an array.
4. **Thinking aliases create separate beans** — They don't. All aliases point to the same single bean object.

---

## 💡 Pro Tips

1. **Naming convention matters** — In real projects, follow a consistent naming convention for beans (e.g., camelCase). This makes your code predictable and your team's life easier.
2. **Use aliases during refactoring** — If you need to rename a bean but other parts of the code still use the old name, add the old name as an alias. This gives you a smooth migration path.
3. **`@Description` shines in debugging** — When you inspect the Spring context (through actuator endpoints or debuggers), `@Description` gives you instant context about what each bean does. Use it for important beans.
