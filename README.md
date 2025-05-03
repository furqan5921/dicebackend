# Dice Raja Backend

This is the backend API for the Dice Raja gaming platform.

## Environment Configuration

The application uses environment variables for configuration. Create a `.env` file in the root of the backend directory with the following variables:

```
PORT=8080
MONGO_URI=mongodb://localhost:27017/dice_raja
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
JWT_EXPIRE=30d
```

A sample `.env.example` file is provided for reference.

## CORS Configuration

The server is configured to accept requests from the following origins:

- http://localhost:3000 (React development server)
- http://localhost:5173 (Vite development server)
- https://dice-raja.vercel.app (Production frontend)

These settings can be found in `server.js`.

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/register-gamer** - Register a new gamer (premium user)
- **POST /api/auth/login** - Login a user or gamer

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Start the development server: `npm run dev`
5. The API will be available at: http://localhost:8080

## Deployment

The backend is deployed on Render.com at: https://dice-raja-backend.onrender.com
