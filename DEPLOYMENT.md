# Deployment Guide for Lab 2 (Express + SQLite API)

This guide provides step-by-step instructions for deploying the Express and SQLite CRUD service to **Render** (as referenced in `README.md`) or any modern cloud hosting provider (e.g., Railway, Fly.io).

---

## 1. Deployment Readiness Checklist

The project has been prepared with the following production configurations:
- [x] **Dynamic Port Binding**: `app.js` listens on `process.env.PORT || 3000`.
- [x] **Root Health Route (`/`)**: Returns API status and endpoint directory.
- [x] **CORS Support**: Cross-Origin Resource Sharing is enabled for frontend and browser testing.
- [x] **Resilient Database Initialization**: Creates the `database/` directory and `book` table automatically if not already present.
- [x] **Production Start Script**: `package.json` contains `"start": "node app.js"`.
- [x] **Flexible Node Engines**: Specified `"node": ">=18.0.0"` in `package.json` to prevent engine-locking errors across cloud build environments.
- [x] **Render & Procfile Configurations**: Included `render.yaml` and `Procfile`.

---

## 2. Deploying to Render (Recommended)

### Step 1: Push Project to GitHub

If you haven't committed and pushed your project to GitHub:
```bash
# From the repository root
git add .
git commit -m "Prepare backend for production deployment"
git push origin main
```

---

### Step 2: Create a Web Service on Render

1. Log into your account at [render.com](https://render.com).
2. Click **New +** in the dashboard and select **Web Service**.
3. Connect your GitHub repository containing this project.

---

### Step 3: Configure Service Settings

Set the following fields in the Render setup form:

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `lab-02-sqlite-crud` | Or your preferred service name |
| **Region** | Choose the closest region (e.g., Singapore, Frankfurt, Oregon) | |
| **Branch** | `main` | Or your active branch |
| **Root Directory** | `lab-02` | **Crucial** if your repository contains multiple folders (`lab-01`, `lab-02`) |
| **Runtime** | `Node` | |
| **Build Command** | `npm install` | |
| **Start Command** | `node app.js` | Or `npm start` |
| **Instance Type** | `Free` | |

---

### Step 4: Environment Variables (Optional)

Under the **Environment Variables** section, you can optionally add:
- `NODE_ENV` = `production`
- `NODE_VERSION` = `22` (or `20`)

---

### Step 5: Deploy and Verify

1. Click **Create Web Service**.
2. Wait for the build and deployment logs to finish. You should see:
   ```text
   ==> Server running at http://localhost:10000/
   ==> Your service is live 🎉
   ```
3. Test your live deployment using your Render URL (e.g. `https://<your-service-name>.onrender.com`):
   - **Root URL**: `GET https://<your-service-name>.onrender.com/` (returns health status and route list)
   - **Get All Books**: `GET https://<your-service-name>.onrender.com/books/`
   - **Get Single Book**: `GET https://<your-service-name>.onrender.com/books/1/`
   - **Add Book**: `POST https://<your-service-name>.onrender.com/books/`
   - **Update Book**: `PUT https://<your-service-name>.onrender.com/books/1/`
   - **Delete Book**: `DELETE https://<your-service-name>.onrender.com/books/1/`

---

## 3. Note on SQLite in Cloud Containers

> **Note on Free-tier ephemeral storage**: On Render's free tier, the container filesystem is ephemeral, meaning any changes written to `database/books.db` while the server is running will reset if the container restarts or spins down after inactivity. For permanent persistence across restarts on cloud platforms, a persistent disk can be attached, or a hosted database (such as PostgreSQL) can be used. For academic and lab submissions, SQLite with the committed database file or auto-table creation works as intended.

