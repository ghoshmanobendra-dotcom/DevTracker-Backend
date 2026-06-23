# DevTracker — Backend

A RESTful API server for the DevTracker developer productivity platform. Built with **Node.js**, **Express**, **TypeScript**, and **MongoDB Atlas**. Handles authentication, data persistence, file uploads to Cloudinary, and all feature-specific API endpoints.

---

## 🚀 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥ 18.x | JavaScript runtime |
| [Express](https://expressjs.com/) | 4.19.x | Web framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.5.x | Type safety |
| [Mongoose](https://mongoosejs.com/) | 8.5.x | MongoDB ODM |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | — | Cloud database |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 2.4.x | Password hashing |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9.x | JWT authentication |
| [Cloudinary](https://cloudinary.com/) | 2.5.x | Image/file storage |
| [Multer](https://github.com/expressjs/multer) | 1.4.x | File upload handling |
| [CORS](https://github.com/expressjs/cors) | 2.8.x | Cross-origin resource sharing |
| [dotenv](https://github.com/motdotla/dotenv) | 16.x | Environment variable management |
| [tsx](https://github.com/privatenumber/tsx) | 4.x | TypeScript execution (dev) |

---

## 📁 Project Structure

```
backend/
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── .env                        # Environment variables (not committed)
└── src/
    ├── index.ts                # Express app entry point & MongoDB connection
    ├── middleware/
    │   └── auth.ts             # JWT authentication middleware
    ├── models/                 # Mongoose data models
    │   ├── User.ts             # User account model
    │   ├── DailyGoal.ts        # Daily goals model
    │   ├── CodingProblem.ts    # LeetCode problem log model
    │   ├── WebProject.ts       # Web project tracker model
    │   ├── StudyNote.ts        # Study notes model
    │   ├── Shortcut.ts         # Shortcuts model
    │   ├── DailyScore.ts       # Daily performance score model
    │   └── CareerProgress.ts   # Career roadmap progress model
    └── routes/                 # Express route handlers
        ├── auth.ts             # /api/auth — register, login
        ├── profile.ts          # /api/profile — user profile CRUD
        ├── goals.ts            # /api/goals — daily goals CRUD
        ├── problems.ts         # /api/problems — coding problems CRUD
        ├── projects.ts         # /api/projects — web projects CRUD
        ├── notes.ts            # /api/notes — study notes CRUD
        ├── shortcuts.ts        # /api/shortcuts — shortcuts CRUD
        ├── scores.ts           # /api/scores — daily score tracking
        └── career.ts           # /api/career-progress — career milestones
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **MongoDB Atlas** cluster (free tier works fine)
- A **Cloudinary** account for image uploads

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5000`) |
| `CLIENT_URL` | Yes | Frontend origin for CORS (e.g., `http://localhost:5173`) |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Yes | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Your Cloudinary API secret |

### 3. Start the Development Server

```bash
npm run dev
```

The server will start at **http://localhost:5000** with live-reload via `tsx watch`.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to JavaScript in `dist/` |
| `npm run start` | Run the compiled production build |

---

## 🛣️ API Endpoints

All routes are prefixed with `/api`. Protected routes require a valid `Authorization: Bearer <token>` header.

### 🔑 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and receive a JWT token |

### 👤 Profile — `/api/profile`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/profile` | ✅ | Get the authenticated user's profile |
| `PUT` | `/api/profile` | ✅ | Update profile (bio, skills, links, etc.) |
| `POST` | `/api/profile/avatar` | ✅ | Upload/update avatar image (multipart) |

### ✅ Daily Goals — `/api/goals`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/goals` | ✅ | Get all goals for today |
| `POST` | `/api/goals` | ✅ | Create a new daily goal |
| `PUT` | `/api/goals/:id` | ✅ | Update a goal (e.g., toggle completion) |
| `DELETE` | `/api/goals/:id` | ✅ | Delete a goal |

### 💻 Coding Problems — `/api/problems`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/problems` | ✅ | Get all logged problems |
| `POST` | `/api/problems` | ✅ | Log a new solved problem |
| `PUT` | `/api/problems/:id` | ✅ | Update problem details |
| `DELETE` | `/api/problems/:id` | ✅ | Delete a problem log |

### 🌐 Web Projects — `/api/projects`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/projects` | ✅ | Get all web projects |
| `POST` | `/api/projects` | ✅ | Add a new project |
| `PUT` | `/api/projects/:id` | ✅ | Update project details |
| `DELETE` | `/api/projects/:id` | ✅ | Delete a project |

### 📝 Study Notes — `/api/notes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notes` | ✅ | Get all notes |
| `POST` | `/api/notes` | ✅ | Create a new note |
| `PUT` | `/api/notes/:id` | ✅ | Update a note |
| `DELETE` | `/api/notes/:id` | ✅ | Delete a note |

### ⌨️ Shortcuts — `/api/shortcuts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/shortcuts` | ✅ | Get all shortcuts |
| `POST` | `/api/shortcuts` | ✅ | Add a new shortcut |
| `PUT` | `/api/shortcuts/:id` | ✅ | Update a shortcut |
| `DELETE` | `/api/shortcuts/:id` | ✅ | Delete a shortcut |

### 📊 Daily Scores — `/api/scores`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/scores` | ✅ | Get score history |
| `POST` | `/api/scores` | ✅ | Record a daily score |

### 🗺️ Career Progress — `/api/career-progress`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/career-progress` | ✅ | Get career milestones |
| `POST` | `/api/career-progress` | ✅ | Add a milestone |
| `PUT` | `/api/career-progress/:id` | ✅ | Update milestone status |
| `DELETE` | `/api/career-progress/:id` | ✅ | Delete a milestone |

### 🩺 Health Check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ❌ | Server & uptime status check |

---

## 🗄️ Data Models

### `User`
- `username`, `email`, `password` (hashed)
- `bio`, `skills[]`, `github`, `linkedin`, `portfolio`
- `avatarUrl` (Cloudinary URL)

### `DailyGoal`
- `userId`, `text`, `completed`, `date`

### `CodingProblem`
- `userId`, `name`, `difficulty` (`Easy` | `Medium` | `Hard`)
- `tags[]`, `notes`, `solvedAt`

### `WebProject`
- `userId`, `title`, `description`, `techStack[]`
- `liveUrl`, `githubUrl`, `thumbnailUrl`

### `StudyNote`
- `userId`, `title`, `content`, `topic`, `createdAt`

### `Shortcut`
- `userId`, `title`, `shortcut`, `category`

### `DailyScore`
- `userId`, `score`, `date`

### `CareerProgress`
- `userId`, `milestone`, `status` (`pending` | `in-progress` | `completed`)
- `targetDate`, `notes`

---

## 🔐 Authentication Flow

1. **Register** — `POST /api/auth/register` with `{ username, email, password }`. Password is hashed with **bcryptjs** before storage.
2. **Login** — `POST /api/auth/login` returns a signed **JWT** token (expires in 7 days).
3. **Protected Routes** — The `auth` middleware (`src/middleware/auth.ts`) verifies the Bearer token on every protected request and attaches the decoded `userId` to `req.user`.

---

## ☁️ File Uploads (Cloudinary)

File uploads (avatar, project thumbnails) use **Multer** to buffer files in memory, then stream them to **Cloudinary** using `streamifier`. Uploaded files return a secure Cloudinary URL that is stored in the database.

---

## 🏗️ Building for Production

```bash
npm run build
npm run start
```

TypeScript compiles to `dist/`. Ensure all environment variables are set in the production environment.

---

## 🌐 Deploying to Render

Render is the recommended platform for hosting the Node.js/Express backend.

### Prerequisites
- Your project is pushed to a **GitHub** (or GitLab) repository
- You have a [Render account](https://render.com) (free tier is sufficient)

### Step 1 — Create a New Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com) and click **"New +" → "Web Service"**
2. Connect your GitHub account and select the **DevTracker repository**
3. Configure the service:

| Setting | Value |
|---|---|
| **Name** | `devtracker-backend` (or any name) |
| **Region** | Closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | `Free` (or paid for always-on) |

### Step 2 — Add Environment Variables

In the Render dashboard, go to your service → **Environment** tab → **Add Environment Variable** for each:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CLIENT_URL` | `https://your-frontend.vercel.app` *(set after Vercel deploy)* |
| `MONGODB_URI` | Your full MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random secret (e.g., 64+ char string) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

> **⚠️ Important:** Do NOT commit your `.env` file. Make sure `.env` is in your `.gitignore`.

### Step 3 — Configure MongoDB Atlas Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → **Network Access**
2. Click **"Add IP Address"** → **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - This is required because Render's outbound IPs are dynamic
3. Click **Confirm**

### Step 4 — Deploy

1. Click **"Create Web Service"** — Render will automatically build and deploy
2. Monitor logs in the **Logs** tab. You should see:
   ```
   ✅ Connected to MongoDB Atlas
   🚀 Backend server running on http://localhost:5000
   ```
3. Your backend URL will be: `https://devtracker-backend.onrender.com`

### Step 5 — Verify

Hit the health check endpoint in your browser or with curl:
```
https://devtracker-backend.onrender.com/api/health
```
Expected response:
```json
{ "status": "ok", "timestamp": "2024-..." }
```

### Post-Deploy Notes

- **Free tier caveat:** Render's free web services spin down after 15 minutes of inactivity and take ~30s to cold-start on the next request. Upgrade to a paid tier for always-on behavior.
- **Auto-Deploy:** Render auto-redeploys on every push to your configured branch.
- **Logs:** Available in real-time from the Render dashboard under the **Logs** tab.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is for personal/educational use. See the root [LICENSE](../LICENSE) file for details.
