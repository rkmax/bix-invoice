#!/usr/bin/env node

const path = require('path');

process.env.OPENSSL_CONF = path.join(__dirname, '..', 'openssl.conf');


const ejs = require('ejs');
const pdf = require('html-pdf');
const os = require('os');
const fs = require('fs');
const writtenNumber = require('written-number');
const fromJSON = require('tcomb/lib/fromJSON');
const {Input, ProcessedData} = require('./model');

const filters = {
    moneyClass: function(value) {
        return value < 0 ? 'money neg' : 'money';
    },
    writtenNumber: function(value, lang = 'es') {
        return writtenNumber(value, {lang});
    },
    moneyFormat: function(value) {
        return Math.abs(value).toLocaleString('es-US', {maximumFractionDigits: 2, minimumFractionDigits: 2});
    },
    totalFormat: function (value) {
        return Math.abs(value).toLocaleString('es-US', {maximumFractionDigits: 0});
    }
};
const ejsOptions = {
    root: path.join(__dirname, 'view'),
    locals: {
        filters
    }
};

const {exec} = require('child_process');

async function mktemp(opts) {
    return cmd(`mktemp ${opts}`);
}

async function cmd(opts) {
    return new Promise((resolve, reject) => {
        exec(opts, (err, stdout, stderr) => {
            if (err) {
                reject(new Error(stderr));
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

async function processData(data) {
    const input = fromJSON(data, Input);
    const processedData = {
        processedItems: [],
        total: 0
    };

    input.items.forEach(item => {
        const {qty, value, description} = item;
        const total = value * qty;
        processedData.processedItems.push({description, qty, value, total});
        processedData.total += total;
    });

    if (input.signature) {
        const base64 = await readFile(input.signature.file, 'base64');
        processedData.signatureBase64 = `data:image/png;base64,${base64}`;
    }

    Object.assign(processedData, JSON.parse(JSON.stringify(input)));

    return fromJSON(processedData, ProcessedData);
}

async function render(templateName, data = {}) {
    const filename = path.join(ejsOptions.root, templateName);
    const context = Object.assign(data, {filters});
    return new Promise((resolve, reject) => {
        ejs.renderFile(filename, context, ejsOptions, (err, str) => {
            if (err) {
                reject(err);
            } else {
                resolve(str);
            }
        });
    });
}

async function write(html, filename) {
    return new Promise((resolve, reject) => {
        pdf.create(html).toFile(filename, (err, res) => {
            if (err) {
                reject(err);
            } else {
                console.log('res', res);
                resolve(res);
            }
        });
    });
}

async function open(filename) {
    switch (os.platform()) {
        case 'darwin':
            return cmd(`open ${filename}`);
        case 'linux':
            return cmd(`gio open ${filename}`);
        default:
            console.log(`open the filename '${filename}' yourself`);
    }
}

async function readFile(filename, encode = 'utf8') {

    return new Promise((resolve, reject) => {
        fs.readFile(filename, encode, (err, content) => {
            if (err) {
                return reject(err);
            }
            resolve(content);
        });
    });
}

async function init(jsonPath, output = 'pdf') {
    const jsonContent = await readFile(jsonPath);

    process.chdir(path.dirname(jsonPath));

    const data = JSON.parse(jsonContent);
    const transformed = await processData(data);
    const html = await render('invoice.html.ejs', {data: transformed});
    switch (output) {
        case 'pdf':
        case 'html':
            await writeTo(html, output);
            break;
        case 'out':
            return html;
    }
}

async function writeTo(html, output) {
    const filename = await mktemp(`--suffix=.${output}`);
    switch (output) {
        case 'pdf':
            await write(html, filename);
            break;
        case 'html':
            fs.writeFileSync(filename, html);
            break;
    }

    await open(filename);
}

if (require.main === module) {
    init(process.argv[2], process.argv[3])
        .then(console.log.bind(console))
        .catch(console.error.bind(console))
}

module.exports = init;
