//Extracting the URL from the messages

extract_url = null


async function URLExtractor(inputMessage) {
    // console.log(inputMessage);
    const regex = /(?:https?:\/\/)?(?:www\d{0,3}\.)?([a-z0-9.\-]+[.][a-z]{2,4}(?:\/\S*)?)/gi;
    // const regex = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))/gi;
    const matches = inputMessage.match(regex);
    // console.log("match data", matches);
    return matches

}

async function replaceUrls(inputMessage, replacementUrl) {
    const regex = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))/gi;
    const replacedMessage = inputMessage.replace(regex, replacementUrl);
    return replacedMessage;
}

module.exports = {
    replaceUrls,
    URLExtractor
};




// old_message = "Dear Customer, Your ICICI Bank Account has been locked due to incomplete KYC. Kindly download our mobile app from the following URL to update your details: https://icicibank-verification.com/. Regards, ICICI Bank"
// processInput(old_message)

//Replacing the actual resolved URL in the messages 
// async function main() {
//     const inputMessage = 'Here is a link: https://example.com';
//     const replacementUrl = 'https://your-url.com';

//     const replacedMessage = await urlReplacerModule.replaceUrls(inputMessage, replacementUrl);
//     console.log('Replaced Message:', replacedMessage);
// }

// main();