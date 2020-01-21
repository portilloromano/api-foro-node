'use strict'

const express = require('express');
const CommentController = require('../controllers/comment');
const mdAuth = require('../middlewares/authenticated');

const router = express.Router();

router.post('/comment/topic/:topicId?', mdAuth.authenticated, CommentController.add);
router.put('/comment/:commentId?', mdAuth.authenticated, CommentController.update);
router.delete('/comment/:commentId?', mdAuth.authenticated, CommentController.delete);

module.exports = router;