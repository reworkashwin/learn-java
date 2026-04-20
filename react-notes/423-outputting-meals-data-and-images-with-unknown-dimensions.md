# Outputting Meals Data & Images With Unknown Dimensions

## Introduction

With the basic pages set up, it's time to build the core feature: displaying meals. This involves creating reusable grid and item components, and tackling a common challenge in Next.js — how to handle the `<Image>` component when you **don't know the image dimensions** in advance.

---

## Building the Meals Grid Component

The idea is simple: create a `MealsGrid` component that accepts an array of meals and renders them in a grid layout, and a `MealItem` component that displays the details of each individual meal.

### MealsGrid

```jsx
import MealItem from './meal-item';
import classes from './meals-grid.module.css';

export default function MealsGrid({ meals }) {
  return (
    <ul className={classes.meals}>
      {meals.map((meal) => (
        <li key={meal.id}>
          <MealItem {...meal} />
        </li>
      ))}
    </ul>
  );
}
```

Notice the `{...meal}` spread syntax. This takes all the properties of the `meal` object and passes them as individual props to `MealItem`. It's a clean shorthand when the object properties match the expected prop names.

### MealItem

The `MealItem` component receives props like `title`, `slug`, `image`, `summary`, and `creator`, and renders them in a structured layout. Two things are particularly interesting about this component:

#### 1. Dynamic Links to Detail Pages

```jsx
<Link href={`/meals/${slug}`}>
  {/* meal content */}
</Link>
```

Each meal links to its own detail page using the `slug` — the dynamic segment defined in the `[mealSlug]` folder.

#### 2. The `fill` Prop on Next.js Image

This is where things get interesting.

---

## Handling Images With Unknown Dimensions

Next.js's `<Image>` component is powerful — it optimizes images, lazy-loads them, and serves them in modern formats. But it **needs to know the image dimensions** (width and height) to work properly.

### When Dimensions Are Known

If you import an image from the local file system, Next.js can **automatically detect** the dimensions:

```jsx
import logo from '../assets/logo.png';
// Next.js knows the width and height of logo.png at build time
<Image src={logo} alt="Logo" />
```

### When Dimensions Are Unknown

When images come from a **database** or are **uploaded by users**, Next.js can't know the dimensions at build time. The path is just a string pointing to a file — the actual file metadata isn't available.

You have two options:

#### Option A: Explicitly Set Width and Height

```jsx
<Image src={meal.image} alt={meal.title} width={400} height={300} />
```

This works if you know (or can standardize) the dimensions.

#### Option B: Use the `fill` Prop

```jsx
<Image src={meal.image} alt={meal.title} fill />
```

The `fill` prop tells Next.js: "I don't know the exact dimensions — just fill the available space defined by the parent container." You then control the size through CSS on the parent element.

This is ideal for:
- User-uploaded images (unknown dimensions)
- Dynamic content from databases
- Any scenario where image sizes vary

---

## Using the MealsGrid on the Page

```jsx
import MealsGrid from '@/components/meals/meals-grid';

export default function MealsPage() {
  return (
    <>
      <header className={classes.header}>
        <h1>Delicious meals, created <span className={classes.highlight}>by you</span></h1>
        <p>Choose your favorite recipe and cook it yourself. It is easy and fun!</p>
        <p className={classes.cta}>
          <Link href="/meals/share">Share Your Favorite Recipe</Link>
        </p>
      </header>
      <main className={classes.main}>
        <MealsGrid meals={[]} />
      </main>
    </>
  );
}
```

At this point, the meals array is empty — we haven't connected a data source yet. But the structure is in place and ready.

---

## ✅ Key Takeaways

- Create reusable grid/item components to display lists of data
- Use the spread operator (`{...meal}`) to forward object properties as props
- Next.js `<Image>` requires known dimensions — use `fill` when you don't have them
- The `fill` prop makes the image fill its parent container, controlled by CSS

## ⚠️ Common Mistakes

- Using `<Image>` with a dynamic `src` string without setting `width`/`height` or `fill` — this will cause an error
- Forgetting to set proper CSS on the parent container when using `fill` — the image needs a positioned parent

## 💡 Pro Tip

When using `fill`, make sure the parent element has `position: relative` in CSS. The `fill` prop uses absolute positioning under the hood, so it needs a positioned ancestor to size itself correctly.
