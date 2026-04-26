# 📘 Java ArrayList — HackerRank Challenge

## 📌 Introduction

This HackerRank challenge tests your ability to work with **nested ArrayLists** — a list of lists. The problem involves storing multiple lines of integers and then answering position-based queries. It's an excellent exercise for understanding how to work with `List<List<Integer>>` in Java.

---

## 🧩 Problem Breakdown

### 🧠 What are we solving?

You're given `n` lines of input, where each line contains a variable number of integers. Then you receive `q` queries, each asking for the element at position `y` on line `x`. If the position doesn't exist, print `"ERROR!"`.

### ⚙️ Input Format

1. **Line 1**: Integer `n` — number of input lines
2. **Next `n` lines**: Each starts with `d` (number of integers on that line), followed by `d` space-separated integers
3. **Next line**: Integer `q` — number of queries
4. **Next `q` lines**: Two integers `x` and `y` — line number and position (1-indexed)

### 🧪 Example Walkthrough

```
Input:
5
5 41 77 74 22 44
1 12
4 37 34 36 52
0
3 20 22 33
5
1 3
3 4
3 1
4 3
5 5

Line 1: [41, 77, 74, 22, 44]
Line 2: [12]
Line 3: [37, 34, 36, 52]
Line 4: []  (empty — d=0)
Line 5: [20, 22, 33]

Query (1,3): Line 1, Position 3 → 74
Query (3,4): Line 3, Position 4 → 52
Query (3,1): Line 3, Position 1 → 37
Query (4,3): Line 4, Position 3 → ERROR! (line is empty)
Query (5,5): Line 5, Position 5 → ERROR! (only 3 elements)
```

---

## 🧩 Solution Approach

### ❓ Why use a List of Lists?

Each input line has a **variable number** of integers. A `List<List<Integer>>` is the natural data structure — the outer list holds each line, and each inner list holds the integers for that line.

### ⚙️ Step-by-Step

1. Read `n` (number of lines)
2. Create a `List<List<Integer>>` to store all lines
3. For each line: read `d` (count), then read `d` integers into an inner `ArrayList`
4. Read `q` (number of queries)
5. For each query: read `x` and `y`, convert to 0-indexed, and:
   - Check if `x` is within bounds of the outer list
   - Check if `y` is within bounds of the inner list at position `x`
   - Print the element or `"ERROR!"`

### 🧪 Solution Code

```java
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // Create list of lists
        List<List<Integer>> lists = new ArrayList<>();

        // Read n lines of input
        for (int i = 0; i < n; i++) {
            int d = sc.nextInt(); // number of integers on this line
            List<Integer> line = new ArrayList<>();
            while (d-- > 0) {
                line.add(sc.nextInt());
            }
            lists.add(line);
        }

        // Process queries
        int q = sc.nextInt();
        while (q-- > 0) {
            int x = sc.nextInt() - 1; // Convert to 0-indexed
            int y = sc.nextInt() - 1; // Convert to 0-indexed

            if (x >= lists.size()) {
                System.out.println("ERROR!");
            } else if (y >= lists.get(x).size()) {
                System.out.println("ERROR!");
            } else {
                System.out.println(lists.get(x).get(y));
            }
        }
    }
}
```

---

## 🧩 Key Concepts Used

### 🧠 Nested ArrayList — `List<List<Integer>>`

A list where each element is itself a list. This creates a **2D dynamic structure** where each row can have a different number of columns.

```java
List<List<Integer>> grid = new ArrayList<>();
grid.add(Arrays.asList(1, 2, 3));    // Row 0: 3 elements
grid.add(Arrays.asList(4));           // Row 1: 1 element
grid.add(Arrays.asList());            // Row 2: 0 elements

grid.get(0).get(2);  // → 3 (Row 0, Column 2)
grid.get(2).size();  // → 0 (Row 2 is empty)
```

### 🧠 1-Indexed to 0-Indexed Conversion

The problem uses **1-based indexing** (line 1, position 1 refers to the first element). Java lists use **0-based indexing**. Always subtract 1:

```java
int x = sc.nextInt() - 1; // line number (1-indexed → 0-indexed)
int y = sc.nextInt() - 1; // position (1-indexed → 0-indexed)
```

### 🧠 Bounds Checking

Before accessing `lists.get(x).get(y)`, you must verify:
1. `x` is a valid line index → `x < lists.size()`
2. `y` is a valid position within that line → `y < lists.get(x).size()`

If either check fails, print `"ERROR!"`.

### 💡 Insight

This problem is essentially building a **jagged array** (a 2D array where rows have different lengths) using `ArrayList`. The dynamic sizing of `ArrayList` makes it perfect for this — no need to know the dimensions upfront.

---

## ✅ Key Takeaways

- `List<List<Integer>>` creates a dynamic 2D structure with variable row lengths
- Always convert between 1-indexed (problem) and 0-indexed (Java) when required
- Check bounds before accessing nested lists to avoid `IndexOutOfBoundsException`
- The `while (d-- > 0)` pattern is a clean way to loop a counted number of times

## ⚠️ Common Mistakes

- Forgetting to convert from 1-based to 0-based indexing
- Not handling the case where a line has zero elements (d=0)
- Using `>=` instead of `>` in bounds checks (remember, `size()` is already 1 past the last valid index)

## 💡 Pro Tips

- `List<List<Integer>>` is more flexible than `int[][]` — no need to pre-allocate dimensions
- For similar problems, consider whether the input is 0-indexed or 1-indexed — it's a common source of bugs
- This pattern of nested lists is used extensively in graph representations (adjacency lists)
