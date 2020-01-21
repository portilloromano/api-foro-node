'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');

exports.createToken = user => {
    const payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        iat: moment().unix(),
        exp: moment().add(7, 'days').unix
    };

    return jwt.encode(payload, 'clave-secreta');
};