import { extractors } from "../src";
import { Logger } from "../src/common/Logger";
import { Youtube } from "../src/modules/Youtube";
import { Readline } from "./Readline";
const axios = require("axios");

type content = {
	apiKey: String;
	passwd: String;
}
const config = {apiKey: "AIzaSyCbh7V9N99YuffN2s8xeu7MmfYS4l2I180", videoID: "C9ck7UKNSQg"}  //temporal
const logger = new Logger("youtube-test");
const youtubeE: Youtube = extractors.find((e) => e.register.id === "youtube-extractor") as any;


async function oauth(){
	let apiKey: String;
	// validate apikey
	while (!apiKey){
		const in_apiKey = await Readline.read('Ingrese su API KEY de YouTube (Google)')
		axios.get(`https://www.googleapis.com/youtube/v3/search?key=${in_apiKey}`)
		.then((res : any) => {
			// Apikey válida 
			logger.log(res.status);
			if (res.status==200){
				apiKey = in_apiKey;
			}
		})
		.catch((err: any) => {
			// error c murió
			logger.error('APIKey inválida');
		})
	}
}
async function main() {
	await oauth();
	return process.exit(0);
}
try {
	main();
} catch (error) {
	logger.error("[MAIN ERROR]", error);
	process.exit(1);
}

