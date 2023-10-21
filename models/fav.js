const mongoose=require('mongoose');
const favSchema=mongoose.Schema({
   


      productdata:[{
        productid: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required:true
          },
          name:{
            type:String,
            required:true,
    
        }, nameA:{
            type:String,
            required:true,
    
        },
        image:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true
        }, priceA:{
            type:String,
            required:true
        },
        size:{
            type:String,
            required:true
        },sizeA:{
            type:String,
            required:true
        },
      }],
    
    
   
   
   
    
   userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }, 
   
})

exports.Fav=mongoose.model('Fav',favSchema);