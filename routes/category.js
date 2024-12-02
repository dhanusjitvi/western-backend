const { Router} = require('express')

const express = require('express');

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const User = require('../models/user')

const router = Router()

const categorycontroller = require('../controllers/categorycontroller')

router.post('/admin-category-adding',categorycontroller.Categoryadding)

router.get('/admin-category-listing',categorycontroller.categorylist)

router.patch('/admin-update-status/:categoryId', categorycontroller.updateCategoryStatus)

module.exports = router