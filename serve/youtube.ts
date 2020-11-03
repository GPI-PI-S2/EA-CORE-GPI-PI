import { extractors } from "../src";
import { Logger } from "../src/common/Logger";
import { Youtube } from "../src/modules/Youtube";
import { Readline } from "./Readline";
const axios = require("axios");

// api key de testing : AIzaSyCbh7V9N99YuffN2s8xeu7MmfYS4l2I180
// comment id de testing: UgxaNzpjVONh05flDDh4AaABAg

const logger = new Logger("youtube-test");
const youtubeE: Youtube = extractors.find((e) => e.register.id === "youtube-extractor") as any;
	// Verifica apiKeys 
// async function verifyApiKey(){
// 	let apiKey: String;
// 	// validate apikey
// 	while (!apiKey){
// 		const in_apiKey = await Readline.read('Ingrese su API KEY de YouTube (Google)')
// 		axios.get(`https://www.googleapis.com/youtube/v3/search?key=${in_apiKey}`)
// 		.then((res : any) => {
// 			// Apikey válida 
// 			logger.log(res.status);
// 			if (res.status==200){
// 				apiKey = in_apiKey;
// 			}
// 		})
// 		.catch((err: any) => {
// 			// error c murió
// 			logger.error('APIKey inválida');
// 		})
// 	}
// }
async function getVideoId(uri: String){
	return uri.split('=')[1];
}
async function main() {
	// await oauth();
	let videoId: string;
	let limit: number;
	logger.log('Analizador de youtube v1')
	const in_apiKey = await Readline.read('Ingrese su propia api-key de YouTube (Google)');
	const uriVideo = await Readline.read('Ingrese el url del video a analizar');
	limit = Number(await Readline.read('Ingrese el límite de comentarios a analizar'));
	videoId = await getVideoId(uriVideo);
	await youtubeE.deploy({apiKey: in_apiKey},{apikey: in_apiKey})
	await youtubeE.obtain({apiKey: in_apiKey,metaKey: videoId,limit})
	const commentId = await Readline.read('Ingrese el id del comentario a analizar');
	const eleccion = await Readline.read('¿Desea analizar respuestas al comentario? (y,n)')
	let limitComment: Number;
	if (eleccion=='y' || eleccion=='Y'){
		limitComment = Number(await Readline.read('Ingrese el límite de respuestas a analizar'))
	}	
	await youtubeE.unitaryObtain({apiKey: in_apiKey,limitComment,metaKey: commentId})
	return process.exit(0);
}
try {
	main();
} catch (error) {
	logger.error("[MAIN ERROR]", error);
	process.exit(1);
}

