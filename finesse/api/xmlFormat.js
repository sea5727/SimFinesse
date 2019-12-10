const builder = require('xmlbuilder');

const XmppEventFormat = (UserId, dataObj) => {

    var dataFormat = JSON.parse(JSON.stringify(dataObj));
    Object.defineProperty(dataFormat, 'user', Object.getOwnPropertyDescriptor(dataFormat, 'User'));
    delete dataFormat['User'];

    let update = {
        update: {
            data: {
                '#text': dataFormat
            },
            event: { '#text': 'PUT' },
            requestId: { '#text': '' },
            source: { '#text': `/finesse/api/User/${UserId}` }
        }
    }

    let update_xml = builder.create(update, {headless: true}).end({ pretty: true });
    let finesse_number = 'simfin01'
    let company_name = 'jdin'
    var full_event = {
        message: {
            '@from': `pubsub.${finesse_number}.${company_name}.icm`,
            '@to': `${UserId}@${finesse_number}.${company_name}.icm`,
            '@id': `/finesse/api/User/${UserId}__${UserId}@${finesse_number}.${company_name}.icm__FyRVw`,
            event: {
                '@xmlns': 'http://jabber.org/protocol/pubsub#event',
                items: {
                    '@node': `/finesse/api/User/${UserId}`,
                    item: {
                        '@id': 'da931a91-f39d-4081-8361-9afdf606956848660477',
                        notification: {
                            '@xmlns': "http://jabber.org/protocol/pubsub",
                            '@type': 'html',
                            '#text': `${update_xml}`
                        }
                    }

                }
            }
        }
    }
    return builder.create(full_event, { headless: true }).end({ pretty: true })
}


module.exports = {
    XmppEventFormat : XmppEventFormat,
}