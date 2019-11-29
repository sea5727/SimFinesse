const fs = require("fs")
const winston = require("winston")
const winston_daily_rotate_file = require("winston-daily-rotate-file")
const logDir = "log"

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}

//const tsFormat = () => (new Date()).toLocaleTimeString()
function timeStampFormat() {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ')
}

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
        new (winston_daily_rotate_file)({
            filename: `${logDir}/SimFinesse.log`,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple(),
            )
        }),
    ]
})