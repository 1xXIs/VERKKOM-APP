const logToFile = (message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [DEBUG] ${message}`, JSON.stringify(data, null, 2));
};

module.exports = logToFile;
