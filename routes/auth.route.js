const express = require('express')
const { verifyStudentId, sendOtp, verifyOtp } =require('../controllers/auth.controller')


const router = express.Router()


router.post('/verify-student',verifyStudentId)
router.post('/send-otp', sendOtp)
router.post('/verify-otp',verifyOtp)



module.exports = router