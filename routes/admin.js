const { Router} = require('express')

const express = require('express');

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const User = require('../models/user')

const upload = require('../middleware/multer')

const router = Router()

const admincontroller = require('../controllers/admincontroller')

const productcontroller = require('../controllers/productcontroller')

router.post('/admin-login',admincontroller.adminlogin)

router.post('/admin-addproduct',upload,productcontroller.productAdding)

module.exports = router