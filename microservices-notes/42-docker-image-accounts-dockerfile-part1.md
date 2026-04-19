# Generate Docker Image of Accounts Microservice with Dockerfile — Part 1

## Introduction

Before we write a Dockerfile, we need to understand **how a Spring Boot application gets compiled and packaged**. This foundational knowledge is exactly what goes into a Dockerfile — so think of this lecture as gathering the ingredients before writing the recipe.

---

## Setting Up the Workspace

When starting a new section (Section 4), copy the existing microservices code from the previous section (Section 2) into a new folder. This gives you:

- A clean starting point for the section
- The ability to compare changes between sections
- Incremental code uploads per section

> Section 3 was theory-only (right-sizing microservices), so there's no code folder for it.

---

## Configuring the Packaging Type

Before anything else, go to your `pom.xml` and add the packaging type **just after the version tag**:

```xml
<packaging>jar</packaging>
```

Why `jar`? Because when building Docker images, we want our application packaged as a **JAR file** — a single, self-contained archive with all dependencies bundled together.

You *could* use `war`, but JAR is the standard for Docker-based Spring Boot apps.

---

## Building the JAR with Maven

Open your terminal at the folder where `pom.xml` lives, and run:

```bash
mvn clean install
```

### What Happens Behind the Scenes?

1. Maven **compiles** the source code
2. Runs **basic unit tests**
3. If tests pass → generates a **fat JAR** in the `target/` folder

The generated file looks like:

```
target/accounts-0.0.1-SNAPSHOT.jar
```

### What Is a Fat JAR?

A fat JAR (also called an uber JAR) contains **everything** your application needs to run — except the Java runtime itself:

- All Spring Boot libraries
- Embedded Tomcat server
- All project dependencies
- Your business code

The JAR name comes from a combination of `artifactId` + `version` in your `pom.xml`.

---

## Running with Maven vs. Java

### Using Maven

```bash
mvn spring-boot:run
```

This uses the `spring-boot-maven-plugin` configured in your `pom.xml` to locate the JAR in `target/` and start the application.

### Using Java Directly

```bash
java -jar target/accounts-0.0.1-SNAPSHOT.jar
```

This is the **more important command** for Docker purposes. Inside a Docker image, you don't want to install Maven unnecessarily — you just need Java and the JAR file. So the `java -jar` command is what we'll use in the Dockerfile's entrypoint.

Both commands start the application at port **8080**, and you can test it via Postman (Create Account, Fetch Account APIs).

---

## Why This Matters for Docker

Everything we just did maps directly to Dockerfile instructions:

| What We Did                     | Dockerfile Equivalent       |
|---------------------------------|-----------------------------|
| Installed Java                  | `FROM openjdk:17-jdk-slim`  |
| Copied the JAR                  | `COPY target/app.jar app.jar` |
| Ran `java -jar`                 | `ENTRYPOINT ["java","-jar","app.jar"]` |

Understanding these steps makes writing the Dockerfile intuitive rather than mysterious.

---

## ⚠️ Common Mistakes

- Forgetting to add `<packaging>jar</packaging>` in `pom.xml`
- Not having Maven installed or `MAVEN_HOME` not set — verify with `mvn -version`
- Running commands from the wrong directory (must be where `pom.xml` is)
- Forgetting the `spring-boot-maven-plugin` in the `<build>` section

---

## ✅ Key Takeaways

- `mvn clean install` compiles the project and generates a fat JAR in `target/`
- The fat JAR contains everything except the Java runtime
- `java -jar` is the command we'll use inside Docker to run the application
- Understanding how your app gets packaged is **prerequisite knowledge** for writing a Dockerfile

---

## 💡 Pro Tip

Keep the same `artifactId` and version naming conventions as your instructor. If you ever need to debug or compare code, consistent naming makes it **much** easier to spot differences.
