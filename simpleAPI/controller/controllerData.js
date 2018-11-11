var response = require('../response/res');
var connection = require('../connection/config');

const bcrypt = require('bcrypt');

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

    var errors = req.validationErrors();
    if (errors) {
        response.result(res, errors, 400);
    } else {
        let hashPassword = bcrypt.hashSync(req.body.password, 10);
        var records = [
            [req.body.name, req.body.age, req.body.email, hashPassword]
        ]
        connection.query('INSERT INTO USERS (name,age,email,password) VALUES ?', [records], (error, result) => {
            if (error) {
                console.log(error);
                response.result(res, error, 500);
            } else {
                response.result(res, result, 200);
            }
        });
    }
};

exports.updateUsers = function (req, res) {
    connection.query('UPDATE USERS SET name=?, email=?, password=? WHERE ID=?', [req.body.name, req.body.email, req.body.password, req.params.id], (error, result) => {
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
