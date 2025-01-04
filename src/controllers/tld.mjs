import { parseDomain, ParseResultType } from "parse-domain";

async function TLDParser(domainName) {
    const parseResult = parseDomain(domainName);

    if (parseResult.type === ParseResultType.Listed) {
        const { subDomains, domain, topLevelDomains } = parseResult;
        if (subDomains[0] == 'www') {
            return (subDomains[0] + "." + domain + "." + topLevelDomains.join("."));
        } else {
            return (domain + "." + topLevelDomains.join("."));
        }
        // console.log("DOmain is: " + domain + "." + topLevelDomains.join("."));
    } else {
        console.log("Domain Not found");
        return null;
    }
}

export { TLDParser };

// async function main() {
//     const output = await TLDParser("asda.123.abc.com");
// }
// main()