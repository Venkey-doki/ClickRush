# ClickRush — 60-Second Click Challenge

ClickRush is a full-stack competitive clicking game where players have a limited amount of time to click as many times as possible and compete for the highest scores on daily, weekly, and global leaderboards.

The project was built as a full-stack engineering assignment with a focus on more than just the game UI. It demonstrates authentication, server-authoritative game sessions, database design, API architecture, Redis-based leaderboard management, validation, score persistence, multiple game modes, and a responsive user interface.

---

## Links

* **GitHub Repository:** https://github.com/Venkey-doki/ClickRush
* **Live Demo:** `YOUR_DEPLOYED_FRONTEND_URL`
* **Demo Video:** `YOUR_LOOM_URL`

> Replace the two placeholders above with the deployed application URL and Loom/demo video URL before submitting the assignment.

---

## Features

### Authentication

* User signup
* User login
* Login using username or email
* JWT-based authentication
* Access token and refresh token flow
* Refresh token rotation
* Logout and refresh-token invalidation
* Protected application routes
* Automatic access-token refresh on expired sessions

### Game

ClickRush supports three game modes:

| Mode     |    Duration | Description                              |
| -------- | ----------: | ---------------------------------------- |
| Classic  |  60 seconds | Standard ClickRush challenge             |
| Sprint   |  10 seconds | Short, high-intensity clicking challenge |
| Marathon | 120 seconds | Extended clicking challenge              |

During a game, the UI displays:

* Remaining time
* Current click count
* Live CPS (clicks per second)
* Session progress
* Server-accepted clicks
* Final score
* Final CPS
* Actual session duration

The frontend sends click counts to the backend in small batches instead of making an HTTP request for every individual click.

---

## Leaderboards

ClickRush provides three leaderboard periods:

* **Daily** — best score for the current day
* **Weekly** — best score for the current ISO week
* **Global** — best score across all recorded games

Leaderboards are also separated by game mode:

* Classic
* Sprint
* Marathon

Redis Sorted Sets are used to efficiently maintain and query leaderboard rankings.

For each user, the leaderboard stores their best score for the corresponding mode and period.

---

## User Profile

Authenticated users can view:

* Their game statistics
* Daily ranking
* Weekly ranking
* Global ranking
* Recent game history
* Score
* Click count
* CPS
* Game mode
* Game duration

Game history is limited to the most recent 50 recorded scores.

---

## Engineering Highlights

The most important architectural decision in ClickRush is that **the frontend handles interaction while the backend remains authoritative over the game session and persisted score**.

The client does not simply send:

```text
"I scored 500 clicks"
```

and expect the backend to trust it.

Instead, the flow is:

```text
User
 │
 ▼
Frontend
 │
 │ Start game
 ▼
Backend creates game session
 │
 │ sessionId + server start time + duration
 ▼
Frontend runs the game
 │
 │ click batches
 ▼
Backend validates each batch
 │
 ▼
Game session updated
 │
 │ end game
 ▼
Backend calculates final CPS
 │
 ▼
Score persisted in PostgreSQL
 │
 ▼
Redis leaderboards updated
 │
 ▼
Frontend displays result and ranking
```

This prevents the frontend from being the sole authority for game duration, session ownership, and score persistence.

---

# Technology Stack

## Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS v4
* shadcn/ui
* React Router
* Axios
* Lucide React
* Inter font

The frontend is implemented as a component-based React application with separate pages, game components, authentication context, reusable UI components, and an API client.

The current frontend dependency configuration is available in `frontend/package.json`.

---

## Backend

* Bun
* TypeScript
* Express 5
* Prisma 7
* PostgreSQL
* Redis
* ioredis
* JWT
* bcrypt
* Zod

The backend follows a modular structure with separate routes, controllers, services, middleware, configuration, utilities, and database access.

---

## Database

### PostgreSQL

PostgreSQL is the primary persistent database.

It stores:

* Users
* Game sessions
* Scores
* Authentication refresh tokens

Prisma is used as the ORM and provides type-safe access to PostgreSQL.

### Redis

Redis is used for high-performance leaderboard operations.

The application uses Redis Sorted Sets (`ZADD`, `ZREVRANGE`, `ZREVRANK`, `ZSCORE`) to maintain and query rankings efficiently.

