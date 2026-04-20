# Enhancing the Demo App "Result Modal"

## Introduction

The modal shows remaining time but not a meaningful **score**. This lecture adds a scoring system — the closer you stop the timer to zero (without going over), the higher your score. It's a quick but satisfying enhancement that ties together everything we've built with state sharing and derived values.

---

## The Score Formula

The score rewards precision. The closer you are to the target time expiring, the better:

```jsx
const score = Math.round((1 - remainingTime / (targetTime * 1000)) * 100);
```

### Breaking It Down

1. **`remainingTime / (targetTime * 1000)`** — what fraction of the time is left (0 to 1)
2. **`1 - ...`** — invert it (more time used = higher score)
3. **`* 100`** — convert to a 0-100 scale
4. **`Math.round()`** — clean up to a nice whole number

| Scenario | Remaining | Target | Calculation | Score |
|----------|-----------|--------|-------------|-------|
| Stopped at 0.1s left (1s timer) | 100ms | 1000ms | (1 - 0.1) × 100 | **90** |
| Stopped at 2.5s left (5s timer) | 2500ms | 5000ms | (1 - 0.5) × 100 | **50** |
| Timer expired | ≤ 0ms | any | N/A (user lost) | **0** |

### ⚠️ Unit Consistency

Notice `targetTime * 1000` — target time is in seconds but remaining time is in milliseconds. Always match your units!

---

## Displaying the Score

```jsx
function ResultModal({ targetTime, remainingTime, onReset }) {
  const userLost = remainingTime <= 0;
  const score = Math.round((1 - remainingTime / (targetTime * 1000)) * 100);
  const formattedRemainingTime = (remainingTime / 1000).toFixed(2);

  return (
    <dialog ref={dialog}>
      {userLost && <h2>You lost</h2>}
      {!userLost && <h2>Your Score: {score}</h2>}
      <p>
        The target time was <strong>{targetTime} seconds</strong>.
      </p>
      <p>
        You stopped the timer with{' '}
        <strong>{formattedRemainingTime} seconds</strong> left.
      </p>
      <form method="dialog" onSubmit={onReset}>
        <button>Close</button>
      </form>
    </dialog>
  );
}
```

- If the user **lost**, show "You lost"
- If the user **won**, show their score
- Always show the formatted remaining time and original target

---

## The Power of Derived Values

Notice that we don't pass `score` or `userLost` as props. We **compute them** directly inside `ResultModal` from the data we already have (`remainingTime` and `targetTime`). This is a core React principle:

> If you can calculate it, don't store it.

Less state = fewer bugs = simpler components.

---

## ✅ Key Takeaways

- Scores and computed display values should be **derived** from props/state, not stored as separate state
- Always ensure **unit consistency** when doing math with time values (seconds vs. milliseconds)
- `Math.round()` and `.toFixed()` are your friends for clean number formatting
- Conditional rendering (`{condition && <JSX />}`) keeps the UI responsive to data changes

## 💡 Pro Tips

- The scoring formula `(1 - remaining/total) * 100` is a generic pattern for "percentage complete" — useful in progress bars, games, quizzes, etc.
- You could enhance this further with scoring tiers: "Perfect!" for 90+, "Great!" for 70+, etc.
