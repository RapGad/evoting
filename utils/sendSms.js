const axios = require('axios')

const ARKESEL_API = process.env.ARKESEL_API_KEY
const SENDER_CODE =''

const sendOtpMessage = async(phone,message)=>{
    try {
        const response = await axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${ARKESEL_API}&to=${phone}&from=Jeffrey&sms=${message}`)
        return response.data
    } catch (error) {
        console.log(error)
        
    }
}


module.exports = sendOtpMessage