const Student = require('../models/student')
const generateOtP = require('../utils/otpGen')
const bcrypt = require('bcrypt')
const Otp = require('../models/Otp')
const sendOtpMessage = require('../utils/sendSms')
const jwt = require('jsonwebtoken')


const verifyStudentId = async(req,res)=>{
    const {studentId} = req.body

    try {
        if(!studentId) return res.status(400).json({message: "Invalid student ID"})
    

        const student = await Student.findOne({ indexNumber: studentId})
        
        if(!student) return res.status(400).json({message: "Student ID not found"})
            
        return res.status(200).json({success: true, student})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Internal Server error"})
        
    }


}

const sendOtp = async(req,res)=>{
    const {id} = req.body

    try {
        const student = await Student.findById({_id: id})
        if(!student) return res.status(400).json({message: "Error with student credentials "})
        
        if(student.hasVoted.length === 16) return res.status(400).json({message: "Student Has already voted"})
    
    
        const otp = generateOtP()
        const hashOtp = await bcrypt.hash(otp, 10)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

        const message = `Dear, ${student.name} your OTP is ${otp}.Please do not share this with anyone, this OTP expires in 5minutes
         Your Vote is your Power`

    
    
        //send OTP before saving
        const response = await sendOtpMessage(student.phone, message)
        if(response.code !== "ok") return res.status(400).json({message: "Code not sent"})
    
        const newOtp = new Otp({
            indexNumber: student.indexNumber,
            otp: hashOtp,
            expiresAt,

        })
    
        await newOtp.save()
    
        return res.status(200).json({success: true, message: "OTP sent successfully"})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Internal Server error"})
        
    }





}


const verifyOtp = async( req, res)=>{
    const { otp, indexNumber } = req.body


    try {
        
        if(!otp || !indexNumber) return res.status(400).json({message: "Otp or index number is required"})
        const sanitizedOtp = String(otp).trim()
        const sanitizedIndexNumber = String(indexNumber).trim() 

        const otpRecord = await Otp.findOne({indexNumber:sanitizedIndexNumber}).sort({ createdAt: -1})
        if(!otpRecord) return res.status(403).json({ message: "Invalid index Number"})
        
            
        if(otpRecord.used) return res.status(400).json( {message: "OTP has been used"})
        const isOtpMatch = await bcrypt.compare(sanitizedOtp, otpRecord.otp)
        
        if(!isOtpMatch) return res.status(400).json({message: "Invalid OTP"})
            
        if(otpRecord.expiresAt < new Date()) return res.status(400).json({message: "OTP has expired"})
            

        
        otpRecord.used = true
        
        await otpRecord.save()
        const student = await Student.findOne({indexNumber})
        const token = jwt.sign(
            { id: student._id },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        )
        
        return res.status(200).json({message: "Login successful", token,name: student.name})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Internal Server error"})


        
    }



}

module.exports = {verifyStudentId,sendOtp,verifyOtp}