# Splitting the App Into Components

## Introduction

The first task in our investment calculator project is to take one big `App` component and split it into smaller, focused components. This is one of the most fundamental skills in React — identifying logical building blocks and giving each its own file and responsibility.

---

## Identifying the Components

### 🧠 What is it?

Looking at the UI, three main building blocks emerge:
1. **Header** — The logo and title section
2. **UserInput** — The form with all the input fields
3. **ResultsTable** — The table displaying calculation results

### ❓ Why split?

A single monolithic component works for tiny apps, but it quickly becomes:
- Hard to read and maintain
- Difficult to reuse parts independently
- A mess when multiple developers work on the same file

---

## Creating the Components

### ⚙️ How it works

Set up a `components` folder with subfolders for each component:

```
components/
  Header/
    Header.js
  UserInput/
    UserInput.js
  ResultsTable/
    ResultsTable.js
```

**Header.js:**
```jsx
import logo from '../../assets/investment-calculator-logo.png';

const Header = () => {
  return (
    <header id="header">
      <img src={logo} alt="logo" />
      <h1>Investment Calculator</h1>
    </header>
  );
};

export default Header;
```

Key detail: the image import path must be adjusted (`../../assets/...`) because the file is now nested two levels deep.

**UserInput.js:**
```jsx
const UserInput = () => {
  return (
    <form id="user-input">
      {/* All the input fields and buttons */}
    </form>
  );
};

export default UserInput;
```

**ResultsTable.js:**
```jsx
const ResultsTable = () => {
  return (
    <table id="result">
      {/* Table head and body */}
    </table>
  );
};

export default ResultsTable;
```

### 🧪 Example — Updated App.js

```jsx
import Header from './components/Header/Header';
import UserInput from './components/UserInput/UserInput';
import ResultsTable from './components/ResultsTable/ResultsTable';

function App() {
  return (
    <div>
      <Header />
      <UserInput />
      <ResultsTable />
    </div>
  );
}

export default App;
```

---

## How Granular Should You Go?

### 💡 Insight

You **could** create even more components:
- A separate component for each input field group (label + input)
- Separate `TableHead` and `TableBody` components
- A `TableRow` component for dynamic rows

But for this exercise, three components is a solid split. You can always refactor later if a component grows too large.

### The Rule of Thumb

If a component does more than one clear thing, or if it's getting hard to scroll through — it's time to split.

---

## ✅ Key Takeaways

- Identify **logical building blocks** in the UI as candidates for components
- Each component should have a **single, clear responsibility**
- Adjust import paths when moving code into nested folders
- You don't have to be maximally granular — find a balance between simplicity and separation
- Component splitting is the **first step** — it makes all subsequent tasks (events, state) easier to manage

## ⚠️ Common Mistakes

- Forgetting to update relative import paths after moving code to subfolders
- Not exporting the component with `export default`
- Moving code but forgetting to import dependencies (like images or sub-components) in the new file

## 💡 Pro Tips

- Use arrow functions or function declarations consistently — pick a style and stick with it
- Folder-per-component structure (`Header/Header.js`) scales well for larger projects
- After splitting, immediately verify the app still renders correctly before moving on
