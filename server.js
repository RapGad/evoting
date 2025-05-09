require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDb = require('./lib/db')
const authRouter = require('./routes/auth.route')
const voteRouter = require('./routes/vote.route')


const PORT = process.env.PORT || 5002

const app = express()
app.use(express.json())
app.use(cors())


app.use('/api/auth' ,authRouter)
app.use('/api/student', voteRouter)
connectDb()
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
    
})

