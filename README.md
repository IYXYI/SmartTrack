**SmartTrack — Habit Tracker**

Simple fullstack habit tracker (React + Vite + Tailwind frontend, Node + Express + SQLite backend) prepared to build with Docker and deploy on Fly.io or Kubernetes.

**What’s included**
- Frontend: `frontend/` (Vite, React, Tailwind)
- Backend: `server.js` (Express + SQLite)
- Seed data: `data/seed.json`
- Dockerfile: multi-stage build (build frontend then run Node server)
- Kubernetes manifests: `k8s/` (deployment, service, ingress)

**Quick local build (production image)**
1. Build the image:

```bash
docker build -t yourusername/smarttrack:latest .
```

2. Run container locally:

```bash
docker run -p 8080:8080 yourusername/smarttrack:latest
```

Open http://localhost:8080

**Development (frontend)**
Install frontend deps and run Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

By default the backend `server.js` serves the production `dist/` built by Vite. For local development you can run the backend separately and configure CORS or proxy as needed.

**Backend (development)**
Install dependencies and run server:

```bash
npm install
node server.js
```

This creates `data/habits.db` and seeds it from `data/seed.json` if the DB is empty.

**Deploy to Fly.io**
1. Install Fly CLI and login: `flyctl auth login`
2. Initialize app: `flyctl apps create` (note the generated app name or supply one)
3. Build and deploy with Docker image you created or let Fly build from repo. Example using local image:

```bash
flyctl deploy --image yourusername/smarttrack:latest
```

Fly will run your container on their VMs. Ensure port `8080` is exposed and your Fly app settings use port `8080`.

**Deploy to Kubernetes**
Replace image name in `k8s/deployment.yaml` then apply manifests:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

**Testing the app**
- Visit the app root: `/` to see habits and toggle completion.
- Add a habit at `/#/add`.
- View streaks at `/#/stats`.

**Customize**
- Frontend: `frontend/src/` — modify pages/components and styling. Run `npm run build` to produce `dist/` for production.
- Backend: `server.js` — extend endpoints or swap DB. The SQLite DB lives in `data/habits.db`.

**Notes**
- The frontend polls the backend for real-time-ish updates (every few seconds). You can replace polling with WebSockets if you want push updates.
- This repository is ready to build and deploy; update the Docker image name in `k8s/deployment.yaml` before applying to a cluster.
# SmartTrack