const mongoose=require('mongoose');
const orderschema=mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
    name:{
      type:String
    },
      address: [
        {
        
          phone: String,
          city: String,
          governorate:String,
          fulladdress: String,
         
        },
      ],
      
      cartItems: [
        {
          product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
          },
          name: String,
          nameA: String,
        price: Number,
        priceA: String,
        quantity:Number,
        quantityA:String,
        total:Number,
        totalA:String,
        size: String,
        sizeA: String,
        image: String
        },
      ],
  
     
     
      totalOrderPrice: {
        type: Number,
      }, totalOrderPriceA: {
        type: String,
      },
      paymentMethodType: {
        type: String,
        enum: ['visa', 'cash'],
        default: 'cash',
      },
      isPaid: {
        type: Boolean,
        default: false,
      },
      paidAt: Date,
      paidAtA: String,
      ispacked:{
        type: Boolean,
        default: false,
      },
      isDelivered: {
        type: Boolean,
        default: false,
      },
      deliveredAt: Date,
      deliveredAtA: String,
      isarrived:{
        type: Boolean,
        default: false,
      }
      ,arrivedAt: Date,
      arrivedAtA: String,
      code:{type:String},
      codeA:{type:String},
      orderedata:Date,
      orderedataA:String
    },
   
)
exports.Order=mongoose.model('Order',orderschema);