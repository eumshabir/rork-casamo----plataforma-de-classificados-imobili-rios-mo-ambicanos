# CasaMoc - Real Estate App

## Supabase Setup

To set up the Supabase database for this project, follow these steps:

1. Log in to your Supabase account and go to your project dashboard.

2. Go to the SQL Editor and run the SQL script from `sql/supabase-setup.sql` to create all the necessary tables, functions, and policies.

3. Make sure your Supabase URL and anon key are correctly set in the `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL="https://yrlocxrtmrjkcrolamoj.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlybG9jeHJ0bXJqa2Nyb2xhbW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjEwNzEsImV4cCI6MjA2NTQ5NzA3MX0.1mpSZAvNb5MtGwHFZEg31kYsfkRZaRYmdg1bAeqTsrI"
```

4. Configure authentication providers in Supabase:
   - Go to Authentication > Providers
   - Enable Email/Password authentication
   - Configure Google and Facebook OAuth if needed

5. Set up storage buckets:
   - Go to Storage > Buckets
   - Create a new bucket named "property-images"
   - Set the appropriate permissions

## Development

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Start the development server:
```bash
npm start
# or
yarn start
```

3. Run on iOS or Android:
```bash
npm run ios
# or
npm run android
```

## Project Structure

- `/app` - Expo Router screens and layouts
- `/components` - Reusable UI components
- `/constants` - App constants and configuration
- `/hooks` - Custom React hooks
- `/lib` - Utility libraries (Supabase, tRPC)
- `/mocks` - Mock data for development
- `/services` - API services and data fetching
- `/store` - State management with Zustand
- `/styles` - Shared styles
- `/types` - TypeScript type definitions
- `/backend` - Backend API with tRPC and Hono
- `/sql` - SQL scripts for database setup

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database URL for Prisma
DATABASE_URL="postgresql://username:password@localhost:5432/casamoc?schema=public"

# JWT Secret for authentication
JWT_SECRET="your-secret-key-here"

# API Base URL
EXPO_PUBLIC_API_BASE_URL="http://localhost:3000"
EXPO_PUBLIC_RORK_API_BASE_URL="http://localhost:3000"

# Supabase credentials
EXPO_PUBLIC_SUPABASE_URL="https://yrlocxrtmrjkcrolamoj.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlybG9jeHJ0bXJqa2Nyb2xhbW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjEwNzEsImV4cCI6MjA2NTQ5NzA3MX0.1mpSZAvNb5MtGwHFZEg31kYsfkRZaRYmdg1bAeqTsrI"

# Payment API credentials (for production)
MPESA_API_KEY="your-mpesa-api-key"
MPESA_API_SECRET="your-mpesa-api-secret"
MPESA_SERVICE_PROVIDER_CODE="your-service-provider-code"
EMOLA_API_KEY="your-emola-api-key"
EMOLA_API_SECRET="your-emola-api-secret"
EMOLA_MERCHANT_ID="your-merchant-id"

# File storage (for production)
S3_ACCESS_KEY="your-s3-access-key"
S3_SECRET_KEY="your-s3-secret-key"
S3_BUCKET_NAME="your-bucket-name"
S3_REGION="your-region"
```