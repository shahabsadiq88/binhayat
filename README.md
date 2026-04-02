# BIN HAYAT Electric Store - Shop Management System

A comprehensive tool for managing inventory, sales, and invoicing for an electric store.

## Features

- **Dashboard**: Real-time overview of daily, weekly, and monthly sales.
- **Inventory Management**: Track stock levels, add new products, and set low-stock alerts.
- **Sales & Invoicing**: Streamlined process for creating sales and generating automated invoices.
- **Sales History**: Detailed records of all transactions.
- **Reports**: Analytical reports to track business performance.

## Tech Stack

- **Frontend**: React 19, Vite
- **Authentication**: Firebase
- **Database**: Supabase
- **Routing**: React Router 7

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- Firebase and Supabase project credentials.

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in a `.env` file with the following keys:
   ```env
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Scripts

- `npm run dev`: Start Vite development server.
- `npm run build`: Build for production.
- `npm run lint`: Run ESLint.
- `npm run preview`: Preview production build.
