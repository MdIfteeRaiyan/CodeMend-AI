# DebugTest v4 performance notes

The production frontend is built with Vite and currently produces an approximately **113 KB gzip JavaScript entry** and **22 KB gzip CSS entry**. Exact hashed filenames change with each build.

## Implemented safeguards

- Production-only plugin loading; development diagnostics are excluded from release builds.
- `content-visibility: auto` for below-the-fold product sections.
- Mobile blur removal to reduce GPU compositing cost.
- Transform/opacity-based entrance animation and limited shadow animation.
- Automatic reduced-motion behavior.
- No autoplay video, canvas renderer, or large background image.
- Local SVG branding and optimized PNG install icons.
- Responsive breakpoints at 1050px, 760px, and 480px.
- Dynamic viewport and safe-area support for modern Android and iOS browsers.

## Recommended production checks

After deployment, run Lighthouse in an incognito Chrome window for Mobile and Desktop. Test at 360×800, 390×844, 768×1024, 1366×768, and 1920×1080. Confirm that the walkthrough, menu, editor, hint reveal, Test Studio, Focus view, and reduced-motion setting all work before announcing the release.
