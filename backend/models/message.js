import mongoose from "mongoose";

// A Schema defines the structure of a document in MongoDB
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
    }
    , text: {
        type: String,
    }, image: {
        type: String,
    }, seen: {
        type: Boolean, default: false
    }
}, { timestamps: true })

// Converts schema into a Model
// User → model name
// userSchema → structure
const Message = mongoose.model('Message', messageSchema)

export default Message