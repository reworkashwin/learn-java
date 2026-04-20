# Using the Browser Debugger & Breakpoints

## Introduction

Error messages are great when they exist. But what about bugs that **don't produce errors**? Your app runs, no red text in the console, but the output is just... wrong. These are **logical errors**, and they're the sneakiest kind of bug.

The browser debugger is your most powerful weapon against them.

---

## The Problem: No Error, Wrong Output

Imagine an investment calculator where changing the initial investment to 15,000 causes the numbers to explode into absurd values. No error message. No crash. Just incorrect data.

How do you debug something that doesn't tell you it's broken?

---

## Step 1: Think Logically First

Before touching any tools, narrow down the problem area:

- Does the app work correctly on initial load? **Yes** → The calculation function is probably fine
- Does it break when you edit inputs? **Yes** → The problem is likely in how user input is captured
- Which component handles input changes? → **App component** (where state is managed)

This logical deduction just narrowed your search from "the entire codebase" to "the input handling code." That's huge.

---

## Step 2: Open the Browser Debugger

In Chrome (or any browser):

1. Open **Developer Tools** (F12 or Cmd+Option+I)
2. Go to the **Sources** tab
3. Navigate to `localhost` → `src` → find your file (e.g., `App.jsx`)

You'll see your actual source code in the browser. This works because modern build tools generate **source maps** that let the browser show you your original code.

---

## Step 3: Set a Breakpoint

Click on a **line number** in the Sources panel to set a breakpoint. When code execution reaches that line, it will **pause**.

Set a breakpoint in the `handleChange` function — the code that runs when you type into an input.

Now edit an input value. Code execution pauses. The page grays out. You'll see "Paused in debugger."

---

## Step 4: Inspect Values

While paused:

- **Hover** over variables to see their current values
- Look at the **Scope** panel on the right for all variables in scope
- Check the **Call Stack** to see how you got here

Here's the aha moment: hover over the `newValue` parameter and you see...

```
"15000"
```

Notice the **quotes**. That's a **string**, not a number. User inputs always produce strings in JavaScript. If this string gets used in mathematical calculations without conversion, JavaScript will concatenate instead of adding.

---

## Step 5: Step Through the Code

Use the debugger controls to walk through execution:

| Button | Action | Use when... |
|--------|--------|-------------|
| ▶️ Resume | Continue running | You've seen enough |
| ⏭️ Step Over | Execute current line, move to next | You want to see the next line |
| ⬇️ Step Into | Enter a function call | You need to see what happens inside a function |
| ⬆️ Step Out | Exit current function | You're done inspecting this function |

Step into the calculation function and watch what happens when a **string** `"15000"` is used in arithmetic:

```js
investmentValue = investmentValue + interestEarnedInYear + annualInvestment;
```

If `investmentValue` is `"15000"` (a string), this becomes **string concatenation**, not addition. The numbers balloon into nonsensical concatenated strings.

---

## Step 6: Fix the Bug

The fix is simple — convert the input value to a number:

```jsx
function handleChange(inputIdentifier, newValue) {
  setUserInput(prevInput => ({
    ...prevInput,
    [inputIdentifier]: +newValue,  // The + converts string to number
  }));
}
```

The unary `+` operator converts a string to a number. `+"15000"` becomes `15000`.

---

## Debugger Tips

### Removing Breakpoints
Click the line number again to remove the breakpoint. Or right-click for options like conditional breakpoints.

### Conditional Breakpoints
Right-click a line number → "Add conditional breakpoint." The code only pauses when your condition is true:
```
newValue === "15000"
```

### Watch Expressions
In the **Watch** panel, add expressions you want to monitor across steps:
```
typeof newValue
```

---

## The Complete Debugging Workflow

```
1. Observe the bug → What's wrong?
2. Think logically → Which code area?
3. Set breakpoints → Pause at the right moment
4. Inspect values → Are they what you expect?
5. Step through → Watch the logic unfold
6. Find the mismatch → Where does reality differ from expectation?
7. Fix → Apply the correction
8. Verify → Remove breakpoints, test again
```

---

## ✅ Key Takeaways

- The **Sources** tab in browser DevTools shows your actual source code
- **Breakpoints** pause execution so you can inspect values at runtime
- **Hover** over variables while paused to see their current values
- **Step through** code to watch logic execute line by line
- JavaScript form inputs are **always strings** — convert them with `+`, `Number()`, or `parseInt()`
- Always **think logically first** to narrow down where the bug might be before reaching for tools

## ⚠️ Common Mistake

A classic JavaScript gotcha: `"15000" + 1000` equals `"150001000"` (string concatenation), not `16000` (addition). Always ensure numeric inputs are converted to numbers before doing math.

## 💡 Pro Tip

You can also set breakpoints directly in VS Code using the built-in debugger with the browser debug extensions. This lets you debug without even leaving your editor.
