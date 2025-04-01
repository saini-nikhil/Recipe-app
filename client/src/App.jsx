import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RecipeSearch from './components/recipes/RecipeSearch';
import RecipeDetail from './components/recipes/RecipeDetail';
import SavedRecipes from './components/recipes/SavedRecipes';
import AiRecipeGenerator from './components/recipes/AiRecipeGenerator';
import Footer from './components/Footer';
import config from './config';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on component mount and when token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (token) => {
    console.log('handleLogin called with token');
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    toast.success('Login successful!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    toast.success('Logged out successfully!');
  };

  const handleSaveRecipe = async (recipe) => {
    if (!isAuthenticated) {
      toast.error('Please login to save recipes');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.SERVER_URL}/api/recipes/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipeId: recipe.id.toString(),
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }

      toast.success('Recipe saved successfully!');
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe');
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route 
              path="/search" 
              element={<RecipeSearch isAuthenticated={isAuthenticated} onSaveRecipe={handleSaveRecipe} />} 
            />
            <Route 
              path="/recipe/:id" 
              element={
                <PrivateRoute>
                  <RecipeDetail isAuthenticated={isAuthenticated} onSaveRecipe={handleSaveRecipe} />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/saved" 
              element={
                <PrivateRoute>
                  <SavedRecipes isAuthenticated={isAuthenticated} />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/ai-recipe-generator" 
              element={
                <PrivateRoute>
                  <AiRecipeGenerator isAuthenticated={isAuthenticated} />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
