# 📘 List Interface Part 2 — clear, equals, get, set

## 📌 Introduction

In the previous video, we explored a large chunk of the `List` interface methods — `add`, `remove`, `addAll`, `removeAll`, `retainAll`, `replaceAll`, `sort`, and more. Now it's time to cover the remaining essential methods: **`clear`**, **`equals`**, **`hashCode`**, **`get`**, and **`set`**.

These might seem simple on the surface, but they have important nuances — especially `equals()` and `set()` — that frequently come up in interviews and real-world debugging.

---

## 🧩 Concept 1: `clear()` — Wipe Everything

### 🧠 What is it?

The `clear()` method removes **all elements** from the list, leaving it completely empty.

### ⚙️ How it works

- It's a `void` method — it doesn't return anything.
- After calling `clear()`, `size()` returns `0` and `isEmpty()` returns `true`.

### 🧪 Example

```java
List<Integer> list = new ArrayList<>(List.of(30, 40, 30, 30));

list.clear();

System.out.println(list);          // []
System.out.println(list.isEmpty()); // true
```

### 💡 Insight

Since `clear()` returns `void`, you **cannot** use it inside `System.out.println()` — that would cause a compilation error. Call it on its own line.

---

## 🧩 Concept 2: `equals(Object o)` — Structural Equality

### 🧠 What is it?

The `equals()` method on `List` checks whether two lists are **structurally equal** — meaning they contain the same elements in the same order.

### ⚙️ How it works — the three conditions

Two lists are considered equal if **all three** conditions are met:

1. The specified object is also a `List`
2. Both lists have the **same size**
3. All corresponding elements at every position are **equal**

And one critical extra rule: **order matters**.

### 🧪 Example

```java
List<Integer> list1 = new ArrayList<>(Arrays.asList(1, 2, 3));
List<Integer> list2 = new ArrayList<>(Arrays.asList(1, 2, 3));

System.out.println(list1.equals(list2)); // true — same elements, same order

// What about different order?
List<Integer> list3 = new ArrayList<>(Arrays.asList(1, 3, 2));
System.out.println(list1.equals(list3)); // false — order matters!
```

### ❓ Does the declared type matter?

No! Even if one variable is declared as `Collection` and the other as `List`, they'll still be equal as long as the underlying objects satisfy the three conditions.

```java
Collection<Integer> col = new ArrayList<>(Arrays.asList(1, 2, 3));
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3));

System.out.println(col.equals(list)); // true
System.out.println(list.equals(col)); // true
```

Why? Because both objects are ultimately `ArrayList` instances, and `ArrayList.equals()` checks structural equality regardless of the variable's declared type.

### 💡 Insight

The `equals()` check uses the **runtime type** of the object, not the declared type of the variable. Since `ArrayList` overrides `equals()` to compare element-by-element, it works the same whether your variable is typed as `Collection`, `List`, or `ArrayList`.

---

## 🧩 Concept 3: `hashCode()` — Element-Based Hashing

### 🧠 What is it?

Returns an `int` hash code value computed from the list's elements. It's inherited from `Collection` and works the same way.

### ⚙️ How it works

Lists with the **same elements in the same order** produce the **same hash code**. Different elements produce different hash codes.

### 🧪 Example

```java
List<Integer> a = new ArrayList<>(List.of(3, 4));
List<Integer> b = new ArrayList<>(List.of(3, 4));

System.out.println(a.hashCode()); // 1058
System.out.println(b.hashCode()); // 1058 — same elements, same hash

List<Integer> c = new ArrayList<>(List.of(5, 8));
System.out.println(c.hashCode()); // different value
```

### 💡 Insight

The contract between `equals()` and `hashCode()` is: if two objects are equal, they **must** have the same hash code. This is why lists with identical contents always produce matching hash codes.

---

## 🧩 Concept 4: `get(int index)` — Access by Position

### 🧠 What is it?

Returns the element at the specified index in the list. This is the primary way to access individual elements by position.

### ⚙️ How it works

- Uses **zero-based indexing** (first element is at index `0`).
- Throws `IndexOutOfBoundsException` if the index is out of range.

### 🧪 Example

```java
List<Integer> list = new ArrayList<>(Arrays.asList(1, 3, 2));

System.out.println(list.get(0)); // 1
System.out.println(list.get(1)); // 3
System.out.println(list.get(2)); // 2
```

### 💡 Insight

`get()` is an **O(1)** operation on `ArrayList` (direct array access), but **O(n)** on `LinkedList` (must traverse from head). Choose your implementation wisely based on how often you need random access.

---

## 🧩 Concept 5: `set(int index, E element)` — Replace in Place

### 🧠 What is it?

Replaces the element at the specified index with a new element. Unlike `add()`, it **doesn't shift** other elements — it directly swaps the value at that position.

### ⚙️ How it works

- Takes two arguments: the **index** and the **new element**.
- **Returns** the element that was previously at that index (the element that got replaced).
- The list size stays the same — no elements are added or removed.

### 🧪 Example

```java
List<Integer> list = new ArrayList<>(Arrays.asList(1, 3, 2));

Integer old = list.set(1, 33);

System.out.println(old);  // 3 — the replaced element
System.out.println(list); // [1, 33, 2]
```

### 💡 Insight

The fact that `set()` **returns the old element** is often overlooked. This is useful when you need to know what was replaced — for logging, undo operations, or validation logic.

---

## ✅ Key Takeaways

- `clear()` empties the list and returns `void` — don't try to print its result.
- `equals()` on lists checks **structural equality**: same size, same elements, same order.
- The declared type (`Collection` vs `List`) doesn't affect `equals()` — it uses the runtime object's implementation.
- `hashCode()` is computed from elements — identical lists produce identical hash codes.
- `get(index)` retrieves by position; `set(index, element)` replaces by position and returns the old value.

## ⚠️ Common Mistakes

- **Forgetting that order matters in `equals()`** — `[1, 2, 3]` and `[1, 3, 2]` are NOT equal for lists (they would be for sets).
- **Ignoring the return value of `set()`** — It returns the replaced element, which can be useful.
- **Using `get()` on a `LinkedList` in a loop** — This is O(n) per access, making the loop O(n²). Use an iterator instead.

## 💡 Pro Tips

- Use `set()` when you need to update a value at a known position without changing the list size.
- If you need to compare collections regardless of order, use a `Set` — its `equals()` ignores order.
- The `hashCode()` contract guarantees equal objects have equal hash codes, but equal hash codes do NOT guarantee equal objects (hash collisions can happen).
