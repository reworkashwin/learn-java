# 🛠️ Document 44: Setting Up Servlet Development - Embedded Tomcat and Maven Project

## Introduction: From Theory to Practice

In Document 43, we learned **what** servlets are and **why** they're important:

✅ Servlets handle HTTP requests and responses
✅ They run in servlet containers (like Tomcat)
✅ Spring MVC builds on top of servlets
✅ Understanding servlets = Understanding Spring MVC's foundation

But we haven't written any code yet!

**"Okay, now let's start working with servlets."**

In this video, we're going to set up our development environment. Before we can write servlet code, we need:

1. **Understand packaging options** (WAR vs JAR)
2. **Choose Tomcat approach** (external vs embedded)
3. **Create a Maven project** for servlet development
4. **Add servlet dependencies** (Jakarta Servlet API)
5. **Add embedded Tomcat** for easy running
6. **Prepare for servlet coding** (next video!)

**Important Note from Instructor:**

**"Now again, you don't have to do all this stuff, which I'm doing in this video. But yeah, if you want to practice, if you want to learn something extra, you can do that."**

This is a **setup video**—no servlet code yet, but critical foundation for what's coming!

Let's get our hands dirty with project setup!

---

## Step 1: The Challenge - Servlets Need Containers

**"The thing is, as I mentioned before, if you want to run your servlet, you need a container, which is your Tomcat server."**

### Recap: Why Containers?

**Regular Java Program:**

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello!");
    }
}

// Run directly:
java HelloWorld
// Runs on JVM → Done!
```

**Servlet:**

```java
public class HelloServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        resp.getWriter().write("Hello!");
    }
}

// Can't run with: java HelloServlet
// ❌ No main() method
// ❌ No HTTP server listening
// ❌ No request routing
// Needs Tomcat! ✅
```

**Servlets have no `main()` method!** They need a container to:
- Listen for HTTP requests on port 8080
- Route requests to correct servlet
- Call servlet methods (doGet, doPost)
- Manage servlet lifecycle

**This is where Tomcat comes in!**

---

## Step 2: Two Approaches for Running Servlets

**"Now there are two options here."**

The instructor will show us **both approaches**, then explain which is better for our learning journey.

### Option 1: External Tomcat Server (Traditional Way)

```
Your Project → Package as WAR → Deploy to Tomcat → Run
```

### Option 2: Embedded Tomcat (Modern Way)

```
Your Project + Embedded Tomcat → Run directly (no deployment)
```

Let's explore both!

---

## Step 3: Understanding WAR vs JAR Packaging

**"So what you can do is you can build your application. So let's say you're building your web application in Java. Now if you want to run this on a server, what you do is you create a package of it."**

### Java Packaging Formats

**JAR (Java Archive):**

**"If you're building a console application, you can use dot jar."**

```
MyApp.jar
├── com/
│   └── telusko/
│       └── MyClass.class
├── lib/
│   └── dependencies.jar
└── META-INF/
    └── MANIFEST.MF
```

**Characteristics:**
- For **console applications** or **libraries**
- Contains compiled Java classes
- Can be executed: `java -jar myapp.jar`
- Self-contained with dependencies

**WAR (Web Archive):**

**"But if you want to make a web application, you use w a R because it runs on Tomcat."**

```
MyWebApp.war
├── WEB-INF/
│   ├── web.xml         (deployment descriptor)
│   ├── classes/        (servlet classes)
│   └── lib/            (dependencies)
├── META-INF/
└── index.html          (static resources)
```

**Characteristics:**
- For **web applications**
- Contains servlets, JSP, HTML, CSS, JS
- Deployed to servlet container (Tomcat, Jetty)
- Structure follows Servlet specification

**"And normally we create a package with the extension dot var which is the web archive."**

### The Deployment Process (Traditional)

**Steps:**

```
1. Write servlet code
        ↓
2. Build project: mvn package
        ↓
