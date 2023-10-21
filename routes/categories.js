const {Category} = require("../models/category");
const express = require("express");
const multer = require('multer');
const router = express.Router();
//const multer  = require('multer')
//const { v4: uuidv4 } = require('uuid');
const upload = multer();
const {
  createCategory,
  uploadCategoryImage,
  resizeImage,
} = require("../services/categoryServices");

// Get All Categories
router.get("/:lang", async (req, res) => {
  let categorylist;
  if(req.params.lang==="en"){
    categorylist = await Category.find().select("-nameA");
 }
 else if(req.params.lang==="ar")
  categorylist = await Category.find().select("-name");
  if (!categorylist) {
    res.status(500).json({ sucess: false });
  }
 res.status(200).send(categorylist)
});




// Get One Category
router.get("/single/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(500).json({ message: "Category not exist" });
  }
  res.status(200).json(category);
});

// Add new Category
router.post('/add', upload.none(), async (req, res, next) => {
  
  let category = new Category({
    name: req.body.name,
    nameA: req.body.nameA,
    image: req.body.image
  });
  
   await category.save();
 
  res.status(200).send(category);
}); // Image processing

// Update Category
router.put('/updateone/:id', upload.none(), async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      image: req.body.image,
      nameA: req.body.nameA,
    },
    { new: true }
  );
  if (!category) {
    return res.status(400).json({ message: 'Category does not exist' });
  }
  
  res.status(200).json(category);
});


// Delete Category
router.delete("/delectone/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ sucess: true, message: "Category Is Deleted Successfully" });
      } else {
        res.status(404).json({ sucess: false, message: "Category Not Found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ sucess: false, error: err });
    });
});

module.exports = router;
