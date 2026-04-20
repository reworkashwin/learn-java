# Adding Challenges to the Demo Project

## Introduction

To explore deeper ref use cases, we need a more complex app. This lecture builds out the **TimerChallenge** component — the core of our demo project. It's a timed game where players start a countdown and try to stop it as close to zero as possible without letting time expire.

---

## Building the TimerChallenge Component

The component is designed to be **reusable** with different configurations:

```jsx
export default function TimerChallenge({ title, targetTime }) {
  return (
    <section className="challenge">
      <h2>{title}</h2>
      <p className="challenge-time">
        {targetTime} second{targetTime > 1 ? 's' : ''}
      </p>
      <p>
        <button>Start Challenge</button>
      </p>
      <p>Timer inactive</p>
    </section>
  );
}
```

### Key Design Decisions

- **`title`** prop — labels the difficulty level
- **`targetTime`** prop — the countdown duration in seconds
- **Conditional plural** — `second` vs `seconds` based on whether `targetTime > 1`
- **Placeholder UI** — button text and status will later be dynamic based on state

---

## Using TimerChallenge in the App

The component is rendered multiple times with different configurations:

```jsx
import TimerChallenge from './TimerChallenge';

function App() {
  return (
    <div id="challenges">
      <TimerChallenge title="Easy" targetTime={1} />
      <TimerChallenge title="Not Easy" targetTime={5} />
      <TimerChallenge title="Getting Tough" targetTime={10} />
      <TimerChallenge title="Pros Only" targetTime={15} />
    </div>
  );
}
```

Each instance is an **independent component** with its own state and behavior — a perfect example of component reusability.

---

## What's Coming Next

Right now, clicking the button does nothing. In the upcoming lectures, we'll:
1. Add state to manage the timer
2. Start/stop the timer with `setTimeout` / `setInterval`
3. Use **refs** to store timer IDs (you'll see why variables and state won't work)
4. Show results in a modal

This setup gives us a real-world scenario where refs shine — not for DOM access, but for **managing values behind the scenes**.

---

## ✅ Key Takeaways

- The TimerChallenge component is **reusable** — same code, different configs via props
- Each component instance operates independently with its own state
- The conditional `s` in "second/seconds" is a small but useful JS pattern: `targetTime > 1 ? 's' : ''`
- The real learning begins when we add timer logic and discover where state falls short and refs save the day

## 💡 Pro Tips

- When building a UI feature, start with the **static markup first** (as done here), then layer in interactivity — it's much easier to reason about the structure before adding state
- Designing a component to accept configuration through props from the start makes it inherently reusable
