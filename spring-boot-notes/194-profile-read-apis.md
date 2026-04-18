# Building Read APIs to Display User Profile Details

## Introduction

We've built the API to **save** profile data. Now we need APIs to **read** it back. But here's the twist — we don't build just one GET API. We build **four** separate ones, each serving a different purpose. Why? Because not every client needs all the data at the same time, and sending binary data (images, PDFs) when only text is needed wastes bandwidth and hurts performance.

This lecture teaches you how to design read APIs that serve **text data** and **binary data** separately, and how to properly send files as HTTP responses with the right headers.

---

## The Four Profile Read APIs

| # | Purpose | Returns | Binary Data? |
|---|---------|---------|--------------|
| 1 | Get Profile Info | Text fields (job title, location, etc.) | ❌ No |
| 2 | Get Profile Picture | Image bytes | ✅ Yes |
| 3 | Get Resume | PDF bytes | ✅ Yes |
| 4 | Save/Update Profile | Updated text fields | ❌ No |

### Why Separate APIs for Text and Binary?

Imagine the My Profile page loading. The browser needs job title, location, experience level — all tiny text strings. But the profile picture? That could be 500 KB. The resume? Maybe 2 MB.

If you bundle everything into one API, the page waits for **all 2.5 MB** to arrive before it can display even the job title. By splitting them, the text loads instantly while the image loads in the background.

> It's like a restaurant menu: you want the text descriptions immediately. The food photos can load after.

💡 **Pro Tip:** This pattern of separating lightweight text APIs from heavyweight binary APIs is standard in production applications. APIs like GitHub, LinkedIn, and Slack all do this.

---

## API 1: Get Profile — Text Data Only

### Controller

```java
@GetMapping("/api/v1/profile/jobseeker")
public ResponseEntity<ProfileDto> getProfile(Authentication authentication) {
    String email = authentication.getName();
    ProfileDto profileDto = userService.getProfile(email);
    return ResponseEntity.ok(profileDto);
}
```

No input from the client — the logged-in user's identity comes from the JWT token via the `Authentication` object.

### Service Layer

```java
public ProfileDto getProfile(String email) {
    JobPortalUser user = userRepository.findByEmail(email);
    Profile profile = user.getProfile();

    if (profile == null) {
        return null;  // User hasn't saved profile yet
    }

    return mapToProfileDto(profile, false);  // false = no binary data
}
```

Key points:
- `user.getProfile()` works because of the `@OneToOne(mappedBy = "user")` mapping on `JobPortalUser`
- Passing `false` to `mapToProfileDto` ensures **no binary data** is included — profile picture and resume fields will be `null` in the response
- If no profile exists, return `null` — the frontend shows the "complete your profile" banner

---

## API 2: Get Profile Picture — Image Bytes

This is where things get interesting. We're not returning JSON anymore — we're returning **raw image bytes**.

### Controller

```java
@GetMapping("/api/v1/profile/picture/jobseeker")
public ResponseEntity<byte[]> getProfilePicture(Authentication authentication) {
    String email = authentication.getName();
    ProfileDto profileDto = userService.getProfilePicture(email);

    byte[] picture = profileDto.profilePicture();

    if (picture == null || picture.length == 0) {
        return ResponseEntity.notFound().build();
    }

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.parseMediaType(profileDto.profilePictureType()));
    headers.setContentLength(picture.length);

    return new ResponseEntity<>(picture, headers, HttpStatus.OK);
}
```

### The Response Headers — Why They Matter

By default, clients (browsers, mobile apps) expect JSON responses. When you send raw bytes without proper headers, the client doesn't know what to do with them. It might try to parse binary data as JSON — and show garbage.

#### `Content-Type` Header

```java
headers.setContentType(MediaType.parseMediaType(profileDto.profilePictureType()));
```

This tells the client: "The data I'm sending is an image/jpeg" (or image/png, etc.). The browser then knows to **render it as an image** instead of trying to parse it as text.

`MediaType.parseMediaType()` converts a string like `"image/jpeg"` into Spring's `MediaType` object.

#### `Content-Length` Header

```java
headers.setContentLength(picture.length);
```

This tells the client **how many bytes to expect**. It lets browsers show progress bars and know when the download is complete.

### Service Layer

```java
public ProfileDto getProfilePicture(String email) {
    JobPortalUser user = userRepository.findByEmail(email);
    Profile profile = user.getProfile();

    if (profile != null) {
        return mapToProfileDto(profile, true);  // true = include binary data
    }
    return null;
}
```

This time, `true` is passed — we **do** want the binary data because the whole point of this API is to serve the image.

---

## API 3: Get Resume — File Download

### Controller

```java
@GetMapping("/api/v1/profile/resume/jobseeker")
public ResponseEntity<byte[]> getResume(Authentication authentication) {
    String email = authentication.getName();
    ProfileDto profileDto = userService.getResume(email);

    byte[] resume = profileDto.resume();

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.parseMediaType(profileDto.resumeType()));
    headers.setContentLength(resume.length);
    headers.setContentDispositionFormData("attachment", profileDto.resumeName());

    return new ResponseEntity<>(resume, headers, HttpStatus.OK);
}
```

### The `Content-Disposition` Header — Controlling Browser Behavior

This is a new header you haven't seen before:

```java
headers.setContentDispositionFormData("attachment", profileDto.resumeName());
```

What does this do? It tells the browser: **"Download this as a file attachment, and name it `john_resume.pdf`."**

Without this header, some browsers might try to display the raw binary data in the browser window — showing garbled text. With this header, the browser knows to trigger a **file download dialog**.

The two key pieces:
- `"attachment"` — instructs the browser to download, not display
- `profileDto.resumeName()` — the filename for the downloaded file

⚠️ **Common Mistake:** Forgetting the `Content-Disposition` header for file downloads. The browser shows binary gibberish instead of downloading the file.

---

## Why This API Design Pattern Works

### Separation of Concerns

Each API has **one job**:
- Text API → fast, lightweight, for page rendering
- Picture API → binary data, for image display
- Resume API → binary data, for file download

### Performance

A text-only profile response might be 500 bytes. The same response with picture + resume could be **3 MB**. By separating them, the page loads in **milliseconds** instead of seconds.

### Reusability

The profile picture API isn't just for the "My Profile" page. Later, when an **employer** views the list of job applicants, they need to see each candidate's profile picture. The same API serves both use cases.

---

## ✅ Key Takeaways

1. **Separate text and binary data** into different APIs for performance
2. **`Content-Type` header** tells the client what format the response is in (image/jpeg, application/pdf, etc.)
3. **`Content-Length` header** tells the client how many bytes to expect
4. **`Content-Disposition` header** controls how the browser handles file responses — use `"attachment"` for downloads
5. **`MediaType.parseMediaType()`** converts a string MIME type into Spring's `MediaType` object
6. **The boolean flag** in `mapToProfileDto` controls whether binary data is included — `false` for text APIs, `true` for binary APIs
7. **Return `null`** when no profile exists — the frontend handles the "complete profile" messaging
8. Profile picture APIs are **reusable** — used by both job seekers and employers
