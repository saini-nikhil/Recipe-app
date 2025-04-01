import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Clock, Loader } from 'lucide-react';
import config from '../../config';

export default function RecipeSearch({ isAuthenticated, onSaveRecipe }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [savedRecipeIds, setSavedRecipeIds] = useState([]);
  const [loginWarning, setLoginWarning] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedRecipeIds();
    }
  }, [isAuthenticated]);

  const fetchSavedRecipeIds = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${config.SERVER_URL}/api/recipes/saved/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const ids = response.data.map(recipe => recipe.recipeId);
      setSavedRecipeIds(ids);
    } catch (err) {
      console.error('Error fetching saved recipes', err);
    }
  };

  const searchRecipes = async (reset = false) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const currentOffset = reset ? 0 : offset;
      const response = await axios.get(`${config.SERVER_URL}/api/recipes/search`, {
        params: {
          query: searchQuery,
          offset: currentOffset,
          number: 12
        }
      });

      const newRecipes = response.data.results;
      setRecipes(reset ? newRecipes : [...recipes, ...newRecipes]);
      setHasMore(newRecipes.length === 12);
      setOffset(currentOffset + 12);
    } catch (err) {
      setError('Error searching recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setOffset(0);
    searchRecipes(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      searchRecipes();
    }
  };

  const handleSaveRecipe = async (e, recipe) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('Attempting to save recipe:', recipe);
      await onSaveRecipe(recipe);
      console.log('Recipe saved successfully');
      setSavedRecipeIds([...savedRecipeIds, recipe.id.toString()]);
    } catch (error) {
      console.error('Error saving recipe:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };
  
  const handleRecipeClick = (e, recipeId) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setLoginWarning(true);
      setTimeout(() => setLoginWarning(false), 3000);
    } else {
      navigate(`/recipe/${recipeId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Delicious Recipes</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Search for recipes and save your favorites to your collection.</p>
      </div>
      
      {loginWarning && (
        <div className="fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg bg-yellow-500 text-white">
          Please log in to view recipe details
        </div>
      )}
      
      <form onSubmit={handleSearch} className="mb-10 max-w-2xl mx-auto">
        <div className="flex gap-4 shadow-md rounded-lg overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for recipes..."
            className="flex-1 px-4 py-3 border-0 focus:ring-0 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium transition-colors duration-200 flex items-center"
          >
            {loading ? <Loader className="h-5 w-5 animate-spin mr-2" /> : null}
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 text-center mb-8 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 transition-transform duration-300"
            >
              <div 
                className="cursor-pointer"
                onClick={(e) => handleRecipeClick(e, recipe.id)}
              >
                <div className="relative">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div className="p-5">
                  <div
                    className="text-xl font-bold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2"
                  >
                    {recipe.title}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{recipe.readyInMinutes} mins</span>
                    </div>
                    {isAuthenticated && (
                      <button
                        onClick={(e) => handleSaveRecipe(e, recipe)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                      >
                        <Heart
                          className={`h-6 w-6 transition-colors duration-200 ${
                            savedRecipeIds.includes(recipe.id.toString()) 
                              ? 'text-red-500 fill-red-500' 
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && searchQuery && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No recipes found. Try a different search term or use AI recipe generator to generate a recipe .  
            <Link to="/ai-recipe-generator" className="text-blue-600 hover:text-blue-700">AI recipe generator</Link>
          </p>
        </div>
      )}

      {hasMore && recipes.length > 0 && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors duration-200"
          >
            {loading ? <Loader className="h-5 w-5 animate-spin mr-2" /> : null}
            {loading ? 'Loading...' : 'Load More Recipes'}
          </button>
        </div>
      )}
    </div>
  );
} 