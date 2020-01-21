'use strict'

const validator = require('validator');
const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const jwt = require('../services/jwt');

const controller = {
    save: (req, res) => {
        const params = req.body;

        if (params.name == undefined || params.surname == undefined || params.email == undefined || params.password == undefined) {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos enviados están incompletos.'
            });
        }

        const validateName = !validator.isEmpty(params.name);
        const validateSurname = !validator.isEmpty(params.surname);
        const validateEmail = validator.isEmail(params.email);
        const validatePassword = !validator.isEmpty(params.password);

        if (!validateName) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo nombre no puede estar vacío.'
            });
        }

        if (!validateSurname) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo apellido no puede estar vacío.'
            });
        }

        if (!validateEmail) {
            return res.status(200).send({
                status: 'error',
                message: 'El email no es valido.'
            });
        }

        if (!validatePassword) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo contraseña no puede estar vacío.'
            });
        }

        const user = new User();

        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email.toLowerCase();
        user.role = 'ROLE_USER';
        user.image = null;

        User.findOne({ email: user.email }, (err, issetUser) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error comprobando si el usuario ya existe.'
                });
            }

            if (issetUser) {
                return res.status(200).send({
                    status: 'error',
                    message: 'Ya existe un usuario con ese email.'
                });
            }

            bcrypt.hash(params.password, null, null, (err, hash) => {
                user.password = hash;

                user.save((err, userStored) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al guardar el usuario.'
                        });
                    }

                    if (!userStored) {
                        return res.status(400).send({
                            status: 'error',
                            message: 'El usuario no se ha podido guardar.'
                        });
                    }

                    userStored.role = undefined;
                    userStored.password = undefined;

                    return res.status(201).send({
                        status: 'success',
                        message: 'El usuario se ha guardado.',
                        user: userStored
                    });
                });
            });
        });
    },

    login: (req, res) => {
        const params = req.body;

        if (params.email == undefined || params.password == undefined) {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos enviados están incompletos.'
            });
        }

        const validateEmail = validator.isEmail(params.email);
        const validatePassword = !validator.isEmpty(params.password);

        if (!validateEmail) {
            return res.status(200).send({
                status: 'error',
                message: 'El email no es valido.'
            });
        }

        if (!validatePassword) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo contraseña no puede estar vacío.'
            });
        }

        User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al intentar loguearse.'
                });
            }

            if (!user) {
                return res.status(200).send({
                    status: 'error',
                    message: 'El usuario o la contraseña son incorrectos.'
                });
            }

            bcrypt.compare(params.password, user.password, (err, check) => {
                if (!check) {
                    return res.status(200).send({
                        status: 'error',
                        message: 'El usuario o la contraseña son incorrectos.'
                    });
                }

                if (params.gettoken) {
                    return res.status(200).send({
                        token: jwt.createToken(user)
                    });
                }
    
                user.role = undefined;
                user.password = undefined;
    
                return res.status(200).send({
                    status: 'success',
                    message: 'El usuario se ha logueado.',
                    user
                });
            });
        });
    },

    update: (req, res) => {
        const params = req.body;

        if (params.name == undefined || params.surname == undefined || params.email == undefined) {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos enviados están incompletos.'
            });
        }

        const validateName = !validator.isEmpty(params.name);
        const validateSurname = !validator.isEmpty(params.surname);
        const validateEmail = validator.isEmail(params.email);

        if (!validateName) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo nombre no puede estar vacío.'
            });
        }

        if (!validateSurname) {
            return res.status(200).send({
                status: 'error',
                message: 'El campo apellido no puede estar vacío.'
            });
        }

        if (!validateEmail) {
            return res.status(200).send({
                status: 'error',
                message: 'El email no es valido.'
            });
        }

        params.email = params.email.toLowerCase();

        delete params.password;

        User.findOne({ email: params.email }, (err, issetUser) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error comprobando si el email ya está registrado.'
                });
            }

            if (issetUser && issetUser._id != req.user.sub) {
                return res.status(200).send({
                    status: 'error',
                    message: 'Ya existe un usuario con ese email.'
                });
            }

            User.findOneAndUpdate({ _id: req.user.sub }, params, { new: true }, (err, userUpdate) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al modificar el usuario.',
                    });
                }

                if (!userUpdate) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se encontró el usuario a modificar.',
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    message: 'El usuario se ha modificado.',
                    user: userUpdate
                });
            });
        });
    },

    uploadAvatar: (req, res) => {
        if (!req.files.file0) {
            return res.status(404).send({
                status: 'error',
                message: 'No se envió ninguna imagen.'
            });
        };

        const filePath = req.files.file0.path;
        const fileName = filePath.split('/')[2];
        const fileExt = fileName.split('.')[1];
        let prevAvatar;

        if (fileExt != "png" && fileExt != "jpg" && fileExt != "jpeg" && fileExt != "gif") {
            fs.unlink(filePath, err => {
                return res.status(200).send({
                    status: 'error',
                    message: 'Tipo de archivo no valido.'
                });
            })
        } else {
            User.findById(req.user.sub, (err, user) => {
                if (user) {
                    prevAvatar = user.image;
                }

                User.findOneAndUpdate({ _id: req.user.sub }, { image: fileName }, { new: true }, (err, userUpdate) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al modificar el usuario.',
                        });
                    }

                    if (!userUpdate) {
                        return res.status(404).send({
                            status: 'error',
                            message: 'No se encontró el usuario a modificar.',
                        });
                    }

                    if (prevAvatar != undefined) {
                        fs.exists(`./uploads/users/${prevAvatar}`, exists => {
                            if (exists) {
                                fs.unlink(`./uploads/users/${prevAvatar}`, err => { });
                            }
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        message: 'El usuario se ha modificado.',
                        user: userUpdate
                    });
                })
            });
        }
    },

    avatar: (req, res) => {
        const fileName = req.params.fileName;
        const pathFile = `./uploads/users/${fileName}`;

        fs.exists(pathFile, exists => {
            if (exists) {
                return res.sendFile(path.resolve(pathFile));
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe.'
                });
            }
        });
    },

    getUsers: (req, res) => {
        User.find().exec((err, users) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al listar los usuarios.',
                });
            }

            if (!users) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontró ningún usuario.',
                });
            }

            return res.status(200).send({
                status: 'success',
                users
            });
        });
    },

    getUserById: (req, res) => {
        const userId = req.params.userId;

        User.findById(userId).exec((err, user) => {
            if (err ) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al buscar usuario.',
                });
            }

            if (!user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontró el usuario.',
                });
            }

            return res.status(200).send({
                status: 'success',
                user
            });
        });
    }
};

module.exports = controller;
