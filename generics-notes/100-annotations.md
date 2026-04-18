# Annotations and Reflection

## Introduction

Annotations are the **backbone of modern Java frameworks**. Every time you write `@Test`, `@Override`, `@Autowired`, or `@Entity`, you're using annotations. But how do frameworks actually **detect and act on** these annotations? The answer is reflection. In this note, we'll learn how to create a custom annotation and detect it at runtime using reflection.

---

## Concept 1: What is an Annotation?

### 🧠 Definition

An annotation is a form of **metadata** — information about code that doesn't directly affect execution but can be read by tools, compilers, or frameworks at compile time or runtime.

You've already used many built-in annotations:
- `@Override` — tells the compiler you're overriding a method
- `@Deprecated` — marks something as outdated
- `@SuppressWarnings` — suppresses compiler warnings

---

## Concept 2: Creating a Custom Annotation

### ⚙️ How to define one

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyAnnotation {
    String name();
}
```

Let's break this down:

- **`@interface`** — declares this as an annotation (not a regular interface)
- **`String name()`** — an annotation element (like a property). Users must provide a value: `@MyAnnotation(name = "test")`
- **`@Retention(RetentionPolicy.RUNTIME)`** — this annotation is **available at runtime** via reflection. This is critical! Without it, the annotation is discarded after compilation
- **`@Target(ElementType.METHOD)`** — this annotation can only be placed on methods

### 📋 Retention policies

| Policy | When available | Use case |
|---|---|---|
| `SOURCE` | Only in source code, discarded by compiler | `@Override`, `@SuppressWarnings` |
| `CLASS` | In .class files, but not at runtime | Default if not specified |
| `RUNTIME` | Available at runtime via reflection | `@Test`, `@Autowired`, custom frameworks |

For reflection to detect an annotation, it **must** use `RetentionPolicy.RUNTIME`.

### 📋 Target element types

| ElementType | Where the annotation can be used |
|---|---|
| `METHOD` | On methods |
| `FIELD` | On field variables |
| `TYPE` | On classes, interfaces, enums |
| `CONSTRUCTOR` | On constructors |
| `PARAMETER` | On method parameters |
| `LOCAL_VARIABLE` | On local variables |

---

## Concept 3: Using the Annotation

### 🧪 Applying it to a method

```java
public class Person {
    private String name;

    @MyAnnotation(name = "returnName")
    public String returnName() {
        return this.name;
    }

    public String getName() {
        return this.name;
    }
}
```

Only `returnName()` has our annotation. `getName()` does not.

---

## Concept 4: Detecting Annotations with Reflection

### ⚙️ How frameworks find annotated methods

```java
Class<Person> personClass = Person.class;
Method[] methods = personClass.getMethods();

for (Method method : methods) {
    if (method.isAnnotationPresent(MyAnnotation.class)) {
        System.out.println(method.getName());
    }
}
// Output: returnName
```

Step by step:
1. Get all methods from the class
2. For each method, check `isAnnotationPresent(MyAnnotation.class)`
3. If true, this method has our annotation — process it

### 🧪 Reading annotation values

```java
if (method.isAnnotationPresent(MyAnnotation.class)) {
    MyAnnotation annotation = method.getAnnotation(MyAnnotation.class);
    System.out.println(annotation.name());  // "returnName"
}
```

You can access the values defined in the annotation — like the `name` we specified.

---

## Concept 5: This is How Frameworks Work

### 🧪 JUnit analogy

JUnit does exactly this:

```java
// JUnit scans for @Test annotations
for (Method method : testClass.getMethods()) {
    if (method.isAnnotationPresent(Test.class)) {
        method.invoke(testInstance);  // Run the test!
    }
}
```

It finds all methods with `@Test`, then invokes them. That's annotation-driven programming powered by reflection.

### 🧪 Spring analogy

Spring scans for `@Component`, `@Service`, `@Repository` on classes and `@Autowired` on fields. It uses reflection to:
1. Find annotated classes
2. Instantiate them
3. Inject dependencies into annotated fields

---

## ✅ Key Takeaways

- Annotations are metadata attached to code elements (classes, methods, fields)
- Custom annotations are defined with `@interface`
- **`@Retention(RetentionPolicy.RUNTIME)`** is mandatory for reflection to detect the annotation
- **`@Target`** controls where the annotation can be used (methods, fields, classes, etc.)
- `method.isAnnotationPresent(MyAnnotation.class)` checks if a method has the annotation
- `method.getAnnotation(MyAnnotation.class)` retrieves the annotation and its values
- This is the exact mechanism JUnit, Spring, and Hibernate use under the hood

## ⚠️ Common Mistakes

- Forgetting `@Retention(RetentionPolicy.RUNTIME)` — the annotation won't be visible to reflection
- Using `@Target(ElementType.FIELD)` but trying to annotate a method — compile error
- Confusing `@interface` (annotation declaration) with `interface` (regular interface)

## 💡 Pro Tips

- Always use `RUNTIME` retention if you plan to read annotations via reflection
- Annotation elements can have default values: `String name() default "default";`
- You can combine multiple targets: `@Target({ElementType.METHOD, ElementType.FIELD})`
- Annotations can be placed on other annotations — this is called a **meta-annotation** (e.g., `@Retention` is itself a meta-annotation)
