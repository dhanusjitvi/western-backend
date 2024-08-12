const { Router} = require('express')

const express = require('express');

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const User = require('../models/user')

const router = Router()

const admincontroller = require('../controllers/admincontroller')

router.post('/admin-login',admincontroller.adminlogin)

module.exports = router