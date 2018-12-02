#!/usr/bin/env node

const moment = require('moment');
const path = require('path');
const ejs = require('ejs');
const pdf = require('html-pdf');
const os = require('os');
const fs = require('fs');

moment.locale('es');

const filters = {
    moneyClass: function(value) {
        return value < 0 ? 'money neg' : 'money';
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
    const processed = {
        info: data.info,
        items: [],
        total: 0,
        header: data.header,
        signature: {},
        date: moment().format('LL')
    };

    data.items.forEach(item => {
        const value = Number(item.value);
        const qty = Number(item.qty);
        const total = value * qty;
        processed.items.push({
            description: item.description,
            qty,
            value: value.toFixed(2),
            total: total.toFixed(2)
        });
        processed.total += total;
    });

    if (data.signature) {
        processed.signature.line = data.signature.line;
        if (data.signature.file) {
            const base64 = await readFile(data.signature.file, 'base64')
            processed.signature.file = `data:image/png;base64,${base64}`;
        }

    }

    return processed;
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
    const filename = await mktemp(`--suffix=.${output}`);
    const html = await render('invoice.html.ejs', {data: transformed});
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
