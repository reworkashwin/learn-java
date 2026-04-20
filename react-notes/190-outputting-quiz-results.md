# Outputting Quiz Results

## Introduction

With the quiz mechanics complete — questions, timers, answer feedback — it's time to build the finale: the **Summary screen**. This is where we calculate statistics, show the user how they performed, and display details for every question. It's a great exercise in deriving data from state and rendering dynamic lists.

---

## The Summary Component

We create a dedicated `Summary` component that receives `userAnswers` as a prop:

```jsx
// Summary.jsx
import quizCompleteImg from '../assets/quiz-complete.png';
import QUESTIONS from '../questions.js';

export default function Summary({ userAnswers }) {
  return (
    <div id="summary">
      <img src={quizCompleteImg} alt="Trophy icon" />
      <h2>Quiz Completed!</h2>
      {/* Stats and details go here */}
    </div>
  );
}
```

---

## Calculating Statistics

We need three numbers: % skipped, % correct, % wrong.

### Filtering Answers

```js
const skippedAnswers = userAnswers.filter(answer => answer === null);

const correctAnswers = userAnswers.filter((answer, index) =>
  answer === QUESTIONS[index].answers[0]
);
```

- **Skipped**: We stored `null` when the timer expired without an answer
- **Correct**: The first answer in each question's array is always correct — compare the user's answer against it

### Computing Percentages

```js
const skippedAnswersShare = Math.round(
  (skippedAnswers.length / userAnswers.length) * 100
);

const correctAnswersShare = Math.round(
  (correctAnswers.length / userAnswers.length) * 100
);

const wrongAnswersShare = 100 - skippedAnswersShare - correctAnswersShare;
```

For the wrong answers share, we don't filter — we just subtract. Whatever isn't skipped or correct must be wrong. Simple arithmetic.

---

## Rendering the Stats

```jsx
<div id="summary-stats">
  <p>
    <span className="number">{skippedAnswersShare}%</span>
    <span className="text">skipped</span>
  </p>
  <p>
    <span className="number">{correctAnswersShare}%</span>
    <span className="text">answered correctly</span>
  </p>
  <p>
    <span className="number">{wrongAnswersShare}%</span>
    <span className="text">answered incorrectly</span>
  </p>
</div>
```

---

## Rendering Question Details

Below the stats, we show each question with the user's answer:

```jsx
<ol>
  {userAnswers.map((answer, index) => {
    let cssClass = 'user-answer';

    if (answer === null) {
      cssClass += ' skipped';
    } else if (answer === QUESTIONS[index].answers[0]) {
      cssClass += ' correct';
    } else {
      cssClass += ' wrong';
    }

    return (
      <li key={index}>
        <h3>{index + 1}</h3>
        <p className="question">{QUESTIONS[index].text}</p>
        <p className={cssClass}>
          {answer ?? 'Skipped'}
        </p>
      </li>
    );
  })}
</ol>
```

### Key Decisions Explained

**Using `index` as the key**: Normally, we avoid using array indices as keys because reordering would cause issues. But here, our answer list is never reordered — it's fixed. The `index` is also the only unique identifier we have (answers could be `null` for skipped questions, so we can't use the answer text as a key).

**Nullish coalescing (`??`)**: `answer ?? 'Skipped'` displays the answer text if it exists, or "Skipped" if the answer is `null`.

**CSS class building**: We construct the class string by starting with the base class and appending conditionally. The space before each appended class is essential for proper CSS class separation.

---

## Wiring It Up in Quiz

```jsx
// Quiz.jsx
import Summary from './Summary.jsx';

if (quizIsComplete) {
  return <Summary userAnswers={userAnswers} />;
}
```

The Quiz component's role is simple here: detect completion and render the Summary with the collected data.

---

## Pattern: Deriving Rich UI from Simple State

Notice how much UI we derived from a single `userAnswers` array:
- Skipped count → filter for `null`
- Correct count → compare against raw data
- Wrong count → subtract from total
- Per-question details → map with index

We didn't need separate state for any of these. One piece of state (`userAnswers`) drives the entire summary screen. This is the power of derived data.

---

✅ **Key Takeaway**: Keep your state minimal. A simple array of answers is enough to derive statistics, conditional styling, and detailed breakdowns — no separate state needed for any of it.

✅ **Key Takeaway**: Using `index` as a key is acceptable when the list is static and never reordered, and when there's no better unique identifier available.

💡 **Pro Tip**: When building summary/report screens, resist the urge to accumulate statistics in state during the process. Instead, compute everything at render time from the raw data — it's always in sync and much simpler to maintain.
