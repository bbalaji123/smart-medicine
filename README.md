# 🏥 Smart Medicine Reminder App

A comprehensive medication management and health tracking application built with React and Node.js.

[![Deploy to Render](https://img.shields.io/badge/Deploy%20to-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://dashboard.render.com/select-repo)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)

## ✨ Features

### 💊 Medication Management
- Track medications with dosage, frequency, and schedules
- Set custom reminders for medication times
- Medication refill tracking and alerts
- Search medication database
- View medication history

### 📊 Health Tracking
- Record vital health metrics (blood pressure, glucose, weight, etc.)
- Health journal for daily observations
- Visual analytics and trend charts
- Export health data

### 👥 Caregiver Support
- Manage multiple care recipients
- Emergency contact management
- Share health information securely
- Caregiver dashboard with overview

### 🎮 Gamification
- Achievement system for medication adherence
- Progress tracking and streaks
- Motivational rewards

### 🔐 Security & Privacy
- Secure authentication with JWT
- Password hashing with bcrypt
- Rate limiting protection
- CORS security
- Data encryption

## 🚀 Quick Deploy to Render

### Prerequisites
1. [GitHub account](https://github.com) with your code
2. [Render account](https://render.com) (free tier available)
3. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

### One-Click Deployment

1. **Set up MongoDB Atlas**:
   ```
   → Create free cluster
   → Get connection string
   → Whitelist all IPs (0.0.0.0/0)
   ```

2. **Deploy to Render**:
   ```
   → Go to dashboard.render.com
   → Click "New" → "Blueprint"
   → Connect your GitHub repo
   → Click "Apply"
   → Wait 5-10 minutes
   ```

3. **Add MongoDB URI**:
   ```
   → Go to backend service
   → Click "Environment"
   → Add MONGODB_URI variable
   → Save (auto-redeploys)
   ```

4. **Done!** 🎉
   - Backend: `https://your-app-backend.onrender.com`
   - Frontend: `https://your-app-frontend.onrender.com`

📖 **Detailed Instructions**: See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) | 5-minute deployment guide |
| [RENDER_DEPLOYMENT_CHECKLIST.md](./RENDER_DEPLOYMENT_CHECKLIST.md) | Step-by-step checklist |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Comprehensive deployment guide |
| [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) | Deployment package overview |

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Framer Motion** - Animations

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **CORS** - Cross-origin resource sharing

## 💻 Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd smart-medicine
   ```

2. **Backend setup**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI
   npm install
   npm run dev
   ```
   Server runs on: `http://localhost:5001`

3. **Frontend setup** (new terminal):
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with backend URL
   npm install
   npm start
   ```
   App runs on: `http://localhost:3000`

### Verify Setup
```bash
# Run from project root
node verify-deployment.js
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Medications
- `GET /api/medications` - List medications
- `POST /api/medications` - Add medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication
- `GET /api/medication-search` - Search medications

### Health Tracking
- `GET /api/health` - Get health entries
- `POST /api/health` - Add health entry
- `PUT /api/health/:id` - Update entry
- `DELETE /api/health/:id` - Delete entry

### Care Recipients
- `GET /api/care-recipients` - List recipients
- `POST /api/care-recipients` - Add recipient
- `PUT /api/care-recipients/:id` - Update recipient
- `DELETE /api/care-recipients/:id` - Delete recipient

### Emergency Contacts
- `GET /api/emergency-contacts` - List contacts
- `POST /api/emergency-contacts` - Add contact
- `PUT /api/emergency-contacts/:id` - Update contact
- `DELETE /api/emergency-contacts/:id` - Delete contact

## 📱 Features in Detail

### User Roles
- **Patient** - Manage own medications and health
- **Caregiver** - Manage multiple care recipients

### Medication Reminders
- Custom scheduling (daily, weekly, specific times)
- Multiple doses per day
- Refill reminders
- Medication history

### Health Metrics
- Blood Pressure
- Blood Glucose
- Weight
- Heart Rate
- Temperature
- Custom metrics

### Analytics
- Visual charts and graphs
- Trend analysis
- Adherence tracking
- Health insights

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Rate limiting (1000 requests/15min)
- CORS protection
- Helmet security headers
- Input validation
- Account lockout after failed attempts
- Secure session management

## 🐛 Troubleshooting

### Common Issues

**API not connecting?**
- Check `REACT_APP_API_URL` has `/api` suffix
- Verify backend is running
- Check CORS settings

**MongoDB connection failed?**
- Verify connection string
- Check IP whitelist (0.0.0.0/0)
- Ensure database name in connection string

**Build failures?**
- Clear node_modules and reinstall
- Check Node.js version (18+)
- Review error logs in Render dashboard

**Services sleeping (Render free tier)?**
- Expected behavior after 15 min inactivity
- First request takes 30-60 seconds
- Consider upgrading or using uptime monitor

## 📝 Environment Variables

### Backend (.env)
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://your-frontend.onrender.com
CLIENT_URL=https://your-frontend.onrender.com
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

See `.env.example` files for complete list.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👏 Acknowledgments

- Icons by [Heroicons](https://heroicons.com/)
- UI components by [Headless UI](https://headlessui.com/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

- **Documentation**: Check the docs folder
- **Issues**: Open an issue on GitHub
- **Render Support**: [render.com/docs](https://render.com/docs)
- **MongoDB Support**: [mongodb.com/docs](https://mongodb.com/docs)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Doctor appointments integration
- [ ] Pharmacy integration
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline mode
- [ ] Export to PDF
- [ ] Integration with health devices

---

**Built with ❤️ for better medication management**

[![Deploy Now](https://img.shields.io/badge/Deploy%20Now-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://dashboard.render.com/select-repo)
