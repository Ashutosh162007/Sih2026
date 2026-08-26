# Backend setup requirements

## 1. MongoDB Atlas (database)

You need a cloud MongoDB cluster — don't run local MongoDB for anything beyond quick testing, since university/industry/citizen users need to hit the same DB from day one.

**Steps:**
1. Create a free account at mongodb.com/cloud/atlas
2. Create a new **Project** (e.g. "societal-innovation-portal")
3. Inside the project, create a **Cluster**:
   - Tier: M0 Free (fine for hackathon/prototype; upgrade to M10+ for production load)
   - Cloud provider/region: pick the region closest to your users (e.g. AWS Mumbai `ap-south-1` for Jharkhand/India traffic)
   - This gives you a **Cluster ID** — visible in the connection string, looks like `cluster0.ab1cd.mongodb.net`
4. **Database Access** → create a DB user (username + password, NOT your Atlas login). Give it `readWrite` role on your database.
5. **Network Access** → add IP allowlist entries:
   - Your local dev IP for testing
   - `0.0.0.0/0` (allow from anywhere) for early prototyping only — replace with your actual backend host's IP once deployed
6. Get your **connection string** from Atlas: Database → Connect → "Connect your application" → copy the URI, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.ab1cd.mongodb.net/societal_portal?retryWrites=true&w=majority
   ```
   The `cluster0.ab1cd.mongodb.net` part is your cluster ID — never hardcode the password here, load it from env vars.

**Collections you'll need** (Mongoose will create these automatically on first write, but plan for):
`users`, `issues`, `routingassignments`, `projects`, `notifications`

## 2. Backend packages (Node.js + Express)

```bash
npm init -y
npm install express mongoose dotenv cors jsonwebtoken bcryptjs multer cloudinary express-validator helmet morgan
npm install -D nodemon
```

| Package | Purpose |
|---|---|
| `express` | HTTP server / routing |
| `mongoose` | MongoDB ODM — schema definitions, queries |
| `dotenv` | Load `.env` variables |
| `cors` | Allow frontend origin to call the API |
| `jsonwebtoken` | Issue/verify JWT auth tokens |
| `bcryptjs` | Hash passwords |
| `multer` | Handle image upload multipart form-data |
| `cloudinary` | Store uploaded issue photos (don't store binary in MongoDB) |
| `express-validator` | Validate request bodies (signup, issue report, etc) |
| `helmet` | Basic security headers |
| `morgan` | Request logging in dev |
| `nodemon` | Auto-restart server on file change (dev only) |

## 3. Environment variables (`.env`, never commit this file)

```
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.ab1cd.mongodb.net/societal_portal?retryWrites=true&w=majority

JWT_SECRET=<long random string, e.g. openssl rand -hex 32>
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your key>
CLOUDINARY_API_SECRET=<your secret>

CLIENT_URL=http://localhost:5173

AI_API_KEY=<key for whichever model you use for classification, e.g. OpenAI/HuggingFace>
```

Add `.env` to `.gitignore` immediately — commit a `.env.example` with blank values instead so teammates know what's needed.

## 4. MongoDB connection code (`config/db.js`)

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

Called once in `server.js` before `app.listen(...)`.

## 5. Axios setup (frontend → backend connection)

Create one central Axios instance so every API call automatically gets the base URL and auth token — don't call `axios.get(...)` directly scattered across components.

**`src/api/axiosClient.js`:**
```js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. http://localhost:5000/api/v1
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handling — log out on expired/invalid token
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

**Frontend `.env` (Vite):**
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

**Example usage:**
```js
import axiosClient from '../api/axiosClient';

export const reportIssue = (formData) =>
  axiosClient.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getMyIssues = () => axiosClient.get('/issues/mine');
```

## 6. Image upload flow (Multer → Cloudinary)

Since issue reports include a photo, don't store images in MongoDB directly. Flow:
1. Frontend sends `multipart/form-data` with image via Axios
2. Backend uses `multer` to receive the file in memory
3. Backend uploads buffer to Cloudinary, gets back a URL
4. Backend saves that URL string in the `Issue` document

```js
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
// router.post('/issues', upload.single('image'), issueController.create)
```

## 7. Hosting checklist (once ready to deploy)

| Layer | Suggested host | Notes |
|---|---|---|
| Frontend | Vercel or Netlify | Auto-deploys from GitHub, free tier fine |
| Backend | Render or Railway | Free tier has cold starts — fine for demo, upgrade for real usage |
| Database | MongoDB Atlas (already cloud) | Whitelist your backend host's static IP once deployed, or `0.0.0.0/0` for simplicity in a hackathon |
| Images | Cloudinary | Free tier: 25GB storage/bandwidth, enough for a demo |

Update `CLIENT_URL` in backend `.env` and `VITE_API_BASE_URL` in frontend `.env` to the deployed URLs before final submission — the most common last-minute bug is these still pointing to `localhost`.