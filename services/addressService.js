const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc    Add address to user addresses list
// @route   POST /api/v1/addresses
// @access  Protected/User
exports.addAddress = asyncHandler(async (req, res, next) => {
  // $addToSet => add address object to user addresses  array if address not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address added successfully.",
    data: user.addresses,
  });
});

// @desc    Remove address from user addresses list
// @route   DELETE /api/v1/addresses/:addressId
// @access  Protected/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  // $pull => remove address object from user addresses array if addressId exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address removed successfully.",
    data: user.addresses,
  });
});

// @desc    Get logged user addresses list
// @route   GET /api/v1/addresses
// @access  Protected/User
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});
exports.getlastAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.find({}).populate("addresses");
if(user){
  if(req.user.addresses.length>0)
  res.status(200).json({address:req.user.addresses[req.user.addresses.length-1]})
  else res.status(404).json({address:[]})
}
else{ res.status(201).json({Message:"user not found"})}
 
});
exports.getsingleaddresss=asyncHandler(async(req,res,next)=>{
  const user = await User.findById(req.user._id).populate("addresses");
  if(user){
    var f=0;
    for(var i=0;i<user.addresses.length;i++){
      if((user.addresses[i]._id).toString()==(req.params.id).toString()){
      res.status(200).json({address:user.addresses[i]})
f=1;
      }
    }
    if(f==0)
      res.status(404).json({address:"Address not found"})
  }
  else{ res.status(201).json({address:[]})}
})
// @desc    Update user addresses
// @route   PUT /api/v1/addresses/:id
// @access  Protected/User
exports.updateAddressesByID = asyncHandler(async (req, res, next) => {
  const updateAddresses = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        addresses: {
          _id: req.params.addressId,
          fulladdress: req.body.fulladdress,
          governrate: req.body.governrate,
          city: req.body.city,
         
        },
      },
    },
    { new: true }
  );

  res.status(200).json({ data: updateAddresses });
});
