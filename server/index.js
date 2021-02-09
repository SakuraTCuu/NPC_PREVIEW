const express = require('express')
const app = express();

console.log(__dirname)
app.use(express.static(__dirname + '/public'));

const server = app.listen(8888, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为", host, port)
});

module.exports = function (result) {
    app.get('/npc', (req, res) => {
        res.status(200).send(JSON.stringify(result));
        res.end();
    });
};