3. Creates: myapp.war
        ↓
4. Copy WAR to Tomcat's webapps/ folder
        ↓
5. Start Tomcat: ./startup.sh
        ↓
6. Tomcat unpacks WAR and deploys application
        ↓
7. Access: http://localhost:8080/myapp
```

**This is how production deployments work!**

---

## Step 4: The Modern Alternative - Executable JAR

**"Now of course nowadays we can also create jar which you can directly run again, we'll talk about that in the upcoming videos."**

### Executable JAR with Embedded Server

Spring Boot popularized this approach:

```
MySpringBootApp.jar
├── Application classes
├── Dependencies
└── Embedded Tomcat  ← Server included!
```

**Run directly:**

```bash
java -jar myapp.jar
# Tomcat starts automatically
# Application runs on http://localhost:8080
```

**Benefits:**
- ✅ No separate Tomcat installation
- ✅ Easier deployment (single file)
- ✅ Consistent environment (server version bundled)
- ✅ Microservices-friendly

**"But the important thing is you have to create you have to create a package of your project and put that on a Tomcat server so that you can run it."**

---

## Step 5: Installing External Tomcat (Optional)

**"That means you need a Tomcat server in your machine."**

The instructor demonstrates this approach first (even though we won't use it) to show the traditional way.

### Downloading Apache Tomcat

**"So what I've done is I went to the Google and searched for Apache Tomcat and have downloaded the Tomcat version ten .1. 16 was not important at this point, but you can get the download."**

**Steps:**

1. **Visit:** https://tomcat.apache.org/
2. **Choose version:**
   - Tomcat 10.x (latest, uses Jakarta EE 9+)
   - Tomcat 9.x (older, uses Java EE 8)
   - Tomcat 8.5.x (even older)

3. **Download:**
   - **Windows:** `apache-tomcat-10.1.16.zip`
   - **Mac/Linux:** `apache-tomcat-10.1.16.tar.gz`

4. **Extract to directory:**
   ```
   /Users/yourname/servers/apache-tomcat-10.1.16/
   ```

### Tomcat Directory Structure

**"And you can see once you unzip it you will see all these folders."**

```
apache-tomcat-10.1.16/
├── bin/            ← Scripts to start/stop Tomcat
│   ├── startup.sh   (Linux/Mac)
│   ├── startup.bat  (Windows)
│   ├── shutdown.sh
│   └── shutdown.bat
├── conf/           ← Configuration files
│   └── server.xml
├── lib/            ← Tomcat's own libraries
├── logs/           ← Log files
├── temp/           ← Temporary files
├── webapps/        ← Your WAR files go here! ★
│   ├── ROOT/       (Default application)
│   └── manager/    (Tomcat manager app)
└── work/           ← Working directory
```

**"Now web app is a folder where you put your project. So if you create a project, if you create a package of it, put that into web app."**

### Starting and Stopping Tomcat

**"And if you want to start your Tomcat, you can see in the bin folder, uh, we got a file called startup.sh and shutdown dot s h."**

**Linux/Mac:**

```bash
cd apache-tomcat-10.1.16/bin

# Start Tomcat
./startup.sh

# Stop Tomcat
./shutdown.sh
```

**Windows:**

```bash
cd apache-tomcat-10.1.16\bin

# Start Tomcat
startup.bat

