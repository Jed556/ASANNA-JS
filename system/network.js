const fs = require('fs');
const brain = require("brain.js");
const config = require('./config.json');
const trainCache = './cache/trained.json';
const history = './cache/history.json';
const continuous = false;

/**
* @param { String } input String to be predicted
* @param { String } data Path of training data
* @returns { String } Logs & JSON trained data
*/
function network(input, data) {
    const trainingData = data.map(item => ({
        input: item.text,
        output: item.category
    }));

    const initialNet = new brain.recurrent.LSTM();
    const trainedNet = new brain.recurrent.LSTM();

    if (config.continuous || continuous) {
        if (fs.existsSync(trainCache)) {
            load(trainedNet, trainCache);
            train(trainedNet, trainingData, input, config);
        } else {
            train(initialNet, trainingData, input, config);
        }
    } else {
        if (fs.existsSync(trainCache)) {
            load(initialNet, trainCache);
        } else {
            train(initialNet, trainingData, input, config);
        }
    }
}

/**
* @param { LSTM } network Network to be used
* @param { String } cache Path of cache to be loaded
* @returns { String } Logs & JSON trained data
*/
function load(network, cache) {
    const trainedData = JSON.parse(fs.readFileSync(cache));
    network.fromJSON(trainedData);
}

/**
* @param { LSTM } network Network to be used
* @param { String } data Path of training data
* @param { JSON } config Configuration of network
* @returns { String } Logs & JSON trained data
*/
function train(network, data, input, config) {
    let tTime = new Date();
    let result = network.train(data, {
        iterations: config.iterations || 2000,
        errorThresh: config.errorThresh || 0.011,
        learningRate: config.learningRate || 0.001,
        momentum: config.momentum || 0.1,
        logPeriod: config.logPeriod || 10,
        log: stats => console.log(`${stats}, time: ${(new Date() - tTime) > 60000 ?
            (((new Date() - tTime) / 1000 / 60)).toFixed(2) + "min"
            : (((new Date() - tTime) / 1000)).toFixed(2) + "sec"}`),
        timeout: config.timeout || Infinity,
    });
    console.log(`${result}, time: ${(new Date() - tTime) > 60000 ?
        (((new Date() - tTime) / 1000 / 60)).toFixed(2) + "min"
        : (((new Date() - tTime) / 1000)).toFixed(2) + "sec"}`)

    try { fs.writeFileSync(trainCache, JSON.stringify(network.toJSON(), null, 2)) } catch (e) { console.log(e) };

    const output = network.run(input);
    try { fs.writeFileSync(history, output) } catch (e) { console.log(e) };
    return console.log(output);
}

module.exports.network = network;