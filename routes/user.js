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

router.get('/user',usercontroller.user);

router.get('/products',productercontroller.getProducts);

router.post('/ordering',usercontroller.order)



module.exports = router