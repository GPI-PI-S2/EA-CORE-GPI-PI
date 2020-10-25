import { extractors } from "../src/";
import { Logger } from "../src/common/Logger";
import { Emol } from "../src/modules/Emol";
import { vUrl } from "../src/common/validator";
import { Readline } from "./Readline";
const logger = new Logger("emol-test");
const emolE: Emol = extractors.find((e) => e.register.id === "emol-extractor") as any;

const apiUrl = 'https://cache-comentarios.ecn.cl/Comments/Api?action=getComments&includePending=false&format=json&limit=10&order=TIME_DESC&rootComment=false&url='

async function getCommentaries() {
	let url: string
	while(!url) {
		const newUrl = await Readline.read('Ingrese URL de la noticia')
		const isValid = vUrl()(newUrl)
		if(typeof isValid === 'boolean') {
			url = encodeURIComponent(newUrl)
		} else {
			logger.error(isValid)
		}
	}
	const comments = await emolE.obtain({ url: `${apiUrl}${url}`, limit: 1, metaKey: 'aaa' })
	return comments
}

async function main() {
	const comments = await getCommentaries()
	logger.log(comments)
	return process.exit(0);
}
try {
	main();
} catch (error) {
	logger.error("[MAIN ERROR]", error);
	process.exit(1);
}
