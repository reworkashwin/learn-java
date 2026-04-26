# Working with Mocks

## Introduction

In the previous section, we successfully tested an async component — but there's a problem. Our test is sending **real HTTP requests** to a real API. Every time you run your tests (which should be often), you're hitting an external server. That's wasteful, unreliable, and potentially dangerous if your component sends POST requests that modify data. The solution? **Mocking.** This is one of the most important testing concepts you'll learn.

---

### Concept 1: Why You Should Mock External Calls

#### 🧠 What is it?

Mocking means replacing a real function (like `fetch`) with a **fake version** that you control. The fake function doesn't send real requests — it returns predetermined data.

#### ❓ Why do we need it?

Three critical reasons:

1. **Network traffic:** Running tests sends real requests → hammers your servers, costs bandwidth
2. **Side effects:** If your component sends POST/PUT/DELETE requests, tests could modify real data in your database
3. **Test reliability:** If the API server is down, your tests fail — not because your code is broken, but because an external dependency is unavailable

#### 💡 Insight

Here's the key principle: **you don't want to test code you didn't write.** You didn't write the `fetch` function — the browser vendors did. You trust it works. What you *do* want to test is how your component **behaves** with the data it receives. So mock the data source, and focus on testing *your* code.

---

### Concept 2: Creating a Mock Function with `jest.fn()`

#### 🧠 What is it?

`jest.fn()` creates a mock function — a dummy function that you can configure to return specific values. It's one of Jest's most powerful features.

#### ⚙️ How it works

```javascript
// Override the built-in fetch with a mock
window.fetch = jest.fn();
```

This replaces `window.fetch` with a Jest mock function. Now, when your component calls `fetch()`, it's calling your mock — not the real browser `fetch`.

#### 💡 Insight

`jest.fn()` doesn't just create an empty function — it creates a function with special capabilities. You can tell it what to return, track how many times it was called, inspect what arguments it received, and more.

---

### Concept 3: Configuring the Mock's Return Value

#### 🧠 What is it?

After creating the mock, you need to tell it **what to return** when called. This is where you simulate the API response.

#### ⚙️ How it works

The real `fetch` returns a promise that resolves to a Response object with a `.json()` method. Your mock needs to mimic this structure:

```javascript
window.fetch.mockResolvedValueOnce({
  json: async () => [{ id: 'p1', title: 'First post' }],
});
```

Let's break this down:
- **`mockResolvedValueOnce()`** — Sets the value that the mock promise resolves to (used once)
- **The resolved object** has a `json` property that is an **async function** (because `.json()` returns a promise in real `fetch`)
- **The `json()` function** returns the simulated data — an array with one post

#### 🧪 Example

The complete test with mocking:

```javascript
import { render, screen } from '@testing-library/react';
import Async from './Async';

describe('Async component', () => {
  test('renders posts if request succeeds', async () => {
    // Mock fetch
    window.fetch = jest.fn();
    window.fetch.mockResolvedValueOnce({
      json: async () => [{ id: 'p1', title: 'First post' }],
    });

    render(<Async />);

    const listItems = await screen.findAllByRole('listitem');
    expect(listItems).not.toHaveLength(0);
  });
});
```

#### 💡 Insight

Notice how the mock's return value structure mirrors the real `fetch` response:
- Real: `fetch()` → Promise → `{ json: () => Promise → data }`
- Mock: `mockResolvedValueOnce({ json: async () => data })`

You don't need to mock *everything* — just the parts your component actually uses.

---

### Concept 4: Benefits of Mocking

#### 🧠 What is it?

Mocking isn't just a workaround — it's a better approach to testing components with external dependencies.

#### ⚙️ How it works

With mocking, you gain:

| Benefit | Explanation |
|---------|-------------|
| **No network requests** | Tests run faster and don't depend on internet connectivity |
| **No server load** | You're not hammering your API with test requests |
| **No side effects** | POST/PUT/DELETE requests don't modify real data |
| **Controlled scenarios** | You decide what data is returned — test success, failure, edge cases |
| **Reliability** | Tests don't fail because an external server is down |

#### 💡 Insight

Mocking also enables testing scenarios that would be hard to reproduce with real APIs — like error responses, timeouts, empty results, or malformed data. You control the narrative.

---

### Concept 5: What Else Can You Mock?

#### 🧠 What is it?

`fetch` is the most common thing to mock, but the same pattern applies to any external dependency — `localStorage`, `navigator`, third-party libraries, and more.

#### ⚙️ How it works

```javascript
// Mock localStorage
Storage.prototype.getItem = jest.fn(() => 'mock value');

// Mock a module
jest.mock('./api', () => ({
  fetchPosts: jest.fn(() => Promise.resolve([{ id: 1, title: 'Test' }])),
}));
```

#### 💡 Insight

The rule of thumb: mock things that are **outside your control** or have **side effects**. Don't mock your own components or internal functions — test those directly. Mock the boundaries: API calls, browser APIs, external services.

---

## ✅ Key Takeaways

- **Mock** external functions like `fetch` to avoid sending real requests during tests
- Use `jest.fn()` to create mock functions and `mockResolvedValueOnce()` to set return values
- Structure your mock to match what the real function returns — only mock the parts your code uses
- Mocking gives you **control** over test scenarios: success, failure, edge cases
- Don't test code you didn't write — mock it and test your component's behavior with the mocked data

## ⚠️ Common Mistakes

- Forgetting to mock `fetch` and accidentally sending real API requests during tests
- Not matching the structure of the real function's return value — your mock needs a `json()` method that returns a promise
- Mocking too much — only mock external boundaries, not your own components or logic

## 💡 Pro Tips

- Use `mockResolvedValueOnce` for specific tests; use `mockResolvedValue` if every call should return the same thing
- Create helper functions that set up common mocks to keep your test code DRY
- For more complex mocking scenarios, explore `jest.spyOn()` — it lets you mock a method while preserving the original
