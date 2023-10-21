const express = require('express');

const User= require("../models/userModel");
const {Order}=require("../models/order")
const router = express.Router();
const {Category}=require("../models/category")
const {Product}=require("../models/product")
router.get("/numofallusers", async (req, res, next) => {
    try {
      const users = await User.find({});
     
      if (users) {
        
        res.status(200).send({Users:users.length.toString()});
      } else {
        res.status(404).send("There are no users in the app");
      }
    } catch (error) {
      
      res.status(500).send("An error occurred");
    }
  });
  
  router.get("/numofallorders",async(req,res,next)=>{
    try {
        const orders = await Order.find({});
        if (orders) {
          res.status(200).send({Orders:orders.length.toString()});
        } else {
          res.status(404).send("There are no orders in the app");
        }
      } catch (error) {
       
        res.status(500).send("An error occurred");
      }
  })


 router.get("/calculatetotalorders",async(req,res,next)=>{
    try {
        var sum=0;
        const orders = await Order.find({});
        if (orders) {
          
        for(var i=0;i<orders.length;i++){
            sum+=orders[i].totalOrderPrice
        }

          return res.status(200).send({Total:sum.toString()});
        } else {
          res.status(404).send("There are no orders in the app");
        }
      } catch (error) {
       
        res.status(500).send("An error occurred");
      }
 }) 

router.get("/totalsoldineachcategory",async(req,res,next)=>{
const cat=await Category.find({});
if(cat){
  
   var categoriesid=[]
   var categoriesname=[]
   const map = new Map();
   for(var i=0;i<cat.length;i++){
   categoriesid.push(cat[i]._id.toString())
   categoriesname.push(cat[i].name)
   map.set(cat[i].name,0)
   }
//    console.log(categoriesid)
//    console.log(categoriesname)
   const order=await Order.find({})
   if(order){
    
    for(var i=0;i<order.length;i++){
     
    //  console.log(order[i].cartItems[0].product)
         const pro= await Product.find({_id:order[i].cartItems[0].product}).select("category")
         if(pro){
            //   console.log(pro[0].category.toString())
            let index = categoriesid.indexOf(pro[0].category.toString());
            if (index !== -1) {
                const value=map.get(categoriesname[index])
                    map.set(categoriesname[index], value+(order[i].cartItems[0].total));
                  
              
            } 
         }
      
    }
    
   }
   const data = Object.fromEntries(map);

   res.status(200).json(data);
}
})
router.get("/highsoldproducts",async(req,res,next)=>{
    try {
        const pro = await Product.find({});
        const map = new Map();
        if (pro) {
            
          for(var i=0;i<pro.length;i++){
            map.set(pro[i].name,pro[i].totalsell)
          }
          const sortedArray = Array.from(map).sort((a, b) => {
            const valueA = a[1];
            const valueB = b[1];
            return valueB - valueA; 
          });
          
         
          const sortedMap = new Map(sortedArray);
          const data = Object.fromEntries(sortedMap);

   res.status(200).json({Products:data});
        //   console.log(sortedMap);
        } else {
          res.status(404).send("There are no Products in the app");
        }
      } catch (error) {
        
        res.status(500).send("An error occurred");
      }
})
router.get("/whomakeorders",async(req,res,next)=>{
    const set = new Set();
    const orders = await Order.find({});
        if (orders) {
            for(var i=0;i<orders.length;i++){
                if (!set.has(orders[i].user.toString())) {
            set.add(orders[i].user.toString())
            }
        }}
        const dataArray = Array.from(set);

        res.status(200).json({Users:dataArray.length});
})
module.exports = router;
