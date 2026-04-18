# Creating REST APIs for User Profile — Resume & Image Upload

## Introduction

Building REST APIs that accept **JSON data** is straightforward — you've done it many times. But what happens when a single API needs to accept **JSON data AND files** (like a PDF resume and a JPEG profile picture) in the same request? That's a whole different ball game.

This lecture introduces **multipart form data**, the `@RequestPart` annotation, manual JSON deserialization with Jackson, and how to handle binary file uploads in Spring Boot. These are patterns you'll use in every real-world application that deals with file uploads.

---

## The Challenge: Mixed Data Types in One Request

The My Profile page sends three different types of data in a single save request:

1. **Text/JSON data** — job title, location, experience, biography (structured data)
2. **Profile picture** — a binary image file (JPEG/PNG)
3. **Resume** — a binary document file (PDF)

You can't use `@RequestBody` here. Why? Because `@RequestBody` expects the **entire request body** to be in a single format (usually JSON). But we're sending a **mix** of JSON and binary data.

> Think of it like mailing a package: normally you send either a letter (JSON) or a parcel (binary). But now you need to send **both in the same envelope**. That's multipart.

---

## The `consumes = MediaType.MULTIPART_FORM_DATA_VALUE` Configuration

### The Controller Method Signature

```java
@PutMapping(path = "/api/v1/profile/jobseeker",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<ProfileDto> createOrUpdateProfile(
    @RequestPart("profile") String profileJson,
    @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture,
    @RequestPart(value = "resume", required = false) MultipartFile resume,
    Authentication authentication
) { ... }
```

### Breaking Down Every Piece

#### `consumes = MediaType.MULTIPART_FORM_DATA_VALUE`

This tells Spring (and the client): "This API accepts **multipart form data** — meaning mixed types of data in one request." Without this, Spring would expect pure JSON and reject any file uploads.

#### `@RequestPart` Instead of `@RequestBody`

Since we're receiving multiple **parts** in one request, we use `@RequestPart` to extract each part by name:

| Part Name | Type | Description |
|-----------|------|-------------|
| `"profile"` | `String` | The JSON text containing job title, location, etc. |
| `"profilePicture"` | `MultipartFile` | The image file (optional) |
| `"resume"` | `MultipartFile` | The PDF file (optional) |

#### `required = false` for Files

The profile picture and resume are **optional**. Why? Because the user might save basic info first (from the Basic Info tab) without uploading files. Only when they visit the Files tab do they upload documents. Setting `required = false` lets the API accept requests with or without files.

#### `MultipartFile` — Spring's File Wrapper

`MultipartFile` is Spring's representation of an uploaded file. It provides:

- `getBytes()` — the raw binary content
- `getOriginalFilename()` — the file name (e.g., "resume.pdf")
- `getContentType()` — the MIME type (e.g., "application/pdf")
- `isEmpty()` — check if a file was actually sent

---

## Manual JSON Deserialization with Jackson

### The Problem

Normally, Spring automatically converts JSON → Java object using `@RequestBody` + Jackson. But since we can't use `@RequestBody` (multipart request), we receive the profile data as a **raw JSON string**. We need to convert it ourselves.

### The Solution — `ObjectMapper`

```java
ObjectMapper objectMapper = new ObjectMapper();
ProfileDto profileDto = objectMapper.readValue(profileJson, ProfileDto.class);
```

