# 📘 Managing a To-Do List with List Implementation

## 📌 Introduction

So far we've explored how `List` implementations work — `ArrayList`, `LinkedList`, `Vector`, and their internal mechanics. But what does it actually look like to **build something real** with them?

In this section, we put theory into practice by building an **interactive To-Do List application** using `ArrayList`. This is a hands-on exercise that ties together list operations like adding, removing, accessing by index, and updating elements — all within a real, runnable program.

Why does this matter? Because understanding `.add()`, `.remove()`, and `.set()` in isolation is one thing — wiring them together into a working app is where true understanding kicks in.

---

## 🧩 Concept 1: Why Use a List for a To-Do App?

### 🧠 What is it?

A to-do list is fundamentally an **ordered collection of tasks** where:
- Tasks are added over time
- Tasks can be removed when done
- Tasks can be marked as completed
- The order of tasks matters (you want to see them in the order you added them)

### ❓ Why do we need it?

This maps perfectly to the `List` interface because:

1. **Dynamic growth** — You don't know upfront how many tasks the user will add. `ArrayList` grows automatically.
2. **Index-based access** — You want to refer to tasks by number ("remove task #2"), and `ArrayList` gives O(1) access by index.
3. **Easy manipulation** — Adding to the end, removing by position, and updating in-place are all first-class operations on a `List`.

### 💡 Insight

If your app needed frequent insertions/deletions **in the middle** of the list, you could swap `ArrayList` for `LinkedList` without changing any other code — that's the power of programming to the `List` interface rather than a concrete class.

---

## 🧩 Concept 2: Setting Up the Application Structure

### 🧠 What is it?

The application follows a classic **REPL (Read-Eval-Print Loop)** pattern:
1. Display current tasks
2. Show a menu of options
3. Read the user's choice
4. Execute the chosen operation
5. Repeat until the user exits

### ⚙️ How it works

We need three foundational pieces:

```java
import java.util.List;
import java.util.ArrayList;
import java.util.Scanner;
```

```java
// 1. A collection to store tasks
List<String> toDoList = new ArrayList<>();

// 2. A scanner to read user input
Scanner sc = new Scanner(System.in);

// 3. A flag to control the loop
boolean running = true;
```

The `boolean running` flag is key — it keeps the `while` loop alive until the user explicitly chooses to exit.

### 💡 Insight

Notice we declare the variable as `List<String>` (the interface), not `ArrayList<String>`. This is a best practice — if you later want to switch to `LinkedList`, you only change the `new` statement, not every reference to the variable.

---

## 🧩 Concept 3: Displaying the Current To-Do List

### ⚙️ How it works

Every time the loop iterates, we print the current state of the list:

```java
System.out.println("\nCurrent To-Do List:");
if (toDoList.isEmpty()) {
    System.out.println("No tasks added yet.");
} else {
    for (int i = 0; i < toDoList.size(); i++) {
        System.out.println((i + 1) + ". " + toDoList.get(i));
    }
}
```

### 💡 Insight

We print `(i + 1)` instead of `i` because users think in 1-based numbering ("task 1, task 2..."), but `ArrayList` uses 0-based indexing internally. This offset comes up again when we remove or mark tasks — always remember to do `index - 1` when converting user input to a list index.

---

## 🧩 Concept 4: The Interactive Menu

### ⚙️ How it works

After displaying tasks, we present four options and read the user's choice:

```java
System.out.println("\nWhat would you like to do?");
System.out.println("1. Add a new task");
System.out.println("2. Remove a task");
System.out.println("3. Mark a task as complete");
System.out.println("4. Exit");
System.out.print("Enter your choice: ");

int choice = sc.nextInt();
sc.nextLine(); // consume the leftover newline character
```

The `switch` block then routes to the appropriate operation:

```java
switch (choice) {
    case 1: // Add task
    case 2: // Remove task
    case 3: // Mark complete
    case 4: // Exit
    default: System.out.println("Invalid choice. Please try again.");
}
```

### ⚠️ Important: `sc.nextLine()` after `sc.nextInt()`

When the user types `1` and presses Enter, `nextInt()` reads the `1` but **leaves the newline character `\n` in the buffer**. If you don't consume it with `sc.nextLine()`, the next call to `sc.nextLine()` (when reading a task name) will pick up that leftover newline and appear to "skip" the input. This is one of the most common Java `Scanner` pitfalls.

---

## 🧩 Concept 5: Adding a Task

### ⚙️ How it works

```java
case 1:
    System.out.print("Enter the task you want to add: ");
    String newTask = sc.nextLine();
    toDoList.add(newTask);
    System.out.println("Task added successfully!");
    break;
```

This uses `List.add(element)` which appends the task at the **end** of the list — O(1) amortized for `ArrayList`.

