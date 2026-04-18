# Live Demo — Company Management Admin APIs in Action

## Introduction

We've built four REST APIs for company management. Now let's see them in action — both through the UI application and Postman. This lesson validates that everything works end-to-end: create, read, update, and delete operations.

---

## Testing via the UI Application

### Viewing All Companies

1. Log in as an admin
2. Navigate to **Company Management** from the menu
3. All existing companies are displayed with their details

The GET API `/api/company/admin/v1.0` is invoked during page load, fetching all company records from the database.

### Editing a Company

1. Click **Edit** next to a company (e.g., Google)
2. Update fields — for example:
   - Rating: 4.4 → **4.5**
   - Employees: 156,000 → **156,001**
3. Click **Update**
4. Changes reflect immediately in the list

The PUT API sends all company fields to the backend, and the `@NamedQuery` updates the record in a single SQL statement.

### Adding a New Company

1. Click **Add New Company**
2. Fill in the required fields:
   - Name: "eazybytes"
   - Industry: "Education"
   - Size: "Small"
   - Rating: 4.7
   - Founded: 2021
   - Employees: 5
   - Logo: (copy an existing logo path from `jobportal-data.sql`)
   - Location: "Hyderabad"
   - Website: "https://eazybytes.com"
   - Description: "Ed Tech company helping students upskill around Java frameworks"
3. Click **Save** — the new company appears in the list

> **Note:** The new company won't appear on the homepage because it has no active jobs yet. Only companies with associated jobs are shown to job seekers.

### Deleting a Company

1. Click **Delete** next to a company
2. Confirm the deletion
3. The company disappears from the list

---

## Testing via Postman

### Step 1: Get CSRF Token and Authenticate

1. Fetch a CSRF token from the CSRF endpoint
2. Log in as admin — provide XSRF token in headers, admin credentials in the body
3. Receive a JWT token for subsequent requests

### Step 2: Create Company (POST)

```
POST /api/company/admin/v1.0
Headers: Authorization: Bearer <JWT>, X-XSRF-TOKEN: <token>
Body: {
    "name": "TestCompany",
    "logo": "/path/to/logo.png",
    "industry": "Technology",
    "size": "Medium",
    "rating": 4.2,
    "locations": "New York",
    "founded": 2020,
    "description": "A test company",
    "employees": 50,
    "website": "https://testcompany.com"
}
Response: 201 Created
```

### Step 3: Get All Companies (GET)

```
GET /api/company/admin/v1.0
Headers: Authorization: Bearer <JWT>
Response: 200 OK — Array of all company objects
```

Scroll to the end of the response to verify the newly created company is present.

### Step 4: Update Company (PUT)

```
PUT /api/company/admin/v1.0/35
Headers: Authorization: Bearer <JWT>, X-XSRF-TOKEN: <token>
Body: {
    "size": "Small",
    "employees": 5,
    "website": "https://eazybytes.com"
}
Response: 200 OK
```

Fetch all companies again to verify the updated values.

### Step 5: Delete Company (DELETE)

```
DELETE /api/company/admin/v1.0/35
Headers: Authorization: Bearer <JWT>, X-XSRF-TOKEN: <token>
Response: 200 OK — "Company record deleted successfully"
```

Fetch all companies again — the deleted company is no longer in the list.

---

## ✅ Key Takeaways

- All four CRUD operations work end-to-end: UI sends requests → Controller → Service → Repository → Database
- Client-side validations prevent invalid data from reaching the backend
- JWT authentication and CSRF protection are required for all admin API calls
- Always test APIs through both the UI and Postman to catch issues in different layers
- Newly created companies without active jobs won't appear on the public homepage — by design

## 💡 Pro Tips

- When testing with Postman, always include both the JWT token (Authorization header) and the CSRF token (X-XSRF-TOKEN header)
- Compare your code with the reference implementation on GitHub if you encounter issues
- Keep field names consistent between your DTO, Entity, and frontend — mismatches cause silent failures
