import { read } from "fs";
import { extractors } from "../src";
import { Logger } from "../src/common/Logger";
import { Twitter } from "../src/modules/Twitter";
import { Readline } from "./Readline";

const logger = new Logger("twitter-test");
const twitterE: Twitter = extractors.find((e) => e.register.id === "twitter-extractor") as any;


// async function main() {
// 	const loginResponse = await login();
// 	const selectedChat = await selectChat(loginResponse.chats);
// 	const { accessHash, id, type } = selectedChat;
// 	await telegramE.obtain({
// 		accessHash,
// 		type,
// 		chatId: id,
// 		limit: 50,
// 		metaKey: JSON.stringify(selectedChat),
// 		minSentenceSize: 2,
// 	});
// 	process.exit(0);
// }
async function main() {
	logger.log("---Deploy---");
	twitterE.deploy({
		bearerToken : 'AAAAAAAAAAAAAAAAAAAAAJewJQEAAAAAPOlJ%2BAGXOMiIAG7dDUUtTaFAOgs%3DKLpEMQCsq33R2kwwnADok1ujE9v65o4eSf34m5b4yupPvGCi40'
	}, {});

	let hashtag:string;	
	let max_results:number = 100;
	while(!hashtag) {
		hashtag = await Readline.read("Para buscar ingrese un hashtag:");

	}
	
	// = await Readline.read("Ingrese la cantidad máxima de tweets a obtener (puede elegir entre 1 y 100):");
	await twitterE.obtain({
		hashtag: hashtag,
		metaKey: "",
		limit: max_results,
		minSentenceSize: 3
	});
	return process.exit(0);
}
try {
	main();
} catch (error) {
	logger.error("[MAIN ERROR]", error);
	process.exit(1);
}
