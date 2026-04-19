# Assignment: Implementing Profile Changes in Loans & Cards Microservices

## Introduction

Now it's your turn. The accounts microservice is fully set up with Spring Boot profiles, multiple configuration approaches, and externalized configuration. Your assignment is to replicate these changes in the **loans** and **cards** microservices.

---

## What You Need To Do

For **each** microservice (loans and cards):

### 1. Create the DTO Record Class

- Create a record class (e.g., `LoansContactInfoDto`, `CardsContactInfoDto`)
- Add `@ConfigurationProperties(prefix = "loans")` or `prefix = "cards"`
- Define fields: `message`, `contactDetails` (Map), `onCallSupport` (List)

### 2. Enable Configuration Properties

- Add `@EnableConfigurationProperties(LoansContactInfoDto.class)` to the main application class

### 3. Define Properties in application.yml

- Add `build.version`, message, contactDetails, and onCallSupport under the appropriate prefix (`loans` or `cards`)
- Use different values than accounts — different names, emails, phone numbers

### 4. Create Profile Files

- `application-qa.yml` with QA-specific values
- `application-prod.yml` with production-specific values
- Include `spring.config.activate.on-profile` in each

### 5. Create REST APIs

- `GET /build-info` — returns the build version via `@Value`
- `GET /java-version` — returns `JAVA_HOME` via the `Environment` interface
- `GET /contact-info` — returns the full DTO via `@ConfigurationProperties`

### 6. Update the Controller

- Remove `@AllArgsConstructor` and create a manual constructor for service injection
- Add `@Value`, `Environment`, and DTO autowiring

---

## Where to Find Reference Code

If you get stuck, refer to the GitHub repository:
- Repository: `eazybytes/microservices`
- Path: `section6/v1-springboot/`
- Look at the accounts microservice as your template
- Check the loans and cards folders for the exact property values

---

## Why This Assignment Matters

Repetition builds muscle memory. You've watched the instructor do it once — now doing it yourself for two more microservices cements the patterns:

- How `@ConfigurationProperties` maps YAML to Java
- How profile files override defaults
- How the pieces connect (DTO → EnableConfig → Controller → YAML)

Even if you face issues, working through them teaches more than just watching. The solutions are covered in the next lecture if you need them.

---

## ✅ Checklist

- [ ] LoansContactInfoDto record class with `@ConfigurationProperties`
- [ ] CardsContactInfoDto record class with `@ConfigurationProperties`
- [ ] `@EnableConfigurationProperties` in both main classes
- [ ] Properties defined in `application.yml` for both microservices
- [ ] `application-qa.yml` and `application-prod.yml` for both
- [ ] Three REST APIs in each controller (build-info, java-version, contact-info)
- [ ] Manual constructor injection in controllers
- [ ] All APIs tested via Postman
