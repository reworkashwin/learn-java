# Consuming Posts REST APIs Using HTTP Service Client

## Introduction

In the previous lesson, we built a `TodoService` interface using the HTTP Service Client approach. Now let's reinforce the pattern by building a **second interface** — this time for the **Posts** API from JSONPlaceholder. This exercise proves just how fast and easy it is to add new REST consumers with the declarative approach.

---

## Step 1: Create the PostDto

### ⚙️ The DTO

```java
public record PostDto(int userId, int id, String title, String body) {}
```

This mirrors the JSON structure returned by the `/posts` endpoint:

```json
{
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere...",
    "body": "quia et suscipit..."
}
```

---

## Step 2: Define the PostService Interface

### ⚙️ Just Like TodoService

```java
@HttpExchange(url = "https://jsonplaceholder.typicode.com/posts")
public interface PostService {

    @GetExchange
    List<PostDto> findAll();

    @GetExchange("/{id}")
    PostDto findById(@PathVariable int id);

    @PostExchange
    PostDto create(@RequestBody PostDto post);

    @PutExchange("/{id}")
    PostDto update(@PathVariable int id, @RequestBody PostDto post);

    @DeleteExchange("/{id}")
    void delete(@PathVariable int id);
}
```

Notice how the structure is **almost identical** to `TodoService`. The only differences:
- The URL points to `/posts` instead of `/todos`
- The DTO is `PostDto` instead of `TodoDto`

> This is the beauty of the declarative approach — creating a new REST consumer is mostly copy, rename, and adjust the types.

---

## Step 3: Register in Configuration

### ⚠️ Don't Forget This Step!

```java
@Configuration
@ImportHttpServices(types = { TodoService.class, PostService.class })
public class HttpServiceClientConfig {
}
```

You must add `PostService.class` to the `@ImportHttpServices` annotation. Without this, **no bean will be created** for `PostService`, and you'll get a dependency injection error at startup.

---

## Step 4: Build the PostController

### ⚙️ The Controller

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("api/posts")
public class PostController {

    private final PostService postService;

    @GetMapping
    public List<PostDto> findAll() {
        return postService.findAll();
    }

    @GetMapping("/{id}")
    public PostDto findById(@PathVariable int id) {
        return postService.findById(id);
    }

    @PostMapping
    public PostDto create(@RequestBody PostDto post) {
        return postService.create(post);
    }

    @PutMapping("/{id}")
    public PostDto update(@PathVariable int id, @RequestBody PostDto post) {
        return postService.update(id, todo);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        postService.delete(id);
    }
}
```

### ⚠️ Common Pitfall: Wrong Request Mapping Path

Make sure `@RequestMapping` uses `"api/posts"` and **not** `"api/todos"`. Using the same path as `TodoController` will cause routing conflicts.

---

## Step 5: Update Security Configuration

Add the posts path to your public paths:

```java
// In PathsConfig
"/api/posts/**"
```

---

## Testing via Postman

| Operation | Endpoint | Result |
|-----------|----------|--------|
| Get all posts | `GET /api/posts` | Returns 100 fake posts |
| Get single post | `GET /api/posts/1` | Returns post with id 1 |
| Create post | `POST /api/posts` | Returns 201 with new post |
| Update post | `PUT /api/posts/1` | Returns updated post data |
| Delete post | `DELETE /api/posts/1` | Returns success |

> Remember to include CSRF tokens for POST, PUT, and DELETE requests.

---

## The Power of the Declarative Approach

Look at what it took to add a completely new REST consumer:
1. **DTO** — one record class
2. **Interface** — five abstract methods with annotations
3. **Config** — add one class reference to `@ImportHttpServices`
4. **Controller** — straightforward delegation

No RestClient boilerplate. No `.get().uri().retrieve().body()` chains. The framework handles everything.

---

## ✅ Key Takeaways

- Adding a new HTTP Service Client interface follows the exact same pattern every time
- Always register new interfaces in `@ImportHttpServices` — this is the most commonly forgotten step
- Use the correct `@RequestMapping` path in each controller to avoid conflicts
- The declarative approach scales beautifully — adding new REST consumers takes minutes, not hours

## ⚠️ Common Mistakes

- Forgetting to add the new interface to `@ImportHttpServices` — bean won't be created
- Using the wrong `@RequestMapping` path — causes 404 or routing conflicts
- Forgetting to update Spring Security configuration for new paths
- Not passing CSRF tokens for write operations — results in `403 Forbidden`

## 💡 Pro Tips

- When building a new HTTP Service Client, start by copying an existing interface and modifying it
- Keep your DTOs in a dedicated `dto` package and service interfaces in a `client.service` package for clean organization
- Test each endpoint individually in Postman before moving to the next