---

## 🧩 Concept 6: Removing a Task

### ⚙️ How it works

```java
case 2:
    if (!toDoList.isEmpty()) {
        System.out.print("Enter the task number to remove: ");
        int removeIndex = sc.nextInt();
        if (removeIndex > 0 && removeIndex <= toDoList.size()) {
            toDoList.remove(removeIndex - 1);
            System.out.println("Task removed successfully!");
        } else {
            System.out.println("Invalid task number.");
        }
    } else {
        System.out.println("No tasks to remove.");
    }
    break;
```

### 💡 Insight

Two important things here:

1. **Guard clause** — We first check `isEmpty()` before prompting for a number. No point asking "which task to remove?" if the list is empty.
2. **Bounds validation** — `removeIndex > 0 && removeIndex <= toDoList.size()` ensures the user can't crash the app with an out-of-range number.
3. **Index offset** — `remove(removeIndex - 1)` converts from the user's 1-based numbering back to 0-based indexing.

---

## 🧩 Concept 7: Marking a Task as Completed

### 🧠 What is it?

Instead of removing a completed task, we **update it in-place** by appending " - Completed" to its text. This uses `List.get()` to read and `List.set()` to write.

### ⚙️ How it works

```java
case 3:
    if (!toDoList.isEmpty()) {
        System.out.print("Enter the task number to mark as complete: ");
        int completeIndex = sc.nextInt();
        if (completeIndex > 0 && completeIndex <= toDoList.size()) {
            String completedTask = toDoList.get(completeIndex - 1) + " - Completed";
            toDoList.set(completeIndex - 1, completedTask);
            System.out.println("Task marked as complete!");
        } else {
            System.out.println("Invalid task number.");
        }
    } else {
        System.out.println("No tasks to mark as complete.");
    }
    break;
```

### 💡 Insight

`List.set(index, element)` is the **replace** operation — it puts the new value at the given index and returns the old value. This is an O(1) operation on `ArrayList` since it directly accesses the underlying array by index.

---

## 🧩 Concept 8: Exiting the Application

### ⚙️ How it works

```java
case 4:
    running = false;
    System.out.println("Exiting the To-Do List application. Goodbye!");
    break;
```

Setting `running = false` causes the `while (running)` loop to terminate on the next condition check. After the loop, we close the scanner:

```java
sc.close();
```

### 💡 Insight

Closing the `Scanner` is a **best practice** for resource management. While your program will technically work without it, leaving resources open is a bad habit — especially in larger applications where unclosed streams can lead to resource leaks.

---

## 🧩 Complete Application Flow

Here's how the full interaction looks:

```
Welcome to the To-Do List Application!

Current To-Do List:
No tasks added yet.

What would you like to do?
1. Add a new task
2. Remove a task
3. Mark a task as complete
4. Exit
Enter your choice: 1
Enter the task you want to add: Buy groceries
Task added successfully!

Current To-Do List:
1. Buy groceries

Enter your choice: 1
Enter the task you want to add: Read chapter 5
Task added successfully!

Current To-Do List:
1. Buy groceries
2. Read chapter 5

Enter your choice: 3
Enter the task number to mark as complete: 1
Task marked as complete!

Current To-Do List:
1. Buy groceries - Completed
2. Read chapter 5

Enter your choice: 2
Enter the task number to remove: 1
Task removed successfully!

Current To-Do List:
1. Read chapter 5

Enter your choice: 4
Exiting the To-Do List application. Goodbye!
```

---

## ✅ Key Takeaways

- **`ArrayList` is ideal for to-do lists** — dynamic sizing, fast index access, simple add/remove operations
- **Program to the interface** (`List<String>`) — makes it easy to swap implementations later
- **Always validate user input** — check for empty lists and valid index ranges before acting
- **`sc.nextLine()` after `sc.nextInt()`** — consume the leftover newline or your next string read will break
- **`List.set()`** allows in-place updates — perfect for marking tasks without removing and re-adding them

## ⚠️ Common Mistakes

- Forgetting the `sc.nextLine()` call after `nextInt()`, causing input to be skipped
- Using 0-based indexing in the user interface — users expect tasks numbered from 1
- Not checking `isEmpty()` before prompting for task numbers — leads to confusing UX
- Calling `list.remove(1)` thinking it removes the element `1` — it removes the element **at index 1** (the second element)

## 💡 Pro Tips

- You could extend this app with **task priorities** by storing `Task` objects instead of plain strings
- Switching to `LinkedList` would improve performance if your app frequently inserts/removes tasks in the middle
- For a production app, consider persisting tasks to a file so they survive between runs
- The same REPL pattern (loop → display → menu → action) is the foundation of countless CLI applications
