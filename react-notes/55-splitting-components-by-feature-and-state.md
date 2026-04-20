# Splitting Components By Feature & State

## Introduction

We identified that our `App` component is doing too much. Now let's actually **do the refactoring** — extracting the core concepts section and the interactive examples section into their own dedicated components.

---

## Creating the CoreConcepts Component

### Step 1: Create the File

Add a new file `CoreConcepts.jsx` in the components folder.

### Step 2: Move the JSX

Cut the entire `<section>` for core concepts from `App.jsx` and move it into the new component:

```jsx
import CoreConcept from './CoreConcept.jsx';
import { CORE_CONCEPTS } from '../data.js';

export default function CoreConcepts() {
  return (
    <section id="core-concepts">
      <h2>Core Concepts</h2>
      <ul>
        {CORE_CONCEPTS.map((item) => (
          <CoreConcept key={item.title} {...item} />
        ))}
      </ul>
    </section>
  );
}
```

### Step 3: Move the Imports

The new component needs its own imports — the `CoreConcept` child component and the `CORE_CONCEPTS` data. Remove these imports from `App.jsx` since they're no longer needed there.

---

## Creating the Examples Component

### Step 1: Create the File

Add a new file `Examples.jsx` in the components folder.

### Step 2: Move Everything — JSX, State, and Logic

This is more involved because the examples section owns **state and event handlers**. Move all of it:

```jsx
import { useState } from 'react';
import TabButton from './TabButton.jsx';
import { EXAMPLES } from '../data.js';

export default function Examples() {
  const [selectedTopic, setSelectedTopic] = useState();

  function handleSelect(selectedButton) {
    setSelectedTopic(selectedButton);
  }

  let tabContent = <p>Please select a topic.</p>;

  if (selectedTopic) {
    tabContent = (
      <div id="tab-content">
        <h3>{EXAMPLES[selectedTopic].title}</h3>
        <p>{EXAMPLES[selectedTopic].description}</p>
        <pre><code>{EXAMPLES[selectedTopic].code}</code></pre>
      </div>
    );
  }

  return (
    <section id="examples">
      <h2>Examples</h2>
      <menu>
        <TabButton isSelected={selectedTopic === 'components'} onClick={() => handleSelect('components')}>Components</TabButton>
        <TabButton isSelected={selectedTopic === 'jsx'} onClick={() => handleSelect('jsx')}>JSX</TabButton>
        <TabButton isSelected={selectedTopic === 'props'} onClick={() => handleSelect('props')}>Props</TabButton>
        <TabButton isSelected={selectedTopic === 'state'} onClick={() => handleSelect('state')}>State</TabButton>
      </menu>
      {tabContent}
    </section>
  );
}
```

### Step 3: Clean Up App.jsx

The `App` component is now beautifully lean:

```jsx
import Header from './components/Header.jsx';
import CoreConcepts from './components/CoreConcepts.jsx';
import Examples from './components/Examples.jsx';

function App() {
  return (
    <>
      <Header />
      <main>
        <CoreConcepts />
        <Examples />
      </main>
    </>
  );
}
```

---

## The Result: No More Unnecessary Re-Renders

Remember the bug where clicking tabs changed the header text? **It's gone now.**

Why? Because `selectedTopic` state now lives inside `Examples`, not `App`. When state updates:

- **Before**: `App` re-renders → `Header` re-renders → random number changes
- **After**: Only `Examples` re-renders → `Header` is untouched

The header's random number stays stable because `App` doesn't re-execute when tab state changes.

---

## The Refactoring Pattern

1. **Identify the feature** you want to extract
2. **Create a new component file**
3. **Move the JSX** for that feature
4. **Move any related state and logic** (hooks, handlers, derived values)
5. **Move the necessary imports** to the new file
6. **Clean up the parent** — remove unused imports and code
7. **Import and use** the new component in the parent

---

## ✅ Key Takeaways

- Splitting by feature means each component owns its **own section of UI, its own state, and its own logic**
- State should live in the component that **needs it** — not higher up than necessary
- After splitting, the parent component becomes a clean layout / composition component
- Moving state down prevents unnecessary re-renders of sibling components

## ⚠️ Common Mistakes

- **Forgetting to move imports**: When you move JSX code, you also need to move the imports it depends on
- **Leaving dead imports in the parent**: Clean up imports that the parent no longer uses
- **Not moving state with the feature**: If the state is only used by the feature you're extracting, move it to the new component

## 💡 Pro Tips

- A well-split app has a very lean root `App` component that's mostly just **composing** other components
- The rule of thumb: state should live as **close to where it's used** as possible
- If two sibling components need the same state, keep it in their parent (this is called "lifting state up")
