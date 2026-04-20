# Editing Our First React App

## Introduction

Before diving deep into React theory, let's get our hands dirty. Even without fully understanding React yet, we can make meaningful changes to a React app. This is about building confidence through doing.

---

## The Exercise

We're working with the same tab-switching demo app, but now the content array has a **fourth entry**. The challenge:

> **Add a fourth button that, when clicked, displays the content from the fourth entry in the content array.**

Sounds simple, right? Let's walk through it.

---

## Step-by-Step Solution

### 1. Copy an Existing Button

Start by duplicating one of the existing buttons. For example, copy the third button and paste it at the end of the menu section.

### 2. Change the Button Text

Give it a label — something like "React vs JS" (or whatever you like).

### 3. Fix the Click Handler

The copied button still has the old logic. Update the `onClick` handler to set the active content index to `3`:

```jsx
onClick={() => setActiveContentIndex(3)}
```

Why `3` and not `4`? Because **arrays in JavaScript are zero-indexed**:
- Index `0` → first item
- Index `1` → second item
- Index `2` → third item
- Index `3` → fourth item

### 4. Fix the Active Class Condition

Update the condition that controls whether this button gets the "active" CSS class:

```jsx
className={activeContentIndex === 3 ? 'active' : ''}
```

This ensures the button only appears active when the fourth tab is selected.

### 5. Save and Test

After saving, all four buttons should work correctly — each one displaying its own content and only the clicked button showing as active.

---

## What We Learned By Doing This

Even without formally learning React, we already applied several React concepts:

- **State** (`activeContentIndex`) controls which tab is active
- **Event handlers** (`onClick`) respond to user interaction
- **Conditional CSS** uses the state value to determine styling
- **Array indexing** connects the button to the correct content

---

## ✅ Key Takeaways

- You can start making changes in a React app even before fully understanding the framework
- Arrays are zero-indexed in JavaScript — the fourth item is at index `3`
- React buttons can have inline click handlers that update state
- The UI updates automatically when state changes — you don't need to manually manipulate the DOM

---

## ⚠️ Common Mistake

When copying a button, it's easy to forget to update **both** the click handler index **and** the active class condition. If you only change one, you'll get strange behavior — like two buttons appearing active at the same time or the wrong content loading.

---

## 💡 Pro Tip

Don't worry if you couldn't solve this exercise on your own. You haven't learned React yet! The purpose of this exercise is simply to get you comfortable with touching React code. The full understanding will come as you progress through the course.
