# 📘 Java List — HackerRank Challenge

## 📌 Introduction

Time to put your Java Collections knowledge into practice! This HackerRank challenge tests your ability to work with the `List` interface — specifically performing **insert** and **delete** operations at specific positions. It's a straightforward problem that reinforces how `List` indexing and modification works in Java.

---

## 🧩 Problem Breakdown

### 🧠 What are we solving?

Given a list of integers and a series of queries, perform two types of operations:
- **Insert**: Insert element `y` at index `x`
- **Delete**: Delete the element at index `x`

After all queries are processed, print the modified list as space-separated integers.

### ⚙️ Input Format

1. **Line 1**: Integer `n` — the number of initial elements
2. **Line 2**: `n` space-separated integers — the initial list
3. **Line 3**: Integer `q` — the number of queries
4. **Next `q` lines**: Each query is either:
   - `Insert x y` — insert value `y` at index `x`
   - `Delete x` — remove the element at index `x`

### 🧪 Example Walkthrough

```
Input:
5
1 2 3 4 5
2
Insert 5 23
Delete 0

Step 1: Initial list → [1, 2, 3, 4, 5]
Step 2: Insert 23 at index 5 → [1, 2, 3, 4, 5, 23]
Step 3: Delete element at index 0 → [2, 3, 4, 5, 23]

Output: 2 3 4 5 23
```

---

## 🧩 Solution Approach

### ❓ Why use ArrayList?

`ArrayList` supports both `add(index, element)` and `remove(index)` operations, making it a natural fit for this problem. Insertions and deletions at arbitrary positions are straightforward with its API.

### ⚙️ Step-by-Step

1. Read `n` and populate the list with `n` integers
2. Read `q` (number of queries)
3. For each query:
   - If the query string is `"Insert"` → read index and element, call `list.add(index, element)`
   - If the query string is `"Delete"` → read index, call `list.remove(index)`
4. Print the final list as space-separated values

### 🧪 Solution Code

```java
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // Read initial list
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            list.add(sc.nextInt());
        }

        // Read number of queries
        int q = sc.nextInt();

        // Process each query
        for (int i = 0; i < q; i++) {
            String query = sc.next();
            if (query.compareTo("Insert") == 0) {
                int index = sc.nextInt();
                int value = sc.nextInt();
                list.add(index, value);
            } else {
                int index = sc.nextInt();
                list.remove(index);
            }
        }

        // Print result as space-separated values
        list.forEach(element -> System.out.print(element + " "));
    }
}
```

---

## 🧩 Key Concepts Used

### 🧠 `list.add(index, element)`

Inserts the specified element at the specified position. Shifts the existing element at that position (and all subsequent elements) to the right.

```java
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3));
list.add(1, 99);
// list → [1, 99, 2, 3]
```

### 🧠 `list.remove(index)`

Removes the element at the specified position. Shifts subsequent elements to the left.

```java
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3));
list.remove(0);
// list → [2, 3]
```

### 💡 Insight

Be careful with `remove()` — when working with `List<Integer>`, calling `list.remove(1)` removes the element at **index** 1, not the element with **value** 1. To remove by value, use `list.remove(Integer.valueOf(1))`.

---

## ✅ Key Takeaways

- `ArrayList` provides `add(index, element)` and `remove(index)` for positional operations
- String comparison with `compareTo()` returns `0` when strings match
- Use `forEach` with a lambda for concise iteration and printing
- Index-based operations on `ArrayList` shift elements automatically

## ⚠️ Common Mistakes

- Confusing `remove(int index)` with `remove(Object o)` when the list contains integers
- Forgetting that indices shift after each insert/delete operation
- Not handling the query string comparison correctly (use `equals()` or `compareTo()`)

## 💡 Pro Tips

- You can also use `sc.next()` instead of `sc.nextLine()` when reading single-word query strings
- For this type of problem, `LinkedList` would also work but `ArrayList` is simpler and sufficient
- Always test with edge cases: empty list, deleting the last element, inserting at the end
