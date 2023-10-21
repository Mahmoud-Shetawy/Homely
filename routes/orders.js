const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const  {Product} = require('../models/product');
const {User} = require('../models/userModel');
const {Cart} = require('../models/cart');
const {Order} = require('../models/order');
const authservice=require("../services/authService")
const moment = require('moment');
require('moment/locale/ar');
const stripe = require('stripe')('sk_test_51MbrWkCZfkxLI2Yni3sSZeOv0Kkdz7n8pPkzoEdQwdFpsPhNEFcLs0EMZtHawEWRSLYvSxBcKwGeS9xIAEjeXoQW00aAs3QUDB');

function convertToArabicNumber(number) {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const arabicNumber = String(number).split('').map(digit => arabicDigits[digit] || digit).join('');
  return arabicNumber;
}
function convertArabicToEnglishInt(arabicNumber) {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  let englishNumber = "";
  
  for (let i = 0; i < arabicNumber.length; i++) {
    const digit = arabicDigits.indexOf(arabicNumber[i]);
    
    if (digit !== -1) {
      englishNumber += digit;
    }
  }
  
  return Number(englishNumber);
}

router.post('/createvisaorder/:cartId',authservice.protect, async (req, res) => {
  try {
    // Get the payment information from the request body
    let { amount, source, name, email } = req.body;
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
      return res.status(404).send("There is no such cart")
    }
    const totalOrderPrice = cart.totalCartPrice;
  
     amount=totalOrderPrice*100
    // Create a payment intent using the Stripe API
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'egp',
      metadata: req.body.address,
      payment_method_types: ['card'],
      receipt_email: req.user.email,
      description: `Payment for ${req.user.name}`,
    
     
    });
    

    // Confirm the payment intent using a test card number
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
    
      billing_details:{
        
        name:req.user.name,
        email:req.user.email,
        phone:req.user.phone
      },
      card: {
        number:req.body.number,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvc: req.body.cvc,
      },
    });
    
    await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: paymentMethod.id,
    });

    // Send a response back to the client to indicate that the payment was successful
     res.send( paymentIntent);
   
  } catch (error) {
    // Handle any errors that occur during payment creation
    console.error(error);
    res.status(500).send('Payment failed');
  }
});



////////////////////////////////////////////////////////////
router.get('/getlastaddress',authservice.protect,async(req,res,next)=>{
  console.log(req.user._id)
  const useraddress =  await User.findById(req.user._id)
if(useraddress){
  res.status(200).json({address:useraddress.addresses[useraddress.addresses.length-1]})
}
else{ res.status(201).json({address:[]})}
})










router.post('/createcashorder/:cartId',authservice.protect,async(req,res)=>{

  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return res.status(404).send("There is no such cart")
  }


  const totalOrderPrice = cart.totalCartPrice;
  var newdate = new Date();
  newdate.setDate(newdate.getDate() + 5);
  var arabicnewdate = newdate.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const arabicDate = moment().locale('ar');
  const arabicDateString = arabicDate.format('DD/MM/YYYY');
  var d = arabicDate;

  var options = {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  };
  
   var c=Math.floor( 100000 + Math.random() * 900000 ).toString()
  const order = await Order.create({
    user: req.user._id,
    name:req.user.name,
    cartItems: cart.cartItems,
    address:req.body.address,
    totalOrderPrice,
    totalOrderPriceA:convertToArabicNumber(totalOrderPrice),
    code: c,
    codeA:Number(c).toLocaleString('ar-EG', options),
    orderedata:new Date(),
    arrivedAt:newdate,
    orderedataA:d.format('YYYY-MM-DD').toString(),
    arrivedAtA:arabicnewdate,
   
  });

    
for(var i=0;i<order.cartItems.length;i++){
 // console.log(order.cartItems[i].product)
 const pro = await Product.findById(order.cartItems[i].product);
 
 const product = await Product.findByIdAndUpdate(
  order.cartItems[i].product,
   {
    totalnumofproducts:pro.totalnumofproducts -order.cartItems[i].quantity,
    totalavilable:pro.totalavilable -order.cartItems[i].quantity,
    totalsell: pro.totalsell +order.cartItems[i].quantity,
 
   },

   { new: true }
 );

}
await Cart.findByIdAndDelete(req.params.cartId);

  res.status(201).json({ message: 'successfully done!!', data: order });
})


