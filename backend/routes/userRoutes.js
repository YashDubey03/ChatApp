import express from 'express'
import { login, signup, updateProfile } from '../controllers/userController.js'
import { checkAuth, protectedRoute } from '../middleware/auth.js'

const userRouter = express.Router()


userRouter.post("/signup", signup)
userRouter.post("/login", login)
userRouter.put("/update-profile", protectedRoute, updateProfile)
userRouter.get("/check", protectedRoute, checkAuth)

export default userRouter


