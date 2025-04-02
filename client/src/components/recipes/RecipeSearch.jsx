import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Clock, Loader, Search, Filter, X } from 'lucide-react';
import config from '../../config';
import debounce from 'lodash/debounce';

export default function RecipeSearch({ isAuthenticated, onSaveRecipe }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [savedRecipeIds, setSavedRecipeIds] = useState([]);
  const [loginWarning, setLoginWarning] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({
    cuisine: '',
    diet: '',
    mealType: '',
    sortBy: 'popularity'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const navigate = useNavigate();

  const cuisineOptions = [
    'American', 'Italian', 'Chinese', 'Japanese', 'Indian', 'Mexican', 
    'Mediterranean', 'Thai', 'French', 'Spanish', 'Greek', 'Korean'
  ];

  const dietOptions = [
    'Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Low Carb', 
    'Paleo', 'Ketogenic', 'Whole30'
  ];

  const mealTypeOptions = [
    'Main Course', 'Side Dish', 'Dessert', 'Appetizer', 
    'Salad', 'Soup', 'Breakfast', 'Snack'
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'time', label: 'Cooking Time' },
    { value: 'calories', label: 'Calories' },
    { value: 'rating', label: 'Rating' }
  ];

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.length >= 2) {
        fetchRecipes(query);
      } else {
        setRecipes([]);
        setSuggestions([]);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedRecipeIds();
    }
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [isAuthenticated, searchQuery, debouncedSearch]);

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

  const fetchRecipes = async (query) => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams({
        apiKey: import.meta.env.VITE_SPOONACULAR_API_KEY,
        query: query,
        number: 12,
        addRecipeInformation: true,
        fillIngredients: true
      });

      // Add filters if they are set
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      if (filters.diet) params.append('diet', filters.diet);
      if (filters.mealType) params.append('type', filters.mealType);
      if (filters.sortBy) params.append('sort', filters.sortBy);

      const response = await axios.get(
        `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`
      );

      setRecipes(response.data.results);
      
      // Get search suggestions
      const suggestionsResponse = await axios.get(
        `https://api.spoonacular.com/recipes/autocomplete?apiKey=${import.meta.env.VITE_SPOONACULAR_API_KEY}&query=${query}&number=5`
      );
      setSuggestions(suggestionsResponse.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to fetch recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (searchQuery) {
      fetchRecipes(searchQuery);
    }
  };

  const clearFilters = () => {
    setFilters({
      cuisine: '',
      diet: '',
      mealType: '',
      sortBy: 'popularity'
    });
    if (searchQuery) {
      fetchRecipes(searchQuery);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setOffset(0);
    fetchRecipes(searchQuery);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchRecipes(searchQuery);
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

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Delicious Recipes</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing recipes, save your favorites, and get AI-powered recipe suggestions.
          </p>
        </div>
        
        {loginWarning && (
          <div className="fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg bg-yellow-500 text-white">
            Please log in to view recipe details
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for recipes..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <img
                      src={suggestion.image}
                      alt={suggestion.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="text-gray-700">{suggestion.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center gap-4">
                {showFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="h-5 w-5" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                {/* Cuisine Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine
                  </label>
                  <select
                    value={filters.cuisine}
                    onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Cuisines</option>
                    {cuisineOptions.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Diet Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diet
                  </label>
                  <select
                    value={filters.diet}
                    onChange={(e) => handleFilterChange('diet', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Diets</option>
                    {dietOptions.map((diet) => (
                      <option key={diet} value={diet}>
                        {diet}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meal Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Type
                  </label>
                  <select
                    value={filters.mealType}
                    onChange={(e) => handleFilterChange('mealType', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    {mealTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
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
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                    <div className="text-xl font-bold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2">
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
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600">
              No recipes found. Try a different search term or use AI recipe generator to generate a recipe.
              <Link to="/ai-recipe-generator" className="text-blue-600 hover:text-blue-700 ml-1">
                AI recipe generator
              </Link>
            </p>
          </div>
        )}

        {hasMore && recipes.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? <Loader className="h-5 w-5 animate-spin mr-2" /> : null}
              {loading ? 'Loading...' : 'Load More Recipes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 