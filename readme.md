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
- In-memory data store for users/posts/violations.

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

### External Service
- Google Cloud Vision API (`SAFE_SEARCH_DETECTION`)

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Moderation and Feed
- `POST /api/check`
- `GET /api/posts`
- `GET /api/user/status?userId=<id>`

## Setup

## 1) Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
GOOGLE_API_KEY=your_google_vision_api_key
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
1. Passwords are stored as plain text.
2. No persistent database.
3. No JWT/session security model.
4. Hardcoded backend URLs in frontend.
5. No validation/rate limiting hardening.
6. No automated tests yet.

## Recommended Next Steps
1. Add DB persistence.
2. Add bcrypt password hashing.
3. Add JWT auth.
4. Add shared frontend API client and env-based base URL.
5. Add validation middleware and rate limiting.
6. Add test coverage and CI checks.

## Detailed Analysis
For a full architecture review, roadmap, and product feedback, see:
- `projectoverview.md`

