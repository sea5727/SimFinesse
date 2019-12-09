const { Machine, interpret } = require('xstate');
const builder = require('xmlbuilder');

const DialogMachineConfig = {
    id: 'Dialog',
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
    }
    GetXmppSession(){
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