# Introduction to mTLS & Deep Dive on How TLS Works

## Introduction

Service mesh can secure internal microservice communication using **mTLS (Mutual TLS)**. But before understanding mTLS, you need to understand **TLS** itself — the encryption protocol that powers every HTTPS website you visit. This deep dive covers TLS from first principles: why it exists, how certificates work, and the elegant dance of asymmetric and symmetric encryption that happens every time you visit a website.

---

## Why Do We Need Encryption?

Imagine you're submitting your credit card details on a website. Without encryption, that data travels as **plain text** across the network. Anyone listening (a hacker on public WiFi, a compromised router) can see your card number, expiry date, and CVV.

**TLS solves this** by encrypting the data so that even if intercepted, it's complete gibberish to the attacker. Only the intended recipient can decrypt it.

---

## What Is TLS?

**TLS (Transport Layer Security)** is the encryption protocol used in HTTPS communication. It replaced the older SSL (Secure Sockets Layer), which is now deprecated due to known vulnerabilities.

> You'll still hear people say "SSL certificates" — they're actually referring to TLS certificates. The terms are used interchangeably, but TLS is what's actually running.

---

## How TLS Works: The Full Handshake

Let's say your browser wants to connect to `amazon.com`. Here's what happens behind the scenes:

### Step 1: TCP Handshake

Browser and server establish a basic network connection. They confirm there are no network issues.

### Step 2: Client Hello

The browser sends a "hello" to the server, essentially saying: **"Prove you are who you say you are."**

### Step 3: Server Proves Identity (Certificate + Public Key)

The server responds with its **TLS certificate**, which contains a **public key**.

Where does this certificate come from? A **Certificate Authority (CA)** — a trusted third party (like DigiCert, Let's Encrypt) that verifies the organization actually owns the domain before issuing a certificate.

The browser validates this certificate against known CAs. If valid → proceed. If invalid → the browser shows a warning.

> You can see this yourself: click the lock icon in your browser's address bar → "Connection is secure" → "Certificate is valid" → view the certificate details.

### Step 4: Understanding the Key Pair

The certificate contains two keys:
- **Public key** — anyone can use this to encrypt data for the server
- **Private key** — only the server has this; it can decrypt data encrypted with the public key

This is called **asymmetric encryption** — two different keys for encryption and decryption.

### Step 5: Session Key Generation

Here's the clever part. The browser doesn't use the public/private key pair for actual communication because:

1. **One-way problem** — the public key lets the browser send encrypted data to the server, but how does the server send encrypted data back? The browser has no private key.
2. **Performance** — asymmetric encryption is computationally expensive.

So the browser:
1. Generates a random **session key**
2. Encrypts the session key with the server's **public key**
3. Sends the encrypted session key to the server

Even if a hacker intercepts this, they can't decrypt it without the private key.

### Step 6: Server Decrypts the Session Key

The server uses its **private key** to decrypt the session key. Now both the browser and server share the same session key — and nobody else has it.

### Step 7: Symmetric Encrypted Communication

From this point on, both sides use the **session key** to encrypt and decrypt all data. This is **symmetric encryption** — same key for both operations.

Why symmetric? It's:
- Fast (much better performance than asymmetric)
- Two-way (both sides can encrypt and decrypt)
- Secure (only they have the session key)

---

## The Complete Picture

```
Browser                                  Server
   │                                        │
   │──── 1. TCP Handshake ─────────────────→│
   │                                        │
   │──── 2. Client Hello ─────────────────→│
   │     "Prove your identity"              │
   │                                        │
   │←─── 3. Certificate + Public Key ──────│
   │     Server proves identity             │
   │                                        │
   │──── 4. Validate with CA ─────────────→│ (Certificate Authority)
   │     Browser checks certificate         │
   │                                        │
   │──── 5. Encrypted Session Key ────────→│
   │     (encrypted with public key)        │
   │                                        │
   │←─── 6. Acknowledgment ───────────────│
   │     (server decrypted session key)     │
   │                                        │
   │←──→ 7. Symmetric Encrypted Data ←──→│
   │     (both use session key)             │
```

---

## Why TLS Alone Isn't Enough for Microservices

In the TLS model:
- Only the **server** proves its identity (via certificate)
- The **client** (browser) is never asked to prove itself — because there are millions of users

But in microservice-to-microservice communication:
- Both sides are applications, not browsers
- Both need to prove their identity
- We need to verify that the calling service is **actually who it claims to be**

This is where **mTLS (Mutual TLS)** comes in — both parties authenticate each other.

---

## ✅ Key Takeaways

- **TLS** encrypts browser-to-server communication using HTTPS
- It uses **asymmetric encryption** (public/private keys) for the handshake, then switches to **symmetric encryption** (session key) for performance
- **Certificate Authorities** verify domain ownership and issue TLS certificates
- In TLS, only the server proves its identity — the client doesn't
- For microservice-to-microservice communication, we need **mTLS** where both sides prove identity
- Understanding TLS is prerequisite knowledge for understanding mTLS

---

## ⚠️ Common Mistakes

- Confusing **SSL and TLS** — SSL is deprecated; TLS is the current standard, but both terms are used interchangeably
- Thinking the **public key** is used for all communication — it's only used during the handshake to securely exchange the session key
- Assuming HTTPS inside the cluster is always necessary — it adds performance overhead and is usually replaced by mTLS at the service mesh level
