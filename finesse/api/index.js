const fs = require('fs')
const logger = require('../../utils/logger')
const parser_j2x = require('../../utils/parser-j2x')
const express = require('express')
const router = express.Router();

router.use('/User', require('./User'))

router.get('/:query', (req, res) => {
    logger.info(`[HTTP] ${req.originalUrl}`)
    fs.readFile(`.${req.originalUrl}.json`, (err, data) => {
        if(err) {
            logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
            return res.send(404)
        } 
        let objRes = parser_j2x.parse(JSON.parse(data.toString())) 
        logger.info(objRes)
        res.status(202);
        res.contentType('Application/xml');
        return res.send(objRes);
    })

});

module.exports = router;