'use strict'

const express = require('express');
const UserController = require('../controllers/user');
const mdAuth = require('../middlewares/authenticated');
const multipart = require('connect-multiparty');

const router = express.Router();
const mdUpload = multipart({ uploadDir: './uploads/users' });

router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/update', mdAuth.authenticated, UserController.update);
router.post('/upload-avatar', [mdAuth.authenticated, mdUpload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUserById);

module.exports = router;