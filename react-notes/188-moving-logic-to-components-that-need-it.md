# Moving Logic To Components That Actually Need It ("Moving State Down")

## Introduction

We extracted components to solve problems, but created a new issue in the process: **prop drilling**. The Quiz component manages answer state and passes it through props to the Question component, which passes it further down. But does the Quiz component actually *need* that state? This lecture demonstrates **"moving state down"** — pushing state into the component that actually needs it, making both components simpler.

---

## The Prop Drilling Smell

After our refactor, the Quiz component:
- Manages `answerState`
- Manages the answer selection logic with nested timeouts
- Passes `selectedAnswer`, `answerState`, `answers`, and `questionText` as props to Question

The Question component is just a pass-through — it receives these props and forwards most of them to Answers. That's a code smell. If the Quiz component doesn't directly use `answerState` for its own rendering, why is it managing it?

---

## Moving State Down

The answer state logic belongs in the `Question` component. Here's the transformation:

### Before (in Quiz.jsx):
```js
const [answerState, setAnswerState] = useState('');
// ...nested timeouts, answer checking logic...
```

### After (in Question.jsx):
```jsx
import { useState } from 'react';
import QUESTIONS from '../questions.js';

export default function Question({ index, onSelectAnswer, onSkipAnswer }) {
  const [answer, setAnswer] = useState({
    selectedAnswer: '',
    isCorrect: null,
  });

  function handleSelectAnswer(answerText) {
    setAnswer({ selectedAnswer: answerText, isCorrect: null });

    setTimeout(() => {
      const isCorrect = answerText === QUESTIONS[index].answers[0];
      setAnswer({ selectedAnswer: answerText, isCorrect });

      setTimeout(() => {
        onSelectAnswer(answerText);  // notify parent
      }, 2000);
    }, 1000);
  }

  // Derive answerState from our local state
  let answerState = '';
  if (answer.selectedAnswer && answer.isCorrect !== null) {
    answerState = answer.isCorrect ? 'correct' : 'wrong';
  } else if (answer.selectedAnswer) {
    answerState = 'answered';
  }

  return (
    <div id="question">
      <QuestionTimer ... />
      <h2>{QUESTIONS[index].text}</h2>
      <Answers
        answers={QUESTIONS[index].answers}
        selectedAnswer={answer.selectedAnswer}
        answerState={answerState}
        onSelect={handleSelectAnswer}
      />
    </div>
  );
}
```

### Key Changes:

1. **Question imports QUESTIONS directly** — it doesn't need the parent to pass question data through props
2. **Answer state lives in Question** — the component that actually uses it for rendering
3. **Question only notifies the parent** when it's time to move on (via `onSelectAnswer`)
4. **Quiz component becomes leaner** — it only manages `userAnswers` and quiz completion

---

## The Quiz Component After

```jsx
function Quiz() {
  const [userAnswers, setUserAnswers] = useState([]);
  const activeQuestionIndex = userAnswers.length;
  const quizIsComplete = activeQuestionIndex === QUESTIONS.length;

  const handleSelectAnswer = useCallback((selectedAnswer) => {
    setUserAnswers(prev => [...prev, selectedAnswer]);
  }, []);

  const handleSkipAnswer = useCallback(() => handleSelectAnswer(null), [handleSelectAnswer]);

  if (quizIsComplete) {
    return <Summary userAnswers={userAnswers} />;
  }

  return (
    <div id="quiz">
      <Question
        key={activeQuestionIndex}
        index={activeQuestionIndex}
        onSelectAnswer={handleSelectAnswer}
        onSkipAnswer={handleSkipAnswer}
      />
    </div>
  );
}
```

Much cleaner! The Quiz only cares about *which* question we're on and *what answers were given*.

---

## Important: `key` Is Reserved

You might think you can use `key` as a prop inside your component:

```jsx
// ❌ This does NOT work!
export default function Question({ key }) {
  console.log(key); // undefined!
}
```

The `key` prop is **exclusively reserved for React's internal use**. You cannot access it inside your component. If you need the same value, create a separate prop:

```jsx
<Question key={activeQuestionIndex} index={activeQuestionIndex} />
```

---

## Disabling Buttons After Selection

A nice UX improvement: disable all answer buttons once an answer is selected so users can't change their mind:

```jsx
<button
  disabled={answerState !== ''}
  className={cssClass}
  onClick={() => onSelect(answer)}
>
  {answer}
</button>
```

If `answerState` is anything other than empty string (meaning an answer has been selected), all buttons become disabled.

---

## The Principle: State Should Live Where It's Used

This is sometimes called **"moving state down"** or **"colocating state"**:

- If only one component needs a piece of state → keep it in that component
- If a parent and child both need it → keep it in the parent (lifting state up)
- If only a child needs it → move it down to the child

The fewer components a piece of state flows through, the simpler your code becomes.

---

✅ **Key Takeaway**: Don't lift state higher than necessary. If a parent component is only managing state to pass it down as props, that state probably belongs in the child.

✅ **Key Takeaway**: The `key` prop is reserved by React and cannot be accessed inside a component. Always create a separate prop if you need that value internally.

💡 **Pro Tip**: When a component starts having too many props, ask: "Does this component *really* need all this data, or is it just passing it through?" That's your signal to move state down or restructure your component tree.
