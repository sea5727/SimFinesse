let http_server = require('./http_server')
let xmpp_server = require('./xmpp_server')

http_server(3000)
xmpp_server(5222)
