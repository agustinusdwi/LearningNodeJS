var jwt = require('jsonwebtoken');
var config = require('../config/jwt');

const response = require('../response/res');
module.exports = function verifyToken(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) {
        return response.result(res, { auth: false, message: 'No token provided.' }, 403);
    }
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
            return response.result(res, { auth: false, message: 'Failed to authenticate token.' }, 500);
        }
        // if everything good, save to request for use in other routes
        req.userId = decoded.id;
        next();
    });
}