# Writing Spring Data JPA Entities & Repositories

## Introduction

We have our H2 database with `customer` and `accounts` tables. Now we need **Java code that talks to these tables** — that's where Spring Data JPA comes in. In this lecture, we create **entity classes** (Java representations of database tables) and **repository interfaces** (the magic layer that gives us CRUD operations without writing a single SQL query).

---

## The Entity Layer — Mapping Java to Database Tables

An entity class is a plain Java class (POJO) that maps directly to a database table. Each field in the class corresponds to a column in the table.

### Step 1: The `BaseEntity` Superclass

Remember those four metadata columns (`created_at`, `created_by`, `updated_at`, `updated_by`) that appear in every table? Instead of duplicating them in every entity, we extract them into a shared superclass:

```java
@MappedSuperclass
@Getter @Setter @ToString
public class BaseEntity {

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(updatable = false)
    private String createdBy;

    @Column(insertable = false)
    private LocalDateTime updatedAt;

    @Column(insertable = false)
    private String updatedBy;
}
```

**Why `@MappedSuperclass`?** This tells JPA: "This isn't a table itself, but its fields should be inherited by any entity that extends it."

**Why `updatable = false` on `createdAt`/`createdBy`?** These fields should only be set when a record is first inserted. They must never change on updates.

**Why `insertable = false` on `updatedAt`/`updatedBy`?** These fields should be `null` on first insert. They only get values when the record is updated later.

### Step 2: The `Customer` Entity

```java
@Entity
@Getter @Setter @ToString
@AllArgsConstructor @NoArgsConstructor
public class Customer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @GenericGenerator(name = "native", strategy = "native")
    private Long customerId;

    private String name;

    private String email;

    @Column(name = "mobile_number")
    private String mobileNumber;
}
```

Key annotations:
- **`@Entity`** — Marks this class as a JPA entity mapped to the `customer` table
- **`@Id`** — Declares `customerId` as the primary key
- **`@GeneratedValue` + `@GenericGenerator`** — Tells JPA to auto-generate primary key values using the database's native strategy
- **`@Column(name = "mobile_number")`** — Explicitly maps the field to the column name (optional when names match, ignoring underscores)

💡 **Pro Tip**: If your field name matches the column name (with underscore-to-camelCase conversion), you can skip `@Column`. JPA handles `mobileNumber` → `mobile_number` automatically.

### Step 3: The `Accounts` Entity

```java
@Entity
@Getter @Setter @ToString
@AllArgsConstructor @NoArgsConstructor
public class Accounts extends BaseEntity {

    private Long customerId;

    @Id
    private Long accountNumber;

    private String accountType;

    private String branchAddress;
}
```

Notice something different here — **no `@GeneratedValue`** on `accountNumber`. Why? Because bank account numbers shouldn't be simple sequential numbers (1, 2, 3...). We'll generate proper 10-digit account numbers in our service layer code.

The `customerId` field establishes the foreign key link to the `customer` table, but it's **not the primary key** here — `accountNumber` is.

---

## The Repository Layer — CRUD Without SQL

This is where Spring Data JPA feels like magic. You create an interface, extend `JpaRepository`, and you instantly get dozens of database methods — no implementation code needed.

### `CustomerRepository`

```java
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
```

### `AccountsRepository`

```java
@Repository
public interface AccountsRepository extends JpaRepository<Accounts, Long> {
}
```

That's it. Two empty interfaces. Yet they give you:
- `save()` — insert or update a record
- `findById()` — fetch by primary key
- `findAll()` — fetch all records
- `deleteById()` — delete by primary key
- `count()` — count total records
- And many more...

### How `JpaRepository<Entity, ID>` Works

The two type parameters tell JPA:
1. **Which entity class** this repository manages (`Customer` or `Accounts`)
2. **The data type of the primary key** (`Long` in both cases)

Based on this information, JPA generates runtime implementations with all the standard CRUD methods typed to your entity.

---

## ✅ Key Takeaways

- **Entity classes** map Java POJOs to database tables using `@Entity`, `@Id`, and `@Column`
- **`BaseEntity`** with `@MappedSuperclass` avoids duplicating audit columns across entities
- Use **`@GeneratedValue`** for auto-generated primary keys, skip it when you want manual control (like account numbers)
- **`JpaRepository<Entity, PK>`** gives you full CRUD operations with zero implementation code
- Lombok's `@Getter`, `@Setter`, `@AllArgsConstructor`, `@NoArgsConstructor` eliminate boilerplate

⚠️ **Common Mistakes**
- Forgetting `@Id` on the primary key field — JPA won't know which column is the PK
- Using `@Data` on entities — it generates `hashCode()`/`equals()` which can cause issues with JPA's proxy objects. Use `@Getter @Setter` instead.
- Not extending `BaseEntity` — you'll have to manually add audit columns to every entity
