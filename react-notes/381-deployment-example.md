# Deployment Example

## Introduction

We've optimized, we've built — now it's time to actually **put this thing on the internet**. Let's walk through a real deployment using Firebase Hosting. The specific host doesn't matter much (you could use Netlify, Vercel, or others), but the concepts apply everywhere.

---

## Key Insight: React SPAs Are Static Sites

Before we pick a host, understand this crucial fact:

A React single-page application is a **static website**. It consists only of:
- HTML files
- CSS files
- JavaScript files
- Images/assets

There is **no server-side code** to execute. All the logic runs in the browser, on the user's machine. This means you only need a **Static Site Host** — not a full server that runs backend code.

This is different from full-stack React apps (like Next.js), which do require server-side execution.

---

## Deploying to Firebase Hosting

### Step 1: Create a Firebase Project

1. Go to the Firebase console (console.firebase.google.com)
2. Create a new project (e.g., "React Deployment Demo")
3. You don't need Google Analytics for this
4. Navigate to **Build → Hosting**

### Step 2: Install Firebase CLI

```bash
npm install -g firebase-tools
```

On Mac/Linux, you might need `sudo`:

```bash
sudo npm install -g firebase-tools
```

### Step 3: Log In

```bash
firebase login
```

This opens a browser window to authenticate with your Google account.

### Step 4: Initialize the Project

```bash
firebase init
```

You'll be asked several questions:

1. **Which features?** → Select **Hosting** (configure files for Firebase Hosting)
2. **Use existing project?** → Yes, select the project you created
3. **Public directory?** → Type `build` (not `public`!)
4. **Single page app?** → **Yes** (critical — we'll explain why later)
5. **Automatic builds?** → No
6. **Overwrite index.html?** → No

### Step 5: Deploy

```bash
firebase deploy
```

This uploads your `build/` folder to Firebase and gives you a live URL.

---

## After Deployment

- Your site is now live at the Firebase-provided URL
- You can add a **custom domain** through the Firebase console
- To take the site offline: `firebase hosting:disable`
- To redeploy after changes: rebuild with `npm run build`, then `firebase deploy` again

---

## Other Hosting Providers

The process varies by provider, but the core is always the same:

| Provider | Deploy Method |
|----------|--------------|
| **Netlify** | Drag & drop `build/` folder, or connect to Git |
| **Vercel** | Connect to Git repository, auto-deploys on push |
| **GitHub Pages** | Push `build/` contents to a `gh-pages` branch |
| **AWS S3** | Upload `build/` to an S3 bucket with static hosting enabled |

---

## ⚠️ Common Mistakes

- Setting the public directory to `public` instead of `build`
- Answering "No" to the single-page app question (breaks client-side routing)
- Allowing Firebase to overwrite your `build/index.html`

## 💡 Pro Tip

After deploying, always test your live site by navigating directly to a sub-route (like `/blog`). If you get a 404, your SPA routing configuration is wrong — which is exactly what the next lesson covers.

## ✅ Key Takeaways

- React SPAs are static sites — you only need a static site host
- Firebase Hosting is one option; Netlify, Vercel, and others work too
- The `build/` folder is what gets deployed
- Answering "Yes" to the single-page app question is critical for routing
- After deploying, verify routing works by accessing sub-routes directly