First, add the Jackson dependency (if not already present):

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```

The `readValue()` method takes two arguments:
1. The JSON string
2. The target class to deserialize into

After this line executes, you have a fully populated `ProfileDto` object — just as if Spring had done it automatically.

💡 **Pro Tip:** This manual deserialization pattern is useful beyond file uploads. Anytime you receive JSON as a raw string (from a message queue, a file, etc.), `ObjectMapper` is your go-to tool.

---

## The Service Layer — `createOrUpdateProfile()`

### The Flow

```
Controller → Service → Repository → Database
```

### Step 1: Fetch the Current User

```java
JobPortalUser user = userRepository.findByEmail(email);
```

### Step 2: Check for Existing Profile

```java
Profile profile = user.getProfile();
if (profile == null) {
    profile = new Profile();
    profile.setUser(user);
}
```

If the user has never saved profile data, `getProfile()` returns `null`. We create a new `Profile` object and link it to the user. If a profile already exists, we simply update it. This is the **create-or-update** pattern — one method handles both cases.

### Step 3: Convert JSON to DTO

```java
ObjectMapper objectMapper = new ObjectMapper();
ProfileDto profileDto = objectMapper.readValue(profileJson, ProfileDto.class);
```

### Step 4: Map DTO + Files → Entity

```java
private Profile mapToProfile(Profile profile, ProfileDto dto,
                              MultipartFile profilePicture, MultipartFile resume) {
    profile.setJobTitle(dto.jobTitle());
    profile.setLocation(dto.location());
    profile.setExperienceLevel(dto.experienceLevel());
    profile.setProfessionalBiography(dto.professionalBiography());
    profile.setProfessionalWebsite(dto.professionalWebsite());

    // Handle profile picture
    if (profilePicture != null && !profilePicture.isEmpty()) {
        profile.setProfilePicture(profilePicture.getBytes());
        profile.setProfilePictureName(profilePicture.getOriginalFilename());
        profile.setProfilePictureType(profilePicture.getContentType());
    }

    // Handle resume
    if (resume != null && !resume.isEmpty()) {
        profile.setResume(resume.getBytes());
        profile.setResumeName(resume.getOriginalFilename());
        profile.setResumeType(resume.getContentType());
    }

    return profile;
}
```

Notice the null/empty checks for files — since they're optional, we only update file fields when files are actually provided.

⚠️ **Common Mistake:** Forgetting the `isEmpty()` check. Even when `required = false`, the `MultipartFile` object might not be `null` but could be empty.

### Step 5: Save and Return DTO

```java
profileRepository.save(profile);
return mapToProfileDto(profile, false);
```

---

## The Boolean Flag — Controlling Binary Data in Responses

### Why a Boolean?

```java
private ProfileDto mapToProfileDto(Profile profile, boolean includeBinaryData) {
    if (includeBinaryData) {
        // Include profilePicture bytes and resume bytes
        return new ProfileDto(..., profile.getProfilePicture(), ..., profile.getResume(), ...);
    } else {
        // Pass null for binary fields
        return new ProfileDto(..., null, ..., null, ...);
    }
}
```

Why would we ever NOT want to send the binary data? **Performance.** Profile pictures and resumes can be hundreds of KB. If you're just displaying text info (job title, location), sending all that binary data over the network is wasteful.

The boolean flag lets us **control when binary data travels over the wire**:
- Saving profile → `false` (no need to echo back the file bytes)
- Displaying profile picture → `true` (the client needs the actual image)

---

## Security Configuration

Since profile APIs are job-seeker-only operations, we lock them down:

```java
@Bean
public String[] jobSeekerPaths() {
    return new String[] {
        "/api/v1/profile/jobseeker",
        // ... other job seeker paths
    };
}
```

In `SecurityConfig`, these paths are restricted to users with the `JOB_SEEKER` role.

---

## ✅ Key Takeaways

1. **`MULTIPART_FORM_DATA_VALUE`** is required when an API accepts mixed data types (JSON + files)
2. **`@RequestPart`** extracts individual parts from a multipart request — use it instead of `@RequestBody`
3. **`MultipartFile`** is Spring's wrapper for uploaded files — provides bytes, name, and content type
4. **Manual JSON deserialization** with `ObjectMapper.readValue()` is needed when you can't use `@RequestBody`
5. **`required = false`** on `@RequestPart` makes file uploads optional
6. **Always check `isEmpty()`** before processing file data
7. **Use a boolean flag** to control whether binary data is included in DTO responses — it's a performance optimization
8. **`@Transactional`** is needed on service methods that create or update data
9. **Handle `IOException`** when working with `MultipartFile.getBytes()` — wrap in `RuntimeException` if needed