Daily and weekly leaderboard keys automatically expire at the end of their respective periods.

---

# Architecture

```text
                         ┌──────────────────────────┐
                         │       React Frontend     │
                         │                          │
                         │ React + TypeScript       │
                         │ Vite + Tailwind          │
                         │ shadcn/ui                │
                         └────────────┬─────────────┘
                                      │
                                      │ HTTPS / REST
                                      ▼
                         ┌──────────────────────────┐
                         │      Express Backend     │
                         │                          │
                         │ Authentication           │
                         │ Routes                   │
                         │ Controllers              │
                         │ Services                 │
                         │ Validation               │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                         ▼                         ▼
                ┌──────────────────┐      ┌──────────────────┐
                │   PostgreSQL     │      │      Redis       │
                │                  │      │                  │
                │ Users            │      │ Leaderboards     │
                │ Game Sessions    │      │ Rankings         │
                │ Scores           │      │ Periodic keys    │
                └──────────────────┘      └──────────────────┘
```

---

# Repository Structure

```text
ClickRush/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── script/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.ts
│   │
│   ├── docker-compose.yml
│   ├── package.json
│   ├── prisma.config.ts
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── ClickRush_Implementation_Guide.md
```

The repository separates the frontend and backend while keeping both applications in a single repository. The backend itself is further divided into configuration, controllers, middleware, routes, services, and utilities.

---

# Database Design

The database consists of three primary domain models.

```text
                    ┌───────────────┐
                    │     User      │
                    └───────┬───────┘
                            │
                            │ 1 : N
                            ▼
                    ┌───────────────┐
                    │ GameSession   │
                    └───────┬───────┘
                            │
                            │ 1 : 1
                            ▼
                    ┌───────────────┐
                    │     Score     │
                    └───────────────┘
```

## User

Stores account and authentication information.

```text
User
--------------------------------
id
email
username
passwordHash
refreshToken
createdAt
updatedAt
```

Both email and username are unique.

Passwords are never stored directly. They are hashed using bcrypt.

---

## GameSession

Represents an individual game attempt.

```text
GameSession
--------------------------------
id
userId
mode
status
startedAt
endedAt
clickCount
lastClickAt
createdAt
```

A session belongs to exactly one user.

A session also tracks its state:

```text
IN_PROGRESS
COMPLETED
INVALIDATED
EXPIRED
```

The session stores the accumulated click count and the timestamp of the latest click batch.

---

## Score

Stores the final result of a completed game.

```text
Score
--------------------------------
id
sessionId
userId
mode
clickCount
durationMs
cps
createdAt
```

A score belongs to a game session and a user.

The schema also contains indexes specifically for leaderboard and user-history queries.

---

# Game Session Design

A game begins by creating a server-side session.

The backend returns:

```text
sessionId
startTime
duration
mode
```

The frontend uses the server-provided start time and duration to drive the game timer.

For the currently supported modes:

```text
CLASSIC_60S  → 60,000 ms
SPRINT_10S   → 10,000 ms
MARATHON_120S → 120,000 ms
```

The backend also provides a small grace period to allow the final click batch to reach the server after the visible timer expires.

---

# Click Processing

Sending one HTTP request for every click would generate unnecessary network traffic.

Instead, ClickRush maintains a local pending-click counter and periodically sends click batches to the backend.

```text
User clicks
    │
    ▼
Frontend local counter
    │
    │ every 250ms
    ▼
POST /api/games/clicks
    │
    ▼
Backend validation
    │
    ▼
Database increment
```

The frontend currently flushes pending clicks approximately every 250ms.

The backend validates:

1. The session exists.
2. The authenticated user owns the session.
3. The session is still in progress.
4. The session has not exceeded its allowed duration.
5. The submitted click batch is within the accepted range.
6. The click rate does not exceed the configured human CPS threshold.

---

# Anti-Cheat / Validation

Because this is a competitive game, the backend does not blindly trust client-side values.

The backend calculates the click rate for each submitted batch based on the elapsed time since the previous click batch.

The current maximum accepted human CPS threshold is:

```text
15 CPS
```

If a click rate exceeds the configured threshold, the game session is invalidated instead of allowing the suspicious clicks to contribute to the final score.

The backend also verifies session ownership before allowing clicks or ending a game.

This prevents a user from modifying another user's game session by supplying a different session ID.

