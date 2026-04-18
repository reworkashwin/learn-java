# Comparison of Sets

## Introduction

We've studied all three set implementations — `HashSet`, `LinkedHashSet`, and `TreeSet`. Since these are built on top of their map counterparts, the comparison mirrors what we already know about maps. Let's bring it all together.

---

## Concept 1: Internal Structures

| Set | Built On | Internal Structure |
|-----|----------|-------------------|
| **HashSet** | HashMap | One-dimensional array + hash function |
| **LinkedHashSet** | LinkedHashMap | Array + hash function + doubly linked list |
| **TreeSet** | TreeMap | Red-black tree (balanced BST) |

The pattern is simple: each set is essentially its corresponding map, but only using the keys.

---

## Concept 2: Time Complexity

| Scenario | HashSet / LinkedHashSet | TreeSet |
|----------|------------------------|---------|
| **Average case** | O(1) | O(log n) |
| **Worst case (modern Java)** | O(log n) | O(log n) |

Just like with maps, modern Java converts long collision chains into red-black trees. So the worst case for hash-based sets is now **O(log n)**, not O(n).

---

## Concept 3: Feature Comparison

| Feature | HashSet | LinkedHashSet | TreeSet |
|---------|---------|---------------|---------|
| **Order** | ❌ None | ✅ Insertion order | ✅ Sorted order |
| **Null values** | ✅ Allowed | ✅ Allowed | ❌ Not allowed |
| **Average performance** | O(1) | O(1) | O(log n) |
| **Memory usage** | Medium | Highest | Lowest |
| **Tuning parameters** | Load factor | Load factor | None |

---

## Concept 4: Memory Considerations

**HashSet** and **LinkedHashSet** use hash tables, which require the underlying array to be **larger** than the number of items stored (to minimize collisions). This wastes memory by design.

**TreeSet** uses only the nodes it needs — no wasted slots. This makes it the **most memory-efficient** option.

However, `LinkedHashSet` uses the **most** memory overall because it has both the hash table overhead **and** the doubly linked list.

---

## Concept 5: When to Use What

| Situation | Best Choice |
|-----------|-------------|
| Need fastest operations, order doesn't matter | **HashSet** |
| Need to preserve insertion order | **LinkedHashSet** |
| Need elements in sorted order | **TreeSet** |
| Need range operations (headSet, tailSet) | **TreeSet** |
| Memory is constrained | **TreeSet** |

---

## ✅ Key Takeaways

- All three sets mirror their map counterparts — HashSet↔HashMap, LinkedHashSet↔LinkedHashMap, TreeSet↔TreeMap
- HashSet is the **default choice** — fastest on average with O(1)
- LinkedHashSet adds insertion order at the cost of more memory
- TreeSet sorts elements but is slower (O(log n))
- Modern Java's collision handling gives hash-based sets O(log n) worst case

## ⚠️ Common Mistakes

- Using TreeSet when you don't need sorted order — you're paying O(log n) for no benefit
- Forgetting that TreeSet cannot store null values

## 💡 Pro Tips

- The comparison between sets is nearly identical to the comparison between maps — if you understand one, you understand the other
- HashSet is the most commonly used set implementation in practice
