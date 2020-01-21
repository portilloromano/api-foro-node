'use strict'

const validator = require('validator');
const Topic = require('../models/topic');

const controller = {
    add: (req, res) => {
        const topicId = req.params.topicId;
        const params = req.body;

        if (params.content == undefined) {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos enviados están incompletos.'
            });
        }

        const validateContent = !validator.isEmpty(params.content);

        if (!validateContent) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo contenido no puede estar vacío.'
            });
        }

        Topic.findById(topicId).exec((err, topic) => {
            const comment = {
                user: req.user.sub,
                content: req.body.content
            };

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

            topic.comments.push(comment);

            topic.save(err => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al guardar el comentario.'
                    });
                }
                return res.status(201).send({
                    status: 'success',
                    message: 'El comentario se ha guardado.',
                    topic: topic
                });
            });
        });
    },

    update: (req, res) => {
        const commentId = req.params.commentId;
        const params = req.body;

        if (params.content == undefined) {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos enviados están incompletos.'
            });
        }

        const validateContent = !validator.isEmpty(params.content);

        if (!validateContent) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo contenido no puede estar vacío.'
            });
        }

        Topic.findOne(
            { 'comments._id': commentId, 'comments.user': req.user.sub }, (err, topic) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al buscar el comentario.',
                    });
                }

                if (!topic) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se encontró el comentario solicitado.',
                    });
                }

                const comment = topic.comments.id(commentId);

                if (!comment) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se encontró el comentario solicitado.',
                    });
                }

                comment.content = params.content;

                topic.save((err) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al modificar el comentario.',
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        message: 'El comentario se ha modificado.',
                        topic: topic
                    });
                });
            }
        );
    },

    delete: (req, res) => {
        const commentId = req.params.commentId;

        Topic.findOne(
            { 'comments._id': commentId, 'comments.user': req.user.sub }, (err, topic) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al buscar el comentario.',
                    });
                }

                if (!topic) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se encontró el comentario solicitado.',
                    });
                }

                const comment = topic.comments.id(commentId);

                if (!comment) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se encontró el comentario solicitado.',
                    });
                }

                comment.remove();

                topic.save((err) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al eliminar el comentario.',
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        message: 'El comentario se ha eliminado.',
                        topic: topic
                    });
                });
            }
        );
    }
};

module.exports = controller;