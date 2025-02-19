const { Router} = require('express')

const express = require('express');

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const User = require('../models/user')

const router = Router()

const usercontroller = require('../controllers/usercontroller')

const productercontroller = require('../controllers/productcontroller')

router.post('/register',usercontroller.register)

router.post('/otpverify',usercontroller.verifyUser);

router.post('/add-address/:id',usercontroller.addAddress)

router.post('/login',usercontroller.login)

router.post('/ordering',usercontroller.order)

router.post('/categorybasedproduct',productercontroller.categorybasedproductd)

router.post('/addToWishlist', productercontroller.addToWishlist);

router.post('/removeWishlist', productercontroller.removeFromWishlist);

router.post('/addCart', usercontroller.addtoCart);

router.delete('/removeFromCart/:userId/:productId', productercontroller.removeFromCart);

router.put('/cart/:userId/item/:itemId', productercontroller.updateCartQuantity);

router.get('/user',usercontroller.user);

router.get('/products',productercontroller.getProducts);

router.get('/:userId', productercontroller.getUserWishlist);

router.get('/cart/:userId', productercontroller.getCartItems);



module.exports = router