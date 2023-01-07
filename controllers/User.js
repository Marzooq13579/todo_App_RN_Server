import { User } from "../models/users.js";
import { sendMail } from "../utils/sendMail.js";

import { sendToken } from "../utils/sendToken.js";

import cloudinary from "cloudinary";

import fs from "fs";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const otp = Math.floor(Math.random() * 1000000);

    
    const avatar = req.files.avatar.tempFilePath;

    const myCloud = await cloudinary.v2.uploader.upload(avatar,{
      folder:"todoApp",
    });

    fs.rmSync("./tmp",{recursive:true});

    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      otp,
      otp_expiry: new Date(
        Date.now() + process.env.OTP_EXPIRE * 24 * 60 * 60 * 1000
      ),
    });

    sendMail(email, "Verify your account", `your OTP is ${otp}`);

    sendToken(
      res,
      user,
      201,
      "OTP Sent to Your mail,Please Verify your account"
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verify = async (req, res) => {
  try {
    const otp = Number(req.body.otp);
    const user = await User.findById(req.user._id);

    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      res
        .status(400)
        .json({ success: false, message: "Invalid OTP or has been expired" });
    }

    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    sendToken(res, user, 200, "Account Verified");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const login = async (req, res) => {
  try {
    const {  email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter all fields" });
    }


    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }


    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    sendToken(
      res,
      user,
      200,
      "Login Successfull"
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




export const logout = async (req, res) => {
  try {

      return res
        .status(200)
        .cookie("token",null,{expires: new Date(Date.now())})
        .json({ success: true, message: "Logged Out Successfully" });
  

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const addTask = async(req,res) => {

  try {

    const {title,description} = req.body

    const user = await User.findById(req.user._id);

    user.tasks.push({title,description,completed:false,createdAt:new Date(Date.now())});

    await user.save();

    res.status(200).json({success:true, message : "Task added sucessfully"})


} catch (err) {
  res.status(500).json({ success: false, message: err.message });
}

}


export const removeTask = async(req,res) => {

  try {

    const {taskId} = req.params;

    const user = await User.findById(req.user._id);

    user.tasks = user.tasks.filter(task => task._id.toString() !== taskId.toString());

    await user.save();

    res.status(200).json({success:true, message : "Task removed sucessfully"})


} catch (err) {
  res.status(500).json({ success: false, message: err.message });
}

}



export const updateTask = async(req,res) => {

  try {

    const {taskId} = req.params;

    const user = await User.findById(req.user._id);

    user.tasks.map(task => {
      if(task._id.toString()== taskId.toString()){
        task.completed = !task.completed
      }}
      );

    await user.save();

    res.status(200).json({success:true, message : "Task Updated sucessfully"})


} catch (err) {
  res.status(500).json({ success: false, message: err.message });
}

}


export const getMyProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    sendToken(res,user,201,`Welcome ${user.name}`)
  

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    const {name} = req.body;
       
    const avatar = req.files.avatar.tempFilePath;

    if(name) user.name = name;

    if(avatar){
      await await cloudinary.v2.uploader.destroy(user.avatar.public_id,{
        folder:"todoApp",
      });

      const myCloud = await cloudinary.v2.uploader.upload(avatar,{
        folder:"todoApp",
      });

      fs.rmSync("./tmp",{recursive:true});

      user.avatar = {
        public_id: myCloud.public_id,
        url : myCloud.secure_url
      }
    }

    await user.save();
   
    res.status(200).json({success:true, message : "Profile Updated sucessfully"})
  

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updatePassword = async (req, res) => {
  try {

    const user = await User.findById(req.user._id).select("+password");

    const {oldPassword,newPassword} = req.body;

    if(!oldPassword || !newPassword)  return res.status(400).json({success:false, message:"Please enter all fileds"});

    const isMatch = await user.comparePassword(oldPassword);

    if(!isMatch){
      return res.status(400).json({success:false, message:"Invalid Old Password"});
    }

    user.password = newPassword;

    await user.save();

   
    res.status(200).json({success:true, message : "Password Updated sucessfully"})
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {


    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user) {
      return res.status(400).json({success:false, message:"Invalid Email"});
    }

    const otp = Math.floor(Math.random() * 1000000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = Date.now() + 10* 60*1000;

    await user.save();

    sendMail(email, "Reset your password", `your OTP is ${otp}`);
    
    res.status(200).json({success:true, message : "Otp send to your mail"})
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const resetPassword = async (req, res) => {
  try {


    const {otp,newPassword} = req.body;

    const user = await User.findOne({resetPasswordOtp:otp, resetPasswordOtpExpiry: {$gt: Date.now()}}).select("+password");

    if(!user) {
      return res.status(400).json({success:false, message:"OTP Invalid or Expired"});
    }

    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiry = null;

    await user.save();

    
    res.status(200).json({success:true, message : "Password Changed Successfully"})
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};






