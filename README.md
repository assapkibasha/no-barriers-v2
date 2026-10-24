# No Barriers — Rwandan Sign Language learning

Next.js 16 app with MongoDB accounts, a Duolingo-style course, and a 3D signing avatar.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and set `MONGODB_URI` (MongoDB Atlas) and `ADMIN_EMAILS`.
3. `npm run dev`, open http://localhost:3000, create an account.

Indexes are created automatically on first connection.

| Route | Who | What |
| --- | --- | --- |
| `/` | everyone | Landing page |
| `/register`, `/login` | everyone | Accounts (email + password) |
| `/learn` | learners | Dashboard: course, streak, XP, profile, certificates |
| `/learn/[lessonId]` | learners | Lesson player |
| `/admin` | admins | Monitoring: accounts, activity, per-learner progress |
| `/studio/signs` | admins (open in development) | Preview every sign and any sequence |

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

## Checks

- `npx tsc --noEmit`, `npm run lint`, `npm run build`
- `npm test` — learning rules and course integrity tests
