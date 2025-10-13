# Smart Medicine Frontend

This is the React frontend application for the Smart Medicine Reminder App.

## Features

- 🔐 User authentication (login/signup)
- 💊 Medication management dashboard
- 📅 Medication scheduling and reminders
- 📊 Adherence tracking and analytics
- 👤 User profile management
- 🎮 Gamification with achievements and streaks
- 📱 Responsive design with Tailwind CSS

## Tech Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling and responsive design
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **Axios** - API communication
- **React Router** - Navigation
- **Heroicons** - Icon library

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Configuration

Create a `.env` file in the frontend directory with:

```
REACT_APP_API_URL=http://localhost:5001/api
```

## Project Structure

```
frontend/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout/       # App layout components
│   │   ├── Gamification/ # Achievement system
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Auth/         # Login/Signup pages
│   │   ├── Dashboard/    # Main dashboard
│   │   ├── Profile/      # User profile
│   │   ├── Medications/  # Medication management
│   │   └── ...
│   ├── contexts/         # React contexts (AuthContext)
│   ├── services/         # API services
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Integration

The frontend communicates with the backend API at `http://localhost:5001/api` with the following endpoints:

- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `GET /medications` - Get user medications
- `POST /medications` - Add new medication
- And more...

## Styling

The app uses Tailwind CSS for styling with a custom design system:

- Primary colors: Medical blue/teal theme
- Responsive breakpoints for mobile, tablet, desktop
- Custom components for consistent UI
- Dark mode support (coming soon)

## Authentication Flow

1. User visits login/signup page
2. Form submission sends API request to backend
3. Backend returns JWT token and user data
4. Token stored in localStorage
5. AuthContext provides user state throughout app
6. Protected routes require authentication

## Development Notes

- All API calls go through the `services/api.ts` file
- Authentication state managed by `contexts/AuthContext.tsx`
- Routes protected by `components/ProtectedRoute.tsx`
- Form validation using React Hook Form + Yup
- Responsive design with mobile-first approach