---

# Score Calculation

The final score is based on the number of clicks accepted by the server.

CPS is calculated as:

```text
CPS = clickCount / durationInSeconds
```

For example:

```text
clickCount = 420
duration = 60 seconds

CPS = 420 / 60
    = 7.00
```

The final score stores:

* Click count
* Duration
* CPS
* Game mode
* User
* Game session
* Creation timestamp

The score and completed game session are persisted using a PostgreSQL transaction.

---

# Leaderboard Design

Redis Sorted Sets are used for leaderboard storage.

The application maintains separate keys for:

```text
Global
Daily
Weekly
```

and each period is separated by game mode.

Conceptually:

```text
lb:global:CLASSIC_60S
lb:global:SPRINT_10S
lb:global:MARATHON_120S

lb:daily:CLASSIC_60S:<date>
lb:daily:SPRINT_10S:<date>
lb:daily:MARATHON_120S:<date>

lb:weekly:CLASSIC_60S:<iso-week>
lb:weekly:SPRINT_10S:<iso-week>
lb:weekly:MARATHON_120S:<iso-week>
```

When a user finishes a game, Redis updates the user's leaderboard score using `ZADD` with `GT`.

This means the leaderboard keeps the user's best score rather than replacing a higher score with a lower one.

Daily and weekly keys are given expiration times so obsolete period-specific leaderboards are automatically removed.

---

# API Documentation

The backend exposes REST APIs under:

```text
/api
```

## Authentication

### Signup

```http
POST /api/auth/signup
```

Request:

```json
{
  "email": "alice@example.com",
  "username": "alice",
  "password": "password123"
}
```

Returns:

* User information
* Access token
* Refresh token

---

### Login

```http
POST /api/auth/login
```

Request:

```json
{
  "emailOrUsername": "alice",
  "password": "password123"
}
```

The user can authenticate using either their email address or username.

---

### Refresh Access Token

```http
POST /api/auth/refresh
```

Request:

```json
{
  "refreshToken": "..."
}
```

Returns a new access token and refresh token.

---

### Logout

```http
POST /api/auth/logout
```

Request:

```json
{
  "refreshToken": "..."
}
```

---

# Game APIs

All game endpoints require authentication.

### Start Game

```http
POST /api/games/start
```

Request:

```json
{
  "mode": "CLASSIC_60S"
}
```

Supported modes:

```text
CLASSIC_60S
SPRINT_10S
MARATHON_120S
```

Response contains the new session ID, server start time, selected mode, and duration.

---

### Submit Click Batch

```http
POST /api/games/clicks
```

Request:

```json
{
  "sessionId": "SESSION_UUID",
  "clicks": 25
}
```

The backend validates the session and adds the accepted clicks to the server-side session total.

---

### End Game

```http
POST /api/games/end
```

Request:

```json
{
  "sessionId": "SESSION_UUID"
}
```

The backend:

1. Validates the session.
2. Calculates the final duration.
3. Calculates CPS.
4. Marks the session as completed.
5. Creates the score.
6. Updates Redis leaderboards.
7. Returns the final score.

The endpoint is designed to be idempotent for an already-completed session, preventing duplicate score creation if the completion request is repeated.

---

# Leaderboard API

### Get Leaderboard

```http
GET /api/leaderboards
```

Query parameters:

```text
mode
period
limit
```

Example:

```http
GET /api/leaderboards?mode=CLASSIC_60S&period=daily&limit=50
```

Supported periods:

```text
daily
weekly
global
```

The endpoint returns ranked users with:

```json
{
  "rank": 1,
  "userId": "...",
  "username": "alice",
  "score": 420
}
```

The API validates the game mode, leaderboard period, and requested limit using Zod.

---

# User APIs

### Get User Rankings

```http
GET /api/users/me/stats?mode=CLASSIC_60S
```

Returns:

* Daily rank
* Weekly rank
* Global rank
* Corresponding scores

---

### Get Game History

```http
GET /api/users/me/games
```

Returns the authenticated user's recent game scores.

The backend currently returns the latest 50 recorded games ordered by creation time.

---

# Authentication Flow

ClickRush uses access and refresh tokens.

