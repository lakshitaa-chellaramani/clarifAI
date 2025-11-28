# ClarifAI Frontend

A professional Next.js 14 dashboard for the ClarifAI misinformation detection system.

## Features

- **Command Center Dashboard** - Real-time monitoring of misinformation topics
- **Knowledge Graph Visualization** - Interactive graph showing entities, claims, and relationships
- **Source Credibility Panel** - Trust scores for news sources
- **Live Claim Feed** - Real-time verification status of claims
- **AI News Anchor Studio** - Generate and watch verified news briefings
- **Topic Deep Dive** - Detailed timeline and analysis for each topic
- **Analytics Dashboard** - System performance metrics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Theming**: next-themes (dark/light mode)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd clarifai-frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Command center
│   ├── topics/            # Topics list and detail
│   ├── anchor/            # AI news anchor studio
│   └── analytics/         # Analytics dashboard
├── components/
│   ├── ui/                # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   └── live-indicator.tsx
│   ├── layout/            # Layout components
│   │   ├── navbar.tsx
│   │   └── sidebar.tsx
│   └── dashboard/         # Dashboard-specific components
│       ├── stats-card.tsx
│       ├── credibility-panel.tsx
│       ├── claim-feed.tsx
│       ├── anchor-panel.tsx
│       └── knowledge-graph.tsx
├── lib/
│   └── utils.ts           # Utility functions
└── data/
    └── demo-data.ts       # Demo data for the UI
```

## Color Scheme

The UI uses a minimal 2-3 color palette:

- **Primary**: Blue (`#3b82f6`) - Trust, technology
- **Success**: Green - Verified claims
- **Warning**: Amber - Conflicts, uncertain
- **Danger**: Red - False claims, high risk

## Dark/Light Mode

The app supports both dark and light modes via `next-themes`. Toggle using the sun/moon icon in the navbar.

## Connecting to Backend

To connect to your Python backend:

1. Create API routes in `src/app/api/`
2. Update the data fetching in dashboard components
3. Replace demo data imports with API calls

Example API route (`src/app/api/topics/route.ts`):

```typescript
export async function GET() {
  const response = await fetch('http://localhost:8000/api/topics');
  const data = await response.json();
  return Response.json(data);
}
```

## Integrating News Anchor

To embed your news-anchor-pro system:

1. Start the news anchor server: `python -m http.server 8000`
2. Uncomment the iframe in `anchor-panel.tsx` or `anchor/page.tsx`
3. Update the iframe src to match your server URL

## License

MIT
