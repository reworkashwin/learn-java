# Integrating Spring Cloud Stream with RabbitMQ — Part 1

## Introduction

Theory time is over. Let's wire up our microservices to actually communicate asynchronously through RabbitMQ. We'll update both the **message microservice** (consumer) and the **accounts microservice** (producer) to use Spring Cloud Stream with RabbitMQ.

This is where you see the developer experience Spring Cloud Stream promises — minimal configuration, maximum power.

---

## Updating the Message Microservice (Consumer Side)

### Step 1: Update Dependencies

Remove the `spring-cloud-function-context` dependency and replace it with:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-binder-rabbit</artifactId>
</dependency>
```

Why remove `spring-cloud-function-context`? Because `spring-cloud-stream` already includes it internally. No redundancy needed.

### Step 2: Configure the Input Binding

In `application.yml`:

```yaml
spring:
  application:
    name: message
  cloud:
    function:
      definition: email|sms
    stream:
      bindings:
        emailsms-in-0:
          destination: send-communication
          group: ${spring.application.name}
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    connection-timeout: 10s
```

### Understanding the binding name: `emailsms-in-0`

This follows a **default naming convention**:

```
{functionDefinition}-{direction}-{index}
```

- `emailsms` — from the function definition (composed with `|`)
- `in` — this is an **input** binding (reading from a queue)
- `0` — starting index

### What does `destination` mean here?

Since this is an input binding, the destination refers to the **queue name** in RabbitMQ: `send-communication`.

### Why the `group` property?

Without a group, RabbitMQ appends randomly generated suffixes to queue names. Setting a group ensures consistent, predictable queue names. The actual queue name becomes: `send-communication.message` (destination + group).

---

## Updating the Accounts Microservice (Producer Side)

### Step 1: Add the Same Dependencies

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-binder-rabbit</artifactId>
</dependency>
```

### Step 2: Create the DTO

Create `AccountsMessageDto` as a record class in the accounts service with the same fields: `accountNumber`, `name`, `email`, `mobileNumber`.

### Step 3: Configure the Output Binding

In `application.yml`:

```yaml
spring:
  cloud:
    stream:
      bindings:
        sendCommunication-out-0:
          destination: send-communication
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    connection-timeout: 10s
```

For the output binding:
- `sendCommunication` — any name you choose (no functions to derive from)
- `out` — this is an **output** binding (writing to an exchange)
- `0` — starting index

When it's an **output binding**, the `destination` is the **exchange name** — `send-communication`.

### ⚠️ Important Distinction

| Binding Type | Destination Refers To |
|-------------|----------------------|
| Input (`-in-`) | Queue name |
| Output (`-out-`) | Exchange name |

---

## Sending Messages with StreamBridge

In `AccountServiceImpl`, inject `StreamBridge`:

```java
private final StreamBridge streamBridge;
```

Since the class uses `@AllArgsConstructor`, autowiring happens automatically.

Create a method to send the communication event:

```java
private void sendCommunication(Accounts savedAccount, Customer savedCustomer) {
    var accountsMessageDto = new AccountsMessageDto(
        savedAccount.getAccountNumber(),
        savedCustomer.getName(),
        savedCustomer.getEmail(),
        savedCustomer.getMobileNumber()
    );
    log.info("Sending communication request for the details: {}", accountsMessageDto);
    boolean result = streamBridge.send("sendCommunication-out-0", accountsMessageDto);
    log.info("Is the communication request successfully triggered? : {}", result);
}
```

The `streamBridge.send()` method takes:
1. The **output binding name** — must match what's in `application.yml`
2. The **message object** to send

Call this from the `createAccount()` method after saving the customer and account.

---

## How It All Connects

```
Accounts Service                    RabbitMQ                    Message Service
      │                                │                              │
      │── StreamBridge.send() ──►      │                              │
      │   (output binding)        Exchange:                           │
      │                        "send-communication"                   │
      │                              │                                │
      │                           Queue:                              │
      │                   "send-communication.message"                │
      │                              │                                │
      │                              │──── input binding ────►        │
      │                              │                         email() → sms()
```

---

## ✅ Key Takeaways

- `spring-cloud-stream` replaces `spring-cloud-function-context` (it includes it)
- Input bindings follow the naming: `{definition}-in-{index}` and connect to **queues**
- Output bindings follow: `{name}-out-{index}` and connect to **exchanges**
- `StreamBridge` is how you programmatically send messages from a producer
- The `group` property prevents random suffixes on queue names
- RabbitMQ connection details go under `spring.rabbitmq.*`
