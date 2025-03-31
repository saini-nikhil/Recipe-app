import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Trash2, Loader, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// SortableItem component for drag-and-drop functionality
function SortableRecipeItem({ recipe, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: recipe.recipeId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 ${
        isDragging ? 'shadow-xl opacity-90 scale-105' : ''
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="relative">
          <Link to={`/recipe/${recipe.recipeId}`}>
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </Link>
          <div 
            {...attributes}
            {...listeners}
            className="absolute top-3 left-3 bg-white p-2 rounded-full shadow-md cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-500" />
          </div>
          <div className="absolute top-3 right-3 bg-red-500 p-2 rounded-full shadow-md text-white">
            <Heart className="h-4 w-4 fill-white" />
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <Link
            to={`/recipe/${recipe.recipeId}`}
            className="text-lg font-bold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2"
          >
            {recipe.title}
          </Link>
          
          <div className="mt-auto pt-4 flex justify-end">
            <button
              onClick={() => onRemove(recipe.recipeId)}
              className="flex items-center text-red-500 hover:text-red-700 transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SavedRecipes({ isAuthenticated }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(false);
  const [reordering, setReordering] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage] = useState(6);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedRecipes();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchSavedRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching saved recipes with token:', token ? 'Token exists' : 'No token found');
      
      const response = await axios.get('http://localhost:5000/api/recipes/saved/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Saved recipes response:', response.data);
      setRecipes(response.data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error('Error fetching saved recipes:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Error fetching saved recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get current recipes for pagination
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setReordering(true);
      
      try {
        // Find the indexes in the original recipes array
        const oldIndex = recipes.findIndex(item => item.recipeId === active.id);
        const newIndex = recipes.findIndex(item => item.recipeId === over.id);
        
        // Create the new array with the reordered items
        const newRecipes = arrayMove([...recipes], oldIndex, newIndex);
        
        // Update the UI immediately
        setRecipes(newRecipes);
        
        // Format the recipes with updated order values
        const updatedRecipes = newRecipes.map((recipe, index) => ({
          ...recipe,
          order: index
        }));
        
        // Send the update to the backend
        const token = localStorage.getItem('token');
        await axios.put(
          'http://localhost:5000/api/recipes/saved/reorder',
          { recipes: updatedRecipes },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Error updating recipe order:', err);
        setError('Error updating recipe order. Please try again.');
        // Fetch the original order if the update fails
        fetchSavedRecipes();
      } finally {
        setReordering(false);
      }
    }
  };

  const handleRemoveRecipe = async (recipeId) => {
    setRemoving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/recipes/saved/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(recipes.filter(recipe => recipe.recipeId !== recipeId));
      
      // Adjust current page if needed after removing a recipe
      if (currentRecipes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError('Error removing recipe. Please try again.');
    } finally {
      setRemoving(false);
    }
  };

  // Pagination controls
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`flex items-center p-2 rounded-md ${
            currentPage === 1 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="flex items-center space-x-1">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                currentPage === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`flex items-center p-2 rounded-md ${
            currentPage === totalPages 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-xl shadow-md p-12 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In to View Saved Recipes</h2>
          <p className="text-gray-600 mb-6">Please sign in to view and manage your saved recipes.</p>
          <Link 
            to="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your saved recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Saved Recipes</h1>
        <p className="text-gray-600">Drag and drop to reorder your favorite recipes.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading your saved recipes...</p>
          </div>
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">You haven't saved any recipes yet.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentRecipes.map(recipe => recipe.recipeId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentRecipes.map((recipe) => (
                <SortableRecipeItem
                  key={recipe.recipeId}
                  recipe={recipe}
                  onRemove={handleRemoveRecipe}
                />
              ))}
            </div>
          </SortableContext>
          <PaginationControls />
        </DndContext>
      )}
    </div>
  );
} 