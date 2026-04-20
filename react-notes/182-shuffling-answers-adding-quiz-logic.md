# Shuffling Answers & Adding Quiz Logic

## Introduction

Our quiz can display questions and register answers — great! But there are two problems. First, the correct answer is always in the same position (the first one), which makes the quiz trivially easy. Second, once we exhaust all questions, the app crashes with an error. Let's fix both.

---

## Shuffling Answers

We need to randomize the order of answers so users can't just always pick the first one. But there's a critical requirement: **we must not modify the original answers array**, because we rely on the first answer always being correct for our validation logic.

### The Approach

```js
const shuffledAnswers = [...QUESTIONS[activeQuestionIndex].answers];
shuffledAnswers.sort(() => Math.random() - 0.5);
```

Let's break this down:

1. **Create a copy**: `[...QUESTIONS[activeQuestionIndex].answers]` spreads the answers into a new array. This is essential — we never mutate the source data.

2. **Shuffle with `.sort()`**: The `sort()` method takes a comparator function. Normally, it receives two elements and returns a negative number (swap them) or a positive number (keep order). Here, we use `Math.random() - 0.5` which randomly returns either a negative or positive number, effectively shuffling the array.

Why `- 0.5`? Because `Math.random()` returns values between 0 (inclusive) and 1 (exclusive). Subtracting 0.5 gives us roughly a 50/50 chance of getting a negative or positive value, creating a random sort order.

⚠️ **Important**: This shuffle approach has a subtle issue we'll address later — it reshuffles on every re-render. We'll fix this once we start managing more complex state.

---

## Detecting Quiz Completion

The quiz is over when the user has answered all questions. Since we derived `activeQuestionIndex` from `userAnswers.length`, we can derive this too:

```js
const quizIsComplete = activeQuestionIndex === QUESTIONS.length;
```

If the user has answered 6 questions and there are 6 questions total, `activeQuestionIndex` would be 6, which equals `QUESTIONS.length`. The quiz is complete.

---

## Conditional Rendering for the Summary Screen

When the quiz is done, we show a different UI:

```jsx
import quizCompleteImg from '../assets/quiz-complete.png';

// Inside the component function:
if (quizIsComplete) {
  return (
    <div id="summary">
      <img src={quizCompleteImg} alt="Trophy icon" />
      <h2>Quiz Completed!</h2>
    </div>
  );
}
```

### The Execution Order Matters!

Here's the bug trap: if you try to shuffle answers *before* checking whether the quiz is complete, the app crashes. Why? Because when `activeQuestionIndex` equals `QUESTIONS.length`, there's no question at that index — it's out of bounds.

```js
// ❌ This crashes when quiz is complete:
const shuffledAnswers = [...QUESTIONS[activeQuestionIndex].answers]; // undefined!
const quizIsComplete = activeQuestionIndex === QUESTIONS.length;

// ✅ Check completion FIRST:
const quizIsComplete = activeQuestionIndex === QUESTIONS.length;
if (quizIsComplete) {
  return <SummaryScreen />;
}
// Only runs if quiz is NOT complete:
const shuffledAnswers = [...QUESTIONS[activeQuestionIndex].answers];
```

The early return pattern is powerful here — if the quiz is over, we return immediately and never reach the code that would crash.

---

✅ **Key Takeaway**: Always consider the order of operations in your component function. Code that accesses array elements by index should come *after* bounds checking, especially when that index is derived from state that keeps incrementing.

💡 **Pro Tip**: Derived values like `quizIsComplete` are perfect examples of values you should compute rather than store. They stay automatically in sync with the state they're derived from — no risk of forgetting to update them.
