const fs = require('fs')
const logger = require('../../../utils/logger')
const parser_j2x = require('../../../utils/parser-j2x')
const dateFormat = require('dateformat')
const parser_xj2 = require('../../../utils/parser-x2j')
const builder = require('xmlbuilder')
const UserFsm = require('./UserFsm')
const express = require('express')
const FinesseMemory = require('../../../memory');
const asyncFile = require('../../../file/asyncFile')
const xpressAsyncHandler = require('express-async-handler')
const router = express.Router()

//curl -X GET 127.0.0.1:3000/finesse/api/User/840000009
router.get('/:id', (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)

    fs.readFile(`.${req.originalUrl}.json`, (err, data) => {
        if(err){
            logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
            return res.status(404).send()
        }
        else {
            dataObj = JSON.parse(data.toString())
            let dataXml = parser_j2x.parse(dataObj)
            // dataXml = dataXml.replace(/user>/g, "User>")
            logger.debug(`[XML] url: ${req.originalUrl} xml : ${dataXml}`)
            res.status(202)
            res.contentType('Application/xml')
            return res.send(dataXml)
        }
    })
})

//curl -X PUT 192.168.0.25:3000/finesse/api/User/840000009 -d "<User><extension>3000</extension><state>NOT_READY</state></User>" -H "Content-Type: Application/xml" -v
//curl -X PUT 192.168.0.205:3000/finesse/api/User/840000009 -d "<User><extension>3003</extension><state>LOGIN</state></User>" -H "Content-Type: Application/xml" -v
router.put('/:id', xpressAsyncHandler(async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)

    const userId = req.params.id

    let memoryUser = FinesseMemory.get_user(userId)
    let userData = undefined
    if(memoryUser === undefined){ // need select
        const { err, data } = await asyncFile.select(`.${req.originalUrl}.json`)
        if(err){
            logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
            return res.status(404).send()
        }
        userData = JSON.parse(data)
    }
    else 
        userData = memoryUser.User.state.context


    if(req.body.user.state[0] == 'LOGIN'){ // if login request
        if(userData.User.state != 'LOGOUT'){
            return res.status(400).send({messgae : 'already logined user'})//todo 실패 d응답
        }
        userData.User.extension = req.body.user.extension[0]
        userFsm = new UserFsm(userData)
        FinesseMemory.set_user(userId, userFsm)
        memoryUser = userFsm
    }

    memoryUser.GetUser().send(req.body.user.state[0])

    console.log('start update')
    // const { err } = asyncFile.update(`.${req.originalUrl}.json`, )
    // if(err) {
    //     logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
    //     return res.status(500).send()
    // }

    
    //memoryUser.GetUser().send(req.body.user.state[0])


    return res.status(404).send()
    fs.readFile(`.${req.originalUrl}.json`, (err, data) => {
        if(err){
            logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
            return res.status(404).send()
        }
        else {
            dataObj = JSON.parse(data.toString())
            // if user exist
            if(req.body.user.state[0] == 'LOGIN'){
                if(dataObj.User.state != 'LOGOUT'){
                    return res.status(404).send()//todo 실패 응답
                }
                User = new UserFsm()
                xmpp_session = FinesseMemory.get_xmpp(req.params.id)
                User.InitXmppSession(xmpp_session).CreateUserFsm()
                FinesseMemory.set_user(req.body.user.extension[0], User)
                // User.InitXmppSession(FinesseMemory.get_xmpp(req.body.user.extension[0]))
                dataObj.User.extension = req.body.user.extension[0]
                dataObj.User.state = 'NOT_READY'
                dataObj.User.stateChangeTime = dateFormat(new Date(), "UTC:h:MM:ss TT Z")
            }
            else if(req.body.user.state[0] == 'LOGOUT'){
                dataObj.User.state = 'LOGOUT'
                dataObj.User.extension = null
                dataObj.User.stateChangeTime = dateFormat(new Date(), "UTC:h:MM:ss TT Z")
            }
            else {
                dataObj.User.state = req.body.user.state[0]
                dataObj.User.stateChangeTime = dateFormat(new Date(), "UTC:h:MM:ss TT Z")
            }

            fs.writeFile(`.${req.originalUrl}.json`, JSON.stringify(dataObj, null, 4), (err) => {
                if(err) {
                    logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
                    return res.status(404).send()
                }
                else {
                    // 이부분에서 xmpp user event 내려줘야 할듯... fsm_state..??
                    let dataXml = parser_j2x.parse(dataObj) 
                    logger.debug(`[XML] url: ${req.originalUrl} xml : ${dataXml}`)
                    res.status(202).contentType('Application/xml').send()
                    
                    logger.debug('send Data : ', dataObj)
                    logger.debug('send dataObj.User.state : ', req.body.user.state[0])
                    User = FinesseMemory.get_user(dataObj.User.extension).InitUserObj(dataObj)
                    User.GetXmppSession().send(req.body.user.state[0])
                    FinesseMemory.set_user(dataObj.User.extension, User)

                }
            })

        }
    })
}))
module.exports = router;