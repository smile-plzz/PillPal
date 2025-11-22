# Project Context

## Goals
- Develop a user-friendly web application for managing daily medication schedules.
- Features include medicine tracking, RxNav API integration, and PDF schedule generation.
- Emphasize simplicity, responsiveness, and local data persistence.

## Tech Stack
- **Framework**: Next.js (v16.0.1)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: LocalStorage (for persistence)
- **APIs**: RxNav API (for drug information)
- **Libraries**: jsPDF (PDF generation), date-fns, lucide-react, recharts

## Constraints
- Use `localStorage` for data persistence (no backend database mentioned initially, though Next.js is used).
- Responsive design for mobile and desktop.
- Offline support (PWA features mentioned in Changelog).
