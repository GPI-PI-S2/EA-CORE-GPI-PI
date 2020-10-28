import { extractors } from "../src/";
import { Logger } from "../src/common/Logger";
import { vUrl } from "../src/common/validator";
import { Emol } from "../src/modules/Emol";
import { Response } from "../src/modules/Extractor/Response";
import { Readline } from "./Readline";
const logger = new Logger("emol-test");
const emolE: Emol = extractors.find((e) => e.register.id === "emol-extractor") as any;
async function getURL() {
	let url: string =
		"https://www.emol.com/noticias/Economia/2020/10/27/1001985/Comision-Constitucion-segundo-retiro-10.html";
	while (!url) {
		const newUrl = await Readline.read("Ingrese URL de la noticia");
		const isValid = vUrl()(newUrl);
		if (typeof isValid === "boolean") {
			url = encodeURIComponent(newUrl);
		} else {
			logger.error(isValid);
		}
	}
	return url;
}
async function main() {
	emolE.deploy();
	const url = await getURL();
	const analysis = await emolE.obtain({ limit: 1, metaKey: url });
	if (analysis && analysis.status === Response.Status.ERROR) throw new Error(analysis as any);
	return process.exit(0);
}
try {
	main();
} catch (error) {
	logger.error("[MAIN ERROR]", error);
	process.exit(1);
}
