const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const Fcm=require('fcm-node')
const serverkey='AAAAJPHV4uM:APA91bH8aXcq2e2P0RX3WtfzLJUFpZ2syAo1n8pgy-GzkQI28GwJnO_LSb28kcPUgDTwxQzpfIvGj_4yIy4NIb8K5rGx2st81w5NYcSoC3CQz3xdmOCi93cRSL7DSMHnPTiBJQg1ee6y'
const {Token}=require("../models/token")
const {Notification}=require('../models/notification')
const admin = require("firebase-admin");
const serviceAccount = require("../e-commerce-notification-963e4-firebase-adminsdk-5w7i4-0da7a97ee1.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://e-commerce-notification-963e4.firebaseio.com"
});

const moment = require('moment');
require('moment/locale/ar');

router.post("/sendnotificationtospecific", async(req, res) => {
  const { tokens, message,typeofnot,messageA,typeofnotA } = req.body;

// Send a notification to each user
for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i];
  const payload = {
    notification: {
      title: "New notification",
      body: message,
      typeofnot:req.body.typeofnot,
      typeofnotA:req.body.typeofnotA,
      messageA:req.body.messageA
      // icon: "your-icon-url",
      // click_action: "your-link-url"
    }
  };
// console.log(notification)
const arabicDate = moment().locale('ar');
const arabicDateString = arabicDate.format('DD/MM/YYYY');

var d = arabicDate;
console.log(d.format('YYYY-MM-DDTHH:mm:ssZ').toString());

  admin.messaging().sendToDevice(token, payload)
    .then((response) => {
      console.log("Notification sent successfully:", response);
    })
    .catch((error) => {
      console.log("Error sending notification:", error);
    });

    let notification = await Notification.findOne({ token:tokens[i]});
    if(!notification){
    
       notification = new Notification({
        token:tokens[i],
        not:[{message:payload.notification.body,messageA:payload.notification.messageA,date:new Date(),dateA:d.format('YYYY-MM-DDTHH:mm:ssZ').toString(),typeofnot:payload.notification.typeofnot,typeofnotA:payload.notification.typeofnotA}],
        
      })
     console.log(notification)
    }
    else{
      notification.not.push({
        message:payload.notification.body,
        messageA:payload.notification.messageA,
        typeofnot:payload.notification.typeofnot,
        typeofnotA:payload.notification.typeofnotA,
        date:new Date(),
        dateA:d.format('YYYY-MM-DD').toString()
      })
      console.log(notification)
    }
 
    await notification.save();
}

res.send("Notifications sent successfully");
});





router.post("/sendnotificationtoall", async(req, res) => {

const arroftoken=[]
const tokenss = await Token.find();

for(var i=0;i<tokenss.length;i++){
  arroftoken[i]=tokenss[i].token
}

    const message = req.body.message;
    for (let i = 0; i < arroftoken.length; i++) {
      const token = arroftoken[i];
      const payload = {
        notification: {
          title: "New notification",
          body: message,
          typeofnot:req.body.typeofnot,
          typeofnotA:req.body.typeofnotA,
      messageA:req.body.messageA          
          // icon: "your-icon-url",
          // click_action: "your-link-url"
        }
      };
      const arabicDate = moment().locale('ar');
      const arabicDateString = arabicDate.format('DD/MM/YYYY');
      
      var d = arabicDate;
      console.log(d.format('YYYY-MM-DDTHH:mm:ssZ').toString());
      
      admin.messaging().sendToDevice(token, payload)
        .then((response) => {
          console.log("Notification sent successfully:", response);
        })
        .catch((error) => {
          console.log("Error sending notification:", error);
        });
  
        let notification = await Notification.findOne({ token:arroftoken[i]});
        if(!notification){
        
           notification = new Notification({
            token:arroftoken[i],
            not:[{message:payload.notification.body,messageA:payload.notification.messageA,date:new Date(),dateA:d.format('YYYY-MM-DDTHH:mm:ssZ').toString(),typeofnot:payload.notification.typeofnot,typeofnotA:payload.notification.typeofnotA}],
            
          })
         console.log(notification)
        }
        else{
          notification.not.push({
            message:payload.notification.body,
        messageA:payload.notification.messageA,
        typeofnot:payload.notification.typeofnot,
        typeofnotA:payload.notification.typeofnotA,
        date:new Date(),
        dateA:d.format('YYYY-MM-DD').toString()
          })
          console.log(notification)
        }
     
        await notification.save();
    }
  
    res.send("Notifications sent successfully");
  });
  

///////////////////////////////////////////////////////////////////////

router.get("/getmynotifications/:token/:lang",async(req,res,next)=>{
  let notification;
  if( req.params.lang==="en"){
    notification = await Notification.find({token:req.params.token}).select("-not.messageA -not.dateA -not.typeofnotA");
  }
  else if(req.params.lang==="ar"){
    notification = await Notification.find({token:req.params.token}).select("-not.message -not.date -not.typeofnot");
  }
   
  if (!notification) {
    res.status(500).json({ message: "notification not exist" });
  }
  res.status(200).json(notification);
})

/////////////////////////////////////////////////////////////////////



module.exports=router;