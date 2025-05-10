const Student = require('../models/student')
const Vote = require('../models/Vote')
const Category = require('../models/Category')
const Candidate = require('../models/Candidate')



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
    const {name , position,image} = req.body
    
    const newCandidate = new Candidate({
        name,position,image
    })

    await newCandidate.save()

   /*  const {name, icon } = req.body

    const newCategory = new Category({
        name,icon
    })

    await newCategory.save() */

/*     const {name,phone,indexNumber,hostel} = req.body

    const newStudent = new Student({
        name,phone,indexNumber,hostel
    })

    await newStudent.save() */

    return res.status(200).json({message: " added",success:true})
}

const getCategory = async(req,res)=>{

    try {
        const category = await Category.find({})
        return res.status(200).json({category})
    
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Internal Server error"})
        
    }


}
const getCandidate = async(req,res)=>{
    try {
        const {id} = req.query
        const candidate = await Candidate.find({position: id}).populate("position","name")
        res.status(200).json({candidate})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Internal Server error"})
        
    }

}

const voteSummary = async(req,res)=>{
    try {
        const summary = await Vote.aggregate([
          {
            $group: {
              _id: { categoryId: "$categoryId", candidateId: "$candidateId" },
              totalVotes: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: "candidates",
              localField: "_id.candidateId",
              foreignField: "_id",
              as: "candidate"
            }
          },
          { $unwind: "$candidate" },
          {
            $lookup: {
              from: "categories",
              localField: "_id.categoryId",
              foreignField: "_id",
              as: "category"
            }
          },
          { $unwind: "$category" },
    
          // Group by category with all candidates
          {
            $group: {
              _id: "$category._id",
              categoryName: { $first: "$category.name" },
              candidates: {
                $push: {
                  candidateId: "$candidate._id",
                  candidateName: "$candidate.name",
                  totalVotes: "$totalVotes"
                }
              },
              categoryTotalVotes: { $sum: "$totalVotes" }
            }
          },
          // Sort candidates by totalVotes within each category
          {
            $project: {
              _id: 1,
              categoryName: 1,
              categoryTotalVotes: 1,
              candidates: {
                $sortArray: {
                  input: "$candidates",
                  sortBy: { totalVotes: -1 }
                }
              }
            }
          }
        ]);
    
        res.status(200).json(summary);
      } catch (error) {
        console.error("Error getting vote summary:", error);
        res.status(500).json({ message: 'Server error' });
      }
}

module.exports = {userVoting,createStuff,getCategory,getCandidate,voteSummary}