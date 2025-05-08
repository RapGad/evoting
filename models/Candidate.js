const mongoose = require('mongoose')

const CandidateSchema = new mongoose.Schema({
    name: String,
    position: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    class: String,
    votes: {
        type: Number,
        default: 0
    }
})


module.exports = mongoose.model('Candidate', CandidateSchema)