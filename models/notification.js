const mongoose=require('mongoose');
const notificationSchema=mongoose.Schema({

   not:[
    {
    message:{
        required:true,
        type:String
    }, messageA:{
        required:true,
        type:String
    }
    , date:{
        required:true,
        type:Date
      },dateA:{
        required:true,
        type:String
      },
      typeofnot:{
        reqired:true,
         type:String
      },
      typeofnotA:{
        reqired:true,
         type:String
      }
}
   ],
   token:{
    required:true,
    type:String
   },
  
}
    )
exports.Notification=mongoose.model('Notification',notificationSchema);