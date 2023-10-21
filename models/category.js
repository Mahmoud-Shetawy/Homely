const mongoose=require('mongoose');
const categorySchema=mongoose.Schema({

name:{
    type:String,
    require:true,
    unique: true,

},
nameA:{
  type:String,
  require:true,
  unique: true,
},
image: {
    type:String,
    require:true,
}


})

// const setImageURL = (doc) => {
//   if (doc.image) {
//     const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
//     doc.image = imageUrl;
//   }
// };
// // findOne, findAll and update
// categorySchema.post('init', (doc) => {
//   setImageURL(doc);
// });

// // create
// categorySchema.post('save', (doc) => {
//   setImageURL(doc);
// });

exports.Category=mongoose.model('Category',categorySchema);
