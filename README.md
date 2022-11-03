# ASAN-NA
**Automatic Sorting Applet using Neural Network Algorithms**
<br>
An LSTM Neural Network package for categorizing tickets or issues

<br/>
Development is still in progress...

## About
* Flexible model and training data for LSTM.
* Uses [Brain.js](https://github.com/BrainJS/brain.js) LSTM RNN
* Easy access configuration
* Can be plugged into web application

## Installation

### Dependencies
Go to project's root directory (where package.json is located) and do `npm i` to install dependencies.

### Configuration
Manage configuration in **system/[config.json](https://github.com/Jed556/ASAN-NA/blob/main/system/config.json)**
```JSON
{
    "momentum": 0.1,
    "iterations": 2000,
    "errorThresh": 0.011,
    "learningRate": 0.001,
    "logPeriod": 5,
    "timeout": null,
    "continuous": false
}
```
[Brain.js Documentation](https://github.com/BrainJS/brain.js#training-options)

## Updates and Issues
Updates: [GitHub Project](https://github.com/users/Jed556/projects/20)
