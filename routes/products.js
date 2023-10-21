const { Product } = require("../models/product");
const express = require("express");
const authservice = require("../services/authService");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const User = require( '../models/userModel' );
const service=require("../services/authService")
const {Fav}=require("../models/fav")
const jwt = require( 'jsonwebtoken' );
const {
  uploadProductImages,
  resizeProductImages,
  addimage
} = require("../services/productServcice");
///////////////////////////////////////////////////////////////////


const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { isNull } = require("util");
function convertToArabicNumber(number) {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const arabicNumber = String(number).split('').map(digit => arabicDigits[digit] || digit).join('');
  return arabicNumber;
}






const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = uuidv4() + ext;
    console.log(`uploads/products/${filename}`)
    cb(null, filename);
   
  },
});
// Create a new multer upload object
const upload = multer({ storage });

router.post('/addproducts', upload.fields([{ name: 'imageCover', maxCount: 1 },
 { name: 'image', maxCount: 1 }]), async (req, res) => {
    let product = new Product({
      name: req.body.name,
      nameA:req.body.nameA,
      color: req.body.color,
      imageCover: req.files['imageCover'][0].filename,
      image: req.files['image'][0].filename,
      description: req.body.description,
      descriptionA: req.body.descriptionA,
      material: req.body.material,
      materialA: req.body.materialA,
      price: req.body.price,
      priceA: convertToArabicNumber(req.body.price),
      category: req.body.category,
      size: req.body.size,
      sizeA: convertToArabicNumber(req.body.size),
      ispopular: req.body.ispopular,
      hasoffer: req.body.hasoffer,
      discount: req.body.discount,
      discountA: convertToArabicNumber(req.body.discount),
      priceafter: req.body.price,
      priceafterA: convertToArabicNumber(req.body.price),
      totalnumofproducts: req.body.totalnumofproducts,
      totalavilable: req.body.totalnumofproducts,
      totalsell: req.body.totalsell,
    });

    
    if (product.hasoffer == true) {
      product.priceafter =
        product.price - (product.price * product.discount) / 100;
        product.priceafterA =convertToArabicNumber( (product.price - (product.price * product.discount) / 100))
        
    }
    // console.log(product)
    product = await product.save();
  
    if (!product) return res.status(500).send("The product Can not Created");
  
    res.send(product);

}

);



// Get All Products
router.get('/allpro',async(req,res)=>{
    const productlist=await Product.find();
    if(!productlist){
        res.status(500).json({sucess:false});
    }

res.status(200).send(productlist);
})


// Get One Product by id
router.get("/getsingleproductbyid/:id", async (req, res) => {
  let product;
   product = await Product.findById(req.params.id)


  if(product){
    res.status(200).send(product)

  }
  else{
    res.status(404).send("product not found")
  }
});

// Get One Product by id
router.get("/getproductbyid/:id/:lang", async (req, res) => {
  let product;
  if(req.params.lang==="en") product = await Product.findById(req.params.id)
else if(req.params.lang==="ar") product = await Product.findById(req.params.id)
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
       //console.log(fav[0].productdata[k].productid)
       if(fav[0].productdata[k].productid.toString()==product._id.toString())
       product.isfav=true
      }
     }
  }

  if(product){
    res.status(200).send(product)

  }
  else{
    res.status(404).send("product not found")
  }
});



// Get Popular Products
router.get("/getpopular/:ispopular/:lang", async (req, res) => {
  try {
console.log( req.params.lang)
    let product 
    if( req.params.lang==="en"){

    product= await Product.find({ ispopular: req.params.ispopular }).select("-nameA -descriptionA -materialA -priceA -sizeA -discountA -priceafterA").populate("category"
     );}
   else if( req.params.lang==="ar"){
   product= await Product.find({ ispopular: req.params.ispopular }).select("-name -description -material -price -size -discount -priceafter").populate("category");}
    
    res.status(200).send({
      success: true,
      product: product,
    });
  } catch {
    res.status(500).json({
      sucess: false,
    });
  }
});

// Get Products with offer
router.get("/hasoffer/:hasoffer", async (req, res) => {
  try {
    let product = await Product.find({ hasoffer: req.params.hasoffer });
    res.json({
      success: true,
      product: product,
    });
  } catch {
    res.status(500).json({
      sucess: false,
    });
  }
});
// Get Favourit Products
router.get("/getfav/:isfav", async (req, res) => {
  try {
    let product = await Product.find({ isfav: req.params.isfav });
    res.json({
      success: true,
      product: product,
    });
  } catch {
    res.status(500).json({
      sucess: false,
    });
  }
});




