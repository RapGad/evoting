const mongoose = require('mongoose')



const connectDb = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Database is connected')
    } catch (error) {
        console.log('Database connection error',error)
        
    }
}


module.exports = connectDb