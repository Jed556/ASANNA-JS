const { network } = require('./system/network');
const http = require('http');
const fs = require('fs');

const data = require('./models/data.json');
let input = "search"

const PORT1 = 8080;
const PORT2 = 8888;

fs.readFile('./monitor/index.html', function (err, html) {

    if (err) throw err;

    http.createServer(function (request, response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(html);
        response.end();
    }).listen(PORT1);
});

network(input, data);

if (fs.existsSync('./cache/history.json'))
    fs.readFile('./cache/history.json', function (err, html) {

        if (err) throw err;

        http.createServer(function (request, response) {
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.writeHeader(200, { "Content-Type": "application/json" });
            response.write(html);
            response.end();
        }).listen(PORT2);
    });
