# ClickRush --- 60-Second Click Challenge

## Full-Stack Assignment Implementation Guide

> **Purpose:** This document is the engineering blueprint for building,
> testing, deploying, and presenting the ClickRush assignment for Team
> Siksha.
>
> The goal is not merely to make a clicking game work. The goal is to
> demonstrate sound full-stack engineering: clean architecture,
> trustworthy game-session handling, database design, API design,
> authentication, leaderboard queries, security, UX, testing,
> deployment, and engineering judgment.

------------------------------------------------------------------------

# 1. Assignment Overview

## Product

**ClickRush** is a competitive 60-second clicking game.

A registered user starts a game, clicks as many times as possible for 60
seconds, submits the result, and receives a score and ranking.

The application must support:

-   User signup
-   User login
-   Authentication
-   60-second click challenge
-   Score calculation and persistence
-   Global leaderboard
-   Daily leaderboard
-   Weekly leaderboard
-   User profile
-   Game history
-   User rankings

Recommended bonus features:

-   Real-time leaderboard updates
-   Click animations
-   CPS (clicks per second)
-   Multiple game modes

------------------------------------------------------------------------

# 2. Engineering Objective

The submission should communicate one central design principle:

> **The client owns the interaction; the server owns the game session
> and persisted result.**

The frontend should provide a fast, responsive game experience, while
the backend should remain authoritative about:

-   Who owns the game
-   When the game started
-   When it expires
-   Whether it has already been submitted
-   Whether the user is authorized to submit it
-   Whether the result is valid
-   Whether the score can be persisted

Avoid building an architecture that blindly trusts:

``` text
Frontend → "I scored 10,000" → Database
```

Prefer:

``` text
Frontend
   │
   │ Start game
   ▼
Backend creates authoritative game session
   │
   ▼
Frontend runs 60-second interaction
   │
   ▼
Frontend submits result
   │
   ▼
Backend validates game session
   │
   ▼
Backend persists score
   │
   ▼
Leaderboard derives ranking
```

This distinction is one of the strongest engineering points in the
project.

------------------------------------------------------------------------

# 3. Recommended Technology Stack

  Layer               Technology                     Reason
  ------------------- ------------------------------ -----------------------------------------
  Frontend            React                          Component-based UI
  Frontend language   TypeScript                     Type safety
  Build tool          Vite                           Fast development/build
  Styling             Tailwind CSS                   Rapid responsive styling
  UI components       shadcn/ui                      Consistent accessible components
  Server state        TanStack Query                 API caching and synchronization
  Backend             Node.js + Express              Familiar, lightweight API server
  Backend language    TypeScript                     Shared type discipline
  ORM                 Prisma                         Type-safe database access
  Database            PostgreSQL                     Relational integrity + powerful queries
  Validation          Zod                            Runtime input validation
  Authentication      JWT                            Stateless API authentication
  Password hashing    Argon2 or bcrypt               Secure password storage
  Testing             Vitest + Supertest             Unit/integration API testing
  Optional realtime   Socket.IO                      Real-time leaderboard
  Local DB            Docker Compose                 Reproducible development
  Deployment          Vercel + Render/Railway/Neon   Simple deployment path

### Why PostgreSQL?

The application has relational data:

``` text
User
  │
  ├── Games
  │
  └── Scores
```

PostgreSQL provides:

-   Foreign keys
-   Unique constraints
-   Indexes
-   Aggregations
-   Window functions
-   Reliable transactions
-   Efficient leaderboard queries

------------------------------------------------------------------------

# 4. High-Level Architecture

``` text
                         ┌──────────────────────────┐
                         │        React App         │
                         │     Vite + TypeScript    │
                         │                          │
                         │  Pages / Components      │
                         │  Game Engine             │
                         │  API Client              │
                         └────────────┬─────────────┘
                                      │
                                  HTTPS / REST
                                      │
                         ┌────────────▼─────────────┐
                         │       Express API        │
                         │       TypeScript         │
                         │                          │
                         │ Auth Middleware          │
                         │ Controllers              │
                         │ Services                 │
                         │ Repositories             │
                         │ Validation               │
                         └────────────┬─────────────┘
                                      │
                                   Prisma
                                      │
                         ┌────────────▼─────────────┐
                         │       PostgreSQL         │
                         │                          │
                         │ Users                    │
                         │ Games                    │
                         │ Scores                   │
                         └──────────────────────────┘

Optional:

                         ┌──────────────────────────┐
                         │       Socket.IO          │
                         │ Real-time leaderboard    │
                         └──────────────────────────┘
```

------------------------------------------------------------------------

# 5. Repository Structure

Recommended monorepo-style structure:

``` text
clickrush/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── store/
│   │   ├── routes/
│   │   └── App.tsx
│   │
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
├── .gitignore
├── .env.example
├── README.md
└── package.json
```

------------------------------------------------------------------------

# 6. Frontend Architecture

Suggested frontend responsibilities:

``` text
Pages
  ↓
Feature Components
  ↓
Custom Hooks
  ↓
API Services
  ↓
Backend
```

Example:

``` text
GamePage
   │
   ├── GameTimer
   ├── ClickArea
   ├── ClickCounter
   ├── CPSCounter
   └── GameResultModal
          │
          ▼
      useGame()
          │
          ▼
      gameService
          │
          ▼
      REST API
```

Avoid putting all game logic directly inside one huge React component.

------------------------------------------------------------------------

# 7. Backend Architecture

Use a layered structure.

``` text
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
     ▼
Repository / Prisma
     │
     ▼
PostgreSQL
```

## Route

Defines the endpoint.

## Middleware

Handles cross-cutting concerns:

-   Authentication
-   Validation
-   Rate limiting
-   Error handling

## Controller

Handles HTTP-specific behavior:

-   Reads request
-   Calls service
-   Returns response

## Service

Contains business logic.

Examples:

-   Start game
-   Finish game
-   Calculate rank
-   Get leaderboard

## Repository

Contains database access when useful.

This keeps business logic independent from HTTP and database details.

------------------------------------------------------------------------

# 8. Database Design

Core relationship:

``` text
User
 │
 │ 1:N
 ▼
Game
 │
 │ 1:1
 ▼
Score
```

## Users

Stores account information.

``` text
users
--------------------------------
id
username
email
password_hash
created_at
updated_at
```

## Games

Represents an individual 60-second attempt.

``` text
games
--------------------------------
id
user_id
started_at
expires_at
finished_at
status
created_at
```

## Scores

Stores the final result of a completed game.

``` text
scores
--------------------------------
id
game_id
user_id
clicks
score
created_at
```

------------------------------------------------------------------------

# 9. Prisma Schema

A suitable starting point:

``` prisma
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String

  games        Game[]
  scores       Score[]

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([createdAt])
}

model Game {
  id         String     @id @default(cuid())
  userId     String

  startedAt  DateTime
  expiresAt  DateTime
  finishedAt DateTime?
  status     GameStatus @default(ACTIVE)

  user       User       @relation(fields: [userId], references: [id])
  score      Score?

  createdAt  DateTime   @default(now())

  @@index([userId, createdAt])
  @@index([status, expiresAt])
}

model Score {
  id        String   @id @default(cuid())
  gameId    String   @unique
  userId    String

  clicks    Int
  score     Int

  game      Game     @relation(fields: [gameId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())

  @@index([score(sort: Desc)])
  @@index([userId, createdAt])
}

enum GameStatus {
  ACTIVE
  COMPLETED
  EXPIRED
}
```

------------------------------------------------------------------------

# 10. Why Separate Game and Score?

A game represents the **lifecycle of an attempt**.

A score represents the **result of that attempt**.

This separation allows:

``` text
Game:
ACTIVE
  ↓
COMPLETED
```

and:

``` text
Game
 └── Score
```

It also makes it easier to:

-   Prevent duplicate submissions
-   Track abandoned games
-   Add future game modes
-   Store additional result metadata
-   Analyze gameplay

------------------------------------------------------------------------

# 11. Index Strategy

Indexes should support actual query patterns.

## User

``` text
username UNIQUE
email UNIQUE
```

These naturally need fast lookup.

## Game

``` text
(user_id, created_at)
```

Useful for:

``` text
Get user's game history
```

``` text
(status, expires_at)
```

Useful if expired/active game cleanup or monitoring is implemented.

## Score

``` text
(score DESC)
```

Useful for leaderboard-oriented queries.

