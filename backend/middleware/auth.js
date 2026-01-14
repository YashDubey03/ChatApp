import User from "../models/user.js"
import jwt from "jsonwebtoken"

// middleware to protect route
export const protectedRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            })
        }

        // Bearer TOKEN => TOKEN
        const token = authHeader.split(" ")[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId).select("-password")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        req.user = user
        next()

    } catch (error) {
        console.log("Auth error:", error.message)
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        })
    }
}

// check auth controller
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user })
}
