const mongoose = require("mongoose");
const becrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const UserSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  tokens:[
    {
      token:{
        type: String,
        required:true
      }
    }
  ]
});

UserSchema.pre('save',async function(req,res,next){
  if(this.isModified('password')){
    this.password = await becrypt.hash(this.password ,10)
  }
  next()
})

UserSchema.methods.generateAuthToken= async function(req,res){
  try {
    let token = jwt.sign({_id:this._id},process.env.SECRET_KEY,{expiresIn:'300s'})
    this.tokens = this.tokens.concat({token:token })
    await this.save()
    
    return token;
  } catch (error) {
    console.log(error)
  }
}
module.exports = mongoose.model("test", UserSchema);