``` text
(user_id, created_at)
```

Useful for user history and statistics.

Do not add indexes without a query/use-case justification.

------------------------------------------------------------------------

# 12. Authentication Flow

## Registration

``` text
User
 │
 │ username/email/password
 ▼
POST /api/auth/register
 │
 ▼
Validate with Zod
 │
 ▼
Check duplicate email/username
 │
 ▼
Hash password
 │
 ▼
Insert User
 │
 ▼
Return user/token
```

## Login

``` text
User
 │
 │ email/password
 ▼
POST /api/auth/login
 │
 ▼
Find user
 │
 ▼
Verify password hash
 │
 ▼
Generate JWT
 │
 ▼
Return token
```

## Protected request

``` text
Authorization: Bearer <token>
              │
              ▼
         Auth Middleware
              │
              ▼
         Verify JWT
              │
              ▼
          req.user
              │
              ▼
          Controller
```

------------------------------------------------------------------------

# 13. Password Security

Never store:

``` text
password = "mypassword123"
```

Store:

``` text
passwordHash = "$argon2id$..."
```

Recommended options:

-   Argon2id
-   bcrypt

Argon2id is a strong modern choice if supported cleanly by your
environment.

------------------------------------------------------------------------

# 14. JWT Design

A minimal JWT payload:

``` json
{
  "sub": "user-id",
  "iat": 1720000000,
  "exp": 1720600000
}
```

Use `sub` for the user ID.

Do not put sensitive information into the JWT.

The backend should derive the authenticated user from the verified
token.

------------------------------------------------------------------------

# 15. API Design

Base URL:

``` text
/api
```

## Authentication

``` http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Games

``` http
POST /api/games
GET  /api/games/:gameId
POST /api/games/:gameId/finish
GET  /api/games/history
```

## Leaderboards

``` http
GET /api/leaderboards/global
GET /api/leaderboards/daily
GET /api/leaderboards/weekly
```

## Profile

``` http
GET /api/users/me
GET /api/users/me/stats
GET /api/users/me/games
```

------------------------------------------------------------------------

# 16. API Response Convention

Use consistent responses.

Success:

``` json
{
  "success": true,
  "data": {}
}
```

Error:

``` json
{
  "success": false,
  "error": {
    "code": "GAME_ALREADY_COMPLETED",
    "message": "This game has already been submitted."
  }
}
```

This makes frontend error handling predictable.

------------------------------------------------------------------------

# 17. HTTP Status Codes

Use meaningful status codes.

  Situation                             Status
  -------------------------------- -----------
  Successful GET/POST                200 / 201
  Invalid input                            400
  Missing authentication                   401
  Authenticated but unauthorized           403
  Resource not found                       404
  Conflict                                 409
  Rate limit exceeded                      429
  Unexpected server error                  500

------------------------------------------------------------------------

# 18. Game Lifecycle

The game should have a clear state machine.

``` text
              START
                │
                ▼
             ACTIVE
            /      \
           /        \
          ▼          ▼
     COMPLETED     EXPIRED
```

Recommended rules:

``` text
ACTIVE
  ├── user finishes within allowed window → COMPLETED
  ├── time expires → EXPIRED
  └── duplicate finish → reject
```

------------------------------------------------------------------------

# 19. Starting a Game

Endpoint:

``` http
POST /api/games
```

Backend:

1.  Authenticate user.
2.  Generate game ID.
3.  Capture server timestamp.
4.  Set `startedAt`.
5.  Set `expiresAt`.
6.  Store game with `ACTIVE` status.
7.  Return game information.

Example response:

``` json
{
  "success": true,
  "data": {
    "gameId": "clx123",
    "startedAt": "2026-08-10T10:00:00.000Z",
    "expiresAt": "2026-08-10T10:01:00.000Z"
  }
}
```

------------------------------------------------------------------------

# 20. Frontend Game Engine

The frontend should not make a request for every click.

Bad:

``` text
Click
 ↓
POST /click
 ↓
Database
```

This creates unnecessary network and database traffic.

Better:

``` text
Start game
     │
     ▼
Receive gameId
     │
     ▼
Run local click counter
     │
     ▼
60 seconds
     │
     ▼
Submit final result
```

The click counter should be local UI state.

------------------------------------------------------------------------

# 21. Timer Design

The timer should be based on timestamps rather than repeatedly
subtracting `1`.

Avoid relying exclusively on:

``` ts
setInterval(() => {
  setTime(time - 1);
}, 1000);
```

because browser scheduling can drift or pause.

Prefer:

``` text
remaining = expiresAt - currentTime
```

The server's `expiresAt` should be treated as authoritative.

Frontend timer:

``` text
remainingMs = expiresAt - Date.now()
remainingSeconds = Math.max(
  0,
  Math.ceil(remainingMs / 1000)
)
```

The frontend can update this every animation frame or at a reasonable
interval.

------------------------------------------------------------------------

# 22. Score Calculation

For the basic game:

``` text
score = valid clicks
```

CPS:

``` text
CPS = clicks / elapsed seconds
```

Example:

``` text
Clicks = 720
Duration = 60 seconds

CPS = 12
```

For the first version, keep the score simple.

Do not add complicated scoring multipliers unless you introduce
additional game modes.

------------------------------------------------------------------------

# 23. Score Submission

Endpoint:

``` http
POST /api/games/:gameId/finish
```

Example request:

``` json
{
  "clicks": 720
}
```

Backend validation should include:

``` text
1. JWT valid?
2. Game exists?
3. Game belongs to authenticated user?
4. Game status ACTIVE?
5. Has game already been submitted?
6. Is timing valid?
7. Is clicks a valid integer?
8. Is clicks within a reasonable limit?
9. Persist result atomically.
10. Mark game COMPLETED.
```

------------------------------------------------------------------------

# 24. Important Anti-Cheat Consideration

A purely client-side click count can never be completely trusted.

A malicious user can modify:

``` javascript
clicks = 999999;
```

or send an arbitrary API request.

For this assignment, the goal should be **reasonable server-side
validation**, not perfect anti-cheat infrastructure.

At minimum:

-   Server-authoritative game start
-   Server-authoritative expiry
-   Game ownership validation
-   One submission per game
-   Input validation
-   Rate limiting
-   Reasonable score bounds
-   Consistent game state transitions

For a stronger implementation, record click batches/events during the
game, but only if the added complexity is justified.

------------------------------------------------------------------------

# 25. Duplicate Submission Protection

Suppose a user sends:

``` text
POST /games/abc/finish
```

twice.

The first request succeeds.

The second must fail.

Database-level protection:

``` prisma
gameId String @unique
```

Application-level protection:

``` text
if game.status !== ACTIVE:
    reject
```

Ideally use a transaction when updating the game and creating the score.

------------------------------------------------------------------------

# 26. Transactional Game Completion

Conceptually:

``` text
BEGIN TRANSACTION

1. Read game
2. Verify ACTIVE
3. Verify ownership
4. Create Score
5. Update Game → COMPLETED
6. Commit

If anything fails:
ROLLBACK
```

This prevents partially persisted results.

------------------------------------------------------------------------

# 27. Leaderboards

Required leaderboards:

1.  Global
2.  Daily
3.  Weekly

Do not initially create separate:

``` text
global_leaderboard
daily_leaderboard
weekly_leaderboard
```

tables.

Instead, derive rankings from score data.

This avoids synchronization problems.

------------------------------------------------------------------------

# 28. Global Leaderboard

Conceptual query:

``` sql
SELECT
    user_id,
    MAX(score) AS best_score
