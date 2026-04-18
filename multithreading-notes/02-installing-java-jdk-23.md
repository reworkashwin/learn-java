# Installing Java JDK 23

## Introduction

Before writing any multithreaded Java code, we need the right tools. The **Java Development Kit (JDK)** is the foundation — it contains the Java compiler (`javac`) and the runtime needed to build and execute Java applications.

In this note, we walk through downloading, installing, and verifying JDK 23.

---

## Step 1: Download JDK 23

1. Search for **"Java JDK 23"** in your browser
2. Navigate to the official **Oracle.com** download page
3. Select your operating system (Windows, macOS, or Linux)
4. Download the appropriate installer (e.g., the **64-bit installer** for Windows)

💡 **Pro Tip:** Always download from the official Oracle website to avoid tampered or outdated versions.

---

## Step 2: Install JDK 23

1. Double-click the downloaded installer
2. The default installation path is typically:
   - **Windows:** `C:\Program Files\Java\jdk-23`
   - **macOS:** `/Library/Java/JavaVirtualMachines/jdk-23.jdk`
3. Click **Next** and let the installer complete (takes about a minute)

---

## Step 3: Configure Environment Variables (Windows)

This step is crucial on Windows — it tells your system where to find Java commands.

1. Navigate to the JDK installation folder and locate the `bin` directory
   - Example: `C:\Program Files\Java\jdk-23\bin`
2. Copy this full path (including `bin`)
3. Search for **"Environment Variables"** in Windows
4. Click **Edit the system environment variables** → **Environment Variables**
5. Under **System Variables**, find `Path` → click **Edit** → click **New**
6. Paste the JDK `bin` path
7. If you have a `JAVA_HOME` variable, update it to point to the JDK 23 root folder

⚠️ **Common Mistake:** Forgetting to include the `bin` folder in the path. The `bin` folder contains the actual executable commands like `javac` and `java`.

---

## Step 4: Verify the Installation

Open a terminal or command prompt and run:

```bash
javac -version
```

You should see output like:

```
javac 23
```

Also verify the Java runtime:

```bash
java -version
```

Expected output:

```
java 23
```

✅ If both commands return version 23, your installation is complete and ready to use.

---

## ✅ Key Takeaways

- JDK 23 includes the Java compiler (`javac`) and runtime (`java`)
- The `bin` folder must be added to your system's `PATH` variable
- Always verify installation with `javac -version` and `java -version`
- This JDK is what IntelliJ (or any IDE) uses under the hood to compile and run your code
