const xmpp = require('node-xmpp-server');
const logger = require('./utils/logger');
const FinesseMemory = require('./memory');



let listen = function (port) {
    var options = {
        port: port,
        domain : 'finesse'
    }

    
    var server = new xmpp.C2S.TCPServer(options);

    server.on('listening', () => {
        logger.info('[XMPP] listening succ');
    });

    server.on('connection', (client) => {
        logger.info('[XMPP] client connection');
        client.on('online', () => {
            logger.info('[XMPP] online from client');
        });

        client.on('register', (opts, cb) => {
            logger.info('[XMPP] register from client');
            cb(true);
        });

        client.on('authenticate', (opts, cb) => {
            let finesse_id = opts.username
            FinesseMemory.set_xmpp(finesse_id, client);
            logger.info('[XMPP] authenticate from client finesse_id : ', finesse_id);
            // 로그인 처리 인듯..? 
            // opts.username
            // opts.password
            cb(null, opts);
            // session_router.set_xmpp(client.jid.local, client); // key : FnsLoginId, value : xmpp_client
        })

        client.on('stanza', (stanza) => {
            // receive message from client 
            if (stanza.name === 'iq' && stanza.type == 'get') {
                var from = stanza.attrs.from
                stanza.attrs.from = stanza.attrs.to
                stanza.attrs.to = from
                stanza.type = 'result'
                client.send(stanza);
            }
            else {
                logger.info(`[XMPP / ${client.jid.local}] stanza : ${stanza.toString()}`);
                var from = stanza.attrs.from
                stanza.attrs.from = stanza.attrs.to
                stanza.attrs.to = from
                client.send(stanza)
            }
        });

        client.on('disconnect', () => {
            logger.info('[XMPP] disconnect from client');
        });

    });
}

module.exports = listen;