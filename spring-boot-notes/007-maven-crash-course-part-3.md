# Maven Crash Course — Part 3: Maven Commands & Build Lifecycle

## Introduction

So far, we've seen Maven as a **dependency manager** — it pulls in libraries so you don't have to download JARs manually. But Maven is much more than that. It's also a powerful **build tool** that can compile your code, run your tests, package your application into a JAR or WAR, and even deploy it.

How does it do all this? Through **Maven commands** — simple instructions you run from the terminal (or your IDE) that trigger specific tasks. And these commands follow a specific **order** called the **Maven Build Lifecycle**.

In this part, we'll walk through every important Maven command, understand what each one does, see how they chain together, and finally watch them in action.

---

## The Maven Commands — One by One

### 1. `mvn clean` — Start Fresh

#### 🧠 What is it?

The `clean` command **deletes the entire `target/` folder** from your project. The `target/` folder is where Maven stores all compiled `.class` files, packaged JARs/WARs, and other build outputs.

#### ❓ Why do we need it?

Sometimes old compiled files hang around and cause weird issues — cache problems, conflicts with older builds, or stale artifacts that don't reflect your latest code changes. Running `clean` ensures you're starting from scratch.

#### ⚙️ How to run it

You have two options:

- **From IntelliJ:** Open the Maven panel → expand **Lifecycle** → double-click **clean**
- **From the terminal:** Type `mvn clean`

Both do the same thing. The moment you run it, the `target/` folder disappears completely.

#### 💡 Insight

Think of `clean` as wiping the kitchen counter before you start cooking. You *could* skip it, but leftover crumbs might mess up what you're making.

---

### 2. `mvn validate` — Sanity Check Your Project

#### 🧠 What is it?

The `validate` command checks whether your project is **properly configured** before any real work begins.

#### ❓ What does it validate?

- Is your `pom.xml` valid XML?
- Are required fields like `groupId`, `artifactId`, and `version` present?
- Is the project structure correct?
- Are all necessary plugins available?

It's essentially a **sanity test** for your project setup.

#### 🧪 Example

If you accidentally remove the `<artifactId>` from your `pom.xml` and run `mvn validate`, Maven will throw an error saying the artifact ID is missing. Fix it, run validate again, and you'll see **BUILD SUCCESS**.

#### 💡 Insight

This is like checking if you have all the ingredients before you start baking. You don't want to find out mid-way that something critical is missing.

---

### 3. `mvn compile` — Compile Your Source Code

#### 🧠 What is it?

This command reads all your Java source files from `src/main/java/`, compiles them into `.class` files, and places them inside the `target/` folder.

#### ⚙️ How it works

- Maven scans the `src/main/java/` directory
- Each `.java` file is compiled into a `.class` file
- The compiled output goes into the `target/classes/` directory

After you run `mvn compile`, if you previously ran `clean`, the `target/` folder will reappear with the freshly compiled classes inside it.

---

### 4. `mvn test` — Run Your Unit Tests

#### 🧠 What is it?

This command runs all the unit test code located in `src/test/java/`.

#### ⚙️ How it works

- Maven looks for test classes under `src/test/java/`
- It executes them using whatever testing framework you're using (JUnit, TestNG, etc.)
- After execution, it gives you a **detailed report**: how many tests passed, how many failed

#### ❓ Why does this matter in real life?

In real-world projects, before deploying an application to a higher environment (like UAT or Production), the deployment pipeline runs `mvn test` to make sure nothing is broken. If tests fail, the deployment stops. This is your safety net.

---

### 5. `mvn package` — Create the JAR or WAR

#### 🧠 What is it?

The `package` command takes your compiled code and **packages it into a distributable file** — either a **JAR** (Java Archive) or a **WAR** (Web Application Archive), depending on your `pom.xml` configuration.

#### ⚙️ How it works

- By default, Maven creates a **JAR** file
- The generated file is placed inside the `target/` folder
- You can change the packaging format by adding a `<packaging>` tag in your `pom.xml`:

```xml
<packaging>war</packaging>
```

If you don't specify `<packaging>`, Maven defaults to `jar`.

#### 🧪 Example

After running `mvn package`, check the `target/` folder — you'll find something like `demo-1.0-SNAPSHOT.jar`. If you configured `<packaging>war</packaging>`, you'll get a `.war` file instead.

#### 💡 Insight

JAR files are the most common packaging format for Spring Boot applications. WAR files are typically used for traditional web applications deployed on external servers like Tomcat.

---

### 6. `mvn verify` — Final Check Before Deployment

#### 🧠 What is it?

The `verify` command ensures that the **build is ready for final installation or deployment**. It compiles, runs tests, packages, and then runs additional verification checks.

If something fails (like a unit test), Maven will tell you so you can fix it before going further.

---

### 7. `mvn install` — The Most Important Command

#### 🧠 What is it?

This is the **most commonly used Maven command**. When you run `mvn install`, Maven does everything:

1. **Validates** the project
2. **Compiles** the source code
3. **Runs tests**
4. **Packages** the application into a JAR/WAR
5. **Verifies** everything is good
6. **Installs the JAR into your local Maven repository**

#### ❓ Why install to the local repository?

Once the JAR is in your local Maven repository (usually at `~/.m2/repository/`), **any other project on your machine** can use it as a dependency. This is how you share libraries between your own projects locally.

#### 🧪 Example

After running `mvn install`, you'll see a log message like:

```
Installing /target/demo-1.0-SNAPSHOT.jar to /Users/you/.m2/repository/com/ezbytes/demo/1.0-SNAPSHOT/demo-1.0-SNAPSHOT.jar
```

That JAR is now available for any project on your system to import.

---

