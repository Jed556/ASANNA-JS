const { network } = require('./system/network');
const brain = require("brain.js");
const http = require('http');
const fs = require('fs');

const data = require('../models/data.json');
const networkPath = '../cache/network.json';
const logPath = '../cache/log.txt';

network("My drive has a capacity of 9TB");

const PORT = 8080;

fs.readFile('./monitor/index.html', function (err, html) {

    if (err) throw err;

    http.createServer(function (request, response) {
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(html);
        response.end();
    }).listen(PORT);
});