import { vUrl } from 'ea-common-gpi-pi';
import { Emol } from '../../src/services/Emol';
import logger from '../loaders/logger';
import { File } from '../tools/File';
import { Readline } from '../tools/Readline';

async function getURL() {
	let url = '';
	while (!url) {
		const newUrl = await Readline.read('Ingrese URL de la noticia');
		const isValid = vUrl()(newUrl);
		if (typeof isValid === 'boolean') {
			url = newUrl;
		} else {
			logger.error(isValid);
		}
	}
	logger.verbose('URL: ', url);
	return url;
}
export default async (extractor: Emol) => {
	logger.info(`Serving extractor`);
	logger.info(`name:      ${extractor.register.name}`);
	logger.info(`version:   ${extractor.register.version}`);
	await extractor.deploy();
	const url = await getURL();
	const result = await extractor.obtain({ limit: 1000, metaKey: url });

	/* 	logger.debug('result get:', result.get());
	 */ const file = new File('emol.json');
	const data = result.data.result.map((content) => content.input.content);
	const total = data.length;
	await file.write({ data, total });
	logger.info('response ok');
};
