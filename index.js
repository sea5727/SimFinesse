var commander = require('./utils/commander')

console.log(`your http port : ${commander.httpPort}, xmpp port : ${commander.xmppPort}`)

let http_server = require('./http_server')
let xmpp_server = require('./xmpp_server')

http_server(commander.httpPort)
xmpp_server(commander.xmppPort)
