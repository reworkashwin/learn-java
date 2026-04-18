# Amdahl's Law

## Introduction

We've seen that parallel algorithms don't always deliver the speedup we expect. **Amdahl's law** explains exactly why — it defines the **theoretical maximum speedup** you can achieve when only part of a program can be parallelized. This is one of the most important concepts in parallel computing.

---

## Concept 1: The Core Idea

### 🧠 What is Amdahl's Law?

Amdahl's law states that the **speedup of a program** using multiple processors is **limited by the sequential portion** of the program.

In plain English: no matter how many processors you throw at a problem, the parts that **must** run sequentially become the bottleneck.

### 💡 Analogy

Imagine you're organizing a dinner party. Cooking, setting the table, and decorating can be done by different people simultaneously (parallel). But tasting the food and adjusting the seasoning can only be done by one person (sequential). Even with 100 helpers, the tasting step doesn't get faster.

---

## Concept 2: The Formula

### ⚙️ Mathematical Formulation

$$S(n) = \frac{1}{(1 - P) + \frac{P}{n}}$$

Where:
- $S(n)$ = speedup with $n$ processors
- $P$ = fraction of the program that **can be parallelized** (0 to 1)
- $1 - P$ = fraction that **must remain sequential**
- $n$ = number of processors/cores

### 🧪 Example Calculations

**If 90% of your program is parallelizable (P = 0.9):**

$$S(n) = \frac{1}{0.1 + \frac{0.9}{n}}$$

- With 2 processors: $S = \frac{1}{0.1 + 0.45} = 1.82x$
- With 10 processors: $S = \frac{1}{0.1 + 0.09} = 5.26x$
- With 100 processors: $S = \frac{1}{0.1 + 0.009} = 9.17x$
- With ∞ processors: $S = \frac{1}{0.1} = 10x$ ← **maximum possible**

Even with infinite processors, a 10% sequential portion limits you to **10x speedup**.

---

## Concept 3: What the Law Tells Us

### 🧪 Speedup Limits by Sequential Fraction

| Sequential Portion | Parallelizable | Max Speedup (∞ processors) |
|-------------------|---------------|---------------------------|
| 50% | 50% | **2x** |
| 25% | 75% | **4x** |
| 10% | 90% | **10x** |
| 5% | 95% | **20x** |
| 1% | 99% | **100x** |

### 💡 Key Insight

As $n → ∞$, the $\frac{P}{n}$ term vanishes, and the formula simplifies to:

$$S_{max} = \frac{1}{1 - P}$$

The maximum speedup is entirely determined by the **sequential fraction**.

---

## Concept 4: Applying This to Our Examples

### Merge Sort

- The **divide phase** (sorting subarrays) can be parallelized
- The **merge phase** is sequential — elements must be compared and combined in order
- This is why we saw ~4–6x speedup on 16 cores, not 16x

### Sum Problem

- The **per-chunk summation** can be parallelized
- The **final combination** of partial sums is sequential
- With very simple per-element operations, the sequential overhead is proportionally larger

### ⚠️ Common Misconception

"If I buy a 64-core server, my application will be 64x faster."

**Wrong.** If even 5% of your application is sequential, the maximum speedup is 20x — no matter how many cores you have. As the chart shows, even 65,000 processors can't exceed 20x if only 95% is parallelizable.

---

## Concept 5: Practical Implications

### ❓ So what should we do?

1. **Minimize the sequential portion** — this has the biggest impact on potential speedup
2. **Adding more processors has diminishing returns** — going from 4 to 8 cores helps more than going from 64 to 128
3. **Profile before parallelizing** — identify the sequential bottlenecks first
4. **Consider whether parallel overhead is worth it** — for small problems, sequential may still win

### 💡 Pro Tip

Before parallelizing, ask: "What fraction of my program can be parallelized?" If it's less than 80%, the maximum theoretical speedup is only 5x. Focus on reducing the sequential portion before adding more hardware.

---

## Summary

✅ Amdahl's law: $S(n) = \frac{1}{(1 - P) + P/n}$ — defines the maximum possible speedup

✅ The sequential portion of a program creates a **hard ceiling** on performance gains

✅ Even with infinite processors, maximum speedup = $\frac{1}{1 - P}$

✅ 5% sequential code → max 20x speedup. 50% sequential → max 2x speedup.

⚠️ Adding more processors gives **diminishing returns** — focus on reducing the sequential fraction instead

💡 Always profile your application to understand the parallel vs. sequential split before investing in more hardware
