# Building Company Management Features for Admin Users

## Introduction

Time to shift gears from technical concepts to feature development! Our admin user currently only has access to contact messages. Now we'll build a complete **Company Management** module — allowing the admin to create, view, edit, and delete companies in the Job Portal application.

This is a practical assignment-style lesson. We'll walk through four REST APIs covering the full CRUD operations, reinforcing all the concepts we've learned about `@Transactional`, `@Modifying`, DTOs, validations, and security.

---

## Why Company Management Matters

In the Job Portal workflow:

1. **Admin creates a company** (after sales negotiations are complete)
2. **Employer gets assigned** to that company
3. **Employer posts jobs** against the company
4. **Job seekers apply** for those jobs

Without company management, employers can't post jobs. It's the foundation of the entire system.

---

## API 1: Create a New Company — POST

### Controller

```java
@PostMapping("/api/company/admin/v1.0")
public ResponseEntity<?> createCompany(@Valid @RequestBody CompanyDto companyDto) {
    boolean saved = companyService.createCompany(companyDto);
    if (saved) {
        return ResponseEntity.status(HttpStatus.CREATED).body("Company created successfully");
    }
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create company");
}
```

### Service

```java
@Transactional  // Override readOnly — this creates data
public boolean createCompany(CompanyDto companyDto) {
    Company company = new Company();
    BeanUtils.copyProperties(companyDto, company);  // Copy DTO → Entity
    Company saved = companyRepository.save(company);
    return saved.getId() > 0;
}
```

### DTO Validations

```java
public class CompanyDto {
    @NotBlank(message = "Company name is required")
    private String name;
    
    @NotBlank(message = "Logo is required")
    private String logo;
    
    @DecimalMin(value = "0.0") @DecimalMax(value = "5.0")
    private BigDecimal rating;
    
    @Min(value = 1900, message = "Founded year must be >= 1900")
    private int founded;
    
    @Min(value = 1, message = "Employees must be >= 1")
    private int employees;
    
    // ... other fields with @NotBlank
}
```

> 💡 Previously, we only sent company data FROM the backend. Now that we accept input, we must enforce validations using `@Valid` and Bean Validation annotations.

---

## API 2: Get All Companies — GET

### Controller

```java
@GetMapping("/api/company/admin/v1.0")
public ResponseEntity<List<CompanyDto>> getAllCompaniesForAdmin() {
    List<CompanyDto> companies = companyService.getAllCompaniesForAdmin();
    return ResponseEntity.ok(companies);
}
```

### Service

```java
// Inherits @Transactional(readOnly = true) from class level
public List<CompanyDto> getAllCompaniesForAdmin() {
    List<Company> companies = companyRepository.findAll();
    return companies.stream()
            .map(this::transformCompanyToDtoForAdmin)
            .collect(Collectors.toList());
}

private CompanyDto transformCompanyToDtoForAdmin(Company company) {
    CompanyDto dto = new CompanyDto();
    BeanUtils.copyProperties(company, dto);
    // Intentionally NOT copying job details — admin doesn't need them
    return dto;
}
```

> 💡 **Performance tip:** For the admin view, we skip loading associated jobs. No point fetching data that won't be displayed.

---

## API 3: Update Company Details — PUT

### Controller

```java
@PutMapping("/api/company/admin/v1.0/{id}")
public ResponseEntity<?> updateCompany(@PathVariable int id,
                                        @Valid @RequestBody CompanyDto companyDto) {
    boolean updated = companyService.updateCompanyDetails(id, companyDto);
    return updated 
        ? ResponseEntity.ok("Company updated successfully")
        : ResponseEntity.badRequest().body("Failed to update company");
}
```

### Repository — Custom Update Query

```java
@Modifying(flushAutomatically = true, clearAutomatically = true)
int updateCompanyDetails(int id, String name, String logo, String industry,
                         String size, BigDecimal rating, String locations,
                         int founded, String description, int employees,
                         String website);
```

### Entity — Named Query

```java
@NamedQuery(
    name = "Company.updateCompanyDetails",
    query = "UPDATE Company c SET c.name = :name, c.logo = :logo, " +
            "c.industry = :industry, c.size = :size, c.rating = :rating, " +
            "c.locations = :locations, c.founded = :founded, " +
            "c.description = :description, c.employees = :employees, " +
            "c.website = :website WHERE c.id = :id"
)
```

### Service

```java
@Transactional  // Override readOnly — this modifies data
public boolean updateCompanyDetails(int id, CompanyDto dto) {
    int updatedRows = companyRepository.updateCompanyDetails(
        id, dto.getName(), dto.getLogo(), dto.getIndustry(),
        dto.getSize(), dto.getRating(), dto.getLocations(),
        dto.getFounded(), dto.getDescription(), dto.getEmployees(),
        dto.getWebsite()
    );
    return updatedRows > 0;
}
```

> The query updates ALL fields regardless of which ones changed — a simple approach that avoids complex change-detection logic.

---

## API 4: Delete a Company — DELETE

### Controller

```java
@DeleteMapping("/api/company/admin/v1.0/{id}")
public ResponseEntity<?> deleteCompany(@PathVariable int id) {
    companyService.deleteCompany(id);
    return ResponseEntity.ok("Company record deleted successfully");
}
```

### Service

```java
@Transactional  // Override readOnly — this deletes data
public void deleteCompany(int id) {
    companyRepository.deleteById(id);
}
```

Uses the framework-provided `deleteById()` — no `@Modifying` needed since it's a built-in method.

---

## Spring Security — Don't Forget!

All four APIs must be accessible **only to admin users**. Add the new paths to your `PathsConfig`:

```java
private String[] adminPaths() {
    return new String[]{
        "/api/company/admin/**",
        // ... other admin paths
    };
}
```

---

## ✅ Key Takeaways

- Four REST APIs covering full CRUD: Create (POST), Read (GET), Update (PUT), Delete (DELETE)
- `@Transactional` on write methods, inherited `readOnly = true` for read methods
- `@Modifying` on custom update queries in the repository
- `BeanUtils.copyProperties()` for quick DTO ↔ Entity conversion (requires matching field names)
- `@Valid` + Bean Validation annotations to enforce input validation
- Spring Security paths updated to restrict admin-only access

## ⚠️ Common Mistakes

- Forgetting `@Transactional` on the service method when calling a `@Modifying` repository method
- Not adding the new API paths to Spring Security configuration
- Using different field names in DTO and Entity classes — `BeanUtils.copyProperties()` won't copy mismatched names

## 💡 Pro Tips

- Skip unnecessary data when building DTOs for specific views (e.g., no job details for admin)
- Use the `int` return value from update queries to verify the operation actually affected a record
- This is a good assignment: try building these APIs yourself before looking at the reference code
