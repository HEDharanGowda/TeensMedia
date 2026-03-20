# TeensMedia

A safety-first social media prototype for teens, where every uploaded image is moderated before publishing.

## What This Project Does
- Allows users to register and log in.
- Lets users upload images.
- Runs AI moderation through Google Vision SafeSearch.
- Tracks user violations.
- Auto-bans users after repeated explicit-content violations.

## Monorepo Structure

```text
kids-media/
	backend/
		app.js
		server.js
		config/
		controllers/
		db/
		middlewares/
		routes/
		services/
		package.json
	frontend/
		src/
			App.jsx
			components/
				Auth/
				CreatePost.jsx
				Feed.jsx
				Navbar.jsx
				Post.jsx
		package.json
	projectoverview.md
	readme.md
```

## Architecture Summary

### Frontend
- React + Vite app.
- Route-driven UI (login/register/feed/create).
- Local session persistence using `localStorage`.
- API calls to backend moderation and auth endpoints.
- Component-level CSS files with framer-motion animations.

### Backend
- Express 5 layered structure:
	- routes -> controllers -> services -> db modules
	- central app setup and error middleware
- Content moderation service calls Google Vision API.
- MongoDB persistence with Mongoose models.
- JWT authentication with bcrypt password hashing.
- Zod request validation on auth/moderation routes.

## Tech Stack

### Frontend
- React 19
- Vite 6
- react-router-dom
- axios
- framer-motion
- react-icons
- ESLint

### Backend
- Node.js
- Express 5
- axios
- cors
- dotenv
- bcryptjs
- jsonwebtoken
- mongoose
- zod

### External Service
- Google Cloud Vision API (`SAFE_SEARCH_DETECTION`)

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Moderation and Feed
- `POST /api/check`
- `GET /api/posts`
- `GET /api/user/status` (requires Bearer token)

## Setup

## 1) Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
GOOGLE_API_KEY=your_google_vision_api_key
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB_NAME=teensmedia
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1h
PORT=5000
```

Run backend:

```bash
npm start
```

## 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Default URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Current Strengths
- Real end-to-end moderation workflow is implemented.
- Backend is now professionally modularized.
- Frontend styling is more maintainable with separate CSS files.
- Easy to run and demo locally.

## Current Gaps Before Production
1. Auth is now JWT + bcrypt + MongoDB, but refresh-token/session management is not implemented yet.
2. Hardcoded fallback backend URL still exists (env-based override is supported).
3. No validation/rate limiting hardening on every route yet.
4. No automated tests yet.
5. Posts currently store Base64 directly in MongoDB (works, but object storage is better at scale).

## Recommended Next Steps
1. Add refresh-token flow and secure cookie-based session handling.
2. Add route-level rate limiting and auth brute-force protection.
3. Move image storage from Base64 in MongoDB to object storage.
4. Add comprehensive API and UI test coverage.
5. Add CI checks for lint, tests, and security scanning.

## Detailed Analysis
For a full architecture review, roadmap, and product feedback, see:
- `projectoverview.md`

