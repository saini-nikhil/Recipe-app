import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import FeaturedRecipes from './recipes/FeaturedRecipes';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Find Your Next</span>
              <span className="block text-blue-600">Delicious Recipe</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover thousands of recipes from around the world. Search by ingredients, cuisine, or dietary preferences.
            </p>
            <div className="mt-8">
              <button
                onClick={() => navigate('/search')}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse Recipes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Recipes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Featured Recipes</h2>
          <p className="mt-2 text-gray-600">Discover some of our most popular recipes</p>
        </div>
        <FeaturedRecipes />
      </div>
    </div>
  );
};

export default Home; 
