const moment = require('moment');
const tcomb = require('tcomb');

moment.locale('es');

const modelHeader = tcomb.struct(
    {
        title: tcomb.String
    },
    {
        name: 'Header',
        defaultProps: {
            title: 'Cuenta de cobro'
        }
    }
);

const modelItem = tcomb.struct(
    {
        description: tcomb.String,
        qty: tcomb.Number,
        value: tcomb.Number
    },
    {
        name: 'Item'
    }
);

const modelEntity = tcomb.struct(
    {
        name: tcomb.String,
        document: tcomb.maybe(tcomb.String)
    },
    {
        name: 'Entity'
    }
);

const modelSignature = tcomb.struct(
    {
        file: tcomb.String
    },
    {
        name: 'Signature'
    }
);

const modelData = tcomb.struct(
    {
        left: tcomb.maybe(tcomb.list(tcomb.String)),
        right: tcomb.maybe(tcomb.list(tcomb.String))
    },
    {
        name: 'Data'
    }
);

const Input = tcomb.struct(
    {
        header: modelHeader,
        items: tcomb.list(modelItem),
        recipient: modelEntity,
        sender: modelEntity,
        signature: tcomb.maybe(modelSignature),
        data: tcomb.maybe(modelData),
        postData: tcomb.maybe(modelData),
        date: tcomb.String
    },
    {
        name: 'DataModel',
        defaultProps: {
            items: [],
            get date() {
                return moment().format('LL')
            }
        }
    }
);

const modelProcessedItem = modelItem.extend(
    {
        total: tcomb.Number
    },
    {
        name: 'ProcessedItem'
    }
);

const ProcessedData = Input.extend(
    {
        processedItems: tcomb.list(modelProcessedItem),
        total: tcomb.Number,
        signatureBase64: tcomb.maybe(tcomb.String)
    },
    {
        name: 'ProcessedData'
    }
);

module.exports = {Input, ProcessedData};