router.get('/getorders/:lang',authservice.protect,async(req,res,next)=>{
let order;
if(req.params.lang==="en"){
  order=await Order.find({user: req.user._id}).select("-cartItems.nameA -cartItems.priceA -cartItems.quantityA -cartItems.totalA -cartItems.sizeA -totalOrderPriceA -arrivedAtA -codeA -orderedataA -deliveredAtA -paidAtA")
}
else if(req.params.lang==="ar")
      order=await Order.find({user: req.user._id}).select("-cartItems.name -cartItems.price -cartItems.quantity -cartItems.total -cartItems.size -totalOrderPrice -arrivedAt -code -orderedata -deliveredAt -paidAt")
     res.status(200).send( {Orders:order}
     )
  
 
  
})

// get all orders

router.get('/allorders',async(req,res,next)=>{
  const order=await Order.find()
  res.status(200).send({Orders:order})
})
router.get('/singleorder/:id/:lang',async(req,res,next)=>{
  let order;
  if(req.params.lang==="en")
   order=await Order.findById(req.params.id).select("-cartItems.nameA -cartItems.priceA -cartItems.quantityA -cartItems.totalA -cartItems.sizeA -totalOrderPriceA -arrivedAtA -codeA -orderedataA -deliveredAtA -paidAtA")
   else if(req.params.lang==="ar")
   order=await Order.findById(req.params.id).select("-cartItems.name -cartItems.price -cartItems.quantity -cartItems.total -cartItems.size -totalOrderPrice -arrivedAt -code -orderedata -deliveredAt -paidAt")
  if(order)
  res.status(200).send({Orders:order})
})
// // get single order
// router.get('/singleorder/:id',authservice.protect,async(req,res,next)=>{
//  const order= await Order.find(req.params.id)
//  console.log(order.cartItems.length)
//  for(var i=0;i<order.cartItems.length;i++){
//   console.log(order.cartItems[i])
//  }
  
// })


router.put('/orderbecomepaid/:id',async(req,res,next)=>{
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).send("There is no such a order")
  }
  const arabicDate = moment().locale('ar');
  const arabicDateString = arabicDate.format('DD/MM/YYYY');
  var d = arabicDate;
  order.isPaid = true;
  order.paidAt = Date.now();
  order.paidAtA=d.format('YYYY-MM-DD').toString()
  const updatedOrder = await order.save();
  res.status(200).json({ status: 'successfully updated', data: updatedOrder });
})
router.put('/orderbecomepacked/:id',async(req,res,next)=>{
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).send("There is no such a order")
  }
  order.ispacked = true;
  const updatedOrder = await order.save();
  res.status(200).json({ status: 'successfully updated', data: updatedOrder });
})
router.put('/orderbecomedelivered/:id',async(req,res,next)=>{
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).send("There is no such a order")
  }
  const arabicDate = moment().locale('ar');
  const arabicDateString = arabicDate.format('DD/MM/YYYY');
  var d = arabicDate;
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.deliveredAtA=d.format('YYYY-MM-DD').toString()
  const updatedOrder = await order.save();
  res.status(200).json({ status: 'successfully delivered', data: updatedOrder });
})
router.put('/orderbecomearrived/:id',async(req,res,next)=>{
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).send("There is no such a order")
  }
  order.isarrived = true;
  const updatedOrder = await order.save();
  res.status(200).json({ status: 'successfully delivered', data: updatedOrder });
})
module.exports=router;