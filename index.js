const express = require('express');
const app = express();
const path =require('path')
const bodyParser = require('body-parser');
const morgan=require('morgan');
const mongoose=require('mongoose');
const cors=require('cors');
const session=require('express-session')
const sessionsecret ="mysitesecret";
app.use(session({
    secret: "cookie_secret",
    resave: true,
    saveUninitialized: true
}));
const  {Product} = require('./models/product');
const User = require('./models/userModel');
const {Cart} = require('./models/cart');
const {Order} = require('./models/order');
const authservice=require("./services/authService")
const endpointSecret = process.env.endpointSecret; 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const moment = require('moment');
require('moment/locale/ar');
require('dotenv/config');
const authjwt=require('./helper/jwt')
const errorhandler=require('./helper/error-handler')

app.use(cors());
app.options('*',cors());
// app.use('/createvisaorderwebhook', express.raw({ type:'application/json' })); 
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
// Parse URL-encoded data
// app.use(bodyParser.urlencoded({ extended: false }));

// Parse raw JSON data
app.use(bodyParser.json());

//app.use(express.json())
app.use(express.static(path.join(__dirname,'uploads')))
app.use(morgan('tiny'));

const {
  webhookcheckfun
} = require("./services/productServcice");

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


// ...
app.post('/createvisaorderwebhook', bodyParser.raw({ type:'application/json' }), async(req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  const payloadString = JSON.stringify(req.body, null, 2);
  const secret = process.env.endpointSecret;
  const header = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret,
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(payloadString, header, secret);
    const paymentIntent = event.data.object.payment_intent;
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      console.log('Payment intent succeeded');
    }
    if(event.type==="payment_intent.succeeded"){
      const userOfOrder = await User.findOne({ email: event.data.object.receipt_email });
      console.log(userOfOrder._id);
      const cartuser=await Cart.findOne({user:userOfOrder._id})
  
    const totalOrderPrice = event.data.object.amount;
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
      user: userOfOrder._id,
      name:userOfOrder.name,
      cartItems: cartuser.cartItems,
      address:event.data.object.metadata,
      totalOrderPrice,
      totalOrderPriceA:convertToArabicNumber(totalOrderPrice),
      code: c,
      paymentMethodType:"visa",
      codeA:Number(c).toLocaleString('ar-EG', options),
      orderedata:new Date(),
      arrivedAt:newdate,
      orderedataA:d.format('YYYY-MM-DD').toString(),
      arrivedAtA:arabicnewdate,
     
    });
    await order.save()
 
    
  console.log('No error');
}
} catch (err) {
console.log(err.message);
return res.status(400).send(`Webhook Error: ${err.message}`);
}

// Send a successful response with a status of 200
res.status(200).send('OK');
});




const categoryRouter=require('./routes/categories');
const productRouter=require('./routes/products');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const userdata=require('./routes/users');
const orderRoute = require('./routes/orders');
const address=require('./routes/addressRoute')
const notification=require('./routes/notificationRoute')
const token=require('./routes/tokens')
const dashboardanalysis=require("./routes/Analysis")

const api=process.env.API_URL;
app.use(`${api}/admin`,userRoute);
app.use(`${api}/users`,authRoute);
app.use(`${api}/orders`,orderRoute);
app.use(`${api}/usersdata`,userdata);
app.use(`${api}/category`,categoryRouter);
app.use(`${api}/product`,productRouter);
app.use(`${api}/address`,address);
app.use(`${api}/not`,notification);
app.use(`${api}/token`,token);
app.use(`${api}/Analysis`,dashboardanalysis)

// database connection
mongoose.connect(process.env.connection_string)
.then(()=>{
    console.log('Database is connected')
})
.catch((err)=>{
console.log(err)
})


// port
app.listen(5000,(req,res)=>{
    
    console.log("server running");
})