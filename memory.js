let xmpp_client = {}
let user_fsm = {}
module.exports = {
    get_xmpp : function(id){
        return xmpp_client[id]
    },
    set_xmpp : function(id, xmpp){
        xmpp_client[id] = xmpp
    },
    get_user : function(DN){
        return user_fsm[DN]
    },
    set_user : function(DN, user){
        user_fsm[DN] = user
    }
    
}