FROM scores
GROUP BY user_id
ORDER BY best_score DESC
LIMIT 100;
```

The leaderboard represents each user's best score.

------------------------------------------------------------------------

# 29. Daily Leaderboard

Filter by the current day.

Conceptually:

``` sql
WHERE created_at >= start_of_day
```

Then:

``` text
GROUP BY user_id
ORDER BY best_score DESC
```

Be careful about timezone.

The product should define what "daily" means.

Recommended:

> Daily and weekly leaderboard boundaries use UTC consistently.

Alternatively, define an explicit product timezone and document it.

Do not allow the frontend's local timezone to silently determine
rankings.

------------------------------------------------------------------------

# 30. Weekly Leaderboard

Conceptually:

``` sql
WHERE created_at >= start_of_week
```

Then aggregate and rank.

Document whether the week starts on:

-   Monday
-   Sunday

Recommended:

> Week starts Monday, using UTC.

------------------------------------------------------------------------

# 31. Ranking With SQL Window Functions

For ranking:

``` sql
RANK() OVER (
    ORDER BY best_score DESC
)
```

This handles tied scores naturally.

Example:

``` text
Score  Rank
1000   1
1000   1
950    3
900    4
```

You can also use `DENSE_RANK()` depending on the desired tie behavior.

Choose one and document it.

------------------------------------------------------------------------

# 32. Leaderboard API

Example:

``` http
GET /api/leaderboards/global?page=1&limit=20
```

Response:

``` json
{
  "success": true,
  "data": {
    "entries": [
      {
        "rank": 1,
        "username": "alex",
        "score": 1284
      },
      {
        "rank": 2,
        "username": "john",
        "score": 1211
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 120
    }
  }
}
```

------------------------------------------------------------------------

# 33. Pagination

Do not return thousands of leaderboard rows.

Use:

``` text
?page=1&limit=20
```

Apply sensible limits.

For example:

``` text
default = 20
maximum = 100
```

Validate pagination inputs.

------------------------------------------------------------------------

# 34. User Profile

Profile should provide meaningful game statistics.

Example:

``` json
{
  "gamesPlayed": 17,
  "bestScore": 823,
  "averageScore": 694,
  "globalRank": 42,
  "dailyRank": 8,
  "weeklyRank": 15
}
```

Possible profile sections:

``` text
Profile
├── Username
├── Games Played
├── Best Score
├── Average Score
├── Global Rank
├── Daily Rank
├── Weekly Rank
└── Recent Games
```

------------------------------------------------------------------------

# 35. Game History

Example:

``` text
Date                  Score     CPS
-------------------------------------
Aug 10, 2026          823       13.72
Aug 09, 2026          781       13.02
Aug 08, 2026          744       12.40
```

Allow pagination if necessary.

------------------------------------------------------------------------

# 36. Frontend Pages

Recommended:

``` text
/
├── Home
├── Login
├── Register
├── Game
├── Leaderboard
└── Profile
```

Optional:

``` text
/404
```

------------------------------------------------------------------------

# 37. Home Page

The home page should explain the product immediately.

Example structure:

``` text
CLICKRUSH

How many clicks can you get in 60 seconds?

[ PLAY NOW ]

Global Best
1,284

Daily Best
1,102
```

Keep it focused.

------------------------------------------------------------------------

# 38. Game Page

The game page is the most important UX.

Suggested layout:

``` text
┌─────────────────────────────────────┐
│              CLICKRUSH              │
│                                     │
│              TIME                   │
│              42.1s                  │
│                                     │
│              CLICKS                 │
│               517                   │
│                                     │
│        ┌─────────────────┐          │
│        │                 │          │
│        │      CLICK      │          │
│        │                 │          │
│        └─────────────────┘          │
│                                     │
│              12.31 CPS              │
│                                     │
└─────────────────────────────────────┘
```

The click target should be large enough for desktop and mobile.

------------------------------------------------------------------------

# 39. Game UX States

Explicitly handle:

``` text
IDLE
  ↓
COUNTDOWN
  ↓
ACTIVE
  ↓
FINISHING
  ↓
RESULT
```

Example:

``` text
IDLE
"Ready?"
[ START ]

COUNTDOWN
3
2
1
GO!

ACTIVE
60.0
59.9
59.8
...

FINISHING
"Submitting score..."

RESULT
"Game Over"
Score: 823
Rank: #42
[ PLAY AGAIN ]
```

------------------------------------------------------------------------

# 40. CPS Display

Show:

``` text
CPS = clicks / elapsed seconds
```

This provides immediate feedback and makes the game more engaging.

Avoid allowing CPS to become misleading during the first fraction of a
second.

For example, only display CPS after a small minimum elapsed time.

------------------------------------------------------------------------

# 41. Click Animations

Recommended:

-   Button press scale animation
-   `+1` floating number
-   Small ripple effect
-   Score counter animation
-   Result count-up animation

Keep animations lightweight.

Do not use expensive animations that interfere with rapid clicking.

------------------------------------------------------------------------

# 42. Responsive Design

The game should work on:

-   Desktop
-   Laptop
-   Tablet
-   Mobile

Test:

``` text
320px
375px
768px
1024px
1440px+
```

The click area should remain easy to hit.

------------------------------------------------------------------------

# 43. Accessibility

Even though this is a game, accessibility matters.

Use:

-   Semantic buttons
-   Keyboard interaction where appropriate
-   Visible focus states
-   Sufficient contrast
-   Screen-reader labels
-   Reduced-motion support

Do not make the click target a `<div>` if it behaves like a button.

------------------------------------------------------------------------

# 44. Loading States

Handle:

``` text
Starting game...
Submitting score...
Loading leaderboard...
Loading profile...
```

Avoid leaving users wondering whether the application is frozen.

------------------------------------------------------------------------

# 45. Error States

Examples:

``` text
Unable to start game.

[ Try Again ]
```

``` text
Your session expired.

[ Login Again ]
```

``` text
Leaderboard unavailable.

[ Retry ]
```

Do not expose raw backend errors to users.

------------------------------------------------------------------------

# 46. TanStack Query Usage

Good candidates for server state:

``` text
leaderboard
profile
game history
user stats
```

Local game state:

``` text
click count
timer display
game phase
animations
```

Do not force every state into global state.

------------------------------------------------------------------------

# 47. State Management Principle

Use the smallest appropriate state scope.

``` text
Local component state:
- animation
- UI toggles

Game hook/state:
- clicks
- timer
- phase

TanStack Query:
- leaderboard
- profile
- history

Authentication:
- authenticated user/token
```

Avoid creating a huge global store for everything.

------------------------------------------------------------------------

# 48. Zod Validation

Validate every externally supplied input.

Example:

``` ts
const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30),

  email: z
    .string()
    .email(),

  password: z
    .string()
    .min(8)
});
```

Game submission:

``` ts
const finishGameSchema = z.object({
  clicks: z
    .number()
    .int()
    .nonnegative()
});
```

Backend validation is mandatory even if the frontend validates the same
data.

------------------------------------------------------------------------

# 49. Security Checklist

Implement:

``` text
[ ] Password hashing
[ ] JWT verification
[ ] Protected routes
[ ] User ownership checks
[ ] Zod validation
[ ] Rate limiting
[ ] CORS configuration
[ ] Secure environment variables
[ ] No passwords in logs
[ ] No JWT secrets in source code
[ ] Duplicate game submission protection
[ ] Database constraints
```

------------------------------------------------------------------------

# 50. Rate Limiting

Apply stricter limits to sensitive endpoints:

``` text
POST /api/auth/login
POST /api/auth/register
POST /api/games
POST /api/games/:id/finish
```

Do not make the actual click interaction dependent on API calls, so
normal gameplay does not trigger rate limits.

------------------------------------------------------------------------

# 51. CORS

Configure the backend to accept requests only from your deployed
frontend in production.

Development can allow:

``` text
http://localhost:5173
```

Production should use your actual frontend origin.

Do not blindly use:

``` text
Access-Control-Allow-Origin: *
```

for an authenticated production API unless there is a specific reason.

------------------------------------------------------------------------

# 52. Environment Variables

Example:

``` env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
CLIENT_URL=
PORT=
NODE_ENV=
```

Never commit `.env`.

Commit:

``` text
.env.example
```

Example:

``` env
DATABASE_URL=postgresql://...
JWT_SECRET=replace-me
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PORT=4000
NODE_ENV=development
```

------------------------------------------------------------------------

# 53. Docker Compose

Use PostgreSQL locally.

Example:

``` yaml
services:
  postgres:
    image: postgres:16
    container_name: clickrush-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: clickrush
      POSTGRES_PASSWORD: clickrush
      POSTGRES_DB: clickrush
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Start:

``` bash
docker compose up -d
```

Stop:

``` bash
docker compose down
```

------------------------------------------------------------------------

# 54. Local Development Setup

Recommended sequence:

``` bash
git clone <repository>
cd clickrush
```

Install dependencies:

``` bash
npm install
```

Start database:

``` bash
docker compose up -d
```

Configure:

``` text
.env
```

Run Prisma migration:

``` bash
npx prisma migrate dev
```

Generate Prisma client:

``` bash
npx prisma generate
```

Start backend:

``` bash
npm run dev
```

Start frontend:

``` bash
npm run dev
```

