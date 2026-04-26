# 📘 Java HashSet — HackerRank Challenge

## 📌 Introduction

This HackerRank challenge is a perfect exercise for understanding how `HashSet` handles **uniqueness**. The problem gives you pairs of strings, and your task is to count how many **unique pairs** have been seen after each insertion. It's a clean, practical demonstration of why `HashSet` is the go-to collection when you need to track unique elements.

---

## 🧩 Problem Breakdown

### 🧠 What are we solving?

Given `t` pairs of strings (first name + last name), after adding each pair, output the total number of **unique pairs** seen so far. Duplicate pairs should not be counted.

### ⚙️ Input Format

1. **Line 1**: Integer `t` — number of pairs
2. **Next `2t` lines**: Each pair consists of two lines (first name, last name)

### 🧪 Example Walkthrough

```
Input:
5
john tom
john mary
john tom
mary anna
mary anna

After pair 1 ("john tom"):  1 unique pair  → Output: 1
After pair 2 ("john mary"): 2 unique pairs → Output: 2
After pair 3 ("john tom"):  Still 2 (duplicate!) → Output: 2
After pair 4 ("mary anna"): 3 unique pairs → Output: 3
After pair 5 ("mary anna"): Still 3 (duplicate!) → Output: 3

Output:
1
2
2
3
3
```

---

## 🧩 Solution Approach

### ❓ Why use HashSet?

`HashSet` stores only **unique elements**. When you try to add a duplicate, it simply ignores it. This makes it perfect for counting unique items — just add everything and check the `size()`.

### ⚙️ Step-by-Step

1. Create a `HashSet<String>` to store unique pairs
2. For each pair, concatenate the two names into a single string (e.g., `"john tom"`)
3. Add the concatenated string to the `HashSet`
4. After each addition, print the current size of the `HashSet`

### 🧪 Solution Code

```java
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int t = sc.nextInt();

        // Arrays provided by HackerRank's template
        String[] pairLeft = new String[t];
        String[] pairRight = new String[t];

        for (int i = 0; i < t; i++) {
            pairLeft[i] = sc.next();
            pairRight[i] = sc.next();
        }

        // Our solution: track unique pairs using HashSet
        HashSet<String> uniquePairs = new HashSet<>();

        for (int i = 0; i < t; i++) {
            String fullPair = pairLeft[i] + " " + pairRight[i];
            uniquePairs.add(fullPair);
            System.out.println(uniquePairs.size());
        }
    }
}
```

---

## 🧩 Key Concepts Used

### 🧠 HashSet Ignores Duplicates

When you call `add()` on a `HashSet`, it first checks if the element already exists (using `hashCode()` and `equals()`). If it does, the element is **not added** and `add()` returns `false`.

```java
HashSet<String> set = new HashSet<>();
set.add("hello");  // returns true — added
set.add("hello");  // returns false — already exists, ignored
set.size();         // → 1
```

### 🧠 Concatenating Pairs into Strings

To treat a pair of strings as a single unit, we concatenate them with a separator:

```java
String fullPair = "john" + " " + "tom"; // → "john tom"
```

This ensures that `("john", "tom")` is treated as one entity in the set. The space separator prevents collisions like `("jo", "hntom")` matching `("john", "tom")`.

### 🧠 Tracking Running Count with `size()`

After each `add()`, calling `size()` gives us the current count of unique elements. This is exactly what the problem asks for — the number of unique pairs after each insertion.

### 💡 Insight

The beauty of `HashSet` is that you don't need any conditional logic to check for duplicates. Just `add()` everything and let the set handle uniqueness for you. The `size()` method always reflects the true count of unique elements.

---

## ✅ Key Takeaways

- `HashSet` automatically rejects duplicate elements
- `add()` returns `false` when the element already exists — no exception thrown
- Concatenating multi-field data into a single string is a simple way to create composite keys
- `size()` always returns the count of unique elements in the set

## ⚠️ Common Mistakes

- Forgetting to concatenate with a separator — `"johnmary"` could collide with other combinations
- Using `==` instead of `equals()` for string comparison in custom logic (though `HashSet` handles this correctly internally)
- Printing the size before adding the current pair instead of after

## 💡 Pro Tips

- For more complex pair tracking, consider creating a custom `Pair` class with proper `hashCode()` and `equals()` implementations
- `HashSet` has O(1) average time for `add()` and `contains()` — perfect for large datasets
- This pattern (add + check size) is useful whenever you need a running count of distinct items
