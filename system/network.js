const fs = require('fs');
const brain = require("brain.js");
const config = require('./config.json');
const trainCache = './cache/trained.json';
const history = './cache/history.json';

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

    let result;
    const network = new brain.recurrent.LSTM();
    const trainedNet = new brain.recurrent.LSTM();

    if (config.continuous) {
        if (fs.existsSync(trainCache)) {
            let tTime = new Date();
            const trainedData = JSON.parse(fs.readFileSync(trainCache));
            trainedNet.fromJSON(trainedData);
            result = trainedNet.train(trainingData, {
                iterations: config.iterations || 2000,
                errorThresh: config.errorThresh || 0.011,
                learningRate: config.learningRate || 0.001,
                momentum: config.momentum || null,
                logPeriod: config.logPeriod || 10,
                log: stats => console.log(`${stats}, time: ${((new Date() - tTime) / 1000 / 60).toPrecision(4)} min`),
                timeout: config.timeout || Infinity,
                // callback: null,  callbackPeriod: 10,
            });
            try { fs.writeFileSync(trainCache, JSON.stringify(trainedNet.toJSON(), null, 2)) } catch (e) { console.log(e) };
        } else {
            let tTime = new Date();
            network.train(trainingData, {
                iterations: config.iterations || 2000,
                learningRate: config.learningRate || 0.001,
                errorThresh: config.errorThresh || 0.001,
                logPeriod: config.logPeriod || 10,
                log: stats => console.log(`${stats}, time: ${((new Date() - tTime) / 1000 / 60).toPrecision(4)} min`),
            });
            try { fs.writeFileSync(trainCache, JSON.stringify(network.toJSON(), null, 2)) } catch (e) { console.log(e) };
        }
    } else {
        if (fs.existsSync(trainCache)) {
            const networkData = JSON.parse(fs.readFileSync(trainCache));
            network.fromJSON(networkData);
        } else {
            let tTime = new Date();
            result = network.train(trainingData, {
                iterations: config.iterations || 2000,
                errorThresh: config.errorThresh || 0.011,
                learningRate: config.learningRate || 0.001,
                momentum: config.momentum || null,
                logPeriod: config.logPeriod || 10,
                log: stats => console.log(`${stats}, time: ${((new Date() - tTime) / 1000 / 60).toPrecision(4)} min`),
                timeout: config.timeout || Infinity,
                // callback: null,  callbackPeriod: 10,
            });
            try { fs.writeFileSync(trainCache, JSON.stringify(network.toJSON(), null, 2)) } catch (e) { console.log(e) };
        }
    }

    const output = network.run(input);
    console.log(output);
    try { fs.writeFileSync(history, output) } catch (e) { console.log(e) };
}

module.exports.network = network;