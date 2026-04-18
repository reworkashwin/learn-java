# Hands-On — Dressing Your Data in DTOs

## Introduction

We've learned *what* DTOs are and *why* we need them. Now let's actually implement the DTO pattern in our Spring Boot application. We'll create a `CompanyDto`, write mapper logic, and update our service and controller layers to use DTOs instead of raw Entity objects.

---

## Step 1: Create the DTO Class (Using Java Records)

Create a new package `com.easybytes.jobportal.dto` and add:

```java
public record CompanyDto(
    Long id,
    String name,
    String logo,
    String industry,
    String size,
    BigDecimal rating,
    String locations,
    Integer founded,
    String description,
    Integer employees,
    String website,
    Instant createdAt
) {}
```

### Why a `record` instead of a regular class?

Java records are perfect for DTOs because:
- All fields are **automatically `final`** (immutable — exactly what we want for data transfer)
- **Only getter methods** are generated (no setters — data shouldn't change after creation)
- A **constructor** with all fields is generated automatically
- `equals()`, `hashCode()`, and `toString()` are generated too

No need for Lombok here — records give us everything we need natively.

### Which fields to include?

Compare the Entity fields with what the client actually needs:

| Entity Field | Include in DTO? | Reason |
|---|---|---|
| `id` | ✅ Yes | Client needs it for identification |
| `name` | ✅ Yes | Displayed in UI |
| `logo` | ✅ Yes | Displayed in UI |
| `industry` | ✅ Yes | Displayed in UI |
| `size` | ✅ Yes | Displayed in UI |
| `rating` | ✅ Yes | Displayed in UI |
| `locations` | ✅ Yes | Displayed in UI |
| `founded` | ✅ Yes | Displayed in UI |
| `description` | ✅ Yes | Displayed in UI |
| `employees` | ✅ Yes | Displayed in UI |
| `website` | ✅ Yes | Displayed in UI |
| `createdAt` | ✅ Yes | Sorting in UI |
| `createdBy` | ❌ No | Audit metadata — not needed in UI |
| `updatedAt` | ❌ No | Audit metadata — not needed in UI |
| `updatedBy` | ❌ No | Audit metadata — not needed in UI |

Three fields excluded — the client will never see internal audit data.

### Important: Keep field names consistent!

Use the **exact same field names** in the DTO as in the Entity. The UI application expects specific JSON keys. Changing names means breaking the frontend.

---

## Step 2: Write the Mapper Logic

Add a private method in the Service implementation to transform Entity → DTO:

```java
private CompanyDto transformToDTO(Company company) {
    return new CompanyDto(
        company.getId(),
        company.getName(),
        company.getLogo(),
        company.getIndustry(),
        company.getSize(),
        company.getRating(),
        company.getLocations(),
        company.getFounded(),
        company.getDescription(),
        company.getEmployees(),
        company.getWebsite(),
        company.getCreatedAt()
    );
}
```

### Why put the mapper in the Service layer?

The Service layer is the bridge between Controller and Repository. It's the natural place for:
- Loading data from the database (via Repository)
- Transforming data (Entity → DTO)
- Applying business logic
- Returning DTOs to the Controller

### Can you add transformations here?

Absolutely! If you needed to transform any data, this is where you'd do it:

```java
// Example: Transforming gender code to readable text
dto.setGender(company.getGender().equals("M") ? "Male" : "Female");
```

---

## Step 3: Update the Service Layer

### Update the Interface

```java
public interface ICompanyService {
    List<CompanyDto> getAllCompanies();  // Changed from List<Company>
}
```

### Update the Implementation

```java
@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements ICompanyService {

    private final CompanyRepository companyRepository;

    @Override
    public List<CompanyDto> getAllCompanies() {
        return companyRepository.findAll()
            .stream()
            .map(this::transformToDTO)
            .collect(Collectors.toList());
    }

    private CompanyDto transformToDTO(Company company) {
        return new CompanyDto(
            company.getId(),
            company.getName(),
            company.getLogo(),
            company.getIndustry(),
            company.getSize(),
            company.getRating(),
            company.getLocations(),
            company.getFounded(),
            company.getDescription(),
            company.getEmployees(),
            company.getWebsite(),
            company.getCreatedAt()
        );
    }
}
```

### Understanding the Stream Pipeline

```java
companyRepository.findAll()    // 1. Fetch all Company entities from DB
    .stream()                  // 2. Convert List to Stream
    .map(this::transformToDTO) // 3. Transform each Company → CompanyDto
    .collect(Collectors.toList()); // 4. Collect results back into a List
```

This is a clean, functional approach. For each `Company` entity, the `map()` step invokes `transformToDTO()` and produces a `CompanyDto`.

---

## Step 4: Update the Controller

```java
@GetMapping("/companies")
public ResponseEntity<List<CompanyDto>> getAllCompanies() {
    List<CompanyDto> companyList = companyService.getAllCompanies();
    return ResponseEntity.ok(companyList);
}
```

The only change: `List<Company>` → `List<CompanyDto>`. The Controller now deals exclusively with DTOs — it has no knowledge of Entity classes or database structure.

---

## Step 5: Test It!

Hit the API from Postman:

```
GET http://localhost:8080/api/companies
```

### Before DTO (old response):
```json
{
    "id": 1,
    "name": "Google",
    "createdAt": "2024-01-15T...",
    "createdBy": "admin",        // 👈 Exposed!
    "updatedAt": "2024-01-16T...", // 👈 Exposed!
    "updatedBy": "admin"         // 👈 Exposed!
}
```

### After DTO (new response):
```json
{
    "id": 1,
    "name": "Google",
    "createdAt": "2024-01-15T..."
    // ✅ No createdBy, updatedAt, updatedBy!
}
```

The three audit fields are gone. The client sees only what it needs.

---

## What About Mapper Libraries?

There are open-source libraries that automate Entity-to-DTO mapping:

| Library | How It Works |
|---|---|
| **MapStruct** | Generates mapping code at compile time |
| **ModelMapper** | Uses reflection to map fields at runtime |

### Why we're NOT using them in this course:

1. **Not officially supported by Spring Boot** — you won't find them on start.spring.io. Enterprise projects may have security concerns.
2. **Less control** — with manual mapping, you have full control over what gets mapped and how transformations happen.

For learning purposes, manual mapping helps you understand exactly what's happening. In production, evaluate whether the convenience of these libraries outweighs the trade-offs for your project.

---

## The Complete Data Flow

```
Client (Postman/UI)
   ↑ JSON (DTO fields only)
Controller (works with CompanyDto)
   ↑ List<CompanyDto>
Service (transforms Entity → DTO)
   ↑ List<Company> (from DB)
Repository (calls findAll())
   ↑ SQL query
Database (COMPANIES table)
```

Each layer has a clear responsibility. Data is transformed at the Service layer boundary.

---

## ✅ Key Takeaways

1. **Java records** are ideal for DTOs — immutable, auto-generated getters, no setters.
2. The **mapper logic** lives in the Service layer — transforms Entity objects to DTO objects.
3. Use **Java Streams** (`stream().map().collect()`) for clean, functional Entity-to-DTO transformation.
4. **Controllers deal with DTOs only** — they never see Entity classes.
5. **Repositories deal with Entities only** — they never see DTOs.
6. Keep **field names consistent** between Entity and DTO to avoid breaking the frontend.
7. Manual mapping gives **full control** — you decide exactly what gets transferred and how.

---

## ⚠️ Common Mistakes

- **Forgetting to update the Controller return type** — if the Service returns `List<CompanyDto>` but the Controller expects `List<Company>`, you'll get compilation errors.
- **Updating the interface but not the implementation** (or vice versa) — both must match.
- **Changing DTO field names arbitrarily** — the frontend relies on specific JSON key names. Keep them consistent.
- **Putting mapper logic in the Controller** — it belongs in the Service layer, not the Controller.

---

## 💡 Pro Tips

- Java records were introduced in **Java 14** — they're the modern, idiomatic way to create DTOs in Java.
- You can have **multiple DTOs per Entity** — e.g., `CompanyListDto` (minimal fields for list views) and `CompanyDetailDto` (all fields for detail views).
- The DTO pattern is used **extensively** throughout enterprise applications. Master it now, and you'll see it everywhere in real projects.
- The `this::transformToDTO` syntax is a **method reference** — it's shorthand for `company -> this.transformToDTO(company)`.