# Stop Tomcat
shutdown.bat
```

**"To start you have to say startup dot h. To shut it down. You have to say shut down dot s h."**

**Verify it's running:**

```
http://localhost:8080
```

You should see the Tomcat welcome page!

**"And here I can if you want to. If you want to start this you can pass this command. It will start."**

---

## Step 6: The Problem with External Tomcat

**"But the thing is we don't want to do extra configuration. All these things."**

### Issues with External Tomcat

**1. Installation Required:**
- Download and extract Tomcat
- Set environment variables (CATALINA_HOME)
- Configure ports if 8080 is taken

**2. Deployment Steps:**
- Build WAR file
- Copy to webapps folder
- Restart Tomcat
- Check logs if something fails

**3. Version Management:**
- Different projects might need different Tomcat versions
- Switching between versions is tedious

**4. Configuration:**
- server.xml for Tomcat settings
- web.xml for deployment descriptors
- Context configuration

**5. Development Overhead:**
- Can't just "Run" in IDE
- Must build → deploy → restart cycle
- Slower feedback loop

**For learning servlets:** Too much friction!

---

## Step 7: The Better Approach - Embedded Tomcat

**"What I want is in my project I want to have Tomcat in build. Can we do that? Yes."**

### What is Embedded Tomcat?

**"There's a concept called embedded Tomcat."**

**Embedded Tomcat** = Tomcat packaged as a library (JAR) that you include in your project.

**How It Works:**

```java
// Your code can start Tomcat programmatically!
Tomcat tomcat = new Tomcat();
tomcat.setPort(8080);
tomcat.start();
// Tomcat is now running inside your Java program
```

**"So what you can do is in your project you can have a embedded tomcat. Now what will what will happen is the moment you run this project."**

### The Magic

**Traditional Way:**

```
1. Write code
2. Build WAR
3. Copy to Tomcat webapps/
4. Start external Tomcat
5. Wait for deployment
6. Test
```

**Embedded Tomcat Way:**

```
1. Write code
2. Click "Run" in IDE
3. Embedded Tomcat starts automatically
4. Test immediately!
```

**"Now, since you already have embedded Tomcat in your project, you can simply run it and it will run your project in that Tomcat."**

---

## Step 8: Why Embedded Tomcat for This Course?

**"So the advantage is you don't have to do all this configuration."**

### Advantages

**1. Zero Setup:**
- No Tomcat installation
- No environment variables
- No deployment descriptors

**2. IDE Integration:**
- Run directly from IDE
- Debug easily
- Fast feedback loop

**3. Self-Contained:**
- Project has everything it needs
- Same Tomcat version for all developers
- No "works on my machine" issues

**4. Modern Approach:**
- This is how Spring Boot works
- Microservices use embedded servers
- Industry standard now

### The Trade-off

**"But yes, if you really want to build an application using servlets, I would suggest you to go for external Tomcat because it provides you more features."**

**External Tomcat Advantages:**
- Full Tomcat admin console
- Advanced configuration options
- Multiple applications on one server
- Production-like environment

**"Uh, but since we are here to learn spring, not servlet, we are learning servlet just to understand what happens behind the scene. So embedded Tomcat will work."**

**Our Goal:** Understand servlets conceptually, not become servlet experts!

Embedded Tomcat is perfect for our needs.

---

## Step 9: Creating the Maven Project

**"Now to create this project. What I will do is I will open my IDE okay in this IDE."**

### Starting a New Project

**In IntelliJ IDEA:**

**"I will click on the new project so you can see it will. It's a new project tab."**

**Steps:**

1. **File → New → Project**
2. New Project window opens

### Project Configuration

**"And here what I will do is I will name this I will say servlet example okay."**

**Project Settings:**

**Name:** `servlet-example`

**"So I'm putting it into projects."**

**Location:** `/Users/yourname/projects/servlet-example`

**"And now I will select the version. I will stick to Java 17 here."**

**JDK:** 17 (or 21 works too)

**Why Java 17?**
- Long Term Support (LTS) version
- Modern features
- Widely used in industry
- Compatible with all tools

### Choosing Maven

**"And now let me create a maven project. So here we are creating a maven project."**

**What is Maven?**

Maven = **Build Tool** + **Dependency Manager**

**What Maven Does:**

```
Maven
├── Manages dependencies (automatically downloads JARs)
├── Compiles code (javac)
├── Runs tests (JUnit)
├── Packages project (JAR/WAR)
└── Follows standard directory structure
```

**Alternative Build Tools:**
- **Gradle** (more flexible, uses Groovy/Kotlin DSL)
- **Ant** (older, XML-based)

**Why Maven for this course?**
- Standard in Spring ecosystem
- Simple XML configuration (pom.xml)
- Huge repository (Maven Central)

**"So I will just say internal and I will create a quick start project."**

**Maven Archetype:** `maven-archetype-quickstart`

An archetype is a project template. Quickstart gives us a simple project structure:

```
servlet-example/
├── src/
│   ├── main/
│   │   └── java/           ← Our servlet code goes here
│   └── test/
│       └── java/           ← Tests go here
└── pom.xml                 ← Maven configuration
```

### Advanced Settings

**"Advanced setting I want to make few changes. I want this to be uh com dot telescope and that's it."**

**GroupId:** `com.telusko`

**ArtifactId:** `servlet-example` (already set)

**Maven Coordinates Explained:**

```
groupId = com.telusko
   ↓
