const router = require("express").Router();
const User = require("../models/userModel");
const {Cart}=require("../models/cart")
const {Fav}=require("../models/fav")
const authservice=require("../services/authService")
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verify-token");
const  {Product} = require('../models/product');
const authn=require('../middlewares/auth');
const session = require("express-session");


const {uploadUserImage,resizeImage}=require('../services/userService')

// add to cart
router.post("/addtocart/:productId",authservice.protect,authservice.addtocart)

//get cart of user who is login
router.get('/getcartofuser/:lang',authservice.protect,authservice.getmycart)


router.post('/deleteitemofcart/:cartitem',authservice.protect,authservice.deletefromcart)

router.put('/editcart/:lang',authservice.protect,authservice.updatecart)

// Pick ProfileImage
router.put('/updateimage',authservice.protect,
uploadUserImage,
resizeImage
,async(req,res)=>{
  
  if(req.user._id){
  const user = await User.findByIdAndUpdate(
    req.user._id
      ,
      {
        
        profileImg:req.body.profileImg,
        

      },
      {new:true}
      );
  if(!user){
      return res.status(400).json({message:'user not exist'})
  }
  return res.status(200).json(user);
}
  else return res.status(404).json({message:'user not found'})


})

//get Profile Data Username & ProfileImage
router.get('/user',authservice.protect,async(req,res,next)=>{
  const userdata= await User.findById( req.user._id);
  if(userdata){
    //console.log(userdata.email)
   return res.status(200).send({name:userdata.name, profileImg:userdata.profileImg ,Email:userdata.email})
  }
return res.status(404).send('Not Found')
})

//get Profile Data Username & ProfileImage
router.get('/userbyid/:id',async(req,res,next)=>{
  const userdata= await User.findById( req.params.id);
  if(userdata){
    //console.log(userdata.email)
   return res.status(200).send({user:userdata})
  }
return res.status(404).send('Not Found')
})

// Update profile of user
router.put('/updateprofile',authservice.protect,
uploadUserImage,
resizeImage,
async(req,res)=>{
  const user = await User.findByIdAndUpdate(
    req.user._id
      ,
      {
        // update profile
        profileImg:req.body.profileImg,
        name:req.body.name,
        phone:req.body.phone

      },
      {new:true}
      );
  if(!user){
      res.status(400).json({message:'user not exist'})
  }
  res.status(200).json(user);

})
















//add to fav
router.post('/addfav/:productId',authservice.protect,authservice.addfav)

//get fav of user who is login
router.get('/getfavofuser/:lang',authservice.protect,authservice.getfav)

// remove from favourites
router.post('/deletefromfav/:id',authservice.protect,authservice.deleteonefav)

router.get('/getallproducts/:lang',authservice.getProducts)

module.exports = router;
