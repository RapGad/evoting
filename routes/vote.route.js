const express = require('express')
const {userVoting, createStuff} = require('../controllers/vote.controller')

const router = express.Router()


router.post('/vote', userVoting)
router.post('/create',createStuff)




module.exports = router