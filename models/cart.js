const mongoose=require('mongoose');
const cartSchema=mongoose.Schema({
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
        },
        quantityA: {
          type: String,
          default: "1",
        },
        name: String,
        nameA: String,
        price: Number,
        priceA: String,
        color:String,
        total:{
            type:Number,
            default:1
        }, totalA:{
          type:String,
          default:1
      },
        size: String,  
        sizeA: String,
        image: String
      },
    ],
    totalCartPrice: Number,
    totalCartPriceA: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required:true
    },
})

exports.Cart=mongoose.model('Cart',cartSchema);