### 8. `mvn deploy` — Publish to a Remote Repository

#### 🧠 What is it?

The `deploy` command does everything `install` does, **plus** it uploads the JAR/WAR to a **remote Maven repository** so that other developers, teams, or even third-party vendors can use it.

#### ⚠️ Important Clarification

`mvn deploy` does **NOT** deploy your application to a server (like Tomcat or AWS). It **publishes your JAR as an artifact** to a remote repository like Maven Central or a private company repository (e.g., Nexus, Artifactory).

#### 💡 Insight

Think of `install` as putting the cake in your own fridge. `deploy` is delivering the cake to a bakery so others can buy it too.

> If you run `mvn deploy` without configuring a remote repository in your `pom.xml`, it will fail — and that's expected.

---

### 9. `mvn site` — Generate Project Documentation

#### 🧠 What is it?

This command generates an **HTML documentation website** for your project automatically. It pulls information from your `pom.xml` — project name, dependencies, summary — and creates browsable HTML pages.

#### ⚙️ How it works

- Run `mvn site`
- A `site/` folder appears inside `target/`
- Open `target/site/index.html` in a browser to see your project documentation

#### ❓ When is this useful?

Enterprise teams building libraries for third-party developers use `mvn site` to auto-generate documentation. The more detail you put in your `pom.xml`, the richer the generated documentation.

---

## The Maven Build Lifecycle — How Commands Chain Together

Here's the critical insight: **you rarely run these commands individually**. Maven commands follow a **sequential lifecycle** — running a later command automatically triggers all the previous ones.

### The Lifecycle Order

```
validate → compile → test → package → verify → install → deploy
```

### What This Means in Practice

| If you run...     | Maven executes...                                              |
|-------------------|----------------------------------------------------------------|
| `mvn compile`     | validate → compile                                             |
| `mvn test`        | validate → compile → test                                      |
| `mvn package`     | validate → compile → test → package                            |
| `mvn install`     | validate → compile → test → package → verify → install          |
| `mvn deploy`      | validate → compile → test → package → verify → install → deploy |

So if you run `mvn install`, you don't need to separately run compile or test — Maven handles all of it for you.

### Where Does `clean` Fit?

`clean` and `site` are **separate lifecycles** — they're NOT automatically triggered by the main lifecycle. If you want a clean build before installing, combine them:

```bash
mvn clean install
```

This first deletes the `target/` folder, then runs the full lifecycle up to `install`.

---

## Real-World Analogy — Baking a Cake 🎂

The Maven lifecycle is like baking a cake:

| Step              | Maven Equivalent | What Happens                        |
|-------------------|------------------|-------------------------------------|
| Check ingredients | `validate`       | Make sure everything is in place    |
| Mix ingredients   | `compile`        | Combine the raw materials           |
| Taste the batter  | `test`           | Verify quality before proceeding    |
| Bake the cake     | `package`        | Create the final product            |
| Put in your fridge| `install`        | Store locally for personal use      |
| Deliver to bakery | `deploy`         | Share with the world                |

Just like you can't bake before mixing, Maven enforces that compile happens before test, test before package, and so on.

---

## The Maven Central Repository (mvnrepository.com)

When Maven pulls dependencies, where do they come from? A website called **[mvnrepository.com](https://mvnrepository.com)**. This is the central hub where thousands of open-source Java libraries are published.

- You can **search** for any library (e.g., search "spring" to find all Spring-related dependencies)
- When you add a dependency in your `pom.xml`, Maven downloads it from here
- If you want to publish your own library for others to use, this is where it would go (via `mvn deploy`)

Maven also gives you the flexibility to set up **private repositories** specific to your organization — useful when companies don't want their internal libraries on the public internet.

---

## Packaging: JAR vs WAR

| Format | Full Name             | When to Use                                       |
|--------|-----------------------|---------------------------------------------------|
| JAR    | Java Archive          | Most common. Used for Spring Boot apps, libraries  |
| WAR    | Web Application Archive | Traditional web apps deployed on servers like Tomcat |

To control the packaging format, add this to your `pom.xml` (after the `<version>` tag):

```xml
<packaging>jar</packaging>   <!-- or war -->
```

If you don't specify it, Maven defaults to **JAR**.

---

## ✅ Key Takeaways

- Maven is not just a dependency manager — it's a full **build lifecycle tool**
- `mvn clean` deletes the `target/` folder for a fresh start
- `mvn install` is the most commonly used command — it compiles, tests, packages, and installs to your local repo
- `mvn deploy` publishes your artifact to a remote repository (not to a server!)
- Commands follow a **lifecycle order** — running a later command automatically runs all previous ones
- `mvn clean install` is the combo you'll use most often in real projects
- JAR is the default and most common packaging format

---

## ⚠️ Common Mistakes

- **Thinking `mvn deploy` deploys to a server** — it doesn't. It publishes your JAR to a repository like Maven Central
- **Running commands individually** — you don't need to run `compile`, then `test`, then `package` separately. Just run `mvn install` and Maven handles everything
- **Forgetting to run `clean`** — old cached files in `target/` can cause mysterious bugs. When in doubt, use `mvn clean install`
- **Not understanding lifecycle ordering** — `mvn package` will also compile and test, even if you didn't explicitly ask for it

---

## 💡 Pro Tips

- In most real-world projects, **`mvn clean install`** is the go-to command during development
- The `target/` folder is **generated** — never put important files there, and never commit it to version control
- Use `mvn validate` as a quick sanity check when something feels off in your project setup
- The `mvn site` command is underrated — use it to auto-generate documentation for your team
- You can find any Java library on [mvnrepository.com](https://mvnrepository.com) and copy its dependency XML directly into your `pom.xml`
