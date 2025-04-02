import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Clock, Users, ArrowLeft, Loader, Share2 } from 'lucide-react';
import config from '../../config';

const RecipeDetail = ({ isAuthenticated, onSaveRecipe }) => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loginWarning, setLoginWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch recipe from Spoonacular API
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/${id}/information?apiKey=${import.meta.env.VITE_SPOONACULAR_API_KEY}`
        );
        
        setRecipe(response.data);
        
        // Check if recipe is saved (only if user is authenticated)
        if (isAuthenticated) {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              setIsSaved(false);
              return;
            }
            
            const savedResponse = await axios.get(`${config.SERVER_URL}/api/recipes/saved`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (savedResponse.data && Array.isArray(savedResponse.data)) {
              setIsSaved(savedResponse.data.some(r => r.recipeId === id));
            } else {
              setIsSaved(false);
            }
          } catch (savedError) {
            console.error('Error checking saved status:', savedError);
            setIsSaved(false);
          }
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        if (error.response?.status === 404) {
          setError('Recipe not found. Please try another recipe.');
        } else if (error.response?.status === 401) {
          setError('API key is invalid or has expired.');
        } else {
          setError('Failed to load recipe details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, isAuthenticated]);

  const handleSaveRecipe = async () => {
    if (!isAuthenticated) {
      setLoginWarning(true);
      setTimeout(() => setLoginWarning(false), 3000);
      return;
    }

    try {
      await onSaveRecipe(recipe);
      setIsSaved(true);
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Recipe not found</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loginWarning && (
          <div className="fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg bg-yellow-500 text-white">
            Please log in to save recipes
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Search
        </button>

        {/* Recipe Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-[400px] md:h-[500px]">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{recipe.readyInMinutes} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold mb-6">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.extendedIngredients?.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span>{ingredient.amount} {ingredient.unit} {ingredient.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Instructions</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSaveRecipe}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400'
                      }`}
                    />
                    {isSaved ? 'Saved' : 'Save Recipe'}
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <Share2 className="h-5 w-5" />
                    Share
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {recipe.analyzedInstructions?.[0]?.steps?.map((step, index) => (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step.step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 