// import express from "express"
// import cors from "cors"
// import http from "http"
// import dotenv from "dotenv"
// import { Server } from "socket.io"

// import userRouter from "./routes/userRoutes.js"
// import messageRouter from "./routes/messageRouter.js"
// import { connectDB } from "./lib/db.js"

// // configure dot env
// dotenv.config()


// const app = express()
// const server = http.createServer(app)

// // middlewares
// const allowedOrigins = [

//     // previous url 5173
//     // "http://localhost:5173",
//     // "http://localhost:5173",


//     process.env.CLIENT_URL

// ];

// // middlewares
// app.use(express.json({ limit: "4mb" }));

// app.use(
//     cors({
//         origin: (origin, callback) => {
//             if (!origin) return callback(null, true);
//             if (allowedOrigins.includes(origin)) {
//                 callback(null, true);
//             } else {
//                 callback(new Error("Not allowed by CORS"));
//             }
//         },
//         credentials: true,
//     })
// );

// // socket.io setup
// export const io = new Server(server, {
//     cors: {
//         origin: allowedOrigins,
//         credentials: true,
//     },
// });


// // store online user 
// export const userSocketMap = {} // { userId: socketId }

// // socket.io connection handler 
// io.on("connection", (socket) => {
//     const { userId } = socket.handshake.query

//     if (userId) {
//         userSocketMap[userId] = socket.id
//         console.log("User connected:", userId)
//     }

//     io.emit("getOnlineUsers", Object.keys(userSocketMap))

//     socket.on("disconnect", () => {
//         if (userId) {
//             delete userSocketMap[userId]
//             io.emit("getOnlineUsers", Object.keys(userSocketMap))
//         }
//         console.log("User disconnected:", userId)
//     })
// })

// // routes
// app.get("/api/status", (req, res) => {
//     res.send("Server is live ")
// })

// app.use("/api/auth", userRouter)
// app.use("/api/messages", messageRouter)

// // start server
// const PORT = process.env.PORT || 5000

// // connect to db
// await connectDB()

// server.listen(PORT, () => {
//     console.log(`Server running on PORT ${PORT}`)
// })
// // if (process.env.NODE_ENV !== "production") {

// // }
// // export server for vercel
// // export default server


import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRouter.js";
import { connectDB } from "./lib/db.js";

// ================= ENV =================
dotenv.config();

// ================= APP SETUP =================
const app = express();
const server = http.createServer(app);

// ================= MIDDLEWARES =================
app.use(express.json({ limit: "4mb" }));

// 🔥 LOCAL DEV CORS (allow everything)
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

// ================= SOCKET.IO =================
export const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true,
    },
});

// store online users
export const userSocketMap = {}; // { userId: socketId }

// socket connection
io.on("connection", (socket) => {
    const { userId } = socket.handshake.query;

    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log("User connected:", userId);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        if (userId) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
        console.log("User disconnected:", userId);
    });
});

// ================= ROUTES =================
app.get("/api/status", (req, res) => {
    res.send("Server is live 🚀");
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

// connect DB & start server
await connectDB();

server.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