------------------------------------------------------------------------

# 55. Useful Root Scripts

If using npm workspaces or a root package:

``` json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace client\" \"npm run dev --workspace server\"",
    "build": "npm run build --workspace client && npm run build --workspace server",
    "test": "npm run test --workspace server",
    "lint": "npm run lint --workspace client && npm run lint --workspace server",
    "format": "prettier --write ."
  }
}
```

Adjust this according to the final repository setup.

------------------------------------------------------------------------

# 56. Testing Strategy

Testing should focus on business-critical behavior.

## Authentication

``` text
✓ Register valid user
✓ Reject duplicate email
✓ Reject duplicate username
✓ Reject invalid email
✓ Reject weak password
✓ Login valid credentials
✓ Reject invalid credentials
✓ Protected endpoint rejects missing token
✓ Protected endpoint rejects invalid token
```

## Games

``` text
✓ Authenticated user can start game
✓ Unauthenticated user cannot start game
✓ Game belongs to current user
✓ Valid game can be completed
✓ Duplicate completion is rejected
✓ Expired game is rejected
✓ Invalid click count is rejected
```

## Leaderboards

``` text
✓ Global leaderboard
✓ Daily leaderboard
✓ Weekly leaderboard
✓ Correct ranking
✓ Correct tie behavior
✓ Pagination
```

------------------------------------------------------------------------

# 57. Example Backend Test Structure

``` text
server/tests/
├── auth.test.ts
├── games.test.ts
├── leaderboard.test.ts
└── users.test.ts
```

Use:

``` text
Vitest
+
Supertest
```

for API integration tests.

------------------------------------------------------------------------

# 58. Database Test Considerations

Ideally tests should use a separate database.

Never run destructive test operations against production.

Possible approaches:

``` text
Test PostgreSQL container
```

or:

``` text
Dedicated test database
```

------------------------------------------------------------------------

# 59. Logging

Use structured logging where practical.

Useful events:

``` text
USER_REGISTERED
USER_LOGIN
GAME_STARTED
GAME_COMPLETED
GAME_EXPIRED
SCORE_RECORDED
AUTH_FAILURE
```

Do not log:

``` text
passwords
JWT secrets
sensitive credentials
```

------------------------------------------------------------------------

# 60. Error Handling

Use one centralized Express error handler.

Conceptually:

``` text
Controller
   │
   ├── throws AppError
   │
   ▼
Global Error Middleware
   │
   ▼
Consistent JSON response
```

Create typed application errors such as:

``` text
ValidationError
UnauthorizedError
ForbiddenError
NotFoundError
ConflictError
```

------------------------------------------------------------------------

# 61. Leaderboard Performance

For a small assignment, querying PostgreSQL directly is sufficient.

Do not introduce Redis prematurely.

A reasonable first implementation is:

``` text
PostgreSQL
   ↓
GROUP BY
   ↓
ORDER BY
   ↓
RANK
```

If the application grows significantly, possible improvements include:

-   Redis sorted sets
-   Materialized leaderboard views
-   Precomputed daily/weekly aggregates
-   Caching
-   Background jobs

But these are future optimizations, not requirements.

------------------------------------------------------------------------

# 62. Optional Redis Architecture

If you eventually want a scalable leaderboard:

``` text
Game completion
      │
      ▼
PostgreSQL
      │
      ▼
Leaderboard service
      │
      ▼
Redis Sorted Set
      │
      ▼
ZADD leaderboard score user
```

Redis can then provide very fast ranking operations.

However:

> Do not add Redis just to make the architecture look complicated.

------------------------------------------------------------------------

# 63. Optional Real-Time Leaderboard

Socket.IO can broadcast leaderboard changes.

Flow:

``` text
User finishes game
       │
       ▼
Backend saves score
       │
       ▼
Recalculate affected ranking
       │
       ▼
Emit leaderboard update
       │
       ▼
Connected clients update UI
```

Example event:

``` text
leaderboard:update
```

Payload:

``` json
{
  "type": "global",
  "entries": [
    {
      "rank": 1,
      "username": "alex",
      "score": 1284
    }
  ]
}
```

Implement this only after the core system is stable.

------------------------------------------------------------------------

# 64. Optional Multiple Game Modes

If implementing multiple modes, keep the initial one as:

``` text
Classic
60 seconds
```

Possible future modes:

``` text
30-second Sprint
10-second Burst
Precision Mode
Endless Practice
```

Do not let multiple modes complicate the core architecture.

A future database field could be:

``` text
game_mode
```

or an enum.

------------------------------------------------------------------------

# 65. API Security and Authorization

Every game endpoint should verify:

``` text
authenticated user
       │
       ▼
game exists
       │
       ▼
game.userId === req.user.id
```

Never trust a `userId` supplied by the client.

Bad:

``` json
{
  "userId": "someone-elses-id"
}
```

The server should derive the user from authentication.

------------------------------------------------------------------------

# 66. Game Ownership

Suppose:

``` text
Game A → User A
```

User B sends:

``` text
POST /games/A/finish
```

The backend must return:

``` text
403 Forbidden
```

or an equivalent secure response.

Never allow arbitrary game IDs to imply authorization.

------------------------------------------------------------------------

# 67. Timing Validation

Important edge cases:

``` text
Start game
↓
Immediately finish
```

Should this be allowed?

Define a minimum duration if necessary.

Also handle:

``` text
Finish after expiresAt
```

and:

``` text
Finish exactly around expiry boundary
```

Use server timestamps consistently.

Allow a small documented network tolerance if needed, but do not make
the game effectively unlimited.

------------------------------------------------------------------------

# 68. Client Clock Problem

Never trust:

``` javascript
Date.now()
```

from the client as proof that 60 seconds have passed.

The browser can manipulate its clock.

The backend should create:

``` text
startedAt
expiresAt
```

and use server time for validation.

The frontend's timer is primarily for UX.

------------------------------------------------------------------------

# 69. Maximum Click Validation

There should be a sanity check.

For example, if the system considers extremely high click counts
impossible for normal human interaction, reject obviously invalid
values.

Do not hard-code an arbitrary number without documenting why.

Better:

``` text
maximum accepted clicks
≈ maximum technically plausible event rate
× game duration
```

The exact threshold should be conservative enough to avoid rejecting
legitimate high-performance users.

This is a heuristic, not a perfect anti-cheat mechanism.

------------------------------------------------------------------------

# 70. Click Event Recording --- Optional Advanced Approach

For stronger validation:

``` text
Frontend
  │
  │ batches click timestamps/counts
  ▼
Backend
  │
  ▼
Game event validation
```

Instead of:

``` text
600 API requests
```

send batches:

``` text
Batch 1 → 100 clicks
Batch 2 → 120 clicks
Batch 3 → 110 clicks
...
```

This provides more information while avoiding one request per click.

However, it adds complexity and is not necessary for the first version.

------------------------------------------------------------------------

# 71. Frontend API Layer

Avoid calling `fetch()` throughout random components.

Create:

``` text
services/
├── auth.service.ts
├── game.service.ts
├── leaderboard.service.ts
└── user.service.ts
```

Example conceptual API:

``` ts
authService.login()
authService.register()

gameService.start()
gameService.finish()

leaderboardService.getGlobal()
leaderboardService.getDaily()
leaderboardService.getWeekly()

userService.getProfile()
userService.getStats()
userService.getHistory()
```

------------------------------------------------------------------------

# 72. Authentication Frontend Flow

``` text
Login
  ↓
POST /auth/login
  ↓
Receive token
  ↓
Store securely according to chosen auth strategy
  ↓
Configure API client
  ↓
Fetch current user
  ↓
Render authenticated application
```

For a browser application, carefully consider whether tokens should be
stored in memory, secure cookies, or local storage. If using local
storage for simplicity in an assignment, explicitly acknowledge the XSS
tradeoff in the README.

A stronger production-oriented approach is an HttpOnly, Secure, SameSite
cookie-based session/token strategy.

------------------------------------------------------------------------

# 73. Routing Protection

Protected pages:

``` text
/game
/leaderboard
/profile
```

can require authentication where appropriate.

The backend remains the real authorization boundary.

Frontend route protection is UX, not security.

------------------------------------------------------------------------

# 74. Leaderboard UX

Use tabs:

``` text
[ Global ] [ Today ] [ This Week ]
```

Example:

