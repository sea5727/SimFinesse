const fs = require('fs')
const logger = require('../../../utils/logger')
const parser_j2x = require('../../../utils/parser-j2x')
const dateFormat = require('dateformat')
const parser_xj2 = require('../../../utils/parser-x2j')
const builder = require('xmlbuilder')
const express = require('express')
const FinesseMemory = require('../../../memory');
const router = express.Router()

router.get('/:id', (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)

    fs.readFile(`.${req.originalUrl}.json`, (err, data) => {
        if(err){
            logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
            return res.status(404).send()
        }
        else {
            dataObj = JSON.parse(data.toString())
            let dataXml = parser_j2x.parse(dataObj)
            logger.debug(`[XML] url: ${req.originalUrl} xml : ${dataXml}`)
            res.status(202)
            res.contentType('Application/xml')
            return res.send(dataXml)
        }
    })
})

router.put('/:id', (req, res) => {
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} : ${JSON.stringify(req.body)}`)

    fs.readFile(`.${req.originalUrl}.json`, (err, data) => {
        if(err){
            logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
            return res.status(404).send()
        }
        else {
            dataObj = JSON.parse(data.toString())

            fs.writeFile(`.${req.originalUrl}.json`, JSON.stringify(dataObj, null, 4), (err) => {
                if(err) {
                    logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
                    return res.status(404).send()
                }
                else {
                    // 이부분에서 xmpp user event 내려줘야 할듯... fsm_state..??
                    let dataXml = parser_j2x.parse(dataObj) 
                    logger.debug(`[XML] url: ${req.originalUrl} xml : ${dataXml}`)
                    res.status(202).contentType('Application/xml').send()
                    return

                }
            })

        }
    })
})

module.exports = router;