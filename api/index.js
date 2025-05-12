require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDb = require('../lib/db')
const authRouter = require('../routes/auth.route')
const voteRouter = require('../routes/vote.route')


const PORT = process.env.PORT || 5002

const app = express()
const allowedOrigins = [
    'http://localhost:5173',               // Optional: for local development
    'http://localhost:5174',  
    'https://evoting-view.netlify.app',// Optional: for local development
    'https://jah-new-reg.netlify.app'
  ];
  

  
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  };
  
  app.use(cors(corsOptions)); // ✅ Use CORS middleware first
  app.use(express.json());



app.use('/api/auth' ,authRouter)
app.use('/api/student', voteRouter)
connectDb()
/* app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
    
}) */

module.exports = app

