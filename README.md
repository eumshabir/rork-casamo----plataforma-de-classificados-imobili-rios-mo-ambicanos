# Real Estate App - Mozambique

A modern real estate application built with React Native, Expo, and tRPC for the Mozambican market.

## Features

- 🏠 Property listings (apartments, houses, land, commercial)
- 🔍 Advanced search and filtering
- 👤 User authentication and profiles
- ⭐ Premium user features
- 📱 Cross-platform (iOS, Android, Web)
- 🗄️ PostgreSQL database
- 🔐 JWT authentication
- 🚀 Production-ready backend

## Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Node.js, Hono, tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **State Management**: Zustand
- **Styling**: React Native StyleSheet

## Setup Instructions

### 1. Database Setup (PostgreSQL)

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a new database:
```sql
CREATE DATABASE real_estate_db;
```

#### Option B: Cloud PostgreSQL (Recommended for production)
Use services like:
- **Supabase** (Free tier available): https://supabase.com
- **Railway**: https://railway.app
- **Neon**: https://neon.tech
- **PlanetScale**: https://planetscale.com

### 2. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/real_estate_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
EXPO_PUBLIC_API_URL="https://your-production-api.com/api"
```

### 3. Database Migration

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Run database migrations:
```bash
npx prisma db push
```

4. (Optional) Seed the database:
```bash
npx prisma db seed
```

### 4. Development

Start the development server:
```bash
npm start
```

### 5. Production Deployment

#### Backend Deployment Options:
- **Vercel**: Deploy the `/backend` folder
- **Railway**: Connect your GitHub repo
- **Heroku**: Use the Heroku CLI
- **DigitalOcean App Platform**: Deploy from GitHub

#### Frontend Deployment:
- **Expo EAS Build**: For mobile app stores
- **Vercel/Netlify**: For web version

## Database Schema

The app uses the following main models:
- **User**: User accounts with authentication
- **Property**: Real estate listings
- **Conversation**: Chat between users
- **Message**: Individual chat messages
- **Notification**: Push notifications
- **Payment**: Payment history
- **Favorite**: User's favorite properties

## API Endpoints

The tRPC API provides the following routes:

### Authentication
- `auth.login` - User login
- `auth.register` - User registration

### Properties
- `property.getProperties` - Get all properties with filters
- `property.getFeaturedProperties` - Get featured properties
- `property.getUserProperties` - Get user's properties
- `property.getPropertyById` - Get property details
- `property.createProperty` - Create new property
- `property.updateProperty` - Update property
- `property.deleteProperty` - Delete property

### Users
- `user.getById` - Get user by ID
- `user.getUsers` - Get all users (admin only)
- `user.setPremium` - Set user premium status (admin only)

## Admin Features

To make a user an admin:
1. Connect to your database
2. Update the user's role:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Security Notes

- Always use strong JWT secrets in production
- Use HTTPS for all API endpoints
- Regularly update dependencies
- Implement rate limiting for production
- Use environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.