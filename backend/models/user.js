import mongoose from "mongoose";

// A Schema defines the structure of a document in MongoDB
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePic: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
    }

}, { timestamps: true })

// Converts schema into a Model
// User → model name
// userSchema → structure
const User = mongoose.model('User', userSchema)

export default User