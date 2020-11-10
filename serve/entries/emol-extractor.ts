import { vUrl } from 'ea-common-gpi-pi';
import { Emol } from '../../src/services/Emol';
import logger from '../loaders/logger';
import { Readline } from '../tools/Readline';

async function getURL() {
	let url: string =
		'https://www.emol.com/noticias/Internacional/2020/11/03/1002509/Elecciones-EEUU-Resultados-Biden-Trump.html';
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
	logger.info('response ok');
	logger.debug('result get:', result.get());
};
