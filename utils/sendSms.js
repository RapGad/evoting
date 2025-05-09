const axios = require('axios');
const { response } = require('express');

const ARKESEL_API = process.env.ARKESEL_API_KEY
const SENDER_CODE =''

const sendOtpMessage = async(phone,message)=>{
/*     try {
        const response = await axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${ARKESEL_API}&to=${phone}&from=Jeffrey&sms=${message}`)
        return response.data
    } catch (error) {
        console.log(error)
        
    } */
   
        const data = {"sender": "Jeffrey",
            "message": message,
            "recipients": [phone],
            // When sending SMS to Nigerian recipients, specify the use_case field
            // "use_case" = "transactional"
          };

const config = {
 method: 'post',
 url: 'https://sms.arkesel.com/api/v2/sms/send',
 headers: {
  'api-key': ARKESEL_API
 },
 data : data
};


try {
    const response = await axios(config);
    const result = response.data;

    // Optionally check status
    if (result.status === "success") {
      return {
        success: true,
        message: result.message,
        data: result
      };
    } else {
      return {
        success: false,
        message: result.message || "SMS failed",
        data: result
      };
    }

  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      data: error.response?.data || null
    };
  }
}


module.exports = sendOtpMessage