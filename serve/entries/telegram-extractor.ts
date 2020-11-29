import { vPhone, vRangeBetween } from 'ea-common-gpi-pi';
import { Response } from '../../src/services/Extractor/Response';
import { Telegram } from '../../src/services/Telegram';
import logger from '../loaders/logger';
import { File } from '../tools/File';
import { Readline } from '../tools/Readline';

type content = {
	phone: string;
	code: number;
	codeHash: string;
	auth: string;
};
const config = { apiId: 1862196, apiHash: 'ecf4f984d701a3ee7a909d0c505d2df5' };
async function login(extractor: Telegram) {
	const file = new File('./serve/entries/telegramUser.json');
	let phone = '';
	let code = NaN;
	let codeHash = '';
	let auth = '';
	if (await file.exist()) {
		const content = (await file.read('object')) as content;
		phone = content['phone'];
		auth = content['auth'];
	}
	while (!phone) {
		const iPhone = await Readline.read('Ingrese un número de teléfono');
		const valid = vPhone()(iPhone);
		if (typeof valid === 'boolean') phone = iPhone;
		else logger.debug('Error: login error', { valid });
	}
	let response = await extractor.deploy(config, { phone });
	if (response.status === Response.Status.PENDING) {
		const pendingResponse = response.data as Telegram.Deploy.PendingResponse;
		codeHash = pendingResponse.codeHash;
		while (isNaN(code) || code === null) {
			const iCode = await Readline.read('Ingrese el código de verificación');
			const intCode = parseInt(iCode);
			const valid = iCode.length > 4 && !isNaN(intCode);
			if (!valid) {
				logger.info('Error: Código inválido');
				continue;
			}

			response = await extractor.deploy(config, { phone, code: intCode, codeHash });
			if (response.status === Response.Status.OK) code = intCode;
			else {
				logger.error('deploy code error', response.data);
				logger.info('Error: Código inválido');
			}
		}
		await file.write({ auth, phone } as content);
	} else if (response.status === Response.Status.ERROR) {
		logger.error('deploy error', response.data);
		throw new Error("can't continue");
	}
	const content = (await file.read('object')) as content;
	await file.write({ ...content, ...{ auth, phone } } as content);
	return response.data as Telegram.Deploy.Response;
}
async function selectChat(chats: Telegram.Deploy.chat[]) {
	logger.info('\nChats\n');
	chats.forEach((chat, index) => console.log(` [${index + 1}]  (${chat.type}) - ${chat.name}`));
	const min = 1;
	const max = chats.length;
	let selected = '';
	while (!selected) {
		const userResponse = await Readline.read('Seleccione el n° del chat');
		const valid = vRangeBetween(min, max)(userResponse);
		if (typeof valid === 'boolean') selected = userResponse;
		else logger.debug('Error: selectChat', { valid });
	}
	return chats[Number(selected) - 1];
}
export default async (extractor: Telegram) => {
	logger.info(`Serving extractor`);
	logger.info(`name:      ${extractor.register.name}`);
	logger.info(`version:   ${extractor.register.version}`);
	const loginResponse = await login(extractor);
	const selectedChat = await selectChat(loginResponse.chats);
	const { accessHash, id, type } = selectedChat;
	const result = await extractor.obtain({
		accessHash,
		type,
		chatId: id,
		limit: 1000,
		metaKey: JSON.stringify(selectedChat),
		minSentenceSize: 2,
	});
	/* 	logger.debug('result get:', result.get());
	 */ const file = new File('telegram.json');
	const data = result.data.result.map((content) => content.input.content);
	const total = data.length;
	await file.write({ data, total });
	logger.info('response ok');
};
