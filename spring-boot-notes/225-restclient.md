# RestClient — The Modern Way to Call REST APIs

## Introduction

Now that we understand the producer-consumer concept, it's time to write actual code. In this lesson, we'll build a complete **REST API consumer** using `RestClient` — from creating the bean, to performing GET, POST, PUT, and DELETE operations against a third-party API.

Think of `RestClient` as your app's personal HTTP messenger — you tell it where to go, what to send, and it handles the entire communication.

---

## Step 1: Create the DTO

### 🧠 Why Do We Need a DTO?

When you consume an external API, the response comes as JSON. You need a Java class that **mirrors the JSON structure** so Spring can automatically convert (deserialize) the JSON into a Java object.

```java
public record TodoDto(int userId, int id, String title, boolean completed) {}
```

> The field names **must match** the JSON field names exactly. If the JSON has `userId`, your record must also have `userId`.

---

## Step 2: Create and Configure the RestClient Bean

### 🧠 What Is RestClient?

`RestClient` is an **interface** — you can't instantiate it directly. You need to **build a bean** using `RestClient.Builder`.

### ⚙️ How to Create the Bean

```java
@Service
public class RestClientTodoService {

    private final RestClient restClient;

    public RestClientTodoService(RestClient.Builder builder) {
        this.restClient = builder
                .baseUrl("https://jsonplaceholder.typicode.com")
                .defaultHeader("Accept", "application/json")
                .build();
    }
}
```

**What's happening here?**

1. **`RestClient.Builder`** is injected through the constructor — Spring provides this automatically
2. **`baseUrl()`** — sets the base URL so you don't repeat it in every API call
3. **`defaultHeader()`** — adds headers that should be sent with every request
4. **`build()`** — creates the actual `RestClient` bean

### 💡 Other Configuration Options

The builder supports many more options:
- `defaultCookie()` — add cookies to every request
- `requestInterceptor()` — intercept and modify every request
- `defaultHeaders()` — set multiple headers via a consumer lambda

---

## Step 3: Performing REST Operations

### 📖 GET All Todos (findAll)

```java
private static final String TODOS_API = "todos";

public List<TodoDto> findAll() {
    return restClient.get()
            .uri(TODOS_API)
            .retrieve()
            .onStatus(status -> status.isError(),
                (request, response) -> {
                    throw new IllegalStateException("Failed to fetch todos");
                })
            .body(new ParameterizedTypeReference<>() {});
}
```

**Breaking it down step by step:**

| Step | Method | Purpose |
|------|--------|---------|
| 1 | `.get()` | Specifies HTTP GET method |
| 2 | `.uri(TODOS_API)` | Appends `todos` to the base URL |
| 3 | `.retrieve()` | Actually makes the HTTP call |
| 4 | `.onStatus()` | Checks for error status codes |
| 5 | `.body()` | Reads response body and converts JSON → Java objects |

> The `ParameterizedTypeReference<>()` helps the framework understand generic types like `List<TodoDto>`.

### 📖 GET Single Todo (findById)

```java
public TodoDto findById(int id) {
    return restClient.get()
            .uri(TODOS_API + "/{id}", id)
            .retrieve()
            .onStatus(status -> status.is4xxClientError(),
                (request, response) -> {
                    throw new IllegalStateException("Todo not found");
                })
            .body(TodoDto.class);
}
```

Key difference: the `uri()` method accepts **path variable placeholders** — `{id}` gets replaced with the actual `id` value passed as the second argument.

### ✏️ POST — Create a New Todo

```java
public TodoDto create(TodoDto todo) {
    return restClient.post()
            .uri(TODOS_API)
            .body(todo)
            .retrieve()
            .body(TodoDto.class);
}
```

- `.post()` — uses HTTP POST method
- `.body(todo)` — converts the Java object to JSON and sends it as the request payload
- Error checking is optional (skipped here for brevity)

### ✏️ PUT — Update an Existing Todo

```java
public TodoDto update(int id, TodoDto todo) {
    return restClient.put()
            .uri(TODOS_API + "/{id}", id)
            .body(todo)
            .retrieve()
            .body(TodoDto.class);
}
```

> For single-field updates, use `.patch()` instead of `.put()`.

### 🗑️ DELETE — Remove a Todo

```java
public void delete(int id) {
    restClient.delete()
            .uri(TODOS_API + "/{id}", id)
            .retrieve()
            .toBodilessEntity();
}
```

- `.toBodilessEntity()` — used when you don't expect a response body
- Returns `void` since there's nothing to read after deletion

---

## The Pattern: RestClient Fluent API

Every RestClient call follows this pattern:

```
restClient.<httpMethod>()
    .uri(<path>, <pathVariables>)
    .body(<requestPayload>)         // Only for POST, PUT, PATCH
    .retrieve()                      // Makes the actual call
    .onStatus(...)                   // Optional error handling
    .body(<ResponseType>.class)      // Read response body
```

---

## Step 4: Exposing Test Endpoints

Since we don't have real user actions triggering todo operations in our Job Portal, we create a **separate controller** to test the RestClient logic via Postman:

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("api/todos")
public class TodoController {

    private final RestClientTodoService restClientTodoService;

    @GetMapping
    public List<TodoDto> findAll() {
        return restClientTodoService.findAll();
    }

    @GetMapping("/{id}")
    public TodoDto findById(@PathVariable int id) {
        return restClientTodoService.findById(id);
    }

    @PostMapping
    public TodoDto create(@RequestBody TodoDto todo) {
        return restClientTodoService.create(todo);
    }

    @PutMapping("/{id}")
    public TodoDto update(@PathVariable int id, @RequestBody TodoDto todo) {
        return restClientTodoService.update(id, todo);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        restClientTodoService.delete(id);
    }
}
```

> Don't forget to configure **permit all** in your security config for the `/api/todos/**` path!

---

## ✅ Key Takeaways

- `RestClient` uses a **fluent API** — chain methods like `.get()`, `.uri()`, `.retrieve()`, `.body()`
- Use `RestClient.Builder` to create the bean with base URL and default headers
- HTTP method mapping: `.get()`, `.post()`, `.put()`, `.patch()`, `.delete()`
- Use `.body()` to read response; use `.toBodilessEntity()` when there's no response body
- Path variables work with placeholders: `.uri("todos/{id}", id)`

## ⚠️ Common Mistakes

- Forgetting to create the `RestClient` bean — you'll get a "no bean found" error
- Not matching DTO field names with JSON field names — deserialization will fail silently
- Forgetting to configure Spring Security permit rules for new test endpoints
- Not passing CSRF tokens for POST/PUT/DELETE requests in Postman

## 💡 Pro Tips

- Define the base URL once in the builder — avoid repeating it in every service method
- Use constants for API paths (e.g., `TODOS_API = "todos"`) to avoid typos
- The `.onStatus()` check is optional but highly recommended for production code
- You can pass **query parameters** using the `.attribute()` method on the URI builder
