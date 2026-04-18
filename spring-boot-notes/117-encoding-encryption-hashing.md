# Encoding vs Encryption vs Hashing — Protecting Passwords the Right Way

## Introduction

When you first start building applications, you might think: "I'll just store the user's password as-is in the database. During login, I'll compare what they typed with what's stored. Simple!"

And you're not wrong — that *would* work. But it's a **terrible idea** for production applications. Why? Because if anyone gains access to your database — a rogue admin, a hacker, an operations team member — they can see every user's password in plain text. They could impersonate anyone, do anything. That's a massive security risk.

So the real question becomes: **How do we store passwords in a format that nobody can understand, even if they have full access to the database?**

The industry gives us three approaches for transforming data: **Encoding**, **Encryption**, and **Hashing**. But not all of them are suitable for passwords. Let's walk through each one and understand *why*.

---

## Concept 1: The Problem with Plain Text Passwords

### 🧠 What is it?

Storing passwords exactly as the user types them (e.g., `12345`) directly into the database.

### ❓ Why is this bad?

Think about it — if your database stores:

| Username | Password |
|----------|----------|
| john     | 12345    |
| jane     | password |

Anyone who can query this table — database admins, operations team, or a hacker who breaches the system — sees everything. They can log in as any user and do whatever they want.

This approach violates two key security principles:
- **Confidentiality** — passwords should be secret
- **Integrity** — no one should be able to impersonate another user

### 💡 Insight

> Never store passwords in plain text. This is Security 101.

---

## Concept 2: Encoding — Looks Safe, But Isn't

### 🧠 What is it?

Encoding is a process of converting data from one form to another. It transforms your plain text password into something that *looks* different — but here's the catch: **it has nothing to do with security or cryptography**.

### ⚙️ How it works

1. You feed a plain text value (e.g., `12345`) into an encoding algorithm
2. You get an encoded value back (looks gibberish)
3. **But** — anyone can run the reverse process (called **decoding**) to get the original value back

```
Plain Text → [Encoding] → Encoded Value
Encoded Value → [Decoding] → Plain Text  ← Anyone can do this!
```

### 🧪 Common Encoding Algorithms

- **ASCII** — maps characters to numbers
- **Base64** — commonly used for encoding binary data in text
- **Unicode** — standard for text representation

### ❓ Why is encoding NOT suitable for passwords?

Because there's **no secret involved**. Anyone who knows the encoding algorithm (which is public knowledge) can simply decode your value and get the original password. There's zero security.

> It's like writing a secret message in Pig Latin — sure, it looks different, but anyone can figure it out.

### ⚠️ Common Mistake

> Don't confuse encoding with encryption. Encoding is NOT a security mechanism. It's a data format transformation.

---

## Concept 3: Encryption — Better, But Still Risky

### 🧠 What is it?

Encryption is a process of transforming data in a way that **guarantees confidentiality**. Unlike encoding, encryption requires the use of a **secret key**.

### ⚙️ How it works

1. You feed two inputs into an encryption algorithm:
   - The plain text password (e.g., `12345`)
   - A **secret key** (known only to the server)
2. The algorithm produces **encrypted data**
3. To reverse it (decryption), you **must** know the secret key

```
Plain Text + Secret Key → [Encryption] → Encrypted Data
Encrypted Data + Secret Key → [Decryption] → Plain Text
```

Without the secret key, the encrypted data is useless. So far, so good — right?

### ❓ Why is encryption NOT ideal for passwords?

The fundamental weakness is: **you can never guarantee that the secret key stays secret**.

- Server admins have access to production servers
- Operations team members can inspect the code
- Platform engineers can see configuration files

Once someone knows the secret key AND the encryption algorithm, they can decrypt every password in your database.

### 💡 Insight

> Encryption is great for protecting data **in transit** (like HTTPS), but it's not the best option for **storing passwords** because decryption is always possible if the key is compromised.

---

## Concept 4: Hashing — The Right Choice for Passwords

### 🧠 What is it?

Hashing is a **one-way** process. You feed data into a hash function, and it produces a fixed-length output called a **hash value** (or **digest**). The critical difference from encoding and encryption?

**There is no reverse operation.** Once data is hashed, you cannot get the original value back. Ever.

### ⚙️ How it works

```
Plain Text → [Hash Function] → Hash Value (Digest)
Hash Value → [???] → ❌ Cannot reverse!
```

- If you feed the **same input** to the **same hash function**, you always get the **same hash value**
- But from the hash value, you **cannot** derive the original input

### 🧪 Real-World Analogy — The Blender

Imagine a blender as your hash function:

1. You put fruits (watermelon, pineapple, apple) into the blender → **that's your input**
2. The blender produces juice → **that's your hash value**
3. Can you put the juice back into the blender and get the original fruits? **Absolutely not!**

Just like a blender can't reverse juice into fruits, a hash function can't reverse a hash value into the original password.

### ❓ Why is hashing suitable for passwords?

Because even if a hacker gets access to your database and sees the hash values, they **cannot** reverse-engineer the original passwords. The hash values are meaningless without the ability to reverse them.

### 💡 Insight

> Hashing is a one-way street. There's no "unhashing". That's what makes it perfect for password storage.

---

## Concept 5: Visual Comparison — Encoding vs Encryption vs Hashing

| Feature | Encoding | Encryption | Hashing |
|---------|----------|------------|---------|
| **Purpose** | Data format conversion | Data confidentiality | Data integrity / password storage |
| **Reversible?** | ✅ Yes (anyone can decode) | ✅ Yes (with secret key) | ❌ No (one-way only) |
| **Secret Required?** | ❌ No | ✅ Yes (key) | ❌ No |
| **Suitable for Passwords?** | ❌ No | ⚠️ Risky | ✅ Yes |

### The Flow:

- **Encoding**: `Plain Text → Encoded Text → [Decode] → Plain Text` *(too easy to reverse)*
- **Encryption**: `Plain Text + Key → Encrypted Text → [Decrypt + Key] → Plain Text` *(key can leak)*
- **Hashing**: `Plain Text → Hash Value → ❌ No reverse possible` *(perfect for passwords)*

---

## ✅ Key Takeaways

1. **Never store passwords in plain text** — it's a massive security vulnerability
2. **Encoding is NOT security** — it's just data format conversion; anyone can decode it
3. **Encryption is reversible** — if the secret key is compromised, all passwords are exposed
4. **Hashing is one-way** — once hashed, the original value cannot be recovered, making it the best choice for password storage
5. The industry standard for password storage is **hashing**, and Spring Security provides built-in tools to make this easy

---

## ⚠️ Common Mistakes

1. **Using Base64 encoding and thinking passwords are "secure"** — Base64 is encoding, not encryption
2. **Storing encryption keys alongside encrypted passwords** — if someone gets the database, they likely get the keys too
3. **Assuming encryption = hashing** — they're fundamentally different; encryption is reversible, hashing is not

---

## 💡 Pro Tips

- Hashing has its own challenges (brute force attacks, rainbow tables) — we'll address those in the next lecture
- Spring Security handles all the hashing complexity for you through **Password Encoders**
- Always think about password security from the start of your project, not as an afterthought
