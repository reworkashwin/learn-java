# 📘 Task Scheduling Using PriorityQueue

## 📌 Introduction

Imagine you have a list of tasks, each with a different priority level. You want to make sure the most urgent task always gets executed first — regardless of when it was added. A regular `Queue` processes elements in FIFO order (first in, first out), but that's not what we need here. We need a queue that's **priority-aware**.

That's exactly what `PriorityQueue` gives us. In this section, we build a **task scheduling application** that lets users add tasks with priorities and then processes them in priority order — highest priority first.

---

## 🧩 Concept 1: Quick Recap — What is PriorityQueue?

### 🧠 What is it?

`PriorityQueue` is a queue where elements are **not** processed in the order they were added. Instead, they're processed based on their **priority**.

Under the hood, Java's `PriorityQueue` is implemented using a **min-heap**:
- The element with the **smallest** value is always at the head of the queue
- By default, elements are ordered using their **natural ordering** (numbers: ascending, strings: alphabetical)
- You can define a custom order using a `Comparator`

### ❓ Why do we need it?

Consider these tasks:

| Task   | Priority |
|--------|----------|
| Task A | 3 (Low)  |
| Task B | 1 (High) |
| Task C | 2 (Medium) |

If you add them in order A → B → C, a regular queue would process A first. But a `PriorityQueue` processes **Task B first** (priority 1), then Task C (priority 2), then Task A (priority 3).

This is exactly how real scheduling systems work — operating system task schedulers, print queues, hospital triage systems.

---

## 🧩 Concept 2: Creating the Task Class

### 🧠 What is it?

Since each task has a **name** and a **priority**, we need a custom class to hold both. And because `PriorityQueue` needs to compare elements to determine ordering, our `Task` class must implement the `Comparable` interface.

### ⚙️ How it works

```java
class Task implements Comparable<Task> {
    private String name;
    private int priority;

    public Task(String name, int priority) {
        this.name = name;
        this.priority = priority;
    }

    public String getName() {
        return name;
    }

    public int getPriority() {
        return priority;
    }

    @Override
    public int compareTo(Task other) {
        return Integer.compare(this.priority, other.priority);
    }

    @Override
    public String toString() {
        return "Task: " + name + " | Priority: " + priority;
    }
}
```

### 💡 Insight — How `compareTo` Drives the Ordering

The `compareTo` method is the **heart** of priority ordering:

```java
return Integer.compare(this.priority, other.priority);
```

- If `this.priority < other.priority` → returns negative → `this` comes **first**
- If `this.priority > other.priority` → returns positive → `other` comes **first**
- If equal → returns 0

Since `PriorityQueue` is a **min-heap**, the task with the **lowest priority number** rises to the top. This means **lower number = higher priority** — just like real-world priority systems (Priority 1 = Critical, Priority 5 = Low).

> If you wanted the **highest** number to be highest priority instead, you'd reverse the comparison: `Integer.compare(other.priority, this.priority)`.

---

## 🧩 Concept 3: Building the Scheduling Application

### ⚙️ How it works

The application flow is:

1. Create a `PriorityQueue<Task>`
2. Loop: ask user for task name and priority
3. Add each task to the queue
4. Ask if they want to add more
5. When done, drain the queue — tasks come out in priority order

```java
import java.util.PriorityQueue;
import java.util.Scanner;

public class TaskScheduling {
    public static void main(String[] args) {
        PriorityQueue<Task> taskQueue = new PriorityQueue<>();
        Scanner sc = new Scanner(System.in);
        boolean keepGoing = true;

        while (keepGoing) {
            System.out.print("Enter task name: ");
            String taskName = sc.nextLine();

            System.out.print("Enter task priority (lower number = higher priority): ");
            int taskPriority = sc.nextInt();
            sc.nextLine(); // consume newline

            taskQueue.add(new Task(taskName, taskPriority));

            System.out.print("Do you want to add another task? (yes/no): ");
            String response = sc.nextLine();
            if (response.equalsIgnoreCase("no")) {
                keepGoing = false;
            }
        }

        System.out.println("\nScheduled tasks in order of priority:");
        while (!taskQueue.isEmpty()) {
            System.out.println(taskQueue.poll());
        }

        sc.close();
    }
}
```

### 🧪 Example Run

```
Enter task name: Task A
Enter task priority (lower number = higher priority): 3
Do you want to add another task? (yes/no): yes

Enter task name: Task B
Enter task priority (lower number = higher priority): 1
Do you want to add another task? (yes/no): yes

Enter task name: Task C
Enter task priority (lower number = higher priority): 2
Do you want to add another task? (yes/no): no

Scheduled tasks in order of priority:
Task: Task B | Priority: 1
Task: Task C | Priority: 2
Task: Task A | Priority: 3
```

Even though Task A was added first, **Task B gets processed first** because it has the highest priority (lowest number).

---

## 🧩 Concept 4: How `poll()` Works Under the Hood

### 🧠 What is it?

When we call `taskQueue.poll()`, it:
1. **Retrieves** the head element (the one with the lowest priority number)
2. **Removes** it from the queue
3. **Re-heapifies** the internal min-heap so the next-lowest is now at the head

### 💡 Insight

This is why we drain the queue in a `while (!taskQueue.isEmpty())` loop — each `poll()` gives us the next most important task, and eventually the queue is empty. The time complexity of each `poll()` is O(log n) because the heap needs to restructure itself.

If you only wanted to **peek** at the highest-priority task without removing it, you'd use `peek()` instead.

---

## 🧩 Concept 5: Comparable vs Comparator — Two Ways to Define Priority

### 🧠 What's the difference?

In our example, we used `Comparable` — the `Task` class itself defines its natural ordering via `compareTo`. But there's another approach: passing a `Comparator` to the `PriorityQueue` constructor.

```java
// Using Comparator (no need for Task to implement Comparable)
PriorityQueue<Task> taskQueue = new PriorityQueue<>(
    (t1, t2) -> Integer.compare(t1.getPriority(), t2.getPriority())
);
```

### ❓ When to use which?

| Approach | Use when... |
|----------|-------------|
| `Comparable` | The class has **one natural ordering** that makes sense everywhere |
| `Comparator` | You need **different orderings** in different contexts (e.g., sort by priority in one place, by name in another) |

---

## ✅ Key Takeaways

- **`PriorityQueue` is a min-heap** — the element with the smallest value is always served first
- **Implement `Comparable`** on your custom class to define how tasks are compared
- **Lower priority number = higher priority** in the default min-heap ordering
- **`poll()`** retrieves and removes the highest-priority element; **`peek()`** only looks at it
- **`sc.nextLine()` after `sc.nextInt()`** — always consume the leftover newline to avoid input issues

## ⚠️ Common Mistakes

- Thinking `PriorityQueue` maintains sorted order internally — it doesn't. Only the **head** is guaranteed to be the minimum. If you iterate with a for-each loop, the order is **not** guaranteed to be sorted
- Forgetting to implement `Comparable` or pass a `Comparator` — you'll get a `ClassCastException` at runtime
- Confusing `poll()` (removes) with `peek()` (doesn't remove)
- Assuming higher numbers mean higher priority — by default, it's the opposite

## 💡 Pro Tips

- For a more realistic scheduler, add a **timestamp** field and break priority ties by "earliest added first"
- You can extend this with a `ScheduledExecutorService` to actually **execute** tasks at scheduled times
- In real-world systems, priority queues power everything from **Dijkstra's shortest path algorithm** to **OS process scheduling**
- If you need thread-safe priority scheduling, use `PriorityBlockingQueue` from `java.util.concurrent`
