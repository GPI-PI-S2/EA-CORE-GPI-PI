import { extractors } from "../src";
import { Logger } from "../src/common/Logger";
import { Twitter } from "../src/modules/Twitter";

const logger = new Logger("twitter-test");
const twitterE: Twitter = extractors.find((e) => e.register.id === "twitter-extractor") as any;
async function main() {
	return process.exit(0);
}
try {
	main();
} catch (error) {
	logger.error("[MAIN ERROR]", error);
	process.exit(1);
}
