let xmpp_client = []

module.exports = {
    get_client : function(id){
        return xmpp_client[id]
    },
    set_client : function(id, xmpp){
        xmpp_client[id] = xmpp
    }
}