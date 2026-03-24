# TeensMedia Frontend

## Environment setup
1) Copy `.env.example` to `.env` (or `.env.production`/`.env.staging`).
```
cp .env.example .env
```
2) Set URLs:
- `VITE_API_BASE_URL` (e.g., `http://localhost:5000/api` or your deployed API).
- `VITE_SOCKET_URL` (optional; defaults to API host without `/api`).

## Run locally
```
npm install
npm run dev
```

## Build
```
npm run build
```
