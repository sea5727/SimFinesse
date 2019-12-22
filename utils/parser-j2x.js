const builder = require('xmlbuilder');
var Parser = require("fast-xml-parser").j2xParser;
var he = require("he");

//default options need not to set
var defaultOptions = {
    attributeNamePrefix: "@_",
    attrNodeName: "@", //default is false
    textNodeName: "#text",
    ignoreAttributes: true,
    cdataTagName: "__cdata", //default is false
    cdataPositionChar: "\\c",
    format: false,
    indentBy: "  ",
    supressEmptyNode: false,
    parseTrueNumberOnly : true,
    tagValueProcessor: a => he.encode(String(a), { useNamedReferences: true }),// default is a=>a
    attrValueProcessor: a => he.encode(String(a), { isAttributeValue: isAttribute, useNamedReferences: true })// default is a=>a
};
var parser = new Parser(defaultOptions);

var parse2 = function(json_or_json_obj){
    let update = {
        update: {
            data: {
                dialogs : {
                    '#text': json_or_json_obj
                }
            },
        }
    }
    return builder.create(update, { headless: true }).end({ pretty: true })
    
}

var parse = function (json_or_json_obj) {
    return parser.parse(json_or_json_obj);
}

var event = function () {
    var User = {
        User: {
            dialogs: { '#text': `/finesse/api/User/${UserID}/Dialogs` },
            extension: { '#text': '' },

            loginId: { '#text': `/finesse/api/User/${UserID}/Dialogs` },
            loginName: { '#text': `/finesse/api/User/${UserID}/Dialogs` },
            mediaType: { '#text': `1` },
            roles: {
                role: {
                    '#text': 'Agent'
                }

            },
            state: { '#text': `LOGOUT` },
            uri: { '#text': `/finesse/api/User/${UserID}` }
        }
    }


    //function makeStanza(UserId) {
    //    return new xmpp.Stanza('message', { to: 'localhost' })
    //        .c('event', { xmlns: 'http://jabber.org/protocol/pubsub#event' })
    //        .c('items', { node: `/finesse/api/User/${UserId}` })
    //        .c('item', { id: "da931a91-f39d-4081-8361-9afdf606956848660477" })
    //        .c('notification', { xmlns: "http://jabber.org/protocol/pubsub" })
    //        .t('HelloWorld');
    //};
}


module.exports = {
    parser: parser,
    parse: parse,
    parse2 : parse2,
}