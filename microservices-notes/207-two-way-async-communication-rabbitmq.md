# Two-Way Asynchronous Communication with RabbitMQ

## Introduction

So far, the flow is one-directional: accounts → RabbitMQ → message service. But the business requirement isn't complete yet. After the message service sends the email and SMS, it needs to **notify accounts** that communication was successful — so accounts can update a `communication_switch` column in the database.

This creates a **two-way async flow**, and the beauty is how little code it takes with Spring Cloud Functions + Spring Cloud Stream.

---

## Step 1: Message Service — Add an Output Binding

In the message service's `application.yml`, add an output binding alongside the existing input binding:

```yaml
spring:
  cloud:
    stream:
      bindings:
        emailsms-in-0:
          destination: send-communication
          group: ${spring.application.name}
        emailsms-out-0:
          destination: communication-sent
```

The output binding `emailsms-out-0` will route the return value of the composed function chain to an exchange called `communication-sent`.

### Here's the clever part — no extra Java code needed!

Remember that the `sms()` function returns a `Long` (the account number)? Spring Cloud Stream knows that the composed function `emailsms` has an output. It automatically takes that return value and sends it to the configured output destination.

Compare this with the accounts service where we had to inject `StreamBridge` and manually call `send()`. With Spring Cloud Functions, the return value **is** the outgoing message. Zero boilerplate.

---

## Step 2: Accounts Service — Create a Consumer Function

Create `AccountsFunctions.java`:

```java
@Configuration
public class AccountsFunctions {

    private static final Logger log = LoggerFactory.getLogger(AccountsFunctions.class);

    @Bean
    public Consumer<Long> updateCommunication(IAccountService accountService) {
        return accountNumber -> {
            log.info("Updating communication status for the account number: {}", accountNumber);
            accountService.updateCommunicationStatus(accountNumber);
        };
    }
}
```

Why `Consumer<Long>` instead of `Function<Long, Something>`? Because this function **only accepts input** — it doesn't need to return anything. It receives the account number, updates the database, and that's it.

Notice the `IAccountService` parameter on the method — since this is a `@Bean` method, Spring auto-injects it.

---

## Step 3: Add the Database Column

In `schema.sql`, add:

```sql
communication_switch BOOLEAN
```

In `AccountsEntity`, add:

```java
@Column(name = "communication_switch")
private Boolean communicationSwitch;
```

---

## Step 4: Implement the Update Logic

In `IAccountService`, add:

```java
Boolean updateCommunicationStatus(Long accountNumber);
```

In `AccountServiceImpl`:

```java
@Override
public Boolean updateCommunicationStatus(Long accountNumber) {
    boolean isUpdated = false;
    if (accountNumber != null) {
        Accounts accounts = accountsRepository.findById(accountNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Account", "AccountNumber", accountNumber.toString()));
        accounts.setCommunicationSwitch(true);
        accountsRepository.save(accounts);
        isUpdated = true;
    }
    return isUpdated;
}
```

---

## Step 5: Configure the Input Binding in Accounts

In `application.yml` of accounts service:

```yaml
spring:
  cloud:
    function:
      definition: updateCommunication
    stream:
      bindings:
        updateCommunication-in-0:
          destination: communication-sent
          group: ${spring.application.name}
```

The function name `updateCommunication` generates the binding name `updateCommunication-in-0`. The destination `communication-sent` matches the exchange name from the message service.

The queue name will be: `communication-sent.accounts` (destination `.` group).

> 💡 If you have multiple **independent** function definitions, separate them with semicolons in the `definition` property: `updateCommunication;anotherFunction`

---

## The Complete Two-Way Flow

```
1. Client creates account → Accounts Service
2. Accounts → StreamBridge → Exchange: "send-communication" → Queue → Message Service
3. Message Service runs email() → sms() → returns accountNumber
4. accountNumber → Exchange: "communication-sent" → Queue → Accounts Service
5. Accounts Service runs updateCommunication() → sets communication_switch = true
```

All of this happens asynchronously. The client got their `201` response back at step 1.

---

## ✅ Key Takeaways

- Two-way async communication requires bindings on both sides — each service acts as both producer and consumer
- With Spring Cloud Functions, the return value of your function chain automatically becomes the outgoing message — no `StreamBridge` needed
- `Consumer<T>` is ideal for functions that accept input but don't produce output
- Queue name convention: `{destination}.{group}`
- Multiple independent function definitions are separated by `;` (semicolon), not `|` (pipe — which means composition)

## ⚠️ Common Mistakes

- Using `|` (pipe) when you want independent functions — pipe composes them into a chain
- Forgetting to match destination names between producer's output and consumer's input bindings
- Not adding the `group` property — leads to randomly suffixed queue names
