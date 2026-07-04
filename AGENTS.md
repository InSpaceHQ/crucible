# Project Design Principles

- **High-contrast minimalist** — no rounded edges on cards, buttons, hover-cards, popovers, or list items. The only exception is the Avatar component which retains `rounded-full`.
- **Tailwind CSS v4** — uses `@import "tailwindcss"` in globals.css, CSS-first config with `@theme`, no `tailwind.config.js`.
- **PostCSS pipeline** — requires `@tailwindcss/postcss` + `postcss` for Tailwind processing. No `autoprefixer`, `postcss-import`, or `postcss-preset-env`.
- **Package manager: bun** — always use `bun add`, `bun install`, `bun run`, etc. Never use pnpm or npm. Vercel deployment auto-detects `bun.lock`.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Data Interfaces

Always read `ai/interfaces.md` before writing any data-access code (Convex
schema, queries, mutations) or frontend components that consume team/player
data. It is the single source of truth for all data shapes.
