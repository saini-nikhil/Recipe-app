const express = require("express")
const authMiddleware = require("../middlewares/auth.midleware")
const { search, get, saveRecipe, getSavedRecipes, reorderSavedRecipes, deleteRecipe } = require("../controller/recipe.controller")
const router = express.Router()

router.get('/search', search);
router.get('/saved/all', authMiddleware, getSavedRecipes);
router.post('/save', authMiddleware, saveRecipe);
router.put('/saved/reorder', authMiddleware, reorderSavedRecipes);
router.delete('/saved/:recipeId', authMiddleware, deleteRecipe);
router.get('/:id', authMiddleware, get);

module.exports = router;
