const logger = require('./utils/logger');
const express = require('express');
const app = express();
const xmlParser = require('express-xml-bodyparser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xmlParser());


app.get('/', (req, res) => {
    res.send('Hello World!\n');
});

app.post('/', (req, res) => {
    res.send('Hello World post!\n');
});



app.use('/finesse/api/SystemInfo', require('./finesse/api/SystemInfo'));
// app.use('/finesse/api/User', require('./finesse/api/User'));

var listen = function (port) {
    app.listen(port, () => {
        logger.info(`Example app listening on port ${port}!`)
    });
}

module.exports = listen