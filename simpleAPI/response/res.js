exports.result = function(res, values, status){
    var data = {
        'status' : status,
        'values' : values
    };
    res.status(status).send(data);
    res.end();
};