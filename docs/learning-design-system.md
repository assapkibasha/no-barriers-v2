# Local learning interface

Status: approved by the user on 14 October 2026 as the design direction for the new learning system. Future implementation should extend this interface and its interaction structure. The learning system remains local until separately authorised for publication.

Approved identity: V1 teal #007f80, hover #006769, navy #0d2344, text #25272f, muted #5b606a, surface #f5f5f5 and selected #e4f2ed. Public website styling remains independent.

Geist Sans is the shared learning typeface. Body 15px, explanatory copy 14px, captions 12–13px, section headings 21px and page headings 28–38px. Touch controls are at least 44px high. Cards use 14px corners; controls use 8–10px corners. Spacing uses an 8px base with 12px gaps where appropriate.

The primary learning action is teal. Selection uses a mint surface plus a check indicator. Success and error always have explanatory text. Keyboard focus uses the existing amber focus token. Lesson UI remains borderless.

The dashboard opens a single lesson activity: animation stage, practice, course navigation and subdued community information. The player stage scales with the viewport, with overflow available at smaller heights and zoom. No fixed-height clipping.

Progress and profile changes are browser-local. Lessons start uncompleted and unlock in order. One sample practice question demonstrates the UI; real animation assets and assessment content are pending. Certificates show an empty state until issuance is implemented. Studio access is a separate preview under profile, not an administrator permission system.

Implementation: src/app/learning-system.tsx and learning-system.module.css. No changes were pushed to GitHub in this pass.
