# 📘 Immutable Collections

## 📌 Introduction

So far, we've worked with collections you can freely modify — add elements, remove them, update values. But what about data that should **never change** after creation? Configuration settings, constant lookup tables, shared reference data — these should be locked down. That's exactly what immutable collections provide: a **guarantee that the data cannot be modified**, ever.

---

## 🧩 Concept 1: What Are Immutable Collections?

### 🧠 What is it?

An immutable collection is a collection whose elements **cannot be modified** after creation. You cannot add, remove, or update elements. Any attempt to do so throws an `UnsupportedOperationException`.

### ❓ Why do we need them?

Immutable collections solve several real problems:

1. **Thread safety** — Since they can't be modified, they're inherently thread-safe. No synchronization needed, no race conditions possible.
2. **Data integrity** — They protect against accidental or malicious modifications. Once created, the data stays exactly as intended.
3. **Memory efficiency** — Immutable collections can be safely shared across different parts of your application without creating defensive copies.
4. **Simplicity** — No need to handle edge cases around concurrent modification during iteration or worry about someone changing your data unexpectedly.

### 💡 Insight

Think of immutable collections like a **printed document** — once printed, you can read it as many times as you want, share it with anyone, but nobody can change what's written. Mutable collections are like a **whiteboard** — anyone with a marker can modify the content.

---

## 🧩 Concept 2: Creating Immutable Collections with Factory Methods (Java 9+)

### 🧠 What is it?

Starting with Java 9, the `List`, `Set`, and `Map` interfaces provide **static factory methods** to create truly immutable collections in a single, clean line.

### ⚙️ How it works

| Method | Creates |
|--------|---------|
| `List.of(elements...)` | Immutable List |
| `Set.of(elements...)` | Immutable Set |
| `Map.of(key1, val1, key2, val2, ...)` | Immutable Map |

### 🧪 Example

```java
import java.util.List;
import java.util.Set;
import java.util.Map;

public class ImmutableTest {
    public static void main(String[] args) {
        // Immutable List
        List<String> immutableList = List.of("Alice", "Bob", "Charlie");

        // Immutable Set
        Set<String> immutableSet = Set.of("Alice", "Bob", "Charlie");

        // Immutable Map
        Map<String, Integer> immutableMap = Map.of(
            "Alice", 23,
            "Bob", 21,
            "Charlie", 22
        );

        System.out.println("List: " + immutableList);
        System.out.println("Set: " + immutableSet);
        System.out.println("Map: " + immutableMap);

        // Attempting modification throws UnsupportedOperationException
        try {
            immutableList.add("David");
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot add to immutable list!");
        }
    }
}
```

**Output:**
```
List: [Alice, Bob, Charlie]
Set: [Alice, Bob, Charlie]
Map: {Alice=23, Bob=21, Charlie=22}
Cannot add to immutable list!
```

### 💡 Insight

These factory methods create **completely immutable** collections — there's no underlying mutable collection that can be modified through a back door. The collections also reject `null` elements and duplicate keys (for maps), providing additional safety guarantees.

---

## 🧩 Concept 3: Unmodifiable Collections (Pre-Java 9)

### 🧠 What is it?

Before Java 9, you could create collections that **prevent direct modification** using `Collections.unmodifiableXxx()` methods. However, these create an **unmodifiable view** of a mutable collection — not a truly immutable collection.

### ❓ Why is this different from truly immutable?

The unmodifiable wrapper prevents modification **through the wrapper**, but changes to the **original mutable collection** still show up in the unmodifiable view. It's a read-only window, not a sealed vault.

### ⚙️ How it works

```java
Collections.unmodifiableList(mutableList)    // Read-only view of a list
Collections.unmodifiableSet(mutableSet)      // Read-only view of a set
Collections.unmodifiableMap(mutableMap)      // Read-only view of a map
```

### 🧪 Example

```java
import java.util.*;

public class UnmodifiableDemo {
    public static void main(String[] args) {
        // Create a mutable list
        List<String> mutableList = new ArrayList<>();
        mutableList.add("Alice");
        mutableList.add("Bob");
        mutableList.add("Charlie");

        // Create an unmodifiable view
        List<String> unmodifiableList = Collections.unmodifiableList(mutableList);

        System.out.println("Unmodifiable list: " + unmodifiableList);
        // Output: [Alice, Bob, Charlie]

        // ❌ Direct modification of the view fails
        try {
            unmodifiableList.add("David");
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot modify unmodifiable list!");
        }

        // ⚠️ BUT: modifying the ORIGINAL list reflects in the view!
        mutableList.add("David");
        System.out.println("After modifying original: " + unmodifiableList);
        // Output: [Alice, Bob, Charlie, David] — David appeared!
    }
}
```

