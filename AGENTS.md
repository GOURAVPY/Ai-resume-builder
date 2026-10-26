<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI rules

All UI is built by the frontend developer. Every new or changed screen must use these three component libraries instead of hand-written components:

| Library | Use it for |
| --- | --- |
| **shadcn/ui** (ui.shadcn.com) | The base: buttons, inputs, forms, dialogs, dropdown menus, tabs, sidebar, data tables, command palette, toasts, skeleton loaders. Theme it with the Material 3 colour tokens in `src/app/globals.css`. |
| **Mantine** (mantine.dev) | What shadcn/ui doesn't cover: file dropzones (`@mantine/dropzone`), Spotlight search (`@mantine/spotlight`), date pickers, rich text editing. |
| **Tremor** (tremor.so) | Dashboards and stats: stat cards, charts, progress bars, bar lists. |

- Pick shadcn/ui first; use Mantine or Tremor only for what shadcn/ui doesn't provide.
- Keep the Material 3 look: colours, Roboto font and Material Symbols icons stay as they are.
- Backend work (API routes, database, auth, AI) doesn't touch UI components.
