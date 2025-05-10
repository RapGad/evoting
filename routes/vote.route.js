const express = require('express')
const {userVoting, createStuff,getCategory, getCandidate,voteSummary} = require('../controllers/vote.controller')
const authMiddleware = require('../middleware/auth-middleware')

const router = express.Router()


router.post('/vote', authMiddleware,userVoting)
router.post('/create',createStuff)
router.get('/get-category',getCategory)
router.get('/get-candidate',getCandidate)
router.get('/vote-summary',voteSummary)




module.exports = router