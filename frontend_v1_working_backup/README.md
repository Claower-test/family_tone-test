# Family Tone

Web app for recording and sharing family stories as audio.

## Tech Stack

- **React 19** + **TypeScript 6** — UI and type safety
- **Vite 6** — Build tool and dev server
- **Tailwind CSS 4** — Utility-first styling
- **React Router 7** — Client-side routing
- **TanStack Query 5** — Server state management
- **Zustand 5** — Client state (auth, preferences)
- **Framer Motion 12** — Animations
- **Axios** — HTTP client
- **@iconify/react** — Icons (Solar set)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint
pnpm lint
```

## Project Structure

```
src/
├── app/                    # Routes and root component
│   ├── (landing)/          # Public landing page
│   ├── (auth)/             # Login, Register pages
│   └── (app)/              # Authenticated pages with shared layout
├── components/             # Reusable UI components
│   ├── ui/                 # Generic UI (Button, Input, Modal)
│   ├── record/             # Recording-specific components
│   └── layout/             # Nav, Sidebar, Footer
├── hooks/                  # Custom React hooks
├── services/               # API and audio services
├── stores/                 # Zustand stores
├── types/                  # TypeScript types (shared with mobile)
├── utils/                  # Pure utilities (shared with mobile)
└── tests/                  # Test files
```

## Environment Variables

| Variable       | Description          |
| -------------- | -------------------- |
| `VITE_API_URL` | Backend API base URL |