``` text
┌─────────────────────────────────────┐
│ Leaderboard                         │
│                                     │
│ Global   Today   This Week          │
│                                     │
│ #   Player             Score        │
│ ----------------------------------- │
│ 1   Alex                1,284       │
│ 2   John                1,211       │
│ 3   Rahul               1,192       │
│ 4   Venky               1,151       │
│                                     │
└─────────────────────────────────────┘
```

Highlight the logged-in user even if they are outside the first page, if
practical.

------------------------------------------------------------------------

# 75. Profile UX

Suggested:

``` text
┌────────────────────────────────────┐
│ Venky                              │
│                                    │
│ Best Score       823               │
│ Games Played     17                │
│ Average Score    694               │
│ Global Rank      #42               │
│                                    │
│ Recent Games                       │
│ ---------------------------------- │
│ Aug 10        823                  │
│ Aug 09        781                  │
│ Aug 08        744                  │
└────────────────────────────────────┘
```

------------------------------------------------------------------------

# 76. Empty States

Handle users with no games.

Example:

``` text
No games yet.

Start your first 60-second challenge.

[ PLAY NOW ]
```

Avoid empty blank screens.

------------------------------------------------------------------------

# 77. Deployment Architecture

A simple production setup:

``` text
                     Internet
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
        Vercel Frontend      API Server
        React/Vite            Express
                                  │
                                  ▼
                             PostgreSQL
```

Possible deployment:

``` text
Frontend → Vercel
Backend  → Render / Railway
Database → Neon / Railway / managed PostgreSQL
```

Choose based on available free tiers and deployment constraints at the
time of submission.

------------------------------------------------------------------------

# 78. Production Environment

Frontend:

``` env
VITE_API_URL=https://api.example.com
```

Backend:

``` env
DATABASE_URL=...
JWT_SECRET=...
CLIENT_URL=https://clickrush.example.com
NODE_ENV=production
PORT=4000
```

Never put server-only secrets into `VITE_*` variables.

------------------------------------------------------------------------

# 79. Deployment Checklist

``` text
[ ] Production database created
[ ] Migrations applied
[ ] Environment variables configured
[ ] Backend deployed
[ ] Frontend deployed
[ ] CORS configured
[ ] HTTPS enabled
[ ] Database connection tested
[ ] Registration tested
[ ] Login tested
[ ] Game tested
[ ] Leaderboard tested
[ ] Profile tested
[ ] Mobile tested
```

------------------------------------------------------------------------

# 80. Git Strategy

Use meaningful commits.

Examples:

``` text
feat: initialize frontend and backend
feat: add postgres and prisma setup
feat: implement user authentication
feat: implement game session lifecycle
feat: implement score submission
feat: add leaderboard queries
feat: add user profile and history
feat: add responsive game UI
feat: add click animations
test: add authentication API tests
test: add game lifecycle tests
docs: add project documentation
fix: prevent duplicate game submission
```

Avoid:

``` text
final
final2
final-final
changes
asdf
```

------------------------------------------------------------------------

# 81. Branch Strategy

For a small assignment:

``` text
main
```

plus feature branches:

``` text
feature/auth
feature/game
feature/leaderboard
feature/profile
feature/ui
```

Merge completed work into `main`.

Keep `main` deployable.

------------------------------------------------------------------------

# 82. Commit Before Submission

Before submitting:

``` bash
git status
git log --oneline
```

Check:

``` text
[ ] No secrets
[ ] No node_modules
[ ] No build artifacts
[ ] No debug logs
[ ] No unnecessary files
[ ] README complete
[ ] .env.example included
```

------------------------------------------------------------------------

# 83. README Structure for Final Repository

Your final README should contain:

``` text
# ClickRush

## Demo
Live Demo
Demo Video

## Features

## Tech Stack

## Architecture

## Project Structure

## Database Schema

## API Documentation

## Game Flow

## Authentication

## Leaderboard Design

## Security

## Local Setup

## Environment Variables

## Testing

## Deployment

## Design Decisions

## Trade-offs

## Future Improvements
```

------------------------------------------------------------------------

# 84. README Design Decisions Section

This is an excellent opportunity to demonstrate engineering thinking.

Explain decisions such as:

### Why PostgreSQL?

Because the system contains relational entities and leaderboard
aggregations.

### Why Prisma?

Type-safe database access and migration management.

### Why not one API request per click?

Would generate unnecessary network/database traffic.

### Why server-side game sessions?

To prevent the frontend from being the sole authority over game duration
and ownership.

### Why not separate leaderboard tables?

Derived leaderboard data can initially be queried from scores, avoiding
synchronization complexity.

### Why not Redis?

The expected scale does not justify the operational complexity for the
assignment.

------------------------------------------------------------------------

# 85. Trade-Offs to Document

Good engineering is about trade-offs.

Document:

``` text
Client-side click counting
vs
Server-side event tracking
```

``` text
PostgreSQL leaderboard queries
vs
Redis sorted sets
```

``` text
JWT
vs
Cookie-based sessions
```

``` text
Simple REST API
vs
WebSockets
```

The goal is not to claim one option is universally better.

Explain why the selected option is appropriate for this project.

------------------------------------------------------------------------

# 86. Performance Considerations

Avoid:

``` text
API request per click
```

Prefer:

``` text
Local click state
+
One final submission
```

Optimize leaderboard queries using:

-   Indexes
-   Pagination
-   Aggregation
-   Appropriate SQL
-   Caching only when needed

Frontend:

-   Avoid unnecessary re-renders
-   Keep click interaction lightweight
-   Avoid expensive animation libraries for simple effects
-   Use memoization only where profiling indicates a need

------------------------------------------------------------------------

# 87. Observability

For a small project, basic observability is enough.

Track:

``` text
API errors
Authentication failures
Game starts
Game completions
Game submission failures
Database errors
```

Optional production additions:

-   Sentry
-   Structured logs
-   Request IDs
-   Metrics

Do not let observability become a major project within the project.

------------------------------------------------------------------------

# 88. Edge Cases Checklist

### Authentication

``` text
[ ] Duplicate email
[ ] Duplicate username
[ ] Invalid password
[ ] Missing token
[ ] Expired token
```

### Game

``` text
[ ] User starts game
[ ] User closes browser
[ ] User refreshes page
[ ] User submits twice
[ ] User submits another user's game
[ ] User submits after expiry
[ ] User submits negative clicks
[ ] User submits non-integer clicks
[ ] Extremely high score
[ ] Network failure during submission
```

### Leaderboard

``` text
[ ] No scores
[ ] One score
[ ] Tied scores
[ ] Large number of scores
[ ] Pagination
[ ] Daily boundary
[ ] Weekly boundary
```

------------------------------------------------------------------------

# 89. Browser Refresh During Game

Decide what should happen.

Recommended:

``` text
User starts game
↓
Refresh
↓
Frontend checks active game
↓
GET /api/games/active
↓
Resume or expire according to server timestamps
```

Optional endpoint:

``` http
GET /api/games/active
```

This makes the system more robust.

Alternatively, invalidate the active game on refresh and document the
behavior.

A resume flow is more polished.

------------------------------------------------------------------------

# 90. Active Game Endpoint

Potential endpoint:

``` http
GET /api/games/active
```

Response:

``` json
{
  "success": true,
  "data": {
    "gameId": "abc123",
    "startedAt": "...",
    "expiresAt": "...",
    "status": "ACTIVE"
  }
}
```

If none:

``` json
{
  "success": true,
  "data": null
}
```

------------------------------------------------------------------------

# 91. Game Start Concurrency

A user could send:

``` text
POST /games
POST /games
POST /games
```

very quickly.

Decide whether multiple active games are allowed.

Recommended:

> A user can have only one active game at a time.

Backend:

``` text
Check existing ACTIVE game
       │
       ├── exists → return/reject
       │
       └── none → create game
```

This prevents multiple simultaneous sessions.

------------------------------------------------------------------------

# 92. Database Constraint for Active Games

PostgreSQL can support advanced constraints such as partial unique
indexes, but Prisma support and migration handling should be evaluated
carefully.

For the assignment, application-level enforcement plus transactional
logic may be sufficient.

If implementing a database-level partial unique index manually, document
it clearly.

------------------------------------------------------------------------

# 93. Game State Consistency

A completed game should look like:

``` text
Game
status: COMPLETED
finishedAt: timestamp

Score
gameId: same game ID
clicks: 823
score: 823
```

Never allow:

``` text
Game = ACTIVE
Score = exists
```

