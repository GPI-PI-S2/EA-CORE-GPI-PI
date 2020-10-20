import { extractors } from "../src/";
import { Logger } from "../src/common/Logger";
import { vPhone } from "../src/common/validator";
import { Response } from "../src/modules/Extractor/Response";
import { Telegram } from "../src/modules/Telegram";
import { File } from "./File";
import { Readline } from "./Readline";
type content = {
	phone: string;
	code: number;
	codeHash: string;
	auth: string;
};
const config = { apiId: 1862196, apiHash: "ecf4f984d701a3ee7a909d0c505d2df5" };
const telegramE: Telegram = extractors.find((e) => e.register.id === "telegram-extractor") as any;
const logger = new Logger("telegram-test");
async function login() {
	const file = new File("./serve/telegramUser.json");
	let phone: string;
	let code = NaN;
	let codeHash: string;
	let auth: string;
	if (await file.exist()) {
		const content = (await file.read("object")) as content;
		phone = content["phone"];
		code = content["code"];
		codeHash = content["codeHash"];
		auth = content["auth"];
	}
	while (!phone) {
		const iPhone = await Readline.read("Ingrese un número de teléfono");
		const valid = vPhone()(iPhone);
		if (typeof valid === "boolean") phone = iPhone;
		else logger.error(valid);
	}
	const response = await telegramE.deploy(config, { phone });
	if (response.status === Response.Status.PENDING) {
		const pendingResponse = response.get() as Telegram.Deploy.PendingResponse;
		codeHash = pendingResponse.codeHash;
		while (isNaN(code)) {
			const iCode = await Readline.read("Ingrese el código de verificación");
			const intCode = parseInt(iCode);
			const valid = iCode.length > 4 && !isNaN(intCode);
			if (!valid) {
				logger.error("Código inválido");
				continue;
			}
			code = intCode;
			try {
				const response = await telegramE.deploy(config, { phone, code, codeHash });
				code = intCode;
			} catch (error) {}
		}
		await file.write({ auth, code, codeHash, phone } as content);
	}
	return;
}
async function main() {
	await login();
	process.exit(0);
}
try {
	main();
} catch (error) {
	logger.error("[MAIN ERROR]", error);
	process.exit(1);
}
