const express = require('express');

const authService = require('../services/authService');

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
  updateAddressesByID,
  getlastAddresses,getsingleaddresss
} = require("../services/addressService");

const router = express.Router();

router.use(authService.protect);

router.route('/').post(addAddress).get(getLoggedUserAddresses);

router.delete('/:addressId', removeAddress);
router.put("/:addressId", updateAddressesByID);
router.get('/getsingleaddress/:id',getsingleaddresss)
router.get("/lastaddress",getlastAddresses)
module.exports = router;