Company/Organization identifier (reverse domain name)

artifactId = servlet-example
   ↓
Project name

version = 1.0-SNAPSHOT
   ↓
Version number
```

**Together, they form unique identifier:**

```
com.telusko:servlet-example:1.0-SNAPSHOT
```

### Creating the Project

**"Create this project. So it will take some time to create the project."**

Maven:
1. Creates directory structure
2. Generates pom.xml
3. Creates sample App.java and AppTest.java
4. Downloads initial dependencies

**"And you got it. So you can see we got our project here."**

---

## Step 10: Understanding the Generated Project Structure

**"And the dependency which we need for this. We already got JUnit here."**

### Project Structure

```
servlet-example/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/
│   │           └── telusko/
│   │               └── App.java          ← Sample main class
│   └── test/
│       └── java/
│           └── com/
│               └── telusko/
│                   └── AppTest.java      ← Sample test
└── pom.xml                               ← Maven config
```

### Generated pom.xml

```xml
<project>
    <groupId>com.telusko</groupId>
    <artifactId>servlet-example</artifactId>
    <version>1.0-SNAPSHOT</version>
    
    <dependencies>
        <!-- JUnit for testing -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.11</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

**What We Have:**
- Basic project structure ✅
- JUnit for testing ✅

**What We Need:**
- Servlet API ❌
- Embedded Tomcat ❌

Let's add them!

---

## Step 11: Adding Servlet API Dependency

**"But if you want to run servlet now this is a normal maven project. If you want to run a servlet here we have to add two packages or two dependencies, not packages dependencies."**

### Why We Need Servlet API

**"The first one is for the servlet because by default servlet is not a part of JDK, you have to add extra dependency."**

**Problem:**

```java
import javax.servlet.http.HttpServlet;  // ❌ Cannot resolve symbol
```

Servlet classes aren't in JDK! They're a separate specification (Jakarta EE).

**"Normally you get these servlet packages from Tomcat, but since we're using Tomcat here, let's also add the servlet support."**

With external Tomcat, the server provides servlet classes. With embedded Tomcat, we need to explicitly add them.

### Finding Servlet API on Maven Repository

**"Now where you will get this. It's easy. Just go to your browser and search for servlet."**

**Steps:**

1. **Visit:** https://mvnrepository.com/
2. **Search:** "servlet"
3. **Find:** "Java Servlet API"

**"And you can see we got Java Servlet API. Click on this."**

### The Jakarta Transition

**"And there's no further updates from Java 21. I think we got Jakarta object now. So after 2018 we have to use Jakarta Servlet."**

**Important History:**

**Before 2018:**
```java
import javax.servlet.*;  // Old package name
```

**After 2018 (Jakarta EE):**
```java
import jakarta.servlet.*;  // New package name
```

**What Happened?**

Oracle donated Java EE to the Eclipse Foundation:
- **Java EE** → **Jakarta EE** (new name)
- **javax.*** → **jakarta.*** (new package)

