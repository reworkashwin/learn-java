# Testing User Interaction & State

## Introduction

So far, we've tested static output — "is this text on the screen?" But real components are dynamic. They have state, they respond to user clicks, and their output changes based on interactions. This is where testing gets genuinely useful. You'll learn how to simulate user events, test state changes, and — critically — why you should test **all possible scenarios**, not just the happy path.

---

### Concept 1: Adding State to Our Component

#### 🧠 What is it?

We enhance the `Greeting` component with `useState` so that clicking a button changes the displayed text. This gives us multiple scenarios to test.

#### ⚙️ How it works

```javascript
import { useState } from 'react';

function Greeting() {
  const [changedText, setChangedText] = useState(false);

  function changeTextHandler() {
    setChangedText(true);
  }

  return (
    <div>
      <h2>Hello World!</h2>
      {!changedText && <p>It's good to see you.</p>}
      {changedText && <p>Changed!</p>}
      <button onClick={changeTextHandler}>Change Text</button>
    </div>
  );
}
```

Now the component has two states:
- **Before click:** Shows "It's good to see you."
- **After click:** Shows "Changed!"

#### 💡 Insight

This is a simple example, but it represents a very common pattern — components whose output depends on user interaction. And the testing principles you learn here apply to *any* interactive component.

---

### Concept 2: Testing the Initial State (Before Interaction)

#### 🧠 What is it?

Before any user interaction, the component should display its default state. This is the first scenario to test.

#### ⚙️ How it works

```javascript
test('renders good to see you if the button was not clicked', () => {
  // Arrange
  render(<Greeting />);

  // Act — nothing (no click)

  // Assert
  const outputElement = screen.getByText('good to see you', { exact: false });
  expect(outputElement).toBeInTheDocument();
});
```

We render the component, don't interact with it, and verify the initial paragraph is there.

#### 💡 Insight

Testing initial state might seem trivial, but it catches bugs like accidentally showing the wrong text on first render, or conditionally rendering something incorrectly.

---

### Concept 3: Simulating User Events with `userEvent`

#### 🧠 What is it?

`userEvent` is a utility from `@testing-library/user-event` that lets you simulate user interactions — clicks, typing, hovering, and more — in your tests.

#### ❓ Why do we need it?

Because you can't physically click a button in a virtual DOM. `userEvent` bridges that gap by programmatically triggering the same events a real user would cause.

#### ⚙️ How it works

```javascript
import userEvent from '@testing-library/user-event';

// Find the button and click it
const buttonElement = screen.getByRole('button');
userEvent.click(buttonElement);
```

Available interactions include:
- `userEvent.click(element)` — Simulate a click
- `userEvent.dblClick(element)` — Simulate a double-click
- `userEvent.type(element, 'text')` — Simulate typing
- `userEvent.hover(element)` — Simulate hovering

#### 💡 Insight

`getByRole('button')` is a great way to select buttons — it uses the element's ARIA role, which is more semantic than searching by text. This also works for links (`'link'`), headings (`'heading'`), and other elements.

---

### Concept 4: Testing State After Interaction

#### 🧠 What is it?

After simulating a button click, we verify that the component's output has changed as expected.

#### ⚙️ How it works

```javascript
test('renders Changed! if the button was clicked', () => {
  // Arrange
  render(<Greeting />);

  // Act
  const buttonElement = screen.getByRole('button');
  userEvent.click(buttonElement);

  // Assert
  const outputElement = screen.getByText('Changed!');
  expect(outputElement).toBeInTheDocument();
});
```

The Three A's in full action: arrange (render), act (click button), assert (check new text).

---

### Concept 5: Testing That Elements Disappear

#### 🧠 What is it?

It's not enough to check that the *new* text appears — you should also verify that the *old* text is **gone**. This catches bugs where both texts show up simultaneously.

#### ❓ Why do we need it?

Imagine a developer forgets to render the initial paragraph conditionally — it's always visible. The tests that check "Changed! is shown" and "good to see you is shown initially" would *both pass*. Only a test that checks "good to see you is NOT shown after clicking" would catch this bug.

#### ⚙️ How it works

```javascript
test('does not render good to see you if the button was clicked', () => {
  // Arrange
  render(<Greeting />);

  // Act
  const buttonElement = screen.getByRole('button');
  userEvent.click(buttonElement);

  // Assert
  const outputElement = screen.queryByText('good to see you', { exact: false });
  expect(outputElement).toBeNull();
});
```

Key details:
- Use **`queryByText`** instead of `getByText` — because `getByText` throws an error if the element isn't found, and here we *want* it to not be found
- Use **`toBeNull()`** as the matcher — this checks that `queryByText` returned `null`

#### 💡 Insight

This is a critical testing pattern: **always test what should NOT be there, not just what should.** The absence of something is just as important as its presence. This is one of the most valuable habits you can build.

---

## ✅ Key Takeaways

- Use `userEvent` from `@testing-library/user-event` to simulate clicks, typing, and other interactions
- Test **all scenarios**: initial state, state after interaction, and state transitions
- Use `queryByText` (not `getByText`) when you expect an element to be **absent** — it returns `null` instead of throwing
- Use `toBeNull()` to assert that an element doesn't exist
- Always test what **should disappear** — not just what should appear

## ⚠️ Common Mistakes

- Only testing the happy path — if you don't test that old content disappears, bugs hide in plain sight
- Using `getByText` to check for absence — it throws an error instead of returning null
- Forgetting to import `userEvent` from `@testing-library/user-event`

## 💡 Pro Tips

- Use `getByRole('button')` to find buttons — it's more robust than searching by text content
- Write tests in pairs: "shows X when condition is true" AND "does not show X when condition is false"
- `screen.debug()` prints the current DOM state to the console — invaluable for debugging failing tests
