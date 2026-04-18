# Search by Keyword — Using DSL with Containing and Or

## Introduction

We can create, read, update, and delete job posts. But a real job portal needs **search**. Users don't browse through every listing — they type "Java" or "API" and expect matching results.

How do we search across multiple fields using a keyword? Spring Data JPA's DSL makes this surprisingly simple.

---

## Concept 1: The Search Requirement

### 🧠 What we want

A user passes a keyword like "Java" or "API", and we search for it in:
- **Post profile** (e.g., "Java Developer")
- **Post description** (e.g., "Must know REST API development")

If the keyword appears in *either* field, that job post should be returned. And since multiple posts might match, we return a `List<JobPost>`.

---

## Concept 2: Setting Up the Controller

### ⚙️ The endpoint

```java
@GetMapping("jobPost/keyword/{keyword}")
public List<JobPost> searchByKeyword(@PathVariable("keyword") String keyword) {
    return service.search(keyword);
}
```

The URL pattern is `jobPost/keyword/{keyword}`. We use `keyword/` as a prefix so Spring doesn't confuse this with the `jobPost/{postId}` endpoint. Without it, passing "Java" would look like you're requesting a job post with ID "Java".

### 🧪 Example requests

```
GET /jobPost/keyword/Java     → all posts mentioning "Java"
GET /jobPost/keyword/API      → all posts mentioning "API"
GET /jobPost/keyword/React    → all posts mentioning "React"
```

---

## Concept 3: The Repository Method — DSL Magic

### 🧠 Building the method name

This is where DSL really shines. We need a method that:
1. Searches in `postProfile`
2. Does a **partial match** (not exact — "Java" should match "Java Developer")
3. **Or** searches in `postDesc`
4. Also does a partial match there

Using DSL naming conventions, we build the method name piece by piece:

```
findBy                      → SELECT ... WHERE
PostProfile                 → post_profile
Containing                  → LIKE '%keyword%'
Or                          → OR
PostDesc                    → post_desc
Containing                  → LIKE '%keyword%'
```

### ⚙️ The final method

```java
public interface JobRepo extends JpaRepository<JobPost, Integer> {

    List<JobPost> findByPostProfileContainingOrPostDescContaining(String postProfile, String postDesc);
}
```

Yes, it's a long method name. But it reads exactly like what it does: *find by post profile containing OR post description containing*.

### ❓ Why two parameters?

Even though we're searching with one keyword, the method signature requires **two parameters** — one for each `Containing` clause. Both `postProfile` and `postDesc` need their own search term.

In practice, you pass the **same keyword** for both:

```java
repo.findByPostProfileContainingOrPostDescContaining(keyword, keyword);
```

This is a DSL requirement — each condition in the method name maps to a parameter in order.

---

## Concept 4: The Service Layer

### ⚙️ Connecting it

```java
public List<JobPost> search(String keyword) {
    return repo.findByPostProfileContainingOrPostDescContaining(keyword, keyword);
}
```

The same `keyword` is passed twice — once for the profile search, once for the description search. Behind the scenes, Hibernate generates:

```sql
SELECT * FROM job_post 
WHERE post_profile LIKE '%Java%' 
   OR post_desc LIKE '%Java%'
```

---

## Concept 5: Testing the Search

### 🧪 Searching for "Java"

```
GET /jobPost/keyword/Java
```

Returns only job posts where "Java" appears in the profile or description — maybe just one result like the "Java Developer" post.

### 🧪 Searching for "API"

```
GET /jobPost/keyword/API
```

If "API" appears in the description of multiple posts (like "REST API development", "API testing", etc.), all matching posts are returned. You might get 3 or 4 results.

### 🧪 Searching for something that doesn't match

```
GET /jobPost/keyword/Python
```

If no post contains "Python" in either field, you get an empty list: `[]`

---

## Concept 6: Containing vs Exact Match

### ❓ What's the difference?

| Method | SQL Equivalent | Example |
|--------|---------------|---------|
| `findByPostProfile("Java Developer")` | `WHERE post_profile = 'Java Developer'` | Exact match only |
| `findByPostProfileContaining("Java")` | `WHERE post_profile LIKE '%Java%'` | Partial match — finds "Java Developer", "Senior Java Engineer", etc. |

Without `Containing`, you'd have to type the exact profile name. With it, any substring match works. That's what makes it useful for search functionality.

### 📋 Other useful DSL keywords for text search

| Keyword | SQL Equivalent | Use case |
|---------|---------------|----------|
| `Containing` | `LIKE '%keyword%'` | Keyword anywhere in the text |
| `StartingWith` | `LIKE 'keyword%'` | Text starts with keyword |
| `EndingWith` | `LIKE '%keyword'` | Text ends with keyword |
| `IgnoreCase` | `LOWER(col) LIKE LOWER(?)` | Case-insensitive match |

You can combine them: `findByPostProfileContainingIgnoreCase` for case-insensitive partial matches.

---

## Concept 7: When the Method Name Gets Too Long

### 🧠 The trade-off

`findByPostProfileContainingOrPostDescContaining` is already quite long. What if you also wanted to search in tech stack? The name would be absurd.

At that point, switch to `@Query`:

```java
@Query("SELECT j FROM JobPost j WHERE j.postProfile LIKE %?1% OR j.postDesc LIKE %?1%")
List<JobPost> searchByKeyword(String keyword);
```

With `@Query`, you only need **one parameter** (since you're writing the query yourself), and you can make it as complex as needed without the method name becoming unreadable.

But for simple cases like searching across two fields, DSL works perfectly and requires zero SQL.

---

## ✅ Key Takeaways

- Use `Containing` in DSL method names for partial/substring matches — it generates `LIKE '%keyword%'`
- Use `Or` to search across multiple fields — each field with `Containing` needs its own parameter
- Pass the same keyword twice when searching two fields with `Or` — it's a DSL requirement
- The method name reads like English: `findByPostProfileContainingOrPostDescContaining`
- For complex searches, switch to `@Query` with JPQL to keep things readable

## ⚠️ Common Mistakes

- Passing only one parameter when the DSL method expects two — each `Containing` clause maps to a separate parameter, even if the value is the same
- Forgetting `Containing` and using just `findByPostProfile(keyword)` — this does an exact match, not a partial search
- Using the wrong URL pattern — without the `keyword/` prefix, Spring might confuse the search endpoint with the `findById` endpoint

## 💡 Pro Tips

- Add `IgnoreCase` to make searches case-insensitive: `findByPostProfileContainingIgnoreCaseOrPostDescContainingIgnoreCase` — users shouldn't have to worry about capitalization
- If the DSL method name is getting ridiculous, that's a clear signal to switch to `@Query` — readability always wins