// Update Product
router.put("/updatepro/:id",
upload.fields([{ name: 'imageCover', maxCount: 1 }, { name: 'image', maxCount: 1 }]),
async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Category Not Existed");
  
  let product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      nameA: req.body.nameA,
      description: req.body.description,
      descriptionA: req.body.descriptionA,
      price: req.body.price,
      priceA: convertToArabicNumber(req.body.price),
      category: req.body.category,
      size: req.body.size,
      sizeA: convertToArabicNumber(req.body.size),
      ispopular: req.body.ispopular,
      hasoffer: req.body.hasoffer,
      discount: req.body.discount,
      discountA: convertToArabicNumber(req.body.discount),
      totalnumofproducts: req.body.totalnumofproducts,
      totalavilable: req.body.totalnumofproducts,
      totalsell: req.body.totalsell,
      priceafter: req.body.price - (req.body.price * req.body.discount) / 100,
      priceafterA: convertToArabicNumber((req.body.price - (req.body.price * req.body.discount) / 100)),
    },

    { new: true }
  );
  if (Object.keys(req.files).length === 0) {
    console.log("No files were uploaded");
  }
  else if(Object.keys(req.files).length === 1){
    if (req.files.imageCover) {
     
      product= await Product.findByIdAndUpdate(
        req.params.id,
        { 
        imageCover: req.files['imageCover'][0].filename
        },

        { new: true })
      
     
    }

   else if (req.files.image) {
    product= await Product.findByIdAndUpdate(
        req.params.id,
        { 
       image:req.files['image'][0].filename
        },

        { new: true })
    
      
    }
  }
 
   else {
    product.imageCover= req.files['imageCover'][0].filename,
    product.image= req.files['image'][0].filename
    await product.save()
  }

  if (!product) {
    res.status(500).json({ message: "product not exist" });
  }
  res.status(200).json(product);
});



// Update Product
router.put("/updateoffer/:id", async (req, res) => {
  const pro = await Product.findById(req.params.id);
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      hasoffer: req.body.hasoffer,
      discount: req.body.discount,
      discountA: convertToArabicNumber(req.body.discount),
      priceafter: pro.price - (pro.price * req.body.discount) / 100,
      priceafterA:convertToArabicNumber(( pro.price - (pro.price * req.body.discount) / 100)),

    },

    { new: true }
  );

  if (!product) {
    res.status(500).json({ message: "product not exist" });
  }
  res.status(200).json(product);
});

// Delete Product
router.delete("/delectone/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ sucess: true, message: "Product Is Deleted Successfully" });
      } else {
        res.status(404).json({ sucess: false, message: "Product Not Found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ sucess: false, error: err });
    });
});

//filltering
router.get(`/`, async (req, res) => {
  // localhost:5000/ecommerce/product?categories=id
  let filter = {};
  let lang=req.query.lang;

  if (req.query.categories) {
    filter = { category: req.query.categories.split(","),
  
  };
  }
  console.log(lang)
  let productList;
  if(lang==="en"){

   productList = await Product.find(filter).select("-nameA -descriptionA -materialA -priceA -sizeA -discountA -priceafterA").populate("category"
  );}
else if(lang==="ar"){
productList = await Product.find(filter).select("-name -description -material -price -size -discount -priceafter").populate("category");}
 
if (!productList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(productList);
});

// Make Product Popular
router.put("/makepopular/:id", async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      ispopular: true,
    },
    { new: true }
  );
  if (!product) {
    res.status(500).json({ message: "product not exist" });
  }
  res.status(200).json(product);
});

// Make Product Favourit
router.put("/makefav/:id", async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      isfav: true,
    },
    { new: true }
  );
  if (!product) {
    res.status(500).json({ message: "product not exist" });
  }
  res.status(200).json(product);
});

// Update Rate of Product
router.put("/rate/:id/:rate", async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      rate: req.params.rate,
    },
    { new: true }
  );
  if (!product) {
    res.status(500).json({ message: "product not exist" });
  }
  res.status(200).json(product);
});

module.exports = router;