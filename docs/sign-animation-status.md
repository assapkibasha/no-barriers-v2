# Sign animation status

Updated 24 October 2026. Source: REB *Teacher Training Manual on Rwandan Sign Language* (October 2025).

## Done — 166 signs (146 motions + 20 compounds), 34 ready lessons

| Topic | Manual pages | Signs | Course units |
| --- | --- | --- | --- |
| Fingerspelling A–Z | p.23 | 26 | Unit 2 |
| Numbers 0–10, THOUSAND (+ generated 11 to millions) | p.25 | 12 | Unit 3 |
| Greetings and conversation | p.35–36 | 13 | Units 1, 4 |
| Pointing pronouns, YES, NO | p.35, p.93 | 7 | Unit 1 |
| Time, days, months | p.27–33 | 43 | Units 4, 5 |
| Family | p.37–40 | 19 | Unit 6 |
| Food and drink | p.47–51 | 25 | Unit 7 |
| Clothes and colours | p.52–56 | 21 | Unit 8 |

All of Beginner is playable end to end. Systematic patterns from the book are encoded once and reused: weekdays (chin → day number), months (MONTH + number), numbers (11–19 = 10 + digit, larger numbers digit by digit, thousands with THOUSAND).

## To do — in course order

| Course unit | Manual pages | Approx. signs |
| --- | --- | --- |
| 9 School and classroom, subjects | p.41–46, 89–98 | 80 |
| 10 Places: village → province, 30 districts, countries | p.57–76 | 60 |
| 11 Work and roles | p.78–85 | 50 |
| 12 Everyday actions and feelings | p.90–97, 159–161 | 30 |
| 13 Building sentences | reuses earlier signs | — |
| 14–18 Maths, sciences, ICT, society, language, arts, activities | p.98–165 | 400 |
| 19 Stories and the national anthem | p.168–170 | composed from earlier signs |

Pages are rendered and reviewed one at a time against the avatar in `/studio/signs`. The sign for each district was read up to p.69 (Nyarugenge, Gasabo, Burera, Rulindo, Gakenke, Musanze, Sector, District, Province, Country, Kigali City, Kicukiro) but not yet written.

## Needs review by a Deaf RSL signer

The illustrations show handshape, start and end positions and arrows; some movements are ambiguous in a still image. These signs carry `review: true` and show "needs review" in the studio:

num.thousand, greet.good-chin, greet.name, time.morning, time.afternoon, time.seconds, time.age, time.late, time.date, time.schedule, time.before, family.sister, family.aunt, family.cousin, family.uncle, family.widow, family.marriage, food.beans, food.cabbage, food.mango, food.tomato, food.carrot, food.oil, food.wheat, food.groundnuts, food.beer, food.porridge, food.banana-juice, food.wine, clothes.uniform, color.blue, color.yellow, color.pink.

Also for review:

- Number composition beyond the book's examples (e.g. 25 signed as 2·5).
- Grammar notes in lesson introductions (time first, topic–comment, adjective after noun, question faces). They follow common sign-language structure; the manual does not describe RSL grammar in detail.
- Practice sentences in the curriculum (e.g. ME BROTHER 2 for "I have two brothers").

## Known limitations

- The character has no facial blend shapes, so facial grammar (eyebrows, mouth) is shown only through head and body movement (nods, shakes, tilts, leans). A character with ARKit-style blend shapes would allow full non-manual markers; the engine has a slot for it (`body.ts`).
- Sign definitions are tuned for this character's proportions (landmarks in `compile.ts`). A different character works, but the landmarks should be re-measured.
