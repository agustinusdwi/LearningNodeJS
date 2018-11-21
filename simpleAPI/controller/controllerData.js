const response = require('../response/res');
const connection = require('../config/connectionDatabase');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
var config = require('../config/jwt');

exports.loginUser = function (req, res) {
    connection.query('SELECT * FROM USERS WHERE name= ? ORDER BY ID DESC LIMIT 1', [req.body.name], (error, rows, fields) => {
        if (error) {
            response.result(res, error, 500);
        } else {
            loginData(req, res, rows);
        }
    });
};

exports.users = function (req, res) {
    let token = tokenJwtProcess(req, res);
    if(token){
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                response.result(res, { auth: false, message: 'Failed to authenticate token. This token has expired.' }, 401);
            } else {
                fetchData(req, res);
            }
        });
    }
};
exports.addUsers = (req, res) => {
    let token = tokenJwtProcess(req, res);
    if(token){
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                response.result(res, { auth: false, message: 'Failed to authenticate token. This token has expired.' }, 401);
            } else {
                addData(req, res);
            }
        });
    }
};

exports.updateUsers = function (req, res) {
    let token = tokenJwtProcess(req, res);
    if(token){
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                response.result(res, { auth: false, message: 'Failed to authenticate token. This token has expired.' }, 500);
            } else {
                updateData(req, res);
            }
        });
    }
};

exports.deleteUsers = function (req, res) {
    let token = tokenJwtProcess(req, res);
    if(token){
        jwt.verify(token, config.secret, function (err, decoded) {
            connection.query('DELETE FROM USERS WHERE ID=?', [req.params.id], (error, result) => {
                if (error) {
                    console.log(error);
                    response.result(res, error, 500);
                } else {
                    response.result(res, result, 200);
                }
            });
        });
    }
};

exports.index = function (req, res) {
    response.result(res, "mysql 8", 200);
};

async function loginData(req, res, rows){
    user = rows[0];
    // must compare
    if (bcrypt.compareSync(req.body.password, user.password)) {
        var token = jwt.sign({ id: rows.id }, config.secret, {
            expiresIn: 60 // expires in 1 minute
        });
        response.result(res, { auth: true, token: token }, 200);
    } else {
        response.result(res, { auth: true, message: 'invalid username or password' }, 401);
    }
}

function tokenJwtProcess(req, res) {
    var token = req.headers['x-access-token'];
    if (!token) {
        response.result(res, { auth: false, message: 'No token provided.' }, 401);
        return;
    }
    return token;
}

async function fetchData(req, res) {
    connection.query('SELECT * FROM USERS', (error, rows, fields) => {
        if (error) {
            response.result(res, error, 500);
        } else {
            response.result(res, rows, 200);
        }
    });
}


async function addData(req, res) {
    let errors = checkErrorRegister(req);
    if (errors) {
        response.result(res, errors, 400);
    } else {
        let hashPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(9));
        let records = [
            [req.body.name, req.body.age, req.body.email, hashPassword]
        ]
        connection.query('INSERT INTO USERS (name,age,email,password) VALUES ?', [records], (error, result) => {
            if (error) {
                response.result(res, error, 500);
            } else {
                response.result(res, result, 200);
            }
        });
    }
}

function checkErrorRegister(req){
    req.checkBody("email", "email address does not exist").exists();
    req.checkBody("name", "name does not exist").exists();
    req.checkBody("age", "age does not exist").exists();
    req.checkBody("password", "password does not exist").exists();

    return req.validationErrors();
}

async function updateData(req, res) {
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
}
