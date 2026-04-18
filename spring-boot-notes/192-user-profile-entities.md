# Designing the User Profile Database & JPA Entities

## Introduction

So far in our Job Portal, we've built features around jobs and employers. But what about the **job seeker**? The whole point of a job portal is for people to come, complete their profile, and apply for jobs. In this lecture, we focus on the **My Profile** feature — the database design, table creation, and JPA entity setup that makes it all possible.

Why does this matter? Because before a job seeker can apply for any job, they need a complete profile — with resume, skills, experience, and even a profile picture. And storing files (like PDFs and images) in a database introduces new complexities you haven't seen before.

---

## The My Profile Feature — What Are We Building?

When a job seeker logs into the portal, they're greeted with a banner: **"Complete your profile first to start applying."** Until they fill in all mandatory fields and upload their resume, they can't apply for any job.

The profile page has two tabs:

1. **Basic Info** — Job title, location, experience level, professional biography, website, and profile picture
2. **Files** — Resume upload and profile picture upload

There's also a **profile completeness score**. The score starts at 30% (just name, email, phone from registration). The user must reach **100%** to apply — meaning all mandatory fields must be filled and a resume uploaded.

💡 **Pro Tip:** Profile completeness scores are a common UX pattern in real-world applications (LinkedIn, Indeed, etc.). They gamify the onboarding process and encourage users to provide more data.

---

## Designing the Database Table

### Why a Separate `profiles` Table?

We already have a `users` table that stores registration data (name, email, phone, password). But profile data — job title, experience, resume — is **conceptually different**. It belongs to the user's professional identity, not their authentication credentials.

By separating them, we follow the **Single Responsibility Principle** at the database level: the `users` table handles auth, the `profiles` table handles professional data.

### The `profiles` Table Structure

