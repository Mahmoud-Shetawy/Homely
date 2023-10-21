const mongoose=require('mongoose');
const tokenSchema=mongoose.Schema({

  
   token:{
    required:true,
    type:String
   },
   user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },

  
}
    )
exports.Token=mongoose.model('Token',tokenSchema);