# A First Component & Some State

## Introduction

Every project starts somewhere, and for our quiz app, it starts with two foundational pieces: a **Header component** and a **Quiz component**. This lecture walks through the initial setup — creating components, importing assets, and making early state management decisions that will shape the entire project.

---

## Step 1: The Header Component

The header is a simple, stateless component. No effects, no hooks — just JSX:

```jsx
// components/Header.jsx
import logoImg from '../assets/quiz-logo.png';

export default function Header() {
  return (
    <header>
      <img src={logoImg} alt="Quiz logo" />
      <h1>ReactQuiz</h1>
    </header>
  );
}
```

### Key points:
- **Image imports**: In Vite-based projects, importing an image gives you an optimized path that you can set as the `src` attribute
- **Component structure**: Not every component needs state or effects. Most components are simple presentational wrappers like this

Then use it in `App.jsx`:

```jsx
import Header from './components/Header';

function App() {
  return <Header />;
}
```

---

## Step 2: The Quiz Component — Initial Setup

The `Quiz` component is where the real action happens. It needs to:
1. Display the **currently active question**
2. **Switch questions** when the user answers
3. **Store user answers** throughout the quiz

```jsx
// components/Quiz.jsx
import { useState } from 'react';

export default function Quiz() {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  return <div>Currently active question</div>;
}
```

---

## State Design Decisions

### Managing the Active Question

Since questions come as an array (from dummy data), we can manage which question is shown by tracking its **index**:

```jsx
const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
```

When the user answers, increment the index to move to the next question. Simple and effective.

### Tracking User Answers

Every time the user picks an answer, add it to an array:

```jsx
const [userAnswers, setUserAnswers] = useState([]);
```

This gives us a complete record of what the user selected, which we'll use later to calculate results.

### But Is This the Best Approach?

The instructor hints that managing these as **two separate pieces of state** might not be optimal. Why? Because they're related — the active question index is essentially just `userAnswers.length`. If you've answered 3 questions, you should be looking at question 4 (index 3).

This is a concept called **derived state** — where one value can be computed from another. Instead of storing both:

```jsx
// Instead of two states...
const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);  
const [userAnswers, setUserAnswers] = useState([]);

// You could derive the index:
const [userAnswers, setUserAnswers] = useState([]);
const activeQuestionIndex = userAnswers.length;  // derived!
```

We'll explore this optimization in upcoming lectures.

---

## A Reminder About Practice

This is a great section to **pause and try things yourself**. When you hear "I'm going to add a component that does X," stop the video and try to build it before seeing the solution. The struggle is where learning happens.

---

## ✅ Key Takeaways

- Start with simple components (like `Header`) before building complex ones
- In Vite/React projects, import images directly to get optimized paths
- Use array indices to track position in ordered data (like quiz questions)
- Consider whether state can be **derived** from other state instead of managed independently
- Not every component needs hooks — simple presentational components are the majority

## ⚠️ Common Mistakes

- Creating separate state variables for values that can be derived from each other
- Overcomplicating initial component setup — start simple, add complexity as needed

## 💡 Pro Tip

Before adding a new `useState`, always ask: *"Can I compute this from existing state?"* If yes, it's derived state and doesn't need its own `useState`. This reduces bugs caused by state getting out of sync.
