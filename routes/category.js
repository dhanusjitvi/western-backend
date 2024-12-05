const { Router} = require('express')

const express = require('express');

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const User = require('../models/user')

const uploadImages = require('../config/cloudinary')

const router = Router()

const categorycontroller = require('../controllers/categorycontroller')

router.post('/admin-category-adding',uploadImages,categorycontroller.categoryAdding)

router.get('/admin-category-listing',categorycontroller.categorylist)

router.get('/admin-category',categorycontroller.getCategories)

router.delete('/admin-category-delete/:categoryId', categorycontroller.deleteCategory)

module.exports = router