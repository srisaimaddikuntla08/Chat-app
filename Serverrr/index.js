import  express from "express"
import "dotenv/config";
import cors from "cors";
import http from "http"
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoute.js";
import messageRouter from "./routes/messageRoutes.js";
import {Server} from "socket.io"




// create express server with http
const app = express();
const server = http.createServer(app);

// intialize socket.io server
export const io = new Server(server,{
    cors:{origin:"*"}
})

// store online users
export const userSocketMap = {};   //{userId:socketId}

io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId
    console.log("user Connected", userId)
    if(userId) userSocketMap[userId] = socket.id

    //Emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    socket.on("disconnect",()=>{
        console.log("User Disconnected", userId)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })

})

// middleware setup 
app.use(express.json({limit:"4mb"}));
app.use(cors({
  origin: "*", // or your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Routes setup
app.use("/api/status",(req,res)=>res.send("server is live"))
app.use("/api/auth/",userRouter)
app.use("/api/messages/",messageRouter)


// connectDB
await connectDB()


if(process.env.NODE_ENV!=="production"){
const PORT = process.env.PORT||5000
server.listen(PORT,()=>console.log(`server is running on port:${PORT}`))
}

export default server;