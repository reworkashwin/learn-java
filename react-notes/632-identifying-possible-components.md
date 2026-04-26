# Identifying Possible Components

## Introduction

You've got a working app — the data renders, everything looks right. But is the code *good*? Before you move on, it's worth pausing and asking: **where can I split this into components?** Identifying logical component boundaries is a core React skill, and it's what separates messy monoliths from clean, maintainable codebases.

---

## Concept 1: Why Split Into Components?

### 🧠 What is it?

Component identification is the process of looking at your existing JSX and asking: "Which parts of this UI are logically distinct? Which parts are repeated? Which parts could be reused?"

### ❓ Why do we need it?

Even for a simple app, leaving all your JSX in one giant component creates problems:

- **Repetition** — If you have the same structure repeated (like three list items), any change has to be made in three places.
- **Maintenance** — Want to remove a description paragraph? You'd need to delete it manually in every copy.
- **Readability** — One massive component is harder to reason about than several focused ones.

### ⚙️ How it works

Look at your current JSX and ask two questions:

1. **Is there a logically distinct section?** — For example, a header is a self-contained visual block. It could live in its own component even if it's only used once.
2. **Is there repeated structure?** — If the same HTML pattern appears multiple times with different data, that's a strong signal for a reusable component.

### 🧪 Example

In our key concepts app, we can identify at least two natural components:

- **Header** — The top section with the logo and title. It's a distinct visual block.
- **ConceptItem** — Each list item showing an image, title, and description. This structure is repeated three times with different data — a perfect candidate for a reusable component.

Optionally, you could also wrap the entire concepts list in its own component, but that's less critical.

### 💡 Insight

For a tiny demo app, leaving everything in one file is fine. But React is *designed* for component-based architecture. Practicing component identification early — even on small projects — builds the muscle memory you'll need for real-world apps where components are essential.

---

## Concept 2: The Reusability Argument

### 🧠 What is it?

The strongest argument for extracting a component is **reusability**. When the same structure appears multiple times, a reusable component lets you define it once and use it many times with different data via props.

### ❓ Why do we need it?

Consider what happens without a reusable component: if you decide to remove the description paragraph from each concept item, you'd have to find and delete it in three separate places. That's tedious and error-prone. With a component, you change it once, and all instances update.

### ⚙️ How it works

- Identify the repeated block of JSX (e.g., the `<li>` with image, title, and description).
- Extract it into its own component file.
- Make the component configurable through **props** so each instance can display different data.
- Replace the repeated blocks with your custom component, passing the appropriate data as props.

### 💡 Insight

Not every piece of JSX needs to be its own component. The **header**, for instance, isn't reused — but extracting it still keeps your main `App` component clean and focused. The **concept item**, however, is reused three times — that's where component extraction gives you the biggest win.

---

## ✅ Key Takeaways

- Look for **repeated patterns** in your JSX — those are prime candidates for reusable components
- Even non-reused sections (like a header) can benefit from being extracted for clarity
- Components eliminate code duplication — change the structure once, and all instances reflect the change
- Component identification is a thinking exercise you should do before jumping into code

## ⚠️ Common Mistakes

- Over-splitting — not every `<div>` needs its own component. Split where there's a logical boundary or reuse opportunity
- Under-splitting — leaving everything in one component because "it works" leads to maintainability issues down the road

## 💡 Pro Tips

- A good rule of thumb: if you copy-paste the same JSX structure more than once, it should probably be a component
- Think about components in terms of **responsibility** — each component should do one thing well
- Start simple, then refactor into components as patterns emerge
