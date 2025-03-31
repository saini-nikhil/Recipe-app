import React, { useState } from 'react';
import { MessageCircle, ShoppingCart, Loader, ChevronRight } from 'lucide-react';

const AiRecipeGenerator = () => {
  const [message, setMessage] = useState('');
  const [groceryItems, setGroceryItems] = useState([]);
  const [recipe, setRecipe] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get API key from environment variables
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const callGeminiAI = async (inputMessage) => {
    setIsLoading(true);
    setError(null);
  
    try {
      const prompt = `Generate a recipe and grocery list for the following meal plan: ${inputMessage}.
                     YOU MUST return your response in the following JSON format ONLY:
                     {
                       "recipe": "recipe_instructions_here with all ingredients, steps, cooking time and servings",
                       "groceryItems": [
                         {
                           "id": "unique_id",
                           "name": "item_name",
                           "category": "item_category",
                           "quantity": "amount_needed",
                           "icon": "emoji_icon"
                         }
                       ]
                     }
                     
                     DO NOT include any text or explanations before or after the JSON. ONLY return the JSON object.`;
                     
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.2,
              topP: 0.8,
              topK: 40
            }
          })
        }
      );
  
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
  
      const data = await response.json();
  
      try {
        // Extract the response text and clean up any markdown syntax
        let textResponse = data.candidates[0].content.parts[0].text;
  
        // Look for JSON content in the response
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          throw new Error("No JSON format found in response");
        }
        
        const jsonContent = jsonMatch[0];
        
        // Now try parsing the cleaned response
        const parsedResponse = JSON.parse(jsonContent);
        
        // If successful, set the recipe and grocery items
        setRecipe(parsedResponse.recipe);
        
        // Ensure grocery items have proper structure
        if (Array.isArray(parsedResponse.groceryItems)) {
          setGroceryItems(parsedResponse.groceryItems);
        } else {
          setGroceryItems([]);
        }
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        setError("Failed to parse response from the API. Please try again.");
      }
    } catch (error) {
      console.error('Error fetching from Gemini API:', error);
      setError("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      await callGeminiAI(message);
    }
  };

  return (
    <div className="bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {!recipe && (
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-3">AI Recipe Generator</h1>
            <p className="text-gray-600">
              Tell me what you'd like to cook, and I'll generate a recipe with ingredients
            </p>
          </div>
        )}

        {/* Simple Input Form */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter what you'd like to cook (e.g., chocolate cake, vegetarian pasta)"
                className="w-full p-4 pr-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center p-10">
            <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Generating your recipe...</p>
          </div>
        )}

        {/* Recipe Result */}
        {recipe && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recipe Instructions */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Recipe for {message}</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line text-gray-700">{recipe}</p>
              </div>
            </div>

            {/* Grocery List */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                Ingredients
              </h2>
              
              {groceryItems.length > 0 ? (
                <ul className="space-y-2">
                  {groceryItems.map((item) => (
                    <li key={item.id} className="flex justify-between items-center p-2 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No ingredients listed</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiRecipeGenerator; 