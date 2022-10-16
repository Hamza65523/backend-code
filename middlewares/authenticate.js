const jwt = require('jsonwebtoken')
const User = require("../model/userSchema")

module.exports.Authenticate = async (req,res,next)=>{
    try {
        let token = req.cokies.jwtoken;
        const verifyToken = jwt.verify(token,process.env.SECRET_KEY)
        let rootUser = await User.findOne({_id:verifyToken._id,'tokens:token':token})
        if(!rootUser){ throw new Error("user not found")}
        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;
        next()
    } catch (error) {
        console.log(error)   
        res.status(401).send('unauthorized:no token provided')
    }
}
