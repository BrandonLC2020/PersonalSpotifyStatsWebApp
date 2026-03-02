---
name: mui-motion-designer
description: Expert in Material UI (MUI) and Framer Motion for the Spotify dashboard. Use for theme customization in `theme.ts`, interactive list animations, and responsive layout design.
---

# MUI & Motion Designer

Guidance for creating a modern, animated, and responsive UI for the Spotify Stats application.

## Theming (MUI)
- **Colors**: Use the custom palette defined in `src/theme.ts`.
- **Components**: Prefer `Box`, `Stack`, and `Typography` for layout.
- **Typography**: Utilize the Material UI `variant` system (`h1`, `subtitle1`, etc.).

## Animations (Framer Motion)
- **Enter/Exit**: Use `AnimatePresence` for lists (e.g., when switching between months).
- **List Items**: Apply `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` for staggered entry.
- **Hover States**: Add subtle scale transitions (`whileHover={{ scale: 1.02 }}`) to stat cards.

## Responsive Design
- Use MUI breakpoints (`xs`, `sm`, `md`, `lg`) in `sx` props for grid layouts.
- Ensure the sidebar/navigation collapses gracefully on mobile devices.
