# Deriving Values, Outputting Questions & Registering Answers

## Introduction

Now that we have our quiz components scaffolded and some basic state management in place, it's time to actually make the quiz *work*. That means displaying real questions, presenting answer choices, and registering user selections. But before we just dive in and connect the dots, there's a crucial insight hiding in our code — **we're managing more state than we need to**.

This lecture teaches one of the most important patterns in React: **derived state** — computing values from existing state rather than storing redundant data.

---

## Setting Up Question Data

First things first — we need actual questions to display. The project includes a `questions.js` file that exports an array of question objects:

```js
// questions.js
export default [
  {
    id: 'q1',
    text: 'Which of the following is NOT a core React concept?',
    answers: [
      'Components',       // ← first answer is ALWAYS correct
      'State',
      'Reducers',
      'JSX'
    ]
  },
  // ... more questions
];
```

**Key design decision**: The first answer in each question's `answers` array is always the correct one. When we display answers, we'll shuffle them so users don't always see the correct answer first. But in the raw data, we keep it consistent so our validation logic stays simple.

---

## The Problem with Redundant State

Here's where the teaching moment kicks in. Imagine we had two pieces of state:

```js
const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
const [userAnswers, setUserAnswers] = useState([]);
```

Do you see the redundancy? Think about it — if the user has answered 2 questions, then `userAnswers` has 2 elements, and the active question index should be… **2**. The active question index is literally just the length of the user answers array!

### Derived State — The Better Approach

Instead of managing two separate pieces of state, we derive the index:

```js
const [userAnswers, setUserAnswers] = useState([]);

const activeQuestionIndex = userAnswers.length;
```

- Empty array → `length` is 0 → show the first question
- One answer stored → `length` is 1 → show the second question
- Two answers stored → `length` is 2 → show the third question

This is **derived state** (also called computed values). It's not stored — it's calculated on every render from existing state.

✅ **Key Takeaway**: When working with React, always ask: *"Can I compute this from existing state instead of storing it separately?"* Manage as little state as possible and derive as much as you can.

---

## Outputting the Current Question

With the question data imported and the active index derived, displaying the current question is straightforward:

```jsx
import QUESTIONS from '../questions.js';

// Inside the component:
<div id="quiz">
  <div id="question">
    <h2>{QUESTIONS[activeQuestionIndex].text}</h2>
    <ul id="answers">
      {QUESTIONS[activeQuestionIndex].answers.map(answer => (
        <li key={answer} className="answer">
          <button onClick={() => handleSelectAnswer(answer)}>
            {answer}
          </button>
        </li>
      ))}
    </ul>
  </div>
</div>
```

The `.map()` pattern should feel familiar by now — we transform our array of answer strings into a list of JSX elements. Each answer gets a `<button>` because answers are interactive and selectable.

---

## Registering User Answers

When the user clicks an answer, we need to store their selection:

```js
function handleSelectAnswer(selectedAnswer) {
  setUserAnswers(prevAnswers => {
    return [...prevAnswers, selectedAnswer];
  });
}
```

### Why the Function Form?

We use the function form of the state updater (`prevAnswers => ...`) because we're updating state based on the previous state. This guarantees we always work with the **latest** version of the state, not a stale closure.

### The onClick Pattern

Notice how the button's `onClick` is wired up:

```jsx
<button onClick={() => handleSelectAnswer(answer)}>
```

We wrap `handleSelectAnswer` in an arrow function because we need to pass the specific `answer` value. If we just wrote `onClick={handleSelectAnswer}`, React would call the function but wouldn't know which answer was selected. The arrow function creates a closure that captures the right `answer` for each button.

⚠️ **Common Mistake**: Writing `onClick={handleSelectAnswer(answer)}` would call the function immediately during rendering — not on click! The arrow function wrapper ensures it only executes when the button is actually clicked.

---

## Bringing It All Together

In the `App` component, we import and render the Quiz:

```jsx
import Quiz from './components/Quiz.jsx';

function App() {
  return (
    <>
      <Header />
      <main>
        <Quiz />
      </main>
    </>
  );
}
```

The Fragment (`<>...</>`) is needed because we're returning two sibling elements — `Header` and `main`.

---

## What Happens at the End?

Right now, once the user answers all questions, the app crashes. That's because `activeQuestionIndex` exceeds the length of the `QUESTIONS` array. We'll fix that in the next lecture by detecting when the quiz is complete and showing a summary screen.

---

💡 **Pro Tip**: The concept of derived state is one of the most powerful optimization patterns in React. Every time you reach for `useState`, pause and ask: *"Is this truly independent state, or can it be computed from state I already have?"* Fewer state variables means fewer potential bugs from state getting out of sync.
