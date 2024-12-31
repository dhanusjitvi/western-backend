const { Router} = require('express')

const express = require('express');

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const User = require('../models/user')

const uploadImages = require('../config/cloudinary')

const router = Router()

const admincontroller = require('../controllers/admincontroller')

const productcontroller = require('../controllers/productcontroller')

router.post('/admin-login',admincontroller.adminlogin)

router.post('/admin-addproduct',uploadImages,productcontroller.productAdding)

router.get('/admin-admingetProducts',productcontroller.admingetProducts)

router.delete('/admin-products-delete/:id', productcontroller.admindeleteProduct);

router.get('/:id', productcontroller.getProductById);

router.put('/:id',productcontroller.updateProduct);
     

module.exports = router