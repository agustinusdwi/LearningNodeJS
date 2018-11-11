var express = require('express'),
    expressValidator = require('express-validator'),
    app = express(),
    port = process.env.port || 2000,
    bodyParser = require('body-parser'),
    controller = require('./controller/controllerData');

app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended : true}));
app.use(bodyParser.json());

var routes = require('./routes/routes');
routes(app);


app.listen(port, () => console.log(`running on ${port}`));