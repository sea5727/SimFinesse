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
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    return res.status(202).send()
}))

router.get('/:id', expressAsyncHandler( async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    var { err, data } = await asyncFile.select(`.${req.originalUrl}.json`)
    if(err){
        return res.status(404)
    }
    return res.send(data)
}))

router.put('/:id', expressAsyncHandler(async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    
    var objEvent = null
    var { err, data } = await asyncFile.select(`.${req.originalUrl}.xml`)
    if(err || data.length == 0) {
        var { err, data } = await asyncFile.select(`.${req.originalUrl}.json`)
        if(err){
            return res.status(404)
        }
        else 
        objEvent = JSON.parse(data)
    }
    else {
        objEvent = parser_xj2.parse(data)
    }

    

    if(req.body.Request.eventType == 'SCENARIO_DEFAULT_VALUE'){
        Object.assign(objEvent.Default, req.body.Request.scenario)
        var { err } = await asyncFile.update(`.${req.originalUrl}.json`, JSON.stringify(objEvent, null, 4))
        if(err){
            return res.status(500).send({ message: 'update err' })
        }
        
        return res.status(202).send()
    }
    else if(req.body.Request.eventType == 'USER_EVENT'){
        let agtExntension = null
        let agtLoginId = null
        if('AgtLoginId' in req.body.Request.scenario){
            agtLoginId = req.body.Request.scenario.AgtLoginId
            objEvent.user.loginId = agtLoginId
            objEvent.user.loginName = agtLoginId
            objEvent.user.uri = `/finesse/api/User/${agtLoginId}`
            objEvent.user.dialogs = `/finesse/api/User/${agtLoginId}/Dialogs`
        } 
        else {
            return res.status(500).send({ message: 'required loginId' })
        }
        if('AgtExtension' in req.body.Request.scenario){ 
            agtExntension = req.body.Request.scenario.AgtExtension
            objEvent.user.extension = agtExntension
        }
        if('AgtLoginId' in req.body.Request.scenario){
            agtLoginId = req.body.Request.scenario.AgtLoginId
            objEvent.user.loginId = agtLoginId
            objEvent.user.loginName = agtLoginId
            objEvent.user.uri = `/finesse/api/User/${agtLoginId}`
            objEvent.user.dialogs = `/finesse/api/User/${agtLoginId}/Dialogs`
        }

        const xmppSession = FinesseMemory.get_xmpp(agtLoginId)
        if(xmppSession == null){
            return res.status(500).send({ message: 'no sessioned user' })
        }
        const xmppDialogEvent = xmlFormat.XmppUserEventFormatUsingObject(agtLoginId, objEvent) 
        xmppSession.send(xmppDialogEvent)// send xmpp dialog event
        return res.status(200).send()
    }
    else if(req.body.Request.eventType == 'DIALOG_EVENT'){
        let agtExntension = null
        let agtLoginId = null

        if('AgtLoginId' in req.body.Request.scenario){
            agtLoginId = req.body.Request.scenario.AgtLoginId
        }
        else{
            return res.status(500).send({ message: 'required loginId' })
        }


        if('Calling' in req.body.Request.scenario){
            objEvent.dialogs.Dialog.fromAddress = req.body.Request.scenario.Calling
            for(index in objEvent.dialogs.Dialog.mediaProperties.callvariables.CallVariable){
                if(objEvent.dialogs.Dialog.mediaProperties.callvariables.CallVariable[index].name == 'callVariable4'){
                    console.log(objEvent.dialogs.Dialog.mediaProperties.callvariables.CallVariable[index].value)
                    //callvariable.value = '01073647757_____01073647757_____' todo
                }
            }
            console.log(req.body)
        }
    
        if('AgtExtension' in req.body.Request.scenario){ 
            if(req.params.id.indexOf('AGT') == 0){
                //search xmpp and send 
                console.log('send xmpp to AGT')
            }
        }
    
        if('MgrExtension' in req.body.Request.scenario){
            if(req.params.id.indexOf('MGR') == 0){
                //search xmpp and send 
                console.log('send xmpp to MGR')
            }
        }

        const xmppSession = FinesseMemory.get_xmpp(agtLoginId)
        if(xmppSession == null){
            return res.status(500).send({ message: 'no sessioned user' })
        }
        const xmppDialogEvent = xmlFormat.XmppUserEventFormatUsingObject(agtLoginId, objEvent) 
        xmppSession.send(xmppDialogEvent)// send xmpp dialog event
        return res.status(200).send()
    }
   
    return res.status(202)
}))

router.delete('/:id', (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    return res.status(202).send()
})
module.exports = router;
