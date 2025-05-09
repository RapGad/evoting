require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDb = require('../lib/db')
const authRouter = require('../routes/auth.route')
const voteRouter = require('../routes/vote.route')


const PORT = process.env.PORT || 5002

const app = express()
app.use(express.json())
const allowedOrigins = [
    'https://jah-register.netlify.app/',  // Replace with your actual frontend URL
    'http://localhost:5173'               // Optional: for local development
  ];
  
  const corsOptions = {
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };
  
  app.use(cors(corsOptions));


app.use('/api/auth' ,authRouter)
app.use('/api/student', voteRouter)
connectDb()
/* app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
    
}) */

module.exports = app

