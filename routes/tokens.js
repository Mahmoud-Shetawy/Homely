const express = require("express");

const router = express.Router();
const {Token}=require("../models/token")
const authservice=require("../services/authService")

const jwt = require( 'jsonwebtoken' );
const User = require( '../models/userModel' );



router.get("/gettokenofuser",async(req,res,next)=>{
const token= await Token.find()
res.status(200).send(token)
})




router.post("/addtokens",async(req,res,next)=>{
    let x= await Token.findOne({token:req.body.token})
if(!x){
    let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith( 'Bearer' )
  ) {
    token = req.headers.authorization.split( ' ' )[ 1 ];
  }
  if ( !token ) {
    token = new Token(
        {
            token:req.body.token
        }
    )
    await token.save()
    res.send(token)
  }

  else{

  const decoded = jwt.verify( token, process.env.JWT_SECRET_KEY );

  const currentUser = await User.findById( decoded.userId );
  
  req.user = currentUser;
  token = new Token(
    {
        token:req.body.token,
        user:req.user._id
    }
)
await token.save()
res.send(token)
}}
else {

    let tokens;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith( 'Bearer' )
    ) {
      tokens = req.headers.authorization.split( ' ' )[ 1 ];
    }
    if ( !tokens ) {
        res.send("Token already exist")
    }
    else{

        const decoded = jwt.verify( tokens, process.env.JWT_SECRET_KEY );
      
        const currentUser = await User.findById( decoded.userId );
        
        req.user = currentUser;

        let token = await Token.findOne({ token: req.body.token});
      token.user=req.user._id;
       await token.save()
        res.send(token)

    }

   
}
})









router.post("/addtokens",authservice.protect,async(req,res,next)=>{
    
    let token
    console.log(req.user._id)
    if(req.user._id){
     token = new Token(
        {
            token:req.body.token,
            user:req.user._id
        }
    )
    }
    else{
        token = new Token(
            {
                token:req.body.token
            }
        )
    }

    await token.save()
    res.send(token)
})

module.exports = router;