# (Optional) Installing IntelliJ IDEA

## Introduction

IntelliJ IDEA is one of the most popular Integrated Development Environments (IDEs) for Java. It provides intelligent code completion, built-in debugging, and seamless project management — making it the ideal tool for writing multithreaded Java applications.

This is an **optional** setup step — you can use any Java IDE you prefer.

---

## Step 1: Download IntelliJ Community Edition

1. Search for **"IntelliJ Community Edition"** in your browser
2. Navigate to the official JetBrains website
3. Scroll **past** the Ultimate version (which requires a paid license)
4. Download the **Community Edition** — it's free and has everything we need

⚠️ **Common Mistake:** Accidentally downloading the Ultimate version. The Community Edition is further down the page — scroll past the "30-day free trial" section.

---

## Step 2: Install IntelliJ

1. Run the downloaded installer
2. Choose the destination folder (default is fine)
3. During customization, consider enabling:
   - **Desktop shortcut** — for quick access
   - **"Open Folder as Project"** — right-click any Java project folder to open it in IntelliJ
   - **Java association** — associates `.java` files with IntelliJ
   - **Update PATH variable** — adds IntelliJ's `bin` folder to system PATH
4. Click **Install** and wait (takes 2–3 minutes)
5. **Reboot your computer** when prompted

---

## Step 3: Verify IntelliJ Works

1. Launch **IntelliJ Community Edition**
2. Click **New Project**
3. Give it a name (e.g., "TestProject")
4. Make sure it detects **JDK 23** (installed in the previous lecture)
5. Create a simple `Main` class and add:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello and welcome!");
    }
}
```

6. Click **Run** — you should see `Hello and welcome!` in the console

✅ If the output appears, IntelliJ is properly configured and ready for the course.

---

## ✅ Key Takeaways

- Use the **Community Edition** (free) — it has everything needed for this course
- IntelliJ auto-detects and configures the JDK you installed
- Always verify your setup by running a simple "Hello World" program before moving on
