module.exports = {
    apps: [{
        name: 'fraud-detection',
        script: 'app.js', // Replace with your entry point file
        watch: true,
        env: {
            NODE_ENV: 'production',
        },
    }, ],
};