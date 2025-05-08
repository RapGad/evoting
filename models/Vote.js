const mongoose = require('mongoose')

const VoteSchema = new mongoose.Schema({
    studentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    categoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    candidateId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate"
    },
    votedAt: Date
})


module.exports = mongoose.model("Vote",VoteSchema)