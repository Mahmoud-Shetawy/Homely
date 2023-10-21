const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');
const {Fav}=require("../models/fav")

const jwt = require( 'jsonwebtoken' );
const User = require( '../models/userModel' );
const {Product}=require("../models/product")
exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    // Trigger "remove" event when update document
    document.remove();
    res.status(204).send();
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    // Trigger "save" event when update document
    document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    console.log("jjj")
    const { id } = req.params;
    // 1) Build query
    let query = Model.findById(id);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    // 2) Execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    console.log(document)
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = '') =>
  asyncHandler(async (req, res) => {
  
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    // Build query
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    let documents;
    if(req.params.lang==="ar")
     documents = await mongooseQuery.select("-name -description -material -price -size -discount -priceafter");
else if(req.params.lang==="en")
documents = await mongooseQuery.select("-nameA -descriptionA -materialA -priceA -sizeA -discountA -priceafterA");

for(var i=0;i<documents.length;i++){
  ///console.log(documents[i]._id)
 documents[i].isfav=false
}


let tokens;
if (
  req.headers.authorization &&
  req.headers.authorization.startsWith( 'Bearer' )
) {
  tokens = req.headers.authorization.split( ' ' )[ 1 ];
}
if(tokens){

    const decoded = jwt.verify( tokens, process.env.JWT_SECRET_KEY );
  
    const currentUser = await User.findById( decoded.userId );
    
    req.user = currentUser;
    let fav= await Fav.find({userid:req.user._id})
  
   if(fav[0]&&fav[0].productdata.length){
    for(var k=0;k<fav[0].productdata.length;k++){
      let pro = await Product.findById(fav[0].productdata[k].productid)
      if(pro) {
       
       for(var i=0;i<documents.length;i++){
        if(documents[i]._id.toString()==pro._id.toString())
       documents[i].isfav=true
       }
      }
    }
   }
}
//     for(var i=0;i<documents.length;i++){
//       console.log(documents[i].image)
//     }
//     let fav= await Fav.find({userid:req.user._id})
//   //  console.log(fav[0].productdata)
//     if(fav[0]&&fav[0].productdata.length){
    
//      for(var k=0;k<fav[0].productdata.length;k++){
//       // console.log(fav[0].productdata[k].productid)
//      let pro = await Product.findById(fav[0].productdata[k].productid)
//   //  console.log(fav[k].productdata[k].productid)
//        if(pro) {
      
//         for(var i=0;i<documents.length;i++){
//           ///console.log(documents[i]._id)
//        if(documents[i]._id.toString()==pro._id.toString())
//        documents[i].isfav=true
      
//         }
//         pro.isfav=true
//         console.log(pro._id)
//         await pro.save()
       
//       }
// }
//     }

// }


res.status(200).json({ results: documents.length, paginationResult, data: documents });
    

  });
