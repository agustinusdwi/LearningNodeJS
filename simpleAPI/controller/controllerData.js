const response = require('../response/res');
const connection = require('../connection/config');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
var config = require('../config/jwt');

exports.loginUser = function (req, res) {

    var token = req.headers['x-access-token'];
    if (!token) { 
        return response.result(res, { auth: false, message: 'No token provided.' }, 401); 
    }

    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) { 
            return response.result(res, { auth: false, message: 'Failed to authenticate token.' }, 500); 
        }

        connection.query('SELECT * FROM USERS WHERE name= ? ORDER BY ID DESC LIMIT 1', [req.body.name], (error, rows, fields) => {
            if (error) {
                response.result(res, error, 500);
            } else {
                if (rows) {
                    user = rows[0];
                    // must compare
                    if (bcrypt.compareSync(req.body.password, user.password)) {
                        response.result(res, user, 200);
                    } else {
                        response.result(res, { auth: true, message: 'invalid username or password' }, 401);
                    }
                }
            }
        });
    });
};

exports.users = function (req, res) {
    connection.query('SELECT * FROM USERS', (error, rows, fields) => {
        if (error) {
            response.result(res, rows, 500);
        } else {
            response.result(res, rows, 200);
        }
    });
};

exports.addUsers = (req, res) => {
    req.checkBody("email", "email address does not exist").exists();
    req.checkBody("name", "name does not exist").exists();
    req.checkBody("age", "age does not exist").exists();
    req.checkBody("password", "password does not exist").exists();

    let errors = req.validationErrors();
    if (errors) {
        response.result(res, errors, 400);
    } else {
        let hashPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(9));
        let records = [
            [req.body.name, req.body.age, req.body.email, hashPassword]
        ]
        connection.query('INSERT INTO USERS (name,age,email,password) VALUES ?', [records], (error, result) => {
            if (error) {
                console.log(error);
                response.result(res, error, 500);
            } else {
                var token = jwt.sign({ id: result.id }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                response.result(res, { auth: true, token: token }, 200);
            }
        });
    }
};

exports.updateUsers = function (req, res) {
    let hashPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(9));
    connection.query('UPDATE USERS SET name= ?, email=?,  age=?, password=? WHERE ID=?',
        [req.body.name, req.body.email, req.body.age, hashPassword, req.params.id], (error, result) => {
            if (error) {
                console.log(error);
                response.result(res, error, 500);
            } else {
                response.result(res, result, 200);
            }
        });
};

exports.deleteUsers = function (req, res) {
    connection.query('DELETE FROM USERS WHERE ID=?', [req.params.id], (error, result) => {
        if (error) {
            console.log(error);
            response.result(res, error, 500);
        } else {
            response.result(res, result, 200);
        }
    });
};

exports.index = function (req, res) {
    response.result(res, "mysql 8", 200);
};
