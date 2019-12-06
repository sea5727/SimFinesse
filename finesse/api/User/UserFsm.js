const logger = require('../../../utils/logger')
const { Machine, interpret } = require('xstate');
const finesseMemory = require('../../../memory')
const dateFormat = require('dateformat')
const builder = require('xmlbuilder');
const asyncFile = require('../../../file/asyncFile')
// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.


const _userMachineConfig = {
    id: 'User',
    initial: 'LOGOUT',
    states: {
        LOGOUT: {
            on: {
                LOGIN: 'LOGIN'
            }
        },
        LOGIN: {
            on: { 
                '': {
                    target : 'NOT_READY',
                    actions : ['NotReadyUserEvent']
                }
            }
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
    },
}
const _userActions = {
    actions : {
        LoginUserEvent : (context, event) =>{
            console.log(context)
            console.log(event)
        },
        NotReadyUserEvent : (context, event) => {
            console.log('actions NotReadyUserEvent')
            return
            console.log(context)
            console.log(event)
            let xmppSession = finesseMemory.get_xmpp(context.User.loginId)
            if(xmppSession == null)
                return

        }
    }
}
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

class UserStateObject{
    constructor(initContext){
        this.userMachineConfig = _userMachineConfig
        if(initContext != null){
            this.userMachineConfig.context = initContext
        }
        this.UserStateMachine = Machine(this.userMachineConfig, _userActions)
        this.User = interpret(this.UserStateMachine).onTransition(this.EventCallback).start()
    }
    // InitXmppSession(xmppSession){
    //     this.xmppSession = xmppSession
    //     this.UserStateMachine = this.UserStateMachine.withContext({
    //         'xmppSession' : this.xmppSession,
    //         'UserObj' : this.UserObj ,
    //     })
    //     return this
    // }

    EventCallback(state){
        console.log('EventCallback state.value : ' , state.value)
        
        // state.context.User.state = state.value
        // state.context.User.stateChangeTime = dateFormat(new Date(), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'")        
        // let ret = asyncFile.update(`.${state.context.User.uri}.json`, JSON.stringify(state.context, null, 4))

        // let xmppSession = finesseMemory.get_xmpp(state.context.User.loginId)
        // if(xmppSession != null)
        //     xmppSession.send(UserEventFormat(state.context))
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