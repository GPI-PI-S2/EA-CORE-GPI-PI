import { extractors } from "../src";
import { Logger } from "../src/common/Logger";
import { Youtube } from "../src/modules/Youtube";

const logger = new Logger("youtube-test");
const youtubeE: Youtube = extractors.find((e) => e.register.id === "youtube-extractor") as any;
async function main() {
	return process.exit(0);
}
try {
	main();
} catch (error) {
	logger.error("[MAIN ERROR]", error);
	process.exit(1);
}