```sql
CREATE TABLE profiles (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id       BIGINT UNIQUE,           -- FK to users.id
    job_title     VARCHAR(255),
    location      VARCHAR(255),
    experience_level VARCHAR(255),
    professional_biography TEXT,            -- Large text data
    professional_website   VARCHAR(255),
    
    -- Profile Picture (stored as binary)
    profile_picture       MEDIUMBLOB,
    profile_picture_name  VARCHAR(255),
    profile_picture_type  VARCHAR(255),
    
    -- Resume (stored as binary)
    resume                MEDIUMBLOB,
    resume_name           VARCHAR(255),
    resume_type           VARCHAR(255),
    
    -- Audit columns
    created_at   DATETIME,
    updated_at   DATETIME,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Key Column Design Decisions

#### The `TEXT` Data Type for Biography

Why `TEXT` instead of `VARCHAR(255)`? Because a professional biography can be long — paragraphs describing someone's career journey. MySQL's `TEXT` type supports up to **65,535 characters**, whereas `VARCHAR` maxes out at 255 in many configurations.

> Think of it like this: `VARCHAR` is a sticky note, `TEXT` is a full letter.

#### The `MEDIUMBLOB` Data Type for Files

**BLOB** stands for **Binary Large Object**. At the end of the day, every file — whether it's a PDF, JPEG, or PNG — is just binary data (bytes). That's exactly what BLOB columns store.

MySQL offers several BLOB sizes:

| Type       | Max Size |
|------------|----------|
| TINYBLOB   | 255 bytes |
| BLOB       | 64 KB |
| MEDIUMBLOB | 16 MB |
| LONGBLOB   | 4 GB |

We use `MEDIUMBLOB` because resumes and profile pictures are typically a few hundred KB to a few MB — well within 16 MB.

#### Why Three Columns Per File?

For both profile picture and resume, we store **three pieces of information**:

1. **The actual binary data** (`profile_picture`, `resume`) — the file content itself
2. **The file name** (`profile_picture_name`, `resume_name`) — e.g., "john_resume.pdf"
3. **The file type** (`profile_picture_type`, `resume_type`) — e.g., "image/jpeg" or "application/pdf"

Why do we need the type? Because when we send the file back to the client, the browser needs to know **how to display it**. A JPEG should be rendered as an image; a PDF should open in a viewer. Without the content type, the browser might just show raw binary garbage.

⚠️ **Common Mistake:** Storing only the binary data without the file name and type. You'll lose the ability to properly serve the file back to clients.

---

## The `OneToOne` Relationship — User ↔ Profile

Each user has exactly **one** profile, and each profile belongs to exactly **one** user. This is a textbook `@OneToOne` relationship.

The `profiles` table owns the relationship because it contains the `user_id` foreign key column.

---

## Creating the JPA Entity

### The `Profile` Entity

```java
@Entity
@Table(name = "profiles")
public class Profile extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "user_id")
    private JobPortalUser user;

    private String jobTitle;
    private String location;
    private String experienceLevel;

    @Lob
    private String professionalBiography;

    private String professionalWebsite;

    @Lob
    private byte[] profilePicture;
    private String profilePictureName;
    private String profilePictureType;

    @Lob
    private byte[] resume;
    private String resumeName;
    private String resumeType;

    // Getters and setters...
}
```

### Key Annotations Explained

#### `@OneToOne` + `@JoinColumn`

Since the `profiles` table **owns** the relationship (it has the `user_id` FK column), we annotate the `user` field with both `@OneToOne` and `@JoinColumn(name = "user_id")`.

#### `@Lob` — Large Object Annotation

The `@Lob` annotation tells JPA: "This field holds large data." It's used for:

- `professionalBiography` — mapped to `TEXT` in MySQL
- `profilePicture` and `resume` — mapped to `MEDIUMBLOB` in MySQL

Without `@Lob`, JPA might try to map these fields to smaller column types and truncate your data.

#### `byte[]` for File Fields

Files are stored as **byte arrays** (`byte[]`). When you upload a file, Spring converts it into bytes. Those bytes go into the database. When you retrieve the file, bytes come out and get converted back.

### The Inverse Side — Updating `JobPortalUser`

Since `@OneToOne` is bidirectional, the `JobPortalUser` entity also needs to know about the profile:

```java
@OneToOne(mappedBy = "user")
private Profile profile;
```

The `mappedBy = "user"` tells JPA: "The `Profile` entity owns this relationship through its `user` field. I'm just the inverse side."

---

## Creating the Repository and DTO

### The Repository

```java
public interface ProfileRepository extends JpaRepository<Profile, Long> {
}
```

Simple and clean — no custom methods needed yet.

### The DTO Record

```java
public record ProfileDto(
    Long id,
    Long userId,
    @NotBlank @Size(max = 255) String jobTitle,
    @NotBlank @Size(max = 255) String location,
    @NotBlank @Size(max = 255) String experienceLevel,
    @NotBlank String professionalBiography,
    String professionalWebsite,
    byte[] profilePicture,
    String profilePictureName,
    String profilePictureType,
    byte[] resume,
    String resumeName,
    String resumeType,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
```

Notice:
- `id` and `userId` are optional from the client side (the server assigns them)
- `jobTitle`, `location`, `experienceLevel`, `professionalBiography` use `@NotBlank` — they're mandatory
- `professionalBiography` has no `@Size` limit — we don't want to restrict how much someone can write about their career
- Profile picture fields have **no validations** — they're optional
- Field names must match exactly what the client application expects

⚠️ **Common Mistake:** Using different field names in your DTO than what the React frontend expects. This silently breaks the data binding and you'll get `null` values everywhere.

---

## Real-World Note: Don't Store Files in Databases

In our demo application, we're storing files (resume, profile picture) directly in the database as BLOBs. This works for learning, but in **real enterprise applications**, this is an anti-pattern.

Why? Databases are optimized for **structured, queryable data** — not large binary files. Storing files bloats your database, slows backups, and hurts performance.

**What do real companies do?** They use **cloud object storage** like:
- Amazon S3
- Google Cloud Storage
- Azure Blob Storage

The database stores only the **file URL/path**, and the actual file lives in the cloud. This is cheaper, faster, and infinitely more scalable.

💡 **Pro Tip:** For your portfolio projects, the BLOB approach is fine. For production applications, always use cloud storage.

---

## ✅ Key Takeaways

1. **Separate concerns** — Auth data in `users`, professional data in `profiles`
2. **Use `TEXT`** for large text columns (biography, descriptions)
3. **Use `MEDIUMBLOB`** for file storage — and always store the file name and content type alongside
4. **`@Lob`** annotation tells JPA the field holds large data
5. **`byte[]`** is the Java type for binary blob columns
6. **`@OneToOne` with `@JoinColumn`** on the owning side, `mappedBy` on the inverse side
7. **In production**, use cloud storage (S3) instead of database BLOBs for files
8. **DTO field names** must match the frontend expectations exactly
