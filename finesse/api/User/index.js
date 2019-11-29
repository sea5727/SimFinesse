const fs = require('fs')
const logger = require('../../../utils/logger')
const parser_j2x = require('../../../utils/parser-j2x')
const express = require('express');
const router = express.Router();

//curl -X GET 127.0.0.1:3000/finesse/api/User/840000009
router.get('/:id', (req, res) => {
    logger.info(`[HTTP] ${req.originalUrl}`)
    // fs.readFile(`.${req.originalUrl}.json`, (err, data) = > {
    //     if(err){
    //         res.status(404).send()
    //     }
    //     else {
    //         logger.info('FIND!!')
    //     }
    // })
    res.status(404).send()
});
module.exports = router;