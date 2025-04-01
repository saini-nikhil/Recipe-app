# Recipe App

A full-stack web application that allows users to search, save, and manage their favorite recipes using the Spoonacular API and Google's Gemini AI for intelligent recipe suggestions.

## Features

- 🔍 Search recipes by name, ingredients, or cuisine
- 🤖 AI-powered recipe suggestions using Google's Gemini
- 👤 User authentication (Register/Login)
- 💾 Save favorite recipes
- 📱 Responsive design for all devices
- 🎨 Modern UI with smooth animations
- 🔒 Secure API key management
- 🌐 Live deployment support

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router
- React Hot Toast
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Bcrypt for password hashing
- CORS enabled
- Google Gemini AI API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Spoonacular API key
- Google Gemini API key

## Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
SPOONACULAR_API_KEY=your_spoonacular_api_key
GEMINI_API_KEY=your_gemini_api_key
API_BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```
VITE_SERVER_URL=http://localhost:5000
VITE_SPOONACULAR_API_KEY=your_spoonacular_api_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/recipe-app.git
cd recipe-app
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in both server and client directories
   - Fill in your environment variables

## Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client:
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Recipes
- `GET /api/recipes/search` - Search recipes
- `GET /api/recipes/:id` - Get recipe details
- `POST /api/recipes/save` - Save a recipe
- `GET /api/recipes/saved` - Get saved recipes
- `DELETE /api/recipes/saved/:id` - Remove saved recipe
- `POST /api/recipes/ai-suggest` - Get AI-powered recipe suggestions

## Project Structure

```
recipe-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── recipes/
│   │   │   └── layout/
│   │   ├── config/
│   │   ├── context/
│   │   └── App.jsx
│   └── package.json
├── server/
│   ├── controller/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── README.md
```

## Features in Detail

### Authentication
- Secure user registration and login
- JWT-based authentication
- Protected routes
- Persistent login state

### Recipe Management
- Search recipes using Spoonacular API
- AI-powered recipe suggestions using Gemini
- View detailed recipe information
- Save favorite recipes
- Remove saved recipes
- Responsive recipe cards with hover effects

### AI Integration
- Fallback to Gemini AI when Spoonacular doesn't have specific recipes
- Natural language processing for recipe requests
- Contextual recipe suggestions based on user preferences
- Detailed recipe instructions and ingredients
- Nutritional information and cooking tips

### User Interface
- Clean and modern design
- Responsive layout for all screen sizes
- Loading states and error handling
- Toast notifications for user feedback
- Smooth transitions and animations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Spoonacular API](https://spoonacular.com/food-api) for recipe data
- [Google Gemini AI](https://ai.google.dev/) for intelligent recipe suggestions
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the frontend framework
- [Express](https://expressjs.com/) for the backend framework 