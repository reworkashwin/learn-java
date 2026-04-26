# What to Test & How to Test

## Introduction

Before you start writing tests, you need to answer two fundamental questions: **What should I test?** and **How should I test it?** Getting these answers right is the difference between a test suite that actually catches bugs and one that just gives you a false sense of security. This section lays out the guiding principles for writing effective, focused tests.

---

### Concept 1: What to Test

#### 🧠 What is it?

"What to test" refers to identifying the **specific building blocks** of your application that your tests should target.

#### ❓ Why do we need to define this?

Because if you try to test "everything at once," you'll end up with vague, bloated tests that are hard to maintain and don't give you useful information when they fail. Instead, you want small, focused tests.

#### ⚙️ How it works

- Test the **individual building blocks** that make up your app — functions, components, hooks
- Keep each test **small and focused** — one test should test **one main thing**
- If a test fails, the reason should be immediately clear from the test description and output

#### 💡 Insight

Think of it this way: would you rather have 3 big tests that each check 10 things, or 30 small tests that each check 1 thing? When one of those 3 big tests fails, you have no idea *which* of the 10 things broke. When one of the 30 small tests fails, the test name alone tells you the problem. **Small, focused tests win every time.**

---

### Concept 2: How to Test

#### 🧠 What is it?

"How to test" is about the *approach* you take within each test — what scenarios do you check, and what expectations do you set?

#### ❓ Why do we need this?

Because testing only the "happy path" (everything works perfectly) is not enough. Real users do unexpected things, APIs fail, and edge cases exist. Your tests should cover those too.

#### ⚙️ How it works

- Test **success cases** — does the component render the correct output when given valid data?
- Test **error cases** — does the component handle failures gracefully?
- Test **rare but possible scenarios** — edge cases that might seem unlikely but could still happen
- Think about what a real user might do and test those interactions

#### 🧪 Example

For a `LoginForm` component, you'd test:
- ✅ Successful login with valid credentials
- ❌ Failed login with invalid credentials
- ⚠️ Submitting the form with empty fields
- ⚠️ Submitting the form with a very long username

#### 💡 Insight

A test suite that only tests the happy path is like a seatbelt that only works when you don't crash. The whole point is to catch the unexpected. Always ask yourself: *"What could go wrong here?"* — and then write a test for it.

---

## ✅ Key Takeaways

- Test **small, individual building blocks** — not large chunks of your app at once
- Keep each test **focused on one thing** — if it fails, the reason should be obvious
- Test both **success and error scenarios** — don't just test the happy path
- Include **edge cases** — rare but possible scenarios that could trip up your app

## ⚠️ Common Mistakes

- Writing one giant test that checks everything — when it fails, you won't know why
- Only testing the "happy path" — your tests won't catch real-world failures
- Skipping edge cases — those are often where the most frustrating bugs hide

## 💡 Pro Tips

- Name your tests like sentences: "renders error message when API call fails" — this makes test output readable
- Before writing a test, ask: *"What behavior am I verifying?"* — if you can't answer that clearly, rethink the test
- When you find a bug in production, write a test for it *first*, then fix it — this prevents the same bug from coming back
