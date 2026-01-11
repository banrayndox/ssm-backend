import User from "../models/User.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
export const Login = async (req,res) =>{
const {email, password} = req.body
if(!email || !password) {
    return res.json({success: false, message:'Email and Password are required'})
}
try {
    const user = await User.findOne({email})
    if(!user) {
        return res.json({success: false, message:'Invalid Email'})
    }
    // compare hashed password
    // const isMatch = await bcrypt.compare(password, user.password)
    const isMatch = password
    if(!isMatch) return res.json({success: false, message:'Invalid Credentials!'})
    // create token 
    const token = jwt.sign({
        userId: user._id, role: user.role},
        process.env.JWT_SECRET_KEY,
        {
        expiresIn: '7d'
        }
    )
    // set cookie
    res.cookie('token', token,{
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
 return res.json({success:true, message:'Login Successfull', user})
} catch (error) {
    return res.json({success:false, message: error.message})
}

}

export const Logout = async (req, res) => {
    try {
        // clear cookie
        res.clearCookie('token','',{
           httpOnly: true,
           secure: false,
           sameSite: 'none' 
        })

        return res.json({success: true, message:'Logout Successfully'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }

}

export const Register = async (req,res) => {
 const {name, email, password, studentId, departmentId} = req.body
 if(!name || !email || !password || !studentId || !departmentId
 ){
    return res.json({success: false, message:'All fields are required'})
 }
 try {
    const existingUser = await User.findOne({email})
    if(existingUser){
        return res.json({success: false, message: 'User already exists'})
    }
    // hashed password
    // const hashedPassword = await bcrypt.hash(password, 12)
    const hashedPassword = password

    const user = new User({name, email,password: hashedPassword, role:'student', studentId, departmentId})
    await user.save()
    // In registration i don't want to set token and cookie, after reg user should login first
    // token
    // cookie
    // sending welcome & otp
    return res.json({success:true, message:'Account created successfully', user})
 } catch (error) {
    res.json({success: false, message: error.message})
 }
}

export const ResetPass = async (req,res) => {
    const { email } = req.body
    if(!email) return res.json({success: false, message: 'Email is required'})  
    try {
     const user = await User.findOne({email})
     if(!user) return res.json({success: false, message:'User not found'})
    
    // send otp
        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}


// I will do later

export const VerifyOTP = async (req,res) => {
 const {email, otp} = req.body
 if(!email || !otp) return res.json({success: false, message:'Missing Details'})

    try {
    const user = await User.findOne({email})
    if(!user){
    return res.json({success: false, message:'User not found'})
   }
   if(user.VerifyOTP != otp || user.VerifyOTP == '' ) return res.json({success: false, message:'Invalid OTP'})
    // logic for expired date of otp
     user.VerifyOTP = ''
     user.otpExpiryDate = 0
     return res.json({success: true, message:'OTP accepted'})
    } catch (error) {
        return res.json({success: false, message:error.message})
    }
}

export const isAuthenticated = async (req,res) =>{
    try {
        const token = req.cookies.token
       if(!token) return res.json({success: false, message: 'Not authorized'})
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findById(decoded.userId).select('-password').populate('departmentId', 'name')      
        .populate({
        path: "enrolledCourses",
        populate: {
          path: "courseId",
          select: "name code",
        },
      })
      .populate({
        path: "createdCourses",
        populate: {
          path: "courseId",
          select: "name code",
        },
      })

        if(!user) return res.json({success: false, message: 'User not found'})
        res.json({success: true, user})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}
