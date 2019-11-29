const xmpp = require('node-xmpp-server');
const logger = require('./utils/logger');
const simMemory = require('./memory');



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
            cb(null, opts);
            let finesse_id = client.jid.local
            simMemory.set_client(finesse_id, client);
            logger.info('[XMPP] authenticate from client finesse_id : ', finesse_id);
            // session_router.set_client(client.jid.local, client); // key : FnsLoginId, value : xmpp_client
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