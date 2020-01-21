'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'clave-secreta';

exports.authenticated = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: 'error',
            message: 'La petición no tiene cabezera de atorización'
        });
    }

    const token = req.headers.authorization.trim();

    try {
        const payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                status: 'error',
                message: 'El token ha espirado.'
            });
        }

        req.user = payload;
    } catch (err) {
        return res.status(403).send({
            status: 'error',
            message: 'El token no es válido.'
        });
    }

    next();
}