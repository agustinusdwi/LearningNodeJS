var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password : 'root1234',
    database : 'test',
    port : 3306
})

connection.connect(function(err){
    if(err) throw err;
});

module.exports = connection;