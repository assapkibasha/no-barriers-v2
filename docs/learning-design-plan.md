# Learning system implementation plan

Scope: local prototype only. Preserve the approved V1 palette, dashboard cards, enlarged animation area, integrated question, and borderless lesson surface.

1. Establish shared type, spacing, surface, button and state tokens in a scoped learning stylesheet. Remove obsolete learning CSS from active use.
2. Use one lesson screen. Lesson selection determines its heading and content. Reserve an honest animation placeholder until approved assets arrive.
3. Connect sample practice selection, retry, feedback, completion, next-step unlocking and browser-local persistence. Identify sample practice as a preview.
4. Give learner navigation working dashboard, profile and certificate destinations. Separate the course-studio preview from learner navigation.
5. Calculate course totals from the lesson data, distinguish lesson status from course progress, and make course navigation interactive.
6. Keep readable text and touch targets. Use a responsive player size and allow overflow recovery on shorter windows instead of clipping content.
7. Verify TypeScript, lint and production compilation; inspect desktop and mobile when browser access permits.

Outside this pass: authentication, backend accounts, real followers, animation production, official assessment content and certificate issuance.

Implementation status: steps 1–6 complete. The local preview is available directly at /learning. Step 7: lint, TypeScript and production build pass. Browser visual and interaction verification remains outstanding because the browser tool blocked access to the local preview in this session; compilation is not an end-to-end interaction test.
