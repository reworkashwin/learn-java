# Highlighting Selected Answers & Managing More State

## Introduction

Let's add a satisfying UX touch: when a user picks an answer, we first highlight it, then after a second reveal whether it's correct or wrong (green/red), and only *then* move to the next question. This means we need to manage an intermediate "answer state" that transitions through phases. It's a great exercise in state management and conditional styling.

---

## Designing the Answer State Machine

The answer goes through distinct phases:

```
"" (unanswered) → "answered" → "correct" / "wrong" → "" (reset, next question)
```

Each phase has a different visual style and different timing:

```js
const [answerState, setAnswerState] = useState('');
```

| State Value | Meaning | Visual |
|---|---|---|
| `""` | No answer selected yet | Normal buttons |
| `"answered"` | User clicked an answer | Highlighted in purple |
| `"correct"` | Revealed as correct | Green |
| `"wrong"` | Revealed as wrong | Red |

---

## The Multi-Step Answer Flow

When the user selects an answer, we kick off a chain of timed state changes:

```js
function handleSelectAnswer(selectedAnswer) {
  // Step 1: Mark as answered immediately
  setAnswerState('answered');

  // Step 2: After 1 second, reveal correct/wrong
  setTimeout(() => {
    if (selectedAnswer === QUESTIONS[activeQuestionIndex].answers[0]) {
      setAnswerState('correct');
    } else {
      setAnswerState('wrong');
    }

    // Step 3: After 2 more seconds, reset and move on
    setTimeout(() => {
      setAnswerState('');
    }, 2000);
  }, 1000);
}
```

The nested timeouts create a deliberate sequence: show → reveal → proceed.

---

## Keeping the Active Question Index in Sync

Here's a subtle but important adjustment. When the user answers a question, we immediately store that answer in `userAnswers`. Since `activeQuestionIndex` is derived from `userAnswers.length`, it would instantly jump to the next question — before we've shown the correct/wrong feedback!

The fix: adjust how we derive the active question index:

```js
const activeQuestionIndex = answerState === ''
  ? userAnswers.length
  : userAnswers.length - 1;
```

When `answerState` is empty (no answer being reviewed), we use the normal index. When we're in the middle of showing feedback (`"answered"`, `"correct"`, or `"wrong"`), we stay on the current question by subtracting 1.

---

## Conditional CSS Classes for Answer Buttons

Each answer button needs different styling based on the current state. We determine this per-answer:

```jsx
{shuffledAnswers.map(answer => {
  const isSelected = userAnswers[userAnswers.length - 1] === answer;
  let cssClass = '';

  if (answerState === 'answered' && isSelected) {
    cssClass = 'selected';
  } else if ((answerState === 'correct' || answerState === 'wrong') && isSelected) {
    cssClass = answerState; // 'correct' or 'wrong'
  }

  return (
    <li key={answer} className="answer">
      <button className={cssClass} onClick={() => handleSelectAnswer(answer)}>
        {answer}
      </button>
    </li>
  );
})}
```

The key insight: we only style the *selected* answer differently. All other answers keep their default appearance.

### How We Know Which Answer Is Selected

`userAnswers[userAnswers.length - 1]` gives us the last answer in the array — which is the one the user just picked. We compare it against each answer being rendered.

---

## The Shuffle Bug

If you test this, you'll notice answers **jump around** when the state changes. Why? Because the shuffling code runs on every re-render, creating a new random order each time `answerState` or `userAnswers` changes.

We'll fix this by extracting the answer logic into a dedicated component — next lecture!

---

## The useCallback Dependency Update

Since `handleSelectAnswer` now uses `activeQuestionIndex` in its body (to check if the answer is correct), this dependency must be added to `useCallback`:

```js
const handleSelectAnswer = useCallback((selectedAnswer) => {
  // uses activeQuestionIndex internally
}, [activeQuestionIndex]);  // ← must list it!
```

If you don't, the function would capture a stale `activeQuestionIndex` and compare against the wrong question.

---

✅ **Key Takeaway**: State machines (values transitioning through defined phases) are a clean way to manage multi-step UI flows. Each state value drives both behavior and styling.

⚠️ **Common Mistake**: Forgetting to add variables to `useCallback`'s dependency array when you start using new values inside the callback.

💡 **Pro Tip**: When derived state needs to behave differently during a transition period, introduce a small "mode" state that controls the derivation logic temporarily.
