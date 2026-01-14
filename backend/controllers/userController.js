import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

// signup new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "Account Already Exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ fullName, email, password: hashedPassword, bio });

        const token = generateToken(newUser._id);

        res.json({ success: true, userData: newUser, token, message: "Account Created Successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userData = await User.findOne({ email });
        if (!userData) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = generateToken(userData._id);

        res.json({ success: true, userData, token, message: "Login Successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// update profile
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;

        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { bio, fullName },
                { new: true }
            );
        } else {
            if (!profilePic) throw new Error("No image provided");

            // Cloudinary upload
            const upload = await cloudinary.uploader.upload(profilePic, {
                folder: "ChatApp",
                resource_type: "image"
            });

            // update user in DB
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { profilePic: upload.secure_url, bio, fullName },
                { new: true }
            );
        }


        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
