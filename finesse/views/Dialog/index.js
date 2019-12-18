const fs = require('fs')
const express = require('express');
const router = express.Router();
const asyncFile = require('../../../file/asyncFile')
const expressAsyncHandler = require('express-async-handler')

router.get('/' , expressAsyncHandler( async (req, res) => {
    var { err , data } = await asyncFile.select(`./finesse/api/Dialog/DialogFormat.json`)
    if(err)
        return res.status(500).send({ message: 'unknown id' })
    return res.render('Dialog', {Dialog : data})
}))


router.get('/:id' , expressAsyncHandler( async (req, res) => {
    var { err , data } = await asyncFile.select(`./finesse/api/Dialog/${req.params.id}.json`)
    if(err)
        return res.status(500).send({ message: 'unknown id' })
    return res.render('Dialog', {Dialog : data})
}))

module.exports = router;