# Encryption & Decryption of Properties in Config Server

## Introduction

Your config properties are sitting in a GitHub repo. Even if it's private, what if someone gains access? Sensitive values like passwords, URLs, and API keys are exposed in plain text. That's a security risk.

Spring Cloud Config Server provides built-in **encryption and decryption** capabilities so you can store sensitive values in encrypted form — even if someone reads the file, they can't understand the content.

---

## Why Encrypt Properties?

Consider this scenario: your GitHub repo contains database passwords, API keys, or internal URLs. Even with access controls, there's always a risk of accidental exposure — a misconfigured permission, a leaked token, or a compromised account.

By encrypting sensitive properties:
- The values are **meaningless** to anyone without the secret key
- Even if the repo is exposed, sensitive data remains protected
- You add a **defense-in-depth** layer to your security

---

## How It Works

### Step 1: Define an Encryption Key

In the config server's `application.yml`, add a secret key:

```yaml
encrypt:
  key: "your-super-complex-random-key-here"
```

⚠️ **This key must be complex.** Don't use `password`, `12345`, or `abcdef`. Use a randomly generated string that's virtually impossible to guess. Many online tools can generate cryptographically strong keys for you.

In production, this key should **never** be hardcoded in `application.yml`. Instead, provide it via environment variables, CLI arguments, or a secrets manager.

### Step 2: Use the Encrypt API

Once the key is configured, the config server exposes two REST endpoints:

**Encrypt:**
```
POST http://localhost:8071/encrypt
Content-Type: text/plain

mySecretValue@example.com
```

Response: An encrypted string like `a1b2c3d4e5f6...`

**Decrypt:**
```
POST http://localhost:8071/decrypt
Content-Type: text/plain

a1b2c3d4e5f6...
```

Response: `mySecretValue@example.com`

### Step 3: Store Encrypted Values in GitHub

Take the encrypted value and place it in your YAML file with the `{cipher}` prefix:

```yaml
accounts:
  contactDetails:
    email: "{cipher}a1b2c3d4e5f6..."
```

The `{cipher}` prefix is how the config server **differentiates** between plain text and encrypted values. When it sees `{cipher}`, it knows to decrypt the value before sending it to the requesting microservice.

---

## The Decryption Flow

Here's what happens at runtime:

1. A microservice requests its properties from the config server
2. The config server reads the YAML from GitHub
3. It encounters a value prefixed with `{cipher}`
4. It decrypts the value using the secret key
5. It sends the **plain text value** to the microservice

The microservice never sees the encrypted value — it always receives plain text. The encryption exists only **at rest** in the GitHub repo.

---

## Testing the Flow

1. **Config Server API**: Hit `localhost:8071/accounts/prod` → the email appears decrypted in plain text
2. **Microservice API**: Hit `localhost:8080/api/contact-info` → the email comes through in plain text

The encryption is transparent to the microservices — they don't need to know anything about encryption or decryption.

---

## "But Can't Anyone Just Call the Decrypt API?"

Good question! In production:

- The config server sits **behind organizational firewalls** — not accessible from outside
- Only applications deployed within the same network can communicate with it
- You can additionally secure the config server with **Spring Security** (authentication/authorization)
- No one can directly call the encrypt/decrypt endpoints

---

## ✅ Key Takeaways

- Add `encrypt.key` to the config server to enable encryption/decryption
- Use `POST /encrypt` to get encrypted values, store them with `{cipher}` prefix in the repo
- The config server automatically decrypts `{cipher}` values before sending to clients
- Microservices receive plain text — they're unaware of encryption
- In production, **never hardcode** the encryption key — use environment variables or secrets managers

---

## ⚠️ Common Mistakes

- Using a simple encryption key like `password` — always use a complex, random key
- Forgetting the `{cipher}` prefix — without it, the config server treats the value as plain text
- Hardcoding the secret key in `application.yml` for production — use secure injection methods instead
