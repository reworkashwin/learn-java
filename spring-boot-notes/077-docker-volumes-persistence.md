# Persist Like a Pro — Teaching Docker Containers to Remember Things

## Introduction

Here's a scary scenario: you've been using your MySQL Docker container for weeks. You've created tables, inserted thousands of records, built your entire application around this data. Then one day, you accidentally **delete the container**. What happens?

**All your data is gone.** Poof. Vanished.

This is one of the most important Docker concepts to understand — and one of the most common traps beginners fall into. Let's learn about Docker volumes and how they solve the data persistence problem.

---

## The Problem — Where Does Container Data Live?

### 🧠 Production vs Local: A Critical Difference

In **production environments** (AWS, Azure, GCP):
- MySQL databases store data on the server's **hard disk** (500 GB, 1 TB, etc.)
- Even if you restart the database server, **data persists** because it lives on the disk
- Enterprise teams also take **backups** to separate locations for disaster recovery

In **Docker containers** (local development):
- All data is stored **inside the container** itself
- Specifically, MySQL stores data in `/var/lib/mysql/` inside the container
- If you **delete** the container → **all data is lost**
- If you **stop and restart** the container → data is safe (the container still exists)

### 🔍 Where Exactly Is the Data?

In Docker Desktop, if you click on your container → **Files** tab → you can browse the container's filesystem:

```
/var
  /lib
    /mysql        ← All your database data lives here
      /jobportal  ← Your schema's data files
```

This data exists **only inside the container**. Delete the container, and this entire file tree disappears.

---

## Demo: Stop vs Delete — A Crucial Distinction

### ⏸️ Stopping a Container (Safe)

When you **stop** a container:
- The container still exists in Docker
- It's just in a "stopped" state
- All data inside it **is preserved**
- When you start it again, everything is exactly as you left it

```bash
# Stop the container
docker stop jobportaldb

# Start it again — all data intact!
docker start jobportaldb
```

### 🗑️ Deleting a Container (Dangerous!)

When you **delete** a container:
- The container is completely removed
- All data stored inside it **is permanently lost**
- Even if you recreate a container with the same name, it starts fresh — no tables, no records, nothing

```bash
# Delete the container — DATA IS LOST!
docker rm jobportaldb

# Recreate — starts with empty database
docker run -d --name jobportaldb ... mysql
```

Try calling your REST API after recreating — you'll get an error because the `companies` table doesn't exist anymore.

> This isn't just a MySQL thing — the same problem happens with **any** Docker container: RabbitMQ, Kafka, Redis, PostgreSQL, etc.

---

## The Solution — Docker Volumes

### 🧠 What Are Docker Volumes?

Docker volumes let you **mount a local folder** from your system to a container. Instead of storing data inside the container (which is temporary), the container stores data in your **local filesystem** (which is permanent).

### 🔌 The USB Drive Analogy

Think of Docker volumes as plugging a **USB drive** into your container:

```
Your Laptop                          Docker Container
┌──────────────────┐                ┌──────────────┐
│ ~/Desktop/        │   USB Drive   │              │
│   jobportal-data/ │ ◄══════════►  │ /var/lib/mysql│
│   (permanent)     │               │              │
└──────────────────┘                └──────────────┘
```

- The container writes data to `/var/lib/mysql/` (as usual)
- But because of the volume mapping, that data is **actually stored** in your local folder
- Delete the container? The USB drive (local folder) **stays on your laptop**
- Create a new container with the same volume? It picks up where the old one left off!

---

## Setting Up Docker Volumes

### ⚙️ The Command

```bash
docker run -d \
  --name jobportaldb \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=jobportal \
  -v ~/Desktop/jobportal-data:/var/lib/mysql \
  mysql
```

The new flag is:

```bash
-v ~/Desktop/jobportal-data:/var/lib/mysql
```

### 📌 Volume Mapping Syntax

```
-v LOCAL_FOLDER:CONTAINER_FOLDER
```

| Part | Meaning |
|------|---------|
| `LOCAL_FOLDER` | Path on your laptop where data will be stored permanently |
| `:` | Separator |
| `CONTAINER_FOLDER` | Path inside the container where the app writes data |

#### Path format by OS:

| OS | Example Local Path |
|----|--------------------|
| **macOS** | `~/Desktop/jobportal-data` or `/Users/yourname/Desktop/jobportal-data` |
| **Windows** | `C:\Users\yourname\Desktop\jobportal-data` |
| **Linux** | `/home/yourname/Desktop/jobportal-data` |

### ❓ What Happens Behind the Scenes?

1. Container starts and MySQL tries to write data to `/var/lib/mysql/`
2. Because of the volume mapping, the data is **redirected** to `~/Desktop/jobportal-data/`
3. Your local folder now contains all of MySQL's data files
4. If you delete the container, the local folder **remains untouched**
5. If you create a new container with the **same volume mapping**, MySQL reads the existing data from the local folder and your database is restored — tables, records, everything!

---

## Demo: Proving Volumes Work

### Step 1: Create Container with Volume

```bash
docker run -d --name jobportaldb -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=jobportal \
  -v ~/Desktop/jobportal-data:/var/lib/mysql \
  mysql
```

### Step 2: Execute SQL Scripts

Run your schema and data SQL scripts to create tables and insert records.

### Step 3: Verify API Works

Call your REST API — you get all company records. ✅

### Step 4: Delete the Container

```bash
docker rm -f jobportaldb
```

Container is gone. But check your `~/Desktop/jobportal-data/` folder — **it's still full of data files**.

### Step 5: Recreate with Same Volume

```bash
docker run -d --name jobportaldb -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=jobportal \
  -v ~/Desktop/jobportal-data:/var/lib/mysql \
  mysql
```

### Step 6: Call the API Again

All your company records are back! 🎉 The data survived the container deletion because it was stored in your local folder.

> Even if you delete the container and recreate it **one year later** with the same volume mapping, you'll get the same data back.

---

## ✅ Key Takeaways

- **Stopping** a container preserves its data; **deleting** a container destroys it
- Docker volumes solve the data persistence problem by storing data **outside** the container
- Volume syntax: `-v LOCAL_PATH:CONTAINER_PATH`
- For MySQL, the container data path is always `/var/lib/mysql`
- As long as the local folder exists, you can recreate containers and **recover all data**
- This concept applies to **any** Docker container, not just MySQL

## ⚠️ Common Mistakes

- **Not using volumes at all** — Your data disappears the moment you delete a container
- **Using different local folder paths** when recreating containers — The new container won't find the old data
- **Confusing stop with delete** — Stop is safe (data preserved). Delete is destructive (data lost without volumes)
- **Wrong path format** — macOS uses `/Users/...`, Windows uses `C:\Users\...`

## 💡 Pro Tips

- **Always use volumes** for any container that stores data (databases, message queues, etc.)
- Keep your volume data in a consistent, easy-to-find location (like `~/Desktop/` or `~/docker-data/`)
- You can share the same volume data across multiple containers — useful for database migrations and testing
- In production, cloud-managed databases handle persistence differently (using managed disks and automated backups) — volumes are primarily for local Docker development
