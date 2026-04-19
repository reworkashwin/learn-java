# Developing a Message Microservice with Spring Cloud Functions — Part 2

## Introduction

Now that the project skeleton is set up, it's time to write actual business logic — but not in the traditional way with controllers and service classes. Instead, we're writing **functions**. Plain Java functions using the functional interfaces from `java.util.function`.

This is where Spring Cloud Functions really starts to shine.

---

## Writing the Email Function

Inside `MessageFunctions`, create a method that returns a `Function<T, R>`:

```java
@Bean
public Function<AccountsMessageDto, AccountsMessageDto> email() {
    return accountsMessageDto -> {
        log.info("Sending email with the details: {}", accountsMessageDto.toString());
        return accountsMessageDto;
    };
}
```

### Breaking this down:

The `Function` interface from `java.util.function` takes two type parameters:
- **T** (first) = input type → `AccountsMessageDto`
- **R** (second) = output/return type → also `AccountsMessageDto`

Why return the same object? Because we're going to **compose** this function with the SMS function later. The output of `email()` becomes the input of `sms()`. So the email function needs to pass along all the data the SMS function will need.

The actual body is a lambda expression — it logs the details (simulating sending an email) and returns the same object.

> 💡 We're not building real email-sending logic here — that would distract from the Spring Cloud Functions focus. The log statement represents the email being sent.

---

## Writing the SMS Function

```java
@Bean
public Function<AccountsMessageDto, Long> sms() {
    return accountsMessageDto -> {
        log.info("Sending sms with the details: {}", accountsMessageDto.toString());
        return accountsMessageDto.accountNumber();
    };
}
```

Notice the differences:
- Input is still `AccountsMessageDto`
- But the return type is `Long` — specifically the account number

Why return the account number? Because after both email and SMS are sent, we want to notify the accounts microservice that communication was completed. We send back the account number so accounts can look up the record and mark it as "communication sent."

Also notice: we're calling `accountsMessageDto.accountNumber()` — **not** `getAccountNumber()`. That's because records don't generate traditional getters with the `get` prefix. The accessor method shares the field name directly.

---

## The Composition Strategy

Here's the bigger picture:

```
Accounts Service → [message to broker] → email() → sms() → [response to broker] → Accounts Service
```

1. Accounts sends a message to the broker with all customer details
2. The broker invokes `email()` — which gets the full DTO, sends an email, and returns the DTO
3. The output flows into `sms()` — which gets the same DTO, sends an SMS, and returns the account number
4. That account number goes back to accounts service as confirmation

The two functions are **composed into a single logical unit**. The return type of function one must match the input type of function two — that's why `email()` returns `AccountsMessageDto`.

---

## Understanding the Three Functional Interfaces

Spring Cloud Functions supports three core functional interfaces:

| Interface | Input | Output | Use Case |
|-----------|-------|--------|----------|
| `Function<T, R>` | ✅ Yes | ✅ Yes | Transform input and produce output |
| `Supplier<T>` | ❌ No | ✅ Yes | Generate data with no input |
| `Consumer<T>` | ✅ Yes | ❌ No | Accept data, no output |

We'll use `Consumer` later when the accounts service needs to accept confirmation messages without responding.

---

## ✅ Key Takeaways

- Business logic goes inside lambda expressions returned by `@Bean` methods
- `Function<T, R>` is used when you accept input and return output
- When composing functions, the output type of function A must match the input type of function B
- Java record accessor methods use the field name directly (no `get` prefix)
- `@Bean` annotation is required for Spring Cloud Functions to detect and manage your functions

## ⚠️ Common Mistakes

- Forgetting `@Bean` on your function methods — Spring won't detect them
- Using `getAccountNumber()` on a record instead of `accountNumber()`
- Mismatching types between composed functions — if email returns `String` but sms expects `AccountsMessageDto`, composition breaks
