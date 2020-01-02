let program = require('commander')
program.version('0.0.1')
program
    .option('-p, --http-port [port]', 'input http port', 3000)    
    .option('-x, --xmpp-port [port]', 'input xmpp port' , 5222)
    .parse(process.argv)

module.exports = program