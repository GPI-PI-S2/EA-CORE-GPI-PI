import {extractors} from "../src";
import {Logger} from "../src/common/Logger";
import {Reddit} from "../src/modules/Reddit";

const logger = new Logger("reddit-test");
const redditE: Reddit = extractors.find((e) => e.register.id === "reddit-extractor") as any;

async function main() {
	redditE.deploy({}, {});
	logger.log("---Obtain---");
	await redditE.obtain({postId: "jkwi5g", subReddit: "chile", metaKey: "", limit: 50, minSentenceSize: 3});
	return process.exit(0);
}
try {
	main();
} catch (error) {
	logger.error("[MAIN ERROR]", error);
	process.exit(1);
}
