# PartyPlot Booker - Full Stack Party Venue Booking Platform

A modern, fully-featured party venue booking application built with the MERN stack (MongoDB, Express, React, Node.js) featuring real-time availability, interactive maps, rich animations, and a beautiful responsive UI.

## 🚀 Features

### For Guests
- **Discover Venues**: Browse 10,000+ verified party venues with detailed photos, amenities, and reviews
- **Smart Search**: Filter by location, price, capacity, amenities, dates, and more
- **Real-Time Availability**: Interactive calendar showing live availability with blocked/booked dates
- **Instant Booking**: Secure booking flow with payment processing and instant confirmation
- **Favorites**: Save venues to your favorites for easy access
- **Booking Management**: View, cancel, and communicate about your bookings
- **Reviews & Ratings**: Read verified reviews and rate your experiences

### For Venue Owners
- **Dashboard**: Complete venue management with analytics and revenue tracking
- **Venue Listings**: Create and manage venue listings with photos, amenities, and pricing
- **Booking Management**: Approve, reject, and manage incoming booking requests
- **Analytics**: Revenue reports, booking trends, and performance metrics
- **Communication**: Direct messaging with guests

### Technical Features
- **Rich Animations**: Framer Motion powered smooth animations throughout
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-Time Updates**: Socket.IO for live booking notifications
- **Geolocation**: Find venues near you with browser geolocation API
- **Interactive Maps**: Map-based venue discovery (Mapbox/Leaflet ready)
- **Type Safety**: Full TypeScript implementation
- **Modern Architecture**: Context API + Zustand for state management

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** - Authentication & Authorization
- **Socket.IO** - Real-time communication
- **Express Validator** - Input validation
- **bcryptjs** - Password hashing
- **Morgan** - Request logging
- **Rate Limiting** - API protection

### Frontend
- **React 18** + **TypeScript** - UI Framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Headless UI** - Accessible components
- **Heroicons** - Icon library
- **date-fns** - Date utilities
- **Zustand** - Lightweight state management

## 📦 Project Structure

```
party-plot-booker/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/        # Base components (Button, Input, Modal, Card)
│   │   │   ├── layout/    # Layout components (Navbar, Footer)
│   │   │   ├── venue/     # Venue-specific components
│   │   │   ├── booking/   # Booking components
│   │   │   └── auth/      # Authentication forms
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   ├── styles/        # Global styles
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── seeds/         # Database seeding
│   │   └── index.ts       # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── package.json           # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/party-plot-booker.git
cd party-plot-booker
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Configure environment variables**

Server (`server/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/party-plot-booker
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Client (`.env` in client folder):
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Seed the database (optional)**
```bash
npm run seed
```

5. **Start development servers**
```bash
npm run dev
```

This starts both frontend (port 5173) and backend (port 5000) concurrently.

## 🌐 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Build the server**
```bash
cd server
npm run build
```

2. **Set environment variables** on your hosting platform:
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongodb_atlas_uri`
   - `JWT_SECRET=your_production_secret`
   - `CLIENT_URL=https://your-frontend-domain.com`

3. **Start command**: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Build the client**
```bash
cd client
npm run build
```

2. **Deploy the `dist` folder** to Vercel/Netlify

3. **Set environment variables**:
   - `VITE_API_URL=https://your-backend-domain.com/api`

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]

# Frontend Dockerfile (multi-stage)
FROM node:18-alpine AS builder
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### GitHub Pages (Frontend Only)

For static frontend deployment to GitHub Pages:

1. **Update `vite.config.ts`**:
```typescript
export default defineConfig({
  base: '/party-plot-booker/',
  // ... rest of config
})
```

2. **Add deploy script** to client package.json:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

3. **Deploy**:
```bash
cd client
npm run deploy
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Venues
- `GET /api/venues` - List venues with filters
- `GET /api/venues/:id` - Get venue details
- `POST /api/venues` - Create venue (owner/admin)
- `PUT /api/venues/:id` - Update venue (owner/admin)
- `DELETE /api/venues/:id` - Delete venue (owner/admin)
- `GET /api/venues/my-venues` - Get owner's venues
- `GET /api/venues/:id/availability` - Check availability
- `POST /api/venues/:id/favorite` - Toggle favorite

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update status (owner/admin)
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/bookings/:id/communicate` - Add message

### Reviews
- `GET /api/reviews/venue/:venueId` - Get venue reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/response` - Owner response
- `POST /api/reviews/:id/helpful` - Mark helpful

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📝 Environment Variables

### Server
| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `JWT_EXPIRES_IN` | Token expiration | No (default: 7d) |
| `CLIENT_URL` | Frontend URL for CORS | Yes |

### Client
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Unsplash](https://unsplash.com) for venue images
- [Heroicons](https://heroicons.com) for beautiful icons
- [Framer Motion](https://framer.com/motion) for animations
- [Tailwind CSS](https://tailwindcss.com) for styling
- [MongoDB](https://mongodb.com) for database

## 📞 Support

For support, email hello@partyplotbooker.com or create an issue on GitHub.

---

Built with ❤️ by the PartyPlot Booker team