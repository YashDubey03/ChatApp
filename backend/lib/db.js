import mongoose from "mongoose";

// function to connect to mongoDB

export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database Connected'))
        await mongoose.connect(`${process.env.MONGODB_URI}/chatApp`)

    } catch (error) {
        console.log(error)

    }


}