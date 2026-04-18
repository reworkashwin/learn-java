# Fetch vs. Cascade — The Two JPA Concepts You Must Never Confuse

## Introduction

`fetch` and `cascade` are two of the most important configurations in JPA relationships — and two of the most confused. They sound vaguely similar ("something about loading related data"), but they solve **completely different problems**:

- **Fetch** = *When* should related data be loaded?
- **Cascade** = *What* should happen to related data when the parent changes?

Let's master both.

---

## Part 1: Fetch Type — When to Load Related Data

### 🧠 What is Fetch Type?

Fetch type controls **when** the Spring Data JPA framework loads related entities from the database. Should it load everything **immediately**, or should it **wait** until you actually need it?

### The Two Options

#### 1. `FetchType.EAGER` — Load Everything Right Away

When you fetch a company, JPA **immediately** loads all its jobs too — whether you need them or not.

```java
Company company = companyRepository.findById(1L);
// At this point, company.getJobs() is already populated
// JPA ran a JOIN query behind the scenes
```

#### 2. `FetchType.LAZY` — Load On Demand

When you fetch a company, JPA loads **only** the company data. The jobs are loaded **only when you call `getJobs()`**.

```java
Company company = companyRepository.findById(1L);
// At this point, jobs are NOT loaded yet — just a placeholder

List<Job> jobs = company.getJobs();
// NOW JPA runs a query to fetch the jobs
```

### 🍽️ Real-Life Analogy

Think of ordering food at a restaurant:

- **EAGER** = Ordering the main dish **and** the side dish together, even if you're not hungry for the side. It arrives whether you eat it or not.
- **LAZY** = Ordering just the main dish first. If you're still hungry later, you order the side dish then.

---

### Default Fetch Types

If you don't explicitly configure fetch type, JPA uses these defaults:

| Annotation | Default Fetch Type | Why? |
|-----------|-------------------|------|
| `@OneToOne` | **EAGER** | Only 1 related record — negligible performance cost |
| `@ManyToOne` | **EAGER** | Only 1 related record — minimal overhead |
| `@OneToMany` | **LAZY** | Could be hundreds/thousands of records — risky to load eagerly |
| `@ManyToMany` | **LAZY** | Could be a massive dataset — definitely lazy by default |

### 📝 The Memory Trick

Look at the **last word** of the annotation:

- Ends in **"One"** → Default is **EAGER** (loading one record is cheap)
- Ends in **"Many"** → Default is **LAZY** (loading many records could be expensive)

### When to Override Defaults

- Override `EAGER` to `LAZY` when you rarely need the related entity
- Override `LAZY` to `EAGER` when you **always** need the related data and want to avoid extra queries

> In our Job entity, we explicitly set `fetch = FetchType.LAZY` on `@ManyToOne` to override the default `EAGER`. Why? Because in many business scenarios, when processing jobs, we don't need the full company details.

---

## Part 2: Cascade Type — What Happens to Children When the Parent Changes

### 🧠 What is Cascade?

Cascade defines a **chain reaction**: if you do something to the parent entity, the same operation is automatically applied to its child entities.

> "If I save the parent, save the children too. If I delete the parent, delete the children too."

### Why Do We Need Cascade?

Without cascade, you'd write this:

```java
companyRepository.save(company);     // Save parent
jobRepository.save(job1);            // Save child 1 manually
jobRepository.save(job2);            // Save child 2 manually
```

With `cascade = CascadeType.ALL`:

```java
company.getJobs().add(job1);
company.getJobs().add(job2);
companyRepository.save(company);     // Saves company + job1 + job2!
```

One call. Everything stays in sync.

---

### The Cascade Types

| CascadeType | What It Does | When It Triggers |
|------------|-------------|-----------------|
| `PERSIST` | Save children when parent is saved | `repository.save(parent)` |
| `MERGE` | Update children when parent is updated | `repository.save(existingParent)` |
| `REMOVE` | Delete children when parent is deleted | `repository.delete(parent)` |
| `REFRESH` | Re-fetch children when parent is refreshed | Hibernate refreshes from DB |
| `DETACH` | Detach children when parent is detached | Entity removed from persistence context |
| `ALL` | Apply **all** of the above | Any of the above operations |

### Selecting Specific Cascade Types

You don't have to use `ALL`. You can pick specific ones:

```java
@OneToMany(cascade = {CascadeType.PERSIST, CascadeType.REMOVE})
```

This would cascade **save** and **delete** operations, but **not** updates.

### When to Be Careful

Cascade is powerful but dangerous. Consider:

- **CascadeType.REMOVE**: If you delete a company, all its jobs vanish. Is that what you want?
- **CascadeType.ALL**: Every operation cascades. Make sure that's appropriate for your business rules.

> If your data is critical and you want full control, skip cascade and handle child operations manually.

---

### Cascade in Action — A Complete Example

```java
// 1. Create parent
Company company = new Company();
company.setName("TechCorp");

// 2. Create children
Job job1 = new Job();
job1.setTitle("Java Developer");
job1.setCompany(company);

Job job2 = new Job();
job2.setTitle("DevOps Engineer");
job2.setCompany(company);

// 3. Add children to parent
company.getJobs().add(job1);
company.getJobs().add(job2);

// 4. Save ONLY the parent — cascade handles the rest
companyRepository.save(company);
// Result: 1 company row + 2 job rows inserted
```

Without cascade, step 4 would only save the company. The jobs would be lost.

---

## Fetch vs. Cascade — The Comparison

| Aspect | Fetch | Cascade |
|--------|-------|---------|
| **Question it answers** | *When* to load related data? | *What* to do with related data on parent change? |
| **Options** | LAZY, EAGER | PERSIST, MERGE, REMOVE, REFRESH, DETACH, ALL |
| **Affects** | Data **reading** (SELECT queries) | Data **writing** (INSERT, UPDATE, DELETE) |
| **Performance concern** | Loading too much data eagerly | Accidentally cascading deletes |
| **Risk** | N+1 query problem with lazy | Unintended data loss with ALL/REMOVE |

---

## ✅ Key Takeaways

- **Fetch** controls *when* related data is loaded from the database
- **Cascade** controls *what* happens to children when the parent is modified
- Default fetch: EAGER for `*ToOne`, LAZY for `*ToMany` — remember the "last word" trick
- `CascadeType.ALL` cascades everything — use with caution on critical data
- These are **independent** concepts — you configure both separately on each relationship

---

## ⚠️ Common Mistakes

- **Confusing fetch with cascade** — They answer completely different questions
- **Using `CascadeType.ALL` without thinking** — Ask yourself: "Do I really want deletes to cascade?"
- **Leaving `@ManyToOne` as EAGER (default)** — In many cases, lazy loading is more performant; consider overriding the default

---

## 💡 Pro Tip

> A good rule of thumb: **Start with LAZY fetch type everywhere** and only switch to EAGER when you have a proven need. Premature eager loading is one of the most common performance killers in JPA applications. You can always load related data explicitly when needed.
