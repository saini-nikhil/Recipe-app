import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Clock, Users, Info, ArrowLeft, ChefHat, Loader, MessageCircle, ShoppingCart, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import config from '../../config';

const RecipeDetail = ({ isAuthenticated, onSaveRecipe }) => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view recipe details');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${config.SERVER_URL}/api/recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setRecipe(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe details');
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated) {
      checkIfSaved();
    }
  }, [isAuthenticated, id]);

  const checkIfSaved = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.SERVER_URL}/api/recipes/saved/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const savedRecipeIds = response.data.map(recipe => recipe.recipeId);
      setIsSaved(savedRecipeIds.includes(id));
    } catch (err) {
      console.error('Error checking saved status', err);
    }
  };

  const handleSaveRecipe = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to save recipes');
      navigate('/login');
      return;
    }
    
    setSaving(true);
    try {
      if (!isSaved) {
        await onSaveRecipe(recipe);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving recipe', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-gray-500">
          Recipe not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to recipes
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-96">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white text-center px-4">
              {recipe.title}
            </h1>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600">{recipe.readyInMinutes} minutes</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600">{recipe.servings} servings</span>
              </div>
            </div>
            <button
              onClick={handleSaveRecipe}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isSaved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <Heart className={`h-5 w-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save Recipe'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.extendedIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
              <ol className="space-y-4">
                {recipe.analyzedInstructions[0].steps.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step.step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 