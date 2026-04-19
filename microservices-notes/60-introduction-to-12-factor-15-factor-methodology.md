# Introduction to 12-Factor and 15-Factor Methodologies

## Introduction

You're convinced cloud-native is the way to go. But how do you actually *build* a good cloud-native application? Are there guiding principles? Yes — and they've been battle-tested by teams who've been building cloud applications for over a decade.

---

## The 12-Factor Methodology

Back in **2012**, the engineering team at **Heroku** (a cloud platform) introduced the **12-factor methodology**. These are 12 development principles designed to guide developers in building cloud-native applications.

These weren't theoretical guidelines — they came from **years of real-world experience** building and deploying thousands of applications on their cloud platform.

### What Do You Get by Following These Principles?

- Applications ready for **cloud platform deployment** on any provider
- Built-in support for **scalability and elasticity**
- **System portability** — run across different environments without issues
- Support for **continuous deployment** and agile workflows

The original 12 factors are documented at [12factor.net](https://12factor.net), where each factor has a detailed description.

---

## The 15-Factor Methodology

Technology evolves. After a few years, **Kevin Hoffman** recognized that the original 12 factors needed updating. In his book **"Beyond the Twelve-Factor App"**, he:

1. **Revised** all 12 original factors to reflect modern best practices
2. **Added 3 new factors** to address gaps

This created the **15-factor methodology** — the most current and comprehensive set of guidelines for building cloud-native applications.

---

## The 15 Factors at a Glance

| # | Factor |
|---|--------|
| 1 | One Codebase, One Application |
| 2 | API First |
| 3 | Dependency Management |
| 4 | Design, Build, Release, Run |
| 5 | Configuration, Credentials & Code |
| 6 | Logs |
| 7 | Disposability |
| 8 | Backing Services |
| 9 | Environment Parity |
| 10 | Administrative Processes |
| 11 | Port Binding |
| 12 | Stateless Processes |
| 13 | Concurrency |
| 14 | Telemetry |
| 15 | Authentication & Authorization |

---

## Why Should You Care?

These aren't just academic principles. They directly shape how you build microservices:

- **Config servers** exist because of Factor 5
- **Service registries** relate to Factor 8
- **Log aggregation** comes from Factor 6
- **Security** is enforced by Factor 15

Every tool and pattern we implement in this course maps back to one of these factors.

💡 **Pro Tip**: In microservices interviews, questions about the 12-factor or 15-factor methodology are extremely common. Understanding these factors demonstrates architectural maturity.

---

## ✅ Key Takeaways

- The **12-factor methodology** was created by Heroku in 2012 based on real-world cloud experience
- **Kevin Hoffman** expanded it to **15 factors** by revising the original 12 and adding 3 new ones
- The 15-factor methodology is the **most current standard** for building cloud-native applications
- These principles are not optional — without them, you can't build truly cloud-native applications
- Every major microservices pattern (config servers, log aggregation, stateless services) traces back to one of these factors
