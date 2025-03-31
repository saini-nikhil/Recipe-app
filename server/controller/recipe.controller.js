

const axios = require('axios');

const User = require("../module/user")




const search  = async (req , res) => {
    try {
        const {query , offset = 0 , number = 10} = req.query

        const response = await axios.get("https://api.spoonacular.com/recipes/complexSearch" , {
            params : {
                apiKey: process.env.SPOONACULAR_API_KEY,
                query,
                offset,
                number,
                addRecipeInformation: true
            }
        })

        res.json(response.data)
    } catch (error) {
        res.status(500).json({ message: 'Error searching recipes', error: error.message });
    }
}

const get = async (req , res) => {
    try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/${req.params.id}/information`,
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY
        }
      })
      res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipe details', error: error.message });
    }
}

const post = async (req , res)=> {
   
    try {
        const { recipeId, title, image } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingRecipe = user.savedRecipes.find(r => r.recipeId === recipeId);
    if (existingRecipe) {
      return res.status(400).json({ message: 'Recipe already saved' });
    }

    const order = user.savedRecipes.length;
    user.savedRecipes.push({ recipeId, title, image, order });
    await user.save();

    res.json(user.savedRecipes);
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).json({ message: 'Error saving recipe', error: error.message });
    }
}

const savedall = async (req , res) => {
    try {
      console.log(req.userId)
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.savedRecipes);
    } catch (error) {
        console.error('Error fetching saved recipes:', error);
        res.status(500).json({ message: 'Error fetching saved recipes', error: error.message });
  } 
    
}

const savedreorder = async  (req , res) => {
    try {
      console.log(req.userId)
        const { recipes } = req.body;
        const user = await User.findById(req.userId);

        
        user.savedRecipes = recipes.map((recipe, index) => ({
          ...recipe,
          order: index
        }));
        
        await user.save();
        res.json(user.savedRecipes);
      } catch (error) {
        console.error('Error updating recipe order:', error);
        res.status(500).json({ message: 'Error updating recipe order', error: error.message });
      }
}

const deleterecipe = async (req, res) => {
    try {
      const user = await User.findById(req.userId);
    
      user.savedRecipes = user.savedRecipes.filter(
        recipe => recipe.recipeId !== req.params.recipeId
      );
      await user.save();
      res.json(user.savedRecipes);
    } catch (error) {
      console.error('Error removing recipe:', error);
      res.status(500).json({ message: 'Error removing recipe', error: error.message });
    }
  }

  module.exports = {search , get ,post ,savedall ,savedreorder , deleterecipe}