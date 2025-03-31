const express = require("express")
const authMiddleware = require("../middlewares/auth.midleware")
const {search, get, post, savedall, savedreorder, deleterecipe} = require("../controller/recipe.controller")
const router = express.Router()

// Protected routes
router.get("/search",  search)
router.get("/saved/all", authMiddleware, savedall)
router.post("/save", authMiddleware, post)
router.put("/saved/reorder", authMiddleware, savedreorder)
router.delete('/saved/:recipeId', authMiddleware, deleterecipe)

// This route should be last to prevent conflicts with other routes
router.get("/:id", authMiddleware, get)

module.exports = router;
