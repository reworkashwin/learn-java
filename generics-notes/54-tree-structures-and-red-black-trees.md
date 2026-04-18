# Tree-Like Structures and Red-Black Trees

## Introduction

Hash tables give us O(1) lookups, but they have a limitation: **no ordering**. If you need your keys sorted — for range queries, finding the next/previous key, or iterating in order — you need a **tree-based** structure. Java's `TreeMap` and `TreeSet` are backed by a special kind of tree called a **red-black tree**. Let's understand why.

---

## Concept 1: What Is a Binary Search Tree (BST)?

### 🧠 What is it?

A binary search tree is a tree where each node has at most two children, and:
- All values in the **left** subtree are **less than** the node
- All values in the **right** subtree are **greater than** the node

```
        8
       / \
      3   10
     / \    \
    1   6    14
       / \   /
      4   7 13
```

### ⚙️ How lookup works

To find `6`:
1. Start at root (`8`) → `6 < 8` → go left
2. At node `3` → `6 > 3` → go right
3. At node `6` → found!

Each comparison eliminates half the remaining tree — this gives O(log n) time.

### ❓ The problem with basic BSTs

If you insert sorted data (1, 2, 3, 4, 5), the tree degenerates into a **linked list**:

```
1
 \
  2
   \
    3
     \
      4
       \
        5
```

Now lookup is O(n) — no better than scanning a list. We need a way to keep the tree **balanced**.

---

## Concept 2: What Is a Balanced Tree?

### 🧠 What is it?

A balanced tree ensures that the heights of left and right subtrees don't differ by too much. This guarantees O(log n) operations regardless of insertion order.

### ❓ Why balance matters

| Structure | Lookup | Insert | Delete |
|-----------|--------|--------|--------|
| Balanced BST | O(log n) | O(log n) | O(log n) |
| Unbalanced BST (worst) | O(n) | O(n) | O(n) |

Several types of balanced trees exist:
- **AVL trees** — strictly balanced (height difference ≤ 1)
- **Red-black trees** — loosely balanced (used by Java)
- **B-trees** — used in databases and file systems

---

## Concept 3: What Is a Red-Black Tree?

### 🧠 What is it?

A red-black tree is a **self-balancing binary search tree** where each node is colored either **red** or **black**. It follows these rules:

1. Every node is either red or black
2. The **root** is always black
3. Every **leaf** (null node) is black
4. If a node is **red**, both its children must be **black** (no two consecutive reds)
5. Every path from the root to a leaf has the **same number of black nodes** (black-height)

### 💡 Insight — Why these rules work

Rules 4 and 5 together guarantee that the longest path is at most **2x the shortest path**. This means the tree is always roughly balanced, ensuring O(log n) operations.

### 🧪 Real-world analogy

Think of a red-black tree like a **self-organizing filing system**. Every time you add or remove a file, the system automatically reshuffles things to keep everything accessible in roughly the same number of steps. You never have to manually reorganize.

---

## Concept 4: How Rebalancing Works (Simplified)

### ⚙️ The operations

When you insert or delete a node, the red-black properties might be violated. The tree fixes itself using two operations:

**1. Recoloring** — Change a node's color from red to black or vice versa.

**2. Rotations** — Restructure the tree while maintaining BST ordering:

```
Left rotation at node X:          Right rotation at node Y:

    X                Y                Y               X
   / \              / \              / \              / \
  a   Y     →     X   c            X   c     →     a   Y
     / \         / \              / \                   / \
    b   c       a   b            a   b                 b   c
```

Rotations and recoloring together restore the red-black properties in O(log n) time.

### 💡 Insight

You rarely need to implement rotations yourself — Java's `TreeMap` handles all of this internally. What matters is understanding **why** `TreeMap` guarantees O(log n) for all operations.

---

## Concept 5: TreeMap and TreeSet in Java

### ⚙️ How to use them

```java
import java.util.TreeMap;
import java.util.Map;

Map<String, Integer> sortedMap = new TreeMap<>();

sortedMap.put("Charlie", 35);
sortedMap.put("Alice", 30);
sortedMap.put("Bob", 25);

// Iteration is in sorted key order
sortedMap.forEach((name, age) -> System.out.println(name + ": " + age));
// Alice: 30
// Bob: 25
// Charlie: 35
```

`TreeMap` provides additional navigation methods:

```java
TreeMap<Integer, String> scores = new TreeMap<>();
scores.put(50, "Pass");
scores.put(70, "Merit");
scores.put(90, "Distinction");

scores.firstKey();              // 50
scores.lastKey();               // 90
scores.lowerKey(70);            // 50 (strictly less than 70)
scores.higherKey(70);           // 90 (strictly greater than 70)
scores.subMap(50, 91);          // {50=Pass, 70=Merit, 90=Distinction}
scores.headMap(70);             // {50=Pass} (keys < 70)
scores.tailMap(70);             // {70=Merit, 90=Distinction} (keys >= 70)
```

---

## Concept 6: HashMap vs. TreeMap — When to Use Which

### 🧠 Comparison

| Feature | HashMap | TreeMap |
|---------|---------|---------|
| Underlying structure | Hash table | Red-black tree |
| Ordering | None | Sorted by key |
| `get`/`put`/`remove` | O(1) average | O(log n) |
| Navigation methods | No | Yes (`firstKey`, `subMap`, etc.) |
| Null keys | Allowed (one) | Not allowed |
| Use when | You need speed | You need sorted order or range queries |

### 💡 Insight

Use `HashMap` by default. Switch to `TreeMap` when you need:
- Sorted iteration
- Range queries (`subMap`, `headMap`, `tailMap`)
- Finding nearest keys (`lowerKey`, `higherKey`, `ceilingKey`, `floorKey`)

---

## ✅ Key Takeaways

- Binary search trees give O(log n) lookups when balanced, but degenerate to O(n) when unbalanced
- Red-black trees are self-balancing BSTs that guarantee O(log n) for insert, delete, and lookup
- They maintain balance through **recoloring** and **rotations**
- Java's `TreeMap` and `TreeSet` are implemented as red-black trees
- Use `TreeMap` when you need sorted keys or range queries; use `HashMap` for raw speed

## ⚠️ Common Mistakes

- Using `TreeMap` when order doesn't matter — `HashMap` is faster for plain lookups
- Forgetting that `TreeMap` keys must implement `Comparable` (or you must provide a `Comparator`)
- Assuming `TreeMap` allows `null` keys — it doesn't (throws `NullPointerException`)
- Confusing iteration order of `HashMap` (unpredictable) with `TreeMap` (sorted)
