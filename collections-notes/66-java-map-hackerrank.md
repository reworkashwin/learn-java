# 📘 Java Map — HackerRank Challenge

## 📌 Introduction

This HackerRank challenge is a practical exercise in using `HashMap` to build a **phone directory**. You'll store name-phone number pairs and then handle search queries — returning the phone number if the name exists, or `"Not found"` otherwise. It's a classic use case that demonstrates why `HashMap` is the go-to data structure for fast key-value lookups.

---

## 🧩 Problem Breakdown

### 🧠 What are we solving?

1. Build a phone directory by storing `n` name-phone number entries
2. Handle search queries: for each name queried, print the phone number or `"Not found"`

### ⚙️ Input Format

1. **Line 1**: Integer `n` — number of entries
2. **Next `2n` lines**: Alternating name and phone number for each entry
3. **Remaining lines**: Names to query (until end of input)

### 🧪 Example Walkthrough

```
Input:
3
uncle sam
99912222
tom
11122222
harry
12299933
uncle sam
uncle tom
harry

Processing:
- Store: {"uncle sam" → "99912222", "tom" → "11122222", "harry" → "12299933"}

Query "uncle sam" → found → "uncle sam=99912222"
Query "uncle tom" → not found → "Not found"
Query "harry" → found → "harry=12299933"

Output:
uncle sam=99912222
Not found
harry=12299933
```

---

## 🧩 Solution Approach

### ❓ Why use HashMap?

`HashMap` provides **O(1) average time** for both `put()` and `get()` operations. For a phone directory where you need fast lookups by name, it's the ideal choice.

### ⚙️ Step-by-Step

1. Create a `HashMap<String, String>` for the phone book
2. Read `n` entries — each entry has a name (key) and phone number (value)
3. Use `put()` to store each entry
4. For each query, use `containsKey()` to check if the name exists
5. If found, print `name=phoneNumber`; otherwise, print `"Not found"`

### 🧪 Solution Code

```java
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Create phone book
        HashMap<String, String> phoneBook = new HashMap<>();

        // Read number of entries
        int n = sc.nextInt();
        sc.nextLine(); // Consume the leftover newline

        // Store entries
        for (int i = 0; i < n; i++) {
            String name = sc.nextLine().trim();
            String phone = sc.nextLine().trim();
            phoneBook.put(name, phone);
        }

        // Handle queries
        while (sc.hasNext()) {
            String query = sc.nextLine().trim();
            if (phoneBook.containsKey(query)) {
                System.out.println(query + "=" + phoneBook.get(query));
            } else {
                System.out.println("Not found");
            }
        }

        sc.close();
    }
}
```

---

## 🧩 Key Concepts Used

### 🧠 `HashMap.put(key, value)`

Stores a key-value pair. If the key already exists, the old value is replaced with the new one.

```java
HashMap<String, String> map = new HashMap<>();
map.put("alice", "12345");
map.put("bob", "67890");
map.put("alice", "11111"); // Replaces alice's number
```

### 🧠 `HashMap.containsKey(key)`

Returns `true` if the map contains the specified key, `false` otherwise. This is an O(1) operation on average.

```java
map.containsKey("alice"); // → true
map.containsKey("carol"); // → false
```

### 🧠 `HashMap.get(key)`

Returns the value associated with the key, or `null` if the key doesn't exist.

```java
map.get("alice"); // → "11111"
map.get("carol"); // → null
```

### 🧠 Reading Until End of Input — `sc.hasNext()`

The `while (sc.hasNext())` loop reads queries until there's no more input. This is the standard pattern for reading an unknown number of remaining lines.

### 💡 Insight

The `sc.nextLine()` after `sc.nextInt()` is crucial. `nextInt()` reads the number but leaves the newline character in the buffer. Without the extra `nextLine()`, the first name would be read as an empty string.

---

## 🧩 Concept: HashMap for Fast Lookups

### 🧠 Why O(1)?

`HashMap` uses hashing to compute the bucket index for each key. Instead of searching through all entries (O(n)), it goes directly to the right bucket. This makes lookups extremely fast — constant time on average, regardless of how many entries are in the map.

### 🧪 Real-World Analogy

Think of a phone book organized by the first letter of the name. Instead of scanning every page, you jump directly to the "S" section for "Sam". `HashMap` does this with hash codes instead of letters, but the principle is the same — **skip the search, go directly to the answer**.

### 💡 Insight

For this challenge, even if you had millions of contacts in the phone book, each lookup would still be nearly instant. That's the power of hash-based data structures.

---

## ✅ Key Takeaways

- `HashMap` provides O(1) average-time lookups — ideal for dictionary/phone book problems
- Use `containsKey()` to check for existence before `get()` to handle missing entries
- `sc.nextLine()` after `sc.nextInt()` is necessary to consume the trailing newline
- `while (sc.hasNext())` reads input until EOF — standard pattern for unknown query count
- Always close the `Scanner` when done to free resources

## ⚠️ Common Mistakes

- Forgetting `sc.nextLine()` after `sc.nextInt()` — causes the first name to be read as empty
- Using `sc.next()` for names with spaces (like "uncle sam") — `next()` reads only until whitespace
- Not trimming input strings — trailing spaces can cause key mismatches
- Printing `name + " = " + phone` with spaces around `=` — the expected output has no spaces

## 💡 Pro Tips

- You can combine `containsKey()` + `get()` into `getOrDefault()`: `phoneBook.getOrDefault(query, "Not found")`
- For case-insensitive lookups, convert all keys to lowercase before storing and querying
- `HashMap` allows `null` keys and values — but `ConcurrentHashMap` doesn't
- This phone book pattern is the foundation for many real-world applications: DNS lookup, database indexing, caching
