const crypto = require( 'crypto' );

const jwt = require( 'jsonwebtoken' );
const bcrypt = require( 'bcryptjs' );
const factory=require('./handlersFactory')
const asyncHandler = require( 'express-async-handler' );
const ApiError = require( '../utils/apiError' );
const sendEmail = require( '../utils/sendEmail' );
const createToken = require( '../utils/createToken' );
const {Fav}=require('../models/fav');
const User = require( '../models/userModel' );
const {Product}=require('../models/product')

const {Cart}=require('../models/cart')


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


const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalCartPriceA = convertToArabicNumber(totalPrice);
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};





// @desc    Signup
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler( async ( req, res, next ) => {
  // 1- Create user
  const user = await User.create( {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    gender:req.body.gender,
    birthdate:req.body.birthdate,
    phone:req.body.phone
  } );

  // 2- Generate token
  const token = createToken( user._id );

  res.status( 201 ).json( {message:"successfully register", data: user, token } );
} );

// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler( async ( req, res, next ) => {
  // 1) check if password and email in the body (validation)
  // 2) check if user exist & check if password is correct
  const user = await User.findOne( { email: req.body.email } );

  if ( !user || !( await bcrypt.compare( req.body.password, user.password ) ) ) {
    return res.status(401).json({message:"Incorrect email or password !!"})
  }
  // 3) generate token
  const token = createToken( user._id );
  req.session.user_id=user._id;
  // Delete password from response
  delete user._doc.password;
  // 4) send response to client side
  res.status( 200 ).json( { message:"successfully login",data: user, token } );
  
} );

// @desc   make sure the user is logged in
exports.protect = asyncHandler( async ( req, res, next ) => {
  // 1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith( 'Bearer' )
  ) {
    token = req.headers.authorization.split( ' ' )[ 1 ];
  }
  if ( !token ) {
    return next(
      new ApiError(
        'You are not login, Please login to get access this route',
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify( token, process.env.JWT_SECRET_KEY );

  // 3) Check if user exists
  const currentUser = await User.findById( decoded.userId );
  if ( !currentUser ) {
    return next(
      new ApiError(
        'The user that belong to this token does no longer exist',
        401
      )
    );
  }

  // 4) Check if user change his password after token created
  if ( currentUser.passwordChangedAt ) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // Password changed after token created (Error)
    if ( passChangedTimestamp > decoded.iat ) {
      return next(
        new ApiError(
          'User recently changed his password. please login again..',
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
} );

// @desc    Authorization (User Permissions)
// ["admin", "manager"]
exports.allowedTo = ( ...roles ) =>
  asyncHandler( async ( req, res, next ) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if ( !roles.includes( req.user.role ) ) {
      return next(
        new ApiError( 'You are not allowed to access this route', 403 )
      );
    }
    next();
  } );
var mail;
// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler( async ( req, res, next ) => {
  // 1) Get user by email
  const user = await User.findOne( { email: req.body.email } );
  if ( !user ) {
    return res.status(404).json({message:"There is no account with that email "}) 
    
  }
  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor( 1000 + Math.random() * 9000 ).toString();
  const hashedResetCode = crypto
    .createHash( 'sha256' )
    .update( resetCode )
    .digest( 'hex' );

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;


  await user.save();

  // 3) Send the reset code via email
  const message = `Hi ${ user.name },\n We received a request to reset the password on your E-shop Account. \n ${ resetCode } \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;
  try {

    await sendEmail( {
      email: user.email,
      subject: 'Your password reset code (valid for 10 min)',
      message,
    } );


  } catch ( err ) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;


    await user.save();
    return res.status(500).json({message:'There is an error in sending email'})
  }
   mail=req.body.email
  res.status( 200 ).json( { message: 'check your email for the code that has been sent' } );
} );

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode =  asyncHandler( async ( req, res, next ) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash( 'sha256' )
    .update( req.body.resetCode )
    .digest( 'hex' );

  const user = await User.findOne( {
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  } );
  if ( !user ) {
    return res.status(404).send({message:"Reset code invalid or expired"})
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();
  
 return res.status( 200 ).json( {
    status: 'correct code',
  } );
  
} );


exports.getfav = asyncHandler(async (req, res, next) => {
  let fav;
  if (req.params.lang === "en") {
    fav= await Fav.find({ userid: req.user._id}).select("-productdata.nameA -productdata.priceA -productdata.sizeA");
   
  } else if (req.params.lang === "ar") {
    fav = await Fav.find({ userid: req.user._id }).select('-productdata.name -productdata.price -productdata.size');
  }
  res.status(200).send({ User: fav });
});

//

exports.deleteonefav=asyncHandler(async(req,res,next)=>{
  const fav = await Fav.findOneAndUpdate(
    { userid: req.user._id},
    {
      $pull: { productdata: { productid: req.params.id } },
    },
    { new: true }
  );

  
  fav.save();

  res.status(200).json({
   
    data: fav,
  });
  })

exports.addfav=asyncHandler(async(req,res,next)=>{
  let flag;
  const product = await Product.findById(req.params.productId)
   console.log(product)
 if(req.user._id){
   console.log(req.user._id)
  
   let fav = await Fav.findOne({ userid: req.user._id});
 
   if (!fav) {
    
     fav = await Fav.create({
      userid: req.user._id,
      productdata: [{ productid: req.params.productId,name:product.name,nameA:product.nameA,image:product.imageCover,size:product.size,sizeA:product.sizeA, price: product.priceafter,priceA: product.priceafterA}],
     });
   } else {
     
       fav.productdata.push({productid: req.params.productId,name:product.name,nameA:product.nameA,image:product.imageCover,size:product.size,sizeA:product.sizeA, price: product.priceafter,priceA: product.priceafterA});
     
   }
 
   
   await fav.save();
 
   res.status(200).json({
     
     data: fav,
   });
 }
 else{
   res.status(201).send("please login first")
 }
});


exports.addtocart= asyncHandler( async ( req, res, next ) => {
  const product = await Product.findById(req.params.productId)
 const color=req.body.color
  console.log(req.params.productId)
if(req.user._id){
  console.log(req.user._id)
  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user._id});

  if (!cart) {
  var im=product.imageCover
  console.log(im.toString())
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: req.params.productId,name:product.name,nameA:product.nameA,color:color,quantity:req.body.quantity,quantityA:convertToArabicNumber(req.body.quantity),image:product.imageCover,size:product.size,sizeA:product.sizeA, price: product.priceafter,priceA:product.priceafterA,total:product.priceafter*req.body.quantity,totalA:convertToArabicNumber(product.priceafter*req.body.quantity) }],
    });
  } else {
    // product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === req.params.productId && item.color === color
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += req.body.quantity;
      cartItem.quantityA=convertToArabicNumber( cartItem.quantity);
      cartItem.total= cartItem.quantity * cartItem.price
      cartItem.totalA=convertToArabicNumber(cartItem.total)
      cart.cartItems[productIndex] = cartItem;
    } else {
      // product not exist in cart,  push product to cartItems array
      cart.cartItems.push({ product: req.params.productId,name:product.name,nameA:product.nameA,color:color,quantity:req.body.quantity,quantityA:convertToArabicNumber(req.body.quantity),image:product.imageCover,size:product.size,sizeA:product.sizeA, price: product.priceafter,priceA:product.priceafterA,total:product.priceafter*req.body.quantity,totalA:convertToArabicNumber(product.priceafter*req.body.quantity)  });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    message: 'Product added to cart successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
}
else{
  res.status(201).send("please login first")
}
});


exports.getmycart=asyncHandler(async(req,res,next)=>{
  if(req.user._id){
    let cart
    if(req.params.lang==="en")
     cart=await Cart.find({user:req.user._id}).select("-cartItems.sizeA -cartItems.totalA -cartItems.priceA -cartItems.nameA -cartItems.quantityA -totalCartPriceA")
    else if(req.params.lang=="ar")
    cart=await Cart.find({user:req.user._id}).select("-cartItems.size -cartItems.total -cartItems.price -cartItems.name -cartItems.quantity -totalCartPrice")
 // print all carts of user and total
 if(cart.length>0)
  res.send({cart:cart})
  else res.send({cartItems:[]})
  }
  else res.send('please login and add products to your cart')
})

exports.increasequantity=asyncHandler(async(req,res,next)=>{
  const product = await Product.findById(req.params.id)
  // 1) Get Cart for logged user
  if(req.user._id){
  let cart = await Cart.findOne({ user: req.user._id});
  
  const productIndex = cart.cartItems.findIndex(
    (item) => item.product.toString() === req.params.id
  );

  if (productIndex > -1) {
    const cartItem = cart.cartItems[productIndex];
    cartItem.quantity += 1;
    cartItem.total= cartItem.quantity * cartItem.price
    cart.cartItems[productIndex] = cartItem;
  }
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    message: 'successfully increased',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });}
  else{
    res.send({message:"please login first"})
  }
})


exports.decreasequantity=asyncHandler(async(req,res,next)=>{
  const product = await Product.findById(req.params.id)
  // 1) Get Cart for logged user
 // console.log(req.user._id)
  if(req.user._id){
  let cart = await Cart.findOne({ user: req.user._id});
  
  const productIndex = cart.cartItems.findIndex(
    (item) => item.product.toString() === req.params.id
  );

  if (productIndex > -1) {
    const cartItem = cart.cartItems[productIndex];
    if(cartItem.quantity==0) return res.status(201).send("cant be less than 0")
    cartItem.quantity -= 1;
    cartItem.total= cartItem.quantity * cartItem.price
    cart.cartItems[productIndex] = cartItem;
  }
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    message: 'successfully increased',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });}
  else{
    res.status(201).send({message:"please login first"})
  }
})



exports.deletefromcart=asyncHandler(async(req,res,next)=>{
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id},
    {
      $pull: { cartItems: { _id: req.params.cartitem } },
    },
    { new: true }
  );

  calcTotalCartPrice(cart);
  cart.save();

  res.status(200).json({
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
})

exports.updatecart=asyncHandler(async(req,res,next)=>{
 
  const cart= await Cart.findOne({user:req.user._id})
  if(cart){
    if(req.params.lang==="en"){
  for(var x=0;x<cart.cartItems.length;x++){
   // console.log(req.body.quantity[x])
   cart.cartItems[x].quantity=req.body.quantity[x];
   cart.cartItems[x].quantityA=convertToArabicNumber(req.body.quantity[x]);
   cart.cartItems[x].total= cart.cartItems[x].quantity*cart.cartItems[x].price;
   cart.cartItems[x].totalA= convertToArabicNumber(cart.cartItems[x].quantity*cart.cartItems[x].price);
   
  }  }
  else if(req.params.lang==="ar"){
    for(var x=0;x<cart.cartItems.length;x++){
      // console.log(req.body.quantity[x])
      
      cart.cartItems[x].quantity=convertArabicToEnglishInt(req.body.quantity[x]);
      cart.cartItems[x].quantityA=req.body.quantity[x];
      cart.cartItems[x].total= (convertArabicToEnglishInt(req.body.quantity[x])*cart.cartItems[x].price);
      cart.cartItems[x].totalA= convertToArabicNumber(convertArabicToEnglishInt(req.body.quantity[x])*cart.cartItems[x].price);
      
     } 
  }
 calcTotalCartPrice(cart);
 
 await cart.save();
 res.status(200).send({cart:cart})
  }
  else {
    res.status(201).send({cartItems:[]})
  }
})


exports.getProducts = factory.getAll(Product, 'Products');


// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler( async ( req, res, next ) => {
  // 1) Get user based on email
  console.log(mail)
  const user = await User.findOne( { email: mail } );
  if ( !user ) {
    return res.status(404).json({message:"There is no user with email"}) 
  }

  // 2) Check if reset code verified
  if ( !user.passwordResetVerified ) {
    return res.status(400).json({message:"Reset code not verified"}) 
  }


  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = createToken( user._id );
  res.status( 200 ).json( {message:"password correctly changed", token } );
} );




