import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, Users, Loader } from 'lucide-react';

export default function FeaturedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect(() => {
  //   const fetchFeaturedRecipes = async () => {
  //     try {
  //       const response = await axios.get('https://api.spoonacular.com/recipes/random', {
  //         params: {
  //           apiKey: import.meta.env.VITE_SPOONACULAR_API_KEY,
  //           number: 6,
  //           tags: 'vegetarian,main course,side dish,breakfast,dessert,soup'
  //         }
  //       });
        
  //       console.log('API Response:', response.data); // Debug log
        
  //       if (response.data && Array.isArray(response.data.recipes)) {
  //         setRecipes(response.data.recipes);
  //       } else {
  //         console.error('Unexpected API response format:', response.data);
  //         setError('Invalid recipe data received');
  //       }
  //     } catch (err) {
  //       setError('Failed to load featured recipes');
  //       console.error('Error fetching featured recipes:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchFeaturedRecipes();
  // }, []);

  useEffect(() => {
    const fetchFeaturedRecipes = async () => {
      try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/random?apiKey=${import.meta.env.VITE_SPOONACULAR_API_KEY}&number=6
        `);
        setRecipes(response.data.recipes);
      } catch (error) {
        console.error('Error fetching featured recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRecipes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        {error}
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No recipes found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <Link 
          key={recipe.id} 
          to={`/recipe/${recipe.id}`}
          className="group"
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-200 hover:scale-105">
            <div className="relative h-48">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {recipe.title}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.readyInMinutes} mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 