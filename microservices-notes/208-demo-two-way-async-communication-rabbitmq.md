# Demo: Two-Way Async Communication with RabbitMQ

## Introduction

We've implemented the full circle: accounts → message service → accounts. Let's see the complete two-way asynchronous flow in action and verify that the database gets updated after communication is sent.

---

## Verifying the RabbitMQ Setup

After restarting all applications, check the RabbitMQ console:

**Exchanges (2):**
- `send-communication` — accounts pushes messages here
- `communication-sent` — message service pushes confirmation here

**Queues (2):**
- `send-communication.message` — message service reads from here
- `communication-sent.accounts` — accounts service reads from here

> Ignore any orphan exchange like `emailsms-out-0` from previous runs. A fresh RabbitMQ container won't have it.

---

## Running the Full Flow

### 1. Create an Account

Send a POST request to create a new account. You get back `201 Created` immediately.

### 2. Check the Database — Before

Open the H2 console for the accounts service and run:
```sql
SELECT * FROM accounts;
```

The `communication_switch` column shows **null** — communication hasn't been confirmed yet.

### 3. Release the Breakpoint

If you placed a breakpoint in the message service's `email` function, the flow is paused. The moment you release it:

1. `email()` executes → logs "Sending email..."
2. `sms()` executes → logs "Sending SMS..."
3. The account number is returned → sent to `communication-sent` exchange
4. Accounts service picks it up → `updateCommunication()` runs
5. `communication_switch` is set to `true`

### 4. Check the Database — After

Run the same query again:
```sql
SELECT * FROM accounts;
```

`communication_switch` is now **true**. The entire two-way flow completed asynchronously.

---

## What the Logs Show

**Accounts service:**
```
Sending communication request for the details: AccountsMessageDto[...]
Is the communication request successfully triggered? : true
Updating communication status for the account number: 1234567890
```

**Message service:**
```
Sending email with the details: AccountsMessageDto[...]
Sending sms with the details: AccountsMessageDto[...]
```

Notice the timing: the "triggered" log appears immediately. The "Updating communication status" log appears later — only after the message service finishes and sends its confirmation back.

---

## Why This Pattern is Powerful

This pattern reduces **temporal coupling**. Neither service needs to be available at the exact same moment. If the message service is down when the account is created:

1. The message sits in the RabbitMQ queue
2. When message service comes back up, it processes the queued messages
3. It sends confirmation back to accounts
4. Accounts updates the database

No data loss. No retry logic needed in your code. The broker handles it.

---

## ✅ Key Takeaways

- Two-way async communication creates a complete feedback loop between microservices
- The `communication_switch` column goes from `null` → `true` only after the message service confirms processing
- RabbitMQ persists messages in queues — if a consumer is down, messages wait until it comes back
- This pattern decouples services temporally — they don't need to be running simultaneously
- All code for this section is available in the GitHub repo under `section_13`
