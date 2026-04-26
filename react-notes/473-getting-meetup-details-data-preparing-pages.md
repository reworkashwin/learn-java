# Getting Meetup Details Data & Preparing Pages

## Introduction

We've fetched all meetups for the home page — but what about individual meetup detail pages? Each one needs its own data from the database, and since these are **dynamic pages**, we also need to tell Next.js which pages to pre-generate. This means wiring up *both* `getStaticPaths` and `getStaticProps` with real MongoDB queries. Let's connect all the dots.

---

## Concept 1: Dynamic Paths from the Database

### 🧠 What is it?

For dynamic pages (like `[meetupId]/index.js`), `getStaticPaths` tells Next.js which specific page instances to pre-generate. Instead of hardcoding IDs, we now fetch them from MongoDB.

### ❓ Why do we need it?

Next.js needs to know *at build time* which meetup detail pages exist so it can pre-render them. Since meetup IDs are stored in the database, we need to query MongoDB to get them.

### ⚙️ How it works

1. Connect to MongoDB inside `getStaticPaths`
2. Use `.find()` with a **projection** to fetch only the `_id` field — no need to pull all the data
3. Map the results into the `paths` array format that Next.js expects
4. Convert each `ObjectId` to a string

### 🧪 Example

```javascript
export async function getStaticPaths() {
  const client = await MongoClient.connect('mongodb+srv://...');
  const db = client.db();
  const meetupsCollection = db.collection('meetups');

  // Only fetch IDs — nothing else
  const meetups = await meetupsCollection.find({}, { _id: 1 }).toArray();

  client.close();

  return {
    fallback: 'blocking',
    paths: meetups.map((meetup) => ({
      params: { meetupId: meetup._id.toString() },
    })),
  };
}
```

### 💡 Insight

The second argument to `.find()` is a **projection** — it controls which fields are returned. Setting `{ _id: 1 }` means "only give me the `_id` field." This is an optimization: why download full documents when you only need IDs?

---

## Concept 2: Fetching a Single Meetup with findOne

### 🧠 What is it?

In `getStaticProps`, we need to fetch the data for **one specific meetup** based on the ID from the URL. MongoDB's `findOne()` method does exactly this — it finds a single document matching your filter criteria.

### ❓ Why do we need it?

Each meetup detail page displays the title, image, address, and description of *one* meetup. We need to look it up by its unique ID extracted from the URL params.

### ⚙️ How it works

1. Extract `meetupId` from `context.params`
2. Connect to MongoDB and get the collection
3. Use `findOne({ _id: ObjectId(meetupId) })` to find the specific document
4. Convert the result into a serializable object before returning as props

### 🧪 Example

```javascript
import { MongoClient, ObjectId } from 'mongodb';

export async function getStaticProps(context) {
  const meetupId = context.params.meetupId;

  const client = await MongoClient.connect('mongodb+srv://...');
  const db = client.db();
  const meetupsCollection = db.collection('meetups');

  const selectedMeetup = await meetupsCollection.findOne({
    _id: new ObjectId(meetupId),
  });

  client.close();

  return {
    props: {
      meetupData: {
        id: selectedMeetup._id.toString(),
        title: selectedMeetup.title,
        address: selectedMeetup.address,
        image: selectedMeetup.image,
        description: selectedMeetup.description,
      },
    },
  };
}
```

### 💡 Insight

The `meetupId` from the URL is a **string**, but MongoDB's `_id` is an `ObjectId`. You *must* wrap the string with `new ObjectId(meetupId)` for the query to match. Forgetting this is a classic gotcha — your query will silently return `null`.

---

## Concept 3: Using Props in the Component

### 🧠 What is it?

Once `getStaticProps` returns the meetup data, your page component receives it as props. You need to **actually use** those props in your JSX instead of hardcoded values.

### ⚙️ How it works

The component accepts `props`, drills into `props.meetupData`, and renders each field:

```jsx
function MeetupDetails(props) {
  return (
    <MeetupDetail
      image={props.meetupData.image}
      title={props.meetupData.title}
      address={props.meetupData.address}
      description={props.meetupData.description}
    />
  );
}
```

### 💡 Insight

Notice it's `props.meetupData.title`, not `props.title`. The nesting comes from how you structured the returned props object in `getStaticProps`. Always trace the shape of your props from the return statement to the component.

---

## Concept 4: The Complete Data Flow

### 🧠 What is it?

The full picture of how a dynamic page gets pre-rendered with database data.

### ⚙️ How it works

1. **`getStaticPaths`** → Queries MongoDB for all meetup IDs → Tells Next.js which pages to generate
2. **`getStaticProps`** → For each page, queries MongoDB for that specific meetup's data → Returns it as props
3. **Component** → Receives props → Renders the meetup details
4. **Result** → Fully pre-rendered HTML pages with real database content, ready to be served instantly

---

## ✅ Key Takeaways

- Use `getStaticPaths` to dynamically generate the list of valid pages from the database
- Use projections (`{ _id: 1 }`) to only fetch the fields you need
- Use `findOne()` with `ObjectId` to fetch a single document by its ID
- Always convert `ObjectId` to string before returning it in props
- Import `ObjectId` from `mongodb` to convert string IDs back to MongoDB-compatible format

## ⚠️ Common Mistakes

- Forgetting to wrap `meetupId` with `new ObjectId()` — the query won't match anything
- Returning `selectedMeetup` directly without transforming `_id` — serialization error
- Not calling `.toString()` on `_id` — the client can't handle `ObjectId` objects
- Confusing `props.title` with `props.meetupData.title` — check your nesting

## 💡 Pro Tips

- Refactor the MongoDB connection code into a shared helper function to avoid copy-pasting across `getStaticPaths`, `getStaticProps`, and API routes
- In production, consider connection pooling instead of connecting/disconnecting on every call
- Setting `fallback: 'blocking'` ensures newly added meetups get pages generated on-demand (more on this in the deployment lesson)
