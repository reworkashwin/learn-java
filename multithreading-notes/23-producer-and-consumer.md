# Producer and Consumer Pattern

## Introduction

The **Producer-Consumer** pattern is one of the most fundamental concurrency patterns in software engineering. One thread produces data and places it in a shared buffer; another thread consumes data from that buffer. The challenge? Coordinating the two so the consumer doesn't try to take from an empty buffer and the producer doesn't overfill it. Let's build this pattern from scratch using `synchronized`, `wait()`, and `notify()`.

---

## Concept 1: The Shared Buffer

### 🧠 What is it?

The shared buffer is the data structure that sits between the producer and consumer. It acts as a fixed-capacity queue — the producer adds items, the consumer removes them.

### ⚙️ Implementation

```java
class SharedBuffer {
    private List<Integer> buffer = new LinkedList<>();
    private int capacity = 5;
}
```

The `LinkedList` is a good choice here because removing the first element (`remove(0)`) is an O(1) operation for linked lists.

---

## Concept 2: The `produce()` Method

### 🧠 What does it do?

The producer checks if the buffer is full. If it is, the producer **waits** until the consumer removes items. If the buffer has space, the producer fills it up and **notifies** the consumer.

### ⚙️ Implementation

```java
public synchronized void produce() throws InterruptedException {
    while (buffer.size() == capacity) {
        System.out.println("Buffer is full, producer is waiting...");
        wait();  // release lock, wait for consumer to make space
    }
    
    System.out.println("Producing items...");
    for (int i = 0; i < capacity; i++) {
        buffer.add(i);
        System.out.println("Produced: " + i);
    }
    
    notify();  // wake up the consumer
}
```

### ❓ Why `wait()` here?

When the buffer is full (`size == capacity`), the producer has nothing useful to do. Instead of spinning in a busy loop wasting CPU, `wait()` releases the lock and puts the thread to sleep. It's like saying: *"I can't proceed — wake me when there's room."*

### ❓ Why `notify()` at the end?

After filling the buffer, the producer signals the consumer: *"Data is ready — your turn."*

---

## Concept 3: The `consume()` Method

### 🧠 What does it do?

The consumer checks if the buffer has items. If it's not full yet (producer is still adding), the consumer **waits**. Once items are available, the consumer removes them one by one and **notifies** the producer.

### ⚙️ Implementation

```java
public synchronized void consume() throws InterruptedException {
    while (buffer.size() < capacity) {
        System.out.println("Buffer not full yet, consumer waiting...");
        wait();  // release lock, wait for producer to fill buffer
    }
    
    while (!buffer.isEmpty()) {
        int item = buffer.remove(0);
        System.out.println("Consumed: " + item);
        Thread.sleep(300);
    }
    
    notify();  // wake up the producer
}
```

---

## Concept 4: The Producer and Consumer Threads

### ⚙️ Implementation

```java
class Producer implements Runnable {
    private SharedBuffer sharedBuffer;
    
    public Producer(SharedBuffer sharedBuffer) {
        this.sharedBuffer = sharedBuffer;
    }
    
    @Override
    public void run() {
        try {
            while (true) {
                sharedBuffer.produce();
                Thread.sleep(500);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

class Consumer implements Runnable {
    private SharedBuffer sharedBuffer;
    
    public Consumer(SharedBuffer sharedBuffer) {
        this.sharedBuffer = sharedBuffer;
    }
    
    @Override
    public void run() {
        try {
            while (true) {
                sharedBuffer.consume();
                Thread.sleep(500);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 🧪 Putting it all together

```java
SharedBuffer sharedBuffer = new SharedBuffer();

Thread t1 = new Thread(new Producer(sharedBuffer));
Thread t2 = new Thread(new Consumer(sharedBuffer));

t1.start();
t2.start();
```

### ⚙️ Output

```
Producing items...
Produced: 0
Produced: 1
Produced: 2
Produced: 3
Produced: 4
Consumed: 0
Consumed: 1
Consumed: 2
Consumed: 3
Consumed: 4
Producing items...
Produced: 0
...
```

The producer fills the buffer with 5 items, then the consumer removes all 5, then the producer fills again — an endless cycle of cooperation.

---

## Concept 5: The Flow Visualized

```
Producer                    Buffer                    Consumer
   |                    [  empty  ]                      |
   |--- add 0,1,2,3,4 ---->[ 0 1 2 3 4 ]                |
   |--- notify() --------->                              |
   |--- wait() (full) ----> (releases lock)              |
   |                    [ 0 1 2 3 4 ] <---- remove ------|
   |                    [  empty  ]  ---- notify() ----->|
   |<--- (wakes up) ------                               |
   |--- add 0,1,2,3,4 ---->[ 0 1 2 3 4 ]                |
   ...
```

The key insight: `wait()` says *"I can't proceed, wake me when ready"* and releases the lock immediately. `notify()` says *"You can wake up now"* but finishes its own work before actually releasing the lock.

---

## Key Takeaways

- ✅ The producer-consumer pattern uses a shared buffer with `wait()`/`notify()` for coordination
- ✅ The producer **waits** when the buffer is full and **notifies** after adding items
- ✅ The consumer **waits** when the buffer is empty/not ready and **notifies** after removing items
- ✅ `LinkedList` is efficient for this pattern — O(1) removal from the front
- ⚠️ Both `produce()` and `consume()` must be `synchronized` on the same object for `wait()`/`notify()` to work
- 💡 This implementation works for two threads but has fairness issues with multiple producers/consumers — `ReentrantLock` addresses this
