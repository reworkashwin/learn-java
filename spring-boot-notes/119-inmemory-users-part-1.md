# Creating Users Using InMemoryUserDetailsManager — Part 1

## Introduction

So far, we've been configuring a single user using application properties. But real applications need **multiple users** with different roles and credentials. In this lecture, we'll take the next step: creating multiple users programmatically using Spring Security's `InMemoryUserDetailsManager`, and we'll wire up the `BCryptPasswordEncoder` to hash all passwords properly.

---

## Concept 1: Setting Up the New Project

### 🧠 What's changing?

We're starting a new section, so the instructor creates a fresh project folder and copies the backend code from the previous section. The key changes:

1. **Remove** the single-user properties (`spring.security.user.name`, etc.) from `application.properties`
2. **Clean up** commented-out code from `JobPortalSecurityConfig`
3. Start building a proper multi-user setup

### 💡 Insight

> Moving from property-based single-user config to programmatic multi-user config is a natural evolution as your application grows.

---

## Concept 2: Configuring the PasswordEncoder Bean

### 🧠 What is it?

Before creating users, you need to tell Spring Security **which hashing algorithm** to use for password encoding. You do this by creating a `PasswordEncoder` bean.

### ⚙️ How to create it

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

That's it! With this single bean definition, you're instructing Spring Security:

> "Whenever anyone registers or logs in, use BCrypt for password hashing."

### 🧪 What's inside BCryptPasswordEncoder?

If you look inside the `BCryptPasswordEncoder` class, you'll find:

- **`encodeNonNullPassword()`** — generates a random salt using `getSalt()`, then calls `BCrypt.hashpassword()` with the raw password + salt
- **`matchesNonNull()`** — accepts the raw password and encoded password, calls `BCrypt.checkpassword()` to verify

All the complex hashing logic is already written for you.

### 💡 Insight

> If you ever want to switch to a different encoder (like `SCryptPasswordEncoder`), you just change the return type in this one method. The rest of your code stays the same.

---

## Concept 3: Creating Multiple Users Programmatically

### 🧠 What is it?

Instead of configuring users in properties files, you create them in Java code using Spring Security's `User` builder pattern.

### ⚙️ Step-by-step

```java
@Bean
public UserDetailsService userDetailsService() {
    
    UserDetails user1 = User.builder()
        .username("madan")
        .password(passwordEncoder().encode("Madan@123"))
        .roles("USER")
        .build();
    
    UserDetails user2 = User.builder()
        .username("admin")
        .password(passwordEncoder().encode("admin@123"))
        .roles("ADMIN")
        .build();
    
    return new InMemoryUserDetailsManager(user1, user2);
}
```

Let's break this down:

1. **`User.builder()`** — starts building a user object
2. **`.username("madan")`** — sets the username
3. **`.password(passwordEncoder().encode("Madan@123"))`** — hashes the password using BCrypt before storing
4. **`.roles("USER")`** — assigns one or more roles (accepts multiple values via spread operator)
5. **`.build()`** — creates the `UserDetails` object

### ❓ Why invoke `passwordEncoder().encode()` for the password?

Because `InMemoryUserDetailsManager` stores whatever you give it. If you pass a plain text password, it stores plain text. You need to explicitly hash it.

---

## Concept 4: InMemoryUserDetailsManager — What and Why

### 🧠 What is it?

`InMemoryUserDetailsManager` is a class that implements `UserDetailsService` (and its child interface `UserDetailsManager`). It stores user details **in the application's memory** — not in a database.

### ⚙️ The Interface Hierarchy

```
UserDetailsService (interface)
  └── loadUserByUsername()    ← retrieves user by username

UserDetailsManager (interface, extends UserDetailsService)
  └── createUser()
  └── updateUser()  
  └── deleteUser()
  └── changePassword()

InMemoryUserDetailsManager (class, implements UserDetailsManager)
  └── Stores users in a HashMap in memory
```

### ❓ When to use InMemoryUserDetailsManager?

- **Demo applications** where you need quick user setup
- **Low-priority apps** or prototypes
- **Testing scenarios** where you don't want database setup
- **NOT for production** — users are lost when the application restarts

### 🧪 Creating the Bean

```java
return new InMemoryUserDetailsManager(user1, user2);
```

The constructor accepts any number of `UserDetails` objects. Need 10 users? Just pass all 10.

### 💡 Insight

> By creating a bean of type `UserDetailsService`, you're telling Spring Security: "From now on, use MY user store for authentication, not the default." The `DaoAuthenticationProvider` will automatically pick up your bean.

---

## Concept 5: The Hard-Coded Password Problem

### ⚠️ The Issue

In the code above, passwords like `"Madan@123"` are written directly in Java source code. Anyone with access to the source code can see them. That's a security risk.

### ✅ The Solution — Pre-hash and Use Hash Values

Instead of encoding at runtime, you can:

1. **Run the encoder once** to get the hash values:

```java
var password1 = passwordEncoder().encode("Madan@123");
var password2 = passwordEncoder().encode("admin@123");
System.out.println(password1);
System.out.println(password2);
```

2. **Copy the printed hash values** from the console

3. **Use the hash values directly** in your code:

```java
UserDetails user1 = User.builder()
    .username("madan")
    .password("$2a$10$xyz...abc...")  // pre-computed hash
    .roles("USER")
    .build();
```

Now, even if someone sees your source code, they can't figure out the original password — they only see the irreversible hash.

### 💡 Insight

> BCrypt generates a **different hash** each time for the same input (because of the random salt). So your hash values will differ from someone else's, even for the same password. That's a feature, not a bug!

---

## Concept 6: How This Fits into the Authentication Flow

When a user logs in with these configurations:

1. **Step 5** — `DaoAuthenticationProvider` calls `loadUserByUsername()` on your `InMemoryUserDetailsManager` bean to retrieve user details
2. **Step 6** — The framework uses `BCryptPasswordEncoder.matches()` to compare the entered password with the stored hash

Everything plugs in automatically because you've defined the right beans.

---

## ✅ Key Takeaways

1. Create a `PasswordEncoder` bean returning `BCryptPasswordEncoder` — this is the recommended encoder
2. Create a `UserDetailsService` bean using `InMemoryUserDetailsManager` with your users
3. Use `User.builder()` to create users with hashed passwords and roles
4. **Never hard-code plain text passwords** in source code — pre-hash and use hash values instead
5. `InMemoryUserDetailsManager` is great for demos/testing but NOT for production
6. The framework automatically uses your beans in the authentication flow

---

## ⚠️ Common Mistakes

1. **Forgetting to create the `PasswordEncoder` bean** — authentication will fail because the framework can't verify passwords
2. **Passing plain text to `.password()`** without encoding — the comparison will fail during login
3. **Hard-coding passwords in source code** — always use pre-computed hash values
4. **Using `InMemoryUserDetailsManager` in production** — users disappear when the app restarts

---

## 💡 Pro Tips

- You can add as many users as needed — just pass them all to the `InMemoryUserDetailsManager` constructor
- The `.roles()` method accepts multiple roles: `.roles("USER", "ADMIN")`
- We'll eventually move to database-backed user storage for production use
