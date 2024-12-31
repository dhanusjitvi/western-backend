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

router.post('/addCart', productercontroller.addToCart);

router.post('/removeFromCart', productercontroller.removeFromCart);

router.post('/update-quantity', productercontroller.updateCartQuantity);

router.get('/user',usercontroller.user);

router.get('/products',productercontroller.getProducts);

router.get('/:userId', productercontroller.getUserWishlist);

router.get('/:userId', productercontroller.getCartItems);


module.exports = router