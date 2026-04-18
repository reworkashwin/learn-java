# How Passwords Really Stay Safe — Introduction to Password Encoders

## Introduction

We learned that hashing is the right approach for storing passwords. But is plain hashing enough? Not quite. Hashing has its own vulnerabilities — **brute force attacks** and **rainbow table attacks** can still crack weak hashed passwords. In this section, we'll understand these attack vectors, learn how **salting** solves them, and then explore Spring Security's **Password Encoder** interface that handles all this complexity for us.

---

## Concept 1: How Hashing Works in a Web Application

### 🧠 What is it?

A hash function takes any data as input — text, images, videos — regardless of size, and always produces a **unique, fixed-length** string of bytes as output.

### ⚙️ Key Properties of Hash Functions

1. **Deterministic** — same input always produces the same hash value
2. **Fixed-length output** — e.g., SHA-256 always produces a 256-byte hash, no matter the input size
3. **Irreversible** — you cannot derive the original input from the hash value

### 🧪 The Blender Analogy (Revisited)

Think of a blender as a hash function:
- **Input**: Fruits (watermelon, pineapple, apple)
- **Output**: Juice
- Can you put the juice back and get the fruits? **No!**

Hash functions work the same way — once data is hashed, there's no going back.

---

## Concept 2: Registration and Login Flow with Hashing

### ⚙️ During Registration

1. User enters password (e.g., `12345`)
2. The password is fed to a hash function
3. The **hash value** is stored in the database (not the plain text)

### ⚙️ During Login

1. User enters their password again
2. The system calculates the hash value of the entered password
3. Compares it with the stored hash value
4. If they match → **login success**; if not → **login failed**

### ❓ The Problem — Duplicate Hash Values

If multiple users choose the same password (e.g., `12345`), they all get the **same hash value** in the database:

| Username  | Hashed Password |
|-----------|----------------|
| johndoe   | `4defa2f...`   |
| pavan189  | `4defa2f...`   |
| mike      | `8bf3a9c...`   |
| saanvi    | `8bf3a9c...`   |

This makes a hacker's job easier — if they crack one hash, they crack it for ALL users with the same hash.

---

## Concept 3: Attack Vectors — How Hackers Crack Hashes

### 🔓 Brute Force Attack

The hacker calculates hash values for **every possible combination** of characters:
- Hash of `1` → compare
- Hash of `12` → compare
- Hash of `123` → compare
- Hash of `1234` → compare
- Hash of `12345` → **MATCH!** 🎯

For simple passwords like `12345` or `password`, brute force works quickly. That's why applications enforce password complexity rules — at least 8 characters, uppercase, numbers, special characters — to make brute force computationally expensive (potentially millions of dollars worth of computing power).

### 🔓 Rainbow Table Attack (Dictionary Attack)

Instead of computing hashes on the fly, the hacker **pre-computes** a massive table of common passwords and their hash values:

| Plain Text | Hash Value     |
|-----------|----------------|
| 12345     | `4defa2f...`   |
| password  | `8bf3a9c...`   |
| qwerty    | `7abc12d...`   |

Then they simply **look up** the stolen hash values in their table. No computation needed — just a lookup operation.

### 💡 Insight

> Both attacks exploit a fundamental weakness: if the same password always produces the same hash, hackers can pre-compute or systematically guess them.

---

## Concept 4: Salting — Making Every Hash Unique

### 🧠 What is it?

A **salt** is a randomly generated text string that's unique to each user. Before hashing, the salt is combined with the plain text password. This ensures that even if two users have the same password, their hash values are completely different.

### ⚙️ How it works

```
Plain Text Password + Random Salt → [Hash Function] → Unique Hash Value
```

**Example:**
- User 1: password `12345` + salt `abc` → Hash: `4defa2f`
- User 2: password `12345` + salt `xyz` → Hash: `9bc31e7` (completely different!)

### 🧪 Registration Flow with Salt

1. User enters password `12345`
2. System generates a random salt (e.g., `abc`)
3. Both are fed to the hash function → produces hash value `4defa2f`
4. The **salt + hash value** is stored in the database: `abc4defa2f`

### 🧪 Login Flow with Salt

1. User enters password `12345`
2. System reads the salt from the stored hash (`abc`)
3. Combines the entered password with the stored salt
4. Calculates a new hash value
5. If it matches the stored hash → **login success**

### ❓ But the hacker can see the salt too, right?

Yes! The salt is stored alongside the hash. But it doesn't help the hacker much because:
- Each user has a **different salt**
- The hacker must guess the password for **each user individually**
- Pre-computed rainbow tables become useless — they'd need a separate table for every possible salt value

### 💡 Insight

> Salting doesn't make hashing unbreakable — it makes the hacker's job exponentially harder by eliminating shortcuts like rainbow tables and duplicate hash exploitation.

---

## Concept 5: The PasswordEncoder Interface

### 🧠 What is it?

`PasswordEncoder` is an **interface** in Spring Security that abstracts all the hashing, salting, and verification logic. You never have to manually generate salts or compute hashes — the PasswordEncoder does it all.

### ⚙️ Key Methods

| Method | Purpose | When Used |
|--------|---------|-----------|
| `encode(rawPassword)` | Takes plain text password, generates salt, computes hash, returns hash value | During **registration** |
| `matches(rawPassword, encodedPassword)` | Extracts salt from stored hash, re-hashes the raw password, compares | During **login** |
| `upgradeEncoding()` | Returns `false` by default; if overridden to return `true`, hashing is performed multiple times for extra security | Optional enhancement |

### 🧪 How `encode()` Works

```java
// During registration
String hashedPassword = passwordEncoder.encode("12345");
// Returns something like: $2a$10$xyz...abc...
// The salt is embedded within the hash value itself!
```

### 🧪 How `matches()` Works

```java
// During login
boolean isValid = passwordEncoder.matches("12345", storedHashedPassword);
// Extracts salt from storedHashedPassword
// Re-hashes "12345" with the extracted salt
// Compares the result with the stored hash
// Returns true if they match
```

---

## Concept 6: PasswordEncoder Implementation Classes

Spring Security provides several implementations:

| Encoder | Recommended? | Notes |
|---------|-------------|-------|
| `NoOpPasswordEncoder` | ❌ No | Stores passwords in **plain text** — defeats the entire purpose |
| `StandardPasswordEncoder` | ❌ No | Uses a legacy hashing algorithm vulnerable to modern CPUs/GPUs |
| `Pbkdf2PasswordEncoder` | ✅ Yes | Secure, uses PBKDF2 algorithm |
| `BCryptPasswordEncoder` | ✅ Yes (Recommended) | Uses BCrypt algorithm — **Spring Security's default recommendation** |
| `SCryptPasswordEncoder` | ✅ Yes | Uses SCrypt algorithm — memory-intensive, harder to brute force |
| `Argon2PasswordEncoder` | ✅ Yes | Uses Argon2 algorithm — winner of the Password Hashing Competition |

### ❓ Why is BCrypt recommended?

BCrypt is specifically designed for password hashing. It's intentionally **slow** — which is a feature, not a bug. The slower the hashing, the more computationally expensive brute force attacks become.

### 💡 Insight

> Regardless of which encoder you use, the registration and login flow remains the same. The only difference is how the algorithms internally hash the value. All recommended encoders are secure and production-ready.

---

## ✅ Key Takeaways

1. **Plain hashing isn't enough** — brute force and rainbow table attacks can crack simple hashes
2. **Salting** adds a random, unique value per user to the hashing process, making every hash unique
3. The **salt is stored alongside the hash** — and that's fine, because it forces hackers to guess per-user
4. Spring Security's `PasswordEncoder` interface handles all complexity — salt generation, hashing, verification
5. **BCryptPasswordEncoder** is the recommended implementation as of today
6. Never use `NoOpPasswordEncoder` or `StandardPasswordEncoder` in production

---

## ⚠️ Common Mistakes

1. **Using NoOpPasswordEncoder in production** — your passwords are stored in plain text
2. **Manually implementing hashing logic** — use Spring Security's built-in encoders instead
3. **Using a simple/short secret value** — makes brute force attacks easier
4. **Not enforcing password complexity rules** — weak passwords are easily brute-forced regardless of the hashing algorithm

---

## 💡 Pro Tips

- The hash values generated by BCrypt will be **different each time** for the same input because a new random salt is generated every time
- You don't need to store the salt separately — BCrypt embeds it within the hash string
- In production, consider the `upgradeEncoding()` method for additional security layers
- Always enforce strong password policies on the registration side