after successful completion.

Transactions help enforce consistency.

------------------------------------------------------------------------

# 94. Suggested Service Methods

Backend:

``` ts
authService.register()
authService.login()

gameService.startGame()
gameService.getActiveGame()
gameService.finishGame()

leaderboardService.getGlobal()
leaderboardService.getDaily()
leaderboardService.getWeekly()

userService.getProfile()
userService.getStats()
userService.getHistory()
```

Keep business logic out of route files.

------------------------------------------------------------------------

# 95. Suggested Controllers

``` text
auth.controller.ts
game.controller.ts
leaderboard.controller.ts
user.controller.ts
```

Routes:

``` text
auth.routes.ts
game.routes.ts
leaderboard.routes.ts
user.routes.ts
```

------------------------------------------------------------------------

# 96. Suggested Middleware

``` text
auth.middleware.ts
error.middleware.ts
validation.middleware.ts
rateLimit.middleware.ts
```

Potential additional middleware:

``` text
requestId.middleware.ts
logging.middleware.ts
```

Only add these if useful.

------------------------------------------------------------------------

# 97. Repository Layer

If using repositories:

``` text
user.repository.ts
game.repository.ts
score.repository.ts
```

Examples:

``` text
findUserByEmail()
createUser()

createGame()
findGameById()
findActiveGameByUser()
completeGame()

createScore()
getLeaderboard()
getUserScores()
```

The service layer should own business decisions.

------------------------------------------------------------------------

# 98. Domain Rules

Write down the game's rules before implementation.

Recommended:

``` text
1. Only authenticated users can play.
2. A game lasts 60 seconds.
3. A user can have at most one active game.
4. A game belongs to exactly one user.
5. A game can be submitted once.
6. Score equals valid click count.
7. Global leaderboard uses each user's best score.
8. Daily leaderboard uses scores submitted during the current UTC day.
9. Weekly leaderboard uses scores submitted during the current UTC week.
10. Ranking ties use RANK().
```

Having explicit rules prevents inconsistent implementation.

------------------------------------------------------------------------

# 99. Development Milestones

## Milestone 1 --- Project Bootstrap

Deliver:

``` text
✓ React app
✓ Express app
✓ PostgreSQL
✓ Prisma
✓ Docker
✓ Environment config
```

------------------------------------------------------------------------

## Milestone 2 --- Authentication

Deliver:

``` text
✓ Registration
✓ Login
✓ JWT
✓ Password hashing
✓ Auth middleware
✓ Protected API
```

------------------------------------------------------------------------

## Milestone 3 --- Game Engine

Deliver:

``` text
✓ Start game
✓ 60-second timer
✓ Click counter
✓ CPS
✓ Finish game
✓ Score persistence
```

------------------------------------------------------------------------

## Milestone 4 --- Leaderboards

Deliver:

``` text
✓ Global
✓ Daily
✓ Weekly
✓ Ranking
✓ Pagination
```

------------------------------------------------------------------------

## Milestone 5 --- Profile

Deliver:

``` text
✓ Stats
✓ Best score
✓ Game history
✓ Rankings
```

------------------------------------------------------------------------

## Milestone 6 --- UX

Deliver:

``` text
✓ Responsive layout
✓ Animations
✓ Loading states
✓ Error states
✓ Empty states
✓ Accessible controls
```

------------------------------------------------------------------------

## Milestone 7 --- Quality

Deliver:

``` text
✓ Tests
✓ Validation
✓ Rate limiting
✓ Error handling
✓ Security review
✓ Database indexes
```

------------------------------------------------------------------------

## Milestone 8 --- Deployment

Deliver:

``` text
✓ Production database
✓ Backend deployment
✓ Frontend deployment
✓ CORS
✓ Environment variables
✓ HTTPS
```

------------------------------------------------------------------------

## Milestone 9 --- Submission

Deliver:

``` text
✓ Public GitHub repository
✓ README
✓ Live demo
✓ Demo video
✓ Clean commit history
```

------------------------------------------------------------------------

# 100. Suggested Implementation Order

Follow this order strictly enough to avoid unnecessary rework:

``` text
1. Repository setup
        ↓
2. Database
        ↓
3. Authentication
        ↓
4. Game session API
        ↓
5. Frontend game engine
        ↓
6. Score submission
        ↓
7. Leaderboards
        ↓
8. Profile
        ↓
9. UX polish
        ↓
10. Security
        ↓
11. Tests
        ↓
12. Deployment
        ↓
13. README
        ↓
14. Demo video
```

Do not start with animations.

Do not start with WebSockets.

Do not start with advanced anti-cheat.

Get the core system working first.

------------------------------------------------------------------------

# 101. MVP Definition

The MVP is complete when:

``` text
[✓] User can register
[✓] User can log in
[✓] User can start a game
[✓] Game lasts 60 seconds
[✓] User can click
[✓] Score is recorded
[✓] User can see global leaderboard
[✓] User can see daily leaderboard
[✓] User can see weekly leaderboard
[✓] User can see profile
[✓] User can see game history
```

Only after this is complete should you move to bonus features.

------------------------------------------------------------------------

# 102. Definition of Done

A feature is not done merely because it works once.

A feature is done when:

``` text
[ ] Happy path works
[ ] Invalid input handled
[ ] Authorization checked
[ ] Errors handled
[ ] Loading state handled
[ ] Mobile layout checked
[ ] Tests added where important
[ ] Code is modular
[ ] No secrets committed
[ ] Documentation updated
```

------------------------------------------------------------------------

# 103. Final QA Checklist

## Authentication

``` text
[ ] Register
[ ] Login
[ ] Logout
[ ] Invalid credentials
[ ] Duplicate account
[ ] Token expiration
```

## Game

``` text
[ ] Start
[ ] Countdown
[ ] 60-second timer
[ ] Clicking
[ ] CPS
[ ] Finish
[ ] Score
[ ] Replay
```

## Leaderboard

``` text
[ ] Global
[ ] Daily
[ ] Weekly
[ ] Correct rank
[ ] Ties
[ ] Pagination
```

## Profile

``` text
[ ] Stats
[ ] History
[ ] Best score
[ ] Rank
```

## Security

``` text
[ ] Password hashing
[ ] Auth middleware
[ ] Ownership checks
[ ] Validation
[ ] Rate limiting
[ ] CORS
[ ] Environment variables
```

## UX

``` text
[ ] Desktop
[ ] Mobile
[ ] Loading
[ ] Errors
[ ] Empty states
[ ] Animations
[ ] Accessibility
```

------------------------------------------------------------------------

# 104. Demo Video Plan

Keep the demo video concise.

Recommended sequence:

## 1. Introduction

``` text
"This is ClickRush, a full-stack 60-second competitive clicking game."
```

## 2. Registration/Login

Show:

``` text
Register → Login
```

## 3. Start Game

Show:

``` text
Start
↓
Countdown
↓
60-second game
```

## 4. Game Result

Show:

``` text
Score
CPS
Rank
```

## 5. Leaderboard

Show:

``` text
Global
Daily
Weekly
```

## 6. Profile

Show:

``` text
Stats
History
Rank
```

## 7. Technical Overview

Briefly explain:

``` text
React
Express
PostgreSQL
Prisma
JWT
```

## 8. Bonus

If implemented:

``` text
Real-time leaderboard
Animations
```

Do not spend the entire video scrolling through code.

------------------------------------------------------------------------

# 105. Demo Video Talking Points

Mention these explicitly:

``` text
"The frontend handles the high-frequency click interaction locally rather than sending an API request for every click."

"The backend creates an authoritative game session with server-side start and expiry timestamps."

"Scores are only persisted after the backend validates the game ownership and lifecycle."

"Leaderboards are derived from score data using indexed database queries."

"The system prevents duplicate game submissions."

"Authentication is handled using hashed passwords and JWT-based authorization."
```

These points directly demonstrate engineering thinking.

------------------------------------------------------------------------

# 106. GitHub Presentation

Your repository should look professional when an evaluator opens it.

Top-level:

``` text
clickrush/
├── client/
├── server/
├── README.md
├── docker-compose.yml
├── .env.example
└── package.json
```

README should immediately show:

``` text
ClickRush
Live Demo
Demo Video
GitHub
Tech Stack
Features
Setup
Architecture
```

------------------------------------------------------------------------

# 107. What Not to Build

Avoid unnecessary complexity:

