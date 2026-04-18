# End-to-End Demo of Profile Management APIs

## Introduction

We've built the profile APIs — save, get text, get picture, get resume. Now it's time to see them work **end to end**, both through the React UI and through Postman. This lecture is all about **testing, verifying, and understanding** the complete flow. It also surfaces real-world best practices about file storage.

---

## Testing via the UI Application

### Step 1: Fill Basic Info

After logging in as a job seeker (e.g., `john@gmail.com`), navigate to **My Profile → Basic Info** and fill out:

- **Job Title:** Java Consultant
- **Location:** Hyderabad, India
- **Experience Level:** Lead Level
- **Professional Biography:** "Have more than 15 years of experience in Java..."
- **Professional Website:** (optional) e.g., your personal site

After filling text fields, the profile completeness shows **70%**.

### Step 2: Upload Files

Go to the **Files** tab:
- Upload a resume (PDF file)
- Upload a profile picture (JPEG/PNG)

After uploading both, completeness reaches **100%**.

### Step 3: Save and Verify

Click **Update Profile** → success message: "Profile updated successfully."

**Verify in the database:** Open the `profiles` table. You'll see:
- `user_id` pointing to the correct user (e.g., user ID 3 → John Doe)
- All text fields populated
- `profile_picture` column shows BLOB data with a size (e.g., 86 KB)
- `resume` column shows BLOB data with its size

### Step 4: Test Persistence

Log out and log back in. Navigate to My Profile — all data should be displayed:
- Text fields → verified the **Get Profile** (text) API works
- Profile picture displayed → verified the **Get Profile Picture** API works
- Click "View Resume" → resume opens in a new tab → verified the **Get Resume** API works

---

## Testing via Postman

### Step 1: Create a New User

Sign up a new user (e.g., Will Smith, `smith@gmail.com`).

### Step 2: Get JWT Token

Log in via the Login API → copy the JWT token.

### Step 3: Test Save Profile API

**Method:** `PUT`
**Path:** `/api/v1/profile/jobseeker`
**Headers:** Bearer token, CSRF token
**Body Type:** `form-data`

Configure three keys:

| Key | Type | Value |
|-----|------|-------|
| `profile` | Text | `{"jobTitle":"Software Engineer", "location":"New York", ...}` |
| `profilePicture` | File | Select an image from local system |
| `resume` | File | Select a PDF from local system |

⚠️ **Common Mistake:** Forgetting to select **File** as the type for `profilePicture` and `resume`. If you leave it as "Text," the upload won't work.

Click **Send** → 200 response confirms success.

### Step 4: Test Get Profile API

**Method:** `GET`
**Path:** `/api/v1/profile/jobseeker`
**Auth:** JWT token

Response contains all text fields. `profilePicture` and `resume` fields are `null` — by design (the text API doesn't include binary data).

### Step 5: Test Get Profile Picture API

**Method:** `GET`
**Path:** `/api/v1/profile/picture/jobseeker`

Response displays the image in the **Preview** tab. Switch to **Hex** to see raw bytes. Check response headers — `Content-Type` and `Content-Length` are present.

### Step 6: Test Get Resume API

**Method:** `GET`
**Path:** `/api/v1/profile/resume/jobseeker`

Response returns the resume file. Response headers include `Content-Type`, `Content-Length`, and `Content-Disposition`.

---

## Verifying on the UI for Postman-Created Users

After saving the profile via Postman for Will Smith, navigate to the UI application:
1. Log in as Will Smith
2. Go to My Profile → all data saved via Postman is displayed correctly
3. Profile completeness shows 100% → the user can now apply for jobs

---

## The Complete Flow Visualization

```
User fills form → React sends multipart request → Spring receives parts
                                                  ↓
                                    profileJson → ObjectMapper → ProfileDto
                                    profilePicture → MultipartFile → bytes
                                    resume → MultipartFile → bytes
                                                  ↓
                                    Map to Profile entity → Save to DB
                                                  ↓
                              User revisits page → GET /profile → text fields
                                                → GET /profile/picture → image bytes
                                                → GET /profile/resume → PDF bytes
```

---

## Real-World Best Practice: File Storage

### What We're Doing (Demo)

Storing files directly in the database as BLOBs. This works for small-scale applications and learning.

### What Real Enterprise Apps Do

They use **cloud object storage**:
- **Amazon S3** — most popular
- **Google Cloud Storage**
- **Azure Blob Storage**

The database stores only the **file URL/reference**, not the actual bytes. This approach is:
- **Cheaper** — storage costs are lower
- **Faster** — CDNs serve files closer to users
- **Scalable** — handles millions of files effortlessly
- **Lighter on the database** — keeps tables lean

💡 **Pro Tip:** When you join an enterprise project and see file-related requirements, immediately think cloud storage, not database BLOBs.

---

## After Profile Completion — What's Next?

With a completed profile (100% score), the job seeker can now:

1. **Apply for jobs** — visible "Apply Now" button on job detail pages
2. **Save jobs** — bookmark jobs for later review

These features require new database tables and JPA relationships — which we'll tackle in the next lectures.

---

## ✅ Key Takeaways

1. **Always test end-to-end** — UI + Postman + database verification
2. **Postman multipart requests** require form-data body type with correct key types (Text vs File)
3. **GET Profile** returns text only; **GET Picture/Resume** returns binary data — by design
4. **Response headers** (`Content-Type`, `Content-Length`, `Content-Disposition`) are critical for file APIs
5. **Database verification** — always check the actual table to confirm data integrity
6. **Don't store files in databases** in production — use cloud storage (S3, GCS, Azure Blob)
7. **Profile completeness** must be 100% before a job seeker can apply — a common real-world pattern