```text
             Login
               │
               ▼
       ┌────────────────┐
       │ Backend verifies│
       │ credentials     │
       └───────┬────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
 Access Token    Refresh Token
        │             │
        ▼             ▼
 API requests    Token refresh
```

The frontend Axios client automatically attaches the access token to authenticated requests.

When a protected request returns `401`, the client attempts to refresh the access token.

A shared refresh promise prevents multiple simultaneous requests from triggering multiple refresh requests at the same time. If refresh fails, authentication state is cleared and the user must log in again.

---

# Input Validation

Zod is used at the API boundary to validate incoming request data.

Examples include:

* Email format
* Username length and allowed characters
* Password length
* Game mode
* Session UUID
* Click count
* Leaderboard period
* Leaderboard limit

For example, click batches are constrained to:

```text
0 <= clicks <= 200
```

This provides an additional layer of protection against malformed or abusive requests.

---

# Local Development Setup

## Prerequisites

Install the following:

* Git
* Bun
* Docker
* Docker Compose
* PostgreSQL
* Redis

PostgreSQL and Redis can be run using the included Docker Compose configuration, so installing them directly on the host is not required.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Venkey-doki/ClickRush.git

cd ClickRush
```

---

# 2. Start PostgreSQL and Redis

Move into the backend directory:

```bash
cd backend
```

Start the required services:

```bash
docker compose up -d
```

The included Docker Compose configuration starts:

```text
PostgreSQL
→ localhost:5432

Redis
→ localhost:6379
```

The default local PostgreSQL configuration is:

```text
Database: clickrush
Username: clickrush
Password: clickrush
```

The repository's Docker configuration uses PostgreSQL 16 and Redis 7 Alpine images.

---

# 3. Install Backend Dependencies

From:

```text
ClickRush/backend
```

run:

```bash
bun install
```

---

# 4. Configure Backend Environment Variables

Create:

```text
backend/.env
```

Configure the required environment variables according to the deployment/local configuration used by the project.

A typical local configuration is:

```env
PORT=4000

DATABASE_URL=postgresql://clickrush:clickrush@localhost:5432/clickrush

REDIS_URL=redis://localhost:6379

JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret

CORS_ORIGIN=http://localhost:5173
```

> Do not commit real secrets to Git.

If the exact variable names differ from your current deployment configuration, use the names defined in `backend/src/config/env.ts`.

---

# 5. Generate Prisma Client

Run:

```bash
bun run prisma:generate
```

---

# 6. Apply Database Migrations

For a development database:

```bash
bun run prisma:migrate:dev
```

Alternatively, if you intentionally want to synchronize the schema without creating a migration:

```bash
bun run db:push
```

For production migrations:

```bash
bun run prisma:migrate:deploy
```

---

# 7. Start the Backend

Run the development server:

```bash
bun run dev
```

The backend runs on:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/health
```

API base URL:

```text
http://localhost:4000/api
```

The backend uses Bun's watch mode for development and exposes the Express API from `src/app.ts`.

---

# 8. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
bun install
```

---

# 9. Configure Frontend Environment

Create:

```text
frontend/.env
```

Set:

```env
VITE_API_URL=http://localhost:4000/api
```

The frontend Axios client reads `VITE_API_URL` and falls back to `http://localhost:4000/api` when it is not provided.

---

# 10. Start the Frontend

Run:

```bash
bun run dev
```

Vite will provide the local development URL, normally:

```text
http://localhost:5173
```

---

# Running the Project

Once both services are running:

```text
Frontend
http://localhost:5173
        │
        ▼
Backend API
http://localhost:4000/api
        │
        ├──────────────► PostgreSQL
        │
        └──────────────► Redis
```

Open the frontend in your browser and create an account.

---

# Production Build

## Backend

Build the backend:

```bash
bun run build
```

Start the compiled backend:

```bash
bun run start
```

The backend package defines separate development, build, start, and Prisma migration commands.

---

## Frontend

Build the frontend:

```bash
bun run build
```

Preview the production build locally:

```bash
bun run preview
```

The production frontend is generated by Vite.

---

# Frontend Architecture

The frontend is divided into pages, components, authentication context, reusable UI components, and utility/API code.

