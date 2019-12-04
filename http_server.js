const logger = require('./utils/logger');
const express = require('express');
const xmlParser = require('express-xml-bodyparser');
const bodyParser = require('body-parser')

const app = express();
app.locals.util = require('util')
app.use('/public', express.static('public'))

console.log('__dirname' , __dirname)
app.set('views', [__dirname + '/views', './finesse/views']);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


app.use(bodyParser .json());
app.use(bodyParser .urlencoded({ extended: true }));
app.use(xmlParser());


app.get('/', (req, res) => {
    res.render('index')
});



app.use('/finesse/views/SystemInfo', require('./finesse/views/SystemInfo'))
app.use('/finesse/views/User', require('./finesse/views/User'))
app.use('/finesse/views/Dialog', require('./finesse/views/Dialog'))

app.get('/User' , (req,res) => {
    res.render('index')
})

app.get('/SystemInfo' , (req,res) => {
    res.render('index')
})

app.post('/', (req, res) => {
    res.send('Hello World post!\n');
});




// app.use('/finesse/api/SystemInfo', require('./finesse/api/SystemInfo'));
app.use('/finesse/api', require('./finesse/api'));

var listen = function (port) {
    app.listen(port, () => {
        logger.info(`Example app listening on port ${port}!`)
    });
}

module.exports = listen