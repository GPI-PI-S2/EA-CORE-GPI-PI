import { extractors } from "../src/";
import { Logger } from "../src/common/Logger";
import { Emol } from "../src/modules/Emol";
const logger = new Logger("emol-test");
const emolE: Emol = extractors.find((e) => e.register.id === "emol-extractor") as any;

async function main() {
	return process.exit(0);
}
try {
	main();
} catch (error) {
	logger.error("[MAIN ERROR]", error);
	process.exit(1);
}
