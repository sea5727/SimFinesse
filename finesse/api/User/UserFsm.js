const logger = require('../../../utils/logger')
const { Machine, interpret } = require('xstate');
const finesseMemory = require('../../../memory')
const dateFormat = require('dateformat')
const asyncFile = require('../../../file/asyncFile')
// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.


let _userMachineConfig = {
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
            console.log('actions NotReadyUserEvent' , event)
            return
            console.log(context)
            console.log(event)
            let xmppSession = finesseMemory.get_xmpp(context.User.loginId)
            if(xmppSession == null)
                return

        }
    }
}
class UserStateObject{
    constructor(initContext, initial='LOGOUT'){
        this.userMachineConfig = _userMachineConfig
        this.userMachineConfig.initial = initial
        if(initContext != null){
            this.userMachineConfig.context = initContext
        }
        this.UserStateMachine = Machine(this.userMachineConfig, _userActions)
        this.User = interpret(this.UserStateMachine).onTransition(this.EventCallback).start()
    }
    EventCallback(state){
        if(state.event.type == 'xstate.init'){
            return
        }
        console.log('EventCallback state.value : ' , state.value)
        state.context.User.state = state.value
        state.context.User.stateChangeTime = dateFormat(new Date(), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'")
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