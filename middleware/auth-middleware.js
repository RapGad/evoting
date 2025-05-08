const jwt = require('jsonwebtoken')


const authMiddleware = async(req,res,next)=>{
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]

    if(!token) return res.status(401).json({message: "Unauthorized access"})

    try {
        const decodedInfo = jwt.verify(token, process.env.MY_SECRET)

        req.user = decodedInfo
    
        next()
        
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: 'internal server error'
        })
        
    }



}