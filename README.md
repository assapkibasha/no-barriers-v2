# No Barriers

An e-learning platform for **Rwandan Sign Language**, built so learners, families and educators can take part in more inclusive conversations, one lesson at a time. It has accounts stored in MongoDB, a Duolingo-style course and a 3D signing avatar.

This repository is the v2 rebuild. The original site lives at [assapkibasha/no-barriers](https://github.com/assapkibasha/no-barriers).

![No Barriers landing page](docs/landing-preview.jpg)

## Getting started

Requires Node.js 22 or newer and a MongoDB Atlas database (the free tier is enough).

1. `npm install`
2. Copy `.env.example` to `.env.local` and set `MONGODB_URI` and `ADMIN_EMAILS`.
3. `npm run dev`, open [http://localhost:3000](http://localhost:3000) and create an account.

Indexes are created automatically on first connection.

## Routes

| Route | Who | What |
| --- | --- | --- |
| `/` | everyone | Landing page |
| `/login`, `/register` | everyone | Accounts (email + password); `/register?role=Educator` preselects a role |
| `/learn` | learners | Dashboard: course, next lesson, streak and XP |
| `/learn/[lessonId]` | learners | Lesson player, e.g. `/learn/u1-l1` (locked until the previous lesson is complete) |
| `/profile`, `/certificates` | learners | Settings and stats; certificate progress per level |
| `/admin` | admins | Monitoring: accounts, activity, per-learner progress |
| `/studio/signs` | admins (open in development) | Preview every sign and any sequence |

## Project structure

```
src/
  app/
    page.tsx                 Landing page route
    (auth)/                  /login and /register
    (workspace)/             /learn, /profile, /certificates: signed-in pages sharing the workspace shell
    (lesson)/learn/[lessonId]/  Full-screen lesson player
    admin/, studio/signs/    Administrator pages
    actions/                 Server actions: auth and learning
  components/
    landing/                 Landing page
    auth/                    Sign-in / registration form
    workspace/               Workspace shell and screens
    SignStage.tsx            3D signing avatar
  lib/
    audiences.ts             Learner / Family / Educator roles
    course/                  Curriculum, exercises, sign lexicon
    learning/rules.ts        Lesson completion rules: animations, answers, hearts, XP
    server/                  MongoDB, sessions, course progress (server only)
    signing/                 Signing engine and sign definitions
tests/                       Learning rules and course integrity tests
docs/                        Design references, theme, planning and animation status
```

## Data (MongoDB)

- `users` — profile, role, XP, daily streak (Rwanda time), left-handed setting, login lockout counters. Passwords are scrypt hashes.
- `sessions` — opaque session tokens; only a SHA-256 hash is stored. Expire after 30 days (TTL index).
- `progress` — one document per learner and lesson: hearts, watched animations, correct answers, attempts, mistakes.
- `events` — activity log for monitoring (sign-ups, sign-ins, answers, completions). Kept 400 days.

Answers are checked on the server (`src/app/actions/learning.ts`) using the rules in `src/lib/learning/rules.ts`; the browser never receives the answer key and cannot award itself XP.

## Course

`src/lib/course/curriculum.ts` holds the full course: 19 units across Beginner, Intermediate and Advanced, guided by the REB *Teacher Training Manual on RSL* (2025). Lessons list their signs, fingerspelled words, numbers and phrases. `src/lib/course/exercises.ts` turns each lesson into steps deterministically: learn a sign → check it immediately → practise the other way round → spaced review of earlier signs → spelling, numbers, phrases. Missed questions return at the end; five hearts per attempt; at zero hearts the learner reviews the missed signs to refill.

Lessons without animated content show as "coming soon". Status: see `docs/sign-animation-status.md`.

## Signing avatar

- Model: `public/avatar/berthin.glb` (0.75 MB), converted from `Berthin.fbx` (45 MB) with FBX2glTF, then deduplicated, textures resized to 1024² WebP, geometry quantized and Meshopt-compressed.
- Engine: `src/lib/signing/`. Signs are **data, not baked clips**: a few keyframes per sign (handshape, body-relative location, palm and finger direction, arcs). At runtime: two-bone arm IK with natural elbow placement, clavicle and torso follow-through, forearm twist sharing, Hermite motion paths, handshapes that form slightly ahead of the movement, distance-timed coarticulated transitions between signs, and a procedural idle (breathing, weight shift, glances, finger settling).
- Physical realism, applied to every sign automatically:
  - Joint space (`solve.ts`, `track.ts`): the hand is driven the way the arm moves it — forearm rotation (thumb-up = 0°, about 100° toward palm-down, 95° toward palm-up), wrist bend and wrist tilt, each with human limits (`LIMITS`). Every in-between pose is a real joint position, so impossible turns and flips cannot happen. Finger and thumb joints are clamped too (`rig.ts`).
  - Elbow choice: when a sign is built, each key tries elbow positions around the shoulder–wrist line and keeps the one that keeps the forearm and wrist in range, the arm out of the body, the elbow low, and close to the previous key (`chooseElbow`).
  - Smooth motion: every channel is a spline that comes to rest at reversals (back-and-forth signs), and handshapes form slightly ahead of the movement.
  - Timing (`track.ts` `SPEED`, `compile.ts` `retime`): every movement lasts at least as long as a human hand needs for its distance, rotation and finger change (about 1 m/s, 400°/s, 500°/s per finger joint). Both hands share one time warp so contacts stay in sync. Transitions between signs and fingerspelled letters follow the same rule.
  - Collisions (`physics.ts`, `player.ts`): capsules for head, jaw, neck, chest, shoulders and belly; the other arm (upper arm, forearm) and the other hand are obstacles too. Hands are pushed out, elbows swing around the body, crossed forearms keep the dominant one in front, and paths that would cross bow around the other hand. Corrections follow their targets smoothly (fast when contact builds, slow when it releases) and the elbow swing is speed-limited, so motion never snaps.
  - Audit: `npm run audit:signs` plays every sign at 60 fps with `npm run dev` running and reports hand rotation speed, elbow speed, body overlap and forearm gaps.
- Camera: torso framing, drag to turn within ±60° (never behind the signer), no zoom or pan. The view stays where the learner leaves it and glides back to the front when the content changes (next sign, question or lesson); Replay keeps the angle.
- The engine (three.js) loads only on lesson pages, renders only while visible, and works with any Mixamo-rigged character.

### Adding a sign

1. Find the illustration in the manual.
2. Add it to the topic file in `src/lib/signing/signs/` (or create a topic and register it in `signs/index.ts` and `src/lib/course/lexicon.ts`). Use ids like `topic.word`.
3. Preview it at `/studio/signs`; drag the signer to check from the side; tick "Left-handed" to check mirroring.
4. Reference it from a lesson in `curriculum.ts`.

Key vocabulary (`types.ts`): `at` (body landmark or `other.<site>` on the other hand), `off` [out, up, forward] in metres, `site` (which part of the hand touches), `dir` (where the hand points), `palm` (where the palm faces), `arc`, `hold`, `flow`. Compound signs use `seq` (e.g. JANUARY = MONTH + 1).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check without emitting |
| `npm test` | Learning rules and course integrity tests (Node test runner) |
| `npm run audit:signs` | Physics audit of every sign (needs `npm run dev` running) |

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) and React 19, TypeScript
- MongoDB Atlas via the official `mongodb` driver; sessions and scrypt password hashing built in
- [three.js](https://threejs.org) for the signing avatar
- CSS Modules, with shared brand tokens in `src/app/globals.css`
- [Tabler Icons](https://tabler.io/icons)

## Contributing

Work happens on branches and is merged through pull requests. CI runs lint, typecheck, tests and a production build on every PR.
