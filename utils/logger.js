const fs = require("fs");
const winston = require("winston");
const logDir = "log";

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

//const tsFormat = () => (new Date()).toLocaleTimeString();
function timeStampFormat() {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ');
};

module.exports = logger = winston.createLogger({
    transports: [
        new (winston.transports.Console)({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.simple(),
            ),
            level: 'debug'
        }),
        new (require("winston-daily-rotate-file"))({
            filename: `${logDir}/-results.log`,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple(),
            )
        }),
    ]
});