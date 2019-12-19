let xmpp_client = {}
module.exports = {
    get_xmpp : function(id){
        return xmpp_client[id]
    },
    set_xmpp : function(id, xmpp){
        xmpp_client[id] = xmpp
    },
}