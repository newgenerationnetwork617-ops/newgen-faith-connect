# Phone-ready NGN app upgrade

## What I’ll build

- Add phone installation support using the NGN logo as the home-screen icon, with correct app name, colors, and launch behavior.
- Keep this install setup lightweight and safe for Lovable preview; offline Bible chapters will continue using the reader’s local chapter cache rather than a service worker.
- Repair Bible loading for all 66 books, especially Obadiah, Philemon, 2 John, 3 John, and Jude, by normalizing one-chapter references and validating that responses contain complete, ordered verse sets before caching them.
- Improve Bible navigation so one-chapter books open directly and Previous/Next correctly crosses book boundaries.
- Give Today’s Devotional a permanent, prominent home-page area, including a polished empty state when the team has not published one yet.
- Refine the overall interface around the NGN logo: cleaner royal blue, cyan, white, and restrained gold accents; stronger typography; tighter cards; and more consistent phone spacing.
- Refresh the devotional reading page with a mature cover treatment, clearer scripture/reflection/application/prayer sections, reliable save/share feedback, and graceful empty/loading states.
- Verify the install metadata, Bible one-chapter books, home page, devotional page, dark mode, and phone-sized layout in the running app.

## Mobile conversion and GitHub readiness

- This stage produces an installable web app that can be added to an Android or iPhone home screen.
- The code remains standard and GitHub-ready, with install assets committed alongside the app.
- A later App Store/Play Store package can wrap this same project with Capacitor; store signing, native project files, and store submission are intentionally separate from this web-install stage.

## Technical details

- Add a standards-based web app manifest and multiple NGN icon sizes; link them through the root document metadata.
- Do not add an app-shell service worker because offline mode was not requested; this avoids stale previews and unnecessary caching issues.
- Add source-specific Bible reference aliases and response-integrity checks, then use the backup provider whenever the primary result is empty, malformed, or incomplete.
- Preserve the existing content backend and admin workflow.
