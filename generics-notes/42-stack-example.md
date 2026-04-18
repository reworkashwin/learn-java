# Stack Example

## Introduction

A **stack** is one of the simplest and most powerful data structures in computer science. It follows one rule: **Last-In, First-Out (LIFO)**. The last element you add is the first one you get back. Think of a stack of plates — you always take the top plate. Stacks are everywhere: undo operations, browser back buttons, function call tracking, and expression parsing.

---

## Concept 1: What Is a Stack?

### 🧠 What is it?

A stack is a linear data structure with two primary operations:
- **push** — add an element to the top
- **pop** — remove and return the top element

Additional operations:
- **peek** — look at the top element without removing it
- **isEmpty** — check if the stack is empty

### 🧪 Real-world analogy

Imagine a stack of books on your desk:
- You **push** a new book on top
- You can only **pop** (take) the book from the top
- You can **peek** at the title of the top book without removing it
- You can never access a book in the middle directly

---

## Concept 2: Stack in Java — The Legacy `Stack` Class

### ⚙️ How it works

Java has a `Stack<E>` class in `java.util`:

```java
import java.util.Stack;

Stack<String> stack = new Stack<>();

// Push elements
stack.push("First");
stack.push("Second");
stack.push("Third");

System.out.println(stack); // [First, Second, Third]

// Peek — view top without removing
System.out.println(stack.peek()); // Third

// Pop — remove and return top
String top = stack.pop();
System.out.println(top);   // Third
System.out.println(stack); // [First, Second]

// Check if empty
System.out.println(stack.isEmpty()); // false

// Size
System.out.println(stack.size()); // 2
```

### ⚠️ Important note

`Stack` extends `Vector`, which is **synchronized** (thread-safe) and therefore slower for single-threaded use. In modern Java, `ArrayDeque` is the **recommended alternative** for stack behavior.

---

## Concept 3: Modern Alternative — ArrayDeque as a Stack

### ⚙️ How it works

```java
import java.util.ArrayDeque;
import java.util.Deque;

Deque<String> stack = new ArrayDeque<>();

stack.push("First");
stack.push("Second");
stack.push("Third");

System.out.println(stack.peek()); // Third
System.out.println(stack.pop());  // Third
System.out.println(stack.pop());  // Second
```

### 💡 Insight

`ArrayDeque` is faster than `Stack` because:
- No synchronization overhead
- Array-based (better cache locality)
- The Java docs explicitly say: "This class is likely to be faster than `Stack` when used as a stack"

---

## Concept 4: Practical Example — Reversing a String

### 🧪 Example

Stacks naturally reverse order — LIFO means "first in, last out":

```java
public static String reverse(String input) {
    Deque<Character> stack = new ArrayDeque<>();

    // Push each character
    for (char c : input.toCharArray()) {
        stack.push(c);
    }

    // Pop all characters — they come out reversed
    StringBuilder result = new StringBuilder();
    while (!stack.isEmpty()) {
        result.append(stack.pop());
    }

    return result.toString();
}

System.out.println(reverse("Hello")); // olleH
```

---

## Concept 5: Practical Example — Checking Balanced Parentheses

### 🧪 Example

One of the classic stack problems:

```java
public static boolean isBalanced(String expression) {
    Deque<Character> stack = new ArrayDeque<>();

    for (char c : expression.toCharArray()) {
        if (c == '(' || c == '{' || c == '[') {
            stack.push(c);
        } else if (c == ')' || c == '}' || c == ']') {
            if (stack.isEmpty()) return false;
            char open = stack.pop();
            if (!matches(open, c)) return false;
        }
    }

    return stack.isEmpty(); // all opened brackets must be closed
}

private static boolean matches(char open, char close) {
    return (open == '(' && close == ')') ||
           (open == '{' && close == '}') ||
           (open == '[' && close == ']');
}
```

```java
System.out.println(isBalanced("({[]})")); // true
System.out.println(isBalanced("({[}])"));  // false
System.out.println(isBalanced("(("));      // false
```

---

## ✅ Key Takeaways

- A stack is a LIFO data structure: last in, first out
- Core operations: `push`, `pop`, `peek`, `isEmpty`
- Java's `Stack` class works but is considered legacy — prefer `ArrayDeque`
- Common uses: undo/redo, expression parsing, DFS (depth-first search), call stack simulation
- All operations are O(1) — stacks are very efficient

## ⚠️ Common Mistakes

- Calling `pop()` or `peek()` on an empty stack → throws `EmptyStackException` or `NoSuchElementException`
- Using `Stack` class in new code — use `ArrayDeque` instead
- Forgetting that `Stack` extends `Vector` and allows random access (`get(index)`) — this breaks the stack abstraction