``` text
✗ Microservices
✗ Kubernetes
✗ Kafka
✗ Complex event-driven architecture
✗ Multiple databases
✗ Separate leaderboard database
✗ Admin dashboard
✗ OAuth
✗ Complex multiplayer system
✗ 10 game modes
```

The assignment is evaluating engineering judgment, not the number of
technologies used.

------------------------------------------------------------------------

# 108. When to Introduce Redis

Only consider Redis when you have a concrete requirement such as:

``` text
Very high leaderboard read traffic
Frequent ranking operations
Caching
Distributed rate limiting
Real-time ranking
```

For the assignment:

``` text
PostgreSQL is enough.
```

------------------------------------------------------------------------

# 109. When to Introduce WebSockets

Add WebSockets if:

``` text
The leaderboard should update without refresh.
```

Otherwise:

``` text
REST + TanStack Query
```

is simpler and sufficient.

------------------------------------------------------------------------

# 110. Engineering Trade-Off Summary

  Decision          Initial Choice                    Reason
  ----------------- --------------------------------- --------------------------------
  Frontend          React + TS                        Fast, maintainable
  Backend           Express + TS                      Simple REST API
  DB                PostgreSQL                        Relational + aggregation
  ORM               Prisma                            Type safety
  Auth              JWT                               Simple API auth
  Password          Argon2/bcrypt                     Secure hashing
  Click handling    Client-local                      Low latency
  Game validation   Server                            Trust boundary
  Leaderboard       PostgreSQL                        Sufficient for assignment
  Realtime          Optional Socket.IO                Bonus
  Cache             None initially                    Avoid premature optimization
  Queue             None initially                    No async workload requiring it
  Deployment        Vercel + API + managed Postgres   Simple

------------------------------------------------------------------------

# 111. Potential Future Improvements

If the project were productionized:

``` text
1. Redis leaderboard caching
2. Distributed rate limiting
3. Stronger click-event anti-cheat
4. Server-side event stream validation
5. Analytics dashboard
6. Matchmaking
7. Multiple game modes
8. Achievements
9. Player levels
10. Seasonal leaderboards
11. Notifications
12. Better observability
13. Automated CI/CD
14. Load testing
15. Horizontal API scaling
```

These belong in a **Future Improvements** section, not necessarily in
the assignment implementation.

------------------------------------------------------------------------

# 112. CI/CD --- Optional

A GitHub Actions pipeline could run:

``` text
Push
 ↓
Install dependencies
 ↓
Lint
 ↓
Type check
 ↓
Unit/API tests
 ↓
Build
```

Potential workflow:

``` text
.github/
└── workflows/
    └── ci.yml
```

A simple CI pipeline can strengthen the submission.

------------------------------------------------------------------------

# 113. Type Safety Checklist

Use TypeScript consistently.

Avoid:

``` ts
const data: any = ...
```

Prefer:

``` ts
interface Game {
  id: string;
  startedAt: string;
  expiresAt: string;
  status: GameStatus;
}
```

Use shared DTO/types where appropriate, but avoid creating an overly
complicated shared package for a small assignment.

------------------------------------------------------------------------

# 114. API Contract Documentation

Keep the API contract clear.

For every endpoint document:

``` text
Method
Path
Authentication
Request body
Query parameters
Success response
Error responses
```

Example:

``` text
POST /api/games/:gameId/finish

Auth: Required

Body:
{
  "clicks": number
}

200:
{
  "score": number,
  "rank": number
}

401:
Unauthorized

403:
Game does not belong to user

404:
Game not found

409:
Game already completed
```

------------------------------------------------------------------------

# 115. Optional OpenAPI

If time allows, add Swagger/OpenAPI.

Possible:

``` text
/api/docs
```

This is a nice bonus but not required.

Do not spend hours documenting every detail if the assignment deadline
is close.

------------------------------------------------------------------------

# 116. Database Migration Discipline

Use Prisma migrations.

Development:

``` bash
npx prisma migrate dev
```

Production:

``` bash
npx prisma migrate deploy
```

Do not manually change production database schemas without migration
tracking.

------------------------------------------------------------------------

# 117. Database Seed Data

Optional seed data can make the leaderboard easier to demonstrate.

Example:

``` text
Alex       1284
John       1211
Rahul      1192
Maya       1150
```

Do not ship fake data in a way that confuses evaluators into thinking it
represents real users.

Clearly label demo/seed data.

------------------------------------------------------------------------

# 118. Game Result Design

A polished result screen:

``` text
┌────────────────────────────────┐
│           GAME OVER            │
│                                │
│              823               │
│             CLICKS             │
│                                │
│             13.72              │
│              CPS                │
│                                │
│          GLOBAL #42             │
│                                │
│     PERSONAL BEST: YES         │
│                                │
│       [ PLAY AGAIN ]           │
│                                │
└────────────────────────────────┘
```

If the score is a personal best, show that clearly.

------------------------------------------------------------------------

# 119. Personal Best Logic

When a game completes:

``` text
newScore > previousBest
```

then:

``` text
isPersonalBest = true
```

Return this in the API response:

``` json
{
  "score": 823,
  "rank": 42,
  "isPersonalBest": true
}
```

This creates a useful UX moment.

------------------------------------------------------------------------

# 120. Leaderboard Ranking Semantics

Define whether the leaderboard ranks:

### Best score per player

Recommended:

``` text
User A → best = 1200
User B → best = 1100
```

rather than:

``` text
Every individual game appears.
```

This makes the leaderboard represent player performance rather than
activity volume.

------------------------------------------------------------------------

# 121. Daily and Weekly Semantics

Define carefully.

Recommended:

``` text
Global:
User's best score across all time.

Daily:
User's best score among games completed today.

Weekly:
User's best score among games completed this week.
```

This is clearer than simply sorting every game.

------------------------------------------------------------------------

# 122. Tie Handling

Recommended:

``` text
RANK()
```

Example:

``` text
Alex    1000    #1
John    1000    #1
Maya     950    #3
```

Document this behavior.

------------------------------------------------------------------------

# 123. Potential Database Query Pattern

Conceptually:

``` text
Scores
   │
   ├── filter date range
   │
   ├── group by user
   │
   ├── MAX(score)
   │
   ├── rank
   │
   └── pagination
```

This is the core leaderboard pipeline.

------------------------------------------------------------------------

# 124. Important Timezone Decision

Use one consistent rule.

Recommended:

``` text
All stored timestamps → UTC
Leaderboard boundaries → UTC
```

Frontend converts timestamps to the user's local timezone for display.

This avoids inconsistent daily/weekly results between servers and
clients.

------------------------------------------------------------------------

# 125. HTTP Request Example

Starting a game:

``` http
POST /api/games HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
```

Response:

``` json
{
  "success": true,
  "data": {
    "gameId": "game_123",
    "startedAt": "2026-08-10T10:00:00Z",
    "expiresAt": "2026-08-10T10:01:00Z"
  }
}
```

------------------------------------------------------------------------

# 126. Finish Request Example

``` http
POST /api/games/game_123/finish HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
```

Body:

``` json
{
  "clicks": 823
}
```

Response:

``` json
{
  "success": true,
  "data": {
    "score": 823,
    "rank": 42,
    "isPersonalBest": true
  }
}
```

------------------------------------------------------------------------

# 127. Example Error

Duplicate submission:

``` json
{
  "success": false,
  "error": {
    "code": "GAME_ALREADY_COMPLETED",
    "message": "This game has already been completed."
  }
}
```

The frontend can map this to a user-friendly message.

------------------------------------------------------------------------

# 128. Clean Code Rules

Follow:

``` text
1. Small functions
2. Meaningful names
3. No duplicated business logic
4. Explicit types
5. Centralized errors
6. Validation at boundaries
7. Services for business logic
8. Controllers for HTTP
9. Database access isolated
10. Comments explain why, not what
```

Avoid giant files.

If a controller reaches hundreds of lines, move logic into services.

------------------------------------------------------------------------

# 129. Code Review Checklist

Before submission, inspect every major module.

Ask:

``` text
Can I understand this file quickly?

Does this function have one responsibility?

Is this logic testable?

Is user input validated?

Is authorization checked?

Can this operation fail halfway?

Does the database enforce important constraints?

Are errors consistent?

Are there unnecessary abstractions?
```

------------------------------------------------------------------------

# 130. Final Submission Package

You should eventually have:

``` text
1. Public GitHub repository
2. Live deployed application
3. README.md
4. Demo video
```

