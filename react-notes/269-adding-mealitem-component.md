# Adding a MealItem Component

## Introduction

We have meals loading from the backend and rendering as a plain list of names. Now it's time to make them look good — images, descriptions, prices, and an "Add to Cart" button for each meal.

This means creating a dedicated **MealItem** component. It's a good exercise in component decomposition: when your list item markup gets complex, extract it into its own component.

---

## Why a Separate Component?

You could put all the meal item markup directly inside the `Meals` component's `.map()` call. That would work. But here's why a separate component is better:

1. **Readability**: The Meals component stays focused on *fetching and listing*, while MealItem handles *displaying a single meal*
2. **Reusability**: MealItem could be used in other contexts (search results, favorites page)
3. **State isolation**: When MealItem eventually needs its own state (like an "added to cart" animation), it won't clutter the parent

---

## Building the MealItem Component

```jsx
// src/components/MealItem.jsx
export default function MealItem({ meal }) {
  return (
    <li className="meal-item">
      <article>
        <img
          src={`http://localhost:3000/${meal.image}`}
          alt={meal.name}
        />
        <div>
          <h3>{meal.name}</h3>
          <p className="meal-item-price">{meal.price}</p>
          <p className="meal-item-description">{meal.description}</p>
        </div>
        <p className="meal-item-actions">
          <button>Add to Cart</button>
        </p>
      </article>
    </li>
  );
}
```

### Key decisions:

**Single `meal` prop vs multiple props**: I'm passing a single `meal` object rather than destructuring into `name`, `price`, `description`, etc. This is a preference — both approaches work. A single prop means less typing; multiple props mean more explicit contracts.

**The image URL**: The backend stores relative image paths like `images/pizza.jpg`. The frontend needs the full URL, so we prepend the backend's base URL:

```jsx
src={`http://localhost:3000/${meal.image}`}
```

Using template literals (backticks) makes string concatenation clean and readable.

**The "Add to Cart" button**: It doesn't do anything yet. We'll wire it up when we build the cart system.

---

## Using MealItem in Meals

Replace the simple list items with the new component:

```jsx
// src/components/Meals.jsx
import MealItem from './MealItem';

export default function Meals() {
  const [loadedMeals, setLoadedMeals] = useState([]);

  useEffect(() => {
    async function fetchMeals() {
      const response = await fetch('http://localhost:3000/meals');
      const meals = await response.json();
      setLoadedMeals(meals);
    }
    fetchMeals();
  }, []);

  return (
    <ul id="meals">
      {loadedMeals.map((meal) => (
        <MealItem key={meal.id} meal={meal} />
      ))}
    </ul>
  );
}
```

Notice that the `key` stays on the outermost element in the `.map()` call — that's `<MealItem>`, not the `<li>` inside it.

---

## CSS Classes for Styling

The provided `index.css` has pre-built styles for:
- `.meal-item` — card layout
- `.meal-item-price` — price formatting
- `.meal-item-description` — text styling
- `.meal-item-actions` — button positioning

By using these class names, the meals automatically look polished without writing any CSS.

---

## The Image Path Problem

A common gotcha when working with backends: the image path in the database is relative to the backend server, not the frontend. If you just use `meal.image` directly:

```jsx
// ❌ Doesn't work — tries to load from the frontend server
<img src={meal.image} />
```

The browser would look for `images/pizza.jpg` on `localhost:5173` (the frontend), where it doesn't exist. You need the full backend URL:

```jsx
// ✅ Works — loads from the backend server
<img src={`http://localhost:3000/${meal.image}`} />
```

In production, you'd typically serve images from a CDN or the same domain, making this a non-issue. But during development with separate servers, prepending the backend URL is necessary.

---

## ✅ Key Takeaways

- Extract complex list item markup into its own component for readability and reusability
- Use template literals to construct dynamic image URLs
- Keep the `key` prop on the component element in `.map()`, not on internal elements
- Leverage CSS class names from the provided stylesheet to get instant styling
- Placeholder buttons (like "Add to Cart") are fine — wire them up later

## ⚠️ Common Mistakes

- Forgetting to prepend the backend URL to image paths — images won't load
- Putting the `key` on the `<li>` inside MealItem instead of on `<MealItem>` — React needs the key on the outermost element in the map
- Passing `meal.id` as `key` but forgetting to verify the data has an `id` field

## 💡 Pro Tip

When debugging "images not loading" issues, open your browser's Network tab and look at the image requests. You'll see the exact URL being requested and can quickly spot whether the path is wrong, the server is down, or there's a 404.