### 💡 Insight

This is the critical difference: `Collections.unmodifiableList()` creates a **read-only view**, not a truly immutable collection. The original mutable collection is still a back door. For **true immutability**, use `List.of()`, `Set.of()`, or `Map.of()`.

---

## 🧩 Concept 4: Immutable vs Unmodifiable — The Key Distinction

### 🧠 What's the difference?

| Feature | Immutable (`List.of()`) | Unmodifiable (`Collections.unmodifiableList()`) |
|---------|-------------------------|------------------------------------------------|
| Direct modification | ❌ `UnsupportedOperationException` | ❌ `UnsupportedOperationException` |
| Original collection changes | N/A — no original collection | ✅ Changes reflected in the view |
| True immutability | ✅ Yes | ❌ No — it's just a read-only wrapper |
| Null elements | ❌ Not allowed | ✅ Depends on the original collection |
| Available since | Java 9 | Java 2 (1.2) |

### ❓ When to use which?

- **`List.of()` / `Set.of()` / `Map.of()`** — When you need **true immutability**. The data is sealed forever.
- **`Collections.unmodifiableXxx()`** — When you want to give callers a **read-only view** of a collection you still control internally. Useful in API design where you return a collection but don't want callers to modify it.

### 💡 Insight

A common pattern in API design:
```java
public class UserService {
    private final List<String> users = new ArrayList<>();
    
    // Return an unmodifiable view — callers can't modify,
    // but internally you can still add/remove users
    public List<String> getUsers() {
        return Collections.unmodifiableList(users);
    }
}
```

For truly constant data, prefer `List.of()`:
```java
private static final List<String> VALID_STATUSES = List.of("ACTIVE", "INACTIVE", "PENDING");
```

---

## 🧩 Concept 5: When to Use Immutable Collections

### 🧠 Use Cases

| Scenario | Why Immutable? |
|----------|---------------|
| **Configuration values** | Settings shouldn't change at runtime |
| **Constants / lookup tables** | Reference data that never changes |
| **Multi-threaded data sharing** | No synchronization needed — inherently thread-safe |
| **API return values** | Prevent callers from modifying internal state |
| **Defensive programming** | Guarantee data integrity throughout the application lifecycle |

### 💡 Insight

Immutable collections are a cornerstone of **functional programming** style in Java. Combined with records (Java 16+) and streams, they enable a programming style where data flows through transformations without side effects — making code easier to reason about and less prone to bugs.

---

## ✅ Key Takeaways

- **Immutable collections** (`List.of()`, `Set.of()`, `Map.of()`) cannot be modified after creation — any attempt throws `UnsupportedOperationException`
- **Unmodifiable collections** (`Collections.unmodifiableXxx()`) prevent direct modification but still reflect changes to the original mutable collection
- For **true immutability**, use factory methods (Java 9+); for **read-only views**, use unmodifiable wrappers
- Immutable collections are inherently **thread-safe**, provide **data integrity**, and improve **code simplicity**
- Immutable collections do **not allow null elements**

## ⚠️ Common Mistakes

- Confusing unmodifiable with immutable — they are **not the same**. Unmodifiable views can still change if the original collection changes
- Assuming you can add `null` to `List.of()` — it throws `NullPointerException`
- Not handling `UnsupportedOperationException` when working with APIs that might return immutable collections
- Using `List.of()` when you actually need a mutable list — create with `new ArrayList<>(List.of(...))` instead

## 💡 Pro Tips

- Use `List.copyOf()`, `Set.copyOf()`, `Map.copyOf()` (Java 10+) to create an immutable copy of an existing mutable collection — this gives true immutability without the unmodifiable back-door problem
- In modern Java, prefer `List.of()` over `Arrays.asList()` — `Arrays.asList()` returns a fixed-size list that still allows `set()` operations
- For immutable maps with more than 10 entries, use `Map.ofEntries(Map.entry("key", "value"), ...)` — `Map.of()` only supports up to 10 key-value pairs
- In interviews, always clarify the difference between immutable and unmodifiable — it's a common trick question
