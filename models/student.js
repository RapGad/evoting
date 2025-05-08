const mongoose = require('mongoose')


const StudentSchema = new mongoose.Schema({
    indexNumber: {
        type: String,
        unique: true,
        required: true
    },
    name: String,
    phone: {
        type: String,
        required: true
    },
    hasVoted: {
        type: [mongoose.Schema.Types.ObjectId], // or [mongoose.Schema.Types.ObjectId] if you're using category IDs
        default: []
      },
    gender:{
        type: String,
        default: ""
    },
    hostel:{
        type: String,
        required: true
    }
})


module.exports = mongoose.model('Student', StudentSchema)