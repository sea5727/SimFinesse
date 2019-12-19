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
const _path = require('path')

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

    if(req.params.id == 'SCENARIO_CONFIG'){
        let scenarioConfig = JSON.parse(data)

        var { err, filelist }  = await asyncFile.readdir('./finesse/api/Dialog')
        let max = -1
        let nextDialogId = 0
        for(key in filelist){
            let dialogId = _path.basename(filelist[key], ".json")
            if(isNaN(dialogId) != true) {
                if(max < parseInt(dialogId)) {
                    max = parseInt(dialogId)
                }
            }
        }
        nextDialogId = max + 1
        if(nextDialogId % 2 == 0) { // 짝수이면?
            scenarioConfig.NextAgtDialog.Id = String(nextDialogId)
            scenarioConfig.NextMgrDialog.Id = String(nextDialogId + 1)
        }else { // 홀수이면
            scenarioConfig.NextAgtDialog.Id = String(nextDialogId)
            scenarioConfig.NextMgrDialog.Id = String(nextDialogId + 1)
        }
        
        data = JSON.stringify(scenarioConfig, null, 4)
        
        var { err } = await asyncFile.update(`.${req.originalUrl}.json`, data)
        if(err)
            return res.status(500).send({ message: 'update err' })
    }

    return res.send(data)
}))

router.put('/:id', expressAsyncHandler(async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    
    var objEvent = null
    var { err, data } = await asyncFile.select(`.${req.originalUrl}.json`)
    if(err || data.length == 0) {
        var { err, data } = await asyncFile.select(`.${req.originalUrl}.xml`)
        if(err){
            return res.status(404)
        }
        else {
            objEvent = parser_xj2.parse(data)
        }
    }
    else {
        objEvent = JSON.parse(data)
        
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
        let userId = null
        let extension = null

        if(req.body.Request.clientType == 'AGT'){
            if(!('AgtLoginId' in req.body.Request.scenario)){
                return res.status(500).send({ message: 'id required' })
            }

            if('AgtLoginId' in req.body.Request.scenario){
                userId = req.body.Request.scenario.AgtLoginId
                objEvent.user.loginId = userId
                objEvent.user.loginName = userId
                objEvent.user.uri = `/finesse/api/User/${userId}`
                objEvent.user.dialogs = `/finesse/api/User/${userId}/Dialogs`
            }
            if('AgtExtension' in req.body.Request.scenario){ 
                extension = req.body.Request.scenario.AgtExtension
                objEvent.user.extension = extension
            }
        }
        else if(req.body.Request.clientType == 'MGR'){
            if(!('MgrLoginId' in req.body.Request.scenario)){
                return res.status(500).send({ message: 'id required' })
            }
            if('MgrLoginId' in req.body.Request.scenario){
                userId = req.body.Request.scenario.MgrLoginId
                objEvent.user.loginId = userId
                objEvent.user.loginName = userId
                objEvent.user.uri = `/finesse/api/User/${userId}`
                objEvent.user.dialogs = `/finesse/api/User/${userId}/Dialogs`
            }
            if('MgrExtension' in req.body.Request.scenario){ 
                exntension = req.body.Request.scenario.MgrExtension
                objEvent.user.extension = exntension
            }
        }

        const xmppSession = FinesseMemory.get_xmpp(userId)
        if(xmppSession == null){
            return res.status(500).send({ message: 'no sessioned user' })
        }
        const xmppDialogEvent = xmlFormat.XmppUserEventFormatUsingObject(userId, objEvent) 
        xmppSession.send(xmppDialogEvent)// send xmpp dialog event
        return res.status(200).send()
    }
    else if('DIALOG_EVENT'){
        let userId = null
        if(req.body.Request.clientType == 'AGT'){
            if(!('AgtLoginId' in req.body.Request.scenario)){
                return res.status(500).send({ message: 'required loginId' })
            }
            if('AgtLoginId' in req.body.Request.scenario){
                userId = req.body.Request.scenario.AgtLoginId
            }
            if('Calling' in req.body.Request.scenario){
                objEvent.dialogs.Dialog.fromAddress = req.body.Request.scenario.Calling
                for(index in objEvent.dialogs.Dialog.mediaProperties.callvariables.CallVariable){
                    if(objEvent.dialogs.Dialog.mediaProperties.callvariables.CallVariable[index].name == 'callVariable4'){
                        //callvariable.value = '01073647757_____01073647757_____' todo
                    }
                }
            }
            if('AgtDialog' in req.body.Request.dialog){
                console.log(req.body.Request.dialog.AgtDialog)
                objEvent.dialogs.Dialog.id = req.body.Request.dialog.AgtDialog
            }
    
        }
        else if(req.body.Request.clientType == 'MGR'){
            if(!('MgrLoginId' in req.body.Request.scenario)){
                return res.status(500).send({ message: 'required loginId' })
            }
            if('MgrLoginId' in req.body.Request.scenario){
                userId = req.body.Request.scenario.MgrLoginId
            }
            if('MgrDialog' in req.body.Request.dialog){
                console.log(req.body.Request.dialog.MgrDialog)
                objEvent.dialogs.Dialog.id = req.body.Request.dialog.MgrDialog
            }
        }

        const xmppSession = FinesseMemory.get_xmpp(userId)
        if(xmppSession == null){
            return res.status(500).send({ message: 'no sessioned user' })
        }
        
        const xmppDialogEvent = xmlFormat.XmppDialogEventFormatUsingObject(agtLoginId, objEvent)
        xmppSession.send(xmppDialogEvent)// send xmpp dialog event
        return res.status(200).send()

    }
    return res.status(202).send()
}))

router.delete('/:id', (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    return res.status(202).send()
})

module.exports = router;
