const express = require('express');
const app = express();
const cors = require('cors');
const port = 4001;

// Import all function modules
const addToWallet = require('./1_addToWallet');
const registerCompany = require('./2_registerCompany');
const createPO = require('./3_createPO');
const createShipment = require('./4_createShipment');
const viewHistory = require('./5_viewHistory');
const viewDrugCurrentState = require('./6_viewDrugCurrentState');


// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma Network App');

app.get('/', (req, res) => res.send('Hello User'));

app.post('/addToWallet/distributor', (req, res) => {
    addToWallet.execute(req.body.certificatePath, req.body.privateKeyPath).then(() => {
        console.log('distributor Credentials added to wallet');
        const result = {
            status: 'success',
            message: 'distributor credentials added to wallet'
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

app.post('/registerCompany/distributor', (req, res) => {
    registerCompany.execute(req.body.companyCRN, req.body..companyName, req.body.Location, req.body.organisationRole).then (() => {
        console.log('Company Registerer');
        const result = {
            status: 'success',
            message: 'Company Registerer'
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

app.post('/createPO/distributor', (req, res) => {
    createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity).then (() => {
        console.log('New Drug Added');
        const result = {
            status: 'success',
            message: 'New Drug Added'
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



app.post('/createShipment/distributor', (req, res) => {
    createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN ).then (() => {
        console.log('New Shipment Created');
        const result = {
            status: 'success',
            message: 'New Shipment Created'
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


app.post('/viewHistory/distributor', (req, res) => {
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


app.post('/viewDrugCurrentState/distributor', (req, res) => {
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
