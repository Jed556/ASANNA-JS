const fs = require('fs');
const brain = require("brain.js");
const trainCache = './cache/trained.json';
const config = require('./config.json') || {};
const history = './cache/history.json';
const defConfig = {
    iterations: 2000,
    errorThresh: 0.011,
    learningRate: 0.001,
    momentum: 0.1,
    logPeriod: 5,
    timeout: Infinity,
    continuous: false,
    saveNet: true
}
let masterObj = [];
let obj = [];

/**
 * @param { String } input String to be predicted
 * @param { String } data Path of training data
 * @param { JSON } config Configuration of network (optional)
 * @returns { String } Logs & JSON trained data
 */
function main(input, data) {
    const trainingData = data.map(item => ({
        input: item.text,
        output: item.category
    }));

    const LSTM = new brain.recurrent.LSTM();

    if (config.continuous) {
        if (fs.existsSync(trainCache)) {
            load(LSTM, trainCache);
            train(LSTM, trainingData);
            run(LSTM, input);
        } else {
            train(LSTM, trainingData);
            run(LSTM, input);
        }
    } else {
        if (fs.existsSync(trainCache)) {
            load(LSTM, trainCache);
            run(LSTM, input);
        } else {
            train(LSTM, trainingData);
            run(LSTM, input);
        }
    }

}

/**
* @param { LSTM } network Network to be used
* @param { String } cache Path of cache to be loaded
* @returns { String } Loaded cache
*/
function load(network, cache) {
    const trainedData = JSON.parse(fs.readFileSync(cache));
    return network.fromJSON(trainedData);
}

/**
* @param { LSTM } network Network to be used
* @param { String } data Path of training data
* @returns { String } Training status
*/
function train(network, data) {
    let tTime = new Date();

    console.log(`\nINITIALIZING...\n\n` +
        `iterations: ${config.iterations ?? defConfig.iterations + "     (Default)"}\n` +
        `errorThresh: ${config.errorThresh ?? defConfig.errorThresh + "   (Default)"}\n` +
        `learningRate: ${config.learningRate ?? defConfig.learningRate + "  (Default)"}\n` +
        `momentum: ${config.momentum ?? defConfig.momentum + "        (Default)"}\n` +
        `logPeriod: ${config.logPeriod ?? defConfig.logPeriod + "         (Default)"}\n` +
        `timeout: ${config.timeout ?? defConfig.timeout + "    (Default)"}\n` +
        `continuous: ${config.continuous ?? defConfig.continuous + "    (Default)"}\n` +
        `saveNet: ${config.saveNet ?? defConfig.saveNet + "        (Default)"}\n`
    )
    let result = network.train(data, {
        iterations: config.iterations ?? defConfig.iterations,
        errorThresh: config.errorThresh ?? defConfig.errorThresh,
        learningRate: config.learningRate ?? defConfig.learningRate,
        momentum: config.momentum ?? defConfig.momentum,
        logPeriod: config.logPeriod ?? defConfig.logPeriod,
        timeout: config.timeout ?? Infinity,
        log: stats => {
            let log = stats.replace(/\s/g, '').split(/[,:]/);
            eTime = (new Date() - tTime).toTimeString();

            let trainObj = { iterations: +log[1], error: +log[3], time: eTime };
            obj.push(trainObj);

            console.log(`TRAIN | iterations: ${(log[1]).padStart((config.iterations || defConfig.iterations).toString().length, "0")}, error: ${(+log[3]).toFixed(15)}, time: ${eTime}`);
        },
    });
    fTime = (new Date() - tTime).toTimeString();
    obj.push({ iterations: result.iterations, error: result.error, time: fTime });
    console.log(`FINAL | iterations: ${result.iterations}, error: ${result.error.toFixed(15)}, time: ${fTime}`);
}

/**
* @param { LSTM } network Network to be used
* @param { String } input String to be predicted
* @returns { String } Predicted data
*/
function run(network, input) {
    const output = network.run(input);

    if (fs.existsSync(history)) {
        const historyJSON = require("../cache/history.json");
        const trainID = historyJSON.length + 1;
        masterObj.push({ id: trainID, train: obj, input: input, output: output });
        historyObj = [...historyJSON, ...masterObj];
        fs.writeFileSync(history, JSON.stringify(historyObj, null, 2));
    } else {
        masterObj.push({ id: 1, train: obj, input: input, output: output });
        var json = formatJSON(JSON.stringify(masterObj));
        fs.writeFileSync(history, json)
        const historyJSON = require("../cache/history.json");
        fs.writeFileSync(history, JSON.stringify(historyJSON, null, 2));
    }

    if (config.saveNet) fs.writeFileSync(trainCache, JSON.stringify(network.toJSON(), null, 2));
    return console.log(output);
}

/**
 * Convert (milli)seconds to time string (hh:mm:ss[:mss]).
 * @param Boolean seconds
 * @return String
 */
Number.prototype.toTimeString = function (seconds) {
    var _24HOURS = 8.64e7;  // 24*60*60*1000

    var ms = seconds ? this * 1000 : this,
        endPos = ~(4 * !!seconds),  // to trim "Z" or ".sssZ"
        timeString = new Date(ms).toISOString().slice(11, endPos);

    if (ms >= _24HOURS) {  // to extract ["hh", "mm:ss[.mss]"]
        var parts = timeString.split(/:(?=\d{2}:)/);
        parts[0] -= -24 * Math.floor(ms / _24HOURS);
        timeString = parts.join(":");
    }

    return timeString;
};

function formatJSON(input) {
    return input.replace(/"([^"]+?)":{(.+)}/g, function (string, key, value) {
        var dict = {};
        return '"' + key + '":{' + value.replace(/"([^"]+?)":{(.+?)}/g, function (string, key, value) {
            dict[key] = dict[key] == undefined ? 1 : ++dict[key];
            return '"' + key + '_' + dict[key] + '":{' + formatJSON(value) + '}';
        }) + '}';
    });
};

module.exports.network = main;