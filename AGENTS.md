# Project Design Principles

- **High-contrast minimalist** — no rounded edges on cards, buttons, hover-cards, popovers, or list items. The only exception is the Avatar component which retains `rounded-full`.
- **Tailwind CSS v4** — uses `@import "tailwindcss"` in globals.css, CSS-first config with `@theme`, no `tailwind.config.js`.
- **PostCSS pipeline** — requires `@tailwindcss/postcss` + `postcss` for Tailwind processing. No `autoprefixer`, `postcss-import`, or `postcss-preset-env`.
