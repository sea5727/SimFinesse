const fs = require('fs')
const logger = require('../../../utils/logger')
const parser_j2x = require('../../../utils/parser-j2x')
const dateFormat = require('dateformat')
const parser_x2j = require('../../../utils/parser-x2j')
const builder = require('xmlbuilder')
const express = require('express')
const FinesseMemory = require('../../../memory');
const router = express.Router()
const asyncFile = require('../../../file/asyncFile')
const expressAsyncHandler = require('express-async-handler')
const xmlFormat = require('../xmlFormat')
const _path = require('path')

function UpdateDialogID(objOrigDialog, objNewDialog){
    objOrigDialog.Dialog.id = objNewDialog.Dialog.id
    return objOrigDialog
}

async function SetStart(objDefault){
    console.log(objDefault)
    let DialogIdAgt = objDefault.Default.Scenario_DialogId_Agt// 1차호 dialogid
    for(scenarioIdx in objDefault.Scenarios.Scenario){
        for(eventIdx in objDefault.Scenarios.Scenario[scenarioIdx].Events){
            let event = objDefault.Scenarios.Scenario[scenarioIdx].Events[eventIdx]
            let filepath = `./finesse/api/Scenario/Dialog/${DialogIdAgt}/${event}.xml`
            var {err, data} = await asyncFile.select(filepath)
            if(err) continue
            let objDialog = parser_x2j.parse(data)
            let newDialog = UpdateDialogID(objDialog , { Dialog : { id : DialogIdAgt}})
            var {err} = await asyncFile.update(filepath, parser_j2x.parse(newDialog))
            if(err) continue
        }
    }
    asyncFile.select(`./Dialog/${DialogIdAgt}`)
    objDefault.Default.Scenario_DialogId_Mgr // 2차호 dialogid
}
router.post('/:id', expressAsyncHandler(async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    return res.status(202).send()
}))


router.get('/:id', expressAsyncHandler( async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    var { err, data } = await asyncFile.select(`.${req.originalUrl}.json`)
    if(err){
        return res.status(404).send()
    }
    await SetStart(JSON.parse(data))
    return res.status(202).contentType('application/json').send(data)



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

router.put('/Test', expressAsyncHandler(async (req, res) => {
    console.log('Test')
}))

router.put('/:type/:id/:eventName', expressAsyncHandler(async (req, res, next) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    if(!'Dialog' in req.body || !'RequestAction' in req.body.VO){
        next()
    }
    let request = req.body.VO.RequestAction
    if(request == 'SendEvent'){
        var {err, data} = await asyncFile.select(`.${req.originalUrl}.xml`) 
        let fromAddress = req.body.VO.FromAddress
        let agentId = req.body.VO.AgentId
        let extension = req.body.VO.Extension
        if(err) return res.status(500).send({ message: 'select err' })

        let objData = parser_x2j.parse(data)
        let xml = ``
        if('user' in objData) { 
            objData.user.dialogs = `/finesse/api/User/${agentId}/Dialogs`
            objData.user.extension = extension
            objData.user.loginId = agentId
            objData.user.loginName = agentId
            objData.user.uri = `/finesse/api/User/${agentId}`
            xml = xmlFormat.XmppUserEventFormatUsingObject(agentId, objData)
        }
        else if ('Dialog' in objData){
            objData.Dialog.fromAddress = fromAddress
            let CallVariables = objData.Dialog.mediaProperties.callvariables.CallVariable
            for(idx in CallVariables){
                if(CallVariables[idx].name == 'callVariable4'){
                    let defaultString = '_'.repeat(16)
                    let reserved = '_'.repeat(8)
                    let callingAddress = (fromAddress + defaultString).slice(0, 16)
                    let billingAddress = (fromAddress + defaultString).slice(0, 16)
                    CallVariables[idx].value = callingAddress + billingAddress + reserved
                }
            }
            objData.Dialog.fromAddress = fromAddress
            for(idx in objData.Dialog.participants.Participant){
                if(objData.Dialog.participants.Participant[idx].mediaAddressType == 'AGENT_DEVICE'){
                    objData.Dialog.participants.Participant[idx].mediaAddress = extension
                }
                else {
                    objData.Dialog.participants.Participant[idx].mediaAddress = fromAddress
                }
            }
            xml = xmlFormat.XmppDialogEventFormatUsingObject(agentId, objData)
        }
        let xmppSession = FinesseMemory.get_xmpp(agentId)
        if(xmppSession) xmppSession.send(xml)
        return res.contentType('xml').status(202).send(xml)
    }
    return res.sendStatus(200)
}))

router.put('/:id', expressAsyncHandler(async (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)
    var objData = null
    let ext = null
    var { err, data } = await asyncFile.select(`.${req.originalUrl}.json`)
    if(err || data.length == 0) {
        var { err, data } = await asyncFile.select(`.${req.originalUrl}.xml`)
        if(err){
            return res.status(500).send({ message: 'select err' })
        }
        else {
            objData = parser_x2j.parse(data)
            ext = 'xml'
        }
    }
    else {
        objData = JSON.parse(data)
        ext = 'json'
    }

    let objResult = {
        ...objData, ...req.body
    }
    let strResult = null
    if(ext == 'json'){
        strResult = JSON.stringify(objResult, null, 4)
    }
    else if (ext == 'xml'){
        strResult = parser_j2x.parse(objResult)
    }
    
    var { err } = await asyncFile.update(`.${req.originalUrl}.${ext}`, strResult)
    if(err)
        return res.status(500).send({ message: 'update err' })

    return res.status(200).send()


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


router.use('/User', require('./User'))
router.use('/Dialog', require('./Dialog'))



module.exports = router;