```text
frontend/src/
│
├── assets/
│
├── components/
│   ├── ui/
│   ├── Game.tsx
│   ├── GameHistory.tsx
│   ├── LeaderBoard.tsx
│   ├── Profile.tsx
│   ├── ProtectedRoutes.tsx
│   └── ...
│
├── context/
│   └── AuthContext.tsx
│
├── lib/
│   ├── api.ts
│   └── utils.ts
│
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── SignUpPage.tsx
│
├── types/
│
├── App.tsx
└── main.tsx
```

The game component manages the client-side interaction loop, including the timer, local click counter, click batching, game state, CPS display, and result display.

---

# Backend Architecture

The backend follows a route → controller → service architecture.

```text
HTTP Request
     │
     ▼
   Route
     │
     ▼
 Middleware
     │
     ▼
 Controller
     │
     ▼
 Service
     │
     ├──────────────► Prisma
     │                   │
     │                   ▼
     │              PostgreSQL
     │
     └──────────────► Redis
```

### Routes

Responsible for mapping HTTP endpoints to controllers.

Current route groups include:

```text
/auth
/games
/leaderboards
/users
```

The route index mounts these groups under `/api`.

### Controllers

Controllers handle:

* Request parsing
* Validation
* Authentication context
* HTTP responses

### Services

Services contain the core application logic.

For example, the game service handles:

* Game creation
* Click processing
* Session validation
* Game completion
* CPS calculation
* Score persistence
* Leaderboard updates
* Ranking queries

This keeps the main business logic separate from HTTP-specific concerns.

---

# Security Considerations

ClickRush includes several server-side protections.

### Authentication

Protected game and profile endpoints require a valid JWT access token.

### Authorization

The backend verifies that the authenticated user owns the requested game session before allowing it to be modified.

### Input Validation

Zod validates request payloads before business logic executes.

### Password Security

Passwords are hashed with bcrypt before being stored.

### Session Validation

The server checks:

* Session existence
* Session ownership
* Session status
* Session lifetime

### Click Rate Validation

The backend rejects click batches that exceed the configured maximum CPS threshold.

### Idempotent Game Completion

Repeated completion requests for an already-completed session return the existing score instead of creating another score.

---

# Why Redis Is Used

PostgreSQL remains the source of truth for persisted game data.

Redis is used specifically for leaderboard operations because leaderboard queries are frequent and naturally map to sorted-set operations.

For example:

```text
User A → 420 clicks
User B → 380 clicks
User C → 510 clicks
```

Redis can maintain the ranking:

```text
1. User C — 510
2. User A — 420
3. User B — 380
```

The application can then retrieve the top users without repeatedly calculating rankings from the entire score table.

This separates two responsibilities:

```text
PostgreSQL
→ durable application data

Redis
→ fast leaderboard state
```

---

# UX Features

The game interface provides:

* Responsive layout
* Game state indicators
* Mode selection
* Timer
* Click counter
* Live CPS
* Progress indicator
* Click/tap animation
* Start/stop controls
* Game result display
* Leaderboard filtering
* User profile
* Game history
* Dark/light theme support

The game UI includes three selectable modes and displays server-accepted clicks alongside the local click count, making the distinction between client interaction and server-accepted state visible to the player.

---

# Assignment Requirements

The original assignment asks for the following:

| Requirement                   | ClickRush       |
| ----------------------------- | --------------- |
| User Signup                   | Implemented     |
| User Login                    | Implemented     |
| Authentication                | Implemented     |
| 60-second game                | Implemented     |
| Score calculation             | Implemented     |
| Score persistence             | Implemented     |
| Global leaderboard            | Implemented     |
| Daily leaderboard             | Implemented     |
| Weekly leaderboard            | Implemented     |
| User profile                  | Implemented     |
| Game history                  | Implemented     |
| User rankings                 | Implemented     |
| Multiple game modes           | Implemented     |
| Click animations              | Implemented     |
| Real-time leaderboard updates | Not implemented |

The assignment's optional bonus requirements include real-time leaderboard updates, click animations, CPS, and multiple game modes. ClickRush implements the latter three; leaderboard data is currently fetched through REST rather than being pushed to clients through WebSockets.

---

# Design Decisions

## Why PostgreSQL?

PostgreSQL provides:

* Relational data modeling
* Foreign keys
* Unique constraints
* Transactions
* Indexes
* Reliable persistence
* Strong consistency for user, session, and score data

The relationships between users, sessions, and scores are naturally relational.

---

