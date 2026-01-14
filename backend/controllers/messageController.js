import Message from "../models/message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// get all users except logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const users = await User.find({ _id: { $ne: userId } }).select("-password");

        const unseenMessages = {};
        await Promise.all(
            users.map(async (user) => {
                const messages = await Message.find({
                    senderId: user._id,
                    receiverId: userId,
                    seen: false
                });
                if (messages.length > 0) unseenMessages[user._id] = messages.length;
            })
        );

        res.json({ success: true, users, unseenMessages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        // mark as seen
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false },
            { seen: true }
        );

        res.json({ success: true, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// mark message as seen
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// send message
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: "ChatApp",
                    resource_type: "image"
                });
                imageUrl = uploadResponse.secure_url;
            } catch (err) {
                console.error("Cloudinary upload error:", err.message);
                return res.status(500).json({ success: false, error: "Image upload failed" });
            }
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        // emit to receiver via socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({ success: true, message: newMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};
