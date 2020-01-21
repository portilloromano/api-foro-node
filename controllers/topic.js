'use strict'

const validator = require('validator');
const Topic = require('../models/topic');

const controller = {
    save: (req, res) => {
        const params = req.body;

        if (params.title == undefined || params.content == undefined || params.lang == undefined) {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos enviados están incompletos.'
            });
        }

        const validateTitle = !validator.isEmpty(params.title);
        const validateContent = !validator.isEmpty(params.content);
        const validateLang = !validator.isEmpty(params.lang);

        if (!validateTitle) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo título no puede estar vacío.'
            });
        }

        if (!validateContent) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo contenido no puede estar vacío.'
            });
        }

        if (!validateLang) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo lenguaje no puede estar vacío.'
            });
        }

        const topic = new Topic();

        topic.title = params.title;
        topic.content = params.content;
        topic.code = params.code;
        topic.lang = params.lang;
        topic.user = req.user.sub;

        topic.save((err, topicStored) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al guardar el tema.'
                });
            }

            if (!topicStored) {
                return res.status(400).send({
                    status: 'error',
                    message: 'El tema no se ha podido guardar.'
                });
            }

            return res.status(201).send({
                status: 'success',
                message: 'El tema se ha guardado.',
                topic: topicStored
            });
        });
    },

    getTopics: (req, res) => {
        let page;

        if (req.params.page == null || +req.params.page < 1) {
            page = 1;
        } else {
            page = +req.params.page;
        }

        const options = {
            sort: { date: -1 },
            populate: 'user',
            limit: 5,
            page: page
        }

        Topic.paginate({}, options, (err, topics) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al listar los temas.'
                });
            }

            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas para listar.'
                });
            }

            return res.status(201).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });
    },

    getTopicsByUserId: (req, res) => {
        const userId = req.params.userId;
        let page;

        if (req.params.page == null || +req.params.page < 1) {
            page = 1;
        } else {
            page = +req.params.page;
        }

        const options = {
            sort: { date: -1 },
            populate: 'user',
            limit: 5,
            page: page
        }

        Topic.paginate({ user: userId }, options, (err, topics) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al listar los temas del usuario.'
                });
            }

            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El usuario no posee temas para listar.'
                });
            }

            return res.status(201).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });
    },

    getTopic: (req, res) => {
        const topicId = req.params.topicId;

        Topic.findById(topicId).populate('user').exec((err, topic) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al buscar el tema.'
                });
            }

            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontró el tema solicitado.'
                });
            }

            return res.status(201).send({
                status: 'success',
                topic: topic
            });
        });
    },

    update: (req, res) => {
        const topicId = req.params.topicId;
        const params = req.body;

        if (params.title == undefined || params.content == undefined || params.lang == undefined) {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos enviados están incompletos.'
            });
        }

        const validateTitle = !validator.isEmpty(params.title);
        const validateContent = !validator.isEmpty(params.content);
        const validateLang = !validator.isEmpty(params.lang);

        if (!validateTitle) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo título no puede estar vacío.'
            });
        }

        if (!validateContent) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo contenido no puede estar vacío.'
            });
        }

        if (!validateLang) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo lenguaje no puede estar vacío.'
            });
        }

        const update = {
            title: params.title,
            content: params.content,
            code: params.code,
            lang: params.lang
        };

        Topic.findOneAndUpdate({ _id: topicId, user: req.user.sub }, update, { new: true }, (err, topicUpdate) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al modificar el tema.',
                });
            }

            if (!topicUpdate) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontró el tema solicitado.',
                });
            }

            return res.status(200).send({
                status: 'success',
                message: 'El tema se ha modificado.',
                topic: topicUpdate
            });
        });
    },

    delete: (req, res) => {
        const topicId = req.params.topicId;

        Topic.findOneAndDelete({ _id: topicId, user: req.user.sub }, (err, topicDelete) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al eliminar el tema.',
                });
            }

            if (!topicDelete) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontró el tema solicitado.',
                });
            }

            return res.status(200).send({
                status: 'success',
                message: 'El tema se ha eliminado.',
                topic: topicDelete
            });
        });
    },

    search: (req, res) => {
        const searchString = req.params.search;
        let page;

        if (req.params.page == null || +req.params.page < 1) {
            page = 1;
        } else {
            page = +req.params.page;
        }

        const options = {
            sort: { date: -1 },
            populate: 'user',
            limit: 5,
            page: page
        }

        Topic.paginate({
            '$or': [
                { 'title': { '$regex': searchString, '$options': 'i' } },
                { 'content': { '$regex': searchString, '$options': 'i' } },
                { 'code': { '$regex': searchString, '$options': 'i' } },
                { 'lang': { '$regex': searchString, '$options': 'i' } }
            ]
        }, options, (err, topics) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al realizar la busqueda.'
                });
            }

            if (topics.totalDocs == 0) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontró ninguna coincidencia.'
                });
            }

            return res.status(201).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });
    }
};

module.exports = controller;