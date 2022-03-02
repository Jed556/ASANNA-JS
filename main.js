const { network } = require('./system/network');
const http = require('http');
const fs = require('fs');

const data = require('./models/data.json');
let input = "we need to search for other techniques"

const PORT = 8080;

// fs.readFile('./monitor/index.html', function (err, html) {
    
//     if (err) throw err;
    
//     http.createServer(function (request, response) {
//         response.writeHeader(200, { "Content-Type": "text/html" });
//         response.write(html);
//         response.end();
//     }).listen(PORT);
// });

network(input, data);