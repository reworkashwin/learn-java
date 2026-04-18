# Methods of the Collections Class

## Introduction

Java provides a utility class called `Collections` (note: not the `Collection` interface) that contains **static helper methods** for working with collections. These methods handle common operations like sorting, shuffling, reversing, and replacing — so you don't have to implement them from scratch.

---

## Concept 1: The Collections Utility Class

### 🧠 What is it?

`Collections` is a class full of **static methods** that operate on or return collections. Think of it as a toolbox — you don't instantiate it, you just call its methods directly.

Key methods we'll cover:
- `sort()` — Sort a list
- `reverse()` — Reverse the order
- `shuffle()` — Randomly permutate
- `min()` / `max()` — Find smallest/largest elements
- `rotate()` — Shift elements by a distance
- `replaceAll()` — Replace all occurrences of a value

---

## Concept 2: Reverse

### ⚙️ How it works

```java
List<Integer> nums = new ArrayList<>(Arrays.asList(1, 10, 5, 8, 2, 3));

System.out.println(nums);        // [1, 10, 5, 8, 2, 3]

Collections.reverse(nums);

System.out.println(nums);        // [3, 2, 8, 5, 10, 1]
```

`reverse()` flips the list in-place — the first element becomes the last and vice versa.

---

## Concept 3: Min and Max

### ⚙️ Finding extremes

```java
System.out.println(Collections.min(nums));  // 1
System.out.println(Collections.max(nums));  // 10
```

No need to write a loop to find the minimum or maximum — `Collections` does it for you.

---

## Concept 4: Shuffle

### 🧠 What is it?

`shuffle()` randomly reorders the elements in a list. Every time you call it, you get a different permutation.

```java
Collections.shuffle(nums);

System.out.println(nums);  // [8, 1, 3, 10, 2, 5]  (random each time)
```

### 💡 When is this useful?

- Card games (shuffling a deck)
- Randomized testing
- Implementing randomized algorithms (e.g., Bogosort)

Under the hood, Java uses the **Fisher-Yates shuffle algorithm** — an efficient O(n) algorithm for random permutation.

---

## Concept 5: Rotate

### ⚙️ How it works

`rotate()` shifts all elements by a specified distance. Elements that "fall off" one end wrap around to the other.

```java
List<Integer> nums = new ArrayList<>(Arrays.asList(1, 10, 5, 8, 2, 3));

Collections.rotate(nums, 1);
System.out.println(nums);  // [3, 1, 10, 5, 8, 2]
```

With distance **1**: the last element (3) moves to the front, and everything else shifts right by one position.

```java
Collections.rotate(nums, 2);
// [2, 3, 1, 10, 5, 8]  — shifted by 2 positions
```

If the distance equals the list size, you get back the original list (full rotation).

---

## Concept 6: Replace All

### ⚙️ How it works

`replaceAll()` swaps every occurrence of a specific value with a new one:

```java
List<Integer> nums = new ArrayList<>(Arrays.asList(1, 10, 5, 8, 2, 1));

Collections.replaceAll(nums, 1, 10);

System.out.println(nums);  // [10, 10, 5, 8, 2, 10]
```

Both instances of `1` have been replaced with `10`. Writing an efficient replace algorithm from scratch is non-trivial — this method handles it cleanly.

---

## ✅ Key Takeaways

- `Collections` is a **utility class** with static methods — don't confuse it with the `Collection` interface
- `reverse()` — flips list order in-place
- `min()` / `max()` — finds smallest/largest element
- `shuffle()` — randomly reorders elements (Fisher-Yates algorithm)
- `rotate()` — circular shift by a specified distance
- `replaceAll()` — replaces all occurrences of a value
- These methods only work with **List** types (not Set or Map)

## ⚠️ Common Mistakes

- Confusing `Collections` (utility class) with `Collection` (interface) — they are different things
- Trying to use these methods on arrays — they work on `List`, not arrays. Use `Arrays.sort()` for arrays.
- Forgetting that `shuffle()` modifies the list in-place — if you need the original order preserved, make a copy first

## 💡 Pro Tips

- `Collections.sort()` is equivalent to `list.sort()` in modern Java
- There are many more useful methods: `frequency()`, `disjoint()`, `unmodifiableList()`, `synchronizedList()` — worth exploring
- `Collections.singletonList()` and `Collections.emptyList()` are useful for creating immutable single-element or empty lists
