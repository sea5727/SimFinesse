const fs = require('fs')
const parser_x2j = require('../../../utils/parser-x2j')
const express = require('express');
const router = express.Router();
const asyncFile = require('../../../file/asyncFile')
const expressAsyncHandler = require('express-async-handler')

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

module.exports = router;