# Creating a New REST API for the Contact Us Scenario

## Introduction

Our data layer is ready — we have the `Contact` entity class, `ContactRepository` interface, and `ContactRequestDto`. Now it's time to build the **controller layer** and **service layer** to complete our Contact Us REST API. This lecture walks through building the entire API from end to end, including mapping DTOs to entities and saving data to the database.

---

## Building the Controller Layer

### 🧠 What are we building?

A `ContactController` class that exposes a POST endpoint for saving contact messages submitted from the UI.

### ⚙️ Step by Step

Create the package structure: `contact → controller`, then create `ContactController`:

```java
@RestController
@RequestMapping("contacts")
@RequiredArgsConstructor
public class ContactController {

    private final IContactService contactService;

    @PostMapping
    @Version("1.0")
    public ResponseEntity<String> saveContactMsg(@RequestBody ContactRequestDto contactRequestDto) {
        boolean isSaved = contactService.saveContact(contactRequestDto);
        if (isSaved) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Request processed successfully");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save the contact message");
        }
    }
}
```

Let's break down the key pieces:

| Annotation/Element | Purpose |
|---------------------|---------|
| `@RestController` | Marks this as a REST controller |
| `@RequestMapping("contacts")` | Base path for all endpoints in this controller |
| `@RequiredArgsConstructor` | Lombok generates a constructor for `final` fields — enables auto-wiring |
| `@RequestBody` | Tells Spring to convert the incoming JSON into a `ContactRequestDto` object |
| `@PostMapping` | This is a POST endpoint since we're saving new data |
| `ResponseEntity<String>` | Wraps the response with an HTTP status code |

> 💡 We return **201 (Created)** on success because we're creating a new record, and **500 (Internal Server Error)** if the save fails.

---

## Building the Service Layer

### Step 1: Create the Service Interface

Under `contact.service`, create `IContactService`:

```java
public interface IContactService {
    boolean saveContact(ContactRequestDto contactRequestDto);
}
```

The method accepts the DTO and returns a `boolean` — confirming whether the contact data was saved.

### Step 2: Create the Implementation

Under `contact.service.impl`, create `ContactServiceImpl`:

```java
@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements IContactService {

    private final ContactRepository contactRepository;

    @Override
    public boolean saveContact(ContactRequestDto contactRequestDto) {
        boolean result = false;
        Contact contact = contactRepository.save(transformToEntity(contactRequestDto));
        if (contact != null && contact.getId() != null) {
            result = true;
        }
        return result;
    }

    private Contact transformToEntity(ContactRequestDto dto) {
        Contact contact = new Contact();
        BeanUtils.copyProperties(dto, contact);
        contact.setCreatedAt(Instant.now());
        contact.setCreatedBy("system");
        return contact;
    }
}
```

---

## DTO to Entity Mapping — Two Approaches

When the UI sends data as a DTO, we need to **transfer** that data into an entity before saving it. There are two ways:

### Approach 1: Manual Setter Calls

```java
contact.setName(dto.name());
contact.setEmail(dto.email());
// ... repeat for every field
```

This works but is tedious and error-prone for entities with many fields.

### Approach 2: `BeanUtils.copyProperties()` (Recommended)

```java
BeanUtils.copyProperties(dto, contact);
```

`BeanUtils` is a Spring utility class. The `copyProperties()` method **copies all matching field values** from the source object to the destination object. It matches by **exact field name**.

#### How it works with our DTO:

The DTO has fields: `name`, `email`, `userType`, `subject`, `message`

The entity has these same field names, so their values get copied automatically. Fields that exist only in the entity (like `id`, `status`, `createdAt`) are **not affected** — they stay null/default.

> 💡 **Important detail about Java Records:** Getter methods in record classes don't have the `get` prefix. Instead of `dto.getName()`, you use `dto.name()`. This is by design — since records can't have setters, Java uses plain field names as method names.

---

## Populating Extra Fields

After `BeanUtils.copyProperties()` copies the DTO fields, we still need to set some entity fields manually:

```java
contact.setCreatedAt(Instant.now());    // Current timestamp
contact.setCreatedBy("system");          // Who created it
```

Why `"system"` for `createdBy`? Because we don't have authentication yet. Once we implement **Spring Security** in future sections, this will be replaced with the **logged-in username**.

The `id` field? The database handles that automatically thanks to `@GeneratedValue(strategy = IDENTITY)`.

The `status` field? We'll handle that separately (more on this in the testing lecture).

---

## How the Save Operation Works

```java
Contact contact = contactRepository.save(transformToEntity(contactRequestDto));
```

When you call `contactRepository.save()`:

1. The entity object is passed to Spring Data JPA
2. Behind the scenes, an **INSERT statement** is generated
3. The data is saved into the `contacts` database table
4. The method returns the saved entity — now populated with the auto-generated `id`

### Confirming the Save

```java
if (contact != null && contact.getId() != null) {
    result = true;
}
```

If the returned entity is not null and has an ID, the insert was successful.

---

## Package Structure — Keep It Clean

Notice the package organization:

```
com.example.jobportal
├── contact
│   ├── controller
│   │   └── ContactController.java
│   └── service
│       ├── IContactService.java
│       └── impl
│           └── ContactServiceImpl.java
├── company
│   ├── controller
│   └── service
│       ├── ICompanyService.java
│       └── impl
│           └── CompanyServiceImpl.java
├── entity
│   ├── Company.java
│   └── Contact.java
├── repository
│   ├── CompanyRepository.java
│   └── ContactRepository.java
└── dto
    └── ContactRequestDto.java
```

> 💡 Keeping related classes grouped by feature (contact, company) makes the codebase easier to navigate as it grows.

---

## ✅ Key Takeaways

- A REST API follows the pattern: **Controller → Service → Repository → Database**
- Use `@RequestBody` to convert incoming JSON to a DTO object automatically
- `BeanUtils.copyProperties(source, destination)` copies matching field values between objects — no manual setter calls needed
- The `save()` method of `JpaRepository` generates an INSERT statement and returns the saved entity with a populated ID
- Return **201 (Created)** for successful record creation, not 200
- Java Record getter methods use **plain field names** (e.g., `dto.name()`) — no `get` prefix

## ⚠️ Common Mistakes

- Forgetting `@RequestBody` before the DTO parameter — Spring won't convert the JSON body without it
- Using `BeanUtils.copyProperties()` with **mismatched field names** — only exact matches are copied
- Returning 200 (OK) instead of 201 (Created) when creating new records
- Hardcoding `createdBy` as `"system"` forever — remember to replace this with the actual user once authentication is implemented

## 💡 Pro Tips

- `BeanUtils.copyProperties()` is great for simple mappings, but for complex transformations, consider libraries like **MapStruct**
- Always separate your **DTO** from your **Entity** — never expose entity classes directly to the API layer
- Use the **interface + implementation** pattern for services — it promotes loose coupling and makes testing easier
- Group packages by **feature** (contact, company) rather than by **layer** (controllers, services) for better modularity
