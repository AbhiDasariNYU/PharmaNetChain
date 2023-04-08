const express = require('express');
const app = express();
const cors = require('cors');
const port = 4003;

// Import all function modules
const addToWallet = require('./1_addToWallet');
const updateShipment = require('./2_updateShipment');
const viewHistory = require('./3_viewHistory');
const viewDrugCurrentState = require('./4_viewDrugCurrentState');


// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma Network App');

app.get('/', (req, res) => res.send('Hello User'));

app.post('/addToWallet/transporter', (req, res) => {
    addToWallet.execute(req.body.certificatePath, req.body.privateKeyPath).then(() => {
        console.log('transporter Credentials added to wallet');
        const result = {
            status: 'success',
            message: 'trasporter credentials added to wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});
app.post('/updateShipment', (req, res) => {
    updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN).then (() => {
        console.log('Shipment Updated ');
        const result = {
            status: 'success',
            message: 'Shipment Updated'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/viewHistory/transporter', (req, res) => {
    viewHistory.execute(req.body.drugName, req.body.serialNo).then (() => {
        console.log('History Retrived ');
        const result = {
            status: 'success',
            message: 'History Retrived'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});


app.post('/viewDrugCurrentState/transporter', (req, res) => {
    viewDrugCurrentState.execute(req.body.drugName, req.body.serialNo).then (() => {
        console.log('Drug Current state retrived ');
        const result = {
            status: 'success',
            message: 'Drug Current state retrived'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});


app.listen(port, () => console.log(`Distributed Pharma App listening on port ${port}!`));
