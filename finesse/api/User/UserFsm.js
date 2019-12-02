const { Machine, interpret } = require('xstate');
const builder = require('xmlbuilder');
 
// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.

const UserMachineConfig = {
    id: 'User',
    initial: 'LOGOUT',
    states: {
        LOGOUT: {
            on:
            {
                LOGIN: 'NOT_READY'
            }
        },
        LOGIN: {
            on: { '': 'NOT_READY' }
        },
        NOT_READY: {
            on: {
                NOT_READY: 'NOT_READY',
                READY: 'READY',
                LOGOUT: 'LOGOUT'
            }
        },
        READY: {
            on: {
                READY: 'READY',
                NOT_READY: 'NOT_READY',
                CALL: 'CALL'
            }
        },
        CALL: {

        }
    }
}

const UserEventFormat = (UserObj) => {
    let UserID = UserObj.User.loginId;
    let update = {
        update: {
            data: {
                '#text': UserObj
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

class UserStateObject{
    constructor(){
        this.UserStateMachine = Machine(UserMachineConfig)
        this.xmppSession = null
        this.UserObj = null
    }
    InitXmppSession(xmppSession){
        this.xmppSession = xmppSession
        this.UserStateMachine = this.UserStateMachine.withContext({
            'xmppSession' : this.xmppSession,
            'UserObj' : this.UserObj ,
        })
        return this
    }
    InitUserObj(UserObj){
        this.UserObj = UserObj
        this.UserStateMachine = this.UserStateMachine.withContext({
            'xmppSession' : this.xmppSession,
            'UserObj' : this.UserObj ,
        })
        return this
    }
    CreateUserFsm(){
        this.User = interpret(this.UserStateMachine).onTransition(this.EventCallback).start()
        return this.User
    }
    EventCallback(state){
        if(state.value == 'LOGOUT') return
        console.log(state.value)
        console.log(UserEventFormat(state.context.UserObj))
    }
    GetUser(){
        return this.User
    }
}

module.exports = UserStateObject
// Machine instance with internal state
//const User = interpret(UserMachine).onTransition(state => console.log(state.value))//.start();
  
// => 'inactive'
 
// User.send('LOGIN');
// // // => 'active'
 
// User.send('READY');
// // => 'inactive'