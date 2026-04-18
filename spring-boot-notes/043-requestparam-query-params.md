# Capturing Query Parameters with @RequestParam

## Introduction

We've already learned how to capture **path variables** — values embedded directly in the URL path like `/users/123`. But there's another very common way clients send data: **query parameters** (also called **request parameters**).

Query parameters appear at the **end** of a URL after a `?` mark, and they're used for things like search filters, pagination, sorting, and optional data. In this section, we'll learn how to read them using the `@RequestParam` annotation.

---

## Concept 1: What Are Query Parameters?

### 🧠 The Anatomy of a URL with Query Params

```
/api/dummy/users/search?name=John&gender=male
 \_____static path____/  \___query params___/
```

- **`?`** — Marks the start of query parameters (HTTP standard)
- **`key=value`** — Each query param is a key-value pair
- **`&`** — Separates multiple query parameters

### ❓ Path Variables vs Query Parameters

| Feature | Path Variables | Query Parameters |
|---------|---------------|-----------------|
| Location | Part of the URL path | After the `?` mark |
| Syntax | `/users/{id}` | `/users?id=123` |
| Purpose | Identify a specific resource | Filter, search, optional data |
| Required? | Usually yes | Can be optional |
| Example | `/users/42` | `/users?name=John&age=25` |

### 🧪 Can You Combine Them?

Absolutely! You can use both in the same URL:

```
/api/dummy/users/42?name=John&gender=male
       path variable ↑        ↑ query params
```

⚠️ **Rule:** Query parameters must always come **after** path variables. You cannot place path variables after the `?` mark.

---

## Concept 2: Reading Query Params with @RequestParam

### ⚙️ Basic Syntax

```java
@GetMapping("/search")
public String searchUser(
    @RequestParam String name,
    @RequestParam String gender
) {
    return "Fetched user with name: " + name + " and gender: " + gender;
}
```

### 🧠 How Does the Mapping Work?

Notice something — we **don't** define query params in the URL path (unlike path variables). There's no `/search?name={name}` in the `@GetMapping`.

Spring automatically matches query parameter **names** to method parameter **names**:
- Query param `name` → maps to parameter `name`
- Query param `gender` → maps to parameter `gender`

### 🧪 Testing in Postman

Instead of typing query params manually in the URL, use Postman's **Params** tab:

| Key | Value |
|-----|-------|
| name | John |
| gender | male |

Postman automatically constructs the URL:
```
/api/dummy/users/search?name=John&gender=male
```

As you add more params, Postman handles the `?` and `&` symbols for you.

---

## Concept 3: Making Query Params Optional

### ❓ What Happens If a Required Param Is Missing?

By default, all `@RequestParam` parameters are **required**. If a client doesn't send one:

```
GET /api/dummy/users/search?gender=male
```

The server responds with **400 Bad Request** because `name` is missing.

### ⚙️ Making It Optional

```java
@RequestParam(required = false) String name
```

Now if `name` is not sent, the variable receives `null` instead of throwing an error.

### ⚙️ Setting a Default Value

Instead of getting `null`, you can define a fallback:

```java
@RequestParam(required = false, defaultValue = "guest") String name
```

Now:
- Client sends `name=John` → variable is `"John"`
- Client doesn't send `name` → variable is `"guest"` (not null)

> Think of `defaultValue` like a placeholder — "If nobody tells me their name, I'll just call them 'guest'."

---

## Concept 4: Using Different Variable Names

### ❓ What If the Query Param Name Doesn't Match Your Variable Name?

Sometimes you want your Java variable to be named differently from the query parameter. For example, the client sends `gender`, but you want your variable called `sex`.

### ⚙️ How to Alias

```java
@RequestParam(name = "gender") String sex
```

- The client sends: `?gender=male`
- Spring maps it to the `sex` variable with value `"male"`

This works exactly like the `name` parameter we saw in `@PathVariable`.

---

## Concept 5: Accepting All Query Params with a Map

### ❓ What If You Don't Know How Many Params Will Come?

Sometimes you want to accept **any number** of query parameters without defining each one individually. A `Map` makes this easy.

### ⚙️ Syntax

```java
@GetMapping("/search/map")
public String searchUserWithMap(@RequestParam Map<String, String> requestParams) {
    String name = requestParams.get("name");
    String gender = requestParams.get("gender");
    return "Fetched user with name: " + name + " and gender: " + gender;
}
```

### 🧠 How It Works

- Spring collects **all** query params into a `Map<String, String>`
- Keys = parameter names, Values = parameter values
- You extract values using `map.get("paramName")`

### 💡 When to Use Map?

- When you have a **dynamic** or **large** number of query parameters
- When building generic search/filter endpoints
- When the exact set of parameters isn't known at compile time

---

## Concept 6: Putting It All Together

Here's a comprehensive example showing all the features:

```java
@RestController
@RequestMapping("/api/dummy/users")
public class UserController {

    // Basic - both params required
    @GetMapping("/search")
    public String search(
        @RequestParam String name,
        @RequestParam String gender
    ) {
        return "Name: " + name + ", Gender: " + gender;
    }

    // Optional with default value + aliased variable name
    @GetMapping("/search/advanced")
    public String advancedSearch(
        @RequestParam(required = false, defaultValue = "guest") String name,
        @RequestParam(name = "gender") String sex
    ) {
        return "Name: " + name + ", Gender: " + sex;
    }

    // Map-based - accepts all params dynamically
    @GetMapping("/search/map")
    public String searchWithMap(@RequestParam Map<String, String> params) {
        return "Name: " + params.get("name") + ", Gender: " + params.get("gender");
    }
}
```

---

## ✅ Key Takeaways

1. **Query params** come after `?` in the URL, separated by `&` — they're for filtering, searching, and optional data
2. **`@RequestParam`** maps query parameters to method parameters by matching **names**
3. By default, all query params are **required** — missing ones cause `400 Bad Request`
4. Use **`required = false`** to make a param optional (gets `null` if missing)
5. Use **`defaultValue`** to provide a fallback value instead of `null`
6. Use the **`name`** attribute to alias a query param to a different variable name
7. Use **`Map<String, String>`** to accept all query params dynamically

## ⚠️ Common Mistakes

- Forgetting to include the **parent path** (`@RequestMapping` on the class) when building the full URL in Postman
- Not handling `null` values when a query param is marked `required = false` without a `defaultValue`
- Confusing path variables with query params — path variables are in the path (`/users/{id}`), query params are after `?`
- Defining query params in the `@GetMapping` path — you don't need to, unlike path variables

## 💡 Pro Tips

- Use Postman's **Params tab** instead of manually typing `?key=value` — it's cleaner and lets you easily toggle params on/off
- Uncheck a param in Postman's Params tab to quickly test "what if this param is missing?" scenarios
- `@RequestParam` will be used extensively when building search, filter, and pagination APIs throughout the course
- The `Map` approach is great for building flexible endpoints, but you lose compile-time safety — use it wisely
