const fs = require('fs')
const logger = require('../../utils/logger')
const parser_j2x = require('../../utils/parser-j2x')
const express = require('express')
const router = express.Router();

router.use('/User', require('./User'))
router.use('/Dialog', require('./Dialog'))


router.get('/SystemInfo', (req, res) => {
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


router.get('/UserFormat', (req, res) => {
    logger.info(`[HTTP] ${req.originalUrl}`)
    fs.readFile(`.${req.originalUrl}.json`, (err, data) => {
        if(err) {
            logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
            return res.send(404)
        } 
        res.status(200)
        res.contentType('application/json')
        return res.send(data.toString())
    })

});

router.get('/DialogFormat', (req, res) => {
    logger.info(`[HTTP] ${req.originalUrl}`)
    fs.readFile(`.${req.originalUrl}.json`, (err, data) => {
        if(err) {
            logger.info(`[ERR] url: ${req.originalUrl} err : ${err.message}`)
            return res.send(404)
        }
        let objRes = parser_j2x.parse(JSON.parse(data.toString())) 
        res.status(202);
        res.contentType('Application/xml');
        return res.send(objRes);

        res.status(200)
        res.contentType('application/json')
        return res.send(data.toString())
    })
});




module.exports = router;