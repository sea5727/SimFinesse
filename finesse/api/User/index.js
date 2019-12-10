const logger = require('../../../utils/logger')
const parser_j2x = require('../../../utils/parser-j2x')
const UserFsm = require('./UserFsm')
const express = require('express')
const FinesseMemory = require('../../../memory');
const xmlFormat = require('../xmlFormat')
const asyncFile = require('../../../file/asyncFile')
const expressAsyncHandler = require('express-async-handler')
const deepmerge = require('deepmerge')
const router = express.Router()


router.post('/:id', expressAsyncHandler(async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)

    var { err, exists } = await asyncFile.exists(`.${req.originalUrl}.json`)
    if (!err) {
        return res.send(404, { message: 'already user exists' })
    }

    var { err } = await asyncFile.update(`.${req.originalUrl}.json`, JSON.stringify(req.body, null, 4))
    if (err) {
        return res.status(500).send({ message: 'create fail' })//todo 실패 d응답
    }
    return res.status(202).send()
}))



//curl -X GET 192.168.0.205:3000/finesse/api/User/840000009
router.get('/:id', expressAsyncHandler(async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)

    const userId = req.params.id

    let memoryUser = FinesseMemory.get_user(userId)
    let userData = undefined
    if(memoryUser){
        userData = memoryUser.Fsm.state.context
    }
    if(memoryUser === undefined){ // need select
        const { err, data } = await asyncFile.select(`.${req.originalUrl}.json`)
        if(err){
            logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
            return res.status(404).send({message : `unknown user`})
        }
        userData = JSON.parse(data)
    }
    
    let dataXml = parser_j2x.parse(userData)
    logger.debug(`[XML] url: ${req.originalUrl} xml : ${dataXml}`)
    res.status(202)
    res.contentType('Application/xml')
    return res.send(dataXml)
}))

//curl -X PUT 192.168.0.205:3000/finesse/api/User/840000009 -d "<User><extension>3000</extension><state>NOT_READY</state></User>" -H "Content-Type: Application/xml" -v
//curl -X PUT 192.168.0.205:3000/finesse/api/User/840000009 -d "<User><extension>3003</extension><state>LOGIN</state></User>" -H "Content-Type: Application/xml" -v
router.put('/:id', expressAsyncHandler(async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)

    const userId = req.params.id

    let memoryUser = FinesseMemory.get_user(userId)
    let userData = undefined
    if(memoryUser === undefined){ // need select
        const { err, data } = await asyncFile.select(`.${req.originalUrl}.json`)
        if(err){
            logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
            return res.status(404).send({ message : `unknown user`})
        }
        userData = JSON.parse(data)
    }
    else 
        userData = memoryUser.Fsm.state.context


    if(req.body.User.state == 'LOGIN'){ // if login request
        if(userData.User.state != 'LOGOUT'){
            return res.status(400).send({message : 'already logined user'})//todo 실패 d응답
        }
        userData.User.extension = req.body.User.extension
        let userFsm = new UserFsm(userData, 'LOGOUT')
        FinesseMemory.set_user(userId, userFsm)
        memoryUser = userFsm
    }
    else if(memoryUser === undefined){
        userFsm = new UserFsm(userData, userData.User.state)
        FinesseMemory.set_user(userId, userFsm)
        memoryUser = userFsm
    }

    let result = memoryUser.GetFsm().send(req.body.User.state)
    
    
    if(!result.changed){
        if(result.nextEvents.indexOf(result.event.type) >= 0){
            result.context = deepmerge(result.context, req.body)
            return res.status(202).send()
        }
        else {
            return res.status(400).send({message : 'invalid message'})
        }
    }
    
    if(req.body.User.state == 'LOGIN')
        req.body.User.state = 'NOT_READY'
    result.context = deepmerge(result.context, req.body)

    const { err } = await asyncFile.update(`.${req.originalUrl}.json`, JSON.stringify(result.context, null, 4))
    if(err){
        return res.status(500).send({message : 'update fail'})//todo 실패 d응답
    }
    res.status(202).contentType('Application/xml').send()


    const xmppSession = FinesseMemory.get_xmpp(userId)
    if(xmppSession != null) { 
        const xmppUserEvent = xmlFormat.XmppEventFormat(result.context.User.loginId, result.context)
        xmppSession.send(xmppUserEvent)
    }
    return
}
))

router.delete('/:id', expressAsyncHandler(async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)

    var {err} = await asyncFile.delete(`.${req.originalUrl}.json`)

    if(err){
        return res.send(404, {message: 'delete fail'})
    }
    
    return res.send(202).send()
}))


module.exports = router;