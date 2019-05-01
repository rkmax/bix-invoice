const path = require('path');
const http = require('http');
const express = require('express');
const invoice = require('./index');

const app = express();

const jsonPath = process.argv[2] || path.join(__dirname, './sample.json')

app.get('/' ,(req, res, next) => {
    invoice(jsonPath, 'out')
        .then(html => {
            res.send(html);
        })
        .catch(err => {
            next(err);
        })
});

const port = JSON.parse(process.env.PORT || '3000');


http.createServer(app).listen(port, () => {
    console.log('listening on', port);
});
