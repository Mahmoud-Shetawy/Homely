const mongoose=require('mongoose');
const productSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,

    },
    nameA:{
      type:String,
      required:true,
    },
    description:{
        type:String,
        required:true
    },
    descriptionA:{
      type:String,
      required:true
  },
    image:{
        type:String,
       
    },
    imageCover: {
      type: String,
     
    },
    price:{
        type:Number,
        required:true
    },
    priceA:{
      type:String,
      required:true
  },
    size:{
        type:String,
         required:true
    },
    sizeA:{
      type:String,
       required:true
  },
    ispopular:{
        type:Boolean,
        default:false

    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    }, 
    priceafter:{
   type: Number,
   required: true
    },
    priceafterA:{
      type: String,
      required: true
       },
    discount:{
        type:Number,
        default:0
    },
    discountA:{
      type:String,
      default:0
  },
    hasoffer:{
        type:Boolean,
        default:false
    },

    totalnumofproducts:{
        type:Number,
        required:true
    },
    totalavilable:{
        type:Number,
        required:true
    },totalsell:{
        type:Number,
      default:0
    },material:{
  type:String,
  required:true
    },
    materialA:{
      type:String,
      required:true
        },
    color: [String],
    
isfav:{
  type:Boolean,
  default:0,
}

})

const setImageURL = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.image) {
      const imageUrl = `${process.env.BASE_URL}/products/${doc.image}`;
    doc.image = imageUrl;
  }
};
productSchema.post('init', (doc) => {
  setImageURL(doc);
});

productSchema.post('save', (doc) => {
  setImageURL(doc);
});

exports.Product=mongoose.model('Product',productSchema);
