// src/routes/mainRoutes.js
const express = require('express');
const router = express.Router();
const processInput = require('../controllers/main');
const authentication = require('../../middleware/authentication');

// Use authentication middleware for all routes below
router.use(authentication);

router.get('/', (req, res) => {
    res.render('index', { defaultindexval: null, executionTime: null, riskmsg: null, riskScore: null });
});

router.post('/process-json', async(req, res) => {
    // Assuming the JSON input is in the request body
    const inputMessage = req.body;

    let timeoutReached = false;

    const timeout = setTimeout(() => {
        timeoutReached = true;
        res.status(500).send('Server Error!! Request timed out');
    }, 35000);

    const message = inputMessage["SMS-Deatil"].message;
    const smsHeader = inputMessage["SMS-Deatil"].header;
    const output = await processInput(message, smsHeader);

    if (!timeoutReached) {
        clearTimeout(timeout);
        const riskmsg = output.riskmsg;
        const riskScore = output.riskScore;
        const result = {
            smsHeader: smsHeader,
            message: message,
            riskmsg: riskmsg,
            riskScore: riskScore,
        };
        res.json({ result });
    }
});

router.post('/process', async(req, res) => {
    const inputMessage = req.body.inputMessage;
    const smsHeader = req.body.smstag;
    let timeoutReached = false;

    const timeout = setTimeout(() => {
        timeoutReached = true;
        res.status(500).send('Server Error!! Request timed out');
    }, 35000);

    const start = Date.now();
    const output = await processInput(inputMessage, smsHeader);
    const end = Date.now();

    if (!timeoutReached) {
        clearTimeout(timeout);
        const riskmsg = output.riskmsg;
        const riskScore = output.riskScore;
        const executionTime = Math.floor((end - start)) / 1000;
        res.render('index', { riskmsg, riskScore, executionTime, inputMessage, defaultindexval: 1 });
    }
});


module.exports = router;