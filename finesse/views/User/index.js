const fs = require('fs')
const express = require('express');
const router = express.Router();
const utils = require('../../../utils/utils')
const userFormat = require('./user_format.json')
const asyncFile = require('../../../file/asyncFile')
const expressAsyncHandler = require('express-async-handler')


router.get('/', expressAsyncHandler( async (req, res) => {
    var { err , data } = await asyncFile.select(`./finesse/api/User/UserFormat.json`)
    if(err)
        return res.status(500).send({ message: 'unknown id' })
    return res.render('User', {User : data})

}))

router.get('/:id' , expressAsyncHandler( async (req, res) => {
    var { err , data } = await asyncFile.select(`./finesse/api/User/${req.params.id}.json`)
    if(err)
        return res.status(500).send({ message: 'unknown id' })
    return res.render('User', {User : data})
    
}))

router.put('/testaction', (req, res) => {
    console.log(req.params.id)
})

router.post('/createUser', (req, res) => {
    newUser = userFormat

    newUser.User.dialogs = req.body.dialogs
    newUser.User.extension = req.body.extension
    newUser.User.firstName = req.body.firstName
    newUser.User.lastName = req.body.lastName
    newUser.User.loginId = req.body.loginId
    newUser.User.loginName = req.body.loginName
    newUser.User.mediaType = req.body.mediaType
    newUser.User.pendingState = req.body.pendingState
    newUser.User.roles.role = req.body.role
    newUser.User.settings.wrapUpOnIncoming = req.body.wrapUpOnIncoming
    newUser.User.state = req.body.state
    newUser.User.stateChangeTime = req.body.stateChangeTime
    newUser.User.teamId = req.body.teamId
    newUser.User.teamName = req.body.teamName
    newUser.User.uri = req.body.uri
    

    fs.writeFile(`./finesse/api/User/${newUser.User.loginId}`, JSON.stringify(newUser, null, 4), (writeError) => {
        if (writeError) {
            //fail
        }
        res.redirect('/').send()
    })
})
module.exports = router;