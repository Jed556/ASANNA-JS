const brain = require("brain.js");
const fs = require('fs');
const networkPath = './cache/network.json';

/**
* @param { String } input String to be predicted
* @param { String } data Path of training data
* @returns { String } Iterations & Training Error || Predicted category
*/

function network(input, data) {
    const trainingData = data.map(item => ({
        input: item.text,
        output: item.category
    }));

    const network = new brain.recurrent.LSTM();
    let networkData = null;
    if (fs.existsSync(networkPath)) {
        networkData = JSON.parse(fs.readFileSync(networkPath));
        network.fromJSON(networkData);
    } else {
        const result = network.train(trainingData, {
            iterations: 100,
            log: details => console.log(details),
            errorThresh: 0.011
        });
        fs.writeFileSync(networkPath, JSON.stringify(network.toJSON(), null, 2));
    }

    const output = network.run(input);
    console.log(output);
}

module.exports.network = network;