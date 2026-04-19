# Navigating to Tempo from Loki Logs

## Introduction

We've seen how to find a trace ID in Loki logs, copy it, switch to Tempo, paste it, and search. But wouldn't it be amazing if you could just *click* on a log entry and jump straight to the trace visualization in Tempo?

That's exactly what Grafana's **derived fields** feature lets you do — and it's a game-changer for developer productivity.

---

## The Problem

Right now, the workflow to go from logs to traces is manual:

1. Open Loki, search for logs
2. Find a trace ID in a log statement
3. Copy the trace ID
4. Switch data source to Tempo
5. Paste the trace ID and search

That's five steps for something you'll do dozens of times a day. Can we make it one click? Yes.

---

## Setting Up Derived Fields in Loki (via UI)

### Step 1: Open Loki Data Source Settings

Go to **Connections** → **Data Sources** → click on **Loki**.

Scroll down to find the **Derived Fields** section.

### Step 2: Configure the Derived Field

Click **Add** and fill in:

- **Field Name:** `traceId`
- **Regex:** A regex pattern that extracts the trace ID from your log format

Your logs follow this pattern:
```
[INFO ] [accounts, <traceId>, <spanId>] message
```

The regex needs to capture the trace ID portion from this pattern.

### Step 3: Test the Pattern

Paste an example log message into the debug field. Grafana will show you the extracted trace ID value — confirm it matches what you expect.

### Step 4: Link to Tempo

- Enable **Internal Link**
- Select **Tempo** as the data source
- Set the query value to `${__value.raw}`

This tells Grafana: "Whatever trace ID you extract from the log, pass it directly as a query to Tempo."

Click **Save & Test**.

---

## Using the One-Click Navigation

Now go back to **Explore**, select Loki, and query your accounts microservice logs.

Click on any log entry that contains tracing information. You'll see a new field called **traceId** with a clickable **Tempo** link next to it.

Click that link → boom, you're instantly viewing the full distributed trace visualization on the right side panel. No copying, no pasting, no switching data sources.

---

## Making It Permanent with datasource.yml

Manually configuring derived fields through the UI works, but you'd have to redo it every time your Grafana instance is recreated (which happens in Docker/Kubernetes environments). Instead, define it in your `datasource.yml` file.

Under the Loki data source configuration, add:

```yaml
jsonData:
  derivedFields:
    - datasourceUid: tempo
      matcherRegex: "\\[(\\w+)\\s*,\\s*([a-f0-9]+)"
      name: traceId
      url: "$${__value.raw}"
```

### Important YAML Escaping Rules

- Use `$$` instead of `$` for variable references (YAML escaping)
- Add an extra backslash `\\` wherever you have a backslash in your regex (just like escaping special characters in Java strings)
- The `datasourceUid` must match the `uid` defined for your Tempo data source

💡 **Pro Tip:** Always define derived fields in `datasource.yml` rather than through the UI. Infrastructure-as-code means your observability setup is reproducible and version-controlled.

---

## ✅ Key Takeaways

- Derived fields in Loki let you create clickable links that jump directly to Tempo traces from log entries
- Configure with a regex pattern that extracts the trace ID from your log format
- Link to Tempo using `${__value.raw}` as the query parameter
- For production setups, define derived fields in `datasource.yml` rather than through the Grafana UI
- Watch for YAML escaping: double `$$` for variables, double `\\` for regex backslashes
- This dramatically reduces the time to go from "I see an error in logs" to "I see the full request trace"
