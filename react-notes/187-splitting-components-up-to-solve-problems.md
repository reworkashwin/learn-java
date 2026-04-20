# Splitting Components Up To Solve Problems

## Introduction

This lecture is a masterclass in **why component decomposition matters** in React. We have a concrete bug — answers reshuffle on every re-render — and the cleanest fix isn't a clever hack. It's **splitting our code into the right components**. Along the way, we also solve a `key` prop conflict by extracting yet another component. The lesson: components aren't just about organization — they're problem-solving tools.

---

## The Problem: Answers Reshuffle on Re-render

In the Quiz component, we shuffle answers like this:

```js
const shuffledAnswers = [...QUESTIONS[activeQuestionIndex].answers];
shuffledAnswers.sort(() => Math.random() - 0.5);
```

This runs every time the component function executes. Previously, re-renders only happened when we moved to a new question, so reshuffling was fine. But now that we have `answerState` changing (answered → correct/wrong → reset), the Quiz component re-renders *multiple times per question*, and the answers jump to new positions each time.

---

## Solution Attempt: useRef to Prevent Reshuffling

One approach is to use `useRef` to store the shuffled answers so they persist across re-renders:

```js
const shuffledAnswers = useRef();

if (!shuffledAnswers.current) {
  shuffledAnswers.current = [...QUESTIONS[activeQuestionIndex].answers];
  shuffledAnswers.current.sort(() => Math.random() - 0.5);
}
```

This prevents reshuffling because refs persist across re-renders without triggering new renders. But it creates a new problem: when we move to a new question, the ref still holds the old shuffled answers. It was set once and never updates.

---

## The Real Solution: Extract an Answers Component

Instead of fighting re-render timing with refs or effects, we create a new `Answers` component:

```jsx
// Answers.jsx
import { useRef } from 'react';

export default function Answers({ answers, selectedAnswer, answerState, onSelect }) {
  const shuffledAnswers = useRef();

  if (!shuffledAnswers.current) {
    shuffledAnswers.current = [...answers];
    shuffledAnswers.current.sort(() => Math.random() - 0.5);
  }

  return (
    <ul id="answers">
      {shuffledAnswers.current.map(answer => {
        // ... render each answer button
      })}
    </ul>
  );
}
```

Now here's the elegant trick: **add a `key` prop to force recreation when the question changes**:

```jsx
// In Quiz.jsx:
<Answers
  key={activeQuestionIndex}
  answers={QUESTIONS[activeQuestionIndex].answers}
  selectedAnswer={...}
  answerState={answerState}
  onSelect={handleSelectAnswer}
/>
```

When `activeQuestionIndex` changes:
1. React destroys the old `Answers` component (the ref is lost)
2. React creates a new `Answers` component (ref starts as `undefined`, shuffle happens)

The answers shuffle once per question and stay stable during answer feedback transitions. Problem solved, no `useEffect` needed!

---

## The Key Conflict Problem

But now we have two sibling components with the same `key` value:

```jsx
<QuestionTimer key={activeQuestionIndex} ... />
<Answers key={activeQuestionIndex} ... />
```

React doesn't allow siblings to share keys — it causes warnings and unexpected behavior.

### Solution: Extract a Question Component

Create a `Question` component that wraps both:

```jsx
// Question.jsx
export default function Question({ questionText, answers, onSelectAnswer, onSkipAnswer }) {
  return (
    <div id="question">
      <QuestionTimer timeout={10000} onTimeout={onSkipAnswer} />
      <h2>{questionText}</h2>
      <Answers answers={answers} onSelect={onSelectAnswer} ... />
    </div>
  );
}
```

Now in Quiz, we put the `key` on the `Question` component itself:

```jsx
// Quiz.jsx
<Question
  key={activeQuestionIndex}
  questionText={QUESTIONS[activeQuestionIndex].text}
  answers={QUESTIONS[activeQuestionIndex].answers}
  onSelectAnswer={handleSelectAnswer}
  onSkipAnswer={handleSkipAnswer}
/>
```

One key, one component. When the question changes, the entire Question component (including its timer and answers) get destroyed and recreated. Clean and correct.

---

## The Takeaway About Component Design

This lecture demonstrates three ways components help solve problems:

1. **Isolation**: The Answers component isolates shuffling state from the rest of the quiz
2. **Reset via key**: Putting key on a wrapping component resets everything inside it
3. **Avoiding conflicts**: Extracting a wrapping component eliminates sibling key collisions

---

✅ **Key Takeaway**: When you face bugs caused by re-renders affecting state you want to keep stable, consider extracting that logic into a child component. The component boundary gives you a natural "reset point" via the `key` prop.

✅ **Key Takeaway**: You can't put the same `key` value on sibling elements. If multiple elements need the same reset trigger, wrap them in a parent component and put the `key` there.

💡 **Pro Tip**: Before reaching for `useEffect` to synchronize or reset state, ask: "Could I solve this by restructuring my components?" Component composition often leads to simpler, more correct solutions.
