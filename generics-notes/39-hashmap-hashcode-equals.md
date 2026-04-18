# HashMap Example — hashCode() and equals()

## Introduction

We've learned the theory behind hash tables — hash functions, collisions, load factors. Now let's see how this translates into actual Java code. Two methods are absolutely critical when using custom objects as keys in a `HashMap`: **`hashCode()`** and **`equals()`**. If you get these wrong, your HashMap will silently misbehave. Let's understand exactly what they do and how they relate to each other.

---

## Concept 1: hashCode() — The Hash Function

### 🧠 What is it?

The `hashCode()` method **is** the hash function. It takes an object (the key) and returns an integer — which Java then uses to compute the array index in the underlying hash table.

```
Key (object)  →  hashCode()  →  integer  →  modulo array size  →  array index
```

### ⚙️ How Java generates it

When you let your IDE generate `hashCode()` for a `Person` class with fields `name` and `age`:

```java
@Override
public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + age;
    result = prime * result + ((name == null) ? 0 : name.hashCode());
    return result;
}
```

Key observations:
- Uses **prime numbers** (31) — this reduces clustering and minimizes collision probability
- Incorporates **all relevant fields** — both `age` and `name` contribute to the hash
- Produces an `int` — Java will then use modulo to get the actual array index

### ❓ Why prime numbers?

Prime numbers help distribute hash values more evenly across the array. Non-prime multipliers tend to create patterns that cluster items in certain buckets, increasing collisions.

### 💡 Insight

You almost never need to write `hashCode()` by hand. Let your IDE generate it, or use `Objects.hash(field1, field2, ...)` in modern Java. The auto-generated version uses well-tested algorithms.

---

## Concept 2: equals() — Identity Comparison

### 🧠 What is it?

The `equals()` method determines whether **two objects are logically the same**. Java uses this when:

1. Looking up a value by key — after finding the right bucket via `hashCode()`, Java uses `equals()` to find the exact matching key
2. Handling collisions — when multiple keys share a bucket (linked list), `equals()` identifies the correct one

### ⚙️ Auto-generated equals()

```java
@Override
public boolean equals(Object obj) {
    if (this == obj) return true;           // Same reference? Equal.
    if (obj == null) return false;          // Null? Not equal.
    if (getClass() != obj.getClass()) return false;  // Different class? Not equal.
    Person other = (Person) obj;
    if (age != other.age) return false;     // Different age? Not equal.
    if (name == null) {
        if (other.name != null) return false;
    } else if (!name.equals(other.name)) return false;  // Different name? Not equal.
    return true;                            // All fields match → equal.
}
```

---

## Concept 3: How They Work Together in a HashMap

### ⚙️ The lookup process

When you call `map.get(key)`:

1. Java calls **`key.hashCode()`** → gets an array index
2. Goes to that bucket in the array
3. If there's only one item → uses **`equals()`** to confirm it's the right key
4. If there's a chain (collision) → walks the linked list, calling **`equals()`** on each item until it finds a match

### 🧪 Example

```java
Map<Person, String> map = new HashMap<>();
map.put(new Person("Kevin", 23), "Engineer");

// Later...
String role = map.get(new Person("Kevin", 23));
// hashCode() finds the bucket, equals() confirms the match
```

Without proper `hashCode()` and `equals()`, this lookup would fail — even though we're looking for the same logical person.

---

## Concept 4: The Two Golden Rules

### Rule 1: Equal objects MUST have the same hashCode

If `a.equals(b)` returns `true`, then `a.hashCode()` **must** equal `b.hashCode()`.

Why? Because Java uses `hashCode()` to find the bucket first. If equal objects have different hash codes, they'd end up in different buckets, and Java would never find the match.

### Rule 2: Same hashCode does NOT mean equal

If `a.hashCode() == b.hashCode()`, it does **not** guarantee that `a.equals(b)` is `true`.

Why? Because hash collisions are normal — two completely different objects can produce the same hash code. That's why `equals()` is needed as a second check.

```
equals() == true   →  hashCode() MUST be the same     ✓
hashCode() same    →  equals() may or may not be true  ⚠️
```

---

## Concept 5: Keys vs Values

### ⚠️ Important distinction

`hashCode()` and `equals()` are only used for **keys**, not values.

```java
Map<Person, String> map = new HashMap<>();
//   ↑ KEY              ↑ VALUE
//   hashCode()/equals() applied here only
```

If `Person` is the value (not the key), Java doesn't call its `hashCode()` or `equals()` for map operations:

```java
Map<String, Person> map = new HashMap<>();
//   ↑ KEY (String)  ↑ VALUE (Person)
//   String's hashCode/equals are used, not Person's
```

---

## ✅ Key Takeaways

- `hashCode()` = the hash function — converts objects to array indices
- `equals()` = identity check — determines if two objects are logically the same
- **Rule 1**: Equal objects must have the same hash code
- **Rule 2**: Same hash code does not guarantee equality
- Both methods are only relevant for **keys** in a HashMap
- Always override **both** `hashCode()` and `equals()` together — never just one

## ⚠️ Common Mistakes

- Overriding `equals()` without `hashCode()` — breaks HashMap lookups entirely
- Using mutable fields in `hashCode()` — if a key's fields change after insertion, the object becomes "lost" in the wrong bucket
- Writing custom `hashCode()` implementations when IDE-generated ones work perfectly

## 💡 Pro Tips

- Use `Objects.hash(field1, field2)` for clean, modern `hashCode()` implementations
- Use `Objects.equals(a, b)` for null-safe comparisons in `equals()`
- If a class will be used as a HashMap key, make it **immutable** — this prevents hash codes from changing after insertion
