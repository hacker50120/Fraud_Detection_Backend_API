// middleware/authentication.js

require('dotenv').config();

function authentication(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // Authentication header is missing
        res.setHeader('WWW-Authenticate', 'Basic');
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    if (user && pass && user === process.env.LoginUser && pass === process.env.LoginPass) {
        // Authorized user, continue to the next middleware or route
        next();
    } else {
        // Invalid credentials
        res.setHeader('WWW-Authenticate', 'Basic');
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    }
}

module.exports = authentication;