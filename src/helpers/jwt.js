const jwt = require('jsonwebtoken');
const { MyError } = require('../models/MyError.model');

const SECRET_KET = 'abcd123';

function sign(obj) {
    return new Promise((resolve, reject) => {
        jwt.sign(obj, SECRET_KET, { expiresIn: 6000 }, (error, token) => {
            if (error) return reject(error);
            resolve(token);
        });
    });
}

function verify(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET_KET, (error, obj) => {
            if (error) return reject(new MyError(error.message, 400, 'INVALID_TOKEN'));
            delete obj.exp;
            delete obj.iat;
            resolve(obj);
        });
    });
}

module.exports = { sign, verify };
