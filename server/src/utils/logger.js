const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../debug.log');

const logToFile = (message, data) => {
    const timestamp = new Date().toISOString();
    const content = `\n[${timestamp}] ${message}\n${JSON.stringify(data, null, 2)}\n`;
    fs.appendFile(logFile, content, (err) => {
        if (err) console.error("Failed to write to log file:", err);
    });
};

module.exports = logToFile;
