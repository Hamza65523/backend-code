const routes = require("express").Router()
const User = require('../model/userSchema')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const JWT = require('jsonwebtoken')



routes.post('/login',async(req,res)=>{
    try {
        
        const {email,password} = req.body
        if(email == '' &&  password == ''){
            res.status(400).json({msg:'plz field not empty',status:false})
        }
        let userLogin =  await User.findOne({email})
        if(userLogin){

            let isMatch = await bcrypt.compare(password,userLogin.password)
          if(!isMatch){
            res.status(400).json({msg:'Invalied password',status:false})
           
        }else{
            let token =await userLogin.generateAuthToken()
        console.log(req.cookies) 
            
            // res.cookie('jwtoken',token,{
            //     expires:new Date(Date.now() + 25234000),
            //     httpOnly:true
            // })

            res.cookie('test','testing')
            // console.log(res.cookie)
            res.status(200).json({msg:'You are login',token,status:true})

          }
        }
      
    } catch (error) {
        console.log(error)
    }
})
async function auntication (req,res,next){
    const bearerHeader = req.headers['authorization']
    if(typeof bearerHeader !== 'undefined'){
        let adf = bearerHeader.split(' ')
        req.token = adf[1]
         JWT.verify(req.token,process.env.SECRET_KEY,(err,authData)=>{
            if(err){
                res.json({err})
            }else{
                next()
            }
         })

    }else{
        res.send({'result':'token not found'})
    }
}
routes.get('/about',auntication,async(req,res)=>{
    let respe = await User.find({})
    res.send(respe)
})
routes.post('/register',async(req,res)=>{
    try {
        
        const {email,password,confirmPassword,name} = req.body
        let resp = await User.findOne({email})
        if(!email || !password || !confirmPassword || !name){
            res.status(404).send('wrong')
        }else if(resp){
        res.json({msg:'email is already is in used',status:false})
        }
        else {
            let ress =   new User({name,email,password})
           await ress.save()
          if(ress){
             
              res.status(201).json({msg:'registered succussfully ',status:true})
          }
        }
    } catch (error) {
        console.log(error)
    }
})
const sendResetPasswordMail = async(name,email,token,link)=>{
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            
            port:587,
            secure:false,
            requireTLS:false,
            auth:{
                user:process.env.USER,
                pass:process.env.PASS
            }
        })
        let info =  await transporter.sendMail({
            from:'<mhamzaking2020@gmail.com>',
            to:`${email}`,
            subject:'Hello bro',
            text:'this is hamza',
            html: `<b>Hello ${name} this is a reset link ${link} world?</b>`
        })
        console.log("Message sent: %s", info.messageId);
        console.log('email send successfully')
    } catch (error) {
        console.log({status:false,msg:error.message})
    }
}

routes.post('/forgot-password',async(req,res)=>{
    const {email} =req.body;
   
    let user = await User.findOne({email})
    if(email !== user?.email){
        res.send("user not registered")
        
        return;
    }

    const secrect = process.env.SECRET_KEY + user.password
    const payload = {
        email: user.email,
        id:user.id
    }
    const token = JWT.sign(payload,secrect,{expiresIn:'15m'})
    const link = `${process.env.BASEURL}/${user.id}/${token}`
    console.log(link)
    sendResetPasswordMail(user?.name,user?.email,token,link)
    res.status(200).json({msg:'passwrod send to your email addresss',status:true})
})
routes.get('/forgot-password',async(req,res,next)=>{
    res.render('forgot-password')
   

})
routes.post('/reset-password/:id/:token',async(req,res,next)=>{
    const {id,token} = req.params;
    const {password,password2} = req.body;
    let user = await User.findOne({id})

    if(id !== user.id){
        res.send('invalid id')
        return;
    }
    try {
        if(password !== password2){
            res.send('password not match')
        }else{
            let hashPassword = await bcrypt.hash(password,10)
            let resaf = await User.updateOne({id},{$set:{password:hashPassword}})
            
            res.send('password updated')
        }
        // res.send(user)
    } catch (error) {
        console.log(error.message)
        res.send(error.message)
    }
})
routes.get('/reset-password/:id/:token',async(req,res,next)=>{
    const {id,token} = req.params;
    let user = await User.findOne({id})
    if(id !== user.id){
        res.send('invalid id')
        return;
    }
    try {
        res.render('reset-password',{email:user.email})
    } catch (error) {
        console.log(error.message)
        res.send(error.message)
    }
})
module.exports= routes