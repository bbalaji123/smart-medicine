# Smart Medicine Backend

This is the backend server for the Smart Medicine Reminder App, providing authentication and medication management APIs with MongoDB integration.

## Features

- 🔐 User authentication (signup, login, profile management)
- 💊 Medication management (CRUD operations)
- 📊 Dose tracking and adherence calculation
- ⏰ Schedule management
- 🛡️ Security features (rate limiting, authentication middleware)
- 🗄️ MongoDB integration with Mongoose

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Medications
- `GET /api/medications` - Get all medications
- `POST /api/medications` - Add medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication
- `POST /api/medications/:id/dose` - Record dose taken
- `GET /api/medications/schedule/today` - Today's schedule

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- Account locking after failed attempts
- CORS protection