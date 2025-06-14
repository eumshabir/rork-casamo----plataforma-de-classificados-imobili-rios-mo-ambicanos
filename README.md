# CasaMoc - Real Estate App for Mozambique

## Overview
CasaMoc is a real estate marketplace app for Mozambique, allowing users to buy, sell, and rent properties. The app includes features like property listings, user authentication, chat, payments via M-Pesa and e-Mola, and premium subscriptions.

## Tech Stack
- **Frontend**: React Native with Expo
- **Backend**: Node.js with tRPC and Hono
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth with email/password and phone verification
- **Payments**: M-Pesa and e-Mola integration (sandbox/mock for development)

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL database
- Yarn or npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/casamoc.git
cd casamoc
```

2. Install dependencies
```bash
yarn install
# or
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Edit the `.env` file with your database credentials and other configuration.

4. Set up the database
```bash
# Generate Prisma client
yarn db:generate
# or
npm run db:generate

# Push schema to database
yarn db:push
# or
npm run db:push
```

5. Start the development server
```bash
yarn start
# or
npm start
```

## Database Setup

The app uses PostgreSQL with Prisma ORM. To set up the database:

1. Create a PostgreSQL database
2. Update the `DATABASE_URL` in your `.env` file
3. Run the Prisma commands to set up the schema

```bash
# Generate Prisma client
yarn db:generate

# Push schema to database
yarn db:push

# (Optional) Open Prisma Studio to view/edit data
yarn db:studio
```

## Payment Integration

For development, the app uses mock payment processing. In production, you'll need to:

1. Register for M-Pesa API access at https://developer.mpesa.vm.co.mz/
2. Update the M-Pesa credentials in your `.env` file
3. For e-Mola, contact e-Mola directly for API access

## Deployment

### Backend Deployment
1. Set up a Node.js server (e.g., on Heroku, Digital Ocean, AWS)
2. Configure environment variables
3. Set up a PostgreSQL database
4. Deploy the backend code

### Mobile App Deployment
1. Build the app for production
```bash
expo build:android
expo build:ios
```

2. Submit to app stores
   - Google Play Store
   - Apple App Store

## Features

- User authentication (email/password, phone, social)
- Property listings with search and filters
- Chat between users
- Payments via M-Pesa and e-Mola
- Premium subscriptions
- Property boosting
- Favorites and saved searches
- Push notifications

## License
This project is proprietary and confidential.

## Contact
For questions or support, contact [your-email@example.com](mailto:your-email@example.com).