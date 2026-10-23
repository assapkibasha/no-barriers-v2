# No Barriers landing page: first structural pass

The supplied Khan Academy screenshots govern the layout. No additional marketing sections are added. Copy is provisional and based on the existing Rwandan Sign Language learning prototype. The forthcoming specification will supply approved content, imagery, actual course catalog, supporter identities, stories, and policy text.

## Section map

| Order | Reference | Implementation |
| --- | --- | --- |
| 1 | Image 8 | Navigation, centered original logo, search, two-column hero with learner collage and three signup choices |
| 2 | Images 9 and 7 | Light-gray course directory, two columns, expanded category groups, two-column topic links |
| 3 | Image 11 | Centered heading and three open benefits columns |
| 4 | Image 10 | Educator section: image left, copy and button right |
| 5 | Image 6 | Learner section: copy and button left, image right |
| 6 | Image 5 | Full-width gray statement area, attribution position lower right; brand statement until a real testimonial is supplied |
| 7 | Image 4 | Inclusion section: image left, copy and button right |
| 8 | Image 3 | Centered join heading and four stacked buttons |
| 9 | Image 2 | Supporter band with eight reserved positions; no unconfirmed logos |
| 10 | Images 2 and 1 | Dark multi-column footer, language/program information and policy positions |

## Design decisions and reference analysis

- Reading: accessible education landing page with spacious editorial composition. DESIGN_VARIANCE 3, MOTION_INTENSITY 2, VISUAL_DENSITY 4. Native CSS Modules and existing Tabler icons, no new UI package.
- User references override skill defaults concerning serif headings, repeated split sections, three benefit columns, a light page with dark footer, and the directory's content density.
- Header: compact horizontal grid, logo centered independently of side widths. Search and optional purpose link collapse on small screens.
- Hero: headline/body and collage on left, role choices right. Generated draft's extra divider, icons, excessive headline size and invented logo are omitted to retain the user's reference.
- Directory: groups divided by sparse hairlines; native details/summary provides keyboard-accessible disclosure. Search filters real provisional topics. Unlike the generated comp, category headings are sans-serif and links retain the reference's quiet dark text.
- Benefits: 3 equal open columns, small symbolic illustrations from the existing icon family, serif subheads. Keep icons smaller than generated reference to match the supplied screenshot.
- Educator and learner blocks: balanced columns, broad spacing, restrained rectangular teal buttons. Body copy about 19px and section headings about 46px at laptop sizes.
- Statement: wide readable serif paragraph and brand attribution; no fabricated learner name, quotation, outcome or testimonial.
- Inclusion: same split pattern and brand colors, no unsupported donation or nonprofit claims.
- Join: four equal-width stacked actions, modest corners and a single ring motif.
- Supporters: reserved 4-by-2 layout with explanatory text. Replace with approved logo files and links later.
- Footer: navy, muted blue mission copy, three navigation columns. No false app-store or social accounts. Unpublished policies open explicit informational dialogs.
- Mobile: one column, image before feature copy, stacked benefit items, two-column supporter positions, collapsible navigation. No automatic animation; focus and hover states only.

## Assets and scope

Original logo: `public/no barriers logo.jpeg` (unchanged).
Provisional generated artwork: `public/landing/community.webp`, `learner.webp`, `inclusion.webp`. Artwork is illustrative, not real participant evidence or sign-language teaching material. Replace from the approved brief.
Ten separate reference images are saved in `docs/landing-references/`. All image generation used the built-in image tool. Prompt set is recorded alongside this document.

The existing login, registration and learning prototype remains. Signup audience is passed to registration for context; this does not create a distinct educator/family backend. Authentication and course completion remain existing prototype behavior.

## Next content pass

Confirm audiences and courses; replace provisional copy and pictures; supply consented testimonial and supporter logos; confirm certificate rules and policy documents; connect production signup and course destinations.
