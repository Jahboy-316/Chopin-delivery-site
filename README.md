# Chopin Delivery Platform — Frontend

A modern, fast, and welcoming delivery platform frontend inspired by the clarity of **Uber Eats** and the local delivery friendliness of **Chowdeck**. Built with Next.js, JavaScript, Tailwind CSS v4, and Lucide React.

## Features

- **Welcoming UI & Brand**: Warm off-white canvas, vibrant Nigerian emerald green accents, coral badges, and smooth tactile buttons.
- **Role-Aware Dashboards**: Dedicated experiences for **Customer**, **Rider**, and **Admin**.
- **Live Delivery Tracking**: Milestone progress tracker, waypoints route map, and assigned rider cards.
- **Easy Order Creation**: Stepped pickup and drop-off inputs with visual payment method selection (Cash, Card, Transfer).
- **Rider Cockpit**: Instant online/offline availability switch, open job pool with one-click acceptance, and delivery status advancement (`ASSIGNED` &rarr; `PICKED_UP` &rarr; `IN_TRANSIT` &rarr; `DELIVERED`).
- **Admin Command Center**: Real-time KPI summary, rider allocation console, member access control, and transaction ledger.

## Environment Setup

Create or update `.env.local` inside the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

### 3. Run production build
```bash
npm run build
npm start
```

### 4. Run lint check
```bash
npm run lint
```

## Demo Accounts

For assessment and local testing, pre-configured accounts are provided on the login screen with quick-fill buttons:

- **Customer**: `customer@delivery.test` / `Delivery123!`
- **Rider**: `rider@delivery.test` / `Delivery123!`
- **Admin**: `admin@delivery.test` / `Delivery123!`
