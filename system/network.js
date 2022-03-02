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
}


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
        `continuous: ${config.continuous ?? defConfig.continuous + "    (Default)"}\n`
    )
    let result = network.train(data, {
        iterations: config.iterations ?? defConfig.iterations,
        errorThresh: config.errorThresh ?? defConfig.errorThresh,
        learningRate: config.learningRate ?? defConfig.learningRate,
        momentum: config.momentum ?? defConfig.momentum,
        logPeriod: config.logPeriod ?? defConfig.logPeriod,
        log: stats => {
            let log = stats.replace(/\s/g, '').split(/[,:]/);
            //let eTime = (new Date(new Date() - tTime)).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");    //Beta time handler
            console.log(`TRAIN | iterations: ${(log[1]).padStart((config.iterations || defConfig.iterations).toString().length, "0")}, error: ${(+log[3]).toFixed(15)}, time: ${(new Date() - tTime).toTimeString()}`);
        },
        timeout: config.timeout ?? Infinity,
    });
    console.log(`FINAL | iterations: ${result.iterations}, error: ${result.error.toFixed(15)}, time: ${(new Date() - tTime).toTimeString()}`);

    try { fs.writeFileSync(trainCache, JSON.stringify(network.toJSON(), null, 2)) } catch (e) { console.log(e) };

}

/**
* @param { LSTM } network Network to be used
* @param { String } input String to be predicted
* @returns { String } Predicted data
*/
function run(network, input) {
    const output = network.run(input);
    try { fs.writeFileSync(history, output) } catch (e) { console.log(e) };
    return console.log(output);
}

/**
 * Convert (milli)seconds to time string (hh:mm:ss[:mss]).
 *
 * @param Boolean seconds
 *
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

module.exports.network = main;