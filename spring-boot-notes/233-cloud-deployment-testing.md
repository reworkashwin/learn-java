# Validating Cloud Deployment — End-to-End Testing

## Introduction

Your app is deployed to AWS. But does it actually work? Can users register, log in, and interact with the data stored in the cloud database? This lesson walks through **end-to-end validation** of the deployed application using Postman.

---

## Confirming Successful Deployment

### ⚙️ Check Beanstalk Events

After deployment, the Beanstalk console shows events like:
- ✅ Security group created
- ✅ Auto-scaling group created
- ✅ EC2 instance created
- ✅ CloudWatch alarms created
- ✅ Load balancer created
- ✅ Application deployed

When you see **"Environment successfully launched"**, your app is live.

> You might see a "health severe" warning — this is because we haven't configured a health endpoint. It's safe to ignore for now.

---

## Accessing Your Application

### 🧠 The Domain Name

Beanstalk provides a domain name like:
```
eazy-jobportal.ap-south-1.elasticbeanstalk.com
```

Visiting this URL directly gives a `403` error (no public root endpoint), but adding an API path works:

```
http://eazy-jobportal.ap-south-1.elasticbeanstalk.com/api/companies/public
```

If you get a **successful response with company data**, this confirms:
1. ✅ The application is deployed and running
2. ✅ The prod profile is active
3. ✅ The app is connected to the AWS RDS database
4. ✅ Data was correctly loaded from SQL scripts

---

## Updating Postman for Cloud Testing

### ⚙️ Change the Base URL

In Postman, update the pre-request script variables:

```javascript
// Before (local)
pm.variables.set("protocol", "http");
pm.variables.set("host", "localhost");
pm.variables.set("port", "8080");

// After (cloud)
pm.variables.set("protocol", "http");
pm.variables.set("host", "eazy-jobportal.ap-south-1.elasticbeanstalk.com");
// Remove port — Beanstalk handles routing
```

> Remove the port variable and any trailing `/` that might cause double-slash issues.

---

## Testing the Full User Flow

### 1. Public API — Get All Companies

**Request:** `GET /api/companies/public`
**Result:** ✅ Returns all companies from the cloud database.

### 2. Register a New User

**Request:** `POST /api/users/register`

```json
{
    "email": "john@gmail.com",
    "mobile": "1234567890",
    "name": "John Doe",
    "password": "password123"
}
```

**Headers:** Include CSRF token
**Result:** ✅ User registered (stored in AWS RDS)

### 3. Login

**Request:** `POST /api/users/login`

```json
{
    "email": "john@gmail.com",
    "password": "password123"
}
```

**Result:** ✅ Returns a JWT token. The user gets the default `JobSeeker` role.

### 4. Test Protected Endpoints

**Request:** `GET /api/jobseeker/saved-jobs`
**Headers:** Bearer token (JWT from login)
**Result:** ✅ Returns empty array (no saved jobs yet)

### 5. Save a Job

**Request:** `POST /api/jobseeker/save-job`
**Headers:** JWT token + CSRF token
**Result:** ✅ Job saved successfully

### 6. Verify Saved Job

**Request:** `GET /api/jobseeker/saved-jobs`
**Result:** ✅ Returns the saved job details

---

## What This Proves

| Test | Validates |
|------|-----------|
| Get companies | Database connection works |
| Register user | Write operations work |
| Login | Spring Security + JWT work |
| Save/Get jobs | Full CRUD + authorization works |
| All responses correct | Prod profile configuration is correct |

> Everything works exactly the same in the cloud as it did locally — that's the beauty of Spring Boot's profile system.

---

## ✅ Key Takeaways

- Always validate your cloud deployment with end-to-end tests
- Test both public and secured endpoints to verify the full stack
- Update Postman's base URL to point to the Beanstalk domain
- A successful response confirms: deployment + database + security + profiles all work
- The application behaves identically in local and cloud environments thanks to profiles

## ⚠️ Common Mistakes

- Forgetting to update Postman's base URL — requests still go to localhost
- Double slashes in URLs — check for trailing `/` in the host variable
- Expired CSRF tokens — get a fresh one before write operations
- Testing with non-existent users — register first, then login

## 💡 Pro Tips

- Test the most critical paths first: database read → write → authentication → authorization
- Save your cloud Postman configuration separately so you can switch between local and cloud easily
- **Delete cloud resources after testing** to avoid surprise charges (covered in the next lesson)
