module.exports = function(app){
    var todoList = require('../controller/controllerData');

    app.route('/users/login').post(todoList.loginUser);
    app.route('/').get(todoList.index);
    app.route('/users').get(todoList.users);
    app.route('/users/add').post(todoList.addUsers);
    app.route('/users/update/:id').put(todoList.updateUsers);
    app.route('/users/delete/:id').put(todoList.deleteUsers);
}