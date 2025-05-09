const mongoose = require('mongoose')

const CandidateSchema = new mongoose.Schema({
    name: String,
    position: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    image: String
})


module.exports = mongoose.model('Candidate', CandidateSchema)