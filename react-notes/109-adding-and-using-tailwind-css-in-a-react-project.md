# Adding & Using Tailwind CSS in a React Project

## Introduction

Now that Tailwind CSS is installed and set up, let's explore the practical side: **customizing Tailwind** and **mixing your own CSS** with Tailwind's utility classes. Because while Tailwind gives you a lot out of the box, real projects almost always need some custom configuration.

---

## You Can Still Write Your Own CSS

Adding Tailwind doesn't mean you abandon CSS entirely. In your `index.css` (where the Tailwind directives live), you can still add your own CSS rules:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-image: url('./assets/bg.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  min-height: 100vh;
}
```

Tailwind handles utility classes, but for things like custom background images or global resets, writing plain CSS is perfectly fine.

---

## Customizing Tailwind: Adding Custom Fonts

Tailwind is **highly configurable** through its `tailwind.config.js` file. One common customization is adding custom fonts.

### Step 1: Import the font (in `index.html`)

```html
<link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet">
```

### Step 2: Register it in `tailwind.config.js`

```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        title: ['"Pacifico"', 'cursive'],
      },
    },
  },
  plugins: [],
};
```

Key details:
- `fontFamily` tells Tailwind you're adding a new font
- `title` is **your custom name** — you choose it
- The font name with spaces needs double quotes inside single quotes: `'"Pacifico"'`
- `cursive` is a CSS fallback

### Step 3: Use it in your component

```jsx
<h1 className="font-title text-4xl uppercase text-amber-800">
  ReactArt
</h1>
```

The `font-title` class is now available because you added the `title` entry under `fontFamily` in the config.

---

## Styling with Built-In Colors

Tailwind ships with a comprehensive color palette. You can color text, backgrounds, borders, and more:

```jsx
{/* Text colors */}
<p className="text-stone-500">Gray paragraph</p>
<h1 className="text-amber-800">Warm amber heading</h1>

{/* Background colors */}
<div className="bg-stone-700">Dark background</div>
```

The naming pattern is always: `{property}-{color}-{shade}`
- Property: `text`, `bg`, `border`, etc.
- Color: `stone`, `amber`, `red`, `blue`, etc.
- Shade: `50` (lightest) to `950` (darkest)

💡 **Pro Tip:** You can set your own custom colors in `tailwind.config.js` under `theme.extend.colors` if the built-in palette doesn't have the exact shade you need.

---

## A Complete Styled Header Example

```jsx
export default function Header() {
  return (
    <header className="flex flex-col items-center mt-8 mb-16">
      <img
        src={logo}
        alt="ReactArt logo"
        className="mb-8 w-44 h-44 object-contain"
      />
      <h1 className="font-title text-4xl font-semibold tracking-widest text-center uppercase text-amber-800">
        ReactArt
      </h1>
      <p className="text-stone-500">
        A community of artists and art-lovers.
      </p>
    </header>
  );
}
```

Every style is applied through utility classes. No separate CSS file, no class name collisions, and if you need to tweak something, you just change a class.

---

## The Tradeoff: Long Class Lists

Yes, some elements end up with a lot of classes. That `<h1>` has seven classes on it. If this bothers you, Tailwind might not be your preferred approach — and that's totally fine.

But remember: in React, you can **wrap** these elements in reusable components. The long class list lives inside the component definition. The consumer of the component never sees it.

---

## ✅ Key Takeaways

- You can mix **custom CSS rules** with Tailwind in the same `index.css` file
- Tailwind is **customizable** through `tailwind.config.js` — add fonts, colors, spacing, and more
- Use `theme.extend` to **add to** Tailwind's defaults without overriding them
- Tailwind's color palette follows a consistent naming pattern: `{property}-{color}-{shade}`
- Long class lists are the tradeoff — reusable components help manage this

## 💡 Pro Tip

When customizing `tailwind.config.js`, always use `theme.extend` instead of `theme` directly. Using `theme` replaces Tailwind's defaults entirely, which means you lose all the built-in utilities. `extend` adds your customizations on top.
