const fs = require('fs')
const logger = require('../../../utils/logger')
const parser_j2x = require('../../../utils/parser-j2x')
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // var Sysinfo = messages.makeSystemInfo('IN_SERVICE');
    fs.readFile(`.${req.originalUrl}/data.json`, (err, data) => {
        if(err) {
            res.send(500)
        } 
        let objRes = parser_j2x.parse(JSON.parse(data.toString())) 
        logger.info(objRes)
        res.status(202);
        res.contentType('Application/xml');
        res.send(objRes);
    })

});

module.exports = router;