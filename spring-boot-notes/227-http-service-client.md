# HTTP Service Client — Declarative REST API Consumption

## Introduction

We just learned how to consume REST APIs using `RestClient`, where we had to write every line of code — calling `.get()`, `.uri()`, `.retrieve()`, `.body()` ourselves. It works, but it's a lot of boilerplate.

What if you could just **declare** what your REST API calls should look like, and let the framework handle the rest? That's exactly what **HTTP Service Client** does. Think of it like **Spring Data JPA for REST APIs** — you define the interface, and the framework generates the implementation.

---

## The Spring Data JPA Analogy

### 🧠 Why This Comparison Matters

Remember how Spring Data JPA works? You define a `Repository` interface with method signatures, and the framework automatically generates SQL queries and execution logic. You never write a single line of SQL.

**HTTP Service Client works the same way:**
- You define an **interface** with abstract methods
- Each method describes a REST API call — the HTTP method, path, parameters, and return type
- The framework **generates the REST invocation code** at runtime using `RestClient` behind the scenes

---

## Step 1: Define the Service Interface

### ⚙️ Creating the Interface

```java
@HttpExchange(url = "https://jsonplaceholder.typicode.com/todos")
public interface TodoService {

    @GetExchange
    List<TodoDto> findAll();

    @GetExchange("/{id}")
    TodoDto findById(@PathVariable int id);

    @PostExchange
    TodoDto create(@RequestBody TodoDto todo);

    @PutExchange("/{id}")
    TodoDto update(@PathVariable int id, @RequestBody TodoDto todo);

    @DeleteExchange("/{id}")
    void delete(@PathVariable int id);
}
```

### 🧠 Understanding Each Part

**`@HttpExchange` on the interface:**
- Sets the **base URL** for all methods in this interface
- Equivalent to setting `baseUrl()` in `RestClient.Builder`

**Method annotations — the Exchange family:**

| When Producing (Controller) | When Consuming (HTTP Service Client) |
|----------------------------|--------------------------------------|
| `@GetMapping` | `@GetExchange` |
| `@PostMapping` | `@PostExchange` |
| `@PutMapping` | `@PutExchange` |
| `@DeleteMapping` | `@DeleteExchange` |
| `@PatchMapping` | `@PatchExchange` |

**Parameter annotations — same ones you already know:**
- `@PathVariable` — binds a method parameter to a path variable
- `@RequestBody` — sends the parameter as the request body (JSON)
- `@RequestParam` — sends the parameter as a query parameter
- `@RequestHeader` — sends the parameter as a request header

### ❓ What If You Forget `@PathVariable`?

Without `@PathVariable`, the parameter is treated as a regular method argument — **no binding happens**. The value won't be placed in the URL, and you'll get unexpected behavior.

### 📋 Sending Request Headers

```java
@DeleteExchange("/{id}")
void delete(@PathVariable int id, @RequestHeader("demo") String headerValue);
```

The caller passes the header value when invoking the method — the framework sends it automatically.

---

## Step 2: Configure the Interface

### ⚙️ The Configuration Class

```java
@Configuration
@ImportHttpServices(types = TodoService.class)
public class HttpServiceClientConfig {
}
```

**What does `@ImportHttpServices` do?**
- It tells Spring to **create a bean** of the specified interface
- Behind the scenes, it injects a `RestClient` into that bean
- The framework generates the actual REST invocation code based on your interface methods

> Without `@ImportHttpServices`, no bean is created and you'll get dependency injection errors.

---

## Step 3: Use It in Your Controller

### ⚙️ Switching from RestClient to HTTP Service Client

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("api/todos")
public class TodoController {

    private final TodoService todoService;

    @GetMapping
    public List<TodoDto> findAll() {
        return todoService.findAll();
    }

    @GetMapping("/{id}")
    public TodoDto findById(@PathVariable int id) {
        return todoService.findById(id);
    }

    @PostMapping
    public TodoDto create(@RequestBody TodoDto todo) {
        return todoService.create(todo);
    }

    @PutMapping("/{id}")
    public TodoDto update(@PathVariable int id, @RequestBody TodoDto todo) {
        return todoService.update(id, todo);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        todoService.delete(id);
    }
}
```

Notice how clean this is — just call `todoService.findAll()` instead of writing all the RestClient boilerplate!

---

## RestClient vs HTTP Service Client

| Feature | RestClient | HTTP Service Client |
|---------|-----------|-------------------|
| Code style | Imperative (you write the logic) | Declarative (you define the contract) |
| Boilerplate | More code | Minimal code |
| Control | Full control over every step | Framework handles invocation |
| Best for | Complex/unusual API scenarios | Standard REST API calls |
| Under the hood | Direct usage | Uses RestClient internally |

### 💡 Which One Should You Use?

> **Always prefer HTTP Service Client.** It's cleaner, easier to maintain, and handles most scenarios. Only fall back to RestClient when you need fine-grained control that the declarative approach can't provide.

---

## ✅ Key Takeaways

- HTTP Service Client = **declarative** REST consumption (define interface, framework generates logic)
- Use `@HttpExchange` on the interface and `@GetExchange`, `@PostExchange`, etc. on methods
- Same parameter annotations: `@PathVariable`, `@RequestBody`, `@RequestParam`, `@RequestHeader`
- Register interfaces using `@ImportHttpServices` in a `@Configuration` class
- Under the hood, it uses `RestClient` — you get the same behavior with less code

## ⚠️ Common Mistakes

- Forgetting `@ImportHttpServices` — the bean won't be created
- Forgetting `@PathVariable` on method parameters — values won't bind to URL placeholders
- Using `@GetMapping` instead of `@GetExchange` — different annotations for producing vs consuming

## 💡 Pro Tips

- Think of it like Spring Data JPA: define the interface, let the framework do the work
- You can mix both approaches in the same project — some services use RestClient, others use HTTP Service Client
- The return type of each method tells the framework how to deserialize the response
