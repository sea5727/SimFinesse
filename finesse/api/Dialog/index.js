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

    if(req.body == ''){
        var { err, data } = await asyncFile.select(`./finesse/api/Dialog/DialogFormat.json`)
        if (err) {
            return res.send(404, { message: 'no datas' })
        }
        req.body = JSON.parse(data)
    }

    var { err } = await asyncFile.update(`.${req.originalUrl}.json`, JSON.stringify(req.body, null, 4))
    if (err) {
        return res.status(500).send({ message: 'create fail' })//todo 실패 d응답
    }

    return res.status(202).send()
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

    var { err, data } = await asyncFile.select(`.${req.originalUrl}.json`)
    if(err){
        logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
        return res.status(404).send({message : 'no exists'})
    }

    if(req.body.Dialog.requestedAction == 'TEST'){
        let state = req.body.Dialog.state
        let userId = req.body.Dialog.userId
        var { err, data } = await asyncFile.select(`./finesse/api/Dialog/${state}`)

        const xmppSession = FinesseMemory.get_xmpp(userId)
        if(xmppSession == null){
            return res.status(500).send({ message: 'no xmpp user' })
        }
        let objData = parser_xj2.parse(data)
        console.log(objData)
        const xmppDialogEvent = xmlFormat.XmppDialogEventFormatUsingString(userId, objData) // send xmpp dialog event
        
        xmppSession.send(xmppDialogEvent)
    }
    else if(req.body.Dialog.requestedAction == 'ALERTING'){
        let anyUser = FinesseMemory.get_any_user()
        if(anyUser === undefined){
            return res.status(500).send({ message: 'no ready user' })
        }

        const userId = anyUser.Fsm.state.context.User.loginId
        let result = anyUser.Fsm.send('RESERVED')
        if(!result.changed){
            return res.status(500).send({ message: 'no reserved user' })
        }

        // update user data
        var { err } = await asyncFile.update(`.${result.context.User.uri}.json`, JSON.stringify(result.context, null, 4))
        if(err){
            return res.status(500).send({ message: 'update reserved user fail' })
        }        const xmppSession = FinesseMemory.get_xmpp(userId)
        if(xmppSession == null){
            return res.status(500).send({ message: 'no xmpp user' })
        }



        const xmppUserEvent = xmlFormat.XmppUserEventFormatUsingObject(result.context.User.loginId, result.context) // send xmpp user event 
        xmppSession.send(xmppUserEvent)

        let objDialog = JSON.parse(data)
        objDialog.Dialog.state = 'ALERTING'

        var { err } = await asyncFile.update(`.${req.originalUrl}.json`, JSON.stringify(objDialog, null, 4))
        if (err) {
            return res.status(500).send({ message: 'update fail' })
        }
    
        const xmppDialogEvent = xmlFormat.XmppDialogEventFormatUsingObject(result.context.User.loginId, objDialog) // send xmpp dialog event
        xmppSession.send(xmppDialogEvent)
    }

    return res.status(202).contentType('Application/xml').send()
    
}))

router.delete('/:id', (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    fs.unlink(`.${req.originalUrl}.json`, (err) => {
        console.log(err)
        return res.status(202).send()
    })
})
module.exports = router;