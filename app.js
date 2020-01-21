'use strict'

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

//Routes
const userRoutes = require('./routes/user');
const topicRoutes = require('./routes/topic');
const commentRoutes = require('./routes/comment');

//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Rewrite routes
app.use('/api', userRoutes);
app.use('/api', topicRoutes);
app.use('/api', commentRoutes);

module.exports = app;