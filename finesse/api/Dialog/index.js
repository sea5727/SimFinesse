const fs = require('fs')
const logger = require('../../../utils/logger')
const parser_j2x = require('../../../utils/parser-j2x')
const dateFormat = require('dateformat')
const parser_xj2 = require('../../../utils/parser-x2j')
const builder = require('xmlbuilder')
const express = require('express')
const FinesseMemory = require('../../../memory');
const router = express.Router()
const asyncFile = require('../../../file/asyncFile')
const expressAsyncHandler = require('express-async-handler')
const xmlFormat = require('../xmlFormat')





router.post('/:id', expressAsyncHandler(async (req, res) => {
    var { err } = await asyncFile.exists(`.${req.originalUrl}.json`)
    if (!err) {
        return res.send(404, { message: 'already exists' })
    }

    var { err } = await asyncFile.update(`.${req.originalUrl}.json`, JSON.stringify(req.body, null, 4))
    if (err) {
        return res.status(500).send({ message: 'create fail' })//todo 실패 d응답
    }

    res.status(202).send()

    // 1. 호 만들어짐
    // 2. 유저 찾기
    let anyUser = FinesseMemory.get_any_user()
    if(anyUser === undefined)
        return

    const userId = anyUser.Fsm.state.context.User.loginId
    let result = anyUser.Fsm.send('RESERVED')
    if(!result.changed)
        return
    
    var { err } = await asyncFile.update(`.${result.context.User.uri}.json`, JSON.stringify(result.context, null, 4))
    if(err)
        return

    const xmppSession = FinesseMemory.get_xmpp(userId)
    if(xmppSession == null)
        return
    
    const xmppUserEvent = xmlFormat.XmppEventFormat(result.context.User.loginId, result.context)
    xmppSession.send(xmppUserEvent)


    req.body.Dialog.state = 'ALERTING'
    let dataXml = parser_j2x.parse(req.body) 
    logger.debug(`[XML] url: ${req.originalUrl} xml : ${dataXml}`)


    const xmppDialogEvent = xmlFormat.XmppEventFormat(result.context.User.loginId, req.body)
    xmppSession.send(xmppDialogEvent)

    
    // 3. RESERVED
    // 4. ALERT
    return
}))

router.get('/:id', expressAsyncHandler( async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)

    var { err, data } = await asyncFile.select(`.${req.originalUrl}.json`)
    if(err){
        logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
        return res.status(404).send({message : 'no exists'})
    }

    dataObj = JSON.parse(data)
    let dataXml = parser_j2x.parse(dataObj)
    logger.debug(`[XML] url: ${req.originalUrl} xml : ${dataXml}`)
    res.status(202)
    res.contentType('Application/xml')
    return res.send(dataXml)
}))

router.put('/:id', expressAsyncHandler(async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)

    var { err } = await asyncFile.exists(`.${req.originalUrl}.json`)
    if (err) {
        return res.status(404).send({message : `unknown`})
    }

    var { err } = await asyncFile.update(`.${req.originalUrl}.json`, JSON.stringify(req.body, null, 4))
    if (err) {
        return res.status(500).send({ message: 'create fail' })//todo 실패 d응답
    }

    res.status(202).contentType('Application/xml').send()
    return 
}))

router.delete('/:id', (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    fs.unlink(`.${req.originalUrl}.json`, (err) => {
        console.log(err)
        return res.status(202).send()
    })
})
module.exports = router;