const express = require('express')
const router = express.Router()
const asyncFile = require('../../../../file/asyncFile')
const parser_xj2 = require('../../../../utils/parser-x2j')
const expressAsyncHandler = require('express-async-handler')

router.get('/:id', expressAsyncHandler( async (req, res) => {
    var {err, data} = await asyncFile.select(`.${req.originalUrl}.xml`)
    if(err)
        return res.status(500).send({ message: 'no exist user' })
    res.contentType('application/xml').send(data)

}))

router.get('/:id/*', expressAsyncHandler( async (req, res) => {
    var {err, data} = await asyncFile.select(`.${req.originalUrl}.xml`)
    if(err)
        return res.status(500).send({ message: 'no exist user' })
    res.contentType('application/xml').send(data)

}))

module.exports = router;
