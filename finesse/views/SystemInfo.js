const fs = require('fs')
const express = require('express');
const router = express.Router();

router.get('/' , (req,res) => {
    fs.readFile('./finesse/api/SystemInfo.json', (err, data) => {
        if(err) {
            res.send(500)
            return
        }
        res.render('SystemInfo', { data : JSON.parse(data.toString()) } )
    })
    
})

module.exports = router;