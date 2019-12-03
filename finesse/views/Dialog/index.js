const fs = require('fs')
const express = require('express');
const router = express.Router();

router.get('/:id' , (req, res) => {
    
    console.log(req)
    fs.readFile(`./finesse/api/Dialog/${req.params.id}.json`, (err, data) => {
        if(err) {
            res.send(500)
            return
        }
        return res.render('Dialog', {
            dialog : JSON.parse(data.toString()),
        } )
    })
    
})

module.exports = router;