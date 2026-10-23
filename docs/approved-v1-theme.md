# Approved V1 direction

The user selected the existing V1 layout and the current landing page colors.

- Preserve the landing section order and the V1 authentication, dashboard, lesson, certificate, and course-studio layouts.
- The app now always renders V1; the design-version picker is removed. Previous variant styles remain dormant to avoid an unrelated stylesheet rewrite.
- Shared color roles live in `src/app/globals.css`; the landing CSS consumes the same brand tokens.
- Teal `#007f80`: actions. Dark teal `#006769`: hover and selected text.
- White and light gray `#f5f5f5`: surfaces. Navy `#0d2344`: strong panels.
- Mint `#bfe2d5`: progress and accents. Charcoal `#25272f`: primary text.
- Existing prototype behavior, sample data, and pending backend work are unchanged.

This is a scoped palette pass, not a new layout or feature implementation.