Submission response can contain:

``` text
GitHub:
<repo>

Live Demo:
<url>

Demo Video:
<loom-url>
```

------------------------------------------------------------------------

# 131. Final Submission Checklist

``` text
PROJECT
[ ] Core functionality complete
[ ] No major bugs
[ ] Responsive

BACKEND
[ ] Auth
[ ] Game lifecycle
[ ] Score persistence
[ ] Leaderboards
[ ] Profile
[ ] Validation
[ ] Error handling

DATABASE
[ ] Schema documented
[ ] Relations correct
[ ] Indexes present
[ ] Migrations included

SECURITY
[ ] Password hashing
[ ] JWT verification
[ ] Authorization
[ ] Rate limiting
[ ] CORS
[ ] Secrets protected

FRONTEND
[ ] Good UX
[ ] Loading states
[ ] Error states
[ ] Animations
[ ] Mobile support

TESTING
[ ] Auth tests
[ ] Game tests
[ ] Leaderboard tests

DOCUMENTATION
[ ] README
[ ] Setup instructions
[ ] API documentation
[ ] Architecture explanation
[ ] Database explanation
[ ] Trade-offs

DEPLOYMENT
[ ] Backend live
[ ] Frontend live
[ ] Database live
[ ] Production environment variables
[ ] CORS configured

SUBMISSION
[ ] GitHub URL
[ ] Live URL
[ ] Loom/demo URL
```

------------------------------------------------------------------------

# 132. Recommended Final Feature Scope

## Must Have

``` text
✓ Signup
✓ Login
✓ JWT authentication
✓ Password hashing
✓ 60-second game
✓ Server-side game session
✓ Score persistence
✓ Global leaderboard
✓ Daily leaderboard
✓ Weekly leaderboard
✓ User profile
✓ Game history
✓ Ranking
✓ PostgreSQL
✓ Prisma
✓ Responsive UI
```

## Strongly Recommended

``` text
✓ Zod validation
✓ Rate limiting
✓ Database indexes
✓ Centralized errors
✓ API tests
✓ Click animations
✓ CPS
✓ Personal best indicator
✓ Good README
```

## Bonus

``` text
○ Real-time leaderboard
○ Multiple game modes
○ Stronger anti-cheat
○ CI/CD
○ Swagger/OpenAPI
```

------------------------------------------------------------------------

# 133. Final Architecture

The final system should conceptually look like:

``` text
                           CLICKRUSH
                               │
              ┌────────────────┴────────────────┐
              │                                 │
          Frontend                           Backend
              │                                 │
      React + TypeScript                  Express + TypeScript
              │                                 │
      ┌───────┼────────┐                ┌───────┼───────────┐
      │       │        │                │       │           │
     Game  Leaderboard Profile         Auth    Game    Leaderboard
      │       │        │                │       │           │
      └───────┼────────┘                └───────┼───────────┘
              │                                 │
         TanStack Query                     Services
              │                                 │
              └──────────── REST ───────────────┘
                                                │
                                              Prisma
                                                │
                                                ▼
                                           PostgreSQL
```

Optional:

``` text
                         PostgreSQL
                              │
                              ▼
                       Leaderboard Service
                              │
                              ▼
                          Socket.IO
                              │
                              ▼
                       Connected Players
```

------------------------------------------------------------------------

# 134. The Core Engineering Story

When presenting the project, keep returning to these principles:

### 1. Fast interaction

Clicks happen locally so the game feels instant.

### 2. Server authority

The backend controls game sessions, ownership, expiry, and persistence.

### 3. Relational integrity

PostgreSQL + Prisma models users, games, and scores cleanly.

### 4. Efficient rankings

Leaderboards use aggregation, indexes, ranking functions, and
pagination.

### 5. Security

Authentication, authorization, validation, hashing, rate limiting, and
constraints prevent obvious abuse.

### 6. Maintainability

Controllers, services, repositories, validation, and frontend services
keep responsibilities separated.

### 7. Practical engineering

Avoid unnecessary infrastructure until scale actually requires it.

------------------------------------------------------------------------

# 135. Recommended Build Strategy

If time is limited, use this priority order:

``` text
Priority 1
──────────
Authentication
Game
Score persistence
Database
Basic leaderboard

Priority 2
──────────
Daily leaderboard
Weekly leaderboard
Profile
History

Priority 3
──────────
Validation
Rate limiting
Tests
Error handling
Responsive UX

Priority 4
──────────
Animations
Personal best
CPS

Priority 5
──────────
Real-time leaderboard
Advanced anti-cheat
Multiple modes
CI/CD
```

Do not sacrifice the core system for bonus features.

------------------------------------------------------------------------

# 136. Final Advice

The strongest version of this assignment is not necessarily the one with
the most features.

It is the one where an evaluator can inspect the repository and
conclude:

``` text
"This developer understands frontend state,
backend architecture, database modeling,
authentication, API design, security,
performance, and trade-offs."
```

The project should therefore prioritize:

``` text
Correctness
   >
Security
   >
Architecture
   >
UX
   >
Performance
   >
Bonus features
```

Once the core implementation is solid, polish the UI and add one or two
meaningful bonuses.

------------------------------------------------------------------------

# 137. Personal Working Checklist

Use this section as the actual development tracker.

## Setup

``` text
[ ] Create GitHub repository
[ ] Initialize client
[ ] Initialize server
[ ] Configure TypeScript
[ ] Configure ESLint
[ ] Configure Prettier
[ ] Configure Tailwind
[ ] Configure shadcn/ui
[ ] Configure PostgreSQL
[ ] Configure Docker
[ ] Configure Prisma
[ ] Create .env.example
```

## Authentication

``` text
[ ] User model
[ ] Register API
[ ] Login API
[ ] Password hashing
[ ] JWT
[ ] Auth middleware
[ ] Current-user API
[ ] Login UI
[ ] Register UI
[ ] Logout
```

## Game

``` text
[ ] Game model
[ ] Start API
[ ] Active game API
[ ] Game UI
[ ] Countdown
[ ] 60-second timer
[ ] Click counter
[ ] CPS
[ ] Finish API
[ ] Score model
[ ] Transaction
[ ] Duplicate protection
```

## Leaderboard

``` text
[ ] Global API
[ ] Daily API
[ ] Weekly API
[ ] Ranking
[ ] Pagination
[ ] Leaderboard UI
[ ] Current-user highlighting
```

## Profile

``` text
[ ] Profile API
[ ] Stats API
[ ] History API
[ ] Profile UI
[ ] Game history UI
```

## Security

``` text
[ ] Zod
[ ] Rate limiting
[ ] CORS
[ ] Ownership checks
[ ] Password security
[ ] JWT security
[ ] Environment variables
```

## Quality

``` text
[ ] Error middleware
[ ] Loading states
[ ] Error states
[ ] Empty states
[ ] Responsive design
[ ] Accessibility
[ ] Unit tests
[ ] Integration tests
```

## Bonus

``` text
[ ] Click animations
[ ] Personal best
[ ] Real-time leaderboard
[ ] Multiple game mode
```

## Deployment

``` text
[ ] Production DB
[ ] Backend deployment
[ ] Frontend deployment
[ ] Production migrations
[ ] CORS
[ ] Environment variables
[ ] HTTPS
[ ] Test production
```

## Submission

``` text
[ ] README
[ ] Architecture diagram
[ ] Database schema
[ ] API documentation
[ ] GitHub cleanup
[ ] Demo video
[ ] Live URL
[ ] Final QA
```

------------------------------------------------------------------------

# 138. End Goal

The completed ClickRush project should provide a simple user experience:

``` text
Register
   ↓
Login
   ↓
Play
   ↓
60 seconds of clicking
   ↓
Score
   ↓
Rank
   ↓
Leaderboard
   ↓
Profile / History
```

while internally demonstrating:

``` text
React
   +
TypeScript
   +
Express
   +
JWT
   +
Zod
   +
Prisma
   +
PostgreSQL
   +
REST APIs
   +
Transactions
   +
Indexes
   +
Testing
   +
Deployment
```

That combination is the core of the assignment.

------------------------------------------------------------------------

# 139. Final Principle

Build the simplest system that is:

``` text
Correct
Secure
Maintainable
Testable
Responsive
Explainable
```

Then add complexity only when it creates a clear product or engineering
benefit.

**Do not optimize for the number of technologies. Optimize for the
quality of the engineering decisions.**
