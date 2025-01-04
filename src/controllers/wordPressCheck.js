const axios = require('axios');

async function checkWordPressUsage(url) {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            const htmlContent = response.data;
            if (/(wp-content|wp-includes|wp-admin)/i.test(htmlContent)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}
module.exports = checkWordPressUsage;
// Input website URL
// async function cc() {
//     const websiteUrl = 'http://courieractivation.in/';
//     const reply = await checkWordPressUsage(websiteUrl);
//     console.log(reply)
// }
// cc()