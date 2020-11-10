import { URL } from 'url';
import { Response } from '../../src/services/Extractor/Response';
import { Youtube } from '../../src/services/Youtube';
import logger from '../loaders/logger';
import { Readline } from '../tools/Readline';

async function getVideoId(url: string) {
	const cURL = new URL(url);
	return cURL.searchParams.get('v');
}
export default async (extractor: Youtube) => {
	logger.info(`Serving extractor`);
	logger.info(`name:      ${extractor.register.name}`);
	logger.info(`version:   ${extractor.register.version}`);
	let apiKey = 'AIzaSyCbh7V9N99YuffN2s8xeu7MmfYS4l2I180';
	let urlVideo = 'https://www.youtube.com/watch?v=2XWgsr9It_o&t=633s';
	let limit = 5000;
	if (!apiKey) apiKey = await Readline.read('Ingrese su propia api-key de YouTube (Google)');
	if (!urlVideo) urlVideo = await Readline.read('Ingrese el url del video a analizar');
	if (limit === 0 || isNaN(limit))
		limit = Number(await Readline.read('Ingrese el límite de comentarios a analizar'));
	let videoId = await getVideoId(urlVideo);
	await extractor.deploy({ apiKey });
	const result = (await extractor.obtain({ metaKey: videoId, limit })) as Response<
		Youtube.Obtain.Response
	>;
	logger.info('response ok');
	logger.debug('result get:', result.get());
};
