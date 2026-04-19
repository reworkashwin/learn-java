# DELETE API Inside Accounts Microservice

## Introduction

The final CRUD operation — **Delete**. When a client sends a mobile number, we delete both the customer record and the linked account record. This lecture introduces two critical JPA concepts: **custom delete methods** and the essential `@Transactional` + `@Modifying` annotations that ensure data consistency.

---

## The Delete Endpoint

```java
@DeleteMapping("/delete")
public ResponseEntity<ResponseDto> deleteAccountDetails(@RequestParam String mobileNumber) {
    boolean isDeleted = iAccountsService.deleteAccount(mobileNumber);
    if (isDeleted) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ResponseDto(AccountsConstants.STATUS_200, AccountsConstants.MESSAGE_200));
    } else {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseDto(AccountsConstants.STATUS_500, AccountsConstants.MESSAGE_500));
    }
}
```

- **`@DeleteMapping`** — Delete operations use HTTP DELETE
- Mobile number passed as `@RequestParam` (same as the fetch API)
- Returns boolean-based success/error response

---

## The Delete Logic

```java
@Override
public boolean deleteAccount(String mobileNumber) {
    Customer customer = customerRepository.findByMobileNumber(mobileNumber)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Customer", "mobileNumber", mobileNumber
            ));
    
    accountsRepository.deleteByCustomerId(customer.getCustomerId());
    customerRepository.deleteById(customer.getCustomerId());
    
    return true;
}
```

### The Delete Chain

```
Mobile Number → Find Customer → Get customerId → Delete Account → Delete Customer
```

**Order matters.** We delete the account first (child record), then the customer (parent record). If we deleted the customer first while the foreign key constraint exists, the database would reject the operation.

---

## Custom Delete Methods and `@Transactional` + `@Modifying`

### Why We Need a Custom Delete Method

`deleteById()` deletes by **primary key**. The accounts table's primary key is `accountNumber`, not `customerId`. We need to delete the account record **by customer ID**, so we write a custom method:

```java
@Repository
public interface AccountsRepository extends JpaRepository<Accounts, Long> {
    Optional<Accounts> findByCustomerId(Long customerId);
    
    @Transactional
    @Modifying
    void deleteByCustomerId(Long customerId);
}
```

### Why `@Transactional` and `@Modifying`?

This is critical. When you write **custom methods that change data** (update or delete), you MUST add both annotations:

**`@Modifying`** — Tells Spring Data JPA: "This method modifies data (it's not just a read query)."

**`@Transactional`** — Tells Spring: "Run this inside a database transaction. If anything fails, **roll back** all changes."

Why is this so important? Consider this scenario without `@Transactional`:
1. Delete account record ✅
2. Delete customer record ❌ (fails for some reason)

You're now left with a **customer with no account** — an inconsistent state. With `@Transactional`, if step 2 fails, step 1 is rolled back. Either both succeed or neither does.

### When You DON'T Need These Annotations

`deleteById()` from `CustomerRepository` doesn't need them — it comes from the **framework**, which already handles transactions internally. Only your **custom repository methods** that modify data need them.

### Quick Reference

| Method Type | Needs `@Transactional` + `@Modifying`? |
|---|---|
| Framework's `findById()`, `save()`, `deleteById()` | ❌ No — handled internally |
| Custom `findByXxx()` (read-only) | ❌ No — no data changes |
| Custom `deleteByXxx()` | ✅ Yes |
| Custom `updateByXxx()` | ✅ Yes |

---

## The Derived Method Naming Convention — Full Picture

Spring Data JPA generates queries based on method names:

| Prefix | SQL Operation | Example |
|---|---|---|
| `findBy` | SELECT | `findByMobileNumber(String mobileNumber)` |
| `deleteBy` | DELETE | `deleteByCustomerId(Long customerId)` |
| `countBy` | COUNT | `countByAccountType(String type)` |
| `existsBy` | SELECT (boolean) | `existsByEmail(String email)` |

The field name after the prefix must match the entity field name exactly.

---

## Testing

**Success:**
```
DELETE /api/delete?mobileNumber=9345432123
// Response: 200 - "Request processed successfully"
```

**Verify deletion:**
```
GET /api/fetch?mobileNumber=9345432123
// Response: 404 - "Customer not found with the given input data mobileNumber : '9345432123'"
```

**Already deleted / doesn't exist:**
```
DELETE /api/delete?mobileNumber=9345432123
// Response: 404 - "Customer not found..."
```

---

## ✅ Key Takeaways

- Use **`@DeleteMapping`** for delete operations
- Delete **child records first**, then parent records (respect foreign key constraints)
- Custom repository methods that modify data **must** have `@Transactional` and `@Modifying`
- `@Transactional` ensures **all-or-nothing** — partial deletes are rolled back on failure
- Framework-provided methods (like `deleteById()`) handle transactions internally

⚠️ **Common Mistakes**
- Forgetting `@Transactional` on custom delete/update methods — leads to runtime errors or inconsistent data
- Deleting parent before child records — violates foreign key constraints
- Not handling the "resource not found" case — attempting to delete non-existent records should return 404, not 500
