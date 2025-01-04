// hashUrl the URL names in md5
const crypto = require('crypto');

function hashUrl(url) {
    const md5Hash = crypto.createHash('md5').update(url).digest('hex');
    return md5Hash;
}

module.exports = hashUrl;