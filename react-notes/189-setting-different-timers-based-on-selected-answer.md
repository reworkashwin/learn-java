# Setting Different Timers Based On The Selected Answer

## Introduction

Here's an edge case that breaks our quiz: if the user picks an answer late — say at the 9-second mark — the 10-second timer expires *before* the answer feedback finishes showing. This causes the question to be skipped AND answered simultaneously, leading to duplicate question transitions. The fix introduces **dynamic timer values** that change based on the answer state.

---

## The Problem

Our timer flow has a conflict:

1. **The overall timer** (10 seconds): when it expires, skip the question
2. **The answer feedback timers** (1s to show selected, then 2s to show correct/wrong): nested inside the answer handler

If the user answers at second 9, the overall timer only has 1 second left — not enough for the 3-second feedback sequence. The timer expires, triggers `onSkipAnswer`, AND the feedback timeout triggers `onSelectAnswer`. Double transition. Broken quiz.

---

## The Solution: Dynamic Timer Values

Instead of a fixed 10-second timer, we compute the timer dynamically based on the current answer state:

```jsx
// In Question.jsx:
let timer = 10000; // default: 10 seconds

if (answer.selectedAnswer) {
  timer = 1000;  // After picking an answer: 1 second to reveal result
}
if (answer.isCorrect !== null) {
  timer = 2000;  // After revealing result: 2 seconds before moving on
}
```

This computed `timer` replaces the hardcoded `timeout`:

```jsx
<QuestionTimer
  key={timer}                     // ← reset timer when value changes
  timeout={timer}
  onTimeout={answer.selectedAnswer ? null : onSkipAnswer}
  mode={answerState}
/>
```

### How This Works Step by Step

1. **Question appears**: `timer = 10000`, progress bar depletes over 10 seconds
2. **User picks an answer**: `answer.selectedAnswer` becomes truthy, `timer = 1000`, the QuestionTimer resets (new key) and starts a 1-second countdown
3. **Result revealed** (correct/wrong): `answer.isCorrect` is set, `timer = 2000`, the QuestionTimer resets again for a 2-second countdown
4. **Time's up**: move to next question

---

## The Key Trick Again

Notice `key={timer}` on the QuestionTimer. When `timer` changes from 10000 → 1000 → 2000, React destroys and recreates the QuestionTimer each time, giving us a fresh countdown with the new duration. No manual reset logic needed.

---

## Conditional onTimeout

There's another subtle fix:

```jsx
onTimeout={answer.selectedAnswer ? null : onSkipAnswer}
```

If an answer has been selected, we pass `null` for `onTimeout`. Why? Because the answer feedback timers in the Question component are already handling the transition to the next question. If we also triggered `onSkipAnswer`, we'd get a double transition again.

Only pass `onSkipAnswer` when no answer is selected — meaning the user actually ran out of time.

---

## Visual Feedback with Mode

The `mode` prop controls the progress bar's color:

```jsx
<progress
  id="question-time"
  className={mode}  // '', 'answered', 'correct', or 'wrong'
  max={timeout}
  value={remainingTime}
/>
```

The CSS changes the progress bar color based on the class:
- Default: normal color
- `answered`: highlighted color
- `correct`/`wrong`: green/red

This gives users a visual cue that their answer has been registered.

---

## Inside the QuestionTimer Update

The QuestionTimer needs to handle `null` for `onTimeout` gracefully:

```jsx
useEffect(() => {
  if (!onTimeout) return; // ← don't set a timer if there's no callback

  const timer = setTimeout(onTimeout, timeout);
  return () => clearTimeout(timer);
}, [timeout, onTimeout]);
```

If `onTimeout` is `null`, we simply don't set a timeout. The progress bar still animates (the interval runs), but nothing happens when it reaches zero.

---

✅ **Key Takeaway**: When a component needs to represent different phases of a process, use computed values to dynamically configure child components rather than trying to imperatively control them.

⚠️ **Common Mistake**: Having two independent timer mechanisms (the overall timer and nested `setTimeout`s) that can both trigger transitions. Always ensure only one transition path is active at a time.

💡 **Pro Tip**: The pattern of `key={dynamicValue}` to force component recreation is incredibly versatile. Here we use it not just to reset but to transition between entirely different timer configurations.
