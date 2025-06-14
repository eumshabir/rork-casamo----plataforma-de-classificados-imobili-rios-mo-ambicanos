# CasaMoc - Real Estate App

CasaMoc is a real estate application for Mozambique, allowing users to list, search, and manage properties.

## Features

- User authentication (email/password, Google, Facebook)
- Property listings with images and details
- Search and filter properties
- Premium user subscriptions
- Property boosting
- Favorites and messaging
- M-Pesa and e-Mola payment integration

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- Expo CLI
- Supabase account

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update with your credentials:

```
# Supabase credentials
EXPO_PUBLIC_SUPABASE_URL="your-supabase-url"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# M-Pesa API credentials (for production)
MPESA_API_KEY="your-mpesa-api-key"
MPESA_API_SECRET="your-mpesa-api-secret"
MPESA_SERVICE_PROVIDER_CODE="your-service-provider-code"

# e-Mola API credentials (for production)
EMOLA_API_KEY="your-emola-api-key"
EMOLA_API_SECRET="your-emola-api-secret"
EMOLA_MERCHANT_ID="your-merchant-id"
```

### Supabase Setup

1. Create a new Supabase project
2. Go to SQL Editor in your Supabase dashboard
3. Run the SQL script from `sql/supabase-setup.sql` to create all necessary tables and policies
4. Create a storage bucket named `property-images` for property images

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Building for Production

```bash
# Build for Android
eas build -p android

# Build for iOS
eas build -p ios
```

## Project Structure

- `/app` - Expo Router screens
- `/components` - Reusable UI components
- `/constants` - App constants
- `/hooks` - Custom React hooks
- `/lib` - Utility libraries
- `/mocks` - Mock data (used as fallback)
- `/services` - API services
- `/store` - State management with Zustand
- `/types` - TypeScript type definitions

## Authentication

The app supports multiple authentication methods:

- Email and password
- Google OAuth
- Facebook OAuth
- Phone number verification

## Data Storage

All data is stored in Supabase with proper row-level security policies. The app falls back to mock data if Supabase is not available.

## Payment Integration

The app integrates with:

- M-Pesa for mobile payments
- e-Mola as an alternative payment method

## License

This project is proprietary and confidential.