const { verify } = require('../helpers/jwt');

async function mustBeUser(req, res, next) {
    try {
        const { token } = req.headers;
        const { _id } = await verify(token);
        req.idUser = _id;
        next();
    } catch (error) {
        res.onError(error);
    }
}

module.exports = { mustBeUser };
