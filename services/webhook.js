const express = require('express');
const bodyParser = require('body-parser');
const path =require('path')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const app = express();
app.use(bodyParser.raw({ type: 'application/json' }));

exports.webhookcheckfun=asyncHandler(async (req, res, next) => {
 
    const sig = req.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
      
    }
    if(event.type===checkout.session.completed){
      console.log("ok")
    }
    else{
      console.log("no")
    }
  })