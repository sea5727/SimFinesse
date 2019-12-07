const builder = require('xmlbuilder');

const UserEventFormat = (UserObj) => {
    let UserID = UserObj.User.loginId;

    var userFormat = JSON.parse(JSON.stringify(UserObj));
    Object.defineProperty(userFormat, 'user', Object.getOwnPropertyDescriptor(userFormat, 'User'));
    delete userFormat['User'];

    let update = {
        update: {
            data: {
                '#text': userFormat
            },
            event: { '#text': 'PUT' },
            requestId: { '#text': '' },
            source: { '#text': `/finesse/api/User/${UserID}` }
        }
    }

    let update_xml = builder.create(update, {headless: true}).end({ pretty: true });
    let finesse_number = 'simfin01'
    let company_name = 'jdin'
    var full_event = {
        message: {
            '@from': `pubsub.${finesse_number}.${company_name}.icm`,
            '@to': `${UserID}@${finesse_number}.${company_name}.icm`,
            '@id': `/finesse/api/User/${UserID}__${UserID}@${finesse_number}.${company_name}.icm__FyRVw`,
            event: {
                '@xmlns': 'http://jabber.org/protocol/pubsub#event',
                items: {
                    '@node': `/finesse/api/User/${UserID}`,
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

const DialogEventFormat = () => {
    
}

module.exports = {
    XmppUserEventFormat : UserEventFormat,
    XmppDialogEventFormat : DialogEventFormat,
}