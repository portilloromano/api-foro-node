'use strict'

const express = require('express');
const TopicController = require('../controllers/topic');
const mdAuth = require('../middlewares/authenticated');

const router = express.Router();

router.post('/topic', mdAuth.authenticated, TopicController.save);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/user-topics/:userId/:page?', TopicController.getTopicsByUserId);
router.get('/topic/:topicId?', TopicController.getTopic);
router.put('/topic/:topicId?', mdAuth.authenticated, TopicController.update);
router.delete('/topic/:topicId?', mdAuth.authenticated, TopicController.delete);
router.get('/search/:search', TopicController.search);

module.exports = router;