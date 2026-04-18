# Getting Private Fields and Methods with Reflection

## Introduction

In Java, `private` means "only accessible within this class." But reflection doesn't play by those rules. With reflection, you can **access and manipulate private fields and methods** — bypassing Java's access control entirely. This is both powerful and dangerous, and it's exactly how frameworks inject dependencies into private fields.

---

## Concept 1: The Problem with getFields() and getMethods()

### 🧠 What happens with private members?

If your `Person` class has private fields:

```java
public class Person {
    private String name;
    private int age;
    // ...
}
```

Calling `getFields()` returns **only public fields** — so you get an empty array. Private fields are invisible to this method.

Similarly, `getMethods()` returns only public methods. A private method like:

```java
private String returnName() {
    return this.name;
}
```

...won't appear in the results.

---

## Concept 2: getDeclaredFields() — Accessing Private Fields

### ⚙️ How it works

To access **all fields** including private ones, use `getDeclaredFields()`:

```java
Field[] fields = personClass.getDeclaredFields();

for (Field f : fields) {
    f.setAccessible(true);  // Bypass access control
    System.out.println(f.getName());
}
```

### 🔑 The key: setAccessible(true)

Before you can read or modify a private field, you **must** call `setAccessible(true)`. This tells Java's security manager to allow access to this otherwise restricted member.

Without it, you'll get an `IllegalAccessException`.

### 📊 Output

```
name
age
```

Both private fields are detected and accessible.

---

## Concept 3: getDeclaredMethods() — Accessing Private Methods

### ⚙️ How it works

The same pattern applies to methods:

```java
Method[] methods = personClass.getDeclaredMethods();

for (Method m : methods) {
    m.setAccessible(true);  // Bypass access control
    System.out.println(m.getName());
}
```

### 📊 Output

```
getName
setName
getAge
setAge
returnName    ← private method detected!
```

The private `returnName()` method is found alongside the public getters and setters.

---

## Concept 4: getFields/getMethods vs getDeclaredFields/getDeclaredMethods

| Method | Scope | Includes private? | Includes inherited? |
|---|---|---|---|
| `getFields()` | Public fields only | No | Yes |
| `getDeclaredFields()` | All fields in this class | **Yes** | No |
| `getMethods()` | Public methods only | No | Yes |
| `getDeclaredMethods()` | All methods in this class | **Yes** | No |

The pattern is consistent:
- **Without "Declared"** → public only, includes inherited
- **With "Declared"** → everything in this class (including private), excludes inherited

---

## Concept 5: Reading and Writing Private Field Values

Once you have access, you can actually **read and modify** private fields:

```java
Person person = new Person("Adam", 30);

Field nameField = Person.class.getDeclaredField("name");
nameField.setAccessible(true);

// Read the private field
String name = (String) nameField.get(person);  // "Adam"

// Modify the private field
nameField.set(person, "Eve");
// person.name is now "Eve" — even though it's private!
```

---

## ✅ Key Takeaways

- `getFields()` / `getMethods()` only return **public** members — private ones are hidden
- `getDeclaredFields()` / `getDeclaredMethods()` return **all** members declared in the class, including private
- You must call `setAccessible(true)` before accessing private members
- Reflection can **read and write** private field values and **invoke** private methods
- This is how frameworks like Spring inject values into `@Autowired` private fields

## ⚠️ Common Mistakes

- Using `getFields()` and wondering why private fields don't show up — use `getDeclaredFields()`
- Forgetting `setAccessible(true)` — you'll get an `IllegalAccessException`
- Assuming that `private` means truly inaccessible — reflection bypasses access modifiers entirely

## 💡 Pro Tips

- `getDeclaredField("name")` gets a specific field by name — no need to iterate
- `setAccessible(true)` works for fields, methods, and constructors
- Spring's `@Autowired` on a private field uses exactly this mechanism: `field.setAccessible(true)` then `field.set(bean, value)`
- Java 9+ modules can restrict reflection access — `setAccessible()` may throw `InaccessibleObjectException` for module-protected code
