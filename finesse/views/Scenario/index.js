const fs = require('fs')
const parser_x2j = require('../../../utils/parser-x2j')
const parser_j2x = require('../../../utils/parser-j2x')
const express = require('express');
const router = express.Router();
const asyncFile = require('../../../file/asyncFile')
const expressAsyncHandler = require('express-async-handler')
const _path = require('path')

router.get('/' , expressAsyncHandler( async (req, res) => {
    return res.render(`Scenario`)

}))

router.get('/:id' , expressAsyncHandler( async (req, res) => {
    var { err , data } = await asyncFile.select(`./finesse/api/Scenario/${req.params.id}.json`)
    if(err){
        var { err , data } = await asyncFile.select(`./finesse/api/Scenario/${req.params.id}.xml`)
        if(err){
            return res.status(500).send({ message: 'unknown id' })
        }
        data = JSON.stringify(parser_x2j.parse(data), null, 4)
    }
    return res.render('Scenario', {Scenario : data})
}))

router.get('/:scenario/:id/:event' , expressAsyncHandler( async (req, res) => {
    let path = req.originalUrl.replace('/views/', '/api/')
    var {err, data} = await asyncFile.select(`./${path}.xml`)
    if(err) return res.status(500).send({ message: 'no exist' })
    let objData = parser_x2j.parse(data)
    return res.render(`DialogView`, { 
        Dialog : JSON.stringify(objData, null, 4),
        
    })
}))


module.exports = router;