**For Our Course:**

**"So now I'm going to use version four because we are not here to learn servlet. As I mentioned we are just learning servlet so that we can work on spring MVC. So any older version will also do."**

**The instructor chooses older version (4.0.4) with `javax.*` package:**
- Simpler for learning
- Widely documented
- Version compatibility isn't critical for our learning goals

**Modern projects use Jakarta (5.0+), but the concepts are identical!**

### Adding the Dependency

**"So I'm selecting this 4.0.4 and I will just copy this paste it here."**

**In pom.xml:**

```xml
<dependencies>
    <!-- Existing JUnit dependency -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.11</version>
        <scope>test</scope>
    </dependency>
    
    <!-- Add: Servlet API -->
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>4.0.4</version>
        <scope>provided</scope>
    </dependency>
</dependencies>
```

**Scope Explained:**

```xml
<scope>provided</scope>
```

**What does "provided" mean?**

- **provided** = Needed for compilation, but NOT included in final package
- Why? Because Tomcat provides servlet API at runtime
- Prevents version conflicts (Tomcat's version wins)

**Other Scopes:**
- **compile** = Included everywhere (default)
- **test** = Only for tests
- **runtime** = Not for compilation, only runtime

---

## Step 12: Adding Embedded Tomcat Dependency

**"And second, we have to also add the embedded Tomcat."**

### Finding Embedded Tomcat

**"So we have to basically get this Tomcat embedded code."**

**On Maven Repository:**

1. Search: "tomcat embedded"
2. Find: "Apache Tomcat Embed Core"

**"And any version will do. But then I will make sure that I go for the older version because that normally works with 4.4."**

**Version Compatibility:**

```
Servlet API 4.0  ←→  Tomcat 8.5.x or 9.x
Servlet API 5.0  ←→  Tomcat 10.x
```

**"So I will go for 8.5.96. Copy this, paste it here."**

### Adding the Dependency

```xml
<dependencies>
    <!-- JUnit -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.11</version>
        <scope>test</scope>
    </dependency>
    
    <!-- Servlet API -->
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>4.0.4</version>
        <scope>provided</scope>
    </dependency>
    
    <!-- Embedded Tomcat -->
    <dependency>
        <groupId>org.apache.tomcat.embed</groupId>
        <artifactId>tomcat-embed-core</artifactId>
        <version>8.5.96</version>
    </dependency>
</dependencies>
```

**Why No "provided" Scope?**

Embedded Tomcat needs to be **included in our application** (it's part of our project, not external).

---

## Step 13: Reloading Maven Dependencies

**"And now we got two dependencies. Just refresh or reload. Your maven changes."**

### In IntelliJ IDEA

**Method 1: Maven Tool Window**
1. Open Maven tool window (right side panel)
2. Click **Reload All Maven Projects** 🔄 icon

**Method 2: Popup Notification**
- When you edit pom.xml, IntelliJ shows notification
- Click **"Load Maven Changes"**

**Method 3: Automatic**
- Enable: **Settings → Build, Execution, Deployment → Build Tools → Maven → Importing → "Reload project after changes in the build scripts"**

**What Happens:**

```
1. Maven reads pom.xml
2. Downloads dependencies from Maven Central:
   - javax.servlet-api-4.0.4.jar
   - tomcat-embed-core-8.5.96.jar
   - Plus all transitive dependencies
3. Adds JARs to project classpath
4. IntelliJ indexes them for autocomplete
```

**"It will get the dependencies here."**

### Verifying Dependencies

**"So in the external libraries you can see we got embedded Tomcat."**

**External Libraries (IntelliJ):**

```
External Libraries
├── <Java 17>
├── Maven: junit:junit:4.11
├── Maven: javax.servlet:javax.servlet-api:4.0.4  ← Added!
├── Maven: org.apache.tomcat.embed:tomcat-embed-core:8.5.96  ← Added!
└── ... (other transitive dependencies)
```

**"We also got uh Jakarta which is servlet."**

Actually it's `javax.servlet` (older naming), but concept is the same!

---

## Step 14: Ready to Write Servlet Code

**"And now we can start writing our servlet code. But how will you do that. That's let's discuss that in the next video."**

### What We've Accomplished

✅ **Understood WAR vs JAR** packaging
✅ **Learned external vs embedded Tomcat** difference
✅ **Created Maven project** with proper structure
✅ **Added Servlet API** dependency (javax.servlet-api)
✅ **Added Embedded Tomcat** dependency (tomcat-embed-core)
✅ **Loaded dependencies** successfully

### What's Coming Next (Document 45)

In the next video, we'll actually write servlet code:

1. **Create our first servlet class** (extends HttpServlet)
2. **Understand doGet() method** (handles GET requests)
3. **Write code to programmatically start Tomcat**
4. **Register servlet with Tomcat**
5. **Run and test** from browser
6. **See "Hello World" via HTTP!**

**We're ready to code!** All dependencies are in place.

---

## Key Concepts Summary

### 1. Java Packaging Formats

**JAR (Java Archive):**
- For console applications and libraries
- Execute: `java -jar app.jar`
- Example: Utilities, tools, standalone apps

**WAR (Web Archive):**
- For web applications
- Deploy to servlet container (Tomcat, Jetty)
- Contains: servlets, JSP, static files, WEB-INF/

**Executable JAR (Spring Boot):**
- JAR with embedded server
- Best of both worlds
- Modern approach

### 2. External vs Embedded Tomcat

**External Tomcat:**
- **Pros:** Full features, multiple apps, production-like
- **Cons:** Installation needed, deployment steps, configuration overhead

**Embedded Tomcat:**
- **Pros:** Zero setup, IDE integration, self-contained, modern
- **Cons:** Single app per JVM, fewer admin features

**For Learning:** Embedded Tomcat is perfect!

### 3. Maven Project Structure

```
servlet-example/
├── src/
│   ├── main/
│   │   └── java/          ← Production code
│   └── test/
│       └── java/          ← Test code
├── target/                ← Compiled output
└── pom.xml                ← Maven configuration
```

### 4. Maven Coordinates

```
<groupId>com.telusko</groupId>      ← Organization
<artifactId>servlet-example</artifactId>  ← Project name
<version>1.0-SNAPSHOT</version>     ← Version
```

Uniquely identifies project in Maven ecosystem.

### 5. Required Dependencies for Servlets

**1. Servlet API:**
```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.4</version>
    <scope>provided</scope>
</dependency>
```

Provides: `HttpServlet`, `HttpServletRequest`, `HttpServletResponse`

**2. Embedded Tomcat:**
```xml
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-core</artifactId>
    <version>8.5.96</version>
</dependency>
```

Provides: Ability to run Tomcat programmatically

### 6. Dependency Scopes

| Scope | Compilation | Runtime | Packaged | Use Case |
|-------|-------------|---------|----------|----------|
| **compile** | ✅ | ✅ | ✅ | Default; always needed |
| **provided** | ✅ | ❌ | ❌ | Container provides (servlet-api) |
| **runtime** | ❌ | ✅ | ✅ | JDBC drivers |
| **test** | ✅ | ✅ | ❌ | JUnit |

### 7. Jakarta vs Java EE

**Timeline:**

```
Before 2018:
javax.servlet.*  (Java EE)
↓
2018: Oracle → Eclipse Foundation
↓
After 2018:
jakarta.servlet.*  (Jakarta EE)
```

**Compatibility:**

```
Servlet 4.0 → javax.servlet → Tomcat 9.x
Servlet 5.0 → jakarta.servlet → Tomcat 10.x
```

**Both work the same way!** Just package name changed.

---

## Complete pom.xml

Here's our complete Maven configuration:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.telusko</groupId>
    <artifactId>servlet-example</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- JUnit for Testing -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.11</version>
            <scope>test</scope>
        </dependency>

        <!-- Servlet API -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>4.0.4</version>
            <scope>provided</scope>
        </dependency>

        <!-- Embedded Tomcat -->
        <dependency>
            <groupId>org.apache.tomcat.embed</groupId>
            <artifactId>tomcat-embed-core</artifactId>
            <version>8.5.96</version>
        </dependency>
    </dependencies>
</project>
```

---

## Troubleshooting Common Issues

### Issue 1: "Cannot resolve symbol 'servlet'"

**Error:**
```java
import javax.servlet.http.HttpServlet;  // Red underline
```

**Cause:** Servlet API dependency not loaded.

**Solution:**
1. Check pom.xml has servlet-api dependency
2. Reload Maven changes
3. Verify in External Libraries

### Issue 2: Maven Dependencies Not Downloading

**Symptoms:** External Libraries empty, red errors everywhere

**Solutions:**

1. **Check Internet Connection**
   ```bash
   ping repo.maven.apache.org
   ```

2. **Force Update:**
   ```bash
   mvn clean install -U
   ```

3. **Clear Local Repository:**
   ```bash
   rm -rf ~/.m2/repository
   # Then reload Maven
   ```

4. **Check Maven Settings:**
   - Settings → Build → Build Tools → Maven
   - Verify Maven home directory
   - Check settings.xml if using custom

### Issue 3: Version Conflicts

**Error:**
```
java.lang.NoSuchMethodError: javax.servlet...
```

**Cause:** Servlet API and Tomcat versions incompatible.

**Solution:** Use compatible versions:
```
Servlet 4.0 + Tomcat 8.5 or 9.x ✅
Servlet 5.0 + Tomcat 10.x ✅
```

### Issue 4: "Build path errors"

**Cause:** JDK not configured properly.

**Solution:**
1. File → Project Structure → Project SDK
2. Select Java 17 (or 21)
3. Apply → OK

---

## Best Practices for Servlet Projects

### 1. Use Embedded Servers for Development

```
Development: Embedded Tomcat (fast iteration)
Production: External Tomcat/Jetty (full features)
```

### 2. Keep Dependencies Updated

But not too aggressively:
- Use stable versions
- Avoid SNAPSHOT versions in production
- Test thoroughly after updates

### 3. Use Dependency Management

Let Spring Boot manage versions (we'll see this later):

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<!-- No version needed! Spring Boot decides -->
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-core</artifactId>
</dependency>
```

### 4. Understand Scope Usage

```xml
<!-- API you code against, server provides -->
<scope>provided</scope>

<!-- Implementation packaged with app -->
<!-- No scope (defaults to compile) -->
```

---

## What's Next

We've set up the project foundation. In Document 45, we'll write actual servlet code:

**Coming Up:**
- Creating a servlet class
- Implementing doGet() method
- Starting embedded Tomcat programmatically
- Registering servlets
- Testing from browser

**The foundation is laid—let's build on it!** 🚀

---

## Conclusion: Project Setup Complete!

We've successfully prepared our development environment for servlet coding:

✅ **Understood packaging options** (WAR for external, JAR for embedded)
✅ **Chose embedded Tomcat** (simpler for learning)
✅ **Created Maven project** with proper structure
✅ **Added Servlet API** (javax.servlet-api 4.0.4)
✅ **Added Embedded Tomcat** (tomcat-embed-core 8.5.96)
✅ **Verified dependencies** loaded correctly

**Key Takeaway:**

**"But since we are here to learn spring, not servlet, we are learning servlet just to understand what happens behind the scene. So embedded Tomcat will work."**

We're not becoming servlet experts—we're understanding the foundation that Spring MVC builds upon!

**Next:** Let's write our first servlet and see HTTP in action! 🎯
