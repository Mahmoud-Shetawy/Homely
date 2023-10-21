const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const { Product } = require("../models/product");
const multer = require('multer');
const path=require('path')


exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "image",
    maxCount: 5,
  },
]);


exports.webhookcheckfun=asyncHandler(async (req, res, next) => {
 
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_VBDEAUzBSXiTEtkJz8w7DkRoSpy1wikk');
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
    
  }
  if(event.type===checkout.session.completed){
    console.log("ok")
  }
  else{
    console.log("no")
  }
})

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  //1- Image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  //2- Image processing for images
  if (req.files.image) {
    // req.body.image = [];
    // await Promise.all(
    //   req.files.image.map(async (file, index) => {
        // const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.obj`;
        const storage = multer.diskStorage({
          destination: (req, file, cb) => {
            cb(null, 'uploads/3d');
          },
          filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const filename = uuidv4() + ext;
            console.log(`uploads/3d/${filename}`)
            cb(null, filename);
           
          },
        });
        const upload = multer({ storage });
        upload.single('image')
//         await sharp(img.buffer).toFile(`uploads/products/${imageName}`);
          
//     //      .toFormat("glb")
//     //     //   .jpeg({ quality: 95 })
//     console.log(img)
//  // toFile(`uploads/products/${imageName}`);

        // Save image into our db
        req.body.image.push("imageName");
    //   })
    // );

    next();
  }
});
