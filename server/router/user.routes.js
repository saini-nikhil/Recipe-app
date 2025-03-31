const express = require("express")
const authMiddleware = require("../middlewares/auth.midleware")
const {login , register} = require("../controller/auth.controller")

const app = express();
app.use(express.json());
const router = express.Router()



router.post("/register" , register)
router.post("/login" , login)

module.exports = router;
