# Project Overview: TeensMedia

## 1. Product Vision
TeensMedia is a safety-first social media platform idea for teens where image posting is allowed only after automated moderation. The current implementation is a strong prototype that already demonstrates the end-to-end flow:
- account creation and login,
- image upload,
- AI moderation decision,
- violation tracking and automatic user ban.

## 2. Current Scope Implemented

### Core User Flows
1. User registers or logs in.
2. User uploads an image from the Create Post screen.
3. Backend sends the image to Google Vision SafeSearch.
4. Backend returns moderation status:
   - APPROVED: saved and visible in feed,
   - REJECTED: violation increment,
   - FLAGGED: soft warning path,
   - BANNED: account lock after threshold.
5. Frontend refreshes feed and periodically checks user ban status.

### Moderation Rules (Current)
- Explicit content levels (`VERY_LIKELY`) for adult/racy: rejected.
- Questionable content levels (`LIKELY`) for adult/racy: flagged.
- Violation threshold: 5.
- Reaching threshold marks user as banned.

## 3. Architecture

### Frontend Architecture
- Framework: React + Vite.
- Routing: React Router.
- State style: local component state + browser localStorage for session persistence.
- API communication: axios + fetch (mixed currently).
- Styling: component-level CSS files (mostly refactored from inline style).
- Motion/UI: framer-motion and react-icons.

### Backend Architecture
Backend is now modular and layered:
- server entrypoint,
- app composition,
- routes,
- controllers,
- services,
- config,
- in-memory db module,
- middleware.

This is much cleaner than a single large server file and is ready for production-grade upgrades.

### Data Storage Model
- In-memory arrays/maps are used for users, posts, and violations.
- Data resets on server restart.
- No persistent database yet.

## 4. Technology Stack

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

### External API
- Google Cloud Vision API (SAFE_SEARCH_DETECTION)

## 5. API Surface (Current)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Moderation and Feed
- `POST /api/check`
- `GET /api/posts`
- `GET /api/user/status?userId=<id>`

## 6. Design and Code Quality Observations

### What Is Good
- Clear problem-solution alignment (safe social experience for teen users).
- End-to-end moderation flow is functional.
- Backend structure is now professional and extensible.
- Frontend has improved maintainability after CSS extraction.

### Current Risks / Gaps
1. Security: passwords are plain text.
2. No token/session auth model (localStorage identity only).
3. No persistent DB.
4. API base URL is hardcoded in frontend.
5. No request validation layer (schema validation).
6. No rate limiting and brute-force protection.
7. No automated unit/integration tests.
8. Mixed API client patterns (`fetch` + `axios`).
9. Static third-party image links for stories can be unreliable.

## 7. Recommended Improvement Roadmap

### Phase A: Production Foundation (High Priority)
1. Add persistent DB (PostgreSQL preferred, MongoDB optional).
2. Add password hashing (bcrypt).
3. Add JWT auth with refresh token strategy (or secure session cookie approach).
4. Introduce environment-based API config on frontend.
5. Add request validation middleware (zod/joi/express-validator).
6. Add rate limiting and security hardening headers.

### Phase B: Product Maturity (Medium Priority)
1. Create moderation audit log and optional admin review queue.
2. Add user profiles and proper author metadata in feed.
3. Add better error boundaries and reusable empty/loading states.
4. Normalize API layer on frontend (single axios client + interceptors).
5. Add reusable UI tokens and design variables.

### Phase C: Engineering Scale (Medium/Long Priority)
1. Add backend unit tests and API tests.
2. Add frontend component and flow tests.
3. Add CI pipeline: lint, test, build.
4. Add Docker + deploy templates.
5. Add observability: structured logs, metrics, tracing.

## 8. Suggested New Features (Aligned With Your Vision)
- Friend/follow model.
- Moderation dashboard for admins.
- Report post/report user workflow.
- Captions, comments, and reactions with moderation controls.
- Notification center.
- Cloud image storage + CDN delivery.
- Account recovery and email verification.

## 9. Professional Standards to Continue Following
- Keep backend layered (route -> controller -> service -> db).
- Keep frontend component CSS co-located and avoid large inline style blocks.
- Avoid hardcoded constants/URLs in components.
- Keep features behind clear modules for future versioning.
- Add tests with every major feature increment.

## 10. Current Project Readiness
- Demo/Hackathon readiness: High.
- Production readiness: Low-to-medium (needs auth hardening, DB persistence, and test coverage).
- Architecture readiness for scaling to production: Good foundation after current refactors.