## Why Redis?

Leaderboard queries are different from normal application queries.

The application needs operations such as:

```text
Give me the top 50 users
Give me this user's rank
Give me this user's score
Keep only the user's best score
```

Redis Sorted Sets provide these operations efficiently.

---

## Why Batch Click Requests?

Sending one request per click would be inefficient.

If a player clicks 10 times per second for 60 seconds:

```text
10 × 60 = 600 requests
```

for a single game would be unnecessary.

Instead, ClickRush batches clicks and periodically sends them to the server.

This significantly reduces HTTP request overhead while retaining server-side validation.

---

# Future Improvements

Possible future improvements include:

* WebSocket-based real-time leaderboard updates
* Better anti-cheat mechanisms using more detailed click timing analysis
* Rate limiting at the API layer
* Pagination for game history
* Persistent leaderboard snapshots
* More game modes
* Achievements and player statistics
* Personal best tracking
* Global player statistics
* Automated backend and frontend test suites
* CI/CD pipeline
* More advanced analytics
* Leaderboard rank-change notifications

---

# Development Commands

## Backend

```bash
bun install
bun run dev
bun run build
bun run start

bun run prisma:generate
bun run prisma:migrate:dev
bun run prisma:migrate:deploy
bun run prisma:migrate:reset
bun run prisma:migrate:status
bun run prisma:db:seed
bun run prisma:studio
bun run prisma:format
bun run prisma:validate
bun run db:push
```

These scripts are defined in the backend `package.json`.

---

## Frontend

```bash
bun install
bun run dev
bun run build
bun run preview
bun run lint
bun run format
bun run typecheck
```

These scripts are defined in the frontend `package.json`.

---

# Local Services

Docker Compose provides the local infrastructure:

```text
PostgreSQL
localhost:5432

Redis
localhost:6379
```

Start:

```bash
cd backend
docker compose up -d
```

Stop:

```bash
docker compose down
```

Stop and remove persistent volumes:

```bash
docker compose down -v
```

> `docker compose down -v` removes the PostgreSQL and Redis Docker volumes and therefore deletes the local database data.

---

# Deployment

ClickRush is designed to run as two separately deployed applications:

```text
┌─────────────────────┐
│   Frontend Hosting  │
│                     │
│ React + Vite        │
└──────────┬──────────┘
           │
           │ HTTPS
           ▼
┌─────────────────────┐
│   Backend Hosting   │
│                     │
│ Bun + Express       │
└───────┬───────┬─────┘
        │       │
        ▼       ▼
 PostgreSQL    Redis
```

The frontend must be configured with:

```env
VITE_API_URL=<production-api-url>/api
```

The backend must be configured with production values for:

```text
DATABASE_URL
REDIS_URL
JWT secrets
CORS origin
PORT
```

---

# Assignment Submission

## Source Code

**GitHub:**

https://github.com/Venkey-doki/ClickRush

## Deployed Application

**Live Demo:**

`YOUR_DEPLOYED_FRONTEND_URL`

## Demo Video

**Loom:**

`YOUR_LOOM_URL`

The demo should demonstrate:

1. Signup
2. Login
3. Starting a game
4. Playing the 60-second challenge
5. Live click count and CPS
6. Game completion
7. Final score
8. Daily leaderboard
9. Weekly leaderboard
10. Global leaderboard
11. User profile
12. Game history
13. Multiple game modes

---

# Project Goals

ClickRush was built to demonstrate the engineering required behind a seemingly simple game.

The core challenge is not the click button itself. The important engineering problems are:

* How to establish an authoritative game session
* How to prevent clients from arbitrarily changing scores
* How to efficiently process high-frequency interactions
* How to persist game results reliably
* How to calculate rankings efficiently
* How to separate persistent data from high-speed leaderboard state
* How to handle authentication and token refresh
* How to structure the backend for maintainability
* How to build a responsive game interface without overwhelming the backend

The resulting system combines a responsive React client with a server-authoritative Express API, PostgreSQL for durable data, and Redis for high-performance leaderboard operations.

---

# License

This project was developed as a full-stack engineering assignment and portfolio project.

---

## Author

**Doki Venkateswararao**

* GitHub: https://github.com/Venkey-doki
* LinkedIn: https://www.linkedin.com/in/doki-venkateswararao/
