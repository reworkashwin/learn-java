# Live Demo — Employer Management Admin APIs

## Introduction

We've built the employer management APIs. Now let's validate them end-to-end — registering a new user, searching for them, elevating their role, and assigning them to a company. We'll test through both the UI application and Postman.

---

## Testing via the UI Application

### Step 1: Register a New User

1. Go to the **Sign Up** page
2. Register with:
   - Name: "Testing User"
   - Email: testing@gmail.com
   - Mobile: (any valid number)
   - Password: (any valid password)
3. Click **Create Account**

By default, this new user gets **ROLE_JOB_SEEKER** (role ID = 1).

**Verify in database:**
```sql
SELECT * FROM users WHERE email = 'testing@gmail.com';
-- role_id = 1 (ROLE_JOB_SEEKER)
-- company_id = NULL
```

### Step 2: Search the User (Admin)

1. Log in as an **admin**
2. Navigate to **Employer Management**
3. Enter `testing@gmail.com` in the search field
4. Click **Search User**
5. User details are displayed, showing current role as `ROLE_JOB_SEEKER`

### Step 3: Elevate to Employer

1. Click **Elevate to Employer**
2. The role updates to `ROLE_EMPLOYER`

**Verify in database:**
```sql
SELECT * FROM users WHERE email = 'testing@gmail.com';
-- role_id = 2 (ROLE_EMPLOYER) ✅
```

### Step 4: Assign a Company

1. Select a company from the dropdown (e.g., **Netflix**)
2. Click **Assign**

**Verify in database:**
```sql
SELECT * FROM users WHERE email = 'testing@gmail.com';
-- role_id = 2 (ROLE_EMPLOYER)
-- company_id = 7 (Netflix) ✅
```

---

## Testing via Postman

### Step 1: Register a New User

```
POST /register
Headers: X-XSRF-TOKEN: <token>
Body: {
    "name": "Testing User",
    "email": "testing@gmail.com",
    "mobileNumber": "1234567890",
    "pwd": "password123"
}
Response: 201 Created
```

### Step 2: Authenticate as Admin

```
POST /apiLogin
Headers: X-XSRF-TOKEN: <token>
Body: { "username": "admin@gmail.com", "pwd": "admin123" }
Response: JWT token
```

### Step 3: Search User by Email

```
GET /users/search/admin/v1.0?email=testing@gmail.com
Headers: Authorization: Bearer <admin-JWT>
Response: {
    "id": 12,
    "name": "Testing User",
    "email": "testing@gmail.com",
    "role": "ROLE_JOB_SEEKER"
}
```

Note the user ID (e.g., **12**) — we'll need it for the next steps.

### Step 4: Elevate to Employer

```
PATCH /users/elevate/admin/v1.0/12
Headers: Authorization: Bearer <admin-JWT>, X-XSRF-TOKEN: <token>
Body: (empty)
Response: {
    "id": 12,
    "role": "ROLE_EMPLOYER"   ✅
}
```

### Step 5: Assign Company to Employer

```
PATCH /users/assign-company/admin/v1.0/12/7
Headers: Authorization: Bearer <admin-JWT>, X-XSRF-TOKEN: <token>
Body: (empty)
Response: {
    "id": 12,
    "role": "ROLE_EMPLOYER",
    "companyId": 7              ✅
}
```

**Verify in database:** User now has `role_id = 2` and `company_id = 7`.

---

## What Happens After Assignment?

Once a user is elevated to employer and assigned a company:

- They can log in and see the **Employer menu** (different from job seeker menu)
- They can **post new jobs** for their assigned company
- They can **view existing job postings** for their company
- Job posting functionality will be built in upcoming sections

---

## Complete Admin Feature Summary

With both Company Management and Employer Management complete, the admin can now:

| Feature | Operations |
|---------|-----------|
| **Contact Messages** | View, sort, paginate, close messages |
| **Company Management** | Create, view, edit, delete companies |
| **Employer Management** | Search users, elevate to employer, assign company |

---

## ✅ Key Takeaways

- The full employer onboarding flow: Register → Search → Elevate → Assign Company
- Test through both UI and Postman to validate all layers
- Database verification confirms the changes persist correctly
- Hibernate managed entities auto-flush changes without explicit `save()` calls
- Admin features are secured via Spring Security — only admin role can access these endpoints
- Employer and job posting features will be developed in upcoming sections

## 💡 Pro Tips

- Always verify database state after each operation during development — don't just trust the API response
- When testing with Postman, use the PATCH HTTP method (not PUT or POST) for partial updates
- If your code doesn't match the expected behavior, compare field names and API paths carefully with the reference implementation
