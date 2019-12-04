const fs = require('fs')
const express = require('express');
const router = express.Router();

router.get('/' , (req, res) => {
    return res.render('Dialog')
})


router.get('/:id' , (req, res) => {
    return res.render('Dialog')
})

module.exports = router;