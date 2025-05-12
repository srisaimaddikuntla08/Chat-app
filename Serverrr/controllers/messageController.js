import User from "../models/User.js"
import Message from "../models/message.js"
import cloudinary from "../lib/cloudinary.js"
import {io,userSocketMap} from "../index.js"


//  get all the users except logged users

export const getUsersForSidebar = async (req,res)=>{
    try{
        const userId = req.user._id
        const filteredUsers = await User.find({_id:{$ne:userId}}).select("-password")
        
           // Object to store unseen message counts
        const unseenMessages = {};
        
        // Use Promise.all to handle multiple async operations
        const promises = filteredUsers.map(async(user)=>{
            const messages = await Message.find({senderId:user._id, recieverId:userId,seen:false})
            if(messages.length>0){
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises)
        return res.json({success:true, users:filteredUsers,unseenMessages})

    }catch(error){
        console.error(error)
        return res.json({success:false,message:error.message})
    }
}

// get all messages for selected user 

export const getMessages = async (req,res)=>{
    try {
        
        const {id:selectedUserId} = req.params
        const myId = req.user._id;
        const messages = await Message.find({
            $or:[
                {senderId:myId,recieverId:selectedUserId},
                {senderId:selectedUserId,recieverId:myId}

            ]
        })
        await Message.updateMany({senderId:selectedUserId, recieverId:myId},{seen:true})
        return res.json({success:true, messages})
    } catch (error) {
      console.error(error)
        return res.json({success:false,message:error.message})
    }
}


// api to mark message as seen using message id

export const markMessgeAsSeen =  async(req,res)=>{
    try {
        const {id} = req.params
        await Message.findByIdAndUpdate(id,{seen:true});
        return res.json({success:true})

    } catch (error) {
         console.error(error)
        return res.json({success:false,message:error.message})
    }
}

// send message to selected user

export const sendMessage = async (req,res)=>{
    try {

        const {text,image} = req.body
        const recieverId = req.params.id
        const senderId = req.user._id

        let imageUrl
        if(imageUrl){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url
        }
        const newMessage =  await Message.create({
            senderId,
            recieverId,
            text,
            image:imageUrl
        })

        const receiverSockedId = userSocketMap[recieverId]
        if(receiverSockedId){
            io.to(receiverSockedId).emit("newMessage",newMessage);
        }
        return res.json({success:true,newMessage:newMessage})
        
    } catch (error) {
        console.error(error)
        return res.json({success:false,message:error.message})
        
    }
}

