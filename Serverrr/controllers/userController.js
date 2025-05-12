import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../lib/utils.js"
import User from "../models/User.js"
import bcrypt from "bcryptjs"

export const signup = async (req,res)=>{
    const {email,fullName,password,bio} = req.body
    try {

        if(!email||!fullName||!password||!bio){
            return res.status(400).json({success:false,message:"Missing fields"})
        }

        const existedUser = await User.findOne({email})
        if(existedUser){
            return res.status(400).json({sucess:false,message:"user already exist Please Login"})
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({
            email,
            fullName,
            password:hashedPassword,
            bio
        })

        const token = generateToken(newUser._id)
        await newUser.save();
        return res.status(201).json({success:true,message:"user created sucessfully",token:token,newUser:newUser})
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({success:false,message:"server Error"})
    }
}


export const login = async (req,res)=>{
    
    try {
       const {email, password} = req.body
        const userData = await User.findOne({email})
        const isPasswordMatched = await bcrypt.compare(password,userData.password);

        if(!isPasswordMatched){
            return res.status(400).json({success:false,message:"password doesn't matched"})
         }

          const token = generateToken(userData._id);
          return res.status(200).json({success:true,message:"Login Sucessfully",token:token})
    } catch (error) {
        console.error(error)
        return res.status(500).json({success:false,message:"server Error"})
    }
}

// controller to check user is authenticated or not

export const checkAuth = (req, res) => {
    return res.status(200).json({ success: true, user: req.user });
};



// controller to update user profile details

export const updateProfile = async (req,res)=>{

    try {
        const {fullName,bio,profilePic} = req.body
        const userID = req.user._id
        let updateUser;

        if(!profilePic){
           updateUser =  await User.findByIdAndUpdate(userID,{bio,fullName},{new:true})
        }else{
            const upload = await cloudinary.uploader.upload(profilePic)
            updateUser = await User.findByIdAndUpdate(userID,{profilePic:upload.secure_url,bio,fullName},{new:true})
        }
        return res.status(201).json({success:true, user:updateUser}) 
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({success:false,message:"server Error"})
    }

}