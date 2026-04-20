# Styling Buttons & Inputs with Tailwind CSS

## Introduction

We've got our `NewProject` form and reusable `Input` component on screen, but they're visually unpolished. This lesson dives deep into styling form elements with Tailwind CSS — including a clever trick for sharing classes between an `<input>` and a `<textarea>`.

---

## Styling the NewProject Container

The wrapper `<div>` gets a custom width using Tailwind's bracket syntax:

```jsx
<div className="w-[35rem] mt-16">
```

### Custom values in Tailwind

When Tailwind's predefined sizes don't fit your needs, you can use the **arbitrary value syntax**: `w-[35rem]`. Tailwind dynamically generates a class for this value. It's incredibly useful for one-off sizes that don't align with the default scale.

---

## Styling the Button Area

The `<menu>` wrapping Cancel and Save gets flexbox treatment:

```jsx
<menu className="flex items-center justify-end gap-4 my-4">
```

- **`justify-end`** — Pushes buttons to the right edge
- **`items-center`** — Vertically centers them
- **`gap-4`** — Adds consistent spacing between buttons

### Two different button styles

The **Cancel button** should be subtle (it's a secondary action):

```jsx
<button className="text-stone-800 hover:text-stone-950">Cancel</button>
```

The **Save button** should be prominent (it's the primary action):

```jsx
<button className="px-6 py-2 rounded-md bg-stone-800 text-stone-50 hover:bg-stone-950">
  Save
</button>
```

This visual hierarchy guides users toward the intended action — a fundamental UX principle.

---

## Styling the Input Component

Here's where it gets interesting. Both `<textarea>` and `<input>` should share the exact same classes. Instead of duplicating a long class string, we store it in a variable:

```jsx
export default function Input({ label, textarea, ...props }) {
  const classes = "w-full p-1 border-b-2 rounded-sm border-stone-300 bg-stone-200 text-stone-600 focus:outline-none focus:border-stone-600";

  return (
    <p className="flex flex-col gap-1 my-4">
      <label className="text-sm font-bold uppercase text-stone-500">
        {label}
      </label>
      {textarea ? (
        <textarea className={classes} {...props} />
      ) : (
        <input className={classes} {...props} />
      )}
    </p>
  );
}
```

### Breaking down the input styles

| Class | Purpose |
|---|---|
| `w-full` | Input takes full available width |
| `p-1` | Small padding inside the field |
| `border-b-2` | Bottom border only (underline style) |
| `bg-stone-200` | Light gray background |
| `focus:outline-none` | Removes default browser outline on focus |
| `focus:border-stone-600` | Darker border when focused — replaces the outline |

### The `focus:` prefix

Just like `hover:`, Tailwind's `focus:` prefix applies styles only when the element receives focus. Here, we remove the default outline (which can look jarring) and replace it with a more elegant border color change.

---

## Why Store Classes in a Variable?

When multiple elements need identical styling, extracting the class string into a constant eliminates duplication and makes updates trivial — change it in one place, both elements update.

```jsx
const classes = "w-full p-1 border-b-2 ...";
// Used by both <textarea> and <input>
```

---

## ✅ Key Takeaways

- Use **arbitrary values** (`w-[35rem]`) for custom sizes not in Tailwind's default scale.
- Design **visual hierarchy** into your buttons — primary actions should look distinctly different from secondary ones.
- **Store shared class strings** in variables to avoid duplication across similar elements.
- Use `focus:` prefixes to create polished, accessible focus states on form inputs.

---

## ⚠️ Common Mistakes

- **Forgetting `focus:outline-none`** when adding custom focus styles. Without it, you'll see both the browser's default outline AND your custom border, which looks messy.
- **Not adding `hover:` states to buttons.** Buttons without hover feedback feel broken to users.
