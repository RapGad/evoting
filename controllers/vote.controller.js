const Student = require('../models/student')
const Vote = require('../models/Vote')
const Category = require('../models/Category')



const userVoting = async(req,res)=>{
    const { _id } = req.user
    const { categoryId, candidateId } = req.body


    try {
        const user = await Student.findOne({studentId: _id})
        if(user.hasVoted.includes(categoryId)) return res.status(400).json({message: "User Has voted in this category"})
        
        const vote = new Vote({
            studentId: _id,
            categoryId,
            candidateId,
            votedAt: new Date()
        })

        await Student.findByIdAndUpdate(user._id, {
            $addToSet: { hasVoted: categoryId } // prevents duplicates
          });
        await vote.save()

        return res.status(200).json({message: "Voted successfully"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Internal Server error"})
        
    }
}


const createStuff = async(req,res)=>{
    const {gender,indexNumber,name,hostel,phone,} = req.body
    
    const newStudent = new Student({
        name, indexNumber,gender,hostel,phone
    })

    await newStudent.save()

    return res.status(200).json({message: "Category created"})
}

module.exports = {userVoting